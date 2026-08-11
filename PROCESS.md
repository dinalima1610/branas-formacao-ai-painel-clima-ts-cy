# Processo de Desenvolvimento

Este documento concentra o histórico de desenvolvimento, SDD, Compozy, qualidade, testes e aprendizados do projeto. O [README.md](README.md) fica reservado para visão geral e uso rápido.

## <img src="docs/evidencias/compozy/compozy.png" width="24" height="24" style="vertical-align: middle; display: inline-block; margin-bottom: 3px;" /> Processo com Compozy

O projeto [painel_clima_cy](painel_clima_cy/) foi integralmente conduzido com o suporte do **Compozy**, utilizado como ferramenta de **Spec Driven Development (SDD)** para gerenciar, estruturar e orquestrar o fluxo de desenvolvimento assistido por IA a partir de prompts.

Versão do Compozy instalada no contexto deste projeto:

```text
compozy version 0.2.4 (commit=7e20f40-local date=2026-05-19T00:00:00Z)
```

### O que é

Esta release do Compozy é uma CLI local para orquestrar workflows de desenvolvimento assistido por IA. Ele instala skills no projeto, cria e organiza artefatos em `.compozy/tasks/<nome>/`, mantém a execução por daemon local em background e aciona agentes como Codex, Cursor ou Claude Code para executar tasks. O Compozy não traz um modelo próprio: ele coordena o processo e delega a execução para o runtime configurado.

É uma ferramenta para gerenciar review rounds e workflows de execução de PRD. Os subcomandos disponíveis nesta instalação incluem `setup`, `daemon`, `tasks`, `reviews`, `runs`, `sync`, `archive`, `exec`, `agents`, `ext`, `migrate`, `upgrade` e `workspaces`. O comando `compozy tasks --help` descreve `tasks run` como execução de workflow de tasks via daemon e `tasks validate` como validação de metadados das tasks.

O fluxo de desenvolvimento ocorre da seguinte forma:

1.  **Definição das Especificações**: Os prompts e metas são consolidados no PRD e na Especificação Técnica.
2.  **Geração e Quebra de Tarefas**: O Compozy lê a especificação e gera arquivos de tarefas sequenciais (`1_task.md`, `2_task.md`, etc.).
3.  **Execução Assistida**: O Compozy coordena a execução de agentes de IA locais (no Cursor, Codex, etc.) alimentados por "skills" locais auto-instaladas em `.agents/skills` ou `.openhands/skills`.
4.  **Memória Compartilhada**: Durante as execuções (ou "runs"), o Compozy mantém um sistema de memória em banco de dados local SQLite que compartilha estados e dependências entre as tarefas consecutivas, diminuindo a carga mental necessária para contextualizar o agente a cada novo passo.
5.  **Review Rounds**: Ao final de cada implementação, o Compozy aciona rodadas de revisão automatizadas para verificar padrões de código, testes unitários, documentação e conformidade.

Nos projetos [`painel_clima`](painel_clima/) e [`painel_clima_cy`](painel_clima_cy/), as pastas [`painel_clima/.agents/`](painel_clima/.agents/) e [`painel_clima_cy/.agents/`](painel_clima_cy/.agents/) são mantidas como artefatos publicáveis porque contêm as skills locais referenciadas pelos fluxos de processo. No primeiro projeto, elas sustentam o kit [`spec-driven`](painel_clima/spec-driven/) e a skill de Context7 usada nas instruções de execução. No segundo, preservam as skills `cy-*`, Compozy, Context7, QA e revisão que explicam os artefatos em [`painel_clima_cy/.compozy/tasks/weather-panel`](painel_clima_cy/.compozy/tasks/weather-panel/). Caches e bytecode gerados dentro dessas pastas continuam fora da publicação.

### Evidências das Execuções do Compozy no Projeto [docs/evidencias/compozy](docs/evidencias/compozy/)

As seguintes evidências foram coletadas durante a execução do projeto no Compozy 0.2.4 local:

*   **Interface Web (Web UI)**: [Compozy Web UI em localhost:2323](<docs/evidencias/compozy/compozy web ui.png>) - Visualização rica do grafo de tarefas e status das revisões locais.

