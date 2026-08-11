import { describe, expect, it } from 'vitest';

import { describeWeatherCode } from './wmo-weather-codes';

describe('WMO weather codes', () => {
  it('maps known weather codes to Portuguese descriptions', () => {
    expect(describeWeatherCode(0)).toBe('Ceu limpo');
    expect(describeWeatherCode(63)).toBe('Chuva moderada');
  });

  it('returns a stable fallback for unknown weather codes', () => {
    expect(describeWeatherCode(1234)).toBe('Condicao desconhecida (1234)');
  });
});
