# Skills → ações

Consulte o `SKILL.md` em `.agents/skills/<nome>/` antes de implementar ou revisar.

| Skill                           | Acionar para…                                                                                                                                          | Não usar se…                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `code-standards-en`             | Nomes em inglês, PR, CQS, early return, tamanho de métodos/classes                                                                                     | Política exige identificadores localizados                                      |
| `express-rest-http`             | Rotas Express, HTTP, status, OpenAPI, `fetch` externo                                                                                                  | Framework servidor não for Express                                              |
| `nodejs-typescript-conventions` | TS/Node, ESM, npm, async/await, sem `any`                                                                                                              | Projeto JS puro ou gestor ≠ npm                                                 |
| `react-frontend-conventions`    | React FC, TSX, Tailwind, hooks, testes de UI                                                                                                           | Class components, styled-components, sem Tailwind (neste repo)                  |
| `ui-ux-pro-max`                 | Design/revisão de UI (componentes, páginas, paletas, tipografia, landing/dashboard, a11y); ver `SKILL.md` para `scripts/search.py` e `--design-system` | Tarefa só backend/API/dados sem interface; escopo sem decisões visuais ou de UX |
| `repo-folder-structure`         | Onde criar `features`, pages, controllers/services/data                                                                                                | Layout do monorepo ou framework diferente do template                           |
| `skill-best-practices`          | Nova skill de agente (agentskills.io), pastas `scripts/` / `references/`                                                                               | Docs gerais, README, código de lib sem ser skill                                |
| `vitest-testing`                | Vitest, `vi`, AAA, timers, integração HTTP sem supertest                                                                                               | Jest/Sinon como stack principal de mock                                         |

**Ordem sugerida por tarefa:** backend HTTP → `express-rest-http`, depois `repo-folder-structure`, `nodejs-typescript-conventions`, `code-standards-en`. Frontend → `ui-ux-pro-max` (design/UX e sistema visual), depois `react-frontend-conventions`, `repo-folder-structure`, `nodejs-typescript-conventions`, `code-standards-en`. Testes → `vitest-testing` + skill da camada testada.

# Persistência do Modo Plano

<plan_file>`.codex/plans/[timestamp]-[plan-slug].md`</plan_file>

- **OBRIGATÓRIO ABSOLUTO**: No modo Plano, após o usuário aceitar um plano, **SEMPRE** escreva o plano aceito em um arquivo Markdown dentro de <plan_file>.
- **OBRIGATÓRIO**: Se o plano aceito for atualizado posteriormente, atualize ou adicione o respectivo arquivo Markdown em <plan_file>.

# DESIGN.md

- Toda a UI que você trabalhar, você sempre tem que seguir o ./DESIGN.md completamente
- Leia sempre o DESIGN.md antes de começar tanto planejamento quanto execução de tarefas de UI
