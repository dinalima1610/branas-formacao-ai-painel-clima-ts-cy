# Painel de Clima (Weather Dashboard) ⛅

O **Painel de Clima** é uma aplicação completa (Fullstack) desenvolvida como parte da **Formação em Inteligência Artificial** da [Branas Tecnologia](https://www.branas.io/formacoes/inteligencia-artificial) no módulo "Processo de Desenvolvimento com IA". 

A aplicação permite aos usuários consultarem de forma ágil as condições climáticas atuais e a previsão do tempo para os próximos 7 dias de qualquer cidade do mundo. A busca pode ser feita de forma textual (com autocomplete) ou por geolocalização autorizada explicitamente pelo navegador.

Toda a comunicação com o provedor de clima externo **Open-Meteo** é realizada exclusivamente via backend do projeto, atuando como um BFF (Backend-for-Frontend) para garantir a segurança e a conformidade com as restrições arquiteturais, implementado por artefatos de SDD (Spec Driven Development) e validações automatizadas.

Como ferramenta de SDD, o projeto [painel_clima_cy](painel_clima_cy) é a evolução do [painel_clima](painel_clima) estruturado e executado com o fluxo de desenvolvimento assistido por IA a partir de prompts com o apoio do [Compozy](https://github.com/compozy/compozy), release 0.2.4.

---

## 🎬 Preview

Abaixo, encontram-se demonstrações visuais do funcionamento do Painel de Clima em suas diferentes implementações:

- **Painel do Clima (BFF com rotas `/api/v1`)**

  [![Prévia animada do painel_clima](docs/evidencias/videos/painel-clima-busca-curitiba-unidades.gif)](docs/evidencias/videos/painel-clima-busca-curitiba-unidades.webm)

  [Abrir vídeo original: painel_clima - busca por Curitiba, idioma e unidades](docs/evidencias/videos/painel-clima-busca-curitiba-unidades.webm)

- **Painel do Clima by CY - Compozy (Estrutura modular com rotas `/places` e `/weather`)**

  [![Prévia animada do painel_clima_cy](docs/evidencias/videos/painel-clima-cy-busca-sao-paulo-previsao.gif)](docs/evidencias/videos/painel-clima-cy-busca-sao-paulo-previsao.webm)

  [Abrir vídeo original: painel_clima_cy - busca por São Paulo e previsão](docs/evidencias/videos/painel-clima-cy-busca-sao-paulo-previsao.webm)

*   **Evidências de Execução no Compozy**:
    *   Para visualizar o fluxo de execução automatizada e geração de tarefas pelo orquestrador, acesse [PROCESS.md](PROCESS.md), que contém links para os logs e capturas de tela das execuções do daemon.

*   **O projeto também inclui evidências visuais de QA** (Quality Assurance) em [painel_clima](painel_clima/).

**Observação**: este projeto foi renomeado de `f_ia_m1_4_cy` para `branas_painel_clima`. 

Os subprojetos também foram renomeados de `example_09` para `painel_clima` e de `example_10` para `painel_clima_cy`. 

Algumas evidências visuais preservadas podem ainda exibir os nomes anteriores na interface, caminhos ou metadados, pois foram capturadas antes da renomeação.

- [painel_clima/qa-initial-desktop.png](painel_clima/qa-initial-desktop.png)
- [painel_clima/qa-loaded-mobile.png](painel_clima/qa-loaded-mobile.png)
- [painel_clima/qa-curitiba-metric-desktop.png](painel_clima/qa-curitiba-metric-desktop.png)
- [painel_clima/qa-curitiba-imperial-desktop.png](painel_clima/qa-curitiba-imperial-desktop.png)
- [painel_clima/qa-curitiba-english-imperial-desktop.png](painel_clima/qa-curitiba-english-imperial-desktop.png)
- [painel_clima/qa-empty-search-english-desktop.png](painel_clima/qa-empty-search-english-desktop.png)
---

## 🎯 Objetivo

O projeto teve dois objetivos principais:
1.  **Objetivo do Negócio**: Entregar uma ferramenta ágil e integrada de consulta climática para os usuários finais, reduzindo a necessidade de consultar serviços meteorológicos externos. A meta técnica era que os dados do tempo fossem renderizados em menos de **3 segundos** sob condições normais de rede, com taxa de sucesso de busca ≥ 95% para cidades conhecidas.
2.  **Objetivo Educacional**: Aplicar a metodologia de **Spec Driven Development (SDD)** auxiliada por ferramentas de inteligência artificial. O fluxo compreendeu a escrita guiada de PRD (Product Requirements Document), Especificação Técnica, quebra em tarefas atômicas executadas por agentes em background e validação final por uma suíte rigorosa de testes e QA.

---

## ✨ Funcionalidades

O sistema atende a **19 requisitos funcionais (RF-01 a RF-19)** definidos e validados no fluxo de desenvolvimento:

*   **Busca por Cidade (Autocomplete)**: Digitação mínima de 2 caracteres para busca. Retorna uma lista de cidades correspondentes desambiguando homônimos por estado/país.
*   **Geolocalização (Opt-in)**: Botão visível para "Usar minha localização", acionando a API de geolocalização do navegador de forma explícita. Quando possível, o backend resolve as coordenadas por geocodificação reversa e o card exibe a localização com cidade, estado/região e país. No `painel_clima`, o título usa o prefixo traduzível "Minha localização/My location"; no `painel_clima_cy`, o card exibe o rótulo geográfico resolvido pelo backend. O fluxo textual continua funcional se a geolocalização for negada.
*   **Exibição do Clima Atual**:
    *   Nome da cidade correspondente, estado/região e país.
    *   Temperatura atual e sensação térmica em graus Celsius.
    *   Condição climática descrita em texto legível (ex: "Ensolarado", "Chuva fraca") e ícone correspondente.
    *   Velocidade do vento (km/h) e umidade relativa (%).
    *   Timestamp local da última atualização.
*   **Previsão de 7 Dias**: Listagem com data, mínima, máxima, ícone e condição para os próximos dias (incluindo o atual).
*   **Feedback e Resiliência**: Estado de carregamento, estado vazio inicial orientativo e mensagens de erro amigáveis com botão de "Tentar novamente" em caso de falha do backend ou da API externa.

---

## 🛠️ Tecnologias

A aplicação utiliza uma stack de desenvolvimento robusta e moderna em ambas as camadas:

### Frontend
*   **React 19**: Biblioteca base para construção da interface.
*   **TypeScript**: Tipagem estática para robustez do código.
*   **Vite 7**: Ferramenta de build rápida e servidor de desenvolvimento.
*   **TailwindCSS 3**: Estilização baseada em utilitários utilitários sem TailwindCSS ad-hoc.
*   **Lucide React**: Biblioteca de ícones vetoriais.
*   **class-variance-authority, clsx e tailwind-merge**: Utilitários para composição de classes CSS.
*   **Vitest & React Testing Library (RTL)**: Execução de testes unitários e de renderização.

### Backend
*   **Node.js & Express 5**: Servidor HTTP mínimo e estruturação de rotas de API.
*   **TypeScript**: Tipagem estática e compilação do código de servidor.
*   **tsx & nodemon**: Execução em modo de desenvolvimento com hot reload.
*   **Zod**: Validação de esquemas e entradas de API (utilizado no Painel do Clima).
*   **Vitest & Vitest Coverage (v8)**: Testes automatizados com cobertura de código.

### Qualidade e Automação
*   **Playwright**: Testes de ponta a ponta (E2E) simulando dispositivos desktop e mobile.
*   **Compozy CLI (Command Line Interface) v0.2.4**: Orquestrador e executor do processo SDD.

---

## 📂 Estrutura e Arquitetura

Os detalhes de estrutura de diretórios, backend, frontend, integração, contratos e limitações técnicas estão em [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🚀 Como Executar

O projeto possui comandos de inicialização específicos para cada exemplo devido às diferenças nos contratos das APIs.

### Executando o Painel do Clima (Contrato `/api/v1`)

1.  **Backend**:
    ```bash
    cd painel_clima/backend
    npm install
    npm run dev
    ```
    *O servidor rodará em `http://localhost:3000` expondo a API de clima e geocodificação sob o prefixo `/api/v1`.*

2.  **Frontend**:
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    *A interface estará acessível em `http://localhost:5173/`.*

3.  **Executando Testes E2E (Playwright)**:
    ```bash
    cd ..
    npm install
    npm run test:e2e
    ```

---

### Executando o Painel do Clima by CY (Estrutura modular)

1.  **Backend**:
    ```bash
    cd painel_clima_cy/backend
    npm install
    npm run dev
    ```
    *O servidor rodará em `http://localhost:3000` expondo endpoints específicos `/places` e `/weather`.*

2.  **Frontend**:
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    *A interface estará acessível em `http://localhost:5173/`.*

---

## 📚 Documentação Complementar

- [ARCHITECTURE.md](ARCHITECTURE.md): estrutura do projeto, backend, frontend, integração, contratos e limitações técnicas.
- [PROCESS.md](PROCESS.md): processo com Compozy, SDD, evidências de execução, publicação, qualidade, testes, aprendizados e registros de correção de QA.

---

## 🎯 Escopo
### Em Escopo (MVP Realizado)
*   Busca de cidades com autocomplete e desambiguação geográfica.
*   Geolocalização via navegador com pedido explícito de consentimento.
*   Clima atual completo e previsão diária de 7 dias com tradução PT-BR.
*   Alternância métrica/imperial.
*   Internacionalização Português/Inglês.
*   Interface totalmente responsiva e navegável por teclado.
*   Mapeamento amigável de erros de rede e do provedor de clima.
*   Backend proxy para Open-Meteo.
*   Testes e QA.
*   Artefatos de SDD.

**Observação pós-MVP**: a identificação de cidade/estado/país no card de geolocalização foi adicionada após a validação original e replicada nos dois subprojetos. A especificação inicial previa geolocalização por coordenadas e exibição de clima, mas não detalhava a necessidade de traduzir dinamicamente o rótulo do card no `painel_clima`, enriquecer a localização atual com geocodificação reversa, nem reabilitar o botão de localização após a etapa de resolução de coordenadas.

### Fora de Escopo
*   Autenticação de usuários ou painel de cidades favoritas.
*   Alertas e notificações de clima severo por push ou e-mail.
*   Dados históricos de clima.
*   Mapas de radar interativos.
*   Novos provedores de clima além da Open-Meteo. A exceção pós-MVP é o uso de provedores de geocodificação reversa para nomear a localização atual, sem substituir o provedor de clima.
*   Persistência de unidade entre sessões.
*   Idiomas além de Português e Inglês.

## 💡 Exemplos

1.  **Consulta Curitiba**:
    *   Acesse o painel, digite "Curitiba" no campo de pesquisa.
    *   Selecione "Curitiba, Paraná, Brasil" na listagem.
    *   O painel exibirá as condições meteorológicas em tempo real e a variação da temperatura para os 7 dias seguintes.
    *   Troca para Inglês sem refazer busca de clima.
    *   Persistência de idioma após reload.

2.  **Conversão de Unidades**:
    *   Utilize o seletor na barra superior para alternar entre unidades Métricas (°C e km/h) e Imperiais (°F e mph) para ver a conversão dinâmica na tela, sem refetch.

3.  **Uso de geolocalização**:
    *   Somente após ação explícita.

4.  **Navegação por teclado**.

5.  **Validação mobile sem overflow horizontal**.

---

## 🚦 Status do Projeto

*   **Funcionalidades**: 100% concluídas, marcadas como concluídas em [painel_clima/tasks](painel_clima/tasks/).
*   **Testes**: 100% passando, testes unitários, E2E e builds constarem como aprovados nos relatórios.
*   **Status de Acessibilidade (QA)**: **BUG-01 CORRIGIDO**. O contraste insuficiente identificado no seletor de idioma e nas dicas de busca foi ajustado nos dois projetos (`painel_clima` e `painel_clima_cy`) e validado por contrast checker local. Evidência: [BUG-01-contrast-fix.md](docs/evidencias/qa/BUG-01-contrast-fix.md).

---

## 👤 Autor

Desenvolvido por **Diná Andrade Lima**

*   🔗 [**LinkedIn**](https://www.linkedin.com/in/din%C3%A1-andrade-lima/)
*   📂 [**GitHub**](https://github.com/dinalima1610)
