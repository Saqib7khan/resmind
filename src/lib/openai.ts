import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AI_MODELS = {
  GPT4: 'gpt-4o',
  GPT4_TURBO: 'gpt-4-turbo-preview',
  GPT35: 'gpt-3.5-turbo',
} as const;
