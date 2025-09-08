// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Image categorization AI agent.
 *
 * - categorizeUploadedImage - A function that categorizes an uploaded image.
 * - CategorizeUploadedImageInput - The input type for the categorizeUploadedImage function.
 * - CategorizeUploadedImageOutput - The return type for the categorizeUploadedImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeUploadedImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to categorize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type CategorizeUploadedImageInput = z.infer<
  typeof CategorizeUploadedImageInputSchema
>;

const CategorizeUploadedImageOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'The category of the image. Must be one of the provided valid categories.'
    ),
  confidence: z
    .number()
    .describe(
      'The confidence level of the categorization, from 0 to 1.  1 is highest confidence.'
    ),
});
export type CategorizeUploadedImageOutput = z.infer<
  typeof CategorizeUploadedImageOutputSchema
>;

export async function categorizeUploadedImage(
  input: CategorizeUploadedImageInput
): Promise<CategorizeUploadedImageOutput> {
  return categorizeUploadedImageFlow(input);
}

const validCategories = [
    "Garbage Dump / Overflowing Bins",
    "Garbage Vehicle Not Arrived",
    "Sweeping Not Done",
    "Illegal Dumping / Debris",
    "Dead Animal Removal",
    "Burning of Garbage",
    "Potholes / Damaged Road Surface",
    "Malfunctioning or Broken Streetlights",
    "Damaged Footpath or Paving Slabs",
    "Fallen Trees or Branches Obstructing Road",
    "Open Manhole or Drain Cover",
    "Sewerage Overflow",
    "Blocked Drains",
    "Stagnant Water on Roads",
    "Water Pipe Leakage",
    "Public Toilet Not Cleaned",
    "No Water Supply in Public Toilet",
    "No Electricity in Public Toilet",
    "Blocked Public Toilet",
    "Maintenance of Public Parks / Gardens",
    "Public Urination",
    "Illegal Banners or Hoardings",
    "Stray Animal Nuisance",
    "Other",
];

const prompt = ai.definePrompt({
  name: 'categorizeUploadedImagePrompt',
  input: {schema: CategorizeUploadedImageInputSchema},
  output: {schema: CategorizeUploadedImageOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an AI that categorizes images of civic issues.

  Analyze the image and determine the most appropriate category for it. You MUST choose one of the categories from the list of valid categories provided below.

  Valid Categories:
  - ${validCategories.join('\n  - ')}

  The image is provided as a data URI.

  Image: {{media url=photoDataUri}}
  `,
});

const categorizeUploadedImageFlow = ai.defineFlow(
  {
    name: 'categorizeUploadedImageFlow',
    inputSchema: CategorizeUploadedImageInputSchema,
    outputSchema: CategorizeUploadedImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
