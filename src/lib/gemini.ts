import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuizQuestion } from '../types';

const API_KEY_STORAGE_KEY = 'studyflow_gemini_api_key';

export function getStoredApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export function saveStoredApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
}

export function hasApiKey(): boolean {
  return !!getStoredApiKey();
}

/**
 * Helper to get Gemini model or null if no key
 */
function getGeminiModel(modelName: string = 'gemini-1.5-flash') {
  const apiKey = getStoredApiKey();
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generate Flashcards from raw student lecture notes or text
 */
export async function generateFlashcardsFromNotes(
  notes: string,
  count: number = 5
): Promise<{ front: string; back: string; tags: string[] }[]> {
  const model = getGeminiModel();

  if (!model) {
    // High-quality offline simulated flashcards if no API key is provided
    return simulateFlashcardGeneration(notes, count);
  }

  const prompt = `You are an expert tutor creating active recall flashcards for students.
Analyze the following study notes and extract exactly ${count} high-yield, conceptual flashcards.
Format your output strictly as a JSON array of objects with keys: "front" (concise question/prompt), "back" (clear explanation/answer), and "tags" (array of 1-2 category strings).
Do NOT include markdown formatting or backticks around the JSON. Output raw JSON only.

STUDY NOTES:
${notes.slice(0, 3000)}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn('Gemini API call failed, falling back to simulated generation:', error);
    return simulateFlashcardGeneration(notes, count);
  }
}

/**
 * Generate a practice quiz with questions, options, correct answers, and explanations
 */
export async function generateQuizFromTopic(
  topic: string,
  count: number = 4,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<QuizQuestion[]> {
  const model = getGeminiModel();

  if (!model) {
    return simulateQuizGeneration(topic, count, difficulty);
  }

  const prompt = `You are an academic test maker. Generate ${count} multiple choice questions on the topic "${topic}" at ${difficulty} difficulty.
Return STRICTLY a JSON array of objects where each object has:
- "id": string unique id
- "question": string
- "options": array of 4 distinct string choices
- "correctOptionIndex": integer 0-3 corresponding to the correct answer
- "explanation": string explaining why the answer is correct and why other choices are wrong
- "difficulty": "${difficulty}"

Do NOT wrap in markdown backticks or commentary. Only raw valid JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn('Gemini quiz generation failed, fallback applied:', error);
    return simulateQuizGeneration(topic, count, difficulty);
  }
}

/**
 * Socratic AI Tutor: Guides the student step by step rather than just providing the direct solution
 */
export async function askSocraticTutor(
  messages: { role: 'user' | 'assistant'; content: string }[],
  subject: string = 'General Academic'
): Promise<string> {
  const model = getGeminiModel();

  if (!model) {
    const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
    return simulateTutorResponse(lastUserMsg, subject);
  }

  const systemInstruction = `You are a warm, encouraging Socratic Academic Tutor specialized in ${subject}.
Rules:
1. NEVER just dump the final answer unless the student has walked through the reasoning with you.
2. Ask probing, thoughtful questions that guide them to discover the answer themselves.
3. Keep responses structured, concise (2-4 paragraphs max), and supportive.
4. Format equations in LaTeX or clear markdown when helpful.`;

  try {
    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
    });

    const latest = messages[messages.length - 1];
    const result = await chat.sendMessage(latest.content);
    return result.response.text();
  } catch (error) {
    console.warn('Gemini tutor chat failed, fallback response applied:', error);
    return simulateTutorResponse(messages[messages.length - 1]?.content || '', subject);
  }
}

/* Offline intelligent mock generators for zero-config demoing */

