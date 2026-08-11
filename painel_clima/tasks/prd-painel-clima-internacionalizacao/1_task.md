# Tarefa 1.0: Criar a infraestrutura de internacionalização da feature de clima

## Visão geral

Criar a base técnica que permitirá ao Painel de Clima renderizar textos, metadados, descrições climáticas e valores formatados em `pt-BR` e `en-US`, com persistência local da preferência do usuário e sem alterar contratos de backend.

<skills>
### Conformidade com skills

- `react-frontend-conventions`: aplicar Context API, componentes funcionais e estado local da feature.
- `repo-architecture`: manter novos arquivos colocalizados em `frontend/src/features/weather/`.
- `nodejs-typescript-conventions`: usar TypeScript, ESM, tipos explícitos e evitar `any`.
- `code-standards-en`: manter identificadores em inglês, funções com verbos e arquivos em kebab-case.
- `vitest-testing`: criar testes unitários e de integração com Vitest e Testing Library.
- `ui-ux-pro-max`: orientar a base do seletor para contraste, foco visível e responsividade.
</skills>

<requirements>

- Criar um catálogo tipado de mensagens para `pt-BR` e `en-US`.
- Garantir paridade de chaves e ausência de strings vazias entre idiomas.
- Criar o provider de idioma restrito à feature de clima.
- Persistir a escolha do idioma em `localStorage` com fallback seguro em memória.
- Atualizar `document.documentElement.lang` e metadados da página conforme o idioma ativo.
- Criar formatadores de datas, horários, números, temperatura, vento e percentual baseados em `Intl`.
- Criar descrições climáticas locais por código WMO em ambos os idiomas.
- Criar o controle base de seleção de idioma, pronto para integração visual na página.
- Não alterar endpoints, DTOs de backend ou dados externos recebidos das APIs.

</requirements>

## Subtarefas

- [x] 1.1 Criar os tipos públicos de idioma, mensagens, contexto e formatadores da feature de clima.
- [x] 1.2 Criar `translations.ts` com catálogo completo para Português e Inglês.
- [x] 1.3 Criar `weather-language-provider.tsx` com leitura, escrita, validação e fallback de idioma.
- [x] 1.4 Criar `weather-formatters.ts` com formatação por locale ativo.
- [x] 1.5 Criar `weather-code-descriptions.ts` com descrições WMO localizadas e fallback para código desconhecido.
- [x] 1.6 Criar `language-selector.tsx` com estado ativo visual e programático.
- [x] 1.7 Adicionar testes unitários para catálogo, provider, formatadores e descrições WMO.
- [x] 1.8 Adicionar testes de integração do provider com o seletor de idioma.

## Detalhes de implementação

Referenciar `techspec.md`, principalmente as seções:

- `Arquitetura do sistema`
- `Design de implementação`
- `Modelos de dados`
- `Pontos de integração`
- `Abordagem de testes`

Não adicionar biblioteca de i18n nesta tarefa. A especificação técnica define catálogo tipado local como decisão principal.

## Critérios de sucesso

- O idioma padrão é `pt-BR` quando não existe preferência válida salva.
- A troca para `en-US` é persistida e refletida no contexto da feature.
- Valores inválidos no storage retornam para `pt-BR` sem quebrar a UI.
- `document.documentElement.lang` acompanha o idioma ativo.
- Catálogo, descrições WMO e formatadores possuem cobertura unitária em ambos os idiomas.
- O seletor expõe nome acessível, estado selecionado e operação por teclado.

## Testes da tarefa

- [x] Testes unitários: `translations.test.ts`, `weather-formatters.test.ts`, `weather-code-descriptions.test.ts`.
- [x] Testes unitários: `weather-language-provider.test.tsx` para default, persistência, fallback e atualização de `lang`.
- [x] Testes unitários: `language-selector.test.tsx` para nome acessível, estado ativo e interação.
- [x] Testes de integração: provider + seletor alternando idioma e preservando foco.
- [x] Testes E2E: não aplicável nesta tarefa; cobertos na tarefa 3.0.

## Arquivos relevantes

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
- `frontend/src/features/weather/types.ts`
