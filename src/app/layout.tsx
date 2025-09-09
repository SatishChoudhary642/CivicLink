import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import { AuthProvider } from '@/context/AuthContext';
import { IssueProvider } from '@/context/IssueContext';
import { getUsers } from '@/lib/users';

export const metadata: Metadata = {
  title: 'CivicLink',
  description: 'Report and track civic issues in your community.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUsers = await getUsers();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Playfair+Display:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""/>
      </head>
      <body className="font-body antialiased">
        <IssueProvider initialUsers={initialUsers}>
          <AuthProvider initialUsers={initialUsers}>
            <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </AuthProvider>
        </IssueProvider>
      </body>
    </html>
  );
}
