# Intervu AI — Development Log

This file tracks daily progress, decisions, and context for Claude sessions.
Always paste the relevant section when starting a new Claude session.

---

## Day 1 — Project Initialization
**Date:** 2025-XX-XX

### Built
- Next.js 16.2.6 project scaffolded with TypeScript + Tailwind v4 + shadcn/ui (Nova preset)
- Supabase SSR clients created (browser + server)
- proxy.ts route protection implemented (Next.js 16 convention)
- Root layout configured with shadcn CSS variables
- Environment variables documented in .env.example

### Key Decisions
- Next.js 16.2.6 installed (not 14 — scaffold pulled latest)
- middleware.ts renamed to proxy.ts per Next.js 16 requirement
- Function export renamed from `middleware` to `proxy`
- No separate backend — using Next.js API routes only
- shadcn/ui Nova preset with Tailwind v4 (no tailwind.config.ts)
- Server Supabase client is async due to Next.js 14+ cookies() API

### Stack Confirmed
- Frontend: Next.js 16.2.6, TypeScript, Tailwind v4, shadcn/ui
- Auth + DB: Supabase (anon key only)
- AI: Gemini 1.5 Flash + Groq fallback
- Deployment: Vercel

### Environment Variables Required
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- GEMINI_API_KEY
- GROQ_API_KEY

### Current File Structure