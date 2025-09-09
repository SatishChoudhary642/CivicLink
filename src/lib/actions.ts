'use server';

import { z } from 'zod';
import { categorizeUploadedImage } from '@/ai/flows/categorize-uploaded-image';
import { revalidatePath } from 'next/cache';
import { getInitialUsers, dataStore } from './data';
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
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    photoDataUri: z.string().min(1, { message: 'Please upload a photo.'}),
});

// In a real app, you would get the current user from your authentication system.
const currentUserId = "user-1";

export async function createIssue(values: z.infer<typeof FormSchema>) {
    const validatedFields = FormSchema.safeParse(values);
    const users = getInitialUsers();

    if (!validatedFields.success) {
        throw new Error('Invalid form data.');
    }
    
    const { title, description, category, location, photoDataUri, latitude, longitude } = validatedFields.data;
    const currentUser = users.find(u => u.id === currentUserId)!;
    
    let lat = 0;
    let lng = 0;

    // Use provided coordinates if they exist, otherwise geocode the address
    if (latitude && longitude) {
        lat = latitude;
        lng = longitude;
    } else {
        try {
            const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`);
            const geoData = await geoResponse.json();
            
            if (geoResponse.ok && geoData && geoData.length > 0) {
                lat = parseFloat(geoData[0].lat);
                lng = parseFloat(geoData[0].lon);
            } else {
                console.warn("Geocoding failed for address:", location);
            }
        } catch (error) {
            console.error("Error during geocoding:", error);
        }
    }


    const newIssue: Issue = {
        id: `issue-${Date.now()}`,
        title,
        description,
        category: category as IssueCategory,
        status: 'Open',
        imageUrl: photoDataUri || 'https://picsum.photos/600/400',
        imageHint: 'new issue',
        location: {
            lat,
            lng,
            address: location,
        },
        votes: { up: 1, down: 0 },
        createdAt: new Date().toISOString(),
        reporter: currentUser,
        comments: [],
    };
    
    // In a real app, you would save to a database here.
    // We now use our localStorage-based dataStore.
    const currentIssues = dataStore.getIssues();
    const updatedIssues = [newIssue, ...currentIssues];
    dataStore.saveIssues(updatedIssues);
    
    // Revalidate paths to ensure fresh data is fetched on navigation.
    revalidatePath('/');
    revalidatePath('/admin');
}
