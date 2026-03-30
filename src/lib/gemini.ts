import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const gemini = genAI;

export const AI_MODELS = {
  GEMINI_PRO: 'gemini-2.5-flash',
  GEMINI_FLASH: 'gemini-2.5-flash',
} as const;
