# 📋 **PROJECT PLAN: Web Tracking ASI Ibu Menyusui**

## 🎯 **Project Overview**

| Item | Detail |
|---|---|
| **Type** | Web app (mobile-first, PWA-enabled) |
| **Target User** | Ibu menyusui post-natal (hari 1-7 setelah melahirkan) |
| **Core Function** | Daily ASI tracking + edukasi (artikel + video) + push notif reminder |
| **Timeline** | 7 hari |
| **Deployment** | Vercel (`.vercel.app` subdomain) |
| **Theme** | Light theme + soft purple accent |

---

## 🛠️ **Tech Stack**

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | MongoDB Atlas (free tier M0) |
| ODM | Mongoose |
| Auth | NextAuth.js v5 (Credentials provider) |
| Password Hashing | bcryptjs |
| Push Notification | Firebase Cloud Messaging (FCM) |
| Service Worker | Manual `firebase-messaging-sw.js` |
| Cron Job | 3x Vercel Cron (daily) |
| Form Management | React Hook Form + Zod |
| Icons | Lucide React |
| Date Handling | date-fns + date-fns-tz (WIB) |
| Rich Text Editor | Tiptap |
| CSV Export | papaparse |
| Deployment | Vercel |

---

## 🗂️ **Database Schema (MongoDB / Mongoose)**

### **1. `users` collection** — Ibu Menyusui

```typescript
{
  _id: ObjectId,
  
  // Required at signup
  nama_lengkap: String,         // required
  username: String,             // required, unique, lowercase
  password: String,             // required, hashed (bcrypt)
  tgl_melahirkan: Date,         // required, max 7 hari lalu, boleh future
  
  // Optional, filled saat edit profile
  usia: Number,
  anak_ke_berapa: Number,
  alamat: String,
  pendidikan: String,           // enum: SD, SMP, SMA, D3, S1, S2, S3
  pekerjaan: String,
  
  // FCM & notification
  fcm_token: String,            // null kalau user block notif
  notif_enabled: Boolean,       // default: false
  
  // Metadata
  profile_completed: Boolean,   // default: false
  created_at: Date,
  updated_at: Date
}
```

**Indexes:** `username` (unique), `tgl_melahirkan`

---

### **2. `admins` collection**

```typescript
{
  _id: ObjectId,
  username: String,             // unique
  password: String,             // hashed
  email: String,
  role: String,                 // enum: "admin" | "super_admin"
  created_at: Date
}
```

**Seed:** 1 super_admin via seed script (credentials di `.env`)

---

### **3. `questions` collection** — Template Kuesioner

```typescript
{
  _id: ObjectId,
  pertanyaan: String,           // "Apakah ASI sudah keluar?"
  tipe: String,                 // enum: "yes_no" | "open_ended"
  is_primary: Boolean,          // true untuk pertanyaan utama dgn auto-fill logic
  active: Boolean,              // default: true
  order: Number,                // urutan tampil
  created_at: Date,
  updated_at: Date
}
```

**Constraint:** Hanya 1 question boleh `is_primary: true` di waktu yang sama.

**Seed default:** 
```json
{ pertanyaan: "Apakah ASI sudah keluar?", tipe: "yes_no", is_primary: true, active: true, order: 1 }
```

---

### **4. `responses` collection** — Jawaban Harian User

```typescript
{
  _id: ObjectId,
  user_id: ObjectId,            // ref users
  question_id: ObjectId,        // ref questions
  response_date: Date,          // tanggal kuesioner (start of day, WIB)
  hari_ke: Number,              // hari ke-N post-natal (1-7)
  jawaban: String,              // "ya"|"tidak" atau text (open_ended)
  auto_filled: Boolean,         // true kalau auto-fill setelah primary "ya"
  created_at: Date
}
```

**Compound unique index:** `(user_id, question_id, response_date)`

---

### **5. `articles` collection** — Pojok Baca

