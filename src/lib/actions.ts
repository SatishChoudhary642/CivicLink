'use server';

import { z } from 'zod';
import { categorizeUploadedImage } from '@/ai/flows/categorize-uploaded-image';
import { predictResolutionStatus } from '@/ai/flows/predict-resolution-status';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { issues, users } from './data';
import type { Issue, IssueCategory } from './types';


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
    title: z.string().min(5),
    description: z.string().min(10),
    category: z.string(),
    location: z.string().min(3),
    photoDataUri: z.string().optional(),
});

// In a real app, you would get the current user from your authentication system.
const currentUserId = "user-1";

export async function createIssue(values: z.infer<typeof FormSchema>) {
    const validatedFields = FormSchema.safeParse(values);

    if (!validatedFields.success) {
        throw new Error('Invalid form data.');
    }
    
    const { title, description, category, location, photoDataUri } = validatedFields.data;
    const currentUser = users.find(u => u.id === currentUserId)!;

    console.log("Creating issue with values:", values);

    const newIssue: Issue = {
        id: `issue-${Date.now()}`,
        title,
        description,
        category: category as IssueCategory,
        status: 'Open',
        imageUrl: photoDataUri || 'https://picsum.photos/600/400',
        imageHint: 'new issue',
        location: {
            lat: 0, // In a real app, geocode the address
            lng: 0,
            address: location,
        },
        votes: { up: 1, down: 0 },
        createdAt: new Date().toISOString(),
        reporter: currentUser,
        comments: [],
    };
    
    try {
        const prediction = await predictResolutionStatus({
            category: values.category,
            description: values.description,
            location: values.location,
        });
        console.log("AI Prediction on new issue:", prediction);
        // Here you would use the prediction, e.g., save it with the issue and potentially override the default 'Open' status
        if (prediction.predictedStatus) {
            // This is just an example, you might have more complex logic
            // newIssue.status = prediction.predictedStatus as Issue['status'];
        }
    } catch(error) {
        console.error("AI prediction failed:", error);
    }

    // In a real app, you would save to a database here.
    issues.unshift(newIssue);
    
    revalidatePath('/');
    redirect('/');
}