*   **Início da execução no ACP Cockpit**: [Compozy Tasks Run](<docs/evidencias/compozy/compozy tasks run.png>) - ACP Cockpit iniciando o processes running.

*   **Task 1 concluída e Task 2 em execução**: [Compozy Tasks Run - Task 1 e Task 2](<docs/evidencias/compozy/compozy tasks run - task 1.png>) - Mostra o daemon processando a primeira tarefa.

*   **Interrupção da Task 3 por Limite de Uso**: [Compozy Tasks Run - Task 2](<docs/evidencias/compozy/compozy tasks run - task 2 - finalização por limite de uso.png>) - Documenta a pausa controlada do ciclo devido aos limites da API.

*   **Reexecução da Task 3**: [Compozy Tasks Run - Task 3](<docs/evidencias/compozy/compozy tasks run - task 3.png>) - Retomando a execução da terceira tarefa.

*   **Finalização das Tasks 4 e 5 com QA**: [Compozy Tasks Run - Finalização](<docs/evidencias/compozy/compozy tasks run - tasks 4 e 5 - finalização.png>) - Sucesso na execução dos passos finais de integração e testes.

*   **Resumo Geral das Tarefas**: [Resumo do Compozy](<docs/evidencias/compozy/compozy tasks run - tasks 3, 4 e 5 - resumo.png>) - Sucesso na execução dos passos finais de integração e testes.

Os prints registram a TUI `COMPOZY // ACP (Agent Client Protocol) COCKPIT`, o pipeline `SYS.PIPELINE`, runtime `Codex · gpt-5.5`, uso das skills `cy-workflow-memory`, `cy-execute-task` e `cy-final-verify`, execução inicial `RUN 0/5`, falha parcial com `2/5 succeeded, 3 failed`, reexecução das três tasks restantes e conclusão posterior com `All Jobs Complete: 3/3 succeeded` e `Verdict: PASS`.

No [painel_clima_cy](painel_clima_cy/), os artefatos preservados em [painel_clima_cy/.compozy/tasks/weather-panel](painel_clima_cy/.compozy/tasks/weather-panel/) mostram esse fluxo de execução de PRD:

- [_prd.md](painel_clima_cy/.compozy/tasks/weather-panel/_prd.md)
- [_techspec.md](painel_clima_cy/.compozy/tasks/weather-panel/_techspec.md)
- [task_01.md](painel_clima_cy/.compozy/tasks/weather-panel/task_01.md)
- [task_02.md](painel_clima_cy/.compozy/tasks/weather-panel/task_02.md)
- [task_03.md](painel_clima_cy/.compozy/tasks/weather-panel/task_03.md)
- [task_04.md](painel_clima_cy/.compozy/tasks/weather-panel/task_04.md)
- [task_05.md](painel_clima_cy/.compozy/tasks/weather-panel/task_05.md)
- [memory](painel_clima_cy/.compozy/tasks/weather-panel/memory/)
- [qa](painel_clima_cy/.compozy/tasks/weather-panel/qa/)

---

## 🔍 Publicação e Qualidade

O padrão de qualidade exigido no curso baseou-se em gates automatizados e documentados, registrado com fluxo PRD -> Tech Spec -> Tasks -> Execução -> QA -> Bug Fix -> Review, além de harness engineering, context engineering, sub-agents, Compozy, automação, paralelismo e validação humana.
*   **Spec Driven Development**: O projeto só evoluiu de fase após as especificações técnicas estarem validadas contra o PRD.
*   **Revisões de Código Locais**: Processo guiado pelo Compozy que verificava nomenclatura, tratamento de erros, colocalização de arquivos e ausência de bugs estruturais.
*   **Verificação de QA**: Relatórios gerados em [`qa-report.md`](painel_clima/tasks/prd-painel-de-clima/qa-report.md) consolidavam a cobertura de requisitos e bugs encontrados.

As correções posteriores de QA são registradas como novos arquivos de evidência/bugfix, preservando os relatórios originais como histórico da reprovação.

