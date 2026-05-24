# Implementation Plan: Daily Breastfeeding Tracking Engine (Phase 3)

We will now design and build the core engine of **asiTrack**: the daily laktasi progress tracker. This module enables mothers to record their daily laktasi milestone questions, supports out-of-order backfilling for days they forgot to record, automatically backfills subsequent tracking records once the breastmilk milestone is achieved, and displays a premium 7-day calendar history with dynamic status badges.

---

## ⚡ Calendar Logic & Timezone Integrity (WIB)

To ensure no "missing days" or "future logging overlaps," we enforce absolute calendar date alignment with the **Asia/Jakarta (WIB, UTC+7)** timezone using `date-fns-tz` and `date-fns`.

### 1. `hari_ke` Day Index Calculations
- **Day 1** of tracking is the **day after birth**. (e.g. if the baby is born on May 21 WIB, May 22 WIB is Day 1).
- Calculation routine:
  ```typescript
  import { utcToZonedTime } from 'date-fns-tz';
  import { differenceInDays, startOfDay } from 'date-fns';

  const TIMEZONE = 'Asia/Jakarta';
  // Get start of today in WIB
  const todayWIB = startOfDay(utcToZonedTime(new Date(), TIMEZONE));
  // Get stored start of birth date in WIB
  const birthWIB = startOfDay(utcToZonedTime(user.tgl_melahirkan, TIMEZONE));
  // Calculate difference
  const currentHariKe = differenceInDays(todayWIB, birthWIB);
  ```

### 2. State & Boundary Configurations
- `currentHariKe < 1`: Pre-birth state (waiting for tracking period to start).
- `1 <= currentHariKe <= 7`: Active tracking window.
- `currentHariKe > 7`: Post-tracking period (historical read-only dashboard).

---

## ⚙️ Core Logic & Automation

### 1. Smart Milestone Auto-Fill Mechanism
The **Primary Question** (`is_primary: true`, default template: *"Apakah ASI sudah keluar?"*) is the core laktasi milestone indicator.
- When the mother answers `"ya"` for the Primary Question on any active day `hari_ke = N`:
  1. The API saves the responses for day `N`.
  2. The API **automatically backfills** response records for all remaining days up to day `7` (i.e. `hari_ke = N + 1` through `7`) with `"ya"` and `auto_filled: true` for the primary question.
  3. Once primary question is answered `"ya"`, the user's tracking is considered complete. No further daily forms are shown; instead, they see their successful completion dashboard.

### 2. Out-of-Order Backfill Support
If a mother forgets to log her laktasi state on a busy postpartum day:
- When opening the tracking view, the API calculates all pending days in the range `[1, min(currentHariKe, 7)]` that have no recorded responses.
- The UI renders beautiful, distinct, expandable cards for each missing day, allowing mothers to backfill their tracking records in any order.

---

## 🛠️ Proposed Changes

### Backend API Endpoints

#### [NEW] [state/route.ts](file:///d:/proj/asiTrack/src/app/api/responses/state/route.ts)
- Returns the current user's laktasi progress day index (`hari_ke`), whether the milestone has ever been achieved (`"ya"` on primary question), tracking completion status, and an array of missing/pending `hari_ke` numbers that need to be logged or backfilled.

#### [NEW] [route.ts](file:///d:/proj/asiTrack/src/app/api/responses/route.ts)
- Handles form submissions (`POST`) for daily questionnaires.
- Implements the **Milestone Auto-Fill automation**: inserts `"ya"` with `auto_filled: true` for subsequent days up to Day 7.

---

### Client-Side Pages & Forms

#### [NEW] [page.tsx](file:///d:/proj/asiTrack/src/app/%28user%29/form/page.tsx)
- The daily tracking entry screen.
- Fetches pending days from the API.
- If multiple days are missing, it renders separate interactive cards (e.g. "Catat Hari ke-1", "Catat Hari ke-2") so the mother can complete them.
- Renders an elegant multi-step questionnaire slide-over panel with soft violet gradients and Lucide icons.

#### [NEW] [page.tsx](file:///d:/proj/asiTrack/src/app/%28user%29/form/history/page.tsx)
- Interactive historical calendar portal.
- Displays a visual layout of the 7-day timeline with beautiful custom status badges:
  - **Berhasil** (Solid purple checkmark, answered "ya")
  - **Belum Keluar** (Soft amber cross, answered "tidak")
  - **Terisi Otomatis** (Lavender badge, auto-filled milestone)
  - **Kosong** (Muted gray dash, forgot to log)
  - **Belum Mulai** (Dashed future circle)

#### [MODIFY] [page.tsx](file:///d:/proj/asiTrack/src/app/%28user%29/dashboard/page.tsx)
- Connect to `/api/responses/state` to retrieve actual user name, precise `hari_ke` day index, and current milestone status.
- Dynamically render current daily tracking options and real progress nodes on the horizontal checkpoint timeline.

---

## 📐 Open Questions for User Review

> [!IMPORTANT]
> **1. Auto-Fill Date Mapping**:
> When a milestone is triggered on Day `N`, the auto-filled records for subsequent days will be saved with `response_date` values corresponding to the actual future dates (e.g. Day `N+1` is birth date + `N+1` days). Is this calendar mapping acceptable?
>
> **2. Interactive Forms Layout**:
> Do you prefer daily questionnaire questions to be rendered as separate sequential slides (like a wizard) or grouped in a single scrollable form sheet? We recommend a single scrollable sheet to reduce the mother's interaction fatigue.

---

## 🔬 Verification Plan

### Automated Build Verification
- Execute `npm run build` to verify Next.js static/dynamic pre-render modules compile cleanly.

### Manual Routing Validation
- Log in as a mother and view the `/dashboard` to check the timezone calculations.
- Submit `"tidak"` for Day 1 and verify Day 2 remains pending.
- Submit `"ya"` for Day 2 (milestone achieved) and verify that Days 3 through 7 are automatically populated with `"ya"` and marked with `auto_filled: true` in the history dashboard.
