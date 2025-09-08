'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { getInitialUsers } from '@/lib/data';
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

const USERS_STORAGE_KEY = 'civiclink-users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
        // Load users from localStorage or use initial data
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        const initialUsers = storedUsers ? JSON.parse(storedUsers) : getInitialUsers();
        setAllUsers(initialUsers);

        // Check for a logged-in user in localStorage on initial load
        let storedUser = localStorage.getItem('civiclink-user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.id === 'admin') {
                setUser(adminUser);
            } else {
                const foundUser = initialUsers.find((u: User) => u.id === parsedUser.id);
                if (foundUser) setUser(foundUser);
            }
        } else {
            // If no user is stored, default to the first user for easier development
            const defaultUser = initialUsers[0];
            if (defaultUser) {
                localStorage.setItem('civiclink-user', JSON.stringify(defaultUser));
                setUser(defaultUser);
            }
        }
    } catch (error) {
        console.error("Failed to initialize auth from localStorage", error);
        localStorage.removeItem('civiclink-user');
        localStorage.removeItem(USERS_STORAGE_KEY);
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
    // Ensure we are checking against the most recent list of users.
    const currentUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const foundUser = currentUsers.find((u: User) => u.name.toLowerCase().replace(' ', '.') + '@example.com' === email.toLowerCase());

    if (foundUser) {
      localStorage.setItem('civiclink-user', JSON.stringify(foundUser));
      setUser(foundUser);
      setAllUsers(currentUsers); // Sync state
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
    
    const currentUsers = allUsers;

    const existingUser = currentUsers.find(u => u.name.toLowerCase().replace(' ', '.') + '@example.com' === email.toLowerCase());
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
    
    const updatedUsers = [...currentUsers, newUser];
    setAllUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    setLoading(false);
    return newUser;
  };

  // Display a loading skeleton while checking auth status
  if (loading && allUsers.length === 0) {
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
