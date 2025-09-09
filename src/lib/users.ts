
import type { User } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

// Define the path to the data file
const dataPath = path.join(process.cwd(), 'src', 'data', 'users.json');


// Function to read users from the JSON file
export const getUsers = async (): Promise<User[]> => {
  try {
    const jsonData = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Could not read users.json:', error);
    // If the file doesn't exist or is empty, return an empty array
    return [];
  }
};

// Function to save users to the JSON file
export const saveUsers = async (users: User[]): Promise<void> => {
  try {
    const jsonData = JSON.stringify(users, null, 2);
    await fs.writeFile(dataPath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Could not write to users.json:', error);
  }
};
