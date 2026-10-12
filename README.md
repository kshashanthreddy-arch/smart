# Smart Study Management System (SmartStudy OS)

An intelligent, full-stack Academic Study & Performance Management Platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **SQLite with Prisma ORM**.

---

## 🌟 Core Features & Modules

### 1. 📊 Centralized Command Dashboard
- **Academic KPI Cards**: Real-time display of **Target GPA (3.85 / 4.00)**, **Daily Study Streak (5 Days)**, **Focus Hours This Week**, and **Pending Assignments**.
- **Interactive Weekly Effort Chart**: Visual distribution of daily study minutes (Monday – Sunday) with hover stats.
- **Subject Distribution**: Color-coded progress tracking for focus hours across enrolled subjects.
- **Urgent Deadlines Tracker**: Ranked task urgency list with one-click status toggle.
- **Quick Action Hub**: Instant shortcuts to launch AI tools, start Pomodoro intervals, and review flashcard decks.

### 2. 🤖 AI Study Assistant Suite (`/ai-tools`)
- **Smart Note Summarizer**:
  - Automatically synthesizes long textbook chapters, lecture transcripts, and notes into executive summaries.
  - Generates bullet-point takeaways, key terminology with definitions, and high-yield exam traps.
  - One-click **"Save as Note"** and **"Create Flashcards from this"** pipelines.
  - Pre-loaded one-click sample buttons (DSA Graph Traversal & CNN Deep Learning).
- **Auto Flashcard Generator**:
  - Converts lecture text or syllabus topics into interactive spaced-repetition Q&A flashcards with difficulty ratings (`EASY`, `MEDIUM`, `HARD`).
  - One-click **"Save Deck to Library"** for persistent database storage.
- **Practice Quiz Assessment Builder**:
  - Auto-generates 4-option multiple choice questions with detailed explanations for every correct/incorrect option.
  - One-click **"Save & Take Quiz Now"**.
- **Dual AI Engine Architecture**:
  - Works **100% out-of-the-box** via built-in academic NLP heuristics (zero API key needed!).
  - Optional support for **Google Gemini 1.5/2.0 API** via header configuration or `.env.local`.

### 3. ⏱️ Interactive Pomodoro Focus Timer (`/pomodoro`)
- **Interval Timers**: 25-minute Deep Focus, 5-minute Short Break, and 15-minute Long Break intervals.
- **SVG Circular Countdown Animation**: Smooth circular progress indicator with digital display.
- **Course Time Attribution**: Select which enrolled course receives the logged study minutes.
- **Built-in Web Audio API Ambient Synthesizer**:
  - Generates gentle rain (🌧️), pink noise (🎧), 432Hz alpha focus tones (🧠), and ocean surf (🌊) natively in the browser without downloading any external audio files.
  - Custom volume slider and mute toggle.
- **Automated Logging**: Plays a gentle completion chime, records the completed session to the SQLite database, increments study streak, and triggers celebratory confetti.

### 4. 🃏 Spaced Repetition Flashcards (`/flashcards`)
- **Card Decks Overview**: Track total cards and mastery percentage per deck.
- **Interactive 3D Study Mode**:
  - Flip animation on click or Spacebar.
  - Keyboard navigation (Space to Flip, Left/Right arrows to navigate).
  - Rate recall with **"Got It! (Mastered)"** vs **"Still Learning (Review Again)"**.
  - Dynamic progress tracking and end-of-deck performance summary.

### 5. ❓ Practice Quizzes & Exam Simulator (`/quizzes`)
- **Interactive Assessment Player**:
  - Question-by-question stepper with real-time answer selection.
  - Submits answers to `/api/quizzes/[id]/submit` which calculates scores and awards study points.
  - Detailed answer review section revealing explanations for every option.
  - Confetti celebration upon achieving distinction (>= 70%).

### 6. 📚 Courses & 75% Attendance Compliance (`/courses`)
- **Course Management**: Course code, title, color tag, professor name, classroom/hall, and credit weighting.
- **75% Attendance Compliance Tracker**:
  - Calculates present vs total classes.
  - **Smart Advisory Engine**:
    - If attendance is safe: calculates exactly how many classes can be missed without dropping below 75%.
    - If attendance is below 75%: warns student and calculates how many consecutive classes must be attended to regain compliance.
  - Quick `+ Attended` and `+ Missed` live increment buttons.

### 7. 📝 Knowledge Base & Lecture Notes (`/notes`)
- **Instant Search & Course Filter**: Real-time searching across notes content, titles, and tags.
- **Rich Note Reader**: Formatted view with tags, dates, and course badges.
- **1-Click "Summarize with AI"**: Automatically triggers AI summary generation and stores it directly on the note record.

### 8. 📈 Analytics & GPA Simulator (`/analytics`)
- **Real-time Semester GPA Simulator**:
  - Dynamically adjust expected letter grades (`A+`, `A`, `A-`, `B+`, `B`, `C`, `F`) for each enrolled course.
  - Instantly computes credit-weighted cumulative GPA using standard 4.0 scale.
- **Habit Efficiency Breakdown**: Day-by-day effort tracking, subject time investment, and assessment averages.
- **Export / Print Report**: One-click printable academic report for academic progress reviews.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas-Confetti
- **Backend**: Next.js Route Handlers (`/api/*`)
- **Database & ORM**: SQLite (`prisma/dev.db`), Prisma ORM v6
- **Audio Engine**: Native Web Audio API (real-time noise & oscillator synthesis)
- **AI Processing**: Google Gemini API integration with smart built-in academic NLP heuristic engine fallback

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧪 Production Build Verification
To compile and test the optimized production build:
```bash
npm run build
npm run start
```
All routes are pre-compiled and statically/dynamically generated with zero warnings or errors.
