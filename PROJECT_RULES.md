# Project Rules & Guidelines

This document serves as the core memory and rulebook for all future AI interactions for this project. These rules must be strictly followed to ensure code quality, prevent context loss, and maintain safe deployments.

## 1. Tech Stack & Architecture

### Core Stack
* **Framework:** Next.js (Version 14.2.3) using the App Router.
* **Database & Backend:** Supabase (via `@supabase/supabase-js`) and PostgreSQL (`pg`).
* **Styling:** Tailwind CSS (Version 3.4.1).
* **Animations:** Framer Motion (Version 11.2.6).
* **Maps & Visualization:** React Simple Maps (`react-simple-maps`) and D3 Geo (`d3-geo`).
* **Deployment & Hosting:** Vercel.
* **Analytics:** Meta Pixel (with server-side CAPI considerations) & `@next/third-parties`.

### Basic Project Structure
* `src/app/`: Core App Router application logic, including routing (`page.tsx`, `widget/`), layouts (`layout.tsx`), global styling (`globals.css`), and SEO configurations (`robots.ts`, `sitemap.ts`).
* `src/components/`: Reusable UI and logic components (e.g., `LiveMap.tsx`, `LiveDashboard.tsx`, `PulsePrayerButton.tsx`).
* `src/utils/`: Helper scripts, configuration constants, and external service clients (e.g., `supabaseClient.ts`, `countries.ts`, `countryCentroids.ts`).
* `scripts/`: Assorted operational and utility scripts.
* Configuration files reside in the root (`next.config.mjs`, `tailwind.config.ts`, `package.json`, etc.).

## 2. Strict Git & Deployment Workflow (CRITICAL)

The following deployment workflow is **mandatory** and must be strictly adhered to:

* **No Direct Commits to Main:** **NEVER** push code directly to the main production branch.
* **Branching Strategy:** For every new task, bug fix, or feature, you **MUST** create a new, separate branch using clear naming conventions (e.g., `feat/feature-name` or `fix/bug-name`).
* **Preview Deployments:** Push the newly created branch to the remote repository to trigger a Vercel Preview/Staging deployment automatically.
* **Explicit Approval Required:** You must **STOP** and wait for explicit, manual approval of the staging URL from the user before taking any steps to merge the code into the main branch.

## 3. Coding Hygiene

* **Preserve UI/UX:** Do not change UI layouts, text, wording, or styling unless explicitly instructed by the user to do so.
* **Narrow Scope:** Keep your changes strictly scoped. Only modify the files that are absolutely necessary to fulfill the specific prompt or task. Avoid speculative or unprompted refactoring.
