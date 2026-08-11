# Especificação técnica

## Resumo executivo

A feature será implementada como uma camada de apresentação no frontend, mantendo o backend como fonte canônica de dados métricos. O backend deve expor os endpoints atuais também em `/api/v1`, alinhando contrato com o frontend e preservando `/api/v0` apenas como compatibilidade. A troca de unidades não deve disparar nova consulta meteorológica: a UI converte os valores já carregados e mantém cidade, previsão, erro, loading e estado vazio.

A preferência de unidade viverá somente em memória React dentro de `WeatherPage`; ao recarregar a página, o estado volta para métrico. A abordagem minimiza impacto no BFF, evita duplicação de chamadas externas e concentra conversões em helpers testáveis no módulo `frontend/src/features/weather/`.

## Arquitetura do sistema

### Visão dos componentes

- `backend/src/app.ts` e `backend/src/controllers/weather.controller.ts`: registrar e documentar `/api/v1` com os mesmos recursos de clima existentes. O payload segue métrico e não recebe parâmetro de unidade.
- `frontend/src/pages/weather-page.tsx`: possuir o estado `unitSystem`, iniciar como `metric`, renderizar o controle segmentado no bloco de busca e repassar a seleção para componentes de clima.
- `frontend/src/features/weather/lib/weather-units.ts`: novo módulo puro para conversões, arredondamento, símbolos e labels por unidade.
- `frontend/src/features/weather/components/unit-system-toggle.tsx`: novo controle segmentado acessível com duas opções: `°C / km/h` e `°F / mph`.
- `CurrentWeatherCard` e `ForecastList`: receber `unitSystem` e formatar temperatura e vento via helpers, sem alterar o formato do DTO.
- Testes Vitest existentes: ampliar cobertura de componentes, página, cliente HTTP e helpers.

Fluxo de dados: usuário busca cidade ou usa geolocalização -> frontend chama `/api/v1` -> backend retorna valores métricos -> `WeatherPage` guarda snapshot e unidade ativa -> componentes renderizam valores convertidos conforme `unitSystem`.

## Design de implementação

### Principais interfaces

```ts
export type UnitSystem = 'metric' | 'imperial'

export interface WeatherDisplayUnits {
  temperature: '°C' | '°F'
  windSpeed: 'km/h' | 'mph'
}

export interface FormattedWeatherValue {
  value: string
  unit: string
  label: string
}

export interface UnitSystemToggleProps {
  value: UnitSystem
  onChange(value: UnitSystem): void
}
```

`weather-units.ts` deve expor funções puras como `formatTemperature(valueCelsius, unitSystem)`, `formatWindSpeed(valueKmh, unitSystem)` e `getUnitSystemLabel(unitSystem)`. As conversões usam Celsius -> Fahrenheit, km/h -> mph e `Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })` para manter leitura consistente.

### Modelos de dados

Não haverá banco, cookie, localStorage ou sessionStorage. O estado novo é exclusivamente:

- `UnitSystem`: estado local em `WeatherPage`, default `metric`.
- `WeatherSnapshot`: permanece como contrato principal do frontend com temperatura em Celsius e vento em km/h.
- `WeatherPanelData`: permanece como contrato legado normalizado pelo cliente enquanto `/api/v0` existir.

Métricas não exibidas atualmente, como pressão, precipitação acumulada, visibilidade e rajadas, ficam fora da entrega. A spec não exige ampliar o payload do backend para essas métricas nesta feature.

### Endpoints da API

- `GET /api/v1/cities/search?q={termo}&limit={n}`: busca de cidades equivalente ao contrato pretendido pelo frontend. Resposta canônica `City[]`.
- `GET /api/v1/weather?lat={n}&lon={n}&city={label}`: clima atual e previsão de 7 dias em unidades métricas canônicas. Resposta canônica `WeatherSnapshot`.
- `GET /api/v1/openapi.json`: documentação OpenAPI incluindo os endpoints acima.
- `GET /api/v0/*`: manter como compatibilidade temporária, sem orientar novas chamadas do frontend.

O frontend deve priorizar `/api/v1` sem depender do fallback para `/api/v0` como caminho normal. Erros continuam no padrão existente de mensagem amigável.

## Pontos de integração

Não há nova integração externa. O backend continua sendo o único consumidor da Open-Meteo e do reverse geocoding opcional já existente. A troca de unidade é estritamente client-side, portanto não altera autenticação, timeout, atribuição Open-Meteo nem estratégia de tratamento de falhas externas.

## Abordagem de testes

### Testes unitários

- `weather-units.test.ts`: validar Celsius/Fahrenheit, km/h/mph, arredondamento, números negativos e labels.
- `unit-system-toggle.test.tsx`: validar renderização das duas opções, estado selecionado por texto/ARIA, clique e navegação por teclado.
- `current-weather-card.test.tsx`: cobrir métrico default e imperial, incluindo temperatura atual, sensação térmica e vento.
- `forecast-list.test.tsx`: cobrir mínimas/máximas em métrico e imperial.
- `weather-client.test.ts`: confirmar que o caminho principal usa `/api/v1`.

### Testes de integração

- Backend HTTP em `weather.controller.test.ts`: validar `/api/v1/cities/search`, `/api/v1/weather` e `/api/v1/openapi.json`, mantendo testes existentes de `/api/v0` se a compatibilidade permanecer.
- `WeatherPage` com Testing Library: buscar cidade, alternar unidade após dados carregados e confirmar que `fetch` de clima não é chamado novamente.

