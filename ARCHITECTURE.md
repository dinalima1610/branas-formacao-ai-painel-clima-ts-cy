# Arquitetura

Este documento concentra os detalhes estruturais e técnicos do Painel de Clima. O [README.md](README.md) fica reservado para visão geral, preview, funcionalidades, stack, execução, escopo do MVP, status e autoria.

## 📂 Estrutura do Projeto

A organização de diretórios do projeto divide-se em pastas principais:

```text
.
|-- painel_clima/         # Primeira implementação completa da aplicação
|   |-- backend/        # API Express para clima e cidades em /api/v0 e /api/v1
|   |-- frontend/       # Painel React/Vite com feature weather
|   |-- .agents/        # Skills locais publicáveis usadas pelo kit de processo
|   |-- e2e/            # Testes Playwright e fixtures determinísticas
|   |-- spec-driven/    # Prompts operacionais de SDD e QA
|   |-- tasks/          # PRDs, tech specs, tasks, reviews, bugs e QA reports
|   |-- AGENTS.md        # Regras locais de skills e execução
|   |-- DESIGN.md       # Sistema visual usado como referência
|   `-- qa-*.png        # Evidências visuais de QA
|-- painel_clima_cy/         # Versão evoluída, modular e desacoplada do projeto
|   |-- .compozy/       # Artefatos Compozy: PRD, Tech Spec, tasks, memória e QA
|   |-- .agents/        # Skills locais publicáveis usadas pelo fluxo Compozy/CY
|   |-- backend/        # API Express modular com /places e /weather
|   |-- frontend/       # Painel React/Vite modularizado por feature e hooks customizados
|   |-- AGENTS.md
|   `-- DESIGN.md
|-- docs/
|   `-- evidencias/
|       |-- compozy/     # Prints da execução Compozy
|       `-- videos/      # Vídeos curtos gravados para o README
|-- template/
|   |-- backend/        # Template base Express/TypeScript
|   `-- frontend/       # Template base React/Vite/Tailwind
`-- package.json
```

*   [`painel_clima/`](painel_clima): Contém a primeira implementação completa da aplicação.
    *   [`painel_clima/backend/`](painel_clima/backend): Código do servidor Express, clientes da API Open-Meteo e testes unitários.
    *   [`painel_clima/frontend/`](painel_clima/frontend): Código do painel em React estruturado em componentes de feature.
    *   [`painel_clima/.agents/`](painel_clima/.agents): Contém skills locais publicáveis usadas pelo kit de processo, incluindo a skill de Context7 referenciada em `spec-driven/`.
    *   [`painel_clima/spec-driven/`](painel_clima/spec-driven): Contém os prompts operacionais atuais para criação de PRD, tech spec, tasks, execução de tarefa e QA.
    *   [`painel_clima/tasks/`](painel_clima/tasks): Contém os artefatos de processo do Compozy (`prd.md`, `techspec.md`, definições de tarefas, relatórios de QA e histórico de execução).
    *   [`painel_clima/e2e/`](painel_clima/e2e): Suíte de testes automatizados com Playwright.

*   [`painel_clima_cy/`](painel_clima_cy): Versão evoluída, modular e altamente desacoplada do projeto.
    *   [`painel_clima_cy/.agents/`](painel_clima_cy/.agents): Contém as skills locais publicáveis que sustentam o fluxo Compozy/CY, incluindo criação de PRD, tech spec, tasks, memória, QA, reviews, correções e verificação final.
    *   [`painel_clima_cy/backend/src/controllers/`](painel_clima_cy/backend/src/controllers): Controladores separados para `/places` e `/weather`, além de manipuladores globais de erro.
    *   [`painel_clima_cy/backend/src/services/`](painel_clima_cy/backend/src/services): Lógica de negócio desacoplada (serviços de clima e geocodificação).
    *   [`painel_clima_cy/backend/src/data/clients/`](painel_clima_cy/backend/src/data/clients): Clientes HTTP desacoplados para APIs de busca e previsão do tempo da Open-Meteo.
    *   [`painel_clima_cy/frontend/src/features/weather-panel/`](painel_clima_cy/frontend/src/features/weather-panel): Componentes atômicos e isolados de UI (`WeatherSearch`, `CurrentConditions`, `DailyForecast`, `HourlyForecast`, `UnitToggle`) e hooks customizados.

