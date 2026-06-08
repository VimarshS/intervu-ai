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

## Day 3 — Onboarding + Dashboard Layout + Profile
**Date:** 2025-05-24

### Built
- Dashboard layout shell with sidebar and navbar
- Sidebar with active route highlighting
- Navbar with user avatar dropdown and sign out
- 3-step onboarding wizard (role, company, experience level)
- Profile settings page with form pre-population
- Real dashboard home with stats and recent sessions
- Session history page with score breakdowns
- Placeholder pages for interview, practice, resume routes

### Key Decisions
- Zod v4 uses `error` not `required_error` + `as const` for enum arrays
- Dashboard layout handles onboarding redirect — not individual pages
- Onboarding lives outside (dashboard) group to avoid redirect loop
- History page joins feedback_reports in single Supabase query
- All dashboard pages are Server Components except profile (needs form state)

### Tests Passed
- Sidebar navigation loads all pages without 404 ✅
- Onboarding saves profile and redirects to dashboard ✅
- Profile page pre-populates with existing data ✅
- Profile update saves and shows success toast ✅
- New user redirected to onboarding before dashboard access ✅

### Files Created
- components/layout/Sidebar.tsx
- components/layout/Navbar.tsx
- app/(dashboard)/layout.tsx (replaced)
- app/onboarding/page.tsx
- app/(dashboard)/profile/page.tsx
- app/(dashboard)/dashboard/page.tsx (replaced)
- app/(dashboard)/history/page.tsx
- app/(dashboard)/interview/page.tsx (placeholder)
- app/(dashboard)/practice/page.tsx (placeholder)
- app/(dashboard)/resume/page.tsx (placeholder)

### Ready for Day 4
- AI interview engine (Gemini integration)
- Interview session API routes
- Prompt engineering for mock interviewer

## Day 4 — AI Interview Engine
**Date:** 2025-05-25

### Built
- Gemini 1.5 Flash client with chat history support
- Groq fallback client (Llama 3)
- AI router with automatic fallback logic
- Interviewer system prompt builder (5 interview types)
- Feedback prompt builder with JSON output
- Interview start API route
- Interview respond API route
- Interview end API route with feedback generation
- Full interview UI with setup, chat, and feedback screens

### Key Decisions
- Gemini uses user/model exchange for system prompt injection
- Neutral MessageHistory format translated per provider in router
- Frontend maintains conversation history in state — not fetched per message
- System prompt stored in frontend state — returned from start route
- Feedback JSON cleaned of markdown fences before parsing
- InterviewState machine drives UI screen transitions

### Tests Passed
- Interview starts and AI sends opening question ✅
- Multi-turn conversation works correctly ✅
- Feedback report generated and displayed ✅
- All data saved to Supabase tables ✅

### Files Created
- lib/ai/gemini.ts
- lib/ai/groq.ts
- lib/ai/router.ts
- lib/ai/prompts/interviewer.ts
- lib/ai/prompts/feedback.ts
- app/api/interview/start/route.ts
- app/api/interview/respond/route.ts
- app/api/interview/end/route.ts
- app/(dashboard)/interview/page.tsx (replaced)

### Ready for Day 5
- Zustand interview session store
- useInterview hook
- Session detail/review page
- Improve feedback report UI

## Day 5 — State Management + Session Review
**Date:** 2025-05-26

### Built
- Zustand interview store with full session state
- useInterview hook encapsulating all API calls and timer
- Interview page refactored to use hook (purely presentational)
- Session review page with transcript and feedback
- Custom not-found page for invalid session URLs

### Key Decisions
- Neutral MessageHistory format in store — not provider specific
- useCallback on all hook actions for stable references
- sendMessage clears input only on success — preserves typed answer on error
- params typed as Promise in Next.js 16 dynamic routes
- notFound() used for both missing and unauthorized sessions (same 404)
- feedback section conditionally rendered — handles abandoned sessions

