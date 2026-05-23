# Implementation Plan: Daily Breastfeeding Tracking Engine (Phase 3)

We will now implement the core functional core of **asiTrack**: the **Daily Breastfeeding Tracking Engine**. This phase translates maternal clinical logic into a highly automated, supportive, and resilient calendar checking system. 

It calculates lactation days index (`hari_ke`) under WIB timezone enforcement, handles out-of-order daily card backfilling, and implements the smart milestone auto-fill mechanism (completing days up to 7 with "ya" if the mother's primary milestone question "Apakah ASI sudah keluar?" is answered "ya").

---

## 🎯 Phase 3 Goals

1. **Precision WIB Tracking Engine**: Build robust server and client timezone-aware date calculations so that day boundaries align perfectly with Asia/Jakarta time (UTC+7), preventing timezone drift or "skipped/future" days.
2. **Flexible Backfilling**: Allow postnatal mothers to backfill missed tracking days out-of-order via separate dashboard card cues.
3. **Lactation Milestone Automation**: Auto-complete remaining days up to Day 7 when the primary question is answered "ya", transitioning the dashboard to a supportive celebration view.
4. **Comprehensive UI Forms & Timeline**: Design beautiful, modern mobile components for form checking (`/form`), active/past tracking timelines, and a review log (`/form/history`).

---

## 📐 1. WIB Timezone & Calendar Logic

To enforce **WIB (Asia/Jakarta)** calculations:
* **Day 1 definition**: The day **after** childbirth date (`tgl_melahirkan`). E.g. born May 21 WIB ➡️ May 22 WIB is Day 1 of tracking.
* **Storing dates**: The delivery date (`tgl_melahirkan`) and all daily `response_date` values are stored in MongoDB normalized to **start of day in WIB** (e.g. `2026-05-21T00:00:00+07:00`).
* **Day index calculation**:
  ```typescript
  import { utcToZonedTime } from 'date-fns-tz';
  import { differenceInDays, startOfDay } from 'date-fns';

  const TIMEZONE = "Asia/Jakarta";
  const todayWIB = startOfDay(utcToZonedTime(new Date(), TIMEZONE));
  const birthWIB = startOfDay(utcToZonedTime(user.tgl_melahirkan, TIMEZONE));
  const currentHariKe = differenceInDays(todayWIB, birthWIB);
  ```

---

## 🗄️ 2. Proposed REST API Endpoints

### Endpoint A: `GET /api/responses/state`
Resolves the user's tracking schedule, checking what forms are unanswered or completed.

* **Security**: Role `"user"` check.
* **Logic**:
  1. Calculate `currentHariKe`.
  2. Query all existing `Response` documents for this user in the range `hari_ke` 1 to 7.
  3. Check if the user has answered `"ya"` to the **Primary Question** on *any* day `N <= 7`. If yes, mark the entire program as **completed** (milestone achieved).
  4. Fetch active questions from `questions` collection.
  5. Identify missing tracking days in the range `[1, min(currentHariKe, 7)]` that have no answers recorded.
* **Response payload**:
  ```json
  {
    "status": "success",
    "currentHariKe": 3,
    "completed": false,
    "milestoneDay": null,
    "pendingDays": [2, 3],
    "questions": [
      { "_id": "...", "pertanyaan": "Apakah ASI sudah keluar?", "tipe": "yes_no", "is_primary": true }
    ],
    "history": [
      { "hari_ke": 1, "answers": [{ "question_id": "...", "jawaban": "tidak", "auto_filled": false }] }
    ]
  }
  ```

### Endpoint B: `POST /api/responses`
Receives questionnaire answers for a specific `hari_ke` and performs automation checks.

* **Payload**:
  ```json
  {
    "hari_ke": 2,
    "answers": [
      { "question_id": "60a8f9024f90bf70d880cb12", "jawaban": "ya" }
    ]
  }
  ```
* **Logic**:
  1. Validate that the targeted `hari_ke` satisfies: `1 <= hari_ke <= min(currentHariKe, 7)`.
  2. Compute `response_date = addDays(birthWIB, hari_ke)`.
  3. Check for duplicates in DB. If exists, overwrite (ensures idempotency).
  4. Save answers to `responses` collection.
  5. **Auto-Fill Milestone Check**:
     * If the answered question is the **Primary Question** (`is_primary: true`) and the answer is `"ya"`:
       * Trigger the backfill automation: for all remaining days `D` from `hari_ke + 1` to `7`, write a response for the primary question with `jawaban: "ya"`, `auto_filled: true`, and the corresponding `response_date`.
  6. Return success status and trigger UI revalidation.

---

## 🛠️ Proposed Changes

### Database & APIs
#### [NEW] [route.ts](file:///d:/Walaho/asiTrack/src/app/api/responses/state/route.ts)
- Computes `hari_ke` relative to the logged-in user's childbirth date. Retrieves response histories and resolves pending tracking days.

#### [NEW] [route.ts](file:///d:/Walaho/asiTrack/src/app/api/responses/route.ts)
- Receives daily answers, enforces unique keys, and implements the **Primary Question Auto-Fill** laktasi milestone cascade.

---

### UI/UX Client Components

#### [MODIFY] [page.tsx](file:///d:/Walaho/asiTrack/src/app/%28user%29/dashboard/page.tsx)
- Connects to `/api/responses/state` with live loaders.
- Displays a prominent welcome, dynamic 7-day laktasi timeline with interactive badges, and:
  * **Celebrate Case**: If milestone is completed, render a premium glassmorphic congratulations card ("ASI Bunda Sudah Lancar!") with warm, supportive Indonesian notes.
  * **Fill Case**: If today is active and pending, show a clean, micro-animated daily form widget with soft violet styles.
  * **Upcoming Case**: If today is completed but next day is not active yet (future), display a countdown or encouragement card.

#### [NEW] [page.tsx](file:///d:/Walaho/asiTrack/src/app/%28user%29/form/page.tsx)
- Mobile-first interactive portal.
- Displays beautiful individual card items for each **Pending Day** (backfill support). 
- Mothers can click any card (e.g. "Lengkapi Hari ke-2") to expand a modal questionnaire to record answers out-of-order.

#### [NEW] [page.tsx](file:///d:/Walaho/asiTrack/src/app/%28user%29/form/history/page.tsx)
- History log displaying 7-day entries.
- Clearly separates filled vs auto-filled badges using beautiful colors (e.g. green for filled, soft purple/gold for auto-filled milestones).

---

## 📐 Open Questions & Decisions for Review

> [!NOTE]
> **1. Handling Overwrites on Backfill:**
> If a mother previously backfilled Day 3 with `"tidak"`, but on Day 2 she submits `"ya"` (which triggers the auto-fill of days 3-7 to `"ya"`), we will overwrite Day 3's primary question to `"ya"` to reflect that lactogenesis was achieved and continues. Is this cascade correct? (Our default implementation: Yes, milestone achieved overwrites subsequent days to ensure consistency).
>
> **2. Completion Screen Options:**
> Once completed, the mother will no longer see questionnaire forms. Do you agree that they should see their full historical log, educational articles, and short therapy/relaxation videos instead?

---

## 🔬 Verification Plan

### Automated Verification
* **Type-safety check**: Run `npm run build` to verify proper interface types for responses, users, and mongoose queries.
* **Idempotence & Constraint testing**: Submit the same form multiple times to verify Mongoose compounds on `{ user_id, question_id, response_date }` update correctly rather than producing duplicate index crashes.

### Manual Verification
* **Normal Signup Tracking**:
  * Set `tgl_melahirkan` to yesterday. Verify that the dashboard computes `currentHariKe = 1`.
  * Answer `"tidak"` to the primary question. Verify that Day 1 shows as completed, and Day 2 remains locked.
* **Milestone Auto-Fill Tracking**:
  * Submit `"ya"` for Day 1.
  * Verify that Day 1 is saved, and Days 2-7 are immediately written with `"ya"` and `auto_filled: true`.
  * Open `/form/history` to verify all 7 days show successful badge logs.
