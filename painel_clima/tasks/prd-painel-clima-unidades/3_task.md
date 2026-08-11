# Tarefa 3.0: Frontend: integrar unidade global na página e nos componentes meteorológicos

## Visão geral

Integrar a preferência global de unidade ao Painel de Clima. `WeatherPage` passa a manter `unitSystem` em memória React, renderiza o toggle no bloco de busca e repassa a unidade para os componentes de clima atual e previsão. A alternância deve converter apenas a exibição, sem refazer busca e sem apagar contexto.

<skills>
### Conformidade com skills

- `react-frontend-conventions` - estado colocalizado em `WeatherPage`, props explícitas, componentes funcionais TSX.
- `repo-architecture` - alterações dentro de `features/weather` e `pages/weather-page.tsx`.
- `nodejs-typescript-conventions` - TypeScript estrito, sem `any`, ESM.
- `code-standards-en` - nomes em inglês e funções com verbo.
- `ui-ux-pro-max` - layout responsivo, contraste AA, foco visível, touch target adequado.
- `vitest-testing` - testes de componentes e integração de página com Testing Library.
</skills>

<requirements>
- Unidade default deve ser métrica a cada carregamento da página.
- Preferência deve existir somente em memória React, perdida no refresh.
- Toggle deve ficar no bloco de busca e indicar efeito global no painel.
- Temperatura atual, sensação térmica, mínima, máxima e vento exibidos devem refletir a unidade ativa.
- Umidade em `%` deve permanecer inalterada.
- Alternar unidade com dados já carregados não deve chamar `getWeather` novamente.
- Mensagens de erro, loading e estado vazio devem permanecer independentes da unidade.
- Nova busca de cidade deve manter a unidade escolhida enquanto a página não for recarregada.
</requirements>

## Subtarefas

- [x] 3.1 Adicionar estado `unitSystem` em `frontend/src/pages/weather-page.tsx` com default `metric`.
- [x] 3.2 Renderizar `UnitSystemToggle` no bloco de busca, alinhado ao `DESIGN.md`.
- [x] 3.3 Passar `unitSystem` para `CurrentWeatherCard` e `ForecastList`.
- [x] 3.4 Atualizar `CurrentWeatherCard` para usar helpers de conversão em temperatura, sensação térmica e vento.
- [x] 3.5 Atualizar `ForecastList` para converter mínima e máxima.
- [x] 3.6 Garantir que `WeatherStateBoundary`, erros, loading e estado vazio não dependam da unidade.
- [x] 3.7 Atualizar fixtures e testes de componentes/página.
- [x] 3.8 Remover dependência do fallback `/api/v0` como caminho normal do cliente quando `/api/v1` estiver disponível.

## Detalhes de implementação

Referenciar `tasks/prd-painel-clima-unidades/techspec.md`, seções "Visão dos componentes", "Sequenciamento do desenvolvimento" e "Principais decisões". A unidade deve ser uma decisão de apresentação e não deve modificar `WeatherSnapshot`.

## Critérios de sucesso

- Ao abrir o painel, as medidas aparecem em `°C` e `km/h`.
- Ao alternar para imperial, temperatura e vento aparecem em `°F` e `mph`.
- Ao alternar de volta, todas as métricas compatíveis voltam para `°C` e `km/h`.
- Cidade, condição, timestamp, previsão e foco do controle são preservados.
- `fetch` de clima não é executado novamente durante alternância de unidade.
- Nova busca mantém a unidade ativa até refresh.
- Layout permanece sem truncamento ou sobreposição em mobile/tablet/desktop.

## Testes da tarefa

- [x] Testes unitários
  - `current-weather-card.test.tsx`: cobrir métrico e imperial para temperatura, sensação térmica, vento e umidade inalterada.
  - `forecast-list.test.tsx`: cobrir mínimas/máximas em métrico e imperial.
- [x] Testes de integração
  - `weather-page.test.tsx`: buscar cidade, alternar unidade e validar que a tela muda sem nova chamada de clima.
  - Validar nova busca mantendo unidade escolhida em memória.
  - Validar erro/loading/estado vazio sem dependência da unidade.
- [x] Testes E2E (se aplicável)
  - Fluxos completos ficam na tarefa 4.0.

## Arquivos relevantes

- `frontend/src/pages/weather-page.tsx`
- `frontend/src/pages/weather-page.test.tsx`
- `frontend/src/features/weather/components/current-weather-card.tsx`
- `frontend/src/features/weather/components/current-weather-card.test.tsx`
- `frontend/src/features/weather/components/forecast-list.tsx`
- `frontend/src/features/weather/components/forecast-list.test.tsx`
- `frontend/src/features/weather/components/unit-system-toggle.tsx`
- `frontend/src/features/weather/lib/weather-units.ts`
- `frontend/src/features/weather/api/weather-client.ts`
- `frontend/src/features/weather/api/weather-client.test.ts`
- `frontend/src/features/weather/test/fixtures.ts`
- `DESIGN.md`
