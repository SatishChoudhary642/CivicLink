import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-uploaded-image.ts';
import '@/ai/flows/predict-resolution-status.ts';
import '@/ai/flows/predict-issue-priority.ts';
import '@/ai/flows/analyze-infrastructure-gaps.ts';
