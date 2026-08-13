import { useWeatherPanel } from '../hooks/useWeatherPanel';
import { DisambiguationList } from './DisambiguationList';
import { EmptyState, ErrorView, LoadingView } from './WeatherFeedback';
import { GeolocationChip } from './GeolocationChip';
import { UnitToggle } from './UnitToggle';
import { WeatherResults } from './WeatherResults';
import { WeatherSearch } from './WeatherSearch';

export function WeatherPanel() {
  const panel = useWeatherPanel();
  const isSearching = panel.status === 'searching';
  const isLoadingWeather = panel.status === 'loading-weather';
  const isBusy = isSearching || isLoadingWeather;

  return (
    <section className="w-full bg-canvas px-4 py-10 text-body sm:px-6 lg:px-8" aria-labelledby="weather-panel-title">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs font-normal uppercase tracking-[0.1em] text-ink">Clima agora</p>
            <h1 className="mt-2 font-display text-4xl font-normal tracking-[-0.03em] text-ink md:text-5xl" id="weather-panel-title">
              Previsão para sua próxima parada
            </h1>
          </div>
          <UnitToggle onChange={panel.toggleTemperatureUnit} temperatureUnit={panel.temperatureUnit} />
        </header>

        <div className="rounded-lg border border-hairline bg-canvas-card p-4">
          <WeatherSearch disabled={isBusy} onQueryChange={panel.setQuery} onSubmit={panel.submitSearch} query={panel.query} />
          <div className="mt-3">
            <GeolocationChip disabled={isBusy} onClick={panel.requestGeolocation} />
          </div>
        </div>

        {isSearching ? <LoadingView label="Buscando lugares próximos..." /> : null}
        {isLoadingWeather ? <LoadingView label="Carregando previsão..." /> : null}

        {panel.status === 'error' && panel.error ? <ErrorView error={panel.error} onRetry={panel.retryLastAction} /> : null}

        {panel.status === 'selecting-place' ? (
          <DisambiguationList candidates={panel.candidates} disabled={isBusy} onSelect={panel.selectPlace} />
        ) : null}

        {panel.status === 'idle' && !panel.weather ? <EmptyState /> : null}

        {panel.weather ? <WeatherResults weather={panel.weather} /> : null}
      </div>
    </section>
  );
}
