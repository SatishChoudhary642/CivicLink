'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { users as allUsers } from '@/lib/data';
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
    avatarUrl: 'https://picsum.photos/seed/Admin/40/40',
    karma: 999,
    civicScore: 9999
};
const adminCredentials = {
    email: 'admin@gmail.com',
    password: '123'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    setLoading(true);
    try {
        let storedUser = localStorage.getItem('civiclink-user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.id === 'admin') {
                setUser(adminUser);
            } else {
                const foundUser = allUsers.find(u => u.id === parsedUser.id);
                if (foundUser) setUser(foundUser);
            }
        } else {
            // If no user is stored, default to the first user for easier development
            const defaultUser = allUsers[0];
            if (defaultUser) {
                localStorage.setItem('civiclink-user', JSON.stringify(defaultUser));
                setUser(defaultUser);
            }
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('civiclink-user');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email.toLowerCase() === adminCredentials.email && password === adminCredentials.password) {
        localStorage.setItem('civiclink-user', JSON.stringify(adminUser));
        setUser(adminUser);
        setLoading(false);
        return adminUser;
    }
    
    // For prototype, we'll just find a user by email. Password isn't checked.
    const foundUser = allUsers.find(u => u.name.toLowerCase().replace(' ', '.') + '@example.com' === email.toLowerCase());

    if (foundUser) {
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const existingUser = allUsers.find(u => u.name.toLowerCase().replace(' ', '.') + '@example.com' === email.toLowerCase());
    if (existingUser) {
        setLoading(false);
        throw new Error("An account with this email already exists.");
    }

    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        avatarUrl: `https://picsum.photos/seed/${name}/40/40`,
        karma: 0,
        civicScore: 0,
    };
    
    // In a real app, you'd save this to a database
    allUsers.push(newUser);
    
    setLoading(false);
    return newUser;
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
