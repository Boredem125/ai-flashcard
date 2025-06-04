
'use client';

import { cn } from '@/lib/utils';

interface FlashcardComponentProps {
  frontContent: string;
  backContent: string;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({
  frontContent,
  backContent,
  isFlipped,
  onFlip,
  className,
}) => {
  return (
    <div className={cn("perspective w-full max-w-xl h-80 mx-auto", className)}>
      <div
        className={cn(
          "relative w-full h-full transform-style-3d transition-transform duration-500 ease-out", // Changed duration and easing
          "bg-card text-card-foreground border border-border rounded-lg shadow-xl",
          isFlipped ? 'rotate-y-180' : ''
        )}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFlip(); }}
        aria-pressed={isFlipped}
        aria-label={isFlipped ? `Showing back of card. Content: ${backContent}` : `Showing front of card. Content: ${frontContent}`}
      >
        {/* Front of the card */}
        <div className="absolute inset-0 p-6 flex flex-col items-center justify-center backface-hidden">
          <p className="text-2xl font-semibold text-center">{frontContent}</p>
        </div>

        {/* Back of the card */}
        <div className="absolute inset-0 p-6 flex flex-col items-center justify-center backface-hidden rotate-y-180">
          <p className="text-xl text-center">{backContent}</p>
        </div>
      </div>
      <style jsx>{`
        .perspective {
          perspective: 1500px; /* Increased perspective */
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default FlashcardComponent;
