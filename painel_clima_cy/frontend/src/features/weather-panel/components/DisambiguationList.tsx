import { MapPinned } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlaceCandidate } from '../types';

interface DisambiguationListProps {
  candidates: PlaceCandidate[];
  disabled: boolean;
  onSelect: (place: PlaceCandidate) => Promise<void>;
}

export function DisambiguationList({ candidates, disabled, onSelect }: DisambiguationListProps) {
  if (candidates.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="place-options" className="rounded-lg bg-surface-card p-4">
      <h2 className="font-display text-2xl text-ink" id="place-options">
        Escolha o lugar correto
      </h2>
      <div className="mt-3 grid gap-2">
        {candidates.map((candidate) => (
          <Button
            className="h-auto cursor-pointer justify-start rounded-md border-hairline bg-canvas px-4 py-3 text-left text-ink hover:bg-surface-soft"
            disabled={disabled}
            key={candidate.id}
            onClick={() => {
              void onSelect(candidate);
            }}
            type="button"
            variant="outline"
          >
            <MapPinned aria-hidden="true" />
            <span className="flex flex-col">
              <span className="text-sm font-semibold">{candidate.name}</span>
              <span className="text-sm font-normal text-muted-foreground">{candidate.label}</span>
            </span>
          </Button>
        ))}
      </div>
    </section>
  );
}
