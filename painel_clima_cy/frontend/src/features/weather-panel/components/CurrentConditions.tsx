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
    <section className="rounded-lg border border-hairline bg-canvas-card p-6 text-ink" aria-labelledby="current-weather-title">
      <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="break-words font-mono text-xs font-normal uppercase tracking-[0.1em] text-body">{place.label}</p>
          <h2 className="mt-2 font-display text-5xl font-normal tracking-[-0.04em]" id="current-weather-title">
            {formatTemperature(current.temperature, meta.temperatureUnit)}
          </h2>
          <div className="mt-3 flex items-center gap-3 text-lg">
            <WeatherIcon className="size-7 text-accent-sunset-soft" iconKey={current.conditionIconKey} label={current.conditionLabel} />
            <span>{current.conditionLabel}</span>
          </div>
        </div>

        <dl className="grid min-w-0 gap-3 text-sm sm:grid-cols-3 md:min-w-[420px]">
          <div className="rounded-lg border border-hairline bg-canvas-soft p-3">
            <dt className="text-body">Sensação</dt>
            <dd className="mt-1 text-lg font-normal">{formatTemperature(current.apparentTemperature, meta.temperatureUnit)}</dd>
          </div>
          <div className="rounded-lg border border-hairline bg-canvas-soft p-3">
            <dt className="flex items-center gap-2 text-body">
              <Droplets aria-hidden="true" className="size-4" />
              Umidade
            </dt>
            <dd className="mt-1 text-lg font-normal">{current.humidity}%</dd>
          </div>
          <div className="rounded-lg border border-hairline bg-canvas-soft p-3">
            <dt className="flex items-center gap-2 text-body">
              <Wind aria-hidden="true" className="size-4" />
              Vento
            </dt>
            <dd className="mt-1 text-lg font-normal">{formatWindSpeed(current.windSpeed, current.windSpeedUnit)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
