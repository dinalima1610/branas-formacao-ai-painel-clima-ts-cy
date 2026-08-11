const WMO_WEATHER_DESCRIPTIONS = new Map<number, string>([
  [0, 'Ceu limpo'],
  [1, 'Principalmente limpo'],
  [2, 'Parcialmente nublado'],
  [3, 'Nublado'],
  [45, 'Nevoeiro'],
  [48, 'Nevoeiro com geada'],
  [51, 'Garoa fraca'],
  [53, 'Garoa moderada'],
  [55, 'Garoa intensa'],
  [56, 'Garoa congelante fraca'],
  [57, 'Garoa congelante intensa'],
  [61, 'Chuva fraca'],
  [63, 'Chuva moderada'],
  [65, 'Chuva intensa'],
  [66, 'Chuva congelante fraca'],
  [67, 'Chuva congelante intensa'],
  [71, 'Neve fraca'],
  [73, 'Neve moderada'],
  [75, 'Neve intensa'],
  [77, 'Graos de neve'],
  [80, 'Pancadas de chuva fracas'],
  [81, 'Pancadas de chuva moderadas'],
  [82, 'Pancadas de chuva violentas'],
  [85, 'Pancadas de neve fracas'],
  [86, 'Pancadas de neve intensas'],
  [95, 'Trovoada'],
  [96, 'Trovoada com granizo fraco'],
  [99, 'Trovoada com granizo intenso'],
]);

export function describeWeatherCode(weatherCode: number): string {
  return WMO_WEATHER_DESCRIPTIONS.get(weatherCode) ?? `Condicao desconhecida (${weatherCode})`;
}
