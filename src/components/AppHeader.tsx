
'use client';

import Link from 'next/link';
import { Zap, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';

const AppHeader = () => {
  const { user, logout, loading } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold">
          <Zap size={28} className="text-accent-foreground" />
          FlashGenius
        </Link>
        <nav className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-20 animate-pulse bg-primary-foreground/20 rounded-md" />
          ) : user ? (
            <>
              <Link href="/create" className="hover:text-accent-foreground/80 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                Create New Set
              </Link>
              <Button onClick={logout} variant="ghost" size="sm" className="hover:bg-primary-foreground/10 hover:text-accent-foreground">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-accent-foreground/80 transition-colors px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <LogIn className="mr-1 h-4 w-4" /> Login
              </Link>
              <Link href="/signup" className="bg-accent-foreground/10 hover:bg-accent-foreground/20 text-primary-foreground px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <UserPlus className="mr-1 h-4 w-4" /> Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
