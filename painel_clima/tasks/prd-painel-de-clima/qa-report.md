# Relatorio de QA - Painel de Clima

## Resumo

- Data: 2026-05-16
- Status: REPROVADO
- Total de Requisitos Funcionais: 19
- Requisitos Funcionais Atendidos: 19
- Bugs Encontrados: 1

## Execucoes

- `npm test --prefix backend`: PASSOU, 7 arquivos / 32 testes.
- `npm test --prefix frontend`: PASSOU, 16 arquivos / 47 testes.
- `npm run test:e2e`: PASSOU, 14 testes Playwright em desktop e mobile.
- `npm run build --prefix backend`: PASSOU.
- `npm run build --prefix frontend`: PASSOU.
- Playwright MCP manual: PASSOU para busca, selecao, estado vazio, resultado, troca de idioma, troca de unidades, teclado, console sem erros, layout mobile sem overflow.

## Requisitos Verificados

| ID | Requisito | Status | Evidencia |
|----|-----------|--------|-----------|
| RF-01 | Busca inicia com ao menos 2 caracteres | PASSOU | `../../qa-empty-search-english-desktop.png` |
| RF-02 | Lista cidades com nome, regiao/estado e pais | PASSOU | `../../qa-curitiba-metric-desktop.png` |
| RF-03 | Permite selecionar cidade e carregar clima | PASSOU | `../../qa-curitiba-metric-desktop.png` |
| RF-04 | Mensagem clara quando nenhuma cidade for encontrada | PASSOU | `../../qa-empty-search-english-desktop.png` |
| RF-05 | Controle visivel para usar localizacao | PASSOU | `../../qa-initial-desktop.png` |
| RF-06 | Geolocalizacao somente por acao explicita | PASSOU | `npm run test:e2e` |
| RF-07 | Busca textual continua disponivel se geolocalizacao falhar | PASSOU | Testes unitarios de `useGeolocation` + MCP busca textual |
| RF-08 | Informa falha de geolocalizacao e orienta busca textual | PASSOU | Testes unitarios de `useGeolocation` |
| RF-09 | Exibe nome da cidade, regiao e pais | PASSOU | `../../qa-curitiba-metric-desktop.png` |
| RF-10 | Exibe temperatura atual em Celsius | PASSOU | `../../qa-curitiba-metric-desktop.png` |
| RF-11 | Exibe sensacao termica em Celsius | PASSOU | `../../qa-curitiba-metric-desktop.png` |
| RF-12 | Exibe condicao legivel e icone | PASSOU | `../../qa-curitiba-metric-desktop.png` |
| RF-13 | Exibe vento e umidade com unidade | PASSOU | `../../qa-curitiba-metric-desktop.png` |
| RF-14 | Exibe horario de referencia dos dados | PASSOU | `../../qa-curitiba-metric-desktop.png` |
| RF-15 | Exibe previsao de 7 dias incluindo dia atual | PASSOU | `../../qa-curitiba-metric-desktop.png` |
| RF-16 | Cada dia exibe data, minima, maxima e condicao/icone | PASSOU | `../../qa-curitiba-metric-desktop.png` |
| RF-17 | Exibe estado de carregamento | PASSOU | `npm run test:e2e` |
| RF-18 | Exibe erro amigavel com tentar novamente | PASSOU | `npm run test:e2e` |
| RF-19 | Exibe estado vazio inicial orientativo | PASSOU | `../../qa-initial-desktop.png` |

## Testes E2E Executados

| Fluxo | Resultado | Observacoes |
|-------|-----------|-------------|
| Primeiro acesso em Portugues + busca por cidade | PASSOU | Playwright automatizado e MCP manual |
| Busca por termo sem resultado | PASSOU | Mensagem "No city found for this term." em ingles apos troca de idioma |
| Selecao de cidade + clima atual + previsao | PASSOU | Dados reais via localhost e Open-Meteo |
| Erro de provedor + tentar novamente | PASSOU | Playwright automatizado com mock deterministico |
| Geolocalizacao concedida por acao explicita | PASSOU | Playwright automatizado |
| Navegacao por teclado | PASSOU | Tab, foco em radios, botao de localizacao e combobox |
| Responsividade mobile | PASSOU | `scrollWidth` igual a `innerWidth` em 390px |

## Acessibilidade

- Navegacao por teclado: PASSOU.
- Labels de controles interativos: PASSOU.
- Icones acompanhados de texto: PASSOU.
- Formularios com labels/nomes acessiveis: PASSOU.
- Mensagens de erro/status claras: PASSOU.
- Contraste WCAG 2.2 AA: FALHOU, ver BUG-01.

## Bugs Encontrados

| ID | Descricao | Severidade | Screenshot |
|----|-----------|------------|------------|
| BUG-01 | Contraste insuficiente em seletor de idioma e dica de busca | Media | `../../qa-curitiba-english-imperial-desktop.png` |

## Conclusao

A funcionalidade principal do Painel de Clima atende aos fluxos e requisitos funcionais, mas o QA fica REPROVADO ate a cor dos textos com contraste insuficiente ser ajustada para cumprir WCAG 2.2 AA.
