import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';

interface WeatherSearchProps {
  disabled: boolean;
  onQueryChange: (query: string) => void;
  onSubmit: () => Promise<void>;
  query: string;
}

export function WeatherSearch({ disabled, onQueryChange, onSubmit, query }: WeatherSearchProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="weather-search">
        Buscar cidade
      </label>
      <input
        className="h-11 w-full min-w-0 rounded-lg border border-canvas-mid bg-canvas-soft px-4 text-base text-foreground outline-none transition placeholder:text-body focus-visible:border-accent-sunset-soft focus-visible:[box-shadow:0_0_0_4px_hsl(var(--ring)_/_0.25)] sm:flex-1 sm:border-input sm:placeholder:text-body-mid sm:focus-visible:[box-shadow:0_0_0_4px_hsl(var(--ring)_/_0.2)]"
        disabled={disabled}
        id="weather-search"
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Digite uma cidade"
        type="search"
        value={query}
      />
      <Button className="h-11 cursor-pointer bg-ink-hover hover:bg-ink-hover/90 sm:bg-primary sm:hover:bg-primary/90" disabled={disabled} type="submit">
        <Search aria-hidden="true" />
        Buscar
      </Button>
    </form>
  );
}