### Tests Passed
- Full interview loop works with hook refactor ✅
- History page Review button navigates to session review ✅
- Session review shows transcript and scores ✅
- Invalid session URL shows custom 404 ✅
- Reset clears store and shows setup form ✅

### Files Created
- store/interviewStore.ts
- hooks/useInterview.ts
- app/(dashboard)/interview/page.tsx (refactored)
- app/(dashboard)/interview/[sessionId]/page.tsx
- app/(dashboard)/interview/[sessionId]/not-found.tsx

### Ready for Day 6
- AI feedback report improvements
- Progress tracking with charts
- Skill radar visualization
- Dashboard stats improvements

## Day 6 — Progress Tracking + Charts
**Date:** 2025-05-27

### Built
- useProgress hook with full stats computation
- ProgressChart component (Recharts LineChart)
- SkillRadar component (Recharts RadarChart)
- StatsCard reusable component with trend indicator
- SessionCard reusable component
- ProgressChartWrapper client island for server dashboard
- Dashboard page updated with all new components

### Key Decisions
- Supabase joined query typed with explicit RawSession interface
- Double cast (as unknown as RawSession[]) bypasses Supabase inference
- ProgressChartWrapper bridges Server Component + client hooks
- Charts use CSS variables for theme-aware colors
- SessionCard replaces inline session rendering in dashboard + history
- Recharts Tooltip formatter uses inferred type — no explicit number cast

### Tests Passed
- Dashboard stats cards show correct counts ✅
- Charts render with empty state messages when no data ✅
- Charts populate after completing interviews ✅
- SessionCard renders correctly in recent sessions list ✅
- History page unaffected ✅

### Files Created
- hooks/useProgress.ts
- components/dashboard/ProgressChart.tsx
- components/dashboard/SkillRadar.tsx
- components/dashboard/StatsCard.tsx
- components/dashboard/SessionCard.tsx
- components/dashboard/ProgressChartWrapper.tsx
- app/(dashboard)/dashboard/page.tsx (updated)

### Ready for Day 7
- Resume upload UI
- PDF text extraction
- Supabase Storage integration
- Resume analysis API route

## Day 7 — Resume Intelligence Module
**Date:** 2025-05-28

### Built
- Supabase Storage bucket for resumes with RLS policies
- Resume analysis AI prompt with ATS scoring
- Resume analyze API route (upload + extraction + AI + save)
- UploadZone component with drag-and-drop + PDF.js extraction
- AnalysisCard component with scores, gaps, predicted questions
- Resume page with upload, current analysis, and history
- History page refactored to use SessionCard component

### Key Decisions
- PDF text extraction runs in browser via PDF.js dynamic import
- Server receives clean text — no PDF processing server-side
- PDF.js worker loaded from CDN matching installed version
- File stored under userId/timestamp path matching RLS policy
- extractedText sent alongside file in FormData
- AnalysisCard CTA links to /interview to close the loop
- expandedId pattern allows only one past analysis open at a time

### Tests Passed
- PDF upload and text extraction works ✅
- AI analysis generates ATS score and predicted questions ✅
- Analysis saved to Supabase and persists on refresh ✅
- Past analyses expandable in history list ✅
- History page renders with SessionCard correctly ✅

### Files Created
- lib/ai/prompts/resume.ts
- app/api/resume/analyze/route.ts
- components/resume/UploadZone.tsx
- components/resume/AnalysisCard.tsx
- app/(dashboard)/resume/page.tsx (replaced)
- app/(dashboard)/history/page.tsx (updated)

### Ready for Day 8
- Landing page (app/page.tsx)
- Loading skeletons
- Error boundaries
- Empty states polish
- Toast notifications audit

## Day 8 — Landing Page + Polish
**Date:** 2025-05-29

### Built
- Landing page with hero, features, how it works, CTA sections
- Global 404 not-found page
- Root loading.tsx and dashboard loading.tsx
- Error boundary component (functional, window error listener)
- Dashboard skeleton components (stats, charts, sessions, profile, resume)
- Mobile sidebar with hamburger menu and slide-in drawer
- Dashboard layout mobile padding fix

