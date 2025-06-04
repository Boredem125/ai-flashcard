import type { FlashcardSet, Flashcard } from './types';

const FLASHCARD_SETS_KEY = 'flashgenius_sets';

export const getSavedFlashcardSets = (): FlashcardSet[] => {
  if (typeof window === 'undefined') return [];
  const setsJson = localStorage.getItem(FLASHCARD_SETS_KEY);
  return setsJson ? JSON.parse(setsJson) : [];
};

export const getFlashcardSetById = (id: string): FlashcardSet | undefined => {
  const sets = getSavedFlashcardSets();
  return sets.find(set => set.id === id);
};

export const saveFlashcardSet = (set: FlashcardSet): void => {
  if (typeof window === 'undefined') return;
  const sets = getSavedFlashcardSets();
  const existingIndex = sets.findIndex(s => s.id === set.id);
  if (existingIndex > -1) {
    sets[existingIndex] = set;
  } else {
    sets.push(set);
  }
  localStorage.setItem(FLASHCARD_SETS_KEY, JSON.stringify(sets));
};

export const deleteFlashcardSet = (id: string): void => {
  if (typeof window === 'undefined') return;
  let sets = getSavedFlashcardSets();
  sets = sets.filter(set => set.id !== id);
  localStorage.setItem(FLASHCARD_SETS_KEY, JSON.stringify(sets));
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
