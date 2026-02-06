'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
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

interface IssueContextType {
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  users: User[];
  addIssue: (issue: Issue) => void;
  updateIssue: (issueId: string, updates: Partial<Issue>) => void;
  getIssueById: (id: string) => Issue | undefined;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

interface IssueProviderProps {
  children: ReactNode;
  initialUsers: User[];
  initialIssues: Issue[];
}

export const IssueProvider: React.FC<IssueProviderProps> = ({ children, initialUsers, initialIssues }) => {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [users, setUsers] = useState<User[]>(initialUsers);

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
    users,
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

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};
