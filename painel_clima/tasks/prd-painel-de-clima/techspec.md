# Especificação Técnica — Painel de Clima

## Resumo executivo

O Painel de Clima será entregue em duas camadas: uma feature React colocalizada em `frontend/src/features/weather/` e dois endpoints REST no backend Express (`backend/src/`) que atuam como BFF para a Open-Meteo. O frontend nunca conversa diretamente com a Open-Meteo; ele consome `GET /api/v1/cities/search` (autocomplete por nome) e `GET /api/v1/weather` (clima atual + previsão de 7 dias por coordenadas). O backend resolve as duas rotas com `fetch` nativo, valida entrada com Zod, traduz `weathercode` (WMO) para texto pt-BR e devolve um payload normalizado e auto-suficiente para a UI.

A versão inicial não usa cache nem persistência (privacidade exigida pelo PRD: coordenadas não são armazenadas) e segue o fluxo `HTTP → controllers → services → data` definido pelo skill `repo-folder-structure`. A geolocalização é resolvida no navegador via `navigator.geolocation`; se o usuário negar, a busca textual continua plena. Erros do provedor externo são mapeados para status canônicos e mensagens amigáveis renderizadas pela UI.

## Arquitetura do sistema

### Visão dos componentes

**Backend (novos)**

- `controllers/cities.controller.ts` — handler de `GET /api/v1/cities/search`; valida `q` e `limit` (Zod), delega para `citiesService`, devolve 200/400/422/502.
- `controllers/weather.controller.ts` — handler de `GET /api/v1/weather`; valida `lat`, `lon`, `city?`, delega para `weatherService`.
- `services/cities.service.ts` — orquestra `geocodingClient.search()`; aplica regra de mínimo 2 caracteres e normalização de resultados.
- `services/weather.service.ts` — chama `forecastClient.get()`, aplica `mapWeatherCode()` para descrição/ícone pt-BR e monta o DTO `WeatherSnapshot`.
- `data/clients/openMeteoGeocodingClient.ts` — `fetch` para `https://geocoding-api.open-meteo.com/v1/search`; aplica timeout, traduz erros HTTP/transporte em `ProviderError`.
- `data/clients/openMeteoForecastClient.ts` — `fetch` para `https://api.open-meteo.com/v1/forecast` montando query (`current=...`, `daily=...`, `forecast_days=7`, `timezone=auto`).
- `lib/weatherCodeMap.ts` — tabela de WMO → `{ description: string; icon: WeatherIcon }`.
- `lib/httpError.ts` — utilitário para mapear `ProviderError`/`ValidationError` em status HTTP.
- `middleware/errorHandler.ts` — substitui o handler genérico atual; produz `{ error, message, details? }` consistente.
- `index.ts` — registra `cors`, `express.json`, rotas `/api/v1` e o middleware de erro.

**Frontend (novos)** — todos os arquivos e diretórios em **kebab-case** (componentes React continuam exportando símbolos `PascalCase`):

- `features/weather/` (módulo da feature):
  - `api/weather-client.ts` — `fetch` tipado para os endpoints do backend; usa `VITE_API_URL` (já existe um `fetch` ad-hoc em `App.tsx` usando `http://localhost:3000`).
  - `hooks/use-city-search.ts` — debounce (≥300 ms), aborta requisições obsoletas (`AbortController`), expõe `{ items, status, error }`.
  - `hooks/use-weather.ts` — recebe `{ lat, lon, cityLabel }`, dispara busca, expõe `{ data, status, error, refetch }`.
  - `hooks/use-geolocation.ts` — encapsula `navigator.geolocation.getCurrentPosition` (permission prompt sob ação explícita do usuário, RF-06).
  - `components/search-box.tsx` — exporta `SearchBox`; input acessível + lista de resultados (combobox ARIA), chama `onSelect(city)`.
  - `components/current-weather-card.tsx` — exporta `CurrentWeatherCard`; bloco principal com temperatura, sensação, condição, vento, umidade, timestamp local.
  - `components/forecast-list.tsx` — exporta `ForecastList`; lista de 7 dias com data, mín/máx e ícone.
  - `components/weather-state-boundary.tsx` — exporta `WeatherStateBoundary`; renderiza estados de `loading`, `empty`, `error` com `aria-live="polite"`.
  - `types.ts` — DTOs derivados do contrato do backend (manter alinhado).
