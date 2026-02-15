# Stack Rules

- Framework: Next.js 14+ App Router, TypeScript strict
- Styling: Tailwind CSS + shadcn/ui components
- Backend: Supabase (Auth, PostgreSQL, Storage)
- LLM: Provider-agnostic via lib/ai/provider.ts (env LLM_PROVIDER)
- Deploy: Vercel
- Language: UI text in Russian, code/comments in English
- Prefer Server Components by default, "use client" only when needed
- Use Server Actions for mutations (create/update/delete)
- Always handle 3 UI states: loading (Skeleton), empty, error (Toast)