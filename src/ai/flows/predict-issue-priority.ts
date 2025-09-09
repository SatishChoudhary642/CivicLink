'use server';

/**
 * @fileOverview Predicts the priority of a civic issue report.
 *
 * - predictIssuePriority - Predicts priority based on issue category, title, and description.
 * - PredictIssuePriorityInput - The input type for the predictIssuePriority function.
 * - PredictIssuePriorityOutput - The return type for the predictIssuePriority function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictIssuePriorityInputSchema = z.object({
  category: z.string().describe('The category of the reported issue.'),
  title: z.string().describe('The title of the reported issue.'),
  description: z.string().describe('A detailed description of the reported issue.'),
});
export type PredictIssuePriorityInput = z.infer<typeof PredictIssuePriorityInputSchema>;

const PredictIssuePriorityOutputSchema = z.object({
  priority: z.enum(['Low', 'Medium', 'High']).describe('The predicted priority of the issue.'),
  justification: z.string().describe('A brief justification for the assigned priority level.'),
});
export type PredictIssuePriorityOutput = z.infer<typeof PredictIssuePriorityOutputSchema>;

export async function predictIssuePriority(input: PredictIssuePriorityInput): Promise<PredictIssuePriorityOutput> {
  return predictIssuePriorityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictIssuePriorityPrompt',
  input: {schema: PredictIssuePriorityInputSchema},
  output: {schema: PredictIssuePriorityOutputSchema},
  prompt: `You are an AI assistant acting as a senior municipal operations manager for the city of Pune, India. Your task is to assess the priority of a new civic issue report.

  Analyze the provided details:
  - Category: {{{category}}}
  - Title: {{{title}}}
  - Description: {{{description}}}

  Based on this information, determine the priority level. Use the following criteria:
  - **High**: Immediate threat to public safety, major health hazard, critical infrastructure failure, significant disruption to traffic or essential services (e.g., Open Manhole, Sewerage Overflow, Fallen Tree blocking a major road, Water Pipe Leakage).
  - **Medium**: Significant inconvenience, potential safety hazard, affects a large number of citizens but not an immediate emergency (e.g., Malfunctioning Streetlights, large Potholes, Blocked Drains, Stray Animal Nuisance).
  - **Low**: Minor inconvenience, aesthetic issue, non-urgent maintenance (e.g., Damaged Benches, minor Graffiti, Illegal Banners).

  Provide a priority level ("Low", "Medium", or "High") and a brief, one-sentence justification for your decision.
  `,
});

const predictIssuePriorityFlow = ai.defineFlow(
  {
    name: 'predictIssuePriorityFlow',
    inputSchema: PredictIssuePriorityInputSchema,
    outputSchema: PredictIssuePriorityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
