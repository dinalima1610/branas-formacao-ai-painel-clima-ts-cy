import type { UnitSystem } from '@/features/weather/types'
import { UNIT_SYSTEMS } from '@/features/weather/lib/weather-units'
import { useWeatherLanguage } from '@/features/weather/i18n/use-weather-language'

interface UnitSystemToggleProps {
  onChange(unitSystem: UnitSystem): void
  value: UnitSystem
}

export function UnitSystemToggle({ onChange, value }: UnitSystemToggleProps) {
  const { messages } = useWeatherLanguage()

  return (
    <fieldset className="min-w-fit">
      <legend className="sr-only">{messages.units.label}</legend>
      <div
        aria-label={messages.units.label}
        className="inline-flex rounded-md border border-[#e6dfd8] bg-[#faf9f5] p-1"
        role="radiogroup"
      >
        {UNIT_SYSTEMS.map((unitSystem) => (
          <UnitSystemOption
            isSelected={unitSystem === value}
            key={unitSystem}
            label={unitSystem === 'metric' ? messages.units.metric : messages.units.imperial}
            onSelect={onChange}
            unitSystem={unitSystem}
          />
        ))}
      </div>
    </fieldset>
  )
}

interface UnitSystemOptionProps {
  isSelected: boolean
  label: string
  onSelect(unitSystem: UnitSystem): void
  unitSystem: UnitSystem
}

function UnitSystemOption({ isSelected, label, onSelect, unitSystem }: UnitSystemOptionProps) {
  return (
    <button
      aria-checked={isSelected}
      className={`min-h-9 rounded px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-[#a9583e]/25 ${
        isSelected ? 'bg-[#181715] text-[#faf9f5]' : 'text-[#3d3d3a] hover:bg-[#f5f0e8]'
      }`}
      onClick={() => onSelect(unitSystem)}
      role="radio"
      type="button"
    >
      {label}
    </button>
  )
}