- `pages/weather-page.tsx` — exporta `WeatherPage`; compõe `SearchBox`, `CurrentWeatherCard`, `ForecastList`; mantém estado de `selectedCity`.
- Integração em `App.tsx` (substitui o conteúdo demo) ou em rota nova caso roteador seja adicionado.

**Fluxo de dados**

```
Browser (geolocation API | input usuário)
   → features/weather/api/weatherClient
   → Express Controller (Zod validate)
   → Service (regras + WMO map)
   → Data Client (fetch Open-Meteo)
   → Service (DTO normalizado)
   → Controller (200 JSON)
   → Hook (estado) → Componentes
```

## Design de implementação

### Principais interfaces

```ts
// backend/src/types/weather.ts
type City = {
  id: number;
  name: string;
  region?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type CurrentWeather = {
  observedAt: string;        // ISO local da cidade
  temperatureC: number;
  feelsLikeC: number;
  weatherCode: number;
  description: string;       // pt-BR
  icon: WeatherIcon;         // união nominal
  windSpeedKmh: number;
  humidityPercent: number;
};

type ForecastDay = {
  date: string;              // YYYY-MM-DD na timezone da cidade
  minTemperatureC: number;
  maxTemperatureC: number;
  weatherCode: number;
  description: string;
  icon: WeatherIcon;
};

type WeatherSnapshot = {
  city: City;
  current: CurrentWeather;
  daily: ForecastDay[];      // 7 itens, dia atual incluso
  attribution: { provider: 'Open-Meteo'; url: string };
};

interface CitiesService {
  search(input: { query: string; limit?: number }): Promise<City[]>;
}

interface WeatherService {
  getSnapshot(input: { latitude: number; longitude: number; cityLabel?: string }): Promise<WeatherSnapshot>;
}

interface OpenMeteoGeocodingClient {
  search(query: string, limit: number): Promise<RawGeocodingResult[]>;
}

interface OpenMeteoForecastClient {
  get(coords: { latitude: number; longitude: number }): Promise<RawForecastResult>;
}
```

Os schemas Zod ficam em `backend/src/schemas/weather.schema.ts` (`citySearchQuerySchema`, `weatherQuerySchema`); tipos públicos derivam via `z.infer<typeof X>` para evitar duplicação.

### Modelos de dados

Não há persistência. Todos os modelos são contratos in-memory:

- **Entrada `/cities/search`**: `{ q: string min 2 max 64; limit?: number int 1..10 default 5 }`.
- **Entrada `/weather`**: `{ lat: number -90..90; lon: number -180..180; city?: string max 120 }` (campo `city` é meramente um rótulo de exibição quando vier da geolocalização).
- **Saída `/cities/search`**: `City[]` (até 10).
- **Saída `/weather`**: `WeatherSnapshot`.
- **Erro padrão**: `{ error: 'invalid_input' | 'not_found' | 'provider_unavailable' | 'internal_error'; message: string; details?: unknown }`.

### Endpoints da API

| Método | Caminho | Descrição | Status |
|---|---|---|---|
| GET | `/api/v1/cities/search?q={termo}&limit={n}` | Autocomplete de cidades. | 200, 400, 422, 502 |
| GET | `/api/v1/weather?lat={n}&lon={n}&city={label}` | Snapshot atual + 7 dias. | 200, 400, 404, 502 |
| GET | `/health` | Já existe; mantido. | 200 |

Convenções (skill `express-rest-http`): JSON em request/response; `fetch` nativo para chamadas externas; `400` para entrada malformada; `422` para regra de negócio (ex.: `q` com menos de 2 chars); `404` quando geocoding não devolve cidade equivalente para `lat/lon` informados (raro, ainda assim mapeado); `502` para falha do provedor externo (timeout, 5xx, body inválido); `500` apenas para erros realmente inesperados. OpenAPI deve ser mantido em `backend/openapi.yaml` listando os dois novos verbos e payloads.

## Pontos de integração

