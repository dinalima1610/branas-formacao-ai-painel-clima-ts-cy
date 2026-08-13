import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GeolocationChipProps {
  disabled: boolean;
  onClick: () => Promise<void>;
}

export function GeolocationChip({ disabled, onClick }: GeolocationChipProps) {
  return (
    <Button
      className="h-9 cursor-pointer rounded-full border-hairline bg-canvas px-4 text-ink hover:bg-canvas-soft"
      disabled={disabled}
      onClick={() => {
        void onClick();
      }}
      type="button"
      variant="outline"
    >
      <MapPin aria-hidden="true" />
      Usar minha localização
    </Button>
  );
}
