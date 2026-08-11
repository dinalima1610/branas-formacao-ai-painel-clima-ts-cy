# Tarefa 2.0: Frontend: criar camada de conversão e toggle segmentado de unidades

## Visão geral

Entregar a base de unidade no frontend: tipos, helpers puros de conversão e o controle segmentado acessível. Esta tarefa não precisa integrar a unidade em toda a página ainda; ela cria os blocos reutilizáveis para que os componentes meteorológicos convertam os valores métricos já carregados.

<skills>
### Conformidade com skills

- `react-frontend-conventions` - componentes funcionais TSX, props explícitas, estado controlado pelo pai e testes por componente.
- `repo-architecture` - helpers da feature em `frontend/src/features/weather/lib/` e componente em `components/`.
- `nodejs-typescript-conventions` - TypeScript, ESM, sem `any`, tipos explícitos.
- `code-standards-en` - nomes em inglês como `UnitSystem`, `formatTemperature`, `formatWindSpeed`.
- `ui-ux-pro-max` - foco visível, contraste, labels textuais e controle operável por teclado.
- `vitest-testing` - unit tests com Vitest e Testing Library.
</skills>

<requirements>
- Criar `UnitSystem` com estados `metric` e `imperial`.
- Criar funções puras para temperatura Celsius -> Celsius/Fahrenheit e vento km/h -> km/h/mph.
- Manter arredondamento legível em pt-BR com `Intl.NumberFormat`.
- Criar toggle segmentado com opções `°C / km/h` e `°F / mph`.
- O estado selecionado deve ser identificável por texto e por semântica acessível, não apenas por cor.
- O controle deve ser reutilizável e controlado via props.
</requirements>

## Subtarefas

- [x] 2.1 Criar `frontend/src/features/weather/lib/weather-units.ts` com tipos, símbolos, labels e helpers de formatação.
- [x] 2.2 Cobrir conversões de temperatura, vento, arredondamento, valores negativos e labels.
- [x] 2.3 Criar `frontend/src/features/weather/components/unit-system-toggle.tsx` como controle segmentado controlado.
- [x] 2.4 Garantir navegação por teclado, foco visível, `fieldset`/`legend` ou semântica ARIA equivalente.
- [x] 2.5 Ajustar exports públicos da feature quando necessário.
- [x] 2.6 Criar testes de componente para clique, teclado, estado selecionado e labels acessíveis.

## Detalhes de implementação

Referenciar `tasks/prd-painel-clima-unidades/techspec.md`, seções "Principais interfaces", "Modelos de dados" e "Abordagem de testes". Não persistir preferência em storage e não acoplar o toggle a busca ou fetch nesta tarefa.

## Critérios de sucesso

- `formatTemperature(0, 'imperial')` retorna valor equivalente a 32 °F com o padrão visual definido.
- `formatWindSpeed(10, 'imperial')` retorna mph arredondado de forma consistente.
- Toggle renderiza exatamente as opções `°C / km/h` e `°F / mph`.
- Usuário consegue alternar unidade em uma interação por mouse ou teclado.
- Leitor de tela consegue identificar o propósito do controle e a opção ativa.
- Não há nova dependência npm obrigatória.

## Testes da tarefa

- [x] Testes unitários
  - `weather-units.test.ts`: Celsius/Fahrenheit, km/h/mph, arredondamento, negativos, labels e unidade default.
  - `unit-system-toggle.test.tsx`: renderização, seleção controlada e callback de mudança.
- [x] Testes de integração
  - Renderizar o toggle dentro de um pequeno componente host com estado real e validar mudança visual/semântica após interação.
- [x] Testes E2E (se aplicável)
  - Não aplicável nesta tarefa; o fluxo browser completo será coberto na tarefa 4.0.

## Arquivos relevantes

- `frontend/src/features/weather/lib/weather-units.ts`
- `frontend/src/features/weather/lib/weather-units.test.ts`
- `frontend/src/features/weather/components/unit-system-toggle.tsx`
- `frontend/src/features/weather/components/unit-system-toggle.test.tsx`
- `frontend/src/features/weather/types.ts`
- `frontend/src/features/weather/index.ts`
- `DESIGN.md`
