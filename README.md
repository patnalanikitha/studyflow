# 🎓 StudyFlow OS — AI Academic Companion & Pixel Focus Studio

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **StudyFlow OS** is an all-in-one student productivity and learning operating system engineered with modern web technologies. It combines algorithmic memory retention (**SuperMemo SM-2 Spaced Repetition**), generative AI assistance (**Google Gemini 1.5**), and a **whimsical, cozy retro-pixel Focus Studio** with procedural sound synthesis.

---

## 🌟 Core Feature Highlights

### 1. 👾 Whimsical & Cute Pixel Focus Studio
- **Animated Pixel Pet Companion**: Choose between Mochi the Cat, Barnaby the Bear, or Pip the Bunny. Your companion actively types on a glowing laptop when you study, takes cozy naps when on break, and celebrates your study streaks!
- **Pixel Customization Shop**: Earn study coins (`🪙`) by completing Pomodoros or reviewing flashcards to equip graduation caps, pink lo-fi headphones, arcane wizard hats, and lucky sprouts!
- **Procedural Ambient Soundscapes**: 100% self-contained ambient sound synthesis using the native browser **Web Audio API** (no external audio files, no broken CDNs):
  - 🌧️ **Pink Rain & Drizzle** (Biquad lowpass/bandpass noise filters)
  - ☕ **Lo-Fi Brown Noise** (Deep cozy focus frequency)
  - 🥐 **Cafe Ambiance** (Resonant dual-filtered murmur)
  - 🧠 **10Hz Alpha Waves** (Binaural stereo panned focus pulses)
  - 🌙 **Night Crickets** (LFO modulated sine pulse generator)
  - 🕹️ **8-bit Chiptune SFX** (Coin drops, card flips, and victory arpeggios)

### 2. 🗂️ SuperMemo SM-2 Spaced Repetition Engine
- Full implementation of the algorithmic formula used in **Anki**:
  $$EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$
- 3D perspective card flip animations with tactile feedback.
- Keyboard shortcuts: <kbd>Space</kbd> to flip, <kbd>1</kbd> Again, <kbd>2</kbd> Hard, <kbd>3</kbd> Good, <kbd>4</kbd> Easy.
- Export decks directly to **Anki-compatible TSV/CSV format** or full JSON backups.

### 3. ✨ Gemini-Powered Note Synthesizer & Practice Quizzes
- **Note-to-Cards**: Paste raw lecture notes or PDF text to instantly synthesize high-yield, conceptual active recall flashcards.
- **AI Quiz Engine**: Generate custom multi-choice exams on any topic and difficulty level with step-by-step answer explanations and scoring.
- **Zero-Config Intelligent Fallback**: Automatically provides high-fidelity simulated generation if no API key is provided, allowing instant demonstration out of the box!

### 4. 🎓 Socratic AI Homework & Concept Tutor
- Encouraging academic mentor that guides students using the Socratic method rather than giving answers away.
- Encourages first-principles thinking, provides guided hints, and breaks complex proofs into approachable steps.

### 5. 📅 Exam Revision Milestones Planner
- Track countdown days to critical finals and midterms.
- Break down study syllabi into prioritized, weighted topic checklists.

### 6. 📊 GitHub-Style Study Activity Heatmap & Analytics
- Visual 60-day study consistency graph, retention rate tracking, and time distribution metrics.

---

## 🏗️ Architecture & Project Structure

```
studyflow/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD deployment pipeline for GitHub Pages
├── src/
│   ├── types/
│   │   └── index.ts              # Strict TypeScript domain interfaces
│   ├── lib/
│   │   ├── sm2.ts                # SuperMemo SM-2 algorithm & interval math
│   │   ├── soundEngine.ts        # Procedural Web Audio API sound synthesizer
│   │   ├── gemini.ts             # Google Gemini API & offline fallback mock
│   │   └── storage.ts            # Persistent storage, seed data & Anki export
│   ├── context/
│   │   └── StudyContext.tsx      # Global state, gamification & theme engine
│   └── components/
│       ├── layout/               # Navbar, Sidebar, and API configuration modal
│       ├── focus/                # Pixel Pet canvas & retro Pomodoro studio
│       ├── flashcards/           # 3D card flips, SM-2 study & AI note synthesizer
│       ├── quiz/                 # Interactive quiz runner & AI test maker
│       ├── tutor/                # Socratic AI chat assistant
│       ├── planner/              # Exam countdown & milestone tracker
│       └── analytics/            # GitHub study heatmap & backup utilities
├── index.html                    # Fonts: Plus Jakarta Sans, Press Start 2P, VT323
├── tailwind.config.js            # Custom retro pixel shadows & pastel theme
├── package.json
└── vite.config.ts
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `pnpm`

### Installation
```bash
# 1. Clone this repository
git clone https://github.com/your-username/studyflow.git

# 2. Navigate to project directory
cd studyflow

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser!

### Build for Production
```bash
npm run build
```
The optimized static build will be placed in the `dist/` directory, ready to deploy to GitHub Pages, Vercel, or Netlify.

---

## 🔑 Optional Gemini API Configuration
StudyFlow works immediately offline with built-in mock knowledge banks. To activate live generation with your own Google Gemini API key:
1. Click the **"Gemini Key"** button in the top navigation bar.
2. Enter your API key (get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)).
3. Keys are stored solely in your local browser storage (`localStorage`) and never leave your machine.

---

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
