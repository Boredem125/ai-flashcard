export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: string;
  name: string;
  flashcards: Flashcard[];
  createdAt: string; // ISO date string
}

// For AI function outputs that might differ slightly
export interface AIQuestionAnswerFlashcard {
  question: string;
  answer: string;
}

export interface AIFrontBackFlashcard {
  front: string;
  back: string;
}
