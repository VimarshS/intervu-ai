# Intervu AI — Development Log

This file tracks daily progress, decisions, and context for Claude sessions.
Always paste the relevant section when starting a new Claude session.

---

## Day 1 — Project Initialization
**Date:** 2025-05-23

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

## Day 2 — Auth + Database Schema
**Date:** 2025-05-24

### Built
- Supabase database schema (5 tables: profiles, interview_sessions,
  interview_messages, feedback_reports, resume_analyses)
- Row Level Security policies on all tables
- Auto-profile trigger on new user signup
- Login page with email + Google OAuth
- Signup page with full name + password confirmation
- OAuth callback route handler
- Dashboard placeholder with auth verification
- Dashboard layout shell

### Key Decisions
- All auth logic in Server Actions (actions.ts) — never in client
- Dashboard is a Server Component — no client-side auth fetching
- Profile trigger handles full_name from Google OAuth metadata
- (auth) and (dashboard) route groups for clean URL structure

### Tests Passed
- Route protection redirects unauthenticated users ✅
- Email signup creates profile row via trigger ✅
- Login redirects to dashboard ✅
- Sign out clears session ✅

### Files Created
- types/database.ts
- app/(auth)/login/actions.ts
- app/(auth)/login/page.tsx
- app/(auth)/signup/page.tsx
- app/api/auth/callback/route.ts
- app/(dashboard)/dashboard/page.tsx
- app/(dashboard)/layout.tsx

### Ready for Day 3
- User onboarding multi-step form
- Profile setup (target role, company, experience level)
- Dashboard layout with sidebar and navbar