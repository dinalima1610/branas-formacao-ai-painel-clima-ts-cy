# Tarefa 1.0: Backend completo — BFF Open-Meteo

## Visão geral

Entregar a camada HTTP do backend que atua como BFF da Open-Meteo, expondo os endpoints `GET /api/v1/cities/search` (autocomplete por nome) e `GET /api/v1/weather` (clima atual + previsão de 7 dias por coordenadas). O frontend nunca conversa diretamente com a Open-Meteo. A entrega segue o fluxo `controllers → services → data` definido pelo skill `repo-folder-structure`, com validação Zod, tradução de `weathercode` (WMO) para pt-BR e payload normalizado e auto-suficiente para a UI. Sem cache nem persistência nesta versão (privacidade exigida pelo PRD).

<skills>
### Conformidade com skills

- `repo-folder-structure` — backend organizado em `controllers/ → services/ → data/`, com `lib/`, `schemas/`, `types/`, `middleware/`.
- `express-rest-http` — recursos plurais (`/cities`, `/weather`), JSON in/out, status canônicos (200/400/422/404/502/500), `fetch` nativo para chamadas externas, OpenAPI atualizado.
- `nodejs-typescript-conventions` — TS only, ESM, `async/await`, sem `any`, `const` por padrão, npm como gerente.
- `code-standards-en` — identificadores em inglês (`citiesService`, `weatherCodeMap`, `getSnapshot`, `mapWeatherCode`), CQS preservada (services puros + clients com side-effects), early return, métodos curtos. Cópias pt-BR somente em mensagens de erro/UI expostas.
- `vitest-testing` — Vitest + `vi`, AAA, integração HTTP sem Supertest, `vi.stubGlobal('fetch', vi.fn())` para isolar rede.
</skills>

<requirements>
- RF-01 a RF-04 (busca de cidade) e RF-09 a RF-16 (clima atual + previsão 7 dias) atendidos pelo contrato dos endpoints.
- RF-17/RF-18 — backend devolve status canônicos e payload de erro consistente (`{ error, message, details? }`) para que a UI possa renderizar estados claros.
- Privacidade — coordenadas (`lat/lon`) nunca persistidas nem registradas em logs (sanitizar querystring no `errorHandler`).
- Atribuição Open-Meteo presente no payload de `/api/v1/weather` (objeto `attribution`).
- Desempenho — chamadas externas com `AbortSignal.timeout(5000)`; payload mínimo (somente campos exibidos) para auxiliar P95 ≤ 1,5 s.
- Sem chave de API; sem credencial exposta.
- OpenAPI (`backend/openapi.yaml`) atualizado com os dois novos verbos.
</requirements>

## Subtarefas

- [x] 1.1 Adicionar dependências `zod` (runtime) e `vitest` (dev) em `backend/package.json` e ajustar scripts de teste.
- [x] 1.2 Criar `backend/src/types/weather.ts` com `City`, `CurrentWeather`, `ForecastDay`, `WeatherSnapshot`, `WeatherIcon` e tipos auxiliares (`RawGeocodingResult`, `RawForecastResult`).
- [x] 1.3 Criar `backend/src/schemas/weather.schema.ts` com `citySearchQuerySchema` e `weatherQuerySchema`; tipos públicos derivados via `z.infer`.
- [x] 1.4 Criar `backend/src/lib/weatherCodeMap.ts` cobrindo todos os buckets WMO (claro, parcialmente nublado, nublado, neblina, chuvisco/chuva fraca/moderada/forte, neve, trovoada) com fallback "Condição desconhecida".
- [x] 1.5 Criar `backend/src/lib/httpError.ts` com `ProviderError`, `ValidationError` e utilitário para mapear erros internos em status HTTP canônicos.
- [x] 1.6 Criar `backend/src/data/clients/openMeteoGeocodingClient.ts` (`fetch` para `https://geocoding-api.open-meteo.com/v1/search`, query `name=&count=&language=pt&format=json`, timeout, mapeamento de erros para `ProviderError`).
- [x] 1.7 Criar `backend/src/data/clients/openMeteoForecastClient.ts` (`fetch` para `https://api.open-meteo.com/v1/forecast` montando `current=`, `daily=`, `forecast_days=7`, `timezone=auto`, `windspeed_unit=kmh`, `temperature_unit=celsius`).
- [x] 1.8 Criar `backend/src/services/cities.service.ts` (regra de mínimo 2 caracteres → `ValidationError`, normalização de resultados, propagação de `ProviderError`).
- [x] 1.9 Criar `backend/src/services/weather.service.ts` (compõe `WeatherSnapshot` a partir de `RawForecastResult`, aplica `mapWeatherCode`, monta `attribution`, aceita `cityLabel?` opcional).
- [x] 1.10 Criar `backend/src/controllers/cities.controller.ts` e `backend/src/controllers/weather.controller.ts` (validação Zod → service → resposta JSON; status 200/400/422/404/502).
- [x] 1.11 Criar `backend/src/middleware/errorHandler.ts` substituindo o handler genérico (logs estruturados `{ level, msg, route, durationMs, providerStatus, errorCode }`, sanitização de `lat/lon` na querystring antes de logar, suporte/eco de `X-Request-Id` com fallback `crypto.randomUUID`).
- [x] 1.12 Criar `backend/src/routes/index.ts` agregando rotas `/api/v1` e registrar em `backend/src/index.ts` junto com `cors`, `express.json` e o `errorHandler`.
- [x] 1.13 Atualizar `backend/openapi.yaml` documentando os dois endpoints (parâmetros, responses 200/400/422/404/502, schema do erro padrão e `WeatherSnapshot`).
- [x] 1.14 Implementar testes unitários e de integração HTTP (ver "Testes da tarefa").

