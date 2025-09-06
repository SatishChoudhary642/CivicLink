'use server';

/**
 * @fileOverview Predicts the resolution status of a civic issue report
 *
 * - predictResolutionStatus - Predicts resolution status based on issue category, description, and location.
 * - PredictResolutionStatusInput - The input type for the predictResolutionStatus function.
 * - PredictResolutionStatusOutput - The return type for the predictResolutionStatus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictResolutionStatusInputSchema = z.object({
  category: z.string().describe('The category of the reported issue.'),
  description: z.string().describe('A detailed description of the reported issue.'),
  location: z.string().describe('The location where the issue was reported.'),
});
export type PredictResolutionStatusInput = z.infer<typeof PredictResolutionStatusInputSchema>;

const PredictResolutionStatusOutputSchema = z.object({
  predictedStatus: z.string().describe('The predicted resolution status of the issue.'),
  confidenceLevel: z.number().describe('The confidence level of the prediction (0-1).'),
});
export type PredictResolutionStatusOutput = z.infer<typeof PredictResolutionStatusOutputSchema>;

export async function predictResolutionStatus(input: PredictResolutionStatusInput): Promise<PredictResolutionStatusOutput> {
  return predictResolutionStatusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictResolutionStatusPrompt',
  input: {schema: PredictResolutionStatusInputSchema},
  output: {schema: PredictResolutionStatusOutputSchema},
  prompt: `You are an AI assistant specializing in predicting the resolution status of civic issue reports.
  Based on the category, description, and location of the report, predict the resolution status and provide a confidence level.

  Category: {{{category}}}
  Description: {{{description}}}
  Location: {{{location}}}

  Respond with the predicted status and confidence level in JSON format.
  Possible resolution statuses include: "Open", "Under Review", "In Progress", "Resolved", "Rejected".
  The confidence level should be a number between 0 and 1.
  `,
});

const predictResolutionStatusFlow = ai.defineFlow(
  {
    name: 'predictResolutionStatusFlow',
    inputSchema: PredictResolutionStatusInputSchema,
    outputSchema: PredictResolutionStatusOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