```typescript
{
  _id: ObjectId,
  title: String,
  content: String,              // rich text HTML (dari Tiptap)
  excerpt: String,              // auto-generated dari content (200 char)
  cover_image_url: String,      // optional, URL external
  kategori: String,             // optional
  published: Boolean,           // default: false
  created_by: ObjectId,         // ref admins
  created_at: Date,
  updated_at: Date
}
```

---

### **6. `videos` collection**

```typescript
{
  _id: ObjectId,
  title: String,
  youtube_url: String,          // full URL
  youtube_id: String,           // extracted (untuk embed)
  thumbnail_url: String,        // auto: https://img.youtube.com/vi/{id}/maxresdefault.jpg
  kategori: String,             // enum: "relaksasi" | "terapi"
  deskripsi: String,
  published: Boolean,           // default: true
  created_by: ObjectId,
  created_at: Date,
  updated_at: Date
}
```

---

### **7. `notification_templates` collection**

```typescript
{
  _id: ObjectId,
  message: String,
  tipe: String,                 // enum: "morning" | "afternoon" | "evening"
  active: Boolean,              // default: true
  created_at: Date
}
```

**Seed:** 5 template per tipe (total 15). Contoh:
- Morning: "Selamat pagi, Bunda! Jangan lupa isi kuesioner ASI hari ini ☀️"
- Afternoon: "Halo Bunda, sudah istirahat siang? Yuk, isi laporan ASI hari ini 🌸"
- Evening: "Selamat malam, Bunda! Sebelum tidur, yuk laporkan kondisi ASI hari ini 🌙"

---

## 🔐 **Authentication & Authorization**

### **Strategy:** NextAuth.js v5 with 2 Credentials Providers

- Provider 1: `user-credentials` → check di `users` collection
- Provider 2: `admin-credentials` → check di `admins` collection

**Session:** JWT (stateless), include `role: "user" | "admin" | "super_admin"`

**Middleware:** `middleware.ts`
- `/dashboard`, `/form/*`, `/profile`, `/pojok-baca/*`, `/video/*`, `/onboarding` → require user session
- `/admin/*` (except `/admin/login`) → require admin/super_admin session

### **RBAC Matrix**

| Action | User | Admin | Super Admin |
|---|---|---|---|
| Lihat artikel published | ✅ | ✅ | ✅ |
| Lihat video published | ✅ | ✅ | ✅ |
| Isi kuesioner | ✅ | ❌ | ❌ |
| Edit profil sendiri | ✅ | ❌ | ❌ |
| CRUD artikel | ❌ | ✅ | ✅ |
| CRUD video | ❌ | ✅ | ✅ |
| CRUD kuesioner | ❌ | ✅ | ✅ |
| CRUD notif template | ❌ | ✅ | ✅ |
| Lihat & export data user | ❌ | ✅ | ✅ |
| Manage admin | ❌ | ❌ | ✅ |

---

## 📱 **Page Structure & Routes**

### **Public Pages**
- `/` — Landing page (intro + CTA login/signup)
- `/auth/signup` — Form: nama_lengkap, username, tgl_melahirkan, password, confirm_password
- `/auth/login`
- `/admin/login`

### **User Pages (protected)**
- `/onboarding` — After signup, prompt enable push notif
- `/dashboard` — Today's form status, hari ke-N, quick links
- `/form` — Daily questionnaire (with backfill)
- `/form/history` — Riwayat semua jawaban
- `/pojok-baca` — List artikel
- `/pojok-baca/[id]` — Detail artikel
- `/video` — List video + filter (relaksasi/terapi)
- `/video/[id]` — Detail video (YT embed)
- `/profile` — View & edit profil

### **Admin Pages (protected)**
- `/admin/dashboard` — Overview metrics
- `/admin/artikel` — Table CRUD
- `/admin/artikel/new`, `/admin/artikel/[id]/edit`
- `/admin/video` — Table CRUD
- `/admin/video/new`, `/admin/video/[id]/edit`
- `/admin/kuesioner` — Manage questions
- `/admin/notifikasi` — Manage notif templates
- `/admin/users` — List user
- `/admin/users/[id]` — Detail user + responses
- `/admin/export` — Export CSV with filters
- `/admin/admins` — (super_admin only) Manage admin list

