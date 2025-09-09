
export type IssueStatus = "Open" | "In Progress" | "Resolved" | "Rejected";

export type Priority = "High" | "Medium" | "Low";

export type IssueCategory = 
  | "Garbage Dump / Overflowing Bins"
  | "Garbage Vehicle Not Arrived"
  | "Sweeping Not Done"
  | "Illegal Dumping / Debris"
  | "Dead Animal Removal"
  | "Burning of Garbage"
  | "Potholes / Damaged Road Surface"
  | "Malfunctioning or Broken Streetlights"
  | "Damaged Footpath or Paving Slabs"
  | "Fallen Trees or Branches Obstructing Road"
  | "Open Manhole or Drain Cover"
  | "Sewerage Overflow"
  | "Blocked Drains"
  | "Stagnant Water on Roads"
  | "Water Pipe Leakage"
  | "Public Toilet Not Cleaned"
  | "No Water Supply in Public Toilet"
  | "No Electricity in Public Toilet"
  | "Blocked Public Toilet"
  | "Maintenance of Public Parks / Gardens"
  | "Public Urination"
  | "Illegal Banners or Hoardings"
  | "Stray Animal Nuisance"
  | "Other";

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // For prototype only
  avatarUrl: string;
  karma: number;
  civicScore: number;
};

export type Comment = {
  id: string;
  text: string;
  user: User;
  createdAt: string;
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority?: Priority;
  priorityJustification?: string;
  imageUrl: string;
  imageHint: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  votes: {
    up: number;
    down: number;
  };
  createdAt: string;
  reporter: User;
  comments: Comment[];
};