*   [`docs/evidencias/compozy/`](docs/evidencias/compozy): Imagens capturadas que documentam a execução das tarefas por meio do Compozy local.

*   [`template/`](template): Modelos estruturais base para backend Express/TypeScript e frontend React/Vite/Tailwind.

---

## 💾 Backend

O backend atua como um BFF e está estruturado com base nas boas práticas de desenvolvimento modular:

*   **Estrutura de Camadas**: Rotas/Controllers → Services → Data Clients (Open-Meteo para clima e busca textual; provedores de geocodificação reversa para nomear coordenadas autorizadas pelo navegador).
*   **Rotas e Diferenças de Contratos**:
    *   **Painel do Clima**: Disponibiliza as rotas `/api/v1/cities/search?q={cidade}` (geocodificação via Open-Meteo) e `/api/v1/weather?lat={n}&lon={n}&city={label}` (retorna DTO com clima consolidado e previsão de 7 dias).
    Expõe:
    - `GET /health`
    - Rotas sob `/api/v0`
    - Rotas sob `/api/v1`
    - `GET /api/v1/cities/search`
    - `GET /api/v1/weather`

    *   **Painel do Clima by CY**: Divide as responsabilidades em dois controladores limpos: `/places` (geocodificação) e `/weather` (informações de clima e previsões).
    Expõe:
    - `GET /health`
    - `GET /places/search`
    - `GET /places/reverse`
    - `GET /weather`

*   **Geocodificação Reversa Pós-MVP**: A busca por "Minha localização" obtém coordenadas pelo navegador e, em seguida, o backend tenta resolver cidade, estado/região e país. O fluxo usa Google Geocoding quando `GOOGLE_GEOCODING_API_KEY` estiver configurada e Nominatim/OpenStreetMap como fallback sem chave. Se nenhum provedor retornar cidade confiável, o card mantém apenas o rótulo traduzível "Minha localização/My location".
*   **Normalização de Códigos WMO (Weather Interpretation Codes)**: Os códigos numéricos de condições climáticas são mapeados em tempo de execução para strings em português (PT-BR) e ícones semânticos, devolvendo payloads prontos para renderização.
*   **Validação rigorosa**: Utilização do Zod para assegurar que todas as queries de latitude, longitude e termos de busca estejam sanitizadas antes de serem encaminhadas para as APIs de terceiros.

O backend integra com Open-Meteo, normaliza respostas, trata erros de entrada e falhas do provedor externo, e separa responsabilidades em controllers, services, data clients, schemas/tipos e handlers de erro. Para geolocalização atual, a aplicação também integra provedores de geocodificação reversa apenas para enriquecer o nome exibido, sem alterar a origem dos dados meteorológicos.

---

## 🎨 Frontend

O frontend implementa uma interface moderna em React, TypeScript, Vite e Tailwind focada em usabilidade e design.

### Design System e Referências das Marcas

