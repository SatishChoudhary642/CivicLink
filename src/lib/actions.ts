'use server';

import { z } from 'zod';
import { categorizeUploadedImage } from '@/ai/flows/categorize-uploaded-image';
import { getInitialUsers } from '@/context/IssueContext';
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

export async function createIssue(values: z.infer<typeof FormSchema>): Promise<Issue | null> {
    const validatedFields = FormSchema.safeParse(values);
    const users = getInitialUsers();

    if (!validatedFields.success) {
        console.error("Invalid form data:", validatedFields.error);
        return null;
    }
    
    const { title, description, category, location, photoDataUri, latitude, longitude } = validatedFields.data;
    
    // In a real app, the user would come from the session
    const currentUser = users.find(u => u.id === currentUserId);
    if (!currentUser) {
        console.error("Could not find current user");
        return null;
    }
    
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
    
    // We are now managing state on the client, so we don't save here.
    // We just return the created issue.
    // The `revalidatePath` calls are also no longer needed as context handles re-renders.
    
    return newIssue;
}
