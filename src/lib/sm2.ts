import { CardReviewRating, Flashcard } from '../types';

/**
 * Implements the SuperMemo SM-2 Spaced Repetition Algorithm.
 * Standard formula used in modern learning platforms like Anki.
 */
export interface SM2Result {
  interval: number;
  repetitions: number;
  easeFactor: number;
  dueDate: string;
  state: 'learning' | 'review';
}

export function calculateSM2(
  card: Pick<Flashcard, 'interval' | 'repetitions' | 'easeFactor'>,
  rating: CardReviewRating
): SM2Result {
  let { interval, repetitions, easeFactor } = card;

  // Grade < 3 means incorrect response (fail)
  if (rating < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Calculate new Ease Factor (EF')
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const q = rating;
  const newEaseFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  
  // Ease factor minimum bound is 1.3
  easeFactor = Math.max(1.3, Number(newEaseFactor.toFixed(2)));

  // Calculate new due date
  const now = new Date();
  const nextDueDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    interval,
    repetitions,
    easeFactor,
    dueDate: nextDueDate.toISOString(),
    state: repetitions > 2 ? 'review' : 'learning',
  };
}

/**
 * Formats review interval into human readable label like '1d', '6d', '2mo'
 */
export function formatInterval(days: number): string {
  if (days <= 1) return '1 day';
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)} mo`;
  return `${(days / 365).toFixed(1)} yr`;
}

/**
 * Check if a card is due for review today or overdue
 */
export function isCardDue(card: Flashcard): boolean {
  if (!card.dueDate) return true;
  const due = new Date(card.dueDate);
  const now = new Date();
  return due <= now;
}