Além do BUG-01 de contraste, houve correções funcionais pós-MVP no fluxo de geolocalização. No `painel_clima`, o comportamento observado em uso real mostrou que o card de clima congelava o texto "Minha localização/My location" no idioma ativo no momento da consulta, porque a string traduzida era salva como dado da requisição. Também foi corrigido o estado do botão "Usar minha localização/Use my location", que podia permanecer desabilitado após a primeira tentativa quando a consulta de clima continuava pendente. Ao enriquecer o card com cidade/estado/país, ficou claro que a especificação inicial não previa geocodificação reversa para nomear coordenadas autorizadas pelo navegador.

A correção separou três responsabilidades:

- o estado da consulta informa se o clima atual veio da geolocalização;
- o prefixo "Minha localização/My location" é sempre derivado da língua ativa;
- a cidade, estado/região e país são obtidos por geocodificação reversa no backend quando possível, usando Google Geocoding se configurado e Nominatim/OpenStreetMap como fallback.

No `painel_clima_cy`, a correção posterior replicou o enriquecimento do card de geolocalização: quando o reverse geocoding da Open-Meteo não retorna uma cidade, o backend tenta Nominatim/OpenStreetMap antes de usar o fallback "Local atual (lat, lon)".

Essa adequação fugiu das especificações iniciais dos arquivos de PRD/Tech Spec/Tasks, que cobriam geolocalização opt-in e clima por coordenadas, mas não detalhavam tradução dinâmica do título do card, reabilitação explícita do botão de localização nem enriquecimento reverso de coordenadas. A alteração foi mantida por melhorar clareza, acessibilidade cognitiva e consistência internacionalizada sem mudar o provedor de clima.

No projeto, é possível perceber este processo em [painel_clima/tasks](painel_clima/tasks/):

- PRDs
- Tech specs
- Quebra de tarefas
- Reviews de tarefas
- Relatórios de bugs
- Relatórios de QA
- Evidências visuais em [docs/evidencias](docs/evidencias/)

---

## 🧪 Testes

O projeto apresenta uma alta cobertura de testes cobrindo todas as camadas:

1.  **Testes Unitários e Integração (Vitest)**:
    *   *Backend*: Executados com `npm test --prefix backend` (ou `--coverage`). Cobrem a desambiguação de cidades, normalização de payloads, tradução de códigos WMO e middlewares de tratamento de erros.
    *   *Frontend*: Executados com `npm test --prefix frontend`. Validam hooks customizados (`useGeolocation`), renderização correta de cards e formatação de unidades.
2.  **Testes E2E (Playwright)**:
    *   *Execução*: `npm run test:e2e` na raiz do Painel do Clima.
    *   *Escopo*: Valida fluxos de ponta a ponta em desktops e dispositivos móveis (mobile), incluindo tratamento de erros de rede de forma mockada e navegação completa por teclado.
3.  **Resultado Geral da rodada original**: 100% dos 19 requisitos funcionais foram validados e aprovados. Naquela rodada, apenas os critérios de acessibilidade de contraste falharam.

Comandos configurados nos arquivos [package.json](package.json), [painel_clima/backend/package.json](painel_clima/backend/package.json), [painel_clima/frontend/package.json](painel_clima/frontend/package.json), [painel_clima_cy/backend/package.json](painel_clima_cy/backend/package.json) e [painel_clima_cy/frontend/package.json](painel_clima_cy/frontend/package.json):

```bash
npm test --prefix painel_clima/backend
npm test --prefix painel_clima/frontend
npm run test:e2e --prefix painel_clima
npm run build --prefix painel_clima/backend
npm run build --prefix painel_clima/frontend
```

```bash
npm test --prefix painel_clima_cy/backend
npm test --prefix painel_clima_cy/frontend
npm run build --prefix painel_clima_cy/backend
npm run build --prefix painel_clima_cy/frontend
```

Os relatórios de QA de [painel_clima](painel_clima/) registram execuções passando para testes unitários, E2E e builds.

