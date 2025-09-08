export type IssueStatus = "Open" | "In Progress" | "Resolved" | "Rejected";

export type IssueCategory = "Pothole" | "Graffiti" | "Damaged Sign" | "Streetlight Out" | "Trash Overflow" | "Other";

export type User = {
  id: string;
  name: string;
  email: string;
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
