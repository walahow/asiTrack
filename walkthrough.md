# Walkthrough: Authentication, Security Shell, & Maternal Onboarding (Phases 1 & 2)

We have successfully implemented the full security framework, dual credentials authentication, global route guards, dynamic database seeding, and mobile-optimized client pages for **asiTrack**! The entire codebase compiles successfully under Next.js 16/Turbopack with 100% type safety.

---

## 🔒 1. Security & NextAuth.js v5 Infrastructure

We configured a robust, edge-friendly authentication architecture using **Auth.js (NextAuth.js v5)**:
1. **Types Declaration (`src/types/next-auth.d.ts`)**: Extended default `Session`, `User`, and `JWT` interfaces to statically type custom fields (`id`, `role`, and `username`).
2. **Lightweight Configuration (`src/lib/auth/config.ts`)**: Built a modular, edge-compatible config structure defining custom pages and the core RBAC checks inside the `authorized` callback.
3. **Dual Credentials Providers (`src/auth.ts`)**:
   - `user-credentials`: Validates postnatal mothers against the MongoDB `users` collection.
   - `admin-credentials`: Validates administrators/clinicians against the `admins` collection.
   - Implemented password verification using `bcryptjs.compare()` to check input credentials against hashed passwords in our database.
4. **API Endpoints (`src/app/api/auth/[...nextauth]/route.ts`)**: Destructured and exported standard GET and POST handlers from Auth.js.
5. **Global RBAC Middleware Guard (`middleware.ts`)**: Configured a global router middleware at the project root using `NextAuth(authConfig).auth` to enforce session requirements:
   - **Mothers client portal** (`/dashboard`, `/profile`, `/form/*`, `/pojok-baca/*`, `/video/*`, `/onboarding`): Requires `role: "user"`.
   - **Admin portal** (`/admin/*` except `/admin/login`): Requires `role: "admin"` or `role: "super_admin"`.
   - **Super-admin settings** (`/admin/admins`): Strictly requires `role: "super_admin"`.
   - **Public routes** (`/`, `/auth/login`, `/auth/signup`, `/admin/login`): Publicly accessible, and auto-redirects already-authenticated users to their respective portals.

---

## 🗄️ 2. Idempotent Database Seeding (`/api/db-seed`)

We created a highly resilient and idempotent endpoint at `src/app/api/db-seed/route.ts` to easily initialize local and production environments:
- **1x Super Admin**: Seeding username `admin` with password `adminasi123` (hashed with `bcryptjs` using a standard salt factor of 10), email `admin@asitrack.id`, and role `"super_admin"`.
- **1x Active Primary Question**: Preloads `"Apakah ASI sudah keluar?"` marked as `is_primary: true` and `active: true` to drive the lactation milestone auto-fill flow.
- **3x Daily Push Notification Templates**: Seeding active templates for morning, afternoon, and evening slots with warm Indonesian copy.

---

## 📱 3. Maternal Account & Onboarding Pages

All client-facing interfaces are strictly optimized for mobile viewports using a centralized `max-w-md` shell frame to provide a comforting, mobile-app-like user experience.

1. **Welcoming Public Landing Page (`src/app/page.tsx`)**:
   - Replaced duplicate route structures and established `/` as the primary welcoming hub.
   - Showcases the new **asiTrack Milestone Logo**, custom feature points, and links for Sign Up, Sign In, and health clinician portals.
2. **Maternal Registration View (`src/app/auth/signup/page.tsx`)**:
   - Implemented username checks (alphanumeric + underscores only) and a date picker to record the childbirth date (`tgl_melahirkan`), which is normalized to the start of day.
   - Connected directly to a custom signup API handler (`src/app/api/auth/signup/route.ts`).
3. **Maternal Sign In View (`src/app/auth/login/page.tsx`)**:
   - Clean, modern credentials form utilizing our custom NextAuth `user-credentials` provider.
   - Handles signup redirect states, credential errors, and loading states.
4. **Maternal Onboarding Flow (`src/app/(user)/onboarding/page.tsx`)**:
   - Triggers immediately after registration to collect profile fields: Usia (Age), Anak ke-berapa, Alamat, Pendidikan terakhir (SD to S3 dropdown), and Pekerjaan.
   - Integrates a custom, sleek iOS-style interactive toggle to configure daily push notification settings.
   - Connects to `/api/user/profile` and sets `profile_completed: true` to unlock access to the tracking dashboard.
5. **Admin Login Portal (`src/app/admin/login/page.tsx`)**:
   - Minimalist, high-contrast security gate for clinicians using the `admin-credentials` provider.

---

## 🔬 4. Production Build Verification

We cleared all cache structures and executed `npm run build`:
- **TypeScript Checking**: 100% successful with type declarations in 4.1s.
- **Next.js Turbopack Compilation**: Succeeded in 3.0s.
- **Static Pre-Rendering & Dynamic API Hooks**: Statically compiled all page files (including the newly restructured protected `/dashboard` page) and registered dynamic endpoints cleanly:
  - `GET /api/db-seed` (Dynamic API)
  - `GET /api/db-test` (Dynamic API)
  - `POST /api/auth/signup` (Dynamic API)
  - `PUT /api/user/profile` (Dynamic API)
  - `GET/POST /api/auth/[...nextauth]` (Dynamic API)
