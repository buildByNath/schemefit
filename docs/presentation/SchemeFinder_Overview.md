# SchemeFinder – Smart Eligibility & Document Management Platform

---

## 0. Overall Idea
- **Problem:** Citizens often struggle to locate, understand, and apply for various government, NGO, and private‑sector schemes. The process involves scattered information, manual eligibility checks, and repetitive form filling.
- **Solution:** SchemeFinder aggregates scheme data, automatically matches user eligibility, provides a Chrome‑extension autofill for official forms, and offers a secure document vault, creating a single seamless portal for discovering and applying to relevant schemes.

## 0a. Sustainable Development Goals (SDGs)
- **SDG 4 – Quality Education:** Improves access to educational resources and scheme information.
- **SDG 10 – Reduced Inequalities:** Enables marginalized communities to discover and apply for assistance programs.

## 1. Purpose & Vision
- **Goal:** Help citizens discover and apply for government, NGO, and private‑sector schemes that match their personal profile.
- **Value:** Reduces paperwork, automates eligibility checks, and securely stores personal documents.

---

## 2. Core Features
| Feature | Description | User Benefit |
|---|---|---|
| **Discovery & Matching** | Real‑time eligibility engine (`src/lib/matching.ts`) that compares user profile (income, caste, education, gender, etc.) against scheme rules. | Shows only relevant schemes, saves time. |
| **Autofill Chrome Extension** | Syncs the logged‑in Supabase session to the extension via a hidden div on the dashboard. The extension injects data directly into government portals. | One‑click form filling, no re‑typing. |
| **Document Vault** | Encrypted client‑side storage of scanned documents with categorisation (`document_category`). Uses AES‑GCM, never leaves the client unencrypted. | Secure, searchable personal docs. |
| **One‑Click Apply (NGO/Private)** | `SchemeCard.tsx` detects `provider_type` and either opens the external portal (Government) or registers the application internally (NGO/Private). | Seamless internal applications for NGOs. |
| **Google Drive Integration** | Connects a user’s Google Drive to import documents directly into the vault (`/api/auth/google-drive`). | Quick bulk upload from Drive. |

---

## 3. Technology Stack
- **Frontend:** Next.js (React) + Typescript + Tailwind‑styled UI components (`shadcn/ui`).
- **Backend / Auth:** Supabase (PostgreSQL + Auth).
- **Chrome Extension:** Vanilla JS, `chrome.storage.local` for token sync.
- **Encryption:** AES‑GCM (256‑bit) performed in the browser.
- **Database:** Supabase Postgres with migrations under `supabase/migrations/`.
- **Dev Tools:** `npm run dev` for hot‑reloading.

---

## 4. Database Schema (Key Tables)
```sql
-- 0000_initial_schema.sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  full_name text,
  ...
  google_drive_access_token text,
  google_drive_refresh_token text
);

CREATE TABLE user_documents (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  name text,
  file_type text,
  encrypted_data text,
  iv text,
  uploaded_at timestamptz DEFAULT now(),
  document_category text DEFAULT 'Other'   -- added by 0003_add_document_category.sql
);
```
- **Migrations:** `0000_initial_schema.sql`, `0001_add_extended_profile.sql`, `0002_add_provider_roles.sql`, `0003_add_document_category.sql`.
- **Important Columns:** `uploaded_documents` (array of document IDs) stored on the user for quick lookup in the vault.

---

## 5. Architecture Overview
```
[Browser] --(Next.js)--> /dashboard  (fetches user profile)
          |                               |
          |                               └─► Hidden <div id="schemefit-extension-sync-data">JSON profile</div>
          ▼
[Chrome Extension] -- reads hidden div → stores token in chrome.storage.local
          |
          └─► content.js injects data into government forms (autofill)

Supabase (Postgres) – stores users, documents, scheme definitions.

Google Drive OAuth (api/auth/google-drive) → stores encrypted tokens in `users` table.
```

---

## 6. Google Drive Integration Details
1. User clicks **Connect Google Drive** → `/api/auth/google-drive` creates an OAuth redirect.
2. After consent, `/api/auth/google-drive/callback` receives the auth `code`, exchanges it for an access token, encrypts the token (AES‑GCM) and saves it on the `users` row.
3. UI reads `drive=connected` query param to show a green “connected” badge.
4. **Important:** The Google Cloud project must be in **Testing** mode with the user added as a test user, or the app must be published (requires verification).

---

## 7. Setup & Running Locally
```bash
# Clone repo & install deps
git clone <repo-url>
cd scheme-finder-saturnx
npm install

# Supabase local dev (or use hosted project)
# Set env vars in .env.local
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…
ENCRYPTION_KEY=<32‑byte secret>

# Run dev server
npm run dev   # http://localhost:3000
```
- Open Chrome, load the `chrome-extension` folder as an unpacked extension.
- Use the dashboard to log in, connect Google Drive and test the autofill flow.

---

## 8. Security & Privacy
- **Zero‑knowledge encryption:** All document bytes are encrypted client‑side before being sent to Supabase.
- **Tokens:** Google OAuth tokens are stored encrypted; never exposed to the UI.
- **CORS & Auth:** Supabase session cookie (`auth_token`) secures API routes.

---

## 9. Future Roadmap
- Add **AI‑based document classification** (auto‑detect category on upload).
- Implement **batch export** of vault documents as a zip.
- Complete **Google verification** for production release.
- Add **multilingual UI** (regional languages).
- Deploy to Vercel + Supabase Edge Functions for production scaling.

---

## 10. Quick Reference Links (internal)
- **Matching Logic:** `src/lib/matching.ts`
- **Chrome Extension:** `chrome-extension/` (popup, content.js)
- **Vault UI:** `src/components/DocumentVault.tsx`
- **Scheme Card UI:** `src/components/SchemeCard.tsx`
- **Google Drive API:** `src/app/api/auth/google-drive/*`
- **Database Migrations:** `supabase/migrations/`

---

*Prepared for the team’s presentation deck – copy the sections you need and add your own screenshots or demo GIFs.*
