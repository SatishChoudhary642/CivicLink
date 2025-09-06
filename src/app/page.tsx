import Image from 'next/image';
import { issues } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowBigDown, ArrowBigUp, MessageSquare } from 'lucide-react';
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
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-headline tracking-tight">Community Feed</h1>
          <p className="text-muted-foreground mt-2">
            View, vote, and discuss civic issues in your community.
          </p>
        </header>

        <div className="space-y-4">
          {issues.map((issue) => (
            <Card key={issue.id} className="flex transition-shadow hover:shadow-md">
              <div className="flex flex-col items-center p-2 sm:p-4 bg-muted/50 border-r">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-1 text-muted-foreground hover:text-primary">
                    <ArrowBigUp className="h-5 w-5" />
                  </Button>
                  <span className="font-bold text-sm my-1">{issue.votes.up - issue.votes.down}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-1 text-muted-foreground hover:text-blue-600">
                    <ArrowBigDown className="h-5 w-5" />
                  </Button>
              </div>
              <div className='flex-1'>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={issue.reporter.avatarUrl} alt={issue.reporter.name} />
                        <AvatarFallback>{issue.reporter.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>Posted by {issue.reporter.name}</span>
                      <span>&bull;</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
                    
                    <div className="relative h-64 w-full rounded-md overflow-hidden bg-muted mb-4">
                        <Image
                            src={issue.imageUrl}
                            alt={issue.title}
                            fill
                            className="object-cover"
                            data-ai-hint={issue.imageHint}
                        />
                    </div>
                  
                    <div className="flex items-center justify-between">
                        <div className='flex items-center gap-2'>
                            <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                <span className='text-xs'>Comments</span>
                            </Button>
                             <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                        </div>
                         <p className="text-sm text-muted-foreground">{issue.location.address}</p>
                    </div>

                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
