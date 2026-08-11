import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from './weather-code-labels.pt';

describe('getWeatherCondition', () => {
  it('maps representative WMO weather codes to PT-BR labels and icon keys', () => {
    expect(getWeatherCondition(0)).toEqual({ label: 'Céu limpo', iconKey: 'sunny' });
    expect(getWeatherCondition(3)).toEqual({ label: 'Nublado', iconKey: 'cloudy' });
    expect(getWeatherCondition(61)).toEqual({ label: 'Chuva leve', iconKey: 'rain' });
  });

  it('returns an unknown condition fallback for unmapped WMO codes', () => {
    expect(getWeatherCondition(1234)).toEqual({
      label: 'Condição desconhecida',
      iconKey: 'unknown'
    });
  });
});
