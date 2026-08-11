# Relatorio de QA - Painel de Clima - Unidades

## Resumo

- Data: 2026-05-16
- Status: REPROVADO
- Total de Requisitos Funcionais: 19
- Requisitos Funcionais Atendidos: 19
- Bugs Encontrados: 2

## Execucoes

- `npm test --prefix backend`: PASSOU, 7 arquivos / 32 testes.
- `npm test --prefix frontend`: PASSOU, 16 arquivos / 47 testes.
- `npm run test:e2e`: PASSOU, 14 testes Playwright em desktop e mobile.
- `npm run build --prefix backend`: PASSOU.
- `npm run build --prefix frontend`: PASSOU.
- Playwright MCP manual: PASSOU para toggle metrico/imperial, preservacao de cidade, previsao e foco, reload voltando para metrico, console sem erros e mobile sem overflow.

## Requisitos Verificados

| ID | Requisito | Status | Evidencia |
|----|-----------|--------|-----------|
| RF-01 | Toggle global visivel | PASSOU | `../../qa-initial-desktop.png` |
| RF-02 | Estados Metrico e Imperial | PASSOU | `../../qa-curitiba-imperial-desktop.png` |
| RF-03 | Metrico exibe unidades metricas presentes | PASSOU | `../../qa-curitiba-metric-desktop.png` |
| RF-04 | Imperial exibe unidades imperiais presentes | PASSOU | `../../qa-curitiba-imperial-desktop.png` |
| RF-05 | Unidade selecionada aplicada globalmente | PASSOU | `../../qa-curitiba-imperial-desktop.png` |
| RF-06 | Unidade mantida apenas na sessao atual | PASSOU | MCP reload voltou para `°C / km/h` |
| RF-07 | Nova sessao inicia em Metrico | PASSOU | MCP reload |
| RF-08 | Temperatura atual alterna entre C e F | PASSOU | `../../qa-curitiba-imperial-desktop.png` |
| RF-09 | Maxima, minima e sensacao alternam entre C e F | PASSOU | `../../qa-curitiba-imperial-desktop.png` |
| RF-10 | Vento exibido alterna entre km/h e mph | PASSOU | `../../qa-curitiba-imperial-desktop.png` |
| RF-11 | Pressao alterna quando exibida | PASSOU | Nao aplicavel no painel atual |
| RF-12 | Precipitacao alterna quando exibida | PASSOU | Nao aplicavel no painel atual |
| RF-13 | Visibilidade alterna quando exibida | PASSOU | Nao aplicavel no painel atual |
| RF-14 | Umidade permanece em percentual | PASSOU | `../../qa-curitiba-imperial-desktop.png` |
| RF-15 | Nao mistura perfis apos alternar | PASSOU | `../../qa-curitiba-imperial-desktop.png` |
| RF-16 | Preserva cidade, condicao, timestamp e previsao | PASSOU | `../../qa-curitiba-imperial-desktop.png` |
| RF-17 | Atualiza unidades sem nova selecao de cidade | PASSOU | MCP manual + `npm run test:e2e` |
| RF-18 | Estados vazio/erro/loading independem da unidade | PASSOU | `npm run test:e2e` |
| RF-19 | Nova busca mantem unidade na sessao atual | PASSOU | `npm run test:e2e` |

## Testes E2E Executados

| Fluxo | Resultado | Observacoes |
|-------|-----------|-------------|
| Busca textual com metrica padrao | PASSOU | Playwright automatizado e MCP manual |
| Alternar para imperial com dados carregados | PASSOU | Sem nova chamada de clima no teste automatizado |
| Alternar por teclado | PASSOU | Space em radio `°F / mph` |
| Reload apos imperial | PASSOU | Unidade volta para metrica, como esperado |
| Mobile 390px | PASSOU | Sem overflow horizontal |

## Acessibilidade

- Controle de unidades por teclado: PASSOU.
- Estado selecionado por texto e `aria-checked`: PASSOU.
- Foco preservado apos troca de unidade: PASSOU.
- Contraste WCAG 2.2 AA: FALHOU, ver BUG-01.

## Bugs Encontrados

| ID | Descricao | Severidade | Screenshot |
|----|-----------|------------|------------|
| BUG-01 | Contraste insuficiente em seletor de idioma e dica de busca | Media | `../../qa-curitiba-english-imperial-desktop.png` |
| BUG-02 | `tasks.md` ainda marca tarefas como pendentes | Baixa | N/A |

## Conclusao

Os requisitos funcionais de unidades passaram, mas o QA fica REPROVADO por falha de contraste WCAG 2.2 e pelo checklist de tasks da feature nao estar marcado como concluido.

## Adendo - Resolucao da pendencia de tasks

Em 2026-05-16, a pendencia referente ao checklist de tasks foi resolvida. O arquivo `tasks.md` da feature Painel de Clima - Unidades foi atualizado para marcar como concluidas (`[x]`) as tarefas implementadas. A reprovacao remanescente deste QA passa a se limitar a falha de contraste WCAG 2.2 registrada como `BUG-01`.
