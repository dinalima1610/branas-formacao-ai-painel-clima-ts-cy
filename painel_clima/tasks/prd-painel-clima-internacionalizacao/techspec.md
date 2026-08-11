# Especificação técnica

## Resumo executivo

A internacionalização será implementada como uma camada de apresentação no frontend do Painel de Clima, sem alterações funcionais no backend. O backend continuará retornando dados meteorológicos canônicos e mensagens próprias, mas a UI não deve depender dessas mensagens para copy visível: textos, estados, rótulos, descrições WMO, datas e números serão resolvidos localmente conforme o idioma ativo.

A solução usa um catálogo tipado de traduções para `pt-BR` e `en-US`, um provider React restrito à feature de clima, formatadores baseados em `Intl` e persistência em `localStorage`. O idioma padrão permanece Português quando não houver preferência salva; ao alternar, a escolha é aplicada imediatamente, gravada para reloads futuros e refletida em `document.documentElement.lang`, `document.title`, meta description e atributos acessíveis.

## Arquitetura do sistema

### Visão dos componentes

- `frontend/src/features/weather/i18n/weather-language-provider.tsx`: novo provider da feature; possui `language`, `setLanguage`, leitura/escrita em `localStorage`, atualização de `document.documentElement.lang` e proteção contra storage indisponível.
- `frontend/src/features/weather/i18n/translations.ts`: novo catálogo tipado com todas as strings de UI, ARIA, estados, mensagens e metadados em Português e Inglês.
- `frontend/src/features/weather/i18n/weather-code-descriptions.ts`: novo mapeamento local de `weatherCode` WMO para descrições em `pt-BR` e `en-US`; substitui a dependência visual de `condition`/`description` vindos do backend.
- `frontend/src/features/weather/lib/weather-formatters.ts`: novo módulo puro para números, temperaturas, percentuais, vento, datas de previsão e data/hora de atualização usando o locale ativo.
- `frontend/src/features/weather/components/language-selector.tsx`: novo controle visível e acessível para alternar `Português` e `English`, com estado ativo perceptível visual e programaticamente.
- `WeatherPage`: passa a envolver a árvore da feature com o provider, posicionar o seletor no cabeçalho, atualizar título/meta por idioma e manter busca, cidade selecionada e clima carregado durante a troca.
- `SearchBox`, `CurrentWeatherCard`, `ForecastList`, `WeatherStateBoundary`: deixam de conter strings hardcoded e consomem traduções/formatadores.
- `useCitySearch`, `useWeather`, `useGeolocation` e `weather-client`: passam a expor códigos/estados normalizados para a UI traduzir, evitando renderizar mensagens em Português retornadas por backend ou exceções.

Fluxo de dados: usuário acessa painel -> provider resolve idioma salvo ou `pt-BR` -> componentes renderizam traduções -> usuário altera idioma -> provider persiste e re-renderiza -> dados meteorológicos existentes são reapresentados com formatadores e descrições locais, sem nova chamada de clima.

## Design de implementação

### Principais interfaces

```ts
export type WeatherLanguage = 'pt-BR' | 'en-US'

export interface WeatherI18nContextValue {
  language: WeatherLanguage
  setLanguage(language: WeatherLanguage): void
  messages: WeatherMessages
  formatters: WeatherFormatters
}

export interface WeatherMessages {
  page: { title: string; description: string; eyebrow: string; heading: string }
  search: { heading: string; label: string; placeholder: string; loading: string }
  states: { emptyTitle: string; loadingTitle: string; errorTitle: string; retry: string }
  metrics: { feelsLike: string; wind: string; humidity: string; updatedAt: string }
  languageSelector: { label: string; portuguese: string; english: string }
}
```

`translations.ts` deve usar `satisfies Record<WeatherLanguage, WeatherMessages>` para garantir paridade de chaves entre idiomas em tempo de compilação. `useWeatherI18n()` deve lançar erro se usado fora do provider para falha rápida em testes.

### Modelos de dados

Não há banco nem novo contrato de servidor. O estado novo é:

- `WeatherLanguage`: `pt-BR` ou `en-US`.
- `StoredWeatherLanguage`: valor persistido em `localStorage` na chave `weather-panel.language`.
- `WeatherMessages`: catálogo completo de copy da feature.
- `WeatherFormatters`: funções puras criadas a partir de `WeatherLanguage`.
- `WeatherCodeDescriptionMap`: `Record<WeatherLanguage, Record<number, string>>`.

O DTO `WeatherSnapshot` permanece igual. Os campos `current.description` e `daily[].description` podem continuar existindo por compatibilidade, mas a UI deve renderizar descrições por `weatherCode`. Nomes de cidade, região, país, provedor e URLs de atribuição são preservados exatamente como recebidos da API.

