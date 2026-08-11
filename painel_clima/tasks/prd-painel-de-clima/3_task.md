# Tarefa 3.0: Testes E2E (Playwright) com fixtures determinísticas

## Visão geral

Cobrir os fluxos críticos do PRD ponta a ponta com Playwright, executando backend (tarefa 1.0) e frontend (tarefa 2.0) em paralelo via `webServer`. As chamadas à Open-Meteo são interceptadas por `page.route` com fixtures determinísticas, garantindo testes reproduzíveis sem dependência da rede pública. A suite valida os 5 cenários canônicos: golden path de busca textual, geolocalização concedida, geolocalização negada (fallback), cidade inexistente e provedor indisponível.

<skills>
### Conformidade com skills

- `vitest-testing` — convenção AAA, sem Supertest; aqui aplicado ao Playwright via `test.step` para clareza.
- `react-frontend-conventions` — selectors preferem `getByRole`/`getByLabel` (acessibilidade) em vez de seletores frágeis de classe.
- `code-standards-en` — identificadores e nomes de teste em inglês; copy esperada em pt-BR (texto da UI).
- `ui-ux-pro-max` — verificações de acessibilidade básicas (foco visível, `aria-live`, navegação por teclado) integradas aos cenários.
</skills>

<requirements>
- Cobrir os 5 cenários do techspec § "Testes E2E (Playwright)".
- Backend e frontend sobem automaticamente via `playwright.config.ts > webServer` (sem dependência de processos manuais).
- Open-Meteo interceptada em todos os cenários — nenhum teste depende da rede externa.
- Fixtures determinísticas para `geocoding-api.open-meteo.com` e `api.open-meteo.com` mantidas em arquivos versionados (`e2e/fixtures/`).
- Geolocalização do navegador controlada via `context.grantPermissions(['geolocation'])` e `context.setGeolocation({...})` ou simulada por mock conforme cenário.
- Suite executa em CI sem flakiness (aguardar `aria-live` ou roles, não `setTimeout` arbitrário).
</requirements>

## Subtarefas

- [x] 3.1 Adicionar `@playwright/test` como dev dependency na raiz (ou em `e2e/package.json` se preferido); rodar `npx playwright install` no setup.
- [x] 3.2 Criar `playwright.config.ts` (raiz ou `e2e/`) com `webServer` subindo backend (`npm run dev` em `backend/`) e frontend (`npm run dev` em `frontend/`) em paralelo, `baseURL` apontando para o frontend, `reuseExistingServer` em local.
- [x] 3.3 Criar fixtures determinísticas em `e2e/fixtures/`: `geocoding-sao-paulo.json`, `geocoding-empty.json`, `forecast-sao-paulo.json`, `forecast-error.json`.
- [x] 3.4 Criar utilitário `e2e/support/mock-open-meteo.ts` com helpers `mockGeocoding(page, fixture)` e `mockForecast(page, fixture | { status })` interceptando os endpoints do BFF (`/api/v1/cities/search` e `/api/v1/weather`) — `page.route` só vê tráfego do browser, então as URLs upstream da Open-Meteo (chamadas server-side pelo Express) não podem ser interceptadas dali; o helper `blockOpenMeteoUpstream` é exportado como defesa em profundidade.
- [x] 3.5 Criar `e2e/weather.spec.ts` implementando os 5 cenários listados em "Critérios de sucesso".
- [x] 3.6 Adicionar script `test:e2e` no `package.json` apropriado e documentar no README/AGENTS.md como rodar localmente.

## Detalhes de implementação

Ver `tasks/prd-painel-clima/techspec.md` — seções:
- "Testes E2E (Playwright)" — lista os 5 cenários, política de interceptação e configuração de `webServer`.
- "Pontos de integração" → URLs Open-Meteo (alvos da interceptação).
- "Sequenciamento do desenvolvimento" item 8 (ajustes finos a partir dos resultados E2E).

## Critérios de sucesso

Cinco cenários implementados e verdes em CI:

1. **Golden path — busca textual**: usuário digita "São Paulo", seleciona resultado, vê `CurrentWeatherCard` com temperatura/condição/vento/umidade e `ForecastList` com 7 dias.
2. **Geolocalização concedida**: permissão e coordenadas injetadas via Playwright; usuário clica em "usar minha localização"; clima aparece para a cidade detectada.
3. **Geolocalização negada**: permissão recusada; usuário clica em "usar minha localização"; vê mensagem orientando a busca textual; consegue concluir o golden path em seguida.
4. **Cidade inexistente**: digita termo sem correspondência (geocoding retorna lista vazia); UI mostra mensagem clara de "nenhum resultado".
5. **Provedor indisponível**: forecast retorna 500 (ou timeout); UI mostra mensagem amigável + botão "tentar novamente"; clicar no botão dispara nova requisição (a fixture pode então retornar sucesso).

Adicionalmente:

- Suite roda via `npx playwright test` sem necessidade de subir backend/frontend manualmente.
- Nenhum teste contata `geocoding-api.open-meteo.com` ou `api.open-meteo.com` reais (verificar com `--reporter=list` que todas as rotas são interceptadas).
- Tempo total da suite ≤ 60 s em máquina de desenvolvimento típica.
- Testes não dependem de `setTimeout`/`waitForTimeout` arbitrários; usam `expect(locator).toBeVisible()` com `aria-live`/roles.

## Testes da tarefa

- [x] **Testes unitários** — não aplicável (esta tarefa entrega exclusivamente E2E).
- [x] **Testes de integração** — não aplicável (cobertos nas tarefas 1.0 e 2.0).
- [x] **Testes E2E**
  - `e2e/weather.spec.ts > search → select → weather` (cenário 1).
  - `e2e/weather.spec.ts > geolocation granted → weather` (cenário 2).
  - `e2e/weather.spec.ts > geolocation denied → fallback to search` (cenário 3).
  - `e2e/weather.spec.ts > unknown city → empty state` (cenário 4).
  - `e2e/weather.spec.ts > provider unavailable → retry` (cenário 5).

## Arquivos relevantes

- `playwright.config.ts`
- `e2e/weather.spec.ts`
- `e2e/support/mock-open-meteo.ts`
- `e2e/fixtures/geocoding-sao-paulo.json`
- `e2e/fixtures/geocoding-empty.json`
- `e2e/fixtures/forecast-sao-paulo.json`
- `e2e/fixtures/forecast-error.json`
- `package.json` (script `test:e2e` e dev dependency `@playwright/test`)