---

## 🌐 **API Routes**

### **Auth**
- `POST /api/auth/[...nextauth]` — NextAuth handlers
- `POST /api/auth/signup` — Register user

### **User**
- `GET /api/user/profile` — Get own profile
- `PATCH /api/user/profile` — Update profile
- `POST /api/user/fcm-token` — Save FCM token
- `DELETE /api/user/fcm-token` — Remove FCM token

### **Kuesioner (User)**
- `GET /api/responses/state` — Current state (hari_ke, backfill needed, primary answered, etc)
- `GET /api/responses` — Own response history
- `POST /api/responses` — Submit answer (handle auto-fill logic untuk primary)
- `GET /api/questions/active` — All active questions

### **Content (Public)**
- `GET /api/articles` — List published articles (pagination)
- `GET /api/articles/[id]` — Detail
- `GET /api/videos` — List published videos (filter by kategori)
- `GET /api/videos/[id]` — Detail

### **Admin — Content Management**
- `GET/POST /api/admin/articles`
- `GET/PATCH/DELETE /api/admin/articles/[id]`
- `GET/POST /api/admin/videos`
- `GET/PATCH/DELETE /api/admin/videos/[id]`
- `GET/POST /api/admin/questions`
- `GET/PATCH/DELETE /api/admin/questions/[id]`
- `GET/POST /api/admin/notification-templates`
- `GET/PATCH/DELETE /api/admin/notification-templates/[id]`

### **Admin — Data Management**
- `GET /api/admin/users` — List users with filter & pagination
- `GET /api/admin/users/[id]` — Detail user + all responses
- `GET /api/admin/export` — Export CSV (with query params filter)
- `GET /api/admin/dashboard-stats` — Metrics

### **Admin — Super Admin Only**
- `GET/POST /api/admin/admins`
- `GET/PATCH/DELETE /api/admin/admins/[id]`

### **Cron**
- `GET /api/cron/send-notification?tipe={morning|afternoon|evening}` — Triggered by Vercel cron, auth via `CRON_SECRET`

---

## 🔔 **Push Notification Flow**

### **Setup**
- Firebase project + Cloud Messaging enabled
- Frontend config + VAPID key
- Service Worker: `/public/firebase-messaging-sw.js`
- Firebase Admin SDK at backend (service account JSON via env vars)

### **Onboarding Flow (Setelah Signup)**
```
1. Redirect → /onboarding
2. Halaman tampilkan:
   - Welcome message
   - Penjelasan singkat tentang notif harian
   - 2 button: "Aktifkan Notifikasi" | "Nanti Saja"
3. Klik "Aktifkan":
   - Trigger Notification.requestPermission()
   - If granted: getToken(messaging, { vapidKey }) → POST /api/user/fcm-token
   - Set notif_enabled = true
4. Klik "Nanti Saja" atau block:
   - Skip, langsung ke /dashboard
   - User bisa enable lagi nanti di /profile
5. After flow → redirect /dashboard
```

### **Sending Flow (Cron)**
```
1. Vercel cron trigger 3x daily:
   - 01:00 UTC (08:00 WIB) → tipe=morning
   - 05:00 UTC (12:00 WIB) → tipe=afternoon
   - 13:00 UTC (20:00 WIB) → tipe=evening
2. GET /api/cron/send-notification?tipe={tipe}
   - Verify Authorization: Bearer ${CRON_SECRET}
3. Logic:
   a. Get all active notification_templates where tipe matches → random 1
   b. Query users:
      - notif_enabled = true
      - fcm_token != null
      - tgl_melahirkan within last 7 days (still in tracking period)
   c. Build messages array with each user's fcm_token
   d. Send via firebase-admin sendEachForMulticast (batch max 500)
   e. Log success/failure count
4. Handle invalid token errors → set fcm_token=null untuk user tsb
```

