'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Mountain } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Mountain className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold">CivicLink</span>
        </Link>
        <nav className="hidden flex-1 items-center space-x-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            Dashboard
          </Link>
          {user && (
            <>
              <Link
                href="/my-reports"
                className="text-foreground/60 transition-colors hover:text-foreground/80"
              >
                My Reports
              </Link>
              <Link
                href="/profile"
                className="text-foreground/60 transition-colors hover:text-foreground/80"
              >
                Profile
              </Link>
               {user.id === 'admin' && (
                <Link
                  href="/admin"
                  className="text-foreground/60 transition-colors hover:text-foreground/80"
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
              <Button asChild>
                <Link href="/report">Report Issue</Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Mountain className="h-6 w-6 text-primary" />
                  <span className="font-headline font-bold">CivicLink</span>
                </Link>
                <Link href="/" className="hover:text-foreground">
                  Dashboard
                </Link>
                {user && (
                  <>
                    <Link
                      href="/my-reports"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      My Reports
                    </Link>
                    <Link
                      href="/profile"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Profile
                    </Link>
                    {user.id === 'admin' && (
                        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                            Admin
                        </Link>
                    )}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
