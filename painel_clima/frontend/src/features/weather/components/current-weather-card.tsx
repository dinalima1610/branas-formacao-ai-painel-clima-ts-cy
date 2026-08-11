import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Clock,
  Droplets,
  HelpCircle,
  Sun,
  Thermometer,
  Wind,
  type LucideIcon,
} from 'lucide-react'

import { useMemo } from 'react'

import { describeWeatherCode } from '@/features/weather/i18n/weather-code-descriptions'
import { useWeatherLanguage } from '@/features/weather/i18n/use-weather-language'
import { createWeatherFormatters } from '@/features/weather/lib/weather-formatters'
import type { UnitSystem, WeatherIcon, WeatherSnapshot } from '@/features/weather/types'

interface CurrentWeatherCardProps {
  cityName?: string
  snapshot: WeatherSnapshot
  unitSystem: UnitSystem
}

export function CurrentWeatherCard({ cityName, snapshot, unitSystem }: CurrentWeatherCardProps) {
  const { language, messages } = useWeatherLanguage()
  const formatters = useMemo(() => createWeatherFormatters(language, unitSystem), [language, unitSystem])
  const current = snapshot.current
  const WeatherIconComponent = getWeatherIconComponent(current.icon)

  return (
    <section
      aria-labelledby="current-weather-heading"
      className="rounded-lg bg-[#181715] p-5 text-[#faf9f5] shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#e8e0d2]">{cityName ?? formatCityName(snapshot)}</p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <h2 className="font-serif text-5xl font-normal leading-none text-[#faf9f5] sm:text-6xl" id="current-weather-heading">
              {formatters.formatTemperature(current.temperatureC)}
            </h2>
            <p className="mb-1 flex items-center gap-2 text-lg text-[#faf9f5]">
              <WeatherIconComponent aria-hidden="true" className="size-6 text-[#e8a55a]" />
              {describeWeatherCode(current.weatherCode, language)}
            </p>
          </div>
        </div>

        <p className="flex items-center gap-2 text-sm text-[#a09d96]">
          <Clock aria-hidden="true" className="size-4" />
          {messages.current.updatedAt} {formatters.formatDateTime(current.observedAt)}
        </p>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <WeatherMetric
          icon={<Thermometer aria-hidden="true" className="size-5 text-[#e8a55a]" />}
          label={messages.current.feelsLike}
          value={formatters.formatTemperature(current.feelsLikeC)}
        />
        <WeatherMetric
          icon={<Wind aria-hidden="true" className="size-5 text-[#e8a55a]" />}
          label={messages.current.wind}
          value={formatters.formatWindSpeed(current.windSpeedKmh)}
        />
        <WeatherMetric
          icon={<Droplets aria-hidden="true" className="size-5 text-[#e8a55a]" />}
          label={messages.current.humidity}
          value={formatters.formatPercent(current.humidityPercent)}
        />
      </dl>
    </section>
  )
}

interface WeatherMetricProps {
  icon: React.ReactNode
  label: string
  value: string
}

function WeatherMetric({ icon, label, value }: WeatherMetricProps) {
  return (
    <div className="rounded-md border border-white/10 bg-white/10 p-4">
      <dt className="flex items-center gap-2 text-sm text-[#a09d96]">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 text-xl font-semibold text-[#faf9f5]">{value}</dd>
    </div>
  )
}

function formatCityName(snapshot: WeatherSnapshot): string {
  return [snapshot.city.name, snapshot.city.region, snapshot.city.country].filter(Boolean).join(', ')
}

function getWeatherIconComponent(icon: WeatherIcon): LucideIcon {
  const iconMap = {
    cloud: Cloudy,
    'cloud-drizzle': CloudDrizzle,
    'cloud-lightning': CloudLightning,
    'cloud-question': HelpCircle,
    'cloud-rain': CloudRain,
    'cloud-snow': CloudSnow,
    'cloud-sun': CloudSun,
    fog: CloudFog,
    sun: Sun,
  } satisfies Record<WeatherIcon, LucideIcon>

  return iconMap[icon] ?? Cloud
}
