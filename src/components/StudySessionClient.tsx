'use client';

import type { Flashcard, FlashcardSet } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import FlashcardComponent from './FlashcardComponent';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RotateCcw, Save, ChevronsLeft, ChevronsRight, Brain } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { getAdaptedFlashcardsAction } from '@/lib/actions';
import { saveFlashcardSet as saveSetToLocalStorage, generateId } from '@/lib/flashcard-store';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from './ui/label';

interface StudySessionClientProps {
  initialFlashcards: Flashcard[];
  initialSetName?: string;
  initialSetId?: string;
}

type UserPerformanceEntry = { flashcardIndex: number; correct: boolean };

const StudySessionClient: React.FC<StudySessionClientProps> = ({
  initialFlashcards,
  initialSetName,
  initialSetId,
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userPerformance, setUserPerformance] = useState<UserPerformanceEntry[]>([]);
  const [isLoadingAdapted, setIsLoadingAdapted] = useState(false);
  const [setName, setSetName] = useState(initialSetName || '');
  const [setId, setSetId] = useState(initialSetId);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const currentCard = flashcards[currentCardIndex];

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleResponse = useCallback(async (correct: boolean) => {
    setUserPerformance(prev => [...prev, { flashcardIndex: currentCardIndex, correct }]);
    setIsFlipped(false); // Auto-flip to front for next card
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // End of current pass
      toast({
        title: "Pass Complete!",
        description: "Adapting flashcards based on your performance...",
      });
      setIsLoadingAdapted(true);
      try {
        const adaptedCards = await getAdaptedFlashcardsAction(flashcards, userPerformance);
        setFlashcards(adaptedCards);
        setCurrentCardIndex(0);
        setUserPerformance([]); // Reset performance for next pass
        toast({
          title: "Flashcards Adapted!",
          description: "Starting a new pass with reordered cards.",
        });
      } catch (error) {
        toast({
          title: "Error Adapting Cards",
          description: "Could not adapt flashcards. Continuing with current order.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAdapted(false);
      }
    }
  }, [currentCardIndex, flashcards, userPerformance, toast]);

  const handleSaveSet = () => {
    if (!setName.trim()) {
      toast({ title: "Set Name Required", description: "Please enter a name for your flashcard set.", variant: "destructive" });
      return;
    }
    const newSetId = setId || generateId();
    const set: FlashcardSet = {
      id: newSetId,
      name: setName.trim(),
      flashcards: initialFlashcards, // Save the original, unadapted set
      createdAt: new Date().toISOString(),
    };
    saveSetToLocalStorage(set);
    setSetId(newSetId); // Update setId if it was newly generated
    setShowSaveDialog(false);
    toast({ title: "Set Saved!", description: `"${set.name}" has been saved.` });
    if (!initialSetId) { // If it was a new set, redirect to its study page
        router.push(`/study/${newSetId}`);
    }
  };
  
  const navigateCard = (direction: 'next' | 'prev') => {
    setIsFlipped(false);
    if (direction === 'next' && currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else if (direction === 'prev' && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  if (!currentCard) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No flashcards to display. This set might be empty.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
      </div>
    );
  }

  const progressPercentage = flashcards.length > 0 ? ((currentCardIndex + 1) / flashcards.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center space-y-8 py-8">
      <div className="w-full max-w-xl text-center">
        {initialSetName && <h2 className="text-3xl font-headline mb-2">{initialSetName}</h2>}
        <p className="text-muted-foreground">Card {currentCardIndex + 1} of {flashcards.length}</p>
        <Progress value={progressPercentage} className="mt-2 h-3" />
      </div>

      <FlashcardComponent
        frontContent={currentCard.front}
        backContent={currentCard.back}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-xl">
        {isFlipped ? (
          <>
            <Button
              onClick={() => handleResponse(true)}
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto flex-1"
              disabled={isLoadingAdapted}
            >
              <CheckCircle className="mr-2 h-5 w-5" /> Correct
            </Button>
            <Button
              onClick={() => handleResponse(false)}
              variant="destructive"
              className="w-full sm:w-auto flex-1"
              disabled={isLoadingAdapted}
            >
              <XCircle className="mr-2 h-5 w-5" /> Incorrect
            </Button>
          </>
        ) : (
          <Button onClick={handleFlip} className="w-full sm:w-auto" variant="secondary" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" /> Flip Card
          </Button>
        )}
      </div>
      
      <div className="flex items-center justify-between w-full max-w-xl mt-4">
        <Button onClick={() => navigateCard('prev')} disabled={currentCardIndex === 0} variant="outline" size="icon" aria-label="Previous card">
            <ChevronsLeft />
        </Button>
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="min-w-[120px]" onClick={() => { if(!setId) setShowSaveDialog(true); else handleSaveSet();}}>
              <Save className="mr-2 h-4 w-4" /> {setId ? 'Update Set' : 'Save Set'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save Flashcard Set</DialogTitle>
              <DialogDescription>
                Enter a name for your new flashcard set.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="setName" className="text-right">
                  Set Name
                </Label>
                <Input
                  id="setName"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Chapter 1 Biology"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              <Button type="submit" onClick={handleSaveSet}>Save Set</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={() => navigateCard('next')} disabled={currentCardIndex === flashcards.length - 1} variant="outline" size="icon" aria-label="Next card">
            <ChevronsRight />
        </Button>
      </div>

      {isLoadingAdapted && (
        <div className="flex items-center text-primary mt-4">
          <Brain className="animate-pulse mr-2 h-5 w-5" />
          <span>Adapting flashcards...</span>
        </div>
      )}
    </div>
  );
};

export default StudySessionClient;
