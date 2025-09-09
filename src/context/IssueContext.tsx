
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Issue, IssueCategory, User } from '@/lib/types';


export const issueCategories: IssueCategory[] = [
    "Garbage Dump / Overflowing Bins",
    "Garbage Vehicle Not Arrived",
    "Sweeping Not Done",
    "Illegal Dumping / Debris",
    "Dead Animal Removal",
    "Burning of Garbage",
    "Potholes / Damaged Road Surface",
    "Malfunctioning or Broken Streetlights",
    "Damaged Footpath or Paving Slabs",
    "Fallen Trees or Branches Obstructing Road",
    "Open Manhole or Drain Cover",
    "Sewerage Overflow",
    "Blocked Drains",
    "Stagnant Water on Roads",
    "Water Pipe Leakage",
    "Public Toilet Not Cleaned",
    "No Water Supply in Public Toilet",
    "No Electricity in Public Toilet",
    "Blocked Public Toilet",
    "Maintenance of Public Parks / Gardens",
    "Public Urination",
    "Illegal Banners or Hoardings",
    "Stray Animal Nuisance",
    "Other",
];

// This can remain as a static list as users aren't dynamically added in this prototype
export const getInitialUsers = (): User[] => [
  {
    id: 'user-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    avatarUrl: 'https://picsum.photos/seed/Aarav/40/40',
    karma: 0,
    civicScore: 0,
  },
  {
    id: 'user-2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    avatarUrl: 'https://picsum.photos/seed/Priya/40/40',
    karma: 0,
    civicScore: 0,
  },
    {
    id: 'user-3',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    avatarUrl: 'https://picsum.photos/seed/Rohan/40/40',
    karma: 0,
    civicScore: 0,
  },
  {
    id: 'user-4',
    name: 'Saanvi Singh',
    email: 'saanvi.singh@example.com',
    avatarUrl: 'https://picsum.photos/seed/Saanvi/40/40',
    karma: 0,
    civicScore: 0,
  }
];

// Context type
interface IssueContextType {
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  users: User[];
  addIssue: (issue: Issue) => void;
  updateIssue: (issueId: string, updates: Partial<Issue>) => void;
  getIssueById: (id: string) => Issue | undefined;
}

// Create context
const IssueContext = createContext<IssueContextType | undefined>(undefined);

// Provider component
export const IssueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const allUsers = getInitialUsers();

  const addIssue = useCallback((newIssue: Issue) => {
    setIssues(prev => [newIssue, ...prev]);
  }, []);

  const updateIssue = useCallback((issueId: string, updates: Partial<Issue>) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === issueId ? { ...issue, ...updates } : issue
      )
    );
  }, []);

  const getIssueById = useCallback((id: string) => {
    return issues.find(issue => issue.id === id);
  }, [issues]);

  const value: IssueContextType = {
    issues,
    setIssues,
    users: allUsers,
    addIssue,
    updateIssue,
    getIssueById,
  };

  return (
    <IssueContext.Provider value={value}>
      {children}
    </IssueContext.Provider>
  );
};

// Custom hook to use the context
export const useIssues = () => {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};