- **Open-Meteo Geocoding** (`https://geocoding-api.open-meteo.com/v1/search`): query `name=<q>&count=<limit>&language=pt&format=json`. Sem credenciais.
- **Open-Meteo Forecast** (`https://api.open-meteo.com/v1/forecast`): query `latitude=&longitude=&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto&windspeed_unit=kmh&temperature_unit=celsius`.
- **Tratamento de erros (clientes data/)**: `fetch` com `AbortSignal.timeout(5000)`; verificar `response.ok`; ler corpo só uma vez; lançar `ProviderError(reason, cause)` que `weatherService` propaga e o middleware mapeia para `502` com `message` amigável (RF-18).
- **Atribuição** (Termos Open-Meteo, CC BY 4.0): expor o objeto `attribution` no payload e renderizar “Dados meteorológicos por Open-Meteo” como link visível em `WeatherPage`.
- **Geolocalização (browser)**: `useGeolocation` solicita permissão somente após clique explícito (RF-06); falhas (`PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`) viram estado de erro e UI orienta o uso da busca textual (RF-07/RF-08); coordenadas são passadas direto para `useWeather` e descartadas no fim do ciclo (sem persistência).

## Abordagem de testes

### Testes unitários (Vitest, conforme skill `vitest-testing`)

- `services/cities.service.test.ts`: AAA cobrindo busca válida, query < 2 chars (deve lançar `ValidationError`), provider erro (propaga `ProviderError`).
- `services/weather.service.test.ts`: monta `WeatherSnapshot` a partir de payload fake, valida mapeamento de `weathercode` em pt-BR, casos de campos opcionais ausentes.
- `lib/weatherCodeMap.test.ts`: cobertura de cada bucket WMO (claro, parcialmente nublado, nublado, neblina, chuvisco/chuva fraca/moderada/forte, neve, trovoada, código desconhecido → fallback “Condição desconhecida”).
- `data/clients/*`: testar montagem de URL e tratamento de `response.ok === false`, com `vi.stubGlobal('fetch', vi.fn())`.
- Frontend (arquivos kebab-case): `components/current-weather-card.test.tsx`, `components/search-box.test.tsx`, `components/forecast-list.test.tsx`, `hooks/use-city-search.test.ts` (debounce com `vi.useFakeTimers`), `hooks/use-geolocation.test.ts`. Sem libs além do que já há (`@testing-library/react` e `vitest` precisarão ser adicionados como dev deps).

### Testes de integração HTTP (backend)

- `tests/integration/weather.routes.test.ts`: instancia `app` Express sem subir socket, usa `app.handle` ou chama via `fetch` real contra `app.listen(0)`. Mocka `global.fetch` com `vi.fn()` para evitar saída de rede e validar:
  - 200 `cities/search` retorna lista normalizada;
  - 400 `cities/search` quando `q` inválido;
  - 422 quando `q.length < 2`;
  - 200 `weather` com payload completo;
  - 502 quando o provider devolve 500 ou timeout (`AbortError`).
- Política `vitest-testing` § 9: integração HTTP sem Supertest.

### Testes E2E (Playwright)

- Cenários cobertos:
  1. Busca textual → seleção de cidade → clima exibido (golden path).
  2. Geolocalização concedida → cidade detectada → clima exibido.
  3. Geolocalização negada → fallback para busca textual.
  4. Cidade inexistente → mensagem de “nenhum resultado”.
  5. Provedor indisponível → mensagem amigável + botão “tentar novamente”.
- Open-Meteo é interceptado via `page.route('**/geocoding-api.open-meteo.com/**', ...)` e `**/api.open-meteo.com/**` para fixtures determinísticas. `playwright.config.ts` inicia backend e frontend em paralelo via `webServer`.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Schemas + tipos compartilhados** (`backend/src/schemas`, `backend/src/types`): contratos primeiro para destravar paralelismo.
2. **`weatherCodeMap` e clientes Open-Meteo** (`data/clients/*`): isoláveis e cobertos por unit tests.
3. **Services** (`cities.service`, `weather.service`): regras + composição com clientes.
4. **Controllers + middleware de erro + roteador `/api/v1`**: amarra HTTP, registra OpenAPI.
5. **Frontend `features/weather/api` + hooks** (`use-city-search.ts`, `use-weather.ts`, `use-geolocation.ts`).
6. **Componentes UI** (`search-box.tsx`, `current-weather-card.tsx`, `forecast-list.tsx`, `weather-state-boundary.tsx`) e composição em `pages/weather-page.tsx`.
7. **Integração final**: substituir conteúdo de `App.tsx`, ajustar `index.css`/Tailwind se necessário, adicionar atribuição.
8. **Testes E2E + ajustes finos** (estados de loading/erro, a11y, contraste segundo `DESIGN.md`).