### Testes E2E

Usar Playwright nos fluxos já existentes do painel:

- Busca textual -> clima em `°C / km/h` por padrão.
- Alternar para `°F / mph` preservando cidade e previsão.
- Alternar durante erro, loading e estado vazio sem remover foco do controle.
- Verificar título, meta description, hierarquia de headings, link de atribuição e navegação por teclado como baseline de acessibilidade e SEO técnico mínimo.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Expor `/api/v1` no backend e atualizar OpenAPI/testes para remover a divergência de contrato.
2. Criar `weather-units.ts` com conversões e testes unitários isolados.
3. Criar `UnitSystemToggle` acessível e testado.
4. Integrar `unitSystem` em `WeatherPage`, mantendo estado somente em memória.
5. Atualizar `CurrentWeatherCard` e `ForecastList` para receberem unidade e formatadores.
6. Ajustar testes de página e E2E para garantir ausência de nova busca ao alternar unidade.

### Dependências técnicas

- Sem nova dependência npm obrigatória.
- Reusar React, Tailwind, lucide-react, Testing Library, Vitest e Playwright já adotados.
- Backend continua em Express, com `fetch` nativo para provedores externos.

## Monitoramento e observabilidade

A feature não muda tráfego externo quando o usuário alterna unidades; logo não exige nova métrica de provedor. Caso a aplicação passe a expor Prometheus futuramente, usar contador `weather_unit_toggle_total{unit_system}` no frontend via pipeline analítico apropriado, sem bloquear esta entrega.

No backend, logs e métricas existentes de `/api/v0` devem ser refletidos para `/api/v1` com labels de rota distintos. Não há dashboard Grafana existente no repositório; a spec apenas preserva nomes de rota consistentes para integração posterior.

## Considerações técnicas

### Principais decisões

- Conversão no frontend: atende troca instantânea sem nova busca e preserva contexto carregado.
- Dados métricos canônicos: reduz ambiguidade no contrato e mantém compatibilidade com a implementação atual.
- Estado em memória: cumpre a decisão de sessão atual perdida no refresh, sem storage.
- Controle segmentado no bloco de busca: deixa claro que a unidade afeta a consulta visual inteira e fica próximo ao início do fluxo.
- `/api/v1` no backend: elimina divergência atual entre frontend e servidor, deixando `/api/v0` como legado.

### Riscos conhecidos

- Arredondamento pode gerar diferenças perceptíveis entre valores convertidos localmente e valores que um provedor retornaria já em imperial. Mitigação: documentar que a fonte canônica é métrica e testar os helpers.
- O controle pode ser confundido com filtro de busca se ficar muito próximo do input. Mitigação: usar `fieldset`, `legend` curto e labels com unidades explícitas.
- Strings atuais exibem mojibake em alguns outputs de terminal, mas os arquivos fonte devem permanecer em UTF-8. Mitigação: preservar codificação UTF-8 e revisar copy renderizada no navegador.
- SEO técnico mínimo pode regredir se a página perder `document.title`, meta description, heading principal ou link de atribuição. Mitigação: cobrir em testes de página/E2E.

### Conformidade com rules

`.agents/rules/` não existe neste repositório. Não há rules locais adicionais a aplicar.

### Conformidade com skills

- `context7`: consulta técnica usada para React e decisões dependentes de documentação atual.
- `express-rest-http`: manter Express, JSON, status canônicos e OpenAPI para `/api/v1`.
- `repo-architecture`: backend em `controllers -> services -> data`; frontend colocalizado em `features/weather`.
- `nodejs-typescript-conventions`: TypeScript, npm, tipos explícitos, sem `any`.
- `code-standards-en`: identificadores em inglês, arquivos em kebab-case e helpers com verbos.
- `react-frontend-conventions`: componentes funcionais TSX, estado local, props explícitas, Tailwind e testes.
- `vitest-testing`: testes com Vitest/`vi`, independentes e no padrão AAA.
- `ui-ux-pro-max`: foco visível, contraste AA, labels, teclado, touch target e layout responsivo.

### Arquivos relevantes e dependentes

- `backend/src/app.ts`
- `backend/src/controllers/weather.controller.ts`
- `backend/src/controllers/weather.controller.test.ts`
- `backend/src/types/weather.ts`
- `frontend/src/pages/weather-page.tsx`
- `frontend/src/pages/weather-page.test.tsx`
- `frontend/src/features/weather/api/weather-client.ts`
- `frontend/src/features/weather/api/weather-client.test.ts`
- `frontend/src/features/weather/types.ts`
- `frontend/src/features/weather/lib/weather-units.ts`
- `frontend/src/features/weather/lib/weather-units.test.ts`
- `frontend/src/features/weather/components/unit-system-toggle.tsx`
- `frontend/src/features/weather/components/unit-system-toggle.test.tsx`
- `frontend/src/features/weather/components/current-weather-card.tsx`
- `frontend/src/features/weather/components/current-weather-card.test.tsx`
- `frontend/src/features/weather/components/forecast-list.tsx`
- `frontend/src/features/weather/components/forecast-list.test.tsx`
- `frontend/src/features/weather/test/fixtures.ts`
- `DESIGN.md`
