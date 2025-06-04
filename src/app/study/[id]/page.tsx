'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StudySessionClient from '@/components/StudySessionClient';
import type { FlashcardSet } from '@/lib/types';
import { getFlashcardSetById } from '@/lib/flashcard-store';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function StudyFlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const setId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [set, setSet] = useState<FlashcardSet | null | undefined>(undefined); // undefined for loading state

  useEffect(() => {
    if (setId) {
      const loadedSet = getFlashcardSetById(setId);
      setSet(loadedSet);
    }
  }, [setId]);

  if (set === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading flashcard set...</p>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-4">Flashcard Set Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The flashcard set you are trying to access does not exist or could not be loaded.
        </p>
        <Button onClick={() => router.push('/')}>Go to Homepage</Button>
      </div>
    );
  }

  return (
    <StudySessionClient 
      initialFlashcards={set.flashcards} 
      initialSetName={set.name}
      initialSetId={set.id}
    />
  );
}
