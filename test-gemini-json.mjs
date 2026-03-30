import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const envFile = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envFile.match(/GEMINI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
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
    "certifications": [],
    "projects": []
  }
}`,
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  try {
    const result = await model.generateContent(
      `ORIGINAL RESUME:\nJohn Smith Software Dev\n\nTARGET JOB:\nTitle: Developer\nCompany: Tech\nDescription: Need coder\n\nPlease analyze and generate an optimized resume.`
    );
    const text = result.response.text();
    console.log("RAW RESPONSE:\n", text);
    JSON.parse(text);
    console.log("JSON Parse: SUCCESS");
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

run();
