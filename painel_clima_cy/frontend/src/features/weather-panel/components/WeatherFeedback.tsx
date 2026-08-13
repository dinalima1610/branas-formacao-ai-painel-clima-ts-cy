import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FriendlyWeatherError } from '../lib/errors';

interface LoadingViewProps {
  label: string;
}

interface ErrorViewProps {
  error: FriendlyWeatherError;
  onRetry: () => Promise<void>;
}

export function EmptyState() {
  return (
    <section className="rounded-lg border border-dashed border-hairline bg-canvas-card p-6 text-body">
      <p className="font-display text-2xl font-normal tracking-[-0.02em] text-ink">Busque uma cidade para ver o clima.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Você também pode usar sua localização quando quiser compartilhar essa permissão.
      </p>
    </section>
  );
}

export function LoadingView({ label }: LoadingViewProps) {
  return (
    <div aria-live="polite" className="flex items-center gap-3 rounded-lg border border-hairline bg-canvas-card p-4 text-body" role="status">
      <Loader2 aria-hidden="true" className="size-5 animate-spin text-accent-sunset-soft" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  return (
    <section className="rounded-lg border border-error/40 bg-canvas-card p-4 text-body" role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle aria-hidden="true" className="mt-1 size-5 shrink-0 text-error" />
        <div>
          <h2 className="font-normal text-ink">{error.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error.description}</p>
          {error.canRetry ? (
            <Button className="mt-3 cursor-pointer" onClick={() => void onRetry()} type="button" variant="outline">
              Tentar novamente
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
