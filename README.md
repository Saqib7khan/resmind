# ResMind 2.0

AI-powered resume optimizer built with Next.js + Supabase + OpenAI. Extracts text from uploaded resumes, analyzes against job descriptions, generates optimized resume JSON and PDF, and stores results in Supabase.

## Quick start
1. Install deps
```sh
npm install
```
2. Add env vars in `.env.local` (see below)
3. Start dev server
```sh
npm run dev
```
4. Open: http://localhost:3000

## Required environment variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY

## Key features
- Resume upload + text extraction (PDF/DOC/DOCX)
- AI-driven resume optimization (structured JSON)
- PDF rendering & download
- Credit tracking per user
- RBAC + RLS-ready Supabase setup

## Important files & entry points
- PDF extraction: [`extractTextFromFile`](src/lib/pdf-utils.ts) — [src/lib/pdf-utils.ts](src/lib/pdf-utils.ts)  
- AI generation API: [`handler`](src/pages/api/generate-resume.ts) — [src/pages/api/generate-resume.ts](src/pages/api/generate-resume.ts)  
- PDF generation API: [src/pages/api/generate-pdf.ts](src/pages/api/generate-pdf.ts)  
- AI action helpers: [`getGenerationDetailsAction`](src/actions/ai-actions.ts) and generation flow — [src/actions/ai-actions.ts](src/actions/ai-actions.ts)  
- Dashboard list: [src/pages/dashboard/index.tsx](src/pages/dashboard/index.tsx)  
- Generation detail page: [src/pages/dashboard/generation/[id].tsx](src/pages/dashboard/generation/[id].tsx)  
- UI components (resume selector, PDF button): [src/components/features/resume-job-selector.tsx](src/components/features/resume-job-selector.tsx), [src/components/features/generate-pdf-button.tsx](src/components/features/generate-pdf-button.tsx)
