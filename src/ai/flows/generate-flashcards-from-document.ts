
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

const FlashcardObjectSchema = z.object({
  front: z.string().describe('The content of the flashcard front.'),
  back: z.string().describe('The content of the flashcard back.'),
});

const GenerateFlashcardsFromDocumentOutputSchema = z.array(FlashcardObjectSchema).describe('The generated flashcards as an array.');
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
      Ensure your entire response is *only* this JSON array. Do not include any other text or explanations outside of the JSON array itself.

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
  async (input) => {
    console.log('generateFlashcardsFromDocumentFlow input:', {
      documentDataUriLength: input.documentDataUri.length,
      documentDataUriStart: input.documentDataUri.substring(0, 100) + '...', // Log start to see MIME type etc.
    });

    const response = await prompt(input);
    // Using JSON.stringify to get a comprehensive view of the response object for debugging
    console.log('Genkit prompt response in generateFlashcardsFromDocumentFlow:', JSON.stringify(response, null, 2));

    if (response.error) {
      console.error('Genkit prompt error in generateFlashcardsFromDocumentFlow:', response.error);
      let errorMessage = `AI prompt failed during document processing.`;
      if (typeof response.error === 'string') {
        errorMessage += ` Details: ${response.error}`;
      } else if (response.error instanceof Error) {
        errorMessage += ` Details: ${response.error.message}`;
      } else {
        errorMessage += ` Details: ${JSON.stringify(response.error)}`;
      }
      throw new Error(errorMessage);
    }

    if (!response.output) {
      console.error('Genkit prompt in generateFlashcardsFromDocumentFlow returned no parsable output. The model might have returned an empty, malformed, or unparsable response, or refused to process the content.');
      // Additional logging of the raw response text if available and output is missing
      const rawText = response.candidates?.[0]?.message?.text;
      if (rawText) {
        console.error('Raw text from model (if available):', rawText);
      }
      throw new Error('AI failed to generate flashcards from the document. The model may have returned an empty, malformed, or unparsable response, or it might have refused to process the content.');
    }
    
    // Genkit automatically validates the output against the schema.
    // If response.output is populated, it means it has passed schema validation.
    return response.output;
  }
);
