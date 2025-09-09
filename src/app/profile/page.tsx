'use client';

import { dataStore } from "@/lib/data";
import type { Issue } from "@/lib/types";
import { UserProfile } from "@/components/profile/UserProfile";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [myIssues, setMyIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (user) {
        const allIssues = dataStore.getIssues();
        setMyIssues(allIssues.filter(issue => issue.reporter.id === user.id));
    }
  }, [user]);


  if (!user) {
    // Should not happen if page is protected, but as a fallback
    router.push('/login');
    return null;
  }

  return (
    <UserProfile user={user} issues={myIssues} />
  );
}
