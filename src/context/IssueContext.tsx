
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Issue, IssueCategory, User } from '@/lib/types';
import { initialIssues, getInitialUsers } from '@/lib/data';

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

const ISSUES_STORAGE_KEY = 'civiclink-issues';

// Context type
interface IssueContextType {
  issues: Issue[];
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

  // Load issues from localStorage on mount
  useEffect(() => {
    // This code runs only on the client
    const storedIssues = localStorage.getItem(ISSUES_STORAGE_KEY);
    if (storedIssues) {
      try {
        setIssues(JSON.parse(storedIssues));
      } catch (error) {
        console.error('Failed to parse stored issues:', error);
        setIssues(initialIssues);
        localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(initialIssues));
      }
    } else {
      setIssues(initialIssues);
      localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(initialIssues));
    }
  }, []);

  // Save to localStorage whenever issues change
  useEffect(() => {
    // Avoid writing the initial empty array to storage
    if (issues.length > 0) {
      localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(issues));
    }
  }, [issues]);

  const addIssue = (newIssue: Issue) => {
    setIssues(prev => [newIssue, ...prev]);
  };

  const updateIssue = (issueId: string, updates: Partial<Issue>) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === issueId ? { ...issue, ...updates } : issue
      )
    );
  };

  const getIssueById = (id: string) => {
    return issues.find(issue => issue.id === id);
  };

  const value: IssueContextType = {
    issues,
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

    
