# Tarefa 2.0: Frontend completo — feature `weather` + página integrada ao app

## Visão geral

Entregar a feature React do Painel de Clima em `frontend/src/features/weather/` (arquivos e diretórios em **kebab-case**, símbolos exportados em `PascalCase`/`camelCase`) consumindo exclusivamente os endpoints do backend (tarefa 1.0). Inclui cliente HTTP tipado, hooks (`use-city-search`, `use-weather`, `use-geolocation`), componentes da UI (combobox de busca, card de clima atual, lista de previsão, boundary de estados) e a página `WeatherPage` que substitui o conteúdo demo de `App.tsx`. Visual segue `DESIGN.md` (paleta cream/coral, tipografia, contraste WCAG 2.1 AA), com `lucide-react` para ícones e atribuição visível à Open-Meteo.

<skills>
### Conformidade com skills

- `react-frontend-conventions` — componentes funcionais TSX, props explícitas, estado colocalizado em `WeatherPage`, hooks `use*`, Tailwind, componentes < 100 linhas, testes por componente. Arquivos/diretórios em kebab-case; símbolos exportados em PascalCase (componentes/tipos) ou camelCase (hooks/funções).
- `repo-folder-structure` — feature colocalizada em `features/weather/` com subpastas `api`, `hooks`, `components`, `types.ts`; página em `pages/weather-page.tsx`.
- `nodejs-typescript-conventions` — TS only, ESM, sem `any`, `const` por padrão.
- `code-standards-en` — identificadores em inglês; cópia pt-BR somente em texto de UI/erros expostos ao usuário; verbos em funções (`fetchWeather`, `formatTemperature`).
- `ui-ux-pro-max` — `DESIGN.md` como referência (paleta cream/coral, tipografia serif para display + StyreneB body), contraste AA, foco visível, `aria-live` em estados, `aria-combobox` no `SearchBox`, ícones SVG via `lucide-react`.
- `vitest-testing` — Vitest + `vi`, AAA, fake timers para debounce, sem Supertest, `@testing-library/react` para componentes/hook integrações.
</skills>

<requirements>
- RF-01 a RF-19 do PRD atendidos pela UI (busca textual, geolocalização opcional, exibição completa do clima atual, previsão de 7 dias, estados loading/empty/error).
- Frontend nunca chama Open-Meteo diretamente; toda comunicação passa pelo backend via `VITE_API_URL`.
- Geolocalização solicitada apenas mediante ação explícita do usuário (RF-06); falhas (`PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`) viram estado de erro com fallback para busca textual (RF-07/RF-08).
- Coordenadas descartadas ao fim do ciclo de requisição (sem persistência).
- Acessibilidade: navegação por teclado, rótulos ARIA em busca/lista/estados, leitores de tela anunciando atualização do clima, contraste AA.
- Atribuição "Dados meteorológicos por Open-Meteo" visível com link em `WeatherPage`.
- Resposta total percebida ≤ 3 s (debounce ≥ 300 ms na busca, `AbortController` para descartar requisições obsoletas).
- Internacionalização inicial pt-BR; unidades métricas (°C, km/h).
</requirements>

## Subtarefas

- [x] 2.1 Adicionar dependências dev no `frontend/package.json`: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`. Configurar `vitest.config.ts` (ambiente `jsdom`, setup com `@testing-library/jest-dom`).
- [x] 2.2 Criar `frontend/src/features/weather/types.ts` alinhado ao contrato do backend (`City`, `CurrentWeather`, `ForecastDay`, `WeatherSnapshot`, `WeatherIcon`).
- [x] 2.3 Criar `frontend/src/features/weather/api/weather-client.ts` com `searchCities(q, limit)` e `getWeather({ lat, lon, cityLabel? })` usando `VITE_API_URL` e `fetch` tipado.
- [x] 2.4 Criar `frontend/src/features/weather/hooks/use-city-search.ts` (debounce ≥300 ms, `AbortController` para abortar requisições obsoletas, expõe `{ items, status, error }`).
- [x] 2.5 Criar `frontend/src/features/weather/hooks/use-weather.ts` (recebe `{ lat, lon, cityLabel }`, dispara busca, expõe `{ data, status, error, refetch }`).
- [x] 2.6 Criar `frontend/src/features/weather/hooks/use-geolocation.ts` encapsulando `navigator.geolocation.getCurrentPosition` (somente sob ação explícita; mapeia `PERMISSION_DENIED`/`POSITION_UNAVAILABLE`/`TIMEOUT` em estado de erro tipado).
- [x] 2.7 Criar `frontend/src/features/weather/components/search-box.tsx` (input acessível + lista de resultados com `role="combobox"`/`role="listbox"`, navegação por teclado, `onSelect(city)`).
- [x] 2.8 Criar `frontend/src/features/weather/components/current-weather-card.tsx` (cidade, temperatura, sensação, condição+ícone, vento km/h, umidade %, timestamp local).
- [x] 2.9 Criar `frontend/src/features/weather/components/forecast-list.tsx` (7 dias com data, mín/máx, ícone/condição).
- [x] 2.10 Criar `frontend/src/features/weather/components/weather-state-boundary.tsx` (`aria-live="polite"`, renderiza loading/empty/error com botão "tentar novamente").
- [x] 2.11 Criar `frontend/src/features/weather/index.ts` (barrel seletivo expondo página e tipos públicos).
- [x] 2.12 Criar `frontend/src/pages/weather-page.tsx` compondo `SearchBox`, `CurrentWeatherCard`, `ForecastList`, `WeatherStateBoundary` com estado `selectedCity`; inclui atribuição visível "Dados meteorológicos por Open-Meteo" linkada a `https://open-meteo.com`.
- [x] 2.13 Substituir conteúdo demo em `frontend/src/App.tsx` para renderizar `WeatherPage`; ajustar `index.css`/Tailwind se necessário para seguir `DESIGN.md`.
- [x] 2.14 Implementar testes unitários e de integração de UI (ver "Testes da tarefa").

