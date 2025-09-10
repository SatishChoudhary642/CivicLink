'use server';

/**
 * @fileOverview Analyzes civic issue reports to identify potential infrastructure gaps.
 *
 * - analyzeInfrastructureGaps - Analyzes a list of issues to find patterns and suggest infrastructure improvements.
 * - AnalyzeInfrastructureGapsInput - The input type for the function.
 * - AnalyzeInfrastructureGapsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Simplified Issue schema for the AI flow input
const IssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  location: z.object({
    address: z.string(),
  }),
  description: z.string(),
  createdAt: z.string(),
});

const AnalyzeInfrastructureGapsInputSchema = z.object({
  issues: z.array(IssueSchema).describe('A list of all reported civic issues.'),
});
export type AnalyzeInfrastructureGapsInput = z.infer<typeof AnalyzeInfrastructureGapsInputSchema>;

const GapReportSchema = z.object({
    problemArea: z.string().describe("The specific geographic area or neighborhood where the problem is concentrated (e.g., 'Wagholi Market', 'Karve Road')."),
    problemType: z.string().describe("The general category of the recurring issue (e.g., 'Waste Management', 'Road Safety', 'Parking Enforcement')."),
    suggestion: z.string().describe("A concise, actionable suggestion for the municipal authority to address the root cause (e.g., 'Install more high-capacity garbage bins', 'Conduct a traffic study to assess the need for a new signal')."),
    supportingIssueIds: z.array(z.string()).describe("A list of 2-3 issue IDs that are prime examples of this recurring problem."),
    reasoning: z.string().describe("A brief, one-sentence explanation of why this is considered a potential infrastructure gap, based on the data."),
});

const AnalyzeInfrastructureGapsOutputSchema = z.object({
  gapAnalysis: z.array(GapReportSchema).describe('A list of identified potential infrastructure gaps.'),
});
export type AnalyzeInfrastructureGapsOutput = z.infer<typeof AnalyzeInfrastructureGapsOutputSchema>;

export async function analyzeInfrastructureGaps(input: AnalyzeInfrastructureGapsInput): Promise<AnalyzeInfrastructureGapsOutput> {
  // If there are too few issues, don't run the analysis to save resources.
  if (input.issues.length < 5) {
      return { gapAnalysis: [] };
  }
  return analyzeInfrastructureGapsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeInfrastructureGapsPrompt',
  input: { schema: AnalyzeInfrastructureGapsInputSchema },
  output: { schema: AnalyzeInfrastructureGapsOutputSchema },
  prompt: `You are an expert urban planning analyst AI for the city of Pune, India. Your task is to analyze a list of civic issue reports to identify recurring problems that indicate a potential gap in city infrastructure.

  Analyze the provided list of issues. Look for clusters of similar problems in the same geographic areas.
  For example:
  - Multiple "Garbage Dump" reports in one neighborhood might mean a need for more dustbins or more frequent garbage collection.
  - Several "Pothole" reports on the same road suggest the road needs to be completely resurfaced, not just patched.
  - Many "Illegal Parking" reports in a commercial area could indicate a lack of sufficient public parking.

  Based on your analysis of the issue data, identify up to 3 major infrastructure gaps. For each gap, provide:
  1.  `problemArea`: The specific neighborhood or location.
  2.  `problemType`: The general category of the problem.
  3.  `suggestion`: A concrete, actionable suggestion for the city.
  4.  `supportingIssueIds`: A few example issue IDs that support your conclusion.
  5.  `reasoning`: A short justification for your analysis.

  Here is the list of issues to analyze:
  {{#each issues}}
  - Issue ID: {{id}}
    Title: "{{title}}"
    Category: {{category}}
    Location: {{location.address}}
    Description: "{{description}}"
  {{/each}}
  `,
});

const analyzeInfrastructureGapsFlow = ai.defineFlow(
  {
    name: 'analyzeInfrastructureGapsFlow',
    inputSchema: AnalyzeInfrastructureGapsInputSchema,
    outputSchema: AnalyzeInfrastructureGapsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
