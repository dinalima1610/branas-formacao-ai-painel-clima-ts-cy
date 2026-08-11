import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, HelpCircle, Sun } from 'lucide-react';
import type { WeatherIconKey } from '../types';

interface WeatherIconProps {
  iconKey: WeatherIconKey;
  label: string;
  className?: string;
}

export function WeatherIcon({ className, iconKey, label }: WeatherIconProps) {
  const Icon = {
    sunny: Sun,
    'partly-cloudy': CloudSun,
    cloudy: Cloud,
    fog: CloudFog,
    drizzle: CloudDrizzle,
    rain: CloudRain,
    snow: CloudSnow,
    thunderstorm: CloudLightning,
    unknown: HelpCircle,
  }[iconKey];

  return <Icon aria-label={label} className={className} />;
}
