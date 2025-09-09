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
    
    // In a real app, you'd fetch this from a DB or session
    const users = getInitialUsers();

    if (!validatedFields.success) {
        console.error("Invalid form data:", validatedFields.error.flatten().fieldErrors);
        // Returning null or throwing an error are both valid options.
        // Returning null allows the client to display a generic error.
        return null;
    }
    
    const { title, description, category, location, photoDataUri, latitude, longitude } = validatedFields.data;
    
    // This would typically come from an authentication context
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

    // The server action's responsibility is just to create the new issue object.
    // The client will handle adding it to its state.
    const newIssue: Issue = {
        id: `issue-${Date.now()}`,
        title,
        description,
        category: category as IssueCategory,
        status: 'Open',
        imageUrl: photoDataUri, // The data URI is used directly
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
    
    return newIssue;
}
