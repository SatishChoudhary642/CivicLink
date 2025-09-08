'use client';

import { issues, getInitialUsers } from "@/lib/data";
import type { Issue, User } from "@/lib/types";
import { UserProfile } from "@/components/profile/UserProfile";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    // Should not happen if page is protected, but as a fallback
    router.push('/login');
    return null;
  }
  
  // In a real app, you might fetch user-specific data here.
  // For the prototype, we filter the global issues list.
  const myIssues: Issue[] = issues.filter(issue => issue.reporter.id === user.id);

  return (
    <UserProfile user={user} issues={myIssues} />
  );
}
