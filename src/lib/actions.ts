'use server';

import { generateFlashcardsFromDocument as genkiGenerateFlashcardsFromDocument } from '@/ai/flows/generate-flashcards-from-document';
import { generateFlashcardsFromTopic as genkiGenerateFlashcardsFromTopic } from '@/ai/flows/generate-flashcards-from-topic';
import { dynamicallyAdaptFlashcardPresentation as genkiDynamicallyAdaptFlashcardPresentation } from '@/ai/flows/dynamically-adapt-flashcard-presentation';
import type { Flashcard, AIQuestionAnswerFlashcard, AIFrontBackFlashcard } from './types';
import type { DynamicallyAdaptFlashcardPresentationInput } from '@/ai/flows/dynamically-adapt-flashcard-presentation';


export async function generateFlashcardsFromTopicAction(topic: string, numberOfFlashcards: number): Promise<Flashcard[]> {
  try {
    const result: AIQuestionAnswerFlashcard[] = await genkiGenerateFlashcardsFromTopic({ topic, numberOfFlashcards });
    // Standardize to Flashcard type
    return result.map(card => ({ front: card.question, back: card.answer }));
  } catch (error) {
    console.error("Error generating flashcards from topic:", error);
    throw new Error("Failed to generate flashcards from topic.");
  }
}

export async function generateFlashcardsFromFileAction(documentDataUri: string): Promise<Flashcard[]> {
  try {
    const result = await genkiGenerateFlashcardsFromDocument({ documentDataUri });
    // Output is already { flashcards: [{ front: string, back: string }] }
    // but genkiGenerateFlashcardsFromDocument returns an object with a flashcards property
    return result.flashcards;
  } catch (error)
   {
    console.error("Error generating flashcards from file:", error);
    throw new Error("Failed to generate flashcards from file.");
  }
}

export async function getAdaptedFlashcardsAction(
  flashcards: Flashcard[],
  userPerformance: DynamicallyAdaptFlashcardPresentationInput['userPerformance']
): Promise<Flashcard[]> {
  try {
    const result = await genkiDynamicallyAdaptFlashcardPresentation({ flashcards, userPerformance });
    return result; // Already in Flashcard[] format
  } catch (error) {
    console.error("Error adapting flashcard presentation:", error);
    throw new Error("Failed to adapt flashcard presentation.");
  }
}
