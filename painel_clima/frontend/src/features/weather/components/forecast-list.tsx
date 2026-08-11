import {
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  HelpCircle,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'

import { describeWeatherCode } from '@/features/weather/i18n/weather-code-descriptions'
import { useWeatherLanguage } from '@/features/weather/i18n/use-weather-language'
import { createWeatherFormatters } from '@/features/weather/lib/weather-formatters'
import type { ForecastDay, UnitSystem, WeatherIcon } from '@/features/weather/types'

interface ForecastListProps {
  days: ForecastDay[]
  unitSystem: UnitSystem
}

export function ForecastList({ days, unitSystem }: ForecastListProps) {
  const { language, messages } = useWeatherLanguage()
  const formatters = useMemo(() => createWeatherFormatters(language, unitSystem), [language, unitSystem])

  return (
    <section aria-labelledby="forecast-heading" className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-[#141413]" id="forecast-heading">
        {messages.forecast.title}
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {days.map((day) => {
          const WeatherIconComponent = getWeatherIconComponent(day.icon)

          return (
            <article className="rounded-md border border-[#e6dfd8] bg-[#faf9f5] p-4" key={day.date}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold capitalize text-[#141413]">{formatters.formatForecastDate(day.date)}</h3>
                  <p className="mt-1 text-sm text-[#6c6a64]">{describeWeatherCode(day.weatherCode, language)}</p>
                </div>
                <WeatherIconComponent aria-hidden="true" className="size-5 shrink-0 text-[#cc785c]" />
              </div>
              <p className="mt-4 text-xl font-semibold text-[#141413]">
                {formatters.formatTemperature(day.minTemperatureC)} / {formatters.formatTemperature(day.maxTemperatureC)}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
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

  return iconMap[icon]
}
