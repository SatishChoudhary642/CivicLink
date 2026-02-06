'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { categorizeUploadedImage } from '@/ai/flows/categorize-uploaded-image';
import { predictIssuePriority } from '@/ai/flows/predict-issue-priority';
import { getIssues, saveIssues } from '@/lib/data';
import { getUsers, saveUsers } from '@/lib/users';
import type { Issue, IssueCategory, User } from './types';


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

const IssueFormSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    category: z.string(),
    location: z.string().min(3),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    photoDataUri: z.string().min(1, { message: 'Please upload a photo.'}),
});

export async function createIssue(
    values: z.infer<typeof IssueFormSchema>,
    user: User | null
): Promise<{ success: boolean; error?: string }> {
    const validatedFields = IssueFormSchema.safeParse(values);
    
    if (!validatedFields.success) {
        console.error("Invalid form data:", validatedFields.error.flatten().fieldErrors);
        return { success: false, error: "Invalid form data." };
    }

    if (!user) {
        return { success: false, error: "You must be logged in to create an issue." };
    }
    
    const { title, description, category, location, photoDataUri, latitude, longitude } = validatedFields.data;
    
    let lat = 0;
    let lng = 0;

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
        imageUrl: photoDataUri,
        imageHint: 'new issue',
        location: {
            lat,
            lng,
            address: location,
        },
        votes: { up: 1, down: 0 },
        createdAt: new Date().toISOString(),
        reporter: user,
        comments: [],
    };
    
    try {
      const priorityPrediction = await predictIssuePriority({ 
        title: newIssue.title, 
        description: newIssue.description, 
        category: newIssue.category 
      });

      if (priorityPrediction.priority) {
        newIssue.priority = priorityPrediction.priority;
        newIssue.justification = priorityPrediction.justification;
      }
    } catch (e) {
      console.error('Could not predict priority:', e);
    }

    try {
      const issues = await getIssues();
      const updatedIssues = [newIssue, ...issues];
      await saveIssues(updatedIssues);
      
      revalidatePath('/');
      revalidatePath('/admin');
      revalidatePath('/map');

      return { success: true };
    } catch(error) {
        const errorMsg = "Failed to save the new issue.";
        console.error(errorMsg, error);
        return { success: false, error: errorMsg };
    }
}


const SignupFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signupUser(
  values: z.infer<typeof SignupFormSchema>
): Promise<{ success: boolean; error?: string; user?: User }> {
  const validatedFields = SignupFormSchema.safeParse(values);
    
  if (!validatedFields.success) {
      return { success: false, error: "Invalid form data." };
  }

  const { name, email, password } = validatedFields.data;
  
  const users = await getUsers();
  
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
  }

  const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password, // Save the password
      avatarUrl: `https://picsum.photos/seed/${name}/40/40`,
      civicScore: 0,
      karma: 0,
  };

  try {
    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);
    
    revalidatePath('/admin');

    return { success: true, user: newUser };
  } catch(error) {
      const errorMsg = "Failed to save the new user.";
      console.error(errorMsg, error);
      return { success: false, error: errorMsg };
  }
}
