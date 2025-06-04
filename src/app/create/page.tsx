
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextIcon, FileUp, Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Flashcard } from '@/lib/types';
import { generateFlashcardsFromTopicAction, generateFlashcardsFromFileAction } from '@/lib/actions';
import StudySessionClient from '@/components/StudySessionClient';

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.ms-powerpoint" // .ppt
];

export default function CreateFlashcardsPage() {
  const [mode, setMode] = useState<'topic' | 'file'>('topic');
  const [topic, setTopic] = useState('');
  const [numCards, setNumCards] = useState(5);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[] | null>(null);
  const [generatedSetName, setGeneratedSetName] = useState<string>('');

  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, PPT, or PPTX file.",
          variant: "destructive",
        });
        setFile(null);
        // Clear the file input
        event.target.value = '';
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedFlashcards(null);

    try {
      let cards: Flashcard[] = [];
      let setNameSuggestion = '';

      if (mode === 'topic') {
        if (!topic.trim()) {
          toast({ title: "Topic Required", description: "Please enter a topic.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        cards = await generateFlashcardsFromTopicAction(topic, numCards);
        setNameSuggestion = topic;
      } else {
        if (!file) {
          toast({ title: "File Required", description: "Please select a file to upload.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const documentDataUri = reader.result as string;
          try {
            cards = await generateFlashcardsFromFileAction(documentDataUri);
            setNameSuggestion = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
            setGeneratedFlashcards(cards);
            setGeneratedSetName(setNameSuggestion);
            toast({ title: "Flashcards Generated!", description: `${cards.length} cards created from ${file.name}.` });
          } catch (e: any) {
            toast({ title: "Generation Failed", description: e.message || "Could not generate flashcards from file.", variant: "destructive" });
          } finally {
            setIsLoading(false);
          }
        };
        reader.onerror = () => {
            toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
            setIsLoading(false);
        };
        // Since FileReader is async, return here and let onload handle the rest
        return;
      }
      
      if (cards.length > 0) {
        setGeneratedFlashcards(cards);
        setGeneratedSetName(setNameSuggestion);
        toast({ title: "Flashcards Generated!", description: `${cards.length} cards created for "${setNameSuggestion}".` });
      } else {
         toast({ title: "No Flashcards Generated", description: "The AI couldn't generate flashcards for this input.", variant: "destructive" });
      }

    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
    } finally {
      if (mode === 'topic') setIsLoading(false); // Only set for topic mode here, file mode is handled in FileReader onload
    }
  };

  if (generatedFlashcards) {
    return <StudySessionClient initialFlashcards={generatedFlashcards} initialSetName={generatedSetName} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline flex items-center justify-center">
            <Lightbulb className="mr-2 h-8 w-8 text-primary" /> Create New Flashcards
          </CardTitle>
          <CardDescription>
            Choose your method: generate from a topic or upload a document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'topic' | 'file')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="topic"><TextIcon className="mr-2 h-4 w-4" />From Topic</TabsTrigger>
              <TabsTrigger value="file"><FileUp className="mr-2 h-4 w-4" />From File (PDF/PPT/PPTX)</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit} className="space-y-6">
              <TabsContent value="topic">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic" className="text-base">Topic</Label>
                    <Input
                      id="topic"
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Photosynthesis, World War II"
                      className="mt-1 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numCards" className="text-base">Number of Flashcards</Label>
                    <Input
                      id="numCards"
                      type="number"
                      value={numCards}
                      onChange={(e) => setNumCards(Math.max(1, parseInt(e.target.value)))}
                      min="1"
                      max="50"
                      className="mt-1 text-base"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="file">
                <div className="space-y-2">
                  <Label htmlFor="fileUpload" className="text-base">Upload Document (PDF, PPT, or PPTX)</Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    accept={ACCEPTED_FILE_TYPES.join(',')}
                    onChange={handleFileChange}
                    className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
                </div>
              </TabsContent>
              <Button type="submit" className="w-full text-lg py-6 font-headline" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Lightbulb className="mr-2 h-5 w-5" />
                )}
                {isLoading ? 'Generating...' : 'Generate Flashcards'}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
