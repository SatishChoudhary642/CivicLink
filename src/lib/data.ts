
import type { Issue } from './types';
import fs from 'fs/promises';
import path from 'path';

// Define the path to the data file
const dataPath = path.join(process.cwd(), 'src', 'data', 'issues.json');

// Function to read issues from the JSON file
export const getIssues = async (): Promise<Issue[]> => {
  try {
    const jsonData = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Could not read issues.json:', error);
    // If the file doesn't exist or is empty, return an empty array
    return [];
  }
};

// Function to save issues to the JSON file
export const saveIssues = async (issues: Issue[]): Promise<void> => {
  try {
    const jsonData = JSON.stringify(issues, null, 2);
    await fs.writeFile(dataPath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Could not write to issues.json:', error);
  }
};
