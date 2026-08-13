import type { WeatherPanelPayload } from '../types';
import { CurrentConditions } from './CurrentConditions';
import { DailyForecast } from './DailyForecast';
import { HourlyForecast } from './HourlyForecast';

interface WeatherResultsProps {
  weather: WeatherPanelPayload;
}

export function WeatherResults({ weather }: WeatherResultsProps) {
  return (
    <div className="grid min-w-0 gap-6">
      <CurrentConditions weather={weather} />
      <HourlyForecast hourly={weather.hourly.slice(0, 24)} temperatureUnit={weather.meta.temperatureUnit} />
      <DailyForecast daily={weather.daily} temperatureUnit={weather.meta.temperatureUnit} />
    </div>
  );
}