## Detalhes de implementação

Ver `tasks/prd-painel-clima/techspec.md` — seções:
- "Visão dos componentes" (lista canônica de arquivos e responsabilidades).
- "Principais interfaces" (assinaturas de `CitiesService`, `WeatherService`, clients e DTOs).
- "Modelos de dados" (formato de entrada/saída e erro padrão).
- "Endpoints da API" (tabela de rotas e status codes).
- "Pontos de integração" (URLs e querystring exatas da Open-Meteo, política de timeout, atribuição CC BY 4.0).
- "Sequenciamento do desenvolvimento" itens 1–4 (ordem de construção dentro do backend).

## Critérios de sucesso

- `GET /api/v1/cities/search?q=Sao%20Paulo` retorna 200 com array de `City[]` (até 10 itens) normalizados.
- `GET /api/v1/cities/search?q=a` retorna 422 com `error: 'invalid_input'` (regra ≥2 chars).
- `GET /api/v1/cities/search` (sem `q`) retorna 400 com `error: 'invalid_input'`.
- `GET /api/v1/weather?lat=-23.55&lon=-46.63` retorna 200 com `WeatherSnapshot` completo (city, current, daily com 7 itens incluindo o dia atual, attribution Open-Meteo).
- `GET /api/v1/weather` com coordenadas fora do range (`lat=200`) retorna 400.
- Falha do provedor externo (5xx, body inválido ou timeout `AbortError`) retorna 502 com mensagem amigável.
- `weatherCodeMap` traduz todos os códigos WMO documentados; código desconhecido cai no fallback "Condição desconhecida".
- Logs do `errorHandler` não contêm `lat`/`lon` brutos da querystring.
- `backend/openapi.yaml` valida e documenta os dois novos verbos.
- Suite de testes do backend passa (`npm test` no diretório `backend`).

## Testes da tarefa

- [x] **Testes unitários**
  - `backend/tests/unit/schemas/weather.schema.test.ts` — limites de `q`, `limit`, `lat`, `lon`, `city`.
  - `backend/tests/unit/lib/weatherCodeMap.test.ts` — todos os buckets WMO + fallback.
  - `backend/tests/unit/lib/httpError.test.ts` — mapeamento `ProviderError`/`ValidationError` → status canônicos.
  - `backend/tests/unit/data/clients/openMeteoGeocodingClient.test.ts` — montagem de URL, `response.ok=false`, timeout (`AbortError`) com `vi.stubGlobal('fetch', vi.fn())`.
  - `backend/tests/unit/data/clients/openMeteoForecastClient.test.ts` — idem para forecast (querystring exata).
  - `backend/tests/unit/services/cities.service.test.ts` — busca válida, query `<2` chars → `ValidationError`, propagação de `ProviderError`.
  - `backend/tests/unit/services/weather.service.test.ts` — montagem de `WeatherSnapshot`, mapeamento WMO, opcionais ausentes, atribuição.

- [x] **Testes de integração**
  - `backend/tests/integration/weather.routes.test.ts` instancia `app` Express via `app.listen(0)`, faz `fetch` real contra a porta efêmera, com `vi.stubGlobal('fetch', vi.fn())` para a Open-Meteo. Cenários: 200/`cities/search`, 400/`cities/search` (q ausente), 422/`cities/search` (q < 2), 200/`weather`, 400/`weather` (lat/lon inválidos), 502/`weather` (provider 500 ou `AbortError`).

- [x] **Testes E2E** — não aplicável a esta tarefa (cobertos na 3.0).

## Arquivos relevantes

- `backend/src/index.ts`
- `backend/src/routes/index.ts`
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
- `backend/openapi.yaml`
- `backend/package.json`
- `backend/tests/unit/**`
- `backend/tests/integration/weather.routes.test.ts`
