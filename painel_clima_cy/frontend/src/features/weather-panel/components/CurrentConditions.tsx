import { Droplets, Wind } from 'lucide-react';
import { formatTemperature, formatWindSpeed } from '../lib/units';
import type { WeatherPanelPayload } from '../types';
import { WeatherIcon } from './WeatherIcon';

interface CurrentConditionsProps {
  weather: WeatherPanelPayload;
}

export function CurrentConditions({ weather }: CurrentConditionsProps) {
  const { current, meta, place } = weather;

  return (
    <section className="rounded-lg bg-surface-dark p-6 text-on-dark" aria-labelledby="current-weather-title">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-on-dark-soft">{place.label}</p>
          <h2 className="mt-2 font-display text-5xl font-normal tracking-tight" id="current-weather-title">
            {formatTemperature(current.temperature, meta.temperatureUnit)}
          </h2>
          <div className="mt-3 flex items-center gap-3 text-lg">
            <WeatherIcon className="size-7 text-accent-amber" iconKey={current.conditionIconKey} label={current.conditionLabel} />
            <span>{current.conditionLabel}</span>
          </div>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-3 md:min-w-[420px]">
          <div className="rounded-md bg-surface-dark-elevated p-3">
            <dt className="text-on-dark-soft">Sensação</dt>
            <dd className="mt-1 text-lg font-medium">{formatTemperature(current.apparentTemperature, meta.temperatureUnit)}</dd>
          </div>
          <div className="rounded-md bg-surface-dark-elevated p-3">
            <dt className="flex items-center gap-2 text-on-dark-soft">
              <Droplets aria-hidden="true" className="size-4" />
              Umidade
            </dt>
            <dd className="mt-1 text-lg font-medium">{current.humidity}%</dd>
          </div>
          <div className="rounded-md bg-surface-dark-elevated p-3">
            <dt className="flex items-center gap-2 text-on-dark-soft">
              <Wind aria-hidden="true" className="size-4" />
              Vento
            </dt>
            <dd className="mt-1 text-lg font-medium">{formatWindSpeed(current.windSpeed, current.windSpeedUnit)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
