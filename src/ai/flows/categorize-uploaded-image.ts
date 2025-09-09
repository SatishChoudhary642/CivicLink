// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Image categorization AI agent.
 *
 * - categorizeUploadedImage - A function that categorizes an uploaded image.
 * - CategorizeUploadedImageInput - The input type for the categorizeUploadedImage function.
 * - CategorizeUploadedImageOutput - The return type for the categorizeUploadedImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
    .min(0)
    .max(1)
    .describe(
      'The confidence level of the categorization, from 0 to 1. 1 is highest confidence.'
    ),
  reasoning: z
    .string()
    .optional()
    .describe(
      'Brief explanation of why this category was chosen (optional for debugging)'
    ),
});

export type CategorizeUploadedImageOutput = z.infer<
  typeof CategorizeUploadedImageOutputSchema
>;

export async function categorizeUploadedImage(
  input: CategorizeUploadedImageInput
): Promise<CategorizeUploadedImageOutput> {
  try {
    return await categorizeUploadedImageFlow(input);
  } catch (error) {
    console.error('Error categorizing image:', error);
    // Fallback to "Other" category if there's an error
    return {
      category: "Other",
      confidence: 0,
      reasoning: "Error occurred during categorization"
    };
  }
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
  input: { schema: CategorizeUploadedImageInputSchema },
  output: { schema: CategorizeUploadedImageOutputSchema },
  model: 'googleai/gemini-2.0-flash-exp', // Updated to latest model
  prompt: `You are an expert AI system specialized in analyzing images of civic and municipal issues to help city authorities prioritize and address urban problems.

Your task is to carefully analyze the provided image and categorize it into the most appropriate civic issue category.

**IMPORTANT INSTRUCTIONS:**
1. You MUST select exactly ONE category from the valid categories list below
2. Examine the image thoroughly for visual clues, objects, conditions, and context
3. Consider the severity and type of issue shown
4. Provide a confidence score based on how clearly the issue is visible and identifiable
5. If the image shows multiple issues, select the most prominent or severe one
6. If unsure or if the image doesn't clearly show a civic issue, use "Other" category

**Valid Categories (you must choose one):**
${validCategories.map(cat => `- ${cat}`).join('\n')}

**Analysis Guidelines:**
- For garbage-related issues: Look for overflowing bins, scattered waste, dumping sites
- For road issues: Check for holes, cracks, damaged surfaces, obstructions
- For infrastructure: Examine streetlights, manholes, drains, footpaths
- For water issues: Look for leaks, flooding, stagnant water, sewerage problems
- For public facilities: Assess toilets, parks, public spaces
- For animals: Identify stray dogs, cats, or dead animals
- For unauthorized items: Check for illegal banners, hoardings, or dumping

Please analyze this civic issue image:

{{media url=photoDataUri}}

Provide your analysis with the most appropriate category, confidence level (0-1), and brief reasoning for your choice.`,
});

const categorizeUploadedImageFlow = ai.defineFlow(
  {
    name: 'categorizeUploadedImageFlow',
    inputSchema: CategorizeUploadedImageInputSchema,
    outputSchema: CategorizeUploadedImageOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      
      // Validate that the returned category is in our valid list
      if (output && !validCategories.includes(output.category)) {
        console.warn(`Invalid category returned: ${output.category}, defaulting to "Other"`);
        return {
          category: "Other",
          confidence: 0.5,
          reasoning: `Original category "${output.category}" was not in valid list`
        };
      }
      
      return output!;
    } catch (error) {
      console.error('Error in categorization flow:', error);
      throw error;
    }
  }
);