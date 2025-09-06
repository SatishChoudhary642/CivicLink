import { issues, users } from "@/lib/data";
import type { Issue, User } from "@/lib/types";
import { UserProfile } from "@/components/profile/UserProfile";

// In a real app, you would get the current user from your authentication system.
const currentUserId = "user-1";

export default function ProfilePage() {
  const currentUser = users.find(u => u.id === currentUserId);
  if (!currentUser) {
    return <div className="container mx-auto p-8">User not found.</div>
  }

  const myIssues: Issue[] = issues.filter(issue => issue.reporter.id === currentUser.id);

  return (
    <UserProfile user={currentUser} issues={myIssues} />
  );
}
