'use client';

import { issues, users } from "@/lib/data";
import type { Issue } from "@/lib/types";
import { UserProfile } from "@/components/profile/UserProfile";
import { notFound, useParams } from "next/navigation";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const user = users.find(u => u.id === userId);

  if (!user) {
    notFound();
  }

  const userIssues: Issue[] = issues.filter(issue => issue.reporter.id === user.id);

  return (
    <UserProfile user={user} issues={userIssues} />
  );
}
