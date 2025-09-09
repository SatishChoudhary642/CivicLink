'use client';

import type { Issue } from "@/lib/types";
import { UserProfile } from "@/components/profile/UserProfile";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useIssues } from "@/context/IssueContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const { issues } = useIssues();
  const router = useRouter();
  const [myIssues, setMyIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (user) {
        setMyIssues(issues.filter(issue => issue.reporter.id === user.id));
    }
  }, [user, issues]);


  if (!user) {
    // Should not happen if page is protected, but as a fallback
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <UserProfile user={user} issues={myIssues} />
  );
}
