'use client';

import { dataStore, getInitialUsers } from "@/lib/data";
import type { Issue } from "@/lib/types";
import { UserProfile } from "@/components/profile/UserProfile";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const users = getInitialUsers();
  const user = users.find(u => u.id === userId);
  const [userIssues, setUserIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (user) {
      const allIssues = dataStore.getIssues();
      setUserIssues(allIssues.filter(issue => issue.reporter.id === user.id));
    }
  }, [user]);

  if (!user) {
    notFound();
  }

  return (
    <UserProfile user={user} issues={userIssues} />
  );
}
