
'use client';

import Link from 'next/link';
import { Zap, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';

const AppHeader = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold">
          <Zap size={28} className="text-accent-foreground" />
          FlashGenius
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/create" passHref>
            <Button variant="ghost" className="hover:bg-primary-foreground/10 hover:text-accent-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Set
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