function simulateFlashcardGeneration(notes: string, count: number) {
  const sampleDecks = [
    {
      front: 'What is the primary mechanism of Spaced Repetition (SM-2)?',
      back: 'It schedules reviews at expanding intervals based on active recall difficulty, preventing forgetting by combating the Ebbinghaus Forgetting Curve.',
      tags: ['Cognitive Science', 'Study OS'],
    },
    {
      front: 'How does Active Recall differ from Passive Re-reading?',
      back: 'Active recall forces the brain to retrieve information from memory without cues, strengthening neural synaptic pathways significantly more than passive scanning.',
      tags: ['Neuroscience', 'Study Skills'],
    },
    {
      front: 'What role does the Ease Factor (EF) play in SM-2?',
      back: 'The Ease Factor modulates how quickly review intervals multiply. Harder cards have a lower EF (minimum 1.3), resulting in more frequent reviews.',
      tags: ['Algorithms', 'SM-2'],
    },
    {
      front: 'What is the Pomodoro technique interval structure?',
      back: '25 minutes of undivided focus followed by a 5-minute restorative break, with a longer 15-30 minute break after four completed cycles.',
      tags: ['Focus', 'Productivity'],
    },
    {
      front: 'What is the Feynman Technique for deep comprehension?',
      back: '1. Choose concept, 2. Teach it to a 10-year-old in plain language, 3. Identify knowledge gaps, 4. Review source material and simplify further.',
      tags: ['Learning Methods'],
    },
    {
      front: `Key takeaway from notes: "${notes.slice(0, 40).trim()}..."`,
      back: 'Core concept synthesised into an active memory recall anchor.',
      tags: ['Lecture Notes'],
    }
  ];

  return sampleDecks.slice(0, count);
}

function simulateQuizGeneration(topic: string, count: number, difficulty: 'easy' | 'medium' | 'hard'): QuizQuestion[] {
  const bank: QuizQuestion[] = [
    {
      id: 'q-demo-1',
      question: `Regarding ${topic}: Which principle best explains why spaced practice outperforms massed cramming?`,
      options: [
        'The Spacing Effect & Memory Consolidation during sleep',
        'Cognitive Overload Theory',
        'Passive Rehearsal Advantage',
        'Retroactive Interference Inhibition',
      ],
      correctOptionIndex: 0,
      explanation: 'The Spacing Effect demonstrates that distributed study intervals trigger memory reconsolidation and deeper retrieval paths.',
      difficulty,
    },
    {
      id: 'q-demo-2',
      question: `In study systems, what happens to the SM-2 interval when a card is graded as "Again" (Rating < 3)?`,
      options: [
        'The interval doubles',
        'The interval resets to 1 day and repetitions reset to 0',
        'The interval remains unchanged',
        'The card is permanently archived',
      ],
      correctOptionIndex: 1,
      explanation: 'When recall fails (grade < 3), the card is treated as forgotten: interval resets to 1 day to re-enter the learning phase.',
      difficulty,
    },
    {
      id: 'q-demo-3',
      question: `Which brainwave frequency band is classically associated with deep flow state and relaxed focus?`,
      options: [
        'Delta (0.5 - 4 Hz)',
        'Theta (4 - 8 Hz)',
        'Alpha (8 - 12 Hz)',
        'High Beta (20 - 30 Hz)',
      ],
      correctOptionIndex: 2,
      explanation: 'Alpha waves (8-12 Hz) characterize relaxed mental clarity, effortless concentration, and diminished anxiety.',
      difficulty,
    },
    {
      id: 'q-demo-4',
      question: `When structuring a multi-week revision plan for exams, what is the best strategy for difficult topics?`,
      options: [
        'Leave them until the final night for fresh recall',
        'Front-load them early with frequent spaced mini-sessions',
        'Skip them entirely to focus on high-confidence subjects',
        'Only read lecture slides passively',
      ],
      correctOptionIndex: 1,
      explanation: 'Tougher concepts require multiple sleep cycles and iterative reconsolidations to form durable understanding.',
      difficulty,
    }
  ];

  return bank.slice(0, count);
}

function simulateTutorResponse(query: string, subject: string): string {
  if (query.includes('hello') || query.includes('hi') || query.length < 5) {
    return `Hello! I'm your Socratic Study Companion for **${subject}**. 🎓\n\nWhat topic or problem are we exploring today? Tell me what you're working on and what you've tried so far!`;
  }

  return `That's a great question about **${subject}**! 

Let's break this down together step-by-step:

1. **What do we know?** You mentioned: *"${query.slice(0, 80)}"*.
2. **First principle:** Before jumping directly to a calculation or formula, what is the underlying definition or rule at play here?

*Think about this:* If you had to explain the very first step of this problem in your own words, what would you start with?`;
}
