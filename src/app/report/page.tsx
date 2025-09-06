import { ReportForm } from '@/components/report/ReportForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ReportPage() {
  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Report a New Issue</CardTitle>
          <CardDescription>
            Help improve your community by reporting issues. Fill out the form below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm />
        </CardContent>
      </Card>
    </div>
  );
}