### **Service Worker**
- File: `/public/firebase-messaging-sw.js`
- Handle `onBackgroundMessage` → show notification
- Click notification → open `/form`

### **vercel.json**
```json
{
  "crons": [
    { "path": "/api/cron/send-notification?tipe=morning", "schedule": "0 1 * * *" },
    { "path": "/api/cron/send-notification?tipe=afternoon", "schedule": "0 5 * * *" },
    { "path": "/api/cron/send-notification?tipe=evening", "schedule": "0 13 * * *" }
  ]
}
```

> **Note:** Vercel cron timing nggak presisi (bisa delay 0-59 menit). Jadi notif pagi terkirim antara 08:00-08:59 WIB. Acceptable untuk reminder.

---

## 📋 **Form Kuesioner Logic — Detailed**

### **State Calculation (saat user buka `/form`)**

```typescript
// Pseudocode
const today = startOfDayWIB(new Date());
const birthDate = startOfDayWIB(user.tgl_melahirkan);

// Calculate days since birth
const daysSinceBirth = differenceInDays(today, birthDate);
// hari_ke 1 = hari pertama SETELAH melahirkan
// jadi kalau melahirkan tanggal 1, maka tanggal 2 = hari_ke 1
const currentHariKe = daysSinceBirth; // 1-7 = active, 0 = belum mulai, >7 = selesai

// Get primary question
const primaryQ = await Question.findOne({ is_primary: true, active: true });

// Get all responses for primary question
const primaryResponses = await Response.find({ 
  user_id, 
  question_id: primaryQ._id 
}).sort({ hari_ke: 1 });

// Check if user already answered "ya" untuk primary
const firstYesResponse = primaryResponses.find(r => r.jawaban === 'ya');
const primaryAnswered = !!firstYesResponse;

// If primaryAnswered, no more forms shown
if (primaryAnswered) {
  // Show summary only
  return { state: 'completed', firstYesAt: firstYesResponse.hari_ke };
}

// If currentHariKe > 7 and never answered ya
if (currentHariKe > 7) {
  return { state: 'ended_no_milk', message: 'Tracking selesai' };
}

// If currentHariKe < 1
if (currentHariKe < 1) {
  return { state: 'not_started', daysUntilStart: 1 - currentHariKe };
}

// Otherwise, calculate which days need backfill
const filledDays = primaryResponses.map(r => r.hari_ke);
const daysToShow = [];
for (let h = 1; h <= currentHariKe; h++) {
  if (!filledDays.includes(h)) {
    daysToShow.push({ hari_ke: h, status: 'pending' });
  }
}

return { 
  state: 'active', 
  currentHariKe, 
  daysToShow,
  questions: await getActiveQuestions()
};
```

### **Submit Logic (`POST /api/responses`)**

```typescript
// Pseudocode
async function submitResponse(user_id, payload) {
  const { hari_ke, answers } = payload;
  // answers = [{ question_id, jawaban }, ...]
  
  const primaryQ = await Question.findOne({ is_primary: true, active: true });
  const primaryAnswer = answers.find(a => a.question_id === primaryQ._id.toString());
  
  // Calculate response_date based on hari_ke
  const user = await User.findById(user_id);
  const responseDate = startOfDayWIB(addDays(user.tgl_melahirkan, hari_ke));
  
  // Save all responses for this hari_ke
  for (const ans of answers) {
    await Response.findOneAndUpdate(
      { user_id, question_id: ans.question_id, response_date: responseDate },
      { 
        user_id, question_id: ans.question_id, response_date: responseDate,
        hari_ke, jawaban: ans.jawaban, auto_filled: false 
      },
      { upsert: true }
    );
  }
  
  // Auto-fill logic: if primary == "ya", auto-fill future days
  if (primaryAnswer && primaryAnswer.jawaban === 'ya') {
    for (let h = hari_ke + 1; h <= 7; h++) {
      const futureDate = startOfDayWIB(addDays(user.tgl_melahirkan, h));
      await Response.findOneAndUpdate(
        { user_id, question_id: primaryQ._id, response_date: futureDate },
        {
          user_id, question_id: primaryQ._id, response_date: futureDate,
          hari_ke: h, jawaban: 'ya', auto_filled: true
        },
        { upsert: true }
      );
    }
  }
  
  return { success: true };
}
```

