import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerSupabaseClient } from '@/lib/supabase/pages-server';
import { openai, AI_MODELS } from '@/lib/openai';
import { feedbackSchema, resumeStructureSchema } from '@/lib/schemas';
import type { Generation, JobDescription, Profile, Resume } from '@/types/supabase-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resumeId, jobId } = req.body as { resumeId?: string; jobId?: string };

    if (!resumeId || !jobId) {
      return res.status(400).json({ error: 'Resume ID and Job ID are required' });
    }

    const supabase = createPagesServerSupabaseClient(req, res);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()
      .returns<Pick<Profile, 'credits'>>();

    if (!profile || profile.credits < 1) {
      return res.status(400).json({ 
        error: 'Insufficient credits', 
        details: 'You need at least 1 credit to generate a resume. Please purchase more credits to continue.' 
      });
    }

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
      return res.status(404).json({ error: 'Resume or job description not found' });
    }

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
      return res.status(500).json({ error: 'Failed to create generation' });
    }

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.GPT4,
      messages: [
        {
          role: 'system',
          content: `You are an expert ATS resume optimizer and career coach. Your task is to:
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
        },
        {
          role: 'user',
          content: `ORIGINAL RESUME:\n${resume.extracted_text}\n\nTARGET JOB:\nTitle: ${job.title}\nCompany: ${job.company}\nDescription: ${job.raw_text}\n\nPlease analyze and generate an optimized resume.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response from AI');
    }

    const aiResponse = JSON.parse(responseContent);
    const feedback = feedbackSchema.parse(aiResponse.feedback);
    const resumeStructure = resumeStructureSchema.parse(aiResponse.resume);

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

    await supabase
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id);

    return res.status(200).json({
      success: true,
      data: { generationId: generation.id, feedback, resume: resumeStructure },
    });
  } catch (error) {
    console.error('AI generation error:', error);
    
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      return res.status(500).json({
        error: 'AI service is not configured',
        details: 'The OpenAI API key is not properly configured. Please contact support.',
      });
    }
    
    if (error instanceof Error && error.message.includes('JSON')) {
      return res.status(500).json({
        error: 'AI response parsing failed',
        details: 'The AI generated an invalid response. Please try again.',
      });
    }
    
    return res.status(500).json({
      error: 'AI generation failed. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
