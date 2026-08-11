# Tarefa 2.0: Localizar a interface, fluxos e acessibilidade do Painel de Clima

## Visão geral

Integrar a infraestrutura de internacionalização ao Painel de Clima, substituindo textos hardcoded por mensagens localizadas, reapresentando dados carregados no idioma ativo e garantindo que busca, geolocalização, estados, erros, clima atual, previsão e acessibilidade respeitem Português e Inglês.

<skills>
### Conformidade com skills

- `react-frontend-conventions`: migrar componentes React para consumir contexto, props explícitas e estado colocalizado.
- `repo-architecture`: preservar a organização da feature em `frontend/src/features/weather/` e página em `frontend/src/pages/`.
- `nodejs-typescript-conventions`: manter TypeScript estrito, ESM e tipos explícitos.
- `code-standards-en`: manter nomes de funções, tipos e variáveis em inglês.
- `vitest-testing`: atualizar e ampliar testes unitários e de integração existentes.
- `ui-ux-pro-max`: preservar responsividade, foco visível, contraste e ergonomia do seletor no layout.
</skills>

<requirements>

- Envolver a página do painel com o provider de idioma.
- Posicionar o seletor de idioma no cabeçalho sem competir com a busca de cidade.
- Traduzir todos os textos visíveis da UI controlados pelo frontend.
- Traduzir labels acessíveis, nomes de controles, estados e mensagens anunciadas por tecnologias assistivas.
- Localizar busca textual, geolocalização, estados vazios, carregamento, erros e retry.
- Localizar rótulos de clima atual, previsão de 7 dias, unidades, datas, horários e descrições climáticas.
- Preservar cidade selecionada, clima carregado, previsão e foco durante troca de idioma.
- Normalizar hooks e cliente para que mensagens externas não sejam usadas como copy final.
- Preservar nomes próprios, cidades, países, provedores e dados externos como recebidos.
- Não criar endpoints ou mudar regras de backend.

</requirements>

## Subtarefas

- [x] 2.1 Integrar o provider de idioma em `WeatherPage` e conectar metadados localizados da página.
- [x] 2.2 Inserir o seletor de idioma no cabeçalho seguindo `DESIGN.md` e mantendo a busca como ação principal.
- [x] 2.3 Migrar `SearchBox` para mensagens localizadas, incluindo label, placeholder, instruções, loading, resultado vazio e erro.
- [x] 2.4 Migrar `WeatherStateBoundary` para estados localizados de vazio, carregamento, erro e tentativa novamente.
- [x] 2.5 Migrar `CurrentWeatherCard` para rótulos, unidades, atualização e descrições climáticas localizadas.
- [x] 2.6 Migrar `ForecastList` para títulos, datas, rótulos e descrições localizadas.
- [x] 2.7 Ajustar `useCitySearch`, `useWeather`, `useGeolocation` e `weather-client` para expor códigos/status traduzíveis.
- [x] 2.8 Revisar atributos ARIA, regiões anunciáveis, foco, navegação por teclado e idioma programático.
- [x] 2.9 Atualizar testes unitários dos componentes e hooks afetados.
- [x] 2.10 Adicionar testes de integração para busca, seleção de cidade, troca de idioma, geolocalização e erro.

## Detalhes de implementação

Referenciar `techspec.md`, principalmente as seções:

- `Arquitetura do sistema`
- `Endpoints da API`
- `Pontos de integração`
- `Abordagem de testes`
- `Considerações técnicas`
- `Arquivos relevantes e dependentes`

A UI deve usar os dados existentes reapresentados pelo catálogo, formatadores e descrições WMO criados na tarefa 1.0. A troca de idioma não deve disparar nova chamada de clima apenas para traduzir conteúdo já carregado.

## Critérios de sucesso

- Não há textos visíveis misturando Português e Inglês dentro da UI controlada pelo Painel de Clima.
- O usuário consegue alternar idioma antes, durante e depois de uma consulta sem perder os dados principais.
- Busca, geolocalização, erros e retry exibem mensagens no idioma ativo.
- Clima atual e previsão usam datas, números, unidades e descrições conforme o locale ativo.
- Mensagens vindas de backend ou exceções não vazam como copy final.
- O seletor e demais controles permanecem operáveis por teclado e compreensíveis por leitor de tela.
- O layout continua responsivo em desktop e mobile, sem truncamento indevido ou sobreposição.

## Testes da tarefa

- [x] Testes unitários: `SearchBox`, `CurrentWeatherCard`, `ForecastList` e `WeatherStateBoundary` em Português e Inglês.
- [x] Testes unitários: hooks e cliente retornando códigos/status traduzíveis.
- [x] Testes de integração: `WeatherPage` com busca, seleção de cidade e alternância de idioma sem repetir chamada de clima.
- [x] Testes de integração: geolocalização com sucesso, permissão negada e indisponibilidade nos dois idiomas.
- [x] Testes de integração: persistência entre desmontagem/remontagem usando `localStorage`.
- [x] Testes E2E: não aplicável nesta tarefa; cobertos na tarefa 3.0.

## Arquivos relevantes

- `frontend/src/pages/weather-page.tsx`
- `frontend/src/pages/weather-page.test.tsx`
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
- `DESIGN.md`