### **UI Behavior**

- `/form` page tampilkan **list cards** untuk setiap `hari_ke` yang pending
- Setiap card show: "Hari ke-{N}" + form questions di dalamnya
- User bisa fill out-of-order (misal hari 3 dulu, lalu hari 1)
- Saat primary dijawab "ya":
  - Confirmation modal: "Selamat! Kami akan menandai hari berikutnya sebagai 'sudah' otomatis. Tracking selesai."
  - Setelah submit → redirect `/form/history`
- `/form/history` show all responses (including auto-filled, marked with badge)
- Hari yang lewat & tidak diisi → tampil di history dengan badge "Tidak diisi"

---

## 📊 **Admin Dashboard & Export**

### **Dashboard Metrics (`/admin/dashboard`)**
- Total user registered
- Active users (tgl_melahirkan within last 7 days)
- Total responses today
- Response rate per hari (line chart, last 7 days)
- Primary "ya" distribution (bar chart, hari 1-7)
- Quick links

### **Data Recap (`/admin/users` + `/admin/export`)**

**Filter options:**
- Tanggal melahirkan (date range)
- Response date (date range)
- Usia (range slider)
- Anak ke-berapa
- Pendidikan (multi-select)
- Pekerjaan (search)
- Profile completed status
- Primary answered status

### **CSV Export Structure**

1 row per response. Field:

```csv
user_id, nama_lengkap, username, tgl_melahirkan, usia, anak_ke_berapa, alamat, pendidikan, pekerjaan, profile_completed, user_created_at,
question_id, pertanyaan, tipe, is_primary, hari_ke, response_date, jawaban, auto_filled, response_created_at
```

### **Export Implementation**
- Filter applied via query params: `/api/admin/export?dateFrom=...&dateTo=...&pendidikan=S1,SMA&...`
- Server-side aggregation (MongoDB `$lookup` user + question + response)
- Generate CSV via `papaparse.unparse()`
- Stream as download with `Content-Disposition: attachment; filename="export_{timestamp}.csv"`

---

## 🎨 **UI/UX Design Direction**

### **Color Palette**

```css
/* Primary Soft Purple */
--primary: #A78BFA;          /* violet-400 */
--primary-hover: #8B5CF6;    /* violet-500 */
--primary-light: #EDE9FE;    /* violet-100 */
--primary-bg: #F5F3FF;       /* violet-50 */

/* Neutrals */
--background: #FFFFFF;
--surface: #FAFAFA;
--border: #E5E7EB;           /* gray-200 */
--text-primary: #1F2937;     /* gray-800 */
--text-secondary: #6B7280;   /* gray-500 */
--text-tertiary: #9CA3AF;    /* gray-400 */

/* Semantic */
--success: #10B981;          /* emerald-500 */
--success-bg: #D1FAE5;       /* emerald-100 */
--warning: #F59E0B;          /* amber-500 */
--error: #EF4444;            /* red-500 */
--info: #3B82F6;             /* blue-500 */
```

### **Typography**
- Font: **Plus Jakarta Sans** (Google Fonts)
- Headings: 700 weight, tight tracking
- Body: 400 weight, normal tracking

### **Components & Style**
- Border radius: `rounded-2xl` untuk cards, `rounded-xl` untuk inputs/buttons
- Shadows: `shadow-sm` default, `shadow-md` on hover
- Spacing: generous (`p-6`, `gap-4`)
- Buttons: filled (primary action), outline (secondary), ghost (tertiary)

