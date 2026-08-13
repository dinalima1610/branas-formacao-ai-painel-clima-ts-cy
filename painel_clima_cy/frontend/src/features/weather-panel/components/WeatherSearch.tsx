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
        className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-canvas-soft px-4 text-base text-foreground outline-none transition placeholder:text-body-mid focus:border-accent-sunset-soft focus:ring-4 focus:ring-ring/20"
        disabled={disabled}
        id="weather-search"
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Digite uma cidade"
        type="search"
        value={query}
      />
      <Button className="h-11 cursor-pointer" disabled={disabled} type="submit">
        <Search aria-hidden="true" />
        Buscar
      </Button>
    </form>
  );
}