A criação visual seguiu o conceito de criação de Design Systems baseados no padrão `DESIGN.md` (amplamente disseminado no site/repositório [**getdesign.md**](https://getdesign.md/design-md) mantido pelo Google para consolidar e expor o design de marcas, similar à referência conceitual *"Design System inspired by [Ferrari]"*).

No caso deste projeto, o visual foi construído em conformidade com o **Design System inspired by Claude Code** (Anthropic):
*   **Estilo Visual**: Interface com fundo pastel/creme (`cream canvas` - `#faf9f5`), CTAs em tons de coral quente (`#cc785c`), tipografia display serifada clássica (`Copernicus` / `Tiempos Headline`) para títulos de destaque, fontes sem-serifa humanistas para textos de leitura, e superfícies escuras texturizadas (`surface-dark` - `#181715`) para cards de dados técnicos.
*   **Organização das Features**: A implementação foi realizada de forma altamente modular dentro de `features/weather-panel/` (ou `features/weather/`), isolando componentes puramente visuais da lógica de geolocalização e carregamento assíncrono expostos em hooks.

### Acessibilidade: Histórico e Correção do BUG-01

Apesar do alinhamento visual com as diretrizes do Claude Code, o design system foi inicialmente **reprovado na auditoria de acessibilidade de QA**.
*   **Motivo**: Contraste insuficiente nas combinações de cores da paleta creme/coral em elementos textuais pequenos, especificamente no **seletor de idioma** e nas **dicas de busca**. O contraste ficou abaixo do limite mínimo de **4.5:1** exigido pela WCAG 2.2 AA para textos normais.
*   **Correção**: O BUG-01 escureceu o coral usado em estados selecionados e ações pequenas, além de ajustar textos auxiliares para uma cor neutra mais escura. A correção foi aplicada em `painel_clima` por componentes/tokens e replicada em `painel_clima_cy` por tokens globais da paleta.
*   **Evidências**: [BUG-01-contrast-fix.md](docs/evidencias/qa/BUG-01-contrast-fix.md), [BUG-01-contrast-check.json](docs/evidencias/qa/BUG-01-contrast-check.json).

No [painel_clima](painel_clima/), a feature está em [painel_clima/frontend/src/features/weather](painel_clima/frontend/src/features/weather/).

No [painel_clima_cy](painel_clima_cy/), a feature está em [painel_clima_cy/frontend/src/features/weather-panel](painel_clima_cy/frontend/src/features/weather-panel/).

---

## 🔌 Integração Frontend/Backend

*   **Comunicação Indireta**: O frontend consome exclusivamente a API local do backend em `http://localhost:3000`, respeitando as regras do PRD de que nenhuma chamada direta à API externa de Open-Meteo deve ser realizada pelo cliente.
*   **CORS (Cross-Origin Resource Sharing)**: O backend expõe configurações de CORS flexíveis por meio de variáveis de ambiente para permitir que o cliente em desenvolvimento consuma os recursos sem bloqueios do navegador.
*   **Abstração de Transporte**: O cliente frontend (`weather-api.ts` ou `weather-client.ts`) encapsula o uso do `fetch` nativo e do `AbortController` para abortar requisições pendentes caso o usuário realize novas pesquisas em sequência.
*   **Rótulo de Localização Atual**: O frontend mantém um marcador explícito de consulta por geolocalização para que o prefixo "Minha localização/My location" acompanhe a língua escolhida. A cidade resolvida por geocodificação reversa é tratada como detalhe exibível, não como texto traduzido fixo salvo no estado.

Contratos documentados:

- [painel_clima/backend/openapi.yaml](painel_clima/backend/openapi.yaml)
- [painel_clima_cy/backend/openapi.yaml](painel_clima_cy/backend/openapi.yaml)

---

## ⚠️ Limitações Técnicas

*   **Ausência de Caching**: As requisições de clima, busca textual e geocodificação reversa batem diretamente nos provedores por meio do backend a cada consulta, sem persistência local ou camada de cache (ex: Redis) e o frontend depende do backend local para obter dados climáticos.
*   **Dependências Externas**: A aplicação depende da integridade e disponibilidade da API gratuita da Open-Meteo para dados meteorológicos. A geocodificação reversa de "Minha localização" depende de Google Geocoding quando configurado ou de Nominatim/OpenStreetMap como fallback; falhas nessa etapa não impedem a consulta climática por coordenadas.
*   **Ajuste fora da especificação inicial**: A especificação original validava geolocalização por coordenadas, mas não exigia nomear a localização atual com cidade/estado/país nem preservar esse rótulo durante troca de idioma. Essa capacidade foi adicionada como correção pós-MVP motivada por uso real.
*   **Internacionalização**: Cobre somente Português e Inglês.
