import { notFound } from "next/navigation";
import { getIssues } from "@/lib/data";
import { IssueDetail } from "@/components/feed/IssueDetail";

interface IssuePageProps {
  params: {
    issueId: string;
  };
}

export default async function IssuePage({ params }: IssuePageProps) {
  const issues = await getIssues();
  const issue = issues.find(i => i.id === params.issueId);

  if (!issue) {
    notFound();
  }

  return <IssueDetail initialIssue={issue} />;
}
