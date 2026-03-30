'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { gemini, AI_MODELS } from '@/lib/gemini';
import { resumeStructureSchema, feedbackSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';
import type { Generation, JobDescription, Resume, Profile } from '@/types/supabase-helpers';

type GenerationWithRelations = Generation & {
  resumes: Resume | null;
  job_descriptions: JobDescription | null;
};

export const generateResumeAction = async (resumeId: string, jobId: string) => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check credits (use admin client to bypass RLS infinite recursion)
  const adminClient = createAdminClient();

  const { data: profile } = await adminClient
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()
    .returns<Pick<Profile, 'credits'>>();

  if (!profile || profile.credits < 1) {
    return { success: false, error: 'Insufficient credits' };
  }

  // Get resume and job description
  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .single()
    .returns<Resume>();

  const { data: job } = await supabase
    .from('job_descriptions')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()
    .returns<JobDescription>();

  if (!resume || !job) {
    return { success: false, error: 'Resume or job description not found' };
  }

  // Create generation record
  const { data: generation, error: genError } = await supabase
    .from('generations')
    .insert({
      user_id: user.id,
      resume_id: resumeId,
      job_id: jobId,
      status: 'processing',
    })
    .select()
    .single()
    .returns<Generation>();

  if (genError || !generation) {
    return { success: false, error: 'Failed to create generation' };
  }

  try {
    // Call Gemini for analysis and restructuring
    const model = gemini.getGenerativeModel({
      model: AI_MODELS.GEMINI_PRO,
      systemInstruction: `You are an expert ATS resume optimizer and career coach. Your task is to:
1. Analyze the user's resume against the target job description
2. Provide a detailed analysis with score (0-100), strengths, weaknesses, and suggestions
3. Generate a completely rewritten and optimized resume structure that perfectly matches the job requirements
4. Use action verbs, quantified achievements, and ATS-friendly formatting
5. Ensure all content is truthful but reframed for maximum impact

Return your response in this exact JSON format:
{
  "feedback": {
    "score": 85,
    "strengths": ["Strong technical skills", "Relevant experience"],
    "weaknesses": ["Weak action verbs", "Missing keywords"],
    "suggestions": ["Add more quantified results", "Include specific technologies"],
    "atsKeywords": ["react", "typescript", "agile"]
  },
  "resume": {
    "personal": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "location": "San Francisco, CA",
      "linkedin": "https://linkedin.com/in/johndoe",
      "website": "https://johndoe.com"
    },
    "summary": "Results-driven software engineer with 5+ years...",
    "experience": [
      {
        "company": "Tech Corp",
        "position": "Senior Software Engineer",
        "location": "San Francisco, CA",
        "startDate": "2020-01",
        "endDate": "2024-01",
        "current": false,
        "bullets": [
          "Led development of microservices architecture serving 1M+ users",
          "Reduced API latency by 40% through optimization"
        ]
      }
    ],
    "education": [
      {
        "institution": "University of California",
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "graduationDate": "2019-05",
        "gpa": "3.8"
      }
    ],
    "skills": {
      "technical": ["React", "TypeScript", "Node.js"],
      "soft": ["Leadership", "Communication"],
      "languages": ["English", "Spanish"]
    },
    "certifications": [
      {
        "name": "AWS Solutions Architect",
        "issuer": "Amazon",
        "date": "2023-06"
      }
    ],
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Built scalable platform processing $1M+ in transactions",
        "technologies": ["React", "Node.js", "PostgreSQL"],
        "link": "https://github.com/john/project"
      }
    ]
  }
}`,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(
      `ORIGINAL RESUME:\n${resume.extracted_text}\n\nTARGET JOB:\nTitle: ${job.title}\nCompany: ${job.company}\nDescription: ${job.raw_text}\n\nPlease analyze and generate an optimized resume.`
    );

    let responseContent = result.response.text();
    
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    // sanitize markdown json wrapping if any
    responseContent = responseContent.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    const aiResponse = JSON.parse(responseContent);

    // Validate the response
    const feedback = feedbackSchema.parse(aiResponse.feedback);
    const resumeStructure = resumeStructureSchema.parse(aiResponse.resume);

    // Update generation record
    await supabase
      .from('generations')
      .update({
        status: 'completed',
        score: feedback.score,
        feedback_json: feedback,
        structured_resume_data: resumeStructure,
        updated_at: new Date().toISOString(),
      })
      .eq('id', generation.id);

    // Deduct credit
    await adminClient
      .from('profiles')
      .update({
        credits: profile.credits - 1,
      })
      .eq('id', user.id);

    revalidatePath('/dashboard');
    return { success: true, data: { generationId: generation.id, feedback, resume: resumeStructure } };
  } catch (error) {
    console.error('AI generation error:', error);

    // Mark generation as failed
    await supabase
      .from('generations')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', generation.id);

    return { success: false, error: 'AI generation failed. Please try again.' };
  }
};

export const getGenerationDetailsAction = async (generationId: string) => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated', data: null };
  }

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('generations')
    .select(`
      *,
      resumes:resume_id (*),
      job_descriptions:job_id (*)
    `)
    .eq('id', generationId)
    .eq('user_id', user.id)
    .single()
    .returns<GenerationWithRelations>();

  if (error || !data) {
    return { success: false, error: 'Generation not found', data: null };
  }

  return { success: true, data };
};
