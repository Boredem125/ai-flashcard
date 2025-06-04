'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, BookOpen, Trash2, Edit3, Play } from 'lucide-react';
import type { FlashcardSet } from '@/lib/types';
import { getSavedFlashcardSets, deleteFlashcardSet } from '@/lib/flashcard-store';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function HomePage() {
  const [savedSets, setSavedSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSavedSets(getSavedFlashcardSets());
    setIsLoading(false);
  }, []);

  const handleDeleteSet = (id: string) => {
    deleteFlashcardSet(id);
    setSavedSets(getSavedFlashcardSets());
  };

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-card rounded-xl shadow-lg">
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">Welcome to FlashGenius!</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Transform your study materials into interactive flashcards. Upload documents, enter topics, and let AI power your learning.
        </p>
        <Link href="/create">
          <Button size="lg" className="font-headline">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Flashcard Set
          </Button>
        </Link>
      </section>

      <section>
        <h2 className="text-3xl font-headline font-semibold mb-6 flex items-center">
          <BookOpen className="mr-3 h-7 w-7 text-primary" /> Your Flashcard Sets
        </h2>
        {isLoading ? (
          <p>Loading your saved sets...</p>
        ) : savedSets.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">You haven&apos;t saved any flashcard sets yet.</p>
              <Link href="/create" className="mt-4 inline-block">
                <Button variant="secondary">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create your first set
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSets.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((set) => (
              <Card key={set.id} className="flex flex-col justify-between shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{set.name}</CardTitle>
                  <CardDescription>
                    {set.flashcards.length} card{set.flashcards.length !== 1 ? 's' : ''} &bull; Created {formatDistanceToNow(new Date(set.createdAt), { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Preview of first few cards could go here if desired */}
                </CardContent>
                <CardFooter className="flex justify-between items-center gap-2">
                   <Link href={`/study/${set.id}`} passHref>
                    <Button variant="default" size="sm" className="flex-1">
                      <Play className="mr-2 h-4 w-4" /> Study
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" aria-label="Delete set">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the flashcard set &quot;{set.name}&quot;.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteSet(set.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
