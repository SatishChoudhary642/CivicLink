'use server';

import { z } from 'zod';
import { categorizeUploadedImage } from '@/ai/flows/categorize-uploaded-image';
import { predictResolutionStatus } from '@/ai/flows/predict-resolution-status';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';


export async function getCategoryForImage(photoDataUri: string) {
  try {
    if (!photoDataUri.startsWith('data:image/')) {
      return { error: 'Invalid image data URI.' };
    }
    const result = await categorizeUploadedImage({ photoDataUri });
    return { category: result.category, confidence: result.confidence };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to categorize image.' };
  }
}

const FormSchema = z.object({
    title: z.string().min(5, { message: "Title must be at least 5 characters." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    category: z.string({ required_error: "Please select a category." }),
    location: z.string().min(3, { message: "Please provide a location." }),
    photoUrl: z.string().optional(),
});

export async function createIssue(values: z.infer<typeof FormSchema>) {
    console.log("Creating issue with values:", values);

    try {
        const prediction = await predictResolutionStatus({
            category: values.category,
            description: values.description,
            location: values.location,
        });
        console.log("AI Prediction on new issue:", prediction);
        // Here you would use the prediction, e.g., save it with the issue
    } catch(error) {
        console.error("AI prediction failed:", error);
    }

    // In a real app, you would save to a database here.
    
    revalidatePath('/');
    redirect('/');
}
