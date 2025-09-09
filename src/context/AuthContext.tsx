
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { signupUser } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy admin user for prototyping
const adminUser: User = {
    id: 'admin',
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: '123',
    avatarUrl: 'https://picsum.photos/seed/Admin/40/40',
    karma: 999,
    civicScore: 9999
};


export function AuthProvider({ children, initialUsers }: { children: React.ReactNode, initialUsers: User[] }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    try {
        // Check for a logged-in user in localStorage on initial load
        const storedUser = localStorage.getItem('civiclink-user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to initialize auth from localStorage", error);
        localStorage.removeItem('civiclink-user');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email.toLowerCase() === adminUser.email && password === adminUser.password) {
        localStorage.setItem('civiclink-user', JSON.stringify(adminUser));
        setUser(adminUser);
        setLoading(false);
        return adminUser;
    }
    
    // For prototype, we'll check against the initial users list passed as a prop.
    const foundUser = initialUsers.find((u: User) => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser && foundUser.password === password) {
      localStorage.setItem('civiclink-user', JSON.stringify(foundUser));
      setUser(foundUser);
      setLoading(false);
      return foundUser;
    } else {
      setLoading(false);
      throw new Error('Invalid email or password');
    }
  };

  const logout = () => {
    localStorage.removeItem('civiclink-user');
    setUser(null);
  };

  const signup = async (name: string, email: string, password: string): Promise<User> => {
     setLoading(true);
    
    try {
      const result = await signupUser({ name, email, password });
      if (result.success && result.user) {
        // Refetch users might be needed here in a real app, but for now we proceed
        return result.user;
      } else {
        throw new Error(result.error || "An unexpected error occurred during signup.");
      }
    } catch (error) {
        throw error;
    } finally {
        setLoading(false);
    }
  };

  // Display a loading skeleton while checking auth status
  if (loading) {
      return (
           <div className="flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95">
                  <div className="container flex h-14 items-center">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex-1" />
                    <Skeleton className="h-8 w-20" />
                  </div>
              </header>
              <main className="flex-1 p-8">
                  <Skeleton className="h-48 w-full" />
              </main>
           </div>
      )
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
