import { formatTemperature } from '../lib/units';
import type { HourlyForecastSlot, TemperatureUnit } from '../types';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastProps {
  hourly: HourlyForecastSlot[];
  temperatureUnit: TemperatureUnit;
}

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

export function HourlyForecast({ hourly, temperatureUnit }: HourlyForecastProps) {
  return (
    <section className="min-w-0" aria-labelledby="hourly-forecast-title">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-ink" id="hourly-forecast-title">
          Próximas 24 horas
        </h2>
        <p className="text-sm text-muted-foreground">{hourly.length} pontos horários</p>
      </div>

      <div className="flex w-full max-w-full gap-3 overflow-x-auto pb-3" role="list">
        {hourly.map((slot) => (
          <article
            className="min-w-24 rounded-lg border border-hairline bg-canvas-card p-3 text-center text-body"
            key={slot.time}
            role="listitem"
          >
            <time className="text-sm font-normal text-muted-foreground" dateTime={slot.time}>
              {timeFormatter.format(new Date(slot.time))}
            </time>
            <WeatherIcon className="mx-auto mt-3 size-6 text-accent-breeze" iconKey={slot.conditionIconKey} label={slot.conditionLabel} />
            <p className="mt-2 text-lg font-normal text-ink">{formatTemperature(slot.temperature, temperatureUnit)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
