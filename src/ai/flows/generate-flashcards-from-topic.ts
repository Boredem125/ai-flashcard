// 'use server';

/**
 * @fileOverview Generates flashcards from a given topic.
 *
 * - generateFlashcardsFromTopic - A function that generates flashcards from a given topic.
 * - GenerateFlashcardsFromTopicInput - The input type for the generateFlashcardsFromTopic function.
 * - GenerateFlashcardsFromTopicOutput - The return type for the generateFlashcardsFromTopic function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsFromTopicInputSchema = z.object({
  topic: z.string().describe('The topic to generate flashcards for.'),
  numberOfFlashcards: z
    .number()
    .default(5)
    .describe('The number of flashcards to generate.'),
});

export type GenerateFlashcardsFromTopicInput = z.infer<
  typeof GenerateFlashcardsFromTopicInputSchema
>;

const FlashcardSchema = z.object({
  question: z.string().describe('The question for the flashcard.'),
  answer: z.string().describe('The answer to the question.'),
});

const GenerateFlashcardsFromTopicOutputSchema = z.array(FlashcardSchema);

export type GenerateFlashcardsFromTopicOutput = z.infer<
  typeof GenerateFlashcardsFromTopicOutputSchema
>;

export async function generateFlashcardsFromTopic(
  input: GenerateFlashcardsFromTopicInput
): Promise<GenerateFlashcardsFromTopicOutput> {
  return generateFlashcardsFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsFromTopicPrompt',
  input: {
    schema: GenerateFlashcardsFromTopicInputSchema,
  },
  output: {
    schema: GenerateFlashcardsFromTopicOutputSchema,
  },
  prompt: `You are an expert at creating flashcards. Generate {{numberOfFlashcards}} flashcards on the topic of {{{topic}}}. Each flashcard should have a question and an answer. The output should be a JSON array of flashcards, where each flashcard has a question and an answer field.`,
});

const generateFlashcardsFromTopicFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFromTopicFlow',
    inputSchema: GenerateFlashcardsFromTopicInputSchema,
    outputSchema: GenerateFlashcardsFromTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
