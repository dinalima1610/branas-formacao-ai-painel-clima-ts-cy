# Tarefa 3.0: Adicionar testes E2E para idioma, persistência, erros e navegação por teclado

## Visão geral

Adicionar cobertura E2E determinística para validar a experiência internacionalizada completa do Painel de Clima em navegador, incluindo primeiro acesso, busca, alternância de idioma, persistência, erros, preservação de estado e navegação por teclado.

<skills>
### Conformidade com skills

- `nodejs-typescript-conventions`: configurar scripts e testes em TypeScript, com npm e ESM quando aplicável.
- `repo-architecture`: posicionar specs E2E e configuração no local definido pelo padrão do repositório.
- `code-standards-en`: manter nomes de testes, helpers e fixtures em inglês.
- `vitest-testing`: manter separação entre testes unitários/de integração e a nova suíte E2E.
- `ui-ux-pro-max`: validar fluxo por teclado, foco visível, responsividade e ausência de sobreposição.
</skills>

<requirements>

- Adicionar Playwright como dependência de desenvolvimento quando ainda não estiver presente.
- Criar configuração E2E compatível com a estrutura do projeto.
- Cobrir primeiro acesso em Português.
- Cobrir busca textual e exibição de clima.
- Cobrir troca para Inglês preservando cidade, previsão, foco e dados carregados.
- Cobrir reload mantendo idioma salvo em `localStorage`.
- Cobrir erro de provedor no idioma ativo com ação de tentar novamente.
- Cobrir navegação por teclado por seletor de idioma, busca, resultados, geolocalização e retry.
- Usar dados determinísticos por interceptação ou backend de teste, conforme padrão viável no repositório.
- Não substituir a cobertura unitária e de integração das tarefas 1.0 e 2.0.

</requirements>

## Subtarefas

- [x] 3.1 Adicionar dependência, scripts npm e configuração do Playwright conforme padrão do repo.
- [x] 3.2 Criar fixtures ou interceptações determinísticas para busca de cidade, clima e erro de provedor.
- [x] 3.3 Criar cenário E2E de primeiro acesso em Português com busca textual e clima exibido.
- [x] 3.4 Criar cenário E2E de alternância para Inglês preservando dados carregados e foco.
- [x] 3.5 Criar cenário E2E de reload mantendo idioma salvo.
- [x] 3.6 Criar cenário E2E de erro no idioma ativo com retry.
- [x] 3.7 Criar cenário E2E de navegação por teclado cobrindo controles principais.
- [x] 3.8 Adicionar validação responsiva mínima para desktop e mobile.
- [x] 3.9 Adicionar testes unitários para helpers E2E próprios, caso sejam criados.
- [x] 3.10 Documentar como executar a suíte E2E no script ou README pertinente, se o repo já tiver padrão para isso.

## Detalhes de implementação

Referenciar `techspec.md`, principalmente as seções:

- `Abordagem de testes`
- `Sequenciamento do desenvolvimento`
- `Dependências técnicas`
- `Considerações técnicas`
- `Arquivos relevantes e dependentes`

Os testes E2E devem validar comportamento de usuário final e objetivo de negócio, não detalhes internos da implementação.

## Critérios de sucesso

- A suíte E2E roda por script npm documentado.
- Os cenários usam dados previsíveis e não dependem de provedor meteorológico externo instável.
- O primeiro acesso renderiza a experiência em Português.
- A troca para Inglês preserva cidade, clima atual, previsão e foco.
- O reload mantém o idioma salvo.
- Erros e retry aparecem no idioma ativo.
- A navegação por teclado alcança os controles principais em ordem coerente.
- As validações E2E complementam, sem duplicar excessivamente, os testes unitários e de integração.

## Testes da tarefa

- [x] Testes unitários: helpers/fixtures E2E próprios, se houver lógica reutilizável.
- [x] Testes de integração: validação do script/configuração E2E no fluxo de teste do projeto, quando aplicável.
- [x] Testes E2E: primeiro acesso em Português, busca textual e clima exibido.
- [x] Testes E2E: alternância para Inglês com preservação de dados e foco.
- [x] Testes E2E: reload mantendo idioma salvo.
- [x] Testes E2E: erro de provedor localizado e retry.
- [x] Testes E2E: navegação por teclado e responsividade mínima.

## Arquivos relevantes

- `frontend/package.json`
- `playwright.config.ts`
- `e2e/weather-i18n.spec.ts`
- `frontend/src/features/weather/test/fixtures.ts`
- `frontend/src/pages/weather-page.tsx`
- `frontend/src/features/weather/components/language-selector.tsx`