### **Mobile-First Layout**
- Max-width container: `max-w-md` for mobile-centric pages, `max-w-7xl` for admin
- Bottom navigation bar (user): 4 tabs — Beranda, Pojok Baca, Video, Profil
- Floating action button (FAB) at bottom-right untuk akses `/form` (kalau ada pending)
- Touch targets: min 44x44px
- Form input height: min 48px

### **Page-Specific Notes**
- **Landing:** Hero + 3 fitur cards + CTA button
- **Signup/Login:** Single-column form, big inputs, friendly copy in Bahasa
- **Dashboard:** Greeting + "Hari ke-N" badge + status card + content shortcuts
- **Form:** Card per hari, clear "Hari ke-X" header, radio buttons untuk yes/no
- **Pojok Baca:** Grid cards (1 col mobile, 2 col tablet+)
- **Video:** Thumbnail cards with play icon overlay
- **Admin:** Sidebar layout (desktop), drawer (mobile)

---

## 📅 **7-Day Development Schedule**

### **Day 1 — Foundation & Auth Setup**
**Goal:** Boilerplate ready, auth working.

- [ ] `npx create-next-app@latest` (TS, Tailwind, App Router, src/ dir)
- [ ] Install all deps (Mongoose, NextAuth, Firebase, etc)
- [ ] Setup MongoDB Atlas (create cluster, get connection string)
- [ ] Setup Firebase project (Cloud Messaging + service account)
- [ ] Init shadcn/ui + theme config
- [ ] Create folder structure (`/lib`, `/models`, `/components`, etc)
- [ ] Define all Mongoose models
- [ ] Setup NextAuth.js v5 (user + admin providers)
- [ ] Create `middleware.ts` (RBAC)
- [ ] Build seed script: super_admin + default question + 15 notif templates
- [ ] Configure Tailwind theme (purple palette)
- [ ] Run seed
- [ ] Setup `.env.local`

### **Day 2 — User Auth Pages & Profile**
**Goal:** User dapat signup, login, edit profil.

- [ ] Landing page (`/`)
- [ ] Signup page (`/auth/signup`) dengan validasi Zod
- [ ] Login page (`/auth/login`)
- [ ] Validasi tgl_melahirkan (max 7 days ago, allow future)
- [ ] Auto-redirect: completed signup → `/onboarding`
- [ ] Profile page (`/profile`) — view + edit form
- [ ] Update `profile_completed` jika semua field optional terisi
- [ ] User dashboard skeleton (`/dashboard`)
- [ ] Bottom navigation component

### **Day 3 — Kuesioner Logic & Form**
**Goal:** Form kuesioner fully functional dengan auto-fill.

- [ ] `GET /api/responses/state` endpoint
- [ ] `GET /api/questions/active`
- [ ] `POST /api/responses` dengan auto-fill logic
- [ ] `/form` page dengan multi-day cards (backfill UI)
- [ ] `/form/history` page
- [ ] Status state handling (not_started, active, completed, ended_no_milk)
- [ ] Confirmation modal saat answer "ya"
- [ ] Dashboard integration (hari ke-N, pending forms count)

### **Day 4 — Content Pages (Pojok Baca + Video)**
**Goal:** User dapat browse artikel & video.

- [ ] `GET /api/articles` (with pagination)
- [ ] `GET /api/articles/[id]`
- [ ] `GET /api/videos` (filter by kategori)
- [ ] `GET /api/videos/[id]`
- [ ] `/pojok-baca` list page
- [ ] `/pojok-baca/[id]` detail page (render rich HTML)
- [ ] `/video` list page with kategori filter
- [ ] `/video/[id]` detail page (YT embed via youtube_id)
- [ ] YT URL parser utility

### **Day 5 — Admin Panel**
**Goal:** Admin dapat manage all content & view data.

- [ ] `/admin/login` page
- [ ] Admin layout dengan sidebar
- [ ] `/admin/dashboard` dengan metrics
- [ ] CRUD artikel (Tiptap editor integrated)
- [ ] CRUD video (YT URL parser di submit)
- [ ] CRUD kuesioner
- [ ] CRUD notification templates
- [ ] User list page dengan filter + search
- [ ] User detail page dengan response history
- [ ] CSV export endpoint + filter UI
- [ ] (Super admin) manage admin page

