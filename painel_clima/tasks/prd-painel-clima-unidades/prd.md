# Documento de Requisitos do Produto (PRD)

## Visão Geral

Esta feature complementar do Painel de Clima permite que o usuário alterne globalmente as unidades de exibição das métricas meteorológicas entre o perfil métrico e o perfil imperial durante a sessão atual. O painel existente já exibe temperatura atual, sensação térmica, velocidade do vento, umidade e previsão de 7 dias com mínima e máxima; esta feature adiciona controle de preferência de unidade sem alterar o PRD original do Painel de Clima.

A funcionalidade resolve a dificuldade de usuários que interpretam clima em padrões diferentes, especialmente usuários acostumados a Fahrenheit e mph. O valor principal é tornar os dados meteorológicos compreensíveis sem exigir cálculo mental ou consulta externa, mantendo a experiência simples: um único toggle global muda todas as medidas aplicáveis exibidas no painel.

## Objetivos

- **Compreensão imediata**: usuário consegue alternar entre unidades métricas e imperiais em até **1 interação**.
- **Consistência visual**: **100%** das métricas meteorológicas compatíveis exibidas na tela devem refletir a unidade selecionada.
- **Baixo atrito**: a troca deve ocorrer sem refazer busca de cidade manualmente e sem interromper estados de carregamento, erro ou resultado.
- **Escopo controlado**: a preferência deve valer apenas para a sessão atual, sem exigir cadastro, login ou persistência entre visitas.
- **Acessibilidade**: o controle deve ser operável por teclado e compreensível por leitores de tela.

## Histórias de Usuário

- Como **visitante do produto no Brasil**, quero **ver temperatura em Celsius e vento em km/h por padrão** para que **eu consulte o clima no formato mais familiar para mim**.
- Como **visitante acostumado ao padrão imperial**, quero **trocar para Fahrenheit e mph em um toggle global** para que **eu entenda rapidamente temperatura, vento e demais medidas exibidas**.
- Como **viajante**, quero **alternar unidades sem refazer a busca da cidade** para que **eu compare a mesma previsão no padrão que prefiro naquele momento**.
- Como **usuário de tecnologia assistiva**, quero **um controle com rótulo claro e estado anunciado** para que **eu saiba qual sistema de unidades está ativo**.
- Como **usuário recorrente durante a mesma sessão**, quero **manter a unidade escolhida enquanto navego no painel** para que **a exibição continue consistente até eu fechar ou recarregar a sessão**.

## Principais funcionalidades

### 1. Toggle global de unidades

- **O que faz**: adiciona um controle global para alternar entre perfil métrico e perfil imperial.
- **Por que é importante**: evita controles repetidos em cada métrica e garante consistência em todo o painel.
- **Como funciona em alto nível**: o usuário escolhe um dos dois estados e o painel passa a exibir todas as medidas compatíveis na unidade correspondente.

**Requisitos funcionais:**

- **RF-01** O sistema deve exibir um toggle global de unidades em área visível do Painel de Clima.
- **RF-02** O toggle deve oferecer dois estados: **Métrico** e **Imperial**.
- **RF-03** O estado **Métrico** deve exibir temperatura em **°C**, velocidade do vento em **km/h**, pressão em **hPa**, precipitação em **mm** e visibilidade em **km**, quando essas métricas estiverem presentes.
- **RF-04** O estado **Imperial** deve exibir temperatura em **°F**, velocidade do vento em **mph**, pressão em **inHg**, precipitação em **in** e visibilidade em **mi**, quando essas métricas estiverem presentes.
- **RF-05** O sistema deve aplicar a unidade selecionada de forma global a todos os componentes do painel que exibem métricas meteorológicas compatíveis.
- **RF-06** O sistema deve manter a unidade selecionada apenas durante a sessão atual do usuário.
- **RF-07** Ao iniciar uma nova sessão sem preferência ativa, o painel deve usar o estado **Métrico** como padrão.

### 2. Cobertura de métricas meteorológicas

- **O que faz**: garante que as medidas exibidas usem a unidade correta conforme o estado global.
- **Por que é importante**: uma troca parcial gera confusão e reduz confiança nos dados.
- **Como funciona em alto nível**: cada valor meteorológico exibido deve apresentar valor e unidade coerentes com o perfil ativo.

**Requisitos funcionais:**

- **RF-08** O sistema deve alternar a **temperatura atual** entre °C e °F.
- **RF-09** O sistema deve alternar **temperatura máxima**, **temperatura mínima** e **sensação térmica** entre °C e °F.
- **RF-10** O sistema deve alternar **velocidade média do vento**, **vento máximo** e **rajadas**, quando exibidos, entre km/h e mph.
- **RF-11** O sistema deve alternar **pressão atmosférica/barométrica**, quando exibida, entre hPa e inHg.
- **RF-12** O sistema deve alternar **precipitação acumulada**, quando exibida, entre mm e in.
- **RF-13** O sistema deve alternar **visibilidade**, quando exibida, entre km e mi.
- **RF-14** Métricas sem unidade variável, como umidade relativa em %, devem permanecer inalteradas e continuar claramente rotuladas.
- **RF-15** O sistema deve evitar misturar unidades de perfis diferentes na mesma visualização após o usuário alternar o toggle.

