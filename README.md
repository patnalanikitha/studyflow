# StudyFlow OS — Academic Companion & Pixel Focus Studio

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Welcome to StudyFlow OS, a cozy digital sanctuary designed for scholars, thinkers, and lifelong learners. Where retro pixel art warmth meets algorithmic rigor, active recall meets procedural soundscapes, and study sessions feel like quiet rainy afternoons with an encouraging companion.

---

## Whimsical Feature Highlights

### 1. The Cozy Pixel Focus Studio
- **Animated Companions**: Choose between Mochi the Cat, Barnaby the Bear, or Pip the Bunny. Your desk companion wiggles their ears, types alongside you on a glowing screen during deep focus, sips warm tea with gentle drifting snoozes on break, and celebrates every milestone.
- **The Pixel Wardrobe & Trinket Shop**: Earn study coins by reviewing flashcards and completing Pomodoros. Unlock whimsical accessories including tiny graduation caps, pink lo-fi headphones, arcane wizard hats, and lucky clover sprouts.
- **Procedural Soundscapes Synthesized from Pure Math**: 100% self-contained ambient sound engine crafted entirely through the browser Web Audio API — zero external audio files, zero streaming dependencies:
  - *Gentle Window Drizzle*: Pink noise biquad-filtered into soft drops
  - *Warm Brown Noise*: Deep soothing low-frequency rumble
  - *Old Library Murmur*: Resonant dual-band murmur of quiet spaces
  - *Ten-Hertz Alpha Waves*: Stereo-panned binaural focus pulses
  - *Starlight Crickets*: Low-frequency modulated nocturnal chirps
  - *Eight-Bit Victory Chimes*: Retro coin chimes, card flips, and level-up arpeggios

### 2. SuperMemo SM-2 Spaced Repetition Engine
- **Memory Preservation by Design**: A faithful implementation of the SuperMemo SM-2 interval expansion algorithm:
  $$EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$
- **Tactile Card Laboratory**: Three-dimensional perspective flips with responsive keyboard navigation (<kbd>Space</kbd> to flip, <kbd>1</kbd> to <kbd>4</kbd> to grade recall).
- **Anki Interoperability**: Export card decks directly into Anki-compatible TSV/CSV format or export complete JSON backups anytime.

### 3. Note Synthesizer & Practice Exam Forge
- **Notes into Memory Crystals**: Feed raw lecture paragraphs, textbook passages, or syllabi into the AI synthesizer to generate high-yield active recall flashcard pairs.
- **Interactive Practice Quizzes**: Generate multi-choice challenge exams on any topic and difficulty level, complete with instant tactile feedback, score tallies, and in-depth conceptual explanations.
- **Zero-Config Intelligent Fallback**: Pre-seeded with rich offline knowledge banks, ensuring the app works smoothly out of the box without requiring external API keys.

### 4. Socratic AI Homework & Concept Tutor
- A patient, thoughtful academic guide that never simply spoils the answer.
- Uses guiding questions, thought experiments, and step-by-step hints to help you deduce foundational principles yourself.

### 5. Exam Milestone & Syllabus Planner
- Keep track of countdown days until finals and midterms.
- Break hefty syllabi into prioritized, difficulty-weighted milestone checklists.

### 6. Study Consistency Heatmap & Analytics
- A sixty-day activity heatmap celebrating daily consistency, long-term memory retention rates, and total focus hours.

---

## Architecture & Project Structure

```
studyflow/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD deployment pipeline for GitHub Pages
├── src/
│   ├── types/
│   │   └── index.ts              # Domain interfaces and type specifications
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
│       └── analytics/            # Study heatmap & backup utilities
├── index.html                    # Fonts: Plus Jakarta Sans, Press Start 2P, VT323
├── tailwind.config.js            # Retro pixel drop-shadows & pastel palette
├── package.json
└── vite.config.ts
```

---

## Quick Start & Local Setup

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or pnpm

### Installation
```bash
# 1. Clone this repository
git clone https://github.com/patnalanikitha/studyflow.git

# 2. Navigate to project directory
cd studyflow

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production
```bash
npm run build
```
The optimized static build will be placed in the `dist/` directory, ready to deploy to GitHub Pages, Vercel, or Netlify.

---

## Optional Gemini API Configuration
StudyFlow works immediately offline with built-in mock knowledge banks. To activate live generation with your own Google Gemini API key:
1. Click the **"Gemini Key"** button in the top navigation bar.
2. Enter your API key (available from Google AI Studio).
3. Keys are stored strictly in your browser local storage and never leave your machine.

---

## License
This project is open source and distributed under the [MIT License](LICENSE).
