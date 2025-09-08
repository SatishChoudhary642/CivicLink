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
  prompt: `You are an AI assistant specializing in predicting the resolution status of civic issue reports in Pune, India.
  Based on the category, description, and location of the report, predict the resolution status and provide a confidence level.

  Category: {{{category}}}
  Description: {{{description}}}
  Location: {{{location}}}

  Consider factors like the responsible municipal department (e.g., Road Dept, Water Supply, Solid Waste Management), the urgency of the issue, and typical resolution times for different types of complaints in a large Indian city.

  Respond with the predicted status and confidence level in JSON format.
  Possible resolution statuses include: "Open", "Under Review", "In Progress", "Resolved", "Rejected".
  Possible issue categories include: "Garbage Dump / Overflowing Bins", "Garbage Vehicle Not Arrived", "Sweeping Not Done", "Illegal Dumping / Debris", "Dead Animal Removal", "Burning of Garbage", "Potholes / Damaged Road Surface", "Malfunctioning or Broken Streetlights", "Damaged Footpath or Paving Slabs", "Fallen Trees or Branches Obstructing Road", "Open Manhole or Drain Cover", "Sewerage Overflow", "Blocked Drains", "Stagnant Water on Roads", "Water Pipe Leakage", "Public Toilet Not Cleaned", "No Water Supply in Public Toilet", "No Electricity in Public Toilet", "Blocked Public Toilet", "Maintenance of Public Parks / Gardens", "Public Urination", "Illegal Banners or Hoardings", "Stray Animal Nuisance", "Other".

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