### Dependências técnicas

- Backend: adicionar `zod` como dependência. Manter `express@5`, `cors`, `dotenv`, `tsx` já presentes. Para testes: `vitest`.
- Frontend: adicionar `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` (dev). `lucide-react` já disponível para ícones. `playwright` (dev) para E2E.
- Variável de ambiente `VITE_API_URL` no frontend; `PORT` (já existe) e opcional `OPEN_METEO_TIMEOUT_MS` (default 5000) no backend.
- Disponibilidade da Open-Meteo: serviço externo gratuito, sujeito a fair-use; sem chave.

## Monitoramento e observabilidade

Sem stack de métricas existente; o foco é deixar gancho mínimo, instrumentável depois:

- **Logs estruturados** (`console.log(JSON.stringify(...))`) por requisição em `errorHandler` e nos clientes externos: `{ level, msg, route, durationMs, providerStatus, errorCode }`. Nível `info` para sucesso, `warn` para `4xx`, `error` para `5xx`/exceções.
- **Headers de correlação**: aceitar `X-Request-Id` e ecoar; gerar um se ausente (`crypto.randomUUID`).
- **Métricas futuras (placeholder)**: contadores `weather_requests_total{route,status}` e histogram `weather_provider_latency_ms{client}` no padrão Prometheus quando uma camada de métricas for adicionada.
- **Health**: `/health` permanece como liveness. Adicionar `GET /api/v1/weather/_diagnose` é fora do escopo.

## Considerações técnicas

### Principais decisões

- **Dois endpoints REST** em vez de agregador único: cumpre a separação por recurso recomendada pelo skill `express-rest-http`, permite evoluir cache/timeouts independentes e mantém o frontend explícito sobre o que está fazendo. Trade-off: duas chamadas de rede no fluxo “digitar → ver clima”, mitigado por debounce e seleção explícita.
- **Backend como único consumidor da Open-Meteo**: cumpre RF/restrição do PRD (sem chamadas diretas do frontend), centraliza tradução WMO e atribuição.
- **Sem cache nesta versão** (decisão do produto): aceitamos chamada direta a cada requisição. Para mitigar lat 95 ≤ 1.5 s, usamos `timezone=auto` e payload mínimo (somente os campos exibidos). Caso métricas indiquem latência alta, abrir issue para introduzir cache em memória (geocoding ~24 h, forecast ~10 min).
- **Zod** para validação: type-safe, tipos derivados via `z.infer`, mensagens consistentes; alinhado ao `tsconfig` `strict` e ao skill `nodejs-typescript-conventions` (sem `any`).
- **Geolocalização no frontend** (HTML5) — não há reverse-geocoding no Open-Meteo; o backend recebe coordenadas e retorna a cidade resolvida pela própria Forecast/Geocoding. Se houver discrepância, exibe-se o `cityLabel` opcional como fallback.
- **i18n inicial**: tradução de `weathercode` mantida no backend para não duplicar em testes E2E e clientes futuros (mobile, etc.).

### Riscos conhecidos

- **Indisponibilidade ou throttling Open-Meteo** (sem SLA): mitigação = mensagem amigável + retry manual; futura introdução de cache.
- **Discrepância entre cidade buscada e cidade resolvida por geolocalização**: mitigação = exibir `City.name` retornado pelo backend; manter `cityLabel` apenas como hint visual.
- **Reverse-geocoding ausente na Open-Meteo**: o endpoint `/weather` confia em `lat/lon` enviados pelo frontend e no `timezone=auto`; o nome da cidade exibida vem de uma chamada paralela à Geocoding API com `name` igual ao `cityLabel` quando disponível, ou do campo `timezone_abbreviation`/`utc_offset_seconds` como fallback discreto. Necessita pesquisa: avaliar se chamada extra à Geocoding compensa frente ao orçamento de latência (2 chamadas externas por request).
- **Privacidade**: garantir que coordenadas não entrem em logs (`errorHandler` deve sanitizar querystring antes de logar — substituir `lat/lon` por `***`).
- **Acessibilidade**: contraste WCAG AA exige cuidado especial com a paleta cream/coral do `DESIGN.md`; revisar `CurrentWeatherCard` em modo claro.

## Conformidade com rules

`.agents/rules/` não existe neste repositório. Não há regras adicionais a aplicar.

