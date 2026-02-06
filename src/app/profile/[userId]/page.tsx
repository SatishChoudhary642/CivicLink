'use client';
 
import type { Issue, User } from "@/lib/types";
import { UserProfile } from "@/components/profile/UserProfile";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useIssues } from "@/context/IssueContext";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { users, issues } = useIssues();
  const [user, setUser] = useState<User | null>(null);
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (users.length > 0) {
      const foundUser = users.find(u => u.id === userId);
      if (foundUser) {
        setUser(foundUser);
        setUserIssues(issues.filter(issue => issue.reporter.id === foundUser.id));
      }
      setLoading(false);
    }
  }, [userId, users, issues]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return notFound();
  }

  return (
    <UserProfile user={user} issues={userIssues} />
  );
}