### Key Decisions
- Error boundary as functional component — class component had TS conflicts
- Two loading.tsx files — root for full page, dashboard for in-app navigation
- NavLinks inner component avoids duplication between desktop and mobile
- Mobile header lives in Sidebar component — not in layout
- Navbar hidden on mobile — sidebar handles mobile header
- p-4 mobile / p-6 desktop responsive padding in layout

### Tests Passed
- Landing page renders all sections correctly ✅
- Custom 404 page shows for invalid routes ✅
- Loading spinner shows during page navigation ✅
- Mobile hamburger menu opens and closes correctly ✅
- No TypeScript errors across all new files ✅

### Files Created
- app/page.tsx (replaced)
- components/dashboard/DashboardSkeleton.tsx
- components/ErrorBoundary.tsx
- app/not-found.tsx
- app/loading.tsx
- app/(dashboard)/loading.tsx
- components/layout/Sidebar.tsx (updated — mobile support)
- app/(dashboard)/layout.tsx (updated — mobile fix)

### Ready for Day 9
- Coding practice module
- Monaco editor setup
- Piston API integration
- AI coding problem generation

## Day 9 — Coding Practice Module
**Date:** 2025-05-30

### Built
- Piston API client replaced with Judge0 CE (piston deprecated Feb 2026)
- Code execution API route (server-side proxy to Judge0)
- Monaco Editor component with dynamic import (ssr: false)
- OutputPanel with terminal-style display
- Coding problem prompt builder (role + level aware)
- Code review prompt builder (with actual output verification)
- Coding practice page with AI problem generation
- Two additional API routes: /api/coding/problem and /api/coding/review
- Windows SSL fix: process.platform === "win32" check in execute route

### Key Decisions
- Monaco loaded with dynamic() + ssr:false — browser-only library
- Judge0 CE public instance (ce.judge0.com) — no API key required
- Gemini model updated to gemini-2.0-flash (gemini-1.5-flash returned 404)
- AI calls moved to server-side API routes — never imported in client components
- practice/page.tsx uses fetch to /api/coding/problem and /api/coding/review
- PracticeState machine: setup → loading_problem → solving → running → reviewing → reviewed
- NODE_TLS_REJECT_UNAUTHORIZED only set on win32 — safe for Vercel Linux deployment
- Judge0 fallback to RapidAPI endpoint if JUDGE0_API_KEY env var is set
- Hints revealed one at a time — not all at once
- Submit disabled after review — must start new problem

### Issues Encountered and Fixed
- Piston emkc.org returned 401 — whitelist only since Feb 2026
- Switched to Judge0 CE public instance
- Windows SSL error (ERR_SSL_TLSV1_UNRECOGNIZED_NAME) with ce.judge0.com
- Fixed with process.platform === "win32" SSL bypass in execute route
- gemini-1.5-flash returned 404 — updated to gemini-2.0-flash
- Gemini quota exceeded — Groq fallback (llama-3.3-70b-versatile) handles it
- generateAIResponse imported directly in practice/page.tsx caused client-side crash
- Fixed by moving AI calls to /api/coding/problem and /api/coding/review routes

### Tests Passed
- Problem generation works with language + topic context ✅
- Code execution returns stdout and stderr correctly via Judge0 ✅
- Hints reveal progressively ✅
- AI review shows score, complexity, strengths, improvements ✅
- New Problem resets all state cleanly ✅
- Works on Windows locally and will work on Vercel Linux ✅

### Files Created
- lib/piston/client.ts (Judge0 CE implementation)
- app/api/code/execute/route.ts
- app/api/coding/problem/route.ts
- app/api/coding/review/route.ts
- components/coding/CodeEditor.tsx
- components/coding/OutputPanel.tsx
- lib/ai/prompts/coding.ts
- app/(dashboard)/practice/page.tsx (replaced)

### Current AI Models
- Primary: gemini-2.0-flash (Gemini API)
- Fallback: llama-3.3-70b-versatile (Groq)