## Detalhes de implementação

Ver `tasks/prd-painel-clima/techspec.md` — seções:
- "Visão dos componentes" → Frontend (lista canônica de arquivos e responsabilidades).
- "Pontos de integração" → "Geolocalização (browser)" e "Atribuição".
- "Sequenciamento do desenvolvimento" itens 5–7 (ordem de construção dentro do frontend).
- "Conformidade com skills" → `react-frontend-conventions` e `ui-ux-pro-max` para convenções de nomes e diretrizes visuais.
- `DESIGN.md` na raiz do projeto — referência obrigatória para paleta, tipografia, espaçamento, contraste.

## Critérios de sucesso

- Ao abrir o painel sem busca prévia, exibe estado vazio com convite à busca e ao uso da localização (RF-19).
- Digitar `≥2` caracteres mostra lista de cidades com nome, região/estado e país (RF-01/RF-02); `<2` não dispara request.
- Selecionar cidade da lista carrega `WeatherSnapshot` e exibe clima atual + previsão de 7 dias (RF-03, RF-09 a RF-16).
- Botão "usar minha localização" pede permissão sob clique; se concedida, carrega clima da cidade detectada; se negada/erro, exibe mensagem orientando a busca textual sem quebrar a página (RF-05 a RF-08).
- Provedor indisponível mostra mensagem amigável + botão "tentar novamente" funcional (RF-18).
- Cidade não encontrada exibe mensagem clara (RF-04).
- Estado de carregamento aparece durante chamadas (RF-17) com `aria-live="polite"`.
- Navegação completa por teclado em busca, lista de resultados e ação de geolocalização; foco visível.
- Contraste validado contra paleta do `DESIGN.md` em modo claro (WCAG AA).
- `npm test` no diretório `frontend` passa para todos os componentes/hook tests.
- Layout responsivo (mobile/tablet/desktop) verificado em browser real.

## Testes da tarefa

- [x] **Testes unitários**
  - `frontend/src/features/weather/hooks/use-city-search.test.ts` — debounce com `vi.useFakeTimers`, abort de requests obsoletos, `<2` chars não dispara, propagação de erro.
  - `frontend/src/features/weather/hooks/use-weather.test.ts` — estados loading/success/error, `refetch` reabre fetch, abort em unmount.
  - `frontend/src/features/weather/hooks/use-geolocation.test.ts` — sucesso, `PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT` (mockando `navigator.geolocation`).
  - `frontend/src/features/weather/api/weather-client.test.ts` — `searchCities`/`getWeather` montam URL com `VITE_API_URL` e tratam respostas não-OK.
  - `frontend/src/features/weather/components/search-box.test.tsx` — input com rótulo, lista com role apropriado, navegação por teclado (Arrow/Enter), `onSelect` invocado.
  - `frontend/src/features/weather/components/current-weather-card.test.tsx` — renderiza todos os campos exigidos por RF-09 a RF-14, incluindo timestamp local.
  - `frontend/src/features/weather/components/forecast-list.test.tsx` — renderiza 7 itens com data, mín/máx, ícone/condição (RF-15/RF-16).
  - `frontend/src/features/weather/components/weather-state-boundary.test.tsx` — estados loading/empty/error e botão "tentar novamente"; `aria-live="polite"` presente.

- [x] **Testes de integração**
  - `frontend/src/pages/weather-page.test.tsx` com `@testing-library/react` mockando `weather-client`: estado vazio inicial; fluxo digitar → selecionar → ver clima; fluxo "usar minha localização" → ver clima; provider indisponível → mensagem + "tentar novamente" reexecuta a busca; cidade não encontrada → mensagem clara.

- [x] **Testes E2E** — não aplicável a esta tarefa (cobertos na 3.0).

## Arquivos relevantes

- `frontend/src/features/weather/api/weather-client.ts`
- `frontend/src/features/weather/hooks/use-city-search.ts`
- `frontend/src/features/weather/hooks/use-weather.ts`
- `frontend/src/features/weather/hooks/use-geolocation.ts`
- `frontend/src/features/weather/components/search-box.tsx`
- `frontend/src/features/weather/components/current-weather-card.tsx`
- `frontend/src/features/weather/components/forecast-list.tsx`
- `frontend/src/features/weather/components/weather-state-boundary.tsx`
- `frontend/src/features/weather/types.ts`
- `frontend/src/features/weather/index.ts`
- `frontend/src/pages/weather-page.tsx`
- `frontend/src/App.tsx`
- `frontend/src/lib/utils.ts`
- `frontend/package.json`
- `frontend/vitest.config.ts`
- `frontend/src/features/weather/**/*.test.{ts,tsx}`
- `frontend/src/pages/weather-page.test.tsx`
- `DESIGN.md` (referência, não modificado)
