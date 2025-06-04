import Link from 'next/link';
import { Zap } from 'lucide-react';

const AppHeader = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold">
          <Zap size={28} className="text-accent-foreground" />
          FlashGenius
        </Link>
        <nav>
          <Link href="/create" className="hover:text-accent-foreground/80 transition-colors px-3 py-2 rounded-md text-sm font-medium">
            Create New Set
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
