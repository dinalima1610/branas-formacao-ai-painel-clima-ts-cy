import { formatTemperature } from '../lib/units';
import type { DailyForecastSlot, TemperatureUnit } from '../types';
import { WeatherIcon } from './WeatherIcon';

interface DailyForecastProps {
  daily: DailyForecastSlot[];
  temperatureUnit: TemperatureUnit;
}

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  weekday: 'short',
});

export function DailyForecast({ daily, temperatureUnit }: DailyForecastProps) {
  return (
    <section className="min-w-0" aria-labelledby="daily-forecast-title">
      <h2 className="mb-3 font-display text-2xl font-normal tracking-[-0.02em] text-ink" id="daily-forecast-title">
        Próximos dias
      </h2>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" role="list">
        {daily.slice(0, 5).map((slot) => (
          <article className="rounded-lg border border-hairline bg-canvas-card p-4 text-body" key={slot.date} role="listitem">
            <div className="flex items-center justify-between gap-3">
              <time className="font-normal capitalize text-ink" dateTime={slot.date}>
                {dayFormatter.format(new Date(`${slot.date}T12:00:00`))}
              </time>
              <WeatherIcon className="size-5 text-accent-breeze" iconKey={slot.conditionIconKey} label={slot.conditionLabel} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{slot.conditionLabel}</p>
            <p className="mt-2 text-lg font-normal text-ink">
              {formatTemperature(slot.temperatureMax, temperatureUnit)} / {formatTemperature(slot.temperatureMin, temperatureUnit)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
