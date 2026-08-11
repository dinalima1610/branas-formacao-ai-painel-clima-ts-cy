import type { ReactNode } from 'react'
import { AlertCircle, CloudSun, Loader2, RefreshCw } from 'lucide-react'

import { useWeatherLanguage } from '@/features/weather/i18n/use-weather-language'
import type { WeatherLoadErrorCode } from '@/features/weather/hooks/use-weather'

interface WeatherStateBoundaryProps {
  children: ReactNode
  errorCode: WeatherLoadErrorCode | null
  onRetry(): void
  status: 'idle' | 'loading' | 'success' | 'error'
}

export function WeatherStateBoundary({ children, errorCode, onRetry, status }: WeatherStateBoundaryProps) {
  const { messages } = useWeatherLanguage()

  if (status === 'success') {
    return <>{children}</>
  }

  if (status === 'loading') {
    return (
      <StateSurface tone="neutral">
        <Loader2 aria-hidden="true" className="size-5 animate-spin text-[#cc785c]" />
        <div>
          <h2 className="font-semibold text-[#141413]">{messages.state.loadingTitle}</h2>
          <p className="mt-1 text-sm text-[#6c6a64]">{messages.state.loadingDescription}</p>
        </div>
      </StateSurface>
    )
  }

  if (status === 'error') {
    return (
      <StateSurface tone="error">
        <AlertCircle aria-hidden="true" className="size-5 text-[#c64545]" />
        <div className="min-w-0">
          <h2 className="font-semibold text-[#141413]">{messages.state.errorTitle}</h2>
          <p className="mt-1 text-sm text-[#6c6a64]">
            {errorCode === null ? messages.state.errorDescription : messages.state.errorDescription}
          </p>
          <button
            className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-[#a9583e] px-4 text-sm font-medium text-white transition-colors hover:bg-[#8f4932] focus:outline-none focus:ring-4 focus:ring-[#a9583e]/25"
            onClick={onRetry}
            type="button"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            {messages.state.retry}
          </button>
        </div>
      </StateSurface>
    )
  }

  return (
    <StateSurface tone="neutral">
      <CloudSun aria-hidden="true" className="size-5 text-[#cc785c]" />
      <div>
        <h2 className="font-semibold text-[#141413]">{messages.state.emptyTitle}</h2>
        <p className="mt-1 text-sm text-[#6c6a64]">{messages.state.emptyDescription}</p>
      </div>
    </StateSurface>
  )
}

interface StateSurfaceProps {
  children: ReactNode
  tone: 'neutral' | 'error'
}

function StateSurface({ children, tone }: StateSurfaceProps) {
  const className =
    tone === 'error'
      ? 'flex items-start gap-3 rounded-lg border border-[#f0c2c2] bg-[#fff7f7] p-4'
      : 'flex items-start gap-3 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] p-4'

  return (
    <section aria-live="polite" className={className}>
      {children}
    </section>
  )
}
