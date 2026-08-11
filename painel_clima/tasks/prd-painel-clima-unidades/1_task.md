# Tarefa 1.0: Backend: padronizar contrato `/api/v1` para clima e cidades

## Visão geral

Entregar a paridade do backend com o contrato consumido pelo frontend, expondo os recursos atuais também em `/api/v1`. O backend continua retornando dados meteorológicos canônicos em unidades métricas e preserva `/api/v0` como compatibilidade temporária. Esta tarefa remove a divergência atual entre cliente e servidor sem adicionar preferência de unidade na API.

<skills>
### Conformidade com skills

- `express-rest-http` - Express como camada HTTP, JSON in/out, status canônicos, OpenAPI documentado.
- `repo-architecture` - manter fluxo `controllers -> services -> data`; não mover regra de domínio para controllers.
- `nodejs-typescript-conventions` - TypeScript, npm, `async/await`, tipos explícitos, sem `any`.
- `code-standards-en` - identificadores em inglês, funções com verbo, early return e escopo pequeno.
- `vitest-testing` - testes unitários e integração HTTP com Vitest, sem Supertest.
</skills>

<requirements>
- Registrar `/api/v1` no backend para os recursos de busca de cidades, clima e OpenAPI.
- Manter payload métrico canônico; não criar parâmetro de unidade na API.
- Preservar `/api/v0` enquanto houver compatibilidade no cliente.
- Garantir que `GET /api/v1/cities/search`, `GET /api/v1/weather` e `GET /api/v1/openapi.json` estejam documentados e testados.
- Não alterar provedores externos, autenticação, timeout, atribuição Open-Meteo ou regras de geolocalização.
</requirements>

## Subtarefas

- [x] 1.1 Mapear rotas existentes em `/api/v0` e definir o adaptador/caminho equivalente para `/api/v1`.
- [x] 1.2 Registrar `/api/v1` em `backend/src/app.ts`, reaproveitando o serviço atual.
- [x] 1.3 Ajustar `backend/src/controllers/weather.controller.ts` para documentar os paths `/api/v1` no OpenAPI.
- [x] 1.4 Garantir que o contrato canônico de `/api/v1/cities/search` retorne `City[]` conforme esperado pelo frontend.
- [x] 1.5 Garantir que o contrato canônico de `/api/v1/weather` retorne `WeatherSnapshot` em valores métricos.
- [x] 1.6 Manter os endpoints `/api/v0` funcionando durante a transição.
- [x] 1.7 Atualizar testes unitários e de integração HTTP relacionados ao versionamento de API.

## Detalhes de implementação

Referenciar `tasks/prd-painel-clima-unidades/techspec.md`, seções "Endpoints da API", "Principais decisões" e "Arquivos relevantes e dependentes". A implementação deve focar em paridade de rota e contrato, sem introduzir unidade no backend.

## Critérios de sucesso

- `/api/v1/cities/search?q=Curitiba&limit=5` retorna 200 com lista canônica de cidades.
- `/api/v1/weather?lat=-25.43&lon=-49.27&city=Curitiba` retorna 200 com snapshot métrico canônico.
- `/api/v1/openapi.json` lista os endpoints versionados.
- `/api/v0` continua coberto por testes de compatibilidade.
- O frontend pode remover a dependência do fallback como caminho normal.
- Nenhuma chamada extra a Open-Meteo é introduzida para alternância de unidade.

## Testes da tarefa

- [x] Testes unitários
  - Cobrir helpers/parsers de query que aceitarem nomes canônicos de `/api/v1`.
  - Validar que o payload métrico não recebe ou interpreta parâmetro de unidade.
- [x] Testes de integração
  - Cobrir `GET /api/v1/cities/search`, `GET /api/v1/weather` e `GET /api/v1/openapi.json` com servidor Express em porta efêmera.
  - Manter casos principais de `/api/v0` para compatibilidade.
- [x] Testes E2E (se aplicável)
  - Não aplicável nesta tarefa; o fluxo browser será coberto na tarefa 4.0.

## Arquivos relevantes

- `backend/src/app.ts`
- `backend/src/controllers/weather.controller.ts`
- `backend/src/controllers/weather.controller.test.ts`
- `backend/src/types/weather.ts`
- `frontend/src/features/weather/api/weather-client.ts`
- `tasks/prd-painel-clima-unidades/techspec.md`