### Endpoints da API

Nenhum endpoint novo será criado e nenhum endpoint existente será alterado.

- `GET /api/v1/cities/search`: continua sendo consumido pelo frontend. A feature não deve adicionar parâmetro de idioma nem transformar nomes retornados.
- `GET /api/v1/weather`: continua retornando dados meteorológicos canônicos. A UI ignora descrições textuais do backend para apresentação localizada.
- Fallbacks legados em `/api/v0` permanecem como estão no cliente atual, mas também não devem controlar copy visível.

Erros HTTP devem ser normalizados no cliente para código/status. A mensagem exibida ao usuário vem do catálogo local.

## Pontos de integração

- `localStorage`: persistir somente idioma ativo. Leitura deve validar valores suportados; valores inválidos voltam para `pt-BR`. Falhas por modo privado, quota ou indisponibilidade devem degradar para estado em memória.
- `Intl.DateTimeFormat` e `Intl.NumberFormat`: formatar datas, horários, números, Celsius, km/h e percentuais conforme `pt-BR` ou `en-US`. Datas diárias devem preservar o dia do forecast sem deslocamento por timezone; atualização atual deve preferir `snapshot.city.timezone` quando válido.
- Browser Geolocation API: não muda contrato, mas todos os estados e mensagens de permissão negada, indisponibilidade, timeout e fallback devem ser localizados na UI.
- APIs existentes do backend: continuam sendo a fonte de dados. Nenhuma autenticação, timeout ou regra de retry muda nesta feature.

## Abordagem de testes

### Testes unitários

- `translations.test.ts`: validar paridade de chaves entre `pt-BR` e `en-US`, ausência de strings vazias e presença das principais seções do catálogo.
- `weather-language-provider.test.tsx`: default `pt-BR`, leitura de preferência salva, persistência ao alternar, fallback para valor inválido e atualização de `document.documentElement.lang`.
- `weather-formatters.test.ts`: cobrir datas, horários, números, temperatura, vento e percentual nos dois locales.
- `weather-code-descriptions.test.ts`: cobrir buckets WMO usados pelo backend e fallback de código desconhecido em ambos os idiomas.
- `language-selector.test.tsx`: validar nome acessível, seleção visual/programática, clique, navegação por teclado e preservação de foco após troca.
- Componentes existentes: atualizar assertions para Português e Inglês em `SearchBox`, `CurrentWeatherCard`, `ForecastList`, `WeatherStateBoundary` e `WeatherPage`.
- Hooks/client: validar que erros retornam códigos/status traduzíveis e não vazam mensagens hardcoded como copy final.

### Testes de integração

- `WeatherPage` com Testing Library: buscar e selecionar cidade, alternar idioma depois dos dados carregados e confirmar que a chamada de clima não é repetida.
- Fluxo de geolocalização: sucesso, permissão negada e indisponibilidade com mensagens nos dois idiomas.
- Persistência: renderizar página, trocar para Inglês, desmontar/remontar e confirmar estado em Inglês a partir do `localStorage`.

### Testes E2E

Adicionar Playwright para cobrir o frontend junto ao backend ou com interceptações determinísticas:

- Primeiro acesso em Português, busca textual e clima exibido.
- Alternância para Inglês preservando cidade, previsão, foco e dados carregados.
- Reload após seleção em Inglês mantendo idioma salvo.
- Erro de provedor exibido no idioma ativo com ação de tentar novamente.
- Navegação por teclado cobrindo seletor de idioma, busca, resultados, geolocalização e retry.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Criar tipos, catálogo `translations.ts` e testes de paridade, pois isso define o contrato textual da feature.
2. Criar provider de idioma com persistência e atualização de `lang`, isolado por testes.
3. Criar formatadores `Intl` e descrições WMO locais, garantindo que clima carregado possa ser reapresentado sem nova request.
4. Criar `LanguageSelector` e posicioná-lo no cabeçalho de `WeatherPage`, seguindo `DESIGN.md`.
5. Migrar `WeatherPage` e componentes para consumir mensagens/formatadores em vez de strings hardcoded.
6. Ajustar hooks e `weather-client` para expor códigos de erro traduzíveis.
7. Atualizar testes Vitest/Testing Library existentes.
8. Adicionar Playwright e cenários E2E de idioma, persistência e acessibilidade por teclado.

### Dependências técnicas

- Sem dependência obrigatória de i18n. `react-i18next` foi considerado, mas o escopo de dois idiomas e uma única feature favorece catálogo tipado local para menor complexidade.
- Adicionar `@playwright/test` como dev dependency e scripts npm para E2E no frontend ou na raiz, conforme padrão escolhido no repo.
- Reusar React, TypeScript, Tailwind, lucide-react, Vitest e Testing Library já presentes.

