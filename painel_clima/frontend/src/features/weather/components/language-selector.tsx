import type { WeatherLanguage } from '@/features/weather/types'
import { useWeatherLanguage } from '@/features/weather/i18n/use-weather-language'

export function LanguageSelector() {
  const { language, messages, setLanguage } = useWeatherLanguage()

  return (
    <fieldset className="min-w-fit">
      <legend className="sr-only">{messages.language.label}</legend>
      <div
        aria-label={messages.language.label}
        className="inline-flex rounded-md border border-[#e6dfd8] bg-[#faf9f5] p-1"
        role="radiogroup"
      >
        <LanguageOption
          isSelected={language === 'pt-BR'}
          label={messages.language.portuguese}
          language="pt-BR"
          onSelect={setLanguage}
        />
        <LanguageOption
          isSelected={language === 'en-US'}
          label={messages.language.english}
          language="en-US"
          onSelect={setLanguage}
        />
      </div>
    </fieldset>
  )
}

interface LanguageOptionProps {
  isSelected: boolean
  label: string
  language: WeatherLanguage
  onSelect(language: WeatherLanguage): void
}

function LanguageOption({ isSelected, label, language, onSelect }: LanguageOptionProps) {
  return (
    <button
      aria-checked={isSelected}
      className={`min-h-9 rounded px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-[#a9583e]/25 ${
        isSelected ? 'bg-[#a9583e] text-white' : 'text-[#3d3d3a] hover:bg-[#f5f0e8]'
      }`}
      onClick={() => onSelect(language)}
      role="radio"
      type="button"
    >
      {label}
    </button>
  )
}
