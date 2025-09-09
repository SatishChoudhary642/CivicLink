
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Issue, IssueCategory, User } from '@/lib/types';

// Initial data functions and constants
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

const users = getInitialUsers();

const initialIssues: Issue[] = [
  {
    id: 'pune-1',
    title: 'Huge Pothole on FC Road',
    description: 'A massive pothole near Vaishali Restaurant is causing severe traffic backlog and is dangerous for two-wheelers. It has been there for over a week.',
    category: 'Potholes / Damaged Road Surface',
    status: 'Open',
    priority: 'Medium',
    priorityJustification: 'Large pothole on a busy road poses a significant traffic hazard.',
    imageUrl: 'https://picsum.photos/seed/potholefc/600/400',
    imageHint: 'pothole road',
    location: {
      lat: 18.518,
      lng: 73.844,
      address: 'Fergusson College Rd, Deccan Gymkhana, Pune',
    },
    votes: { up: 25, down: 2 },
    createdAt: '2024-05-28T10:00:00Z',
    reporter: users.find(u => u.id === 'user-1')!,
    comments: [],
  },
  {
    id: 'wagholi-1',
    title: 'No Streetlights on Kesnand Road, Wagholi',
    description: 'The entire stretch of Kesnand Road from the main highway turning is pitch dark. It feels extremely unsafe to travel here after 7 PM. Many streetlights are fused.',
    category: 'Malfunctioning or Broken Streetlights',
    status: 'Open',
    priority: 'Medium',
    priorityJustification: 'Lack of lighting on a public road creates a safety risk for nighttime travel.',
    imageUrl: 'https://picsum.photos/seed/darkroad/600/400',
    imageHint: 'dark street',
    location: {
      lat: 18.585,
      lng: 73.970,
      address: 'Kesnand Road, Wagholi, Pune',
    },
    votes: { up: 45, down: 0 },
    createdAt: '2024-05-29T19:30:00Z',
    reporter: users.find(u => u.id === 'user-2')!,
    comments: [],
  },
  {
    id: 'pune-2',
    title: 'Garbage Dumped near Pune Station',
    description: 'There is a huge pile of garbage overflowing from the bins right outside the main entrance of Pune Railway Station. The smell is unbearable and it looks terrible.',
    category: 'Garbage Dump / Overflowing Bins',
    status: 'In Progress',
    priority: 'Medium',
    priorityJustification: 'Large accumulation of waste in a high-traffic public area poses a public health concern.',
    imageUrl: 'https://picsum.photos/seed/garbagestation/600/400',
    imageHint: 'trash pile',
    location: {
      lat: 18.528,
      lng: 73.873,
      address: 'Pune Railway Station, Agarkar Nagar, Pune',
    },
    votes: { up: 18, down: 1 },
    createdAt: '2024-05-27T08:00:00Z',
    reporter: users.find(u => u.id === 'user-3')!,
    comments: [],
  },
   {
    id: 'pune-8',
    title: 'Open Manhole on Karve Road',
    description: 'An open manhole without any warning signs is present on the footpath of the busy Karve Road. It is extremely dangerous for pedestrians, especially at night.',
    category: 'Open Manhole or Drain Cover',
    status: 'Open',
    priority: 'High',
    priorityJustification: 'An open manhole poses an immediate and severe risk of injury to the public.',
    imageUrl: 'https://picsum.photos/seed/openmanhole/600/400',
    imageHint: 'open manhole',
    location: {
        lat: 18.505,
        lng: 73.832,
        address: 'Karve Road, Kothrud, Pune',
    },
    votes: { up: 55, down: 0 },
    createdAt: '2024-05-31T09:00:00Z',
    reporter: users.find(u => u.id === 'user-1')!,
    comments: [],
  },
  {
    id: 'wagholi-2',
    title: 'Broken Signage at Wagholi-Lohegaon Rd Crossing',
    description: 'The main direction sign at the Wagholi-Lohegaon road junction is broken and turned the wrong way, causing confusion for new drivers.',
    category: 'Illegal Banners or Hoardings',
    status: 'Resolved',
    priority: 'Low',
    priorityJustification: 'Incorrect signage is an inconvenience but does not pose an immediate safety threat.',
    imageUrl: 'https://picsum.photos/seed/brokensign/600/400',
    imageHint: 'damaged sign',
    location: {
      lat: 18.583,
      lng: 73.951,
      address: 'Wagholi-Lohegaon Road, Wagholi, Pune',
    },
    votes: { up: 10, down: 0 },
    createdAt: '2024-05-25T11:45:00Z',
    reporter: users.find(u => u.id === 'user-4')!,
    comments: [],
  },
  {
    id: 'pune-rejected-1',
    title: 'My neighbor\'s dog is too cute',
    description: 'The dog in my neighborhood is distracting me with its cuteness. This is a civic emergency.',
    category: 'Other',
    status: 'Rejected',
    priority: 'Low',
    priorityJustification: 'This is not a valid civic issue.',
    imageUrl: 'https://picsum.photos/seed/cutedog/600/400',
    imageHint: 'cute dog',
    location: {
      lat: 18.531,
      lng: 73.888,
      address: 'Kalyani Nagar, Pune',
    },
    votes: { up: 2, down: 12 },
    createdAt: '2024-05-20T10:00:00Z',
    reporter: users.find(u => u.id === 'user-4')!,
    comments: [],
  },
  {
    id: 'pune-3',
    title: 'Graffiti at Shaniwar Wada Wall',
    description: 'Someone has spray-painted inappropriate graffiti on the historic walls of Shaniwar Wada. This needs to be cleaned to preserve our heritage.',
    category: 'Illegal Dumping / Debris',
    status: 'Open',
    priority: 'Low',
    priorityJustification: 'Graffiti is an aesthetic issue but does not affect public safety or health.',
    imageUrl: 'https://picsum.photos/seed/graffitiwada/600/400',
    imageHint: 'graffiti wall',
    location: {
      lat: 18.519,
      lng: 73.855,
      address: 'Shaniwar Peth, Pune',
    },
    votes: { up: 33, down: 5 },
    createdAt: '2024-05-30T15:00:00Z',
    reporter: users.find(u => u.id === 'user-1')!,
    comments: [],
  },
  {
    id: 'wagholi-3',
    title: 'Water Logging near Wagheshwar Temple',
    description: 'After just a little rain, the area around Wagheshwar Temple gets completely water-logged. The drainage system is clearly choked. It is impossible to walk.',
    category: 'Stagnant Water on Roads',
    status: 'Open',
    priority: 'Medium',
    priorityJustification: 'Water logging impedes movement and can be a breeding ground for diseases.',
    imageUrl: 'https://picsum.photos/seed/waterlog/600/400',
    imageHint: 'water flooding',
    location: {
      lat: 18.577,
      lng: 73.963,
      address: 'Wagheshwar Temple, Wagholi, Pune',
    },
    votes: { up: 28, down: 0 },
    createdAt: '2024-05-29T12:00:00Z',
    reporter: users.find(u => u.id === 'user-2')!,
    comments: [],
  },
  {
    id: 'pune-4',
    title: 'Damaged footpath in Koregaon Park',
    description: 'The pavement on Lane 7 in Koregaon Park is broken and uneven. It is a tripping hazard, especially for senior citizens who walk here in the evening.',
    category: 'Damaged Footpath or Paving Slabs',
    status: 'In Progress',
    priority: 'Medium',
    priorityJustification: 'A broken footpath presents a moderate risk of injury to pedestrians.',
    imageUrl: 'https://picsum.photos/seed/footpathkp/600/400',
    imageHint: 'broken pavement',
    location: {
      lat: 18.536,
      lng: 73.894,
      address: 'Lane 7, Koregaon Park, Pune',
    },
    votes: { up: 15, down: 2 },
    createdAt: '2024-05-26T17:00:00Z',
    reporter: users.find(u => u.id === 'user-3')!,
    comments: [],
  },
    {
    id: 'wagholi-8',
    title: 'Major water pipeline leakage on Nagar Road',
    description: 'A major pipeline near Bakori Phata is leaking thousands of litres of water onto the main Nagar Road, causing traffic issues and wasting water.',
    category: 'Water Pipe Leakage',
    status: 'Open',
    priority: 'High',
    priorityJustification: 'A major pipeline burst wastes a critical resource and disrupts traffic significantly.',
    imageUrl: 'https://picsum.photos/seed/pipeline/600/400',
    imageHint: 'pipe leaking',
    location: {
        lat: 18.583,
        lng: 73.982,
        address: 'Nagar Road, near Bakori Phata, Wagholi',
    },
    votes: { up: 72, down: 1 },
    createdAt: '2024-05-31T11:00:00Z',
    reporter: users.find(u => u.id === 'user-2')!,
    comments: [],
  },
  {
    id: 'pune-rejected-2',
    title: 'Pigeons are judging me',
    description: 'The pigeons at the bus stop stare at me every day. It\'s a coordinated effort and it needs to stop. This is harassment.',
    category: 'Stray Animal Nuisance',
    status: 'Rejected',
    priority: 'Low',
    priorityJustification: 'The behavior of pigeons is not a manageable civic issue.',
    imageUrl: 'https://picsum.photos/seed/pigeons/600/400',
    imageHint: 'pigeons staring',
    location: {
      lat: 18.520,
      lng: 73.856,
      address: 'Shivaji Nagar Bus Stand, Pune',
    },
    votes: { up: 1, down: 21 },
    createdAt: '2024-05-19T11:00:00Z',
    reporter: users.find(u => u.id === 'user-3')!,
    comments: [],
  },
  {
    id: 'wagholi-4',
    title: 'Frequent Power Cuts in Ivy Estate',
    description: 'We are experiencing multiple power cuts daily in Ivy Estate, Wagholi. It lasts for hours and disrupts work from home. Needs a permanent solution.',
    category: 'Malfunctioning or Broken Streetlights',
    status: 'Open',
    priority: 'Medium',
    priorityJustification: 'Frequent power cuts severely disrupt daily life for a large residential area.',
    imageUrl: 'https://picsum.photos/seed/powercut/600/400',
    imageHint: 'electricity problem',
    location: {
      lat: 18.591,
      lng: 73.985,
      address: 'Ivy Estate, Wagholi, Pune',
    },
    votes: { up: 50, down: 1 },
    createdAt: '2024-05-30T21:00:00Z',
    reporter: users.find(u => u.id === 'user-4')!,
    comments: [],
  },
  {
    id: 'pune-5',
    title: 'Overflowing Garbage Bin in Kothrud',
    description: 'The garbage bin at Karve Statue, Kothrud is always overflowing. Stray dogs and cattle are making a mess of it. Needs to be cleared more frequently.',
    category: 'Garbage Dump / Overflowing Bins',
    status: 'Open',
    priority: 'Medium',
    priorityJustification: 'Overflowing garbage is a health hazard and affects local sanitation.',
    imageUrl: 'https://picsum.photos/seed/kothrudtrash/600/400',
    imageHint: 'overflowing trash',
    location: {
      lat: 18.507,
      lng: 73.809,
      address: 'Karve Nagar, Kothrud, Pune',
    },
    votes: { up: 20, down: 0 },
    createdAt: '2024-05-30T09:00:00Z',
    reporter: users.find(u => u.id === 'user-1')!,
    comments: [],
  },
  {
    id: 'wagholi-5',
    title: 'Illegal Parking causing traffic jams',
    description: 'Cars and tempos are parked illegally on both sides of the main market road in Wagholi, causing huge traffic jams in the evening.',
    category: 'Other',
    status: 'Open',
    priority: 'Low',
    priorityJustification: 'Illegal parking causes inconvenience but can be managed by local traffic police.',
    imageUrl: 'https://picsum.photos/seed/parkingjam/600/400',
    imageHint: 'traffic jam',
    location: {
      lat: 18.580,
      lng: 73.965,
      address: 'Wagholi Market, Pune',
    },
    votes: { up: 35, down: 3 },
    createdAt: '2024-05-28T18:30:00Z',
    reporter: users.find(u => u.id === 'user-2')!,
    comments: [],
  },
   {
    id: 'pune-6',
    title: 'Traffic signal at JM Road not working',
    description: 'The traffic signal at the JM Road and Apte Road intersection has been malfunctioning for 3 days, leading to chaos and potential accidents.',
    category: 'Malfunctioning or Broken Streetlights',
    status: 'Open',
    priority: 'Medium',
    priorityJustification: 'A non-functional traffic signal at a major intersection increases the risk of accidents.',
    imageUrl: 'https://picsum.photos/seed/signalred/600/400',
    imageHint: 'traffic light',
    location: {
      lat: 18.521,
      lng: 73.847,
      address: 'Jangali Maharaj Road, Pune',
    },
    votes: { up: 22, down: 0 },
    createdAt: '2024-05-27T14:00:00Z',
    reporter: users.find(u => u.id === 'user-3')!,
    comments: [],
  },
  {
    id: 'wagholi-6',
    title: 'Stray Dog Menace Near JSPM',
    description: 'A large pack of stray dogs has become aggressive near the JSPM college campus in Wagholi. They chase vehicles and have bitten a student.',
    category: 'Stray Animal Nuisance',
    status: 'In Progress',
    priority: 'Medium',
    priorityJustification: 'Aggressive stray animals pose a direct safety risk to residents and students.',
    imageUrl: 'https://picsum.photos/seed/straydogs/600/400',
    imageHint: 'stray dogs',
    location: {
      lat: 18.588,
      lng: 73.978,
      address: 'JSPM College, Wagholi, Pune',
    },
    votes: { up: 40, down: 4 },
    createdAt: '2024-05-26T22:00:00Z',
    reporter: users.find(u => u.id === 'user-4')!,
    comments: [],
  },
    {
    id: 'pune-9',
    title: 'Fallen Tree on Senapati Bapat Road',
    description: 'A large tree has fallen across Senapati Bapat Road near the Symbiosis College, blocking one lane of traffic completely. This is causing a major jam.',
    category: 'Fallen Trees or Branches Obstructing Road',
    status: 'Open',
    priority: 'High',
    priorityJustification: 'A fallen tree blocking a major road requires immediate removal to restore traffic flow and prevent accidents.',
    imageUrl: 'https://picsum.photos/seed/fallentree/600/400',
    imageHint: 'fallen tree',
    location: {
        lat: 18.530,
        lng: 73.828,
        address: 'Senapati Bapat Road, Pune',
    },
    votes: { up: 65, down: 0 },
    createdAt: '2024-05-31T14:00:00Z',
    reporter: users.find(u => u.id === 'user-3')!,
    comments: [],
  },
  {
    id: 'pune-7',
    title: 'Broken Benches at Saras Baug',
    description: 'Many of the public benches inside Saras Baug are broken and have sharp edges. They are unusable and dangerous for children.',
    category: 'Maintenance of Public Parks / Gardens',
    status: 'Open',
    priority: 'Low',
    priorityJustification: 'Broken park equipment is a minor maintenance issue with a low risk of serious injury.',
    imageUrl: 'https://picsum.photos/seed/brokenbench/600/400',
    imageHint: 'broken bench',
    location: {
      lat: 18.504,
      lng: 73.853,
      address: 'Saras Baug, Sadashiv Peth, Pune',
    },
    votes: { up: 12, down: 1 },
    createdAt: '2024-05-29T16:00:00Z',
    reporter: users.find(u => u.id === 'user-1')!,
    comments: [],
  },
  {
    id: 'wagholi-7',
    title: 'Unfinished Road Work Danger',
    description: 'Road widening work was started on the main road towards EON IT park but has been left unfinished for months, with open pits and no warning signs.',
    category: 'Potholes / Damaged Road Surface',
    status: 'Open',
    priority: 'Medium',
    priorityJustification: 'Unfinished roadwork with safety hazards presents a persistent risk to drivers.',
    imageUrl: 'https://picsum.photos/seed/roadwork/600/400',
    imageHint: 'road construction',
    location: {
      lat: 18.575,
      lng: 73.960,
      address: 'Nagar Road, Wagholi, Pune',
    },
    votes: { up: 60, down: 2 },
    createdAt: '2024-05-25T13:00:00Z',
    reporter: users.find(u => u.id === 'user-2')!,
    comments: [],
  }
];

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

    