### 3. Atualização da exibição sem perda de contexto

- **O que faz**: muda a unidade sem apagar cidade selecionada, resultado atual ou previsão já carregada.
- **Por que é importante**: o usuário está ajustando a forma de leitura, não iniciando uma nova consulta.
- **Como funciona em alto nível**: a tela preserva o contexto atual e atualiza apenas os valores e rótulos de unidades aplicáveis.

**Requisitos funcionais:**

- **RF-16** Ao alternar unidades com dados já carregados, o sistema deve preservar cidade, condição climática, timestamp, previsão e estados visuais existentes.
- **RF-17** O sistema deve atualizar as unidades exibidas sem exigir nova seleção de cidade pelo usuário.
- **RF-18** O sistema deve manter mensagens de erro, carregamento e estado vazio independentes da unidade selecionada.
- **RF-19** O sistema deve permitir nova busca de cidade mantendo a unidade escolhida na sessão atual.

## Experiência do usuário

**Personas e necessidades:**

- **Usuário local**: espera abrir o painel em português com unidades métricas por padrão.
- **Usuário familiarizado com padrão imperial**: precisa trocar rapidamente para Fahrenheit e mph.
- **Usuário casual**: não quer configurar cada métrica individualmente; espera um controle único e previsível.

**Jornada principal:**

1. Usuário abre o Painel de Clima e vê o toggle global em estado **Métrico**.
2. Usuário busca uma cidade ou usa localização atual.
3. Painel exibe clima atual e previsão nas unidades métricas.
4. Usuário alterna para **Imperial**.
5. Painel atualiza as unidades aplicáveis mantendo o mesmo resultado climático.
6. Usuário pode buscar outra cidade e continuar vendo dados no perfil escolhido durante a sessão.

**Considerações de UI/UX:**

- O toggle deve ter rótulos curtos e inequívocos, como "°C / km/h" e "°F / mph", ou equivalentes claros.
- A unidade deve aparecer junto ao valor sempre que houver possibilidade de ambiguidade.
- A posição do controle deve indicar que ele afeta todo o painel, não apenas um card.
- A troca não deve causar salto visual relevante, truncamento de texto ou sobreposição em mobile e desktop.
- O design deve seguir a linguagem visual existente do Painel de Clima e do `DESIGN.md`.

**Acessibilidade:**

- O controle deve ser operável por teclado.
- O estado selecionado deve ser identificável por texto, não apenas por cor.
- Leitores de tela devem conseguir anunciar o propósito do controle e a unidade ativa.
- A atualização dos valores não deve remover foco do controle acionado.
- Contraste mínimo deve seguir **WCAG 2.1 AA**.

## Restrições técnicas de alto nível

- Esta feature deve ser tratada como complemento ao PRD original `tasks/prd-painel-de-clima/prd.md`, mantendo o documento original imutável.
- A preferência de unidade não deve ser persistida entre sessões, nem exigir autenticação de usuário.
- O frontend deve continuar consumindo o backend existente do Painel de Clima; não deve chamar provedores meteorológicos externos diretamente.
- A fonte de dados meteorológicos permanece a mesma já definida para o Painel de Clima, incluindo a atribuição à Open-Meteo.
- A exibição deve respeitar as unidades comuns suportadas em produtos meteorológicos: °C, °F, km/h, mph, hPa, inHg, mm, in, km e mi.
- A feature deve cobrir as métricas meteorológicas compatíveis que estiverem presentes no painel atual ou em contratos já previstos para o painel, sem obrigar criação de novos módulos de dados.
- As regras de arredondamento e apresentação devem manter leitura clara e consistente em pt-BR, sem alterar o idioma geral da interface.
- A experiência deve permanecer responsiva em mobile, tablet e desktop.

## Fora do escopo

Esta feature **não** incluirá:

- **Tradução do restante da UI**: apenas unidades e rótulos diretamente necessários ao controle; sem localização completa de textos.
- **Conversão histórica de dados salvos**: não reconverter registros antigos; a alteração afeta somente a exibição atual.
- **Persistência entre sessões**: sem salvar preferência em conta, banco de dados ou perfil de usuário.
- **Unidades científicas ou avançadas**: sem Kelvin, Pascal, nós ou outros modos fora das unidades comuns definidas para esta entrega.
- **Seletor granular por métrica**: sem permitir que temperatura, vento, pressão, precipitação e visibilidade tenham preferências independentes.
- **API pública para terceiros**: sem expor endpoints externos para consumir ou configurar preferência de unidade.
- **Formato de data e hora**: datas, horários e timezone permanecem como definidos no Painel de Clima original.
- **Novos provedores de clima** além do provedor já definido para o painel.
- **Novas funcionalidades meteorológicas autônomas**: mapas, alertas, radares, favoritos, histórico climático ou comparação entre cidades permanecem fora desta feature.

(Nota: riscos técnicos de implementação serão detalhados na Especificação Técnica.)