### **Day 6 — Push Notification**
**Goal:** Push notif terkirim 3x sehari.

- [ ] Firebase config (frontend)
- [ ] Service worker `firebase-messaging-sw.js`
- [ ] Onboarding flow `/onboarding`
- [ ] Request permission flow + save FCM token
- [ ] `POST /api/user/fcm-token` + `DELETE`
- [ ] Toggle notif di `/profile`
- [ ] Firebase Admin SDK setup di backend
- [ ] `/api/cron/send-notification` endpoint dengan auth
- [ ] Random template logic + batch send
- [ ] Invalid token cleanup logic
- [ ] `vercel.json` cron config
- [ ] Test manual trigger

### **Day 7 — Polish, Test & Deploy**
**Goal:** Production-ready.

- [ ] UI polish + consistency pass
- [ ] Loading states (Suspense + skeleton)
- [ ] Error states + toast notifications
- [ ] Empty states (no data scenarios)
- [ ] Mobile responsive test
- [ ] PWA manifest (`/public/manifest.json` + icons)
- [ ] Test all critical flows end-to-end
- [ ] Set env vars di Vercel
- [ ] Deploy ke Vercel
- [ ] Verify cron jobs deployed
- [ ] Test push notif di production
- [ ] Test CSV export di production
- [ ] Buffer untuk bug fixes & polish

---

## 🌐 **Environment Variables**

```env
# Database
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_SECRET=                  # openssl rand -base64 32
NEXTAUTH_URL=https://your-app.vercel.app

# Firebase Client (NEXT_PUBLIC_ exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# Firebase Admin (backend, dari service account JSON)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Cron security
CRON_SECRET=                      # openssl rand -base64 32

# Seed default super admin
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=             # ganti saat first deploy!
SUPER_ADMIN_EMAIL=
```

---

## 📦 **Dependencies (package.json)**

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    "mongoose": "^8",
    "next-auth": "^5",
    "bcryptjs": "^2",
    "firebase": "^10",
    "firebase-admin": "^12",
    "tailwindcss": "^3",
    "react-hook-form": "^7",
    "zod": "^3",
    "@hookform/resolvers": "^3",
    "lucide-react": "latest",
    "date-fns": "^3",
    "date-fns-tz": "^3",
    "papaparse": "^5",
    "@tiptap/react": "^2",
    "@tiptap/starter-kit": "^2",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  }
}
```

(shadcn/ui di-install via CLI, bukan dep langsung)

---

## 📁 **Project Folder Structure**

```
/src
  /app
    /(public)
      page.tsx                          # Landing
      /auth
        /signup/page.tsx
        /login/page.tsx
    /(user)
      layout.tsx                        # User layout + bottom nav
      /onboarding/page.tsx
      /dashboard/page.tsx
      /form
        page.tsx
        /history/page.tsx
      /pojok-baca
        page.tsx
        /[id]/page.tsx
      /video
        page.tsx
        /[id]/page.tsx
      /profile/page.tsx
    /admin
      layout.tsx                        # Admin layout + sidebar
      /login/page.tsx
      /dashboard/page.tsx
      /artikel
        page.tsx
        /new/page.tsx
        /[id]/edit/page.tsx
      /video
        page.tsx
        /new/page.tsx
        /[id]/edit/page.tsx
      /kuesioner/page.tsx
      /notifikasi/page.tsx
      /users
        page.tsx
        /[id]/page.tsx
      /export/page.tsx
      /admins/page.tsx                  # super_admin only
    /api
      /auth
        /[...nextauth]/route.ts
        /signup/route.ts
      /user
        /profile/route.ts
        /fcm-token/route.ts
      /responses
        route.ts
        /state/route.ts
      /questions
        /active/route.ts
      /articles
        route.ts
        /[id]/route.ts
      /videos
        route.ts
        /[id]/route.ts
      /admin
        /articles/route.ts
        /articles/[id]/route.ts
        /videos/route.ts
        /videos/[id]/route.ts
        /questions/route.ts
        /questions/[id]/route.ts
        /notification-templates/route.ts
        /notification-templates/[id]/route.ts
        /users/route.ts
        /users/[id]/route.ts
        /export/route.ts
        /dashboard-stats/route.ts
        /admins/route.ts
        /admins/[id]/route.ts
      /cron
        /send-notification/route.ts
    layout.tsx
    globals.css
  /components
    /ui                                 # shadcn components
    /user
      BottomNav.tsx
      FormCard.tsx
      ArticleCard.tsx
      VideoCard.tsx
      ...
    /admin
      Sidebar.tsx
      DataTable.tsx
      Editor.tsx                        # Tiptap wrapper
      ...
    /shared
      ...
  /lib
    /db
      mongoose.ts                       # connection
    /auth
      config.ts                         # NextAuth options
    /firebase
      client.ts
      admin.ts
      messaging.ts
    /utils
      date.ts                           # WIB helpers
      youtube.ts                        # parse YT URL
      csv.ts                            # papaparse helper
    /validations
      auth.ts                           # Zod schemas
      response.ts
      ...
  /models
    User.ts
    Admin.ts
    Question.ts
    Response.ts
    Article.ts
    Video.ts
    NotificationTemplate.ts
  /types
    index.ts
  middleware.ts