## Monitoramento e observabilidade

Não há infraestrutura Prometheus/Grafana existente no repositório e a feature não altera tráfego externo. Portanto, não há nova métrica backend obrigatória.

Se um pipeline de métricas frontend for introduzido futuramente, expor contador `weather_language_change_total{language}` e evento de erro `weather_language_storage_error_total` sem capturar cidade, coordenadas ou termos de busca. Logs de desenvolvimento podem registrar falha de storage em `warn`, mas a experiência do usuário deve continuar funcional em memória.

## Considerações técnicas

### Principais decisões

- Internacionalização 100% frontend: cumpre a restrição de escopo e evita acoplamento com backend.
- Catálogo tipado local em vez de biblioteca: reduz dependência e mantém o contrato pequeno; a alternativa `react-i18next` fica indicada apenas se novos idiomas, pluralização extensa ou carregamento assíncrono entrarem no roadmap.
- Persistência em `localStorage`: suficiente para preferência não sensível e disponível sem backend; fallback em memória cobre ambientes restritos.
- Descrições WMO no cliente: garante que condições climáticas respeitem o idioma ativo mesmo quando o backend retorna Português.
- Preservar nomes externos: evita tentar traduzir dados próprios de provedor, cidades, regiões e países, alinhando o PRD.
- `document.documentElement.lang`: necessário para leitores de tela e motores de renderização aplicarem regras do idioma ativo.

### Riscos conhecidos

- Strings hardcoded remanescentes podem causar UI mista. Mitigação: testes de catálogo, revisão dos componentes e busca por literais visíveis em `frontend/src/features/weather`.
- Mensagens de erro vindas do backend podem estar em Português. Mitigação: renderizar códigos normalizados, nunca `message` externo como copy final.
- `Intl` varia detalhes por ambiente. Mitigação: assertions de teste devem validar padrões essenciais, não pontuação frágil.
- `localStorage` pode falhar. Mitigação: try/catch e fallback em memória.
- Descrições WMO podem divergir semanticamente da copy anterior. Mitigação: tabela explícita revisada em ambos os idiomas e fallback localizado para código desconhecido.

### Conformidade com rules

`.agents/rules/` não existe neste repositório. Não há rules locais adicionais a aplicar.

### Conformidade com skills

- `context7`: usado para consultar React Context e avaliar `react-i18next`.
- `react-frontend-conventions`: componentes funcionais TSX, Context para estado transversal da feature, props explícitas, Tailwind e testes.
- `repo-architecture`: novos arquivos colocalizados em `frontend/src/features/weather/`, com componente de UI dentro da própria feature.
- `nodejs-typescript-conventions`: TypeScript, ESM, npm, tipos explícitos e sem `any`.
- `code-standards-en`: identificadores em Inglês, arquivos em kebab-case, funções verb-led e parâmetros por objeto quando necessário.
- `vitest-testing`: testes independentes com Vitest/`vi`, AAA e fake timers/storage quando aplicável.
- `ui-ux-pro-max`: foco visível, contraste AA, targets adequados, labels, navegação por teclado e layout responsivo conforme `DESIGN.md`.

### Arquivos relevantes e dependentes

- `frontend/src/pages/weather-page.tsx`
- `frontend/src/pages/weather-page.test.tsx`
- `frontend/src/features/weather/i18n/weather-language-provider.tsx`
- `frontend/src/features/weather/i18n/weather-language-provider.test.tsx`
- `frontend/src/features/weather/i18n/translations.ts`
- `frontend/src/features/weather/i18n/translations.test.ts`
- `frontend/src/features/weather/i18n/weather-code-descriptions.ts`
- `frontend/src/features/weather/i18n/weather-code-descriptions.test.ts`
- `frontend/src/features/weather/lib/weather-formatters.ts`
- `frontend/src/features/weather/lib/weather-formatters.test.ts`
- `frontend/src/features/weather/components/language-selector.tsx`
- `frontend/src/features/weather/components/language-selector.test.tsx`
- `frontend/src/features/weather/components/search-box.tsx`
- `frontend/src/features/weather/components/current-weather-card.tsx`
- `frontend/src/features/weather/components/forecast-list.tsx`
- `frontend/src/features/weather/components/weather-state-boundary.tsx`
- `frontend/src/features/weather/hooks/use-city-search.ts`
- `frontend/src/features/weather/hooks/use-weather.ts`
- `frontend/src/features/weather/hooks/use-geolocation.ts`
- `frontend/src/features/weather/api/weather-client.ts`
- `frontend/src/features/weather/types.ts`
- `frontend/src/features/weather/test/fixtures.ts`
- `frontend/package.json`
- `playwright.config.ts`
- `e2e/weather-i18n.spec.ts`
- `DESIGN.md`
