# Tarefa 4.0: Testes E2E, acessibilidade mínima e SEO técnico

## Visão geral

Fechar a entrega com validação ponta a ponta no navegador, cobrindo a experiência de alternância de unidades nos fluxos reais do Painel de Clima. Esta tarefa também garante baseline de acessibilidade e SEO técnico mínimo exigido para a página: título, meta description, hierarquia de headings, link de atribuição, foco visível e operação por teclado.

<skills>
### Conformidade com skills

- `vitest-testing` - manter testes unitários e integração confiáveis antes dos E2E.
- `react-frontend-conventions` - validar comportamento observável da UI React sem acoplar teste a detalhes internos.
- `ui-ux-pro-max` - acessibilidade crítica: contraste, foco, labels, keyboard nav, touch targets e ausência de layout quebrado.
- `nodejs-typescript-conventions` - scripts e helpers E2E em TypeScript, npm como executor.
- `code-standards-en` - helpers E2E com nomes claros e verb-led.
</skills>

<requirements>
- Validar busca textual com unidade métrica default.
- Validar alternância para imperial sem nova seleção de cidade.
- Validar volta para métrico.
- Validar estados de erro, loading e vazio independentes da unidade.
- Validar navegação por teclado no controle segmentado.
- Validar que foco não é removido do controle após alternância.
- Validar título da página, meta description, heading principal e link Open-Meteo.
- Validar que a UI não apresenta sobreposição/truncamento nos viewports principais.
</requirements>

## Subtarefas

- [x] 4.1 Identificar a estrutura E2E existente e fixtures determinísticas do Painel de Clima.
- [x] 4.2 Adicionar cenários Playwright para métrico default e alternância imperial.
- [x] 4.3 Adicionar cenário para alternar unidade durante estado vazio.
- [x] 4.4 Adicionar cenário para erro de provedor mantendo o toggle utilizável.
- [x] 4.5 Adicionar checks de teclado e foco no controle segmentado.
- [x] 4.6 Adicionar checks de SEO técnico mínimo: `document.title`, meta description, `h1` e atribuição Open-Meteo.
- [x] 4.7 Executar suites relevantes de backend, frontend e E2E.
- [x] 4.8 Registrar qualquer limitação residual no resultado da tarefa, se houver.

## Detalhes de implementação

Referenciar `tasks/prd-painel-clima-unidades/techspec.md`, seções "Testes E2E", "Monitoramento e observabilidade", "Riscos conhecidos" e "Conformidade com skills". Os E2E devem usar fixtures determinísticas e não depender de chamadas reais a provedores externos.

## Critérios de sucesso

- Playwright comprova que o painel inicia em `°C / km/h`.
- Playwright comprova que alternar para `°F / mph` atualiza todas as métricas compatíveis exibidas.
- Alternância não refaz busca nem troca cidade selecionada.
- Controle é operável por teclado e mantém foco após mudança.
- Estado vazio e erro continuam compreensíveis quando a unidade muda.
- Página preserva SEO técnico mínimo e atribuição visível à Open-Meteo.
- Testes automatizados relevantes passam com npm nos diretórios correspondentes.

## Testes da tarefa

- [x] Testes unitários
  - Rodar a suíte unitária do frontend afetada por unidades (`weather-units`, toggle, cards e lista).
  - Rodar a suíte unitária/backend afetada por contrato `/api/v1`, se modificada.
- [x] Testes de integração
  - Rodar integração HTTP do backend para `/api/v1`.
  - Rodar integração de `WeatherPage` para alternância sem novo fetch.
- [x] Testes E2E (se aplicável)
  - Busca textual -> clima em métrico por padrão.
  - Alternar para imperial preservando cidade e previsão.
  - Alternar de volta para métrico.
  - Estado vazio e erro de provedor com toggle acessível.
  - Verificações de teclado, foco, heading, title, meta description e link Open-Meteo.

## Arquivos relevantes

- `e2e/**`
- `playwright.config.ts`
- `frontend/src/pages/weather-page.tsx`
- `frontend/src/pages/weather-page.test.tsx`
- `frontend/src/features/weather/components/unit-system-toggle.tsx`
- `frontend/src/features/weather/lib/weather-units.ts`
- `backend/src/controllers/weather.controller.test.ts`
- `tasks/prd-painel-clima-unidades/techspec.md`