/public
  firebase-messaging-sw.js
  manifest.json
  /icons
    icon-192.png
    icon-512.png
/scripts
  seed.ts
vercel.json
.env.local
.env.example
package.json
tsconfig.json
tailwind.config.ts
```

---

## ⚠️ **Risk & Mitigation**

| Risk | Mitigation |
|---|---|
| MongoDB free tier 512MB cap | Sufficient untuk MVP; monitor saat scale |
| Vercel cron timing imprecise (0-59 min delay) | Acceptable untuk reminder use case |
| FCM token expired/invalid | Auto-cleanup di cron endpoint saat send fail |
| User block notif | App tetap functional; remind di profile |
| Browser tidak support FCM (Safari iOS lama) | Display warning di onboarding |
| Vercel function 10s timeout (free tier) | Batch send dalam chunks of 500, async fire-and-forget jika perlu |
| Timezone bug | Selalu store UTC, convert WIB di display dengan `date-fns-tz` |
| 7-day deadline tight | Day 7 = buffer; priority order: auth → form → content → admin → notif |
| Tiptap editor complexity | Fallback ke simple textarea kalau buntu |

---

## ✅ **Definition of Done (MVP)**

- [ ] User signup, login, edit profil works
- [ ] Daily kuesioner with backfill + auto-fill works
- [ ] Hari ke-N calculation correct (WIB timezone)
- [ ] User dapat baca artikel & nonton video (YT embed)
- [ ] Push notif terkirim 3x sehari (8/12/20 WIB), random template, only to eligible users
- [ ] Admin CRUD artikel, video, kuesioner, notif template
- [ ] Admin dashboard metrics tampil
- [ ] User filter + CSV export works
- [ ] RBAC enforced (middleware + API checks)
- [ ] Mobile responsive
- [ ] Soft purple + light theme consistent
- [ ] PWA installable
- [ ] Deployed to Vercel, cron registered, accessible via `*.vercel.app`

---

## 🎯 **Priority Order (kalau tight on time)**

**Must-have (P0):**
1. Auth (user + admin)
2. Form kuesioner + auto-fill logic
3. Admin CRUD artikel & video
4. Admin user list + CSV export

**Should-have (P1):**
5. Push notification
6. Onboarding flow
7. Pojok Baca + Video pages (user side)
8. Profile edit

**Nice-to-have (P2):**
9. Admin dashboard metrics
10. Super admin manage admins
11. Notif template CRUD
12. PWA manifest

Kalau ada slip di timeline, drop P2 dulu, baru P1.

---

**Plan selesai dan siap untuk diimplementasikan!**
