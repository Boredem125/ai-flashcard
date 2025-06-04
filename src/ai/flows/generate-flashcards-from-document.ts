// 'use server';

/**
 * @fileOverview Generates flashcards from a user-uploaded document (PDF or PPT).
 *
 * - generateFlashcardsFromDocument - A function that generates flashcards from a document.
 * - GenerateFlashcardsFromDocumentInput - The input type for the generateFlashcardsFromDocument function.
 * - GenerateFlashcardsFromDocumentOutput - The return type for the generateFlashcardsFromDocument function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsFromDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document (PDF or PPT) to generate flashcards from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateFlashcardsFromDocumentInput = z.infer<typeof GenerateFlashcardsFromDocumentInputSchema>;

const GenerateFlashcardsFromDocumentOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z.string().describe('The content of the flashcard front.'),
      back: z.string().describe('The content of the flashcard back.'),
    })
  ).describe('The generated flashcards.'),
});
export type GenerateFlashcardsFromDocumentOutput = z.infer<typeof GenerateFlashcardsFromDocumentOutputSchema>;

export async function generateFlashcardsFromDocument(input: GenerateFlashcardsFromDocumentInput): Promise<GenerateFlashcardsFromDocumentOutput> {
  return generateFlashcardsFromDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsFromDocumentPrompt',
  input: {schema: GenerateFlashcardsFromDocumentInputSchema},
  output: {schema: GenerateFlashcardsFromDocumentOutputSchema},
  prompt: `You are an expert educator. Your task is to generate flashcards from the content of a document.

      The document will be passed to you as a data URI.

      Document: {{media url=documentDataUri}}

      Generate a set of flashcards that cover the key concepts and information from the document. Each flashcard should have a front and a back.

      Format your response as a JSON array of flashcard objects, each with a 'front' and 'back' field.

      Example:
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

const generateFlashcardsFromDocumentFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFromDocumentFlow',
    inputSchema: GenerateFlashcardsFromDocumentInputSchema,
    outputSchema: GenerateFlashcardsFromDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