## Conformidade com skills

- `repo-folder-structure` — backend `controllers/ → services/ → data/`; frontend `features/weather/` colocalizando `api`, `hooks`, `components`, `types.ts`.
- `express-rest-http` — recursos plurais (`/cities`, `/weather`), JSON in/out, status codes canônicos, `fetch` nativo para Open-Meteo, OpenAPI atualizado.
- `nodejs-typescript-conventions` — TS only, ESM, `async/await`, sem `any`, `const` por padrão, npm como gerente.
- `code-standards-en` — identificadores em inglês (`citiesService`, `weatherCodeMap`); copy pt-BR só em mensagens de UI/erros expostos; funções com verbo (`getSnapshot`, `mapWeatherCode`); CQS preservada (services puros + clients com side-effects).
- `react-frontend-conventions` — componentes funcionais TSX, estado colocalizado em `WeatherPage`, props explícitas, Tailwind, hooks `use*`, componentes < 100 linhas, testes por componente. Convenção de nomes: arquivos e diretórios em `kebab-case`; símbolos exportados continuam em `PascalCase` (componentes/tipos) ou `camelCase` (funções/hooks).
- `vitest-testing` — Vitest + `vi`, AAA, fake timers para debounce, integração HTTP sem Supertest.
- `ui-ux-pro-max` — seguir `DESIGN.md` (cream/coral, tipografia serif para display, `body-md` StyreneB), contraste AA, foco visível, `aria-live` em estados, `aria-combobox` no `SearchBox`, ícones SVG (`lucide-react`).

## Arquivos relevantes e dependentes

**Backend (novos)**

- `backend/src/index.ts` — registrar rotas, middleware de erro e logger.
- `backend/src/routes/index.ts` — agrega rotas `/api/v1`.
- `backend/src/controllers/cities.controller.ts`
- `backend/src/controllers/weather.controller.ts`
- `backend/src/services/cities.service.ts`
- `backend/src/services/weather.service.ts`
- `backend/src/data/clients/openMeteoGeocodingClient.ts`
- `backend/src/data/clients/openMeteoForecastClient.ts`
- `backend/src/schemas/weather.schema.ts`
- `backend/src/types/weather.ts`
- `backend/src/lib/weatherCodeMap.ts`
- `backend/src/lib/httpError.ts`
- `backend/src/middleware/errorHandler.ts`
- `backend/openapi.yaml` — adicionar/atualizar especificação.
- `backend/package.json` — incluir `zod`, `vitest`.

**Frontend (novos / modificados)** — todos os arquivos em `kebab-case`:

- `frontend/src/features/weather/api/weather-client.ts`
- `frontend/src/features/weather/hooks/use-city-search.ts`
- `frontend/src/features/weather/hooks/use-weather.ts`
- `frontend/src/features/weather/hooks/use-geolocation.ts`
- `frontend/src/features/weather/components/search-box.tsx`
- `frontend/src/features/weather/components/current-weather-card.tsx`
- `frontend/src/features/weather/components/forecast-list.tsx`
- `frontend/src/features/weather/components/weather-state-boundary.tsx`
- `frontend/src/features/weather/types.ts`
- `frontend/src/features/weather/index.ts` — barrel seletivo.
- `frontend/src/pages/weather-page.tsx`
- `frontend/src/App.tsx` — passa a renderizar `WeatherPage` (arquivo `App.tsx` mantido como está pelo bootstrap atual; novos arquivos seguem kebab-case).
- `frontend/src/lib/utils.ts` — manter `cn`; eventualmente adicionar `formatTemperature`/`formatDate` se reutilizáveis.
- `frontend/package.json` — incluir `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@playwright/test`.

**Tests (novos)**

- `backend/tests/unit/services/{cities,weather}.service.test.ts`
- `backend/tests/unit/lib/weatherCodeMap.test.ts`
- `backend/tests/integration/weather.routes.test.ts`
- `frontend/src/features/weather/**/*.test.{ts,tsx}`
- `e2e/weather.spec.ts` (+ `playwright.config.ts` na raiz ou em `e2e/`).

**Documentação**

- `tasks/prd-painel-clima/prd.md` — fonte (não modificar).
- `tasks/prd-painel-clima/techspec.md` — este documento.
- `DESIGN.md` — referência obrigatória para a UI.
