import { issues, users } from "@/lib/data";
import type { Issue, User } from "@/lib/types";
import { UserProfile } from "@/components/profile/UserProfile";
import { notFound } from "next/navigation";

interface ProfilePageParams {
    params: {
        userId: string;
    }
}

export default function ProfilePage({ params }: ProfilePageParams) {
  const user = users.find(u => u.id === params.userId);
  if (!user) {
    notFound();
  }

  const userIssues: Issue[] = issues.filter(issue => issue.reporter.id === user.id);

  return (
    <UserProfile user={user} issues={userIssues} />
  );
}
