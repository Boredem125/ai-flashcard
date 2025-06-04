// This is an AI-powered flashcards system designed to help users study smarter and more interactively.
// The platform allows users to upload PDFs, PPTs, or simply enter a topic, and then uses advanced language models via the OpenRouter API to automatically generate dynamic, interactive flashcards.
// Whether it's for exam prep, concept revision, or quick reviews, the system adapts to the content and presents it in a digestible, quiz-like format—making knowledge retention both effective and enjoyable.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlashcardSchema = z.object({
  front: z.string().describe('The question or concept on the front of the flashcard.'),
  back: z.string().describe('The answer or explanation on the back of the flashcard.'),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;

const DynamicallyAdaptFlashcardPresentationInputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('The array of flashcards to present to the user.'),
  userPerformance: z
    .array(z.object({flashcardIndex: z.number(), correct: z.boolean()}))
    .optional()
    .describe('The user performance on previous flashcards, if any.'),
});

export type DynamicallyAdaptFlashcardPresentationInput =
  z.infer<typeof DynamicallyAdaptFlashcardPresentationInputSchema>;

const DynamicallyAdaptFlashcardPresentationOutputSchema = z.array(FlashcardSchema).describe(
  'The flashcards, reordered based on user performance, with the most difficult flashcards presented first.'
);

export type DynamicallyAdaptFlashcardPresentationOutput =
  z.infer<typeof DynamicallyAdaptFlashcardPresentationOutputSchema>;

export async function dynamicallyAdaptFlashcardPresentation(
  input: DynamicallyAdaptFlashcardPresentationInput
): Promise<DynamicallyAdaptFlashcardPresentationOutput> {
  return dynamicallyAdaptFlashcardPresentationFlow(input);
}

const dynamicallyAdaptFlashcardPresentationPrompt = ai.definePrompt({
  name: 'dynamicallyAdaptFlashcardPresentationPrompt',
  input: {schema: DynamicallyAdaptFlashcardPresentationInputSchema},
  output: {schema: DynamicallyAdaptFlashcardPresentationOutputSchema},
  prompt: `You are an AI that reorders flashcards based on user performance.

        The goal is to present the flashcards in an order that maximizes learning by focusing on areas where the user is struggling.

        If there is no user performance data, return the flashcards in their original order.

        If there is user performance data, reorder the flashcards so that the flashcards the user has answered incorrectly more often are presented earlier.

        Here are the flashcards:
        {{#each flashcards}}
        Flashcard {{@index}}:
        Front: {{{front}}}
        Back: {{{back}}}
        {{/each}}

        {{#if userPerformance}}
        Here is the user performance data:
        {{#each userPerformance}}
        Flashcard Index: {{{flashcardIndex}}}, Correct: {{{correct}}}
        {{/each}}
        {{/if}}

        Return the flashcards in the optimal order for learning.
        Output the flashcards as JSON.  Do not include any explanation or other text.

        The output should be in the form of a JSON array of flashcard objects, where each object has a front and back property.

        For example:
        [
          {
            "front": "What is the capital of France?",
            "back": "Paris"
          },
          {
            "front": "What is the highest mountain in the world?",
            "back": "Mount Everest"
          }
        ]
        `,
});

const dynamicallyAdaptFlashcardPresentationFlow = ai.defineFlow(
  {
    name: 'dynamicallyAdaptFlashcardPresentationFlow',
    inputSchema: DynamicallyAdaptFlashcardPresentationInputSchema,
    outputSchema: DynamicallyAdaptFlashcardPresentationOutputSchema,
  },
  async input => {
    const {output} = await dynamicallyAdaptFlashcardPresentationPrompt(input);
    return output!;
  }
);
