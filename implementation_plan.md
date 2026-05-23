# Implementation Plan: Authentication Shell & Maternal Onboarding (Phase 1 & 2)

We will now implement the security backbone and onboarding layers for **asiTrack**. This includes configuring Auth.js (NextAuth.js v5) with separate credentials systems for mothers and administrators, setting up a resilient middleware guard for Role-Based Access Control (RBAC), seeding the database with initial templates and a super admin, and constructing modern, mobile-friendly authentication and onboarding views in warm Indonesian copy.

---

## 🔒 Security & Authentication Architecture

We are utilizing **NextAuth.js v5 (Auth.js)**, configured with a dual Credentials Provider scheme. This supports a unified session interface where users have a `role` of `"user"` and administrators have a `role` of `"admin"` or `"super_admin"`.

### 1. Dual Credentials Providers
- **`user-credentials`**: Authenticates mothers against the `users` collection in MongoDB. Validates lowercase alphanumeric `username` and hashes password inputs.
- **`admin-credentials`**: Authenticates administrators against the `admins` collection in MongoDB. Validates administrative role privileges.

### 2. Password Security
- We will install `bcryptjs` and `@types/bcryptjs` to handle salt generation and hashing securely without relying on platform-specific C/C++ compilation.
- Password hashes will be safely validated using `bcryptjs.compare()` in the NextAuth `authorize` handler.

### 3. Middleware Route Protection (`middleware.ts`)
We will create a global middleware that checks session validation and enforces the following RBAC permissions:
- **Client App Pages** (`/dashboard`, `/profile`, `/form/*`, `/pojok-baca/*`, `/video/*`, `/onboarding`): Strictly requires a session with `role: "user"`.
- **Administrative Pages** (`/admin/*`, except `/admin/login`): Requires a session with `role: "admin"` or `role: "super_admin"`.
- **Super-Admin Action Pages** (`/admin/admins`): Strictly requires `role: "super_admin"`.
- **Public & Authentication Pages** (`/`, `/auth/login`, `/auth/signup`, `/admin/login`): Publicly accessible. If an authenticated user accesses them, they will be redirected to their respective dashboards.

---

## 🛠️ Proposed Changes

### NextAuth Configurations
#### [NEW] [auth.ts](file:///d:/proj/asiTrack/src/auth.ts)
- NextAuth initialization entry point. Exports standard API handlers, `auth`, `signIn`, and `signOut` helper functions.

#### [NEW] [config.ts](file:///d:/proj/asiTrack/src/lib/auth/config.ts)
- Main AuthOptions declaration. Defines providers, token callbacks, and custom JWT payload injection for `id` and `role`.

#### [NEW] [middleware.ts](file:///d:/proj/asiTrack/middleware.ts)
- Route guard intercepting all Next.js page requests to enforce RBAC rules.

---

### Database Seeding
#### [NEW] [route.ts](file:///d:/proj/asiTrack/src/app/api/db-seed/route.ts)
- Create an idempotent API endpoint `/api/db-seed` to safely seed:
  1. **1x Super Admin Account**: Username `admin`, password `adminasi123` (hashed with `bcryptjs`), and role `"super_admin"`.
  2. **1x Active Primary Question**: Questions template schema with `"Apakah ASI sudah keluar?"` marked as `is_primary: true` and `active: true`.
  3. **3x Default Notification Reminders**: One active template for each slot (`morning`, `afternoon`, `evening`).

---

### UI/UX Page Shells & Views

We will establish a mobile-first user flow and move the current mock dashboard from the public root to `/dashboard` to make room for a welcoming landing page.

#### [MODIFY] [page.tsx](file:///d:/proj/asiTrack/src/app/%28user%29/page.tsx) -> Move to [dashboard/page.tsx](file:///d:/proj/asiTrack/src/app/%28user%29/dashboard/page.tsx)
- Reposition user dashboard to a protected route `/dashboard`.

#### [NEW] [page.tsx](file:///d:/proj/asiTrack/src/app/page.tsx)
- Create a beautiful public landing page `/` introducing **asiTrack** with soft violet theme styling, illustration placement, and modern action buttons leading to Sign Up and Login.

#### [NEW] [page.tsx](file:///d:/proj/asiTrack/src/app/auth/login/page.tsx)
- Mobile-optimized login view supporting Indonesian prompts. Includes username/password input and transitions to the client dashboard upon successful validation.

#### [NEW] [page.tsx](file:///d:/proj/asiTrack/src/app/auth/signup/page.tsx)
- Registration form for postnatal mothers. Incorporates robust input validation for `nama_lengkap`, `username`, and `tgl_melahirkan`.

#### [NEW] [page.tsx](file:///d:/proj/asiTrack/src/app/%28user%29/onboarding/page.tsx)
- Interactive profile onboarding page collecting additional details (usia, anak_ke_berapa, alamat, pendidikan, pekerjaan) and enabling client mock push notification permissions.

#### [NEW] [page.tsx](file:///d:/proj/asiTrack/src/app/admin/login/page.tsx)
- Minimalist administrative login portal.

---

## 📐 Open Questions for User Review

> [!IMPORTANT]
> **1. Seed Admin Credentials**:
> For local database setup, is seeding a default super admin with username `admin` and password `adminasi123` acceptable? (You will be prompted to change this immediately upon deployment).
>
> **2. Password Hashing Tool**:
> Using `bcryptjs` for standard salt factors is our default recommendation. It compiles 100% in pure JS, eliminating native node-gyp prebuild crashes on Windows. Is there any objection to installing this library?

---

## 🔬 Verification Plan

### Automated Tests
- Run `npm run build` to verify Next.js static validation compiles without TypeScript or next-auth compilation warnings.
- Call the `/api/db-seed` dynamic route to verify MongoDB collection seeding.

### Manual Verification
- Test unauthenticated requests to `/dashboard` to verify they redirect to `/auth/login`.
- Verify credentials routing paths (mothers are redirected to `/dashboard`, admins to `/admin`).
