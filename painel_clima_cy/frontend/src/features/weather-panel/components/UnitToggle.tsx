import { Button } from '@/components/ui/button';
import type { TemperatureUnit } from '../types';

interface UnitToggleProps {
  temperatureUnit: TemperatureUnit;
  onChange: (temperatureUnit: TemperatureUnit) => void;
}

export function UnitToggle({ onChange, temperatureUnit }: UnitToggleProps) {
  return (
    <div aria-label="Unidade de temperatura" className="inline-flex rounded-full border border-hairline bg-canvas p-1" role="group">
      <Button
        aria-pressed={temperatureUnit === 'celsius'}
        className="h-8 cursor-pointer px-3"
        onClick={() => onChange('celsius')}
        size="sm"
        type="button"
        variant={temperatureUnit === 'celsius' ? 'default' : 'ghost'}
      >
        °C
      </Button>
      <Button
        aria-pressed={temperatureUnit === 'fahrenheit'}
        className="h-8 cursor-pointer px-3"
        onClick={() => onChange('fahrenheit')}
        size="sm"
        type="button"
        variant={temperatureUnit === 'fahrenheit' ? 'default' : 'ghost'}
      >
        °F
      </Button>
    </div>
  );
}