### Environment Variables Current State
- NEXT_PUBLIC_SUPABASE_URL ✅
- NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
- GEMINI_API_KEY ✅
- GROQ_API_KEY ✅
- NEXT_PUBLIC_SITE_URL ✅
- JUDGE0_API_KEY (optional — fallback only)

### Ready for Day 9 Enhancement
- LeetCode-style execution environment
- Helper classes pre-provided (ListNode, TreeNode)
- Driver code handled internally
- Users write function only
- Changes: coding.ts prompt + piston client + practice page + coding problem route
- Zero impact on interview module, resume, dashboard, auth

### Day 9 Enhancement — LeetCode-style Execution
**Date:** 2025-05-30

### Changes Made
- lib/ai/prompts/coding.ts — generates helper_code, starter_code, driver_code separately
- lib/piston/client.ts — added executeWithDriver function
- app/api/coding/problem/route.ts — passes new fields with safe defaults
- app/(dashboard)/practice/page.tsx — userCode/helperCode/driverCode in separate state

### How It Works
- AI generates three code blocks per problem
- helper_code: ListNode, TreeNode etc (hidden from user)
- starter_code: function signature only (shown in editor)
- driver_code: test harness with pass/fail output (hidden from user)
- On Run: combines all three → sends to Judge0
- On Submit: sends only userCode to AI reviewer
- Auto-tested badge shows when driver_code is active

### Zero Impact On
- Interview module, resume analyzer, dashboard, auth — all untouched

## Day 10 — Voice Interview Mode
**Date:** 2025-05-31

### Built
- useVoice hook (STT + TTS via Web Speech API)
- VoiceToggle component with mic, speaking indicators, filler counter
- Interview page updated with full voice mode integration
- Auto-listen after AI speaks in voice mode
- Filler word detection (um, uh, like, you know, etc.)
- Filler word summary on feedback screen for voice sessions
- Interim transcript preview while user is speaking

### Key Decisions
- Web Speech API typed with any — avoids DOM type conflicts
- SpeechRecognitionAPI variable name avoids collision with DOM types
- speak() onEnd callback auto-starts listening — natural conversation flow
- stopListening() called before sendMessage — prevents capturing AI speech
- Voice and text modes coexist — toggle between them mid-session
- interimTranscript shown as dashed preview box above input
- Unsupported browser shows warning — no broken buttons

### Tests Passed
- Voice toggle appears during active interview ✅
- AI speaks questions aloud in voice mode ✅
- STT captures user speech and populates input ✅
- Filler word badge counts correctly ✅
- Text mode unchanged and working ✅
- Filler summary appears on feedback screen ✅

### Files Created
- hooks/useVoice.ts
- components/interview/VoiceToggle.tsx
- app/(dashboard)/interview/page.tsx (updated)

### Ready for Day 11
- Final deployment to Vercel
- Environment variables on Vercel
- Production testing
- README finalization


## UI/UX Polish Pass — Pre-Deployment
**Date:** 2025-06-01

### Design System Applied
- Dark slate + indigo color system via CSS variables in globals.css
- oklch color space for perceptually uniform colors
- Space Grotesk for headings, Inter for body text via next/font
- Custom scrollbar styling matching dark theme

### Files Updated
- app/globals.css — full dark theme CSS variable system
- app/layout.tsx — Space Grotesk + Inter font setup
- components/layout/Sidebar.tsx — indigo active states, slate chrome
- components/layout/Navbar.tsx — sticky blur navbar, target role pill
- app/page.tsx — premium landing page full redesign
- components/dashboard/StatsCard.tsx — dark card with refined typography

### Design Decisions
- oklch(0.10) background — dark slate, not pure black
- indigo-500/15 active state — subtle glow not solid fill
- backdrop-blur-sm on navbar — premium sticky nav pattern
- Space Grotesk inline style — reliable across Tailwind v4
- All other pages inherit theme automatically from CSS variables

