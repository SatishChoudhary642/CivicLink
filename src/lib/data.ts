import type { Issue, IssueCategory } from './types';

export const issues: Issue[] = [
  {
    id: '1',
    title: 'Large pothole on Main St',
    description: 'A very large and dangerous pothole has formed in the middle of Main Street near the intersection with Oak Ave. It has already caused a flat tire on my car.',
    category: 'Pothole',
    status: 'Open',
    imageUrl: 'https://picsum.photos/600/400',
    imageHint: 'pothole road',
    location: {
      lat: 34.0522,
      lng: -118.2437,
      address: '123 Main St, Los Angeles, CA',
    },
    votes: {
      up: 15,
      down: 1,
    },
    createdAt: '2024-05-20T10:00:00Z',
    reporter: {
        name: 'Jane Doe',
        avatarUrl: 'https://picsum.photos/seed/Jane/40/40'
    }
  },
  {
    id: '2',
    title: 'Graffiti on park wall',
    description: 'The main wall of the central park has been vandalized with spray paint. It is an eyesore for the community.',
    category: 'Graffiti',
    status: 'In Progress',
    imageUrl: 'https://picsum.photos/600/401',
    imageHint: 'graffiti wall',
    location: {
      lat: 34.055,
      lng: -118.245,
      address: '456 Central Park, Los Angeles, CA',
    },
    votes: {
      up: 5,
      down: 0,
    },
    createdAt: '2024-05-19T14:30:00Z',
    reporter: {
        name: 'John Smith',
        avatarUrl: 'https://picsum.photos/seed/John/40/40'
    }
  },
  {
    id: '3',
    title: 'Stop sign is broken',
    description: 'The stop sign at the corner of Elm and 5th has been knocked down. This is a very dangerous intersection for children walking to school.',
    category: 'Damaged Sign',
    status: 'Resolved',
    imageUrl: 'https://picsum.photos/601/400',
    imageHint: 'stop sign',
    location: {
      lat: 34.05,
      lng: -118.24,
      address: '789 Elm St, Los Angeles, CA',
    },
    votes: {
      up: 22,
      down: 0,
    },
    createdAt: '2024-05-18T08:00:00Z',
    reporter: {
        name: 'Emily White',
        avatarUrl: 'https://picsum.photos/seed/Emily/40/40'
    }
  },
    {
    id: '4',
    title: 'Streetlight out on 4th Ave',
    description: 'The streetlight at the pedestrian crossing has been out for three days. It is very dark and unsafe at night.',
    category: 'Streetlight Out',
    status: 'Open',
    imageUrl: 'https://picsum.photos/600/402',
    imageHint: 'street light',
    location: {
      lat: 34.058,
      lng: -118.25,
      address: '321 4th Ave, Los Angeles, CA',
    },
    votes: {
      up: 8,
      down: 0,
    },
    createdAt: '2024-05-21T11:00:00Z',
    reporter: {
        name: 'Michael Brown',
        avatarUrl: 'https://picsum.photos/seed/Michael/40/40'
    }
  },
];

export const issueCategories: IssueCategory[] = ["Pothole", "Graffiti", "Damaged Sign", "Streetlight Out", "Trash Overflow", "Other"];