Também registraram QA reprovado por contraste insuficiente em seletor de idioma e dica de busca. A falha estava relacionada a combinações da paleta cream/coral do [`Design System inspired by Claude/Claude Code`](ARCHITECTURE.md#frontend), que ficaram abaixo do contraste mínimo WCAG 2.2 AA em textos normais.

Posteriormente, o BUG-01 foi corrigido e validado por contrast checker local. As evidências da correção foram registradas sem sobrescrever os relatórios originais:

- [BUG-01-contrast-fix.md](docs/evidencias/qa/BUG-01-contrast-fix.md)
- [BUG-01-contrast-check.json](docs/evidencias/qa/BUG-01-contrast-check.json)
- [bugfix-BUG-01-contrast.md](painel_clima/tasks/prd-painel-de-clima/bugfix-BUG-01-contrast.md)
- [BUG-01-contrast-replication.md](painel_clima_cy/.compozy/tasks/weather-panel/qa/bugfixes/BUG-01-contrast-replication.md)

Para a correção pós-MVP de geolocalização no `painel_clima`, a validação executada após a alteração foi:

- `npm test --prefix painel_clima/frontend -- --run`: 16 arquivos, 51 testes aprovados.
- `npm test --prefix painel_clima/backend -- --run`: 8 arquivos, 34 testes aprovados.
- `npm run typecheck --prefix painel_clima/frontend`: aprovado.
- `npm run build --prefix painel_clima/backend`: aprovado.

Para as correções recentes de geolocalização e card de localização atual, a validação executada foi:

- `npm test --prefix painel_clima/frontend -- src/pages/weather-page.test.tsx`: 12 testes aprovados.
- `npm run typecheck --prefix painel_clima/frontend`: aprovado.
- `npm test --prefix painel_clima_cy/backend`: 28 testes aprovados com cobertura global acima dos thresholds.
- `npm run build --prefix painel_clima_cy/backend`: aprovado.
- `npm test --prefix painel_clima_cy/frontend -- src/features/weather-panel/components/WeatherPanel.test.tsx`: 10 testes aprovados.
- `npm run typecheck --prefix painel_clima_cy/frontend`: aprovado.

---

## 🧠 Aprendizado

O desenvolvimento deste projeto trouxe aprendizados cruciais na engenharia de software auxiliada por IA:
*   **O valor do SDD**: A importância de descrever os requisitos comerciais e técnicos em detalhes em vez de partir diretamente para a geração de código. A qualidade do output do modelo é diretamente proporcional à riqueza do contexto de entrada.
*   **Execução Automatizada**: A orquestração assíncrona por meio do Compozy daemon exemplificou como agentes de desenvolvimento operam em tarefas longas sem exigir supervisão manual constante.
*   **Acessibilidade como Requisito de Qualidade**: A detecção precoce do BUG-01 de contraste ilustra a necessidade de ter suítes de QA que testem aspectos não-funcionais (como conformidade visual WCAG - Web Content Accessibility Guidelines), evitando que designs que "pareçam bonitos" cheguem quebrados para usuários com baixa visão.

*   **Por tópicos**:
    *   Spec Driven Development.
    *   Criação de PRD, tech spec e tasks.
    *   Execução de tarefas por agente.
    *   QA com evidências.
    *   Bug report e correção orientada por causa raiz.
    *   Code review como etapa final de qualidade.
    *   Context engineering e harness engineering.
    *   Uso de skills/regras locais para orientar agentes.
    *   Uso de sub-agents para isolamento de contexto e paralelismo.
    *   Camadas de ferramentas para expor APIs e automações a LLMs.
    *   Separação backend/frontend.
    *   Contratos HTTP e OpenAPI.
    *   Integração com API externa via backend.
    *   Testes unitários, testes de componente, testes de hook e E2E.
    *   Acessibilidade, navegação por teclado, responsividade e contraste.

O painel_clima mostra a construção e evolução manual/incremental do Painel do Clima.
O painel_clima_cy mostra o mesmo domínio reorganizado em um processo mais maduro de Spec Driven Development com Compozy, ADRs (Architecture Decision Record), memória de execução e QA mais completo por jornadas/personas.