### Ready for Deployment
- npm run build → fix any errors
- Push to GitHub
- Deploy to Vercel
- Set production environment variables
- Update Supabase redirect URLs

## Day 12 — Deployment
**Date:** 2025-06-02

### Built
- Pre-deployment build check — zero errors
- README.md documentation
- .env.example updated with all variables
- GitHub repository created and pushed
- Vercel deployment configured
- Environment variables set on Vercel
- Supabase redirect URLs updated for production

### Production URL
https://intervu-ai-weld.vercel.app

### Post-Deployment Config Done
- NEXT_PUBLIC_SITE_URL updated on Vercel ✅
- Supabase Site URL updated ✅
- Supabase redirect URL added for production ✅
- Redeployment triggered ✅

### Tests Passed on Production
- Landing page loads ✅
- Signup works ✅
- Onboarding completes ✅
- AI interview works ✅
- Sign out works ✅
- Login redirects correctly ✅
- Route protection working ✅

### Issues Fixed During Polish
- Sign out button broken — removed DropdownMenuItem asChild wrapper
- Mobile sign out missing — added to Sidebar mobile drawer
- Dark theme applied — slate + indigo color system
- Space Grotesk + Inter fonts loaded via next/font

### Bug Fix — Progress Charts
**Date:** 2025-06-02

### Issue
Score Progress and Skill Radar charts showing empty despite 9 completed sessions.

### Root Cause
Supabase returns one-to-many joins as arrays even for single records.
RawSession interface typed feedback_reports as object | null but
Supabase was returning it as array. s.feedback_reports.overall_score
was silently failing — should be s.feedback_reports[0].overall_score.

### Fix
- RawSession interface: feedback_reports type changed to {}[] | null
- chartData loop: access fb = s.feedback_reports[0] then fb.overall_score
- Removed temporary console.log debug statements

### Lesson
Always check actual Supabase response shape in browser console when
joined queries return unexpected results. One-to-many always returns
arrays even when only one record exists.

## Profile Enhancement
**Date:** 2025-06-02

### Built
- Enhanced profile view page (server component — fast, no loading state)
- Separate edit page at /profile/edit (client component with all forms)
- Interview readiness score with weighted formula
- Skills management with add/remove tags
- Social links (LinkedIn, GitHub)
- Bio and interview goal fields
- Change password functionality
- Delete account with confirmation dialog
- New database columns: linkedin_url, github_url, bio, skills, interview_goal

### Key Decisions
- Profile split into view (/profile) and edit (/profile/edit) pages
- View page is Server Component — fetches data server-side, no loading spinner
- Edit page is Client Component — needs form state and interactions
- useProfile hook handles all data fetching and mutations for edit page
- ProfileUpdates interface defined at module level — fixes TypeScript generic errors
- Readiness score formula: sessions (40%) + average score (40%) + best score bonus (20%)
- Skills stored as TEXT[] in Supabase — array type
- Social links use Next.js Link component — avoids JSX anchor tag encoding issues
- Save redirects to /profile — user sees updated info immediately

### Database Changes
- ALTER TABLE profiles ADD COLUMN linkedin_url TEXT
- ALTER TABLE profiles ADD COLUMN github_url TEXT
- ALTER TABLE profiles ADD COLUMN bio TEXT
- ALTER TABLE profiles ADD COLUMN skills TEXT[]
- ALTER TABLE profiles ADD COLUMN interview_goal TEXT

### Files Created
- hooks/useProfile.ts
- app/(dashboard)/profile/page.tsx (replaced — view only)
- app/(dashboard)/profile/edit/page.tsx (new — all forms)
- types/database.ts (updated — new profile fields)

### Tests Passed
- Profile view shows all user data correctly ✅
- Edit Profile button navigates to /profile/edit ✅
- Back arrow and Cancel return to /profile ✅
- Profile saves and redirects to view page ✅
- Skills add and remove correctly ✅
- Social links display on profile view ✅
- Readiness score calculates from real session data ✅
- Change password works ✅
- Delete account confirmation works ✅