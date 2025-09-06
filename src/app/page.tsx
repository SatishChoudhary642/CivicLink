import Image from 'next/image';
import { issues } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function Home() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Open':
        return 'secondary';
      case 'In Progress':
        return 'default';
      case 'Resolved':
        return 'outline';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Community Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          View and track civic issues reported by the community.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-[400px] lg:h-full">
            <CardHeader>
              <CardTitle>Issue Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[300px] lg:h-[500px] w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <Image
                  src="https://picsum.photos/1200/800"
                  alt="Map of reported issues"
                  fill
                  className="object-cover"
                  data-ai-hint="city map pins"
                />
                <div className="absolute inset-0 bg-black/20" />
                <p className="z-10 font-semibold text-white">Interactive Map Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <h2 className="mb-4 font-headline text-2xl font-bold">Recent Issues</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {issues.map((issue) => (
              <Card key={issue.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{issue.title}</h3>
                    <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{issue.location.address}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={issue.reporter.avatarUrl} alt={issue.reporter.name} />
                        <AvatarFallback>{issue.reporter.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{issue.reporter.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="font-bold">{issue.votes.up}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
