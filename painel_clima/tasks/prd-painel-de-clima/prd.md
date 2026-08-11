# Documento de Requisitos do Produto (PRD)

## Visão Geral

O Painel de Clima é uma funcionalidade que permite ao usuário consultar de forma rápida e direta as condições climáticas atuais e a previsão dos próximos dias para qualquer cidade. O usuário informa a cidade desejada (via busca textual ou, opcionalmente, deixando o navegador sugerir a localização atual) e o painel apresenta um resumo claro do clima.

A funcionalidade resolve a fricção de abrir aplicativos externos para uma consulta simples de clima, oferecendo a informação dentro do próprio produto. É direcionada a qualquer usuário final do produto que precise tomar decisões de curto prazo influenciadas pelo tempo (deslocamento, vestuário, atividades). O valor é entregar uma resposta clara em poucos segundos, com dados confiáveis vindos de uma fonte pública (Open-Meteo) consumida exclusivamente pelo backend do produto.

## Objetivos

- **Resposta imediata**: usuário consegue ver o clima atual de uma cidade em até **3 segundos** após confirmar a busca, em condições normais de rede.
- **Clareza**: usuário compreende as condições atuais sem precisar interpretar códigos numéricos brutos (ex.: traduzir "weathercode" em "ensolarado").
- **Sucesso de busca**: ≥ **95%** das buscas por nome de cidade reconhecida retornam um resultado válido.
- **Adoção**: ≥ **30%** dos usuários ativos do produto utilizam o painel ao menos uma vez nos primeiros 30 dias após o lançamento.
- **Confiabilidade**: taxa de erro do endpoint backend ≤ **1%** das requisições, excluídos erros do provedor externo.

## Histórias de Usuário

- Como **visitante do produto**, quero **digitar o nome de uma cidade e ver o clima atual** para que **eu decida rapidamente como me preparar para o dia**.
- Como **visitante do produto**, quero **permitir que o navegador sugira minha cidade automaticamente** para que **eu evite digitação quando estou no meu local habitual**.
- Como **visitante do produto**, quero **ver temperatura, sensação térmica, condição (sol/chuva/nublado), vento e umidade** para que **eu tenha um panorama completo das condições atuais**.
- Como **visitante do produto**, quero **ver a previsão dos próximos dias com mínima e máxima** para que **eu planeje atividades ao longo da semana**.
- Como **visitante do produto**, quero **receber uma mensagem clara quando a cidade não for encontrada ou o serviço estiver indisponível** para que **eu saiba o que fazer em seguida**.
- Como **visitante do produto**, quero **negar a permissão de geolocalização** e **ainda assim usar a busca normalmente** para que **minha privacidade seja respeitada**.

## Principais funcionalidades

### 1. Busca de cidade

- **O quê**: campo de busca textual onde o usuário digita o nome de uma cidade e seleciona um resultado.
- **Por quê**: é o caminho universal de entrada — funciona para qualquer usuário, com ou sem geolocalização.
- **Como em alto nível**: a entrada do usuário é resolvida em coordenadas geográficas e nome canônico da cidade pelo backend.

**Requisitos funcionais:**

- **RF-01** O sistema deve permitir que o usuário digite ao menos 2 caracteres para iniciar uma busca.
- **RF-02** O sistema deve apresentar uma lista de cidades correspondentes com nome, região/estado e país para desambiguar homônimos.
- **RF-03** O sistema deve permitir que o usuário selecione uma cidade da lista para carregar o clima.
- **RF-04** O sistema deve exibir mensagem clara quando nenhuma cidade for encontrada para o termo digitado.

### 2. Sugestão por geolocalização (opcional)

- **O quê**: ação que utiliza a API de geolocalização do navegador para sugerir a cidade do usuário.
- **Por quê**: reduz o atrito para o caso mais comum (usuário consultando o clima de onde está).
- **Como em alto nível**: o frontend solicita permissão; se concedida, envia coordenadas para o backend que retorna a cidade correspondente e o clima.

**Requisitos funcionais:**

- **RF-05** O sistema deve oferecer um controle visível para "usar minha localização".
- **RF-06** O sistema deve solicitar permissão ao navegador apenas mediante ação explícita do usuário.
- **RF-07** O sistema deve continuar plenamente utilizável via busca textual caso a permissão seja negada, indisponível ou expire.
- **RF-08** O sistema deve informar o usuário quando a geolocalização falhar e orientar para a busca textual.

### 3. Exibição do clima atual

- **O quê**: bloco principal com as condições do momento para a cidade selecionada.
- **Por quê**: é a entrega central do valor da feature — resposta direta à pergunta "como está o tempo?".

**Requisitos funcionais:**

- **RF-09** O sistema deve exibir o **nome da cidade** (e região/país) referente ao resultado.
- **RF-10** O sistema deve exibir a **temperatura atual** em graus Celsius.
- **RF-11** O sistema deve exibir a **sensação térmica** em graus Celsius.
- **RF-12** O sistema deve exibir a **condição climática** em texto legível (ex.: "Ensolarado", "Parcialmente nublado", "Chuva fraca") e um ícone correspondente.
- **RF-13** O sistema deve exibir a **velocidade do vento** com unidade (km/h) e a **umidade relativa** em percentual.
- **RF-14** O sistema deve exibir o **horário de referência** dos dados (timestamp local da última atualização).

### 4. Previsão para os próximos dias

- **O quê**: lista resumida da previsão diária para os próximos dias.
- **Por quê**: complementa o "agora" com contexto de planejamento de curto prazo.

**Requisitos funcionais:**

- **RF-15** O sistema deve exibir previsão para os próximos **7 dias**, incluindo o dia atual.
- **RF-16** Cada item da previsão deve apresentar **data**, **temperatura mínima**, **temperatura máxima** e **ícone/condição** representativos do dia.

### 5. Estados e tratamento de erros

**Requisitos funcionais:**

- **RF-17** O sistema deve apresentar um **estado de carregamento** enquanto os dados são buscados.
- **RF-18** O sistema deve apresentar uma **mensagem amigável** quando o serviço externo estiver indisponível, com opção de "tentar novamente".
- **RF-19** O sistema deve apresentar um **estado vazio** orientando o usuário a buscar uma cidade ao acessar o painel pela primeira vez.

## Experiência do usuário

**Personas e interações principais:**

- **Usuário casual**: acessa o painel, digita a cidade, vê o resultado e sai. Fluxo deve ser concluído em poucos cliques.
- **Usuário habitual**: usa "minha localização" para já ver o clima da sua cidade ao chegar no painel.

**Jornada principal:**

1. Usuário abre o painel → vê estado vazio com convite à busca e ao uso da localização.
2. Usuário digita a cidade ou aciona "usar minha localização".
3. Sistema apresenta resultado(s); usuário confirma a cidade quando aplicável.
4. Painel exibe **clima atual** em destaque e **previsão dos próximos dias** logo abaixo.
5. Usuário pode fazer uma nova busca a qualquer momento.

**Considerações de UI/UX:**

- Hierarquia visual clara: clima atual em destaque; previsão como apoio.
- Ícones consistentes para condições climáticas, sempre acompanhados de texto.
- Layout responsivo (mobile, tablet, desktop) seguindo o `DESIGN.md` do projeto.
- Microcopys diretos e em português.

**Acessibilidade:**

- Contraste mínimo conforme **WCAG 2.1 AA**.
- Toda informação transmitida por ícone deve ter equivalente textual (sem dependência exclusiva de cor/imagem).
- Navegação completa via teclado (busca, seleção de resultados, ação de geolocalização).
- Rótulos ARIA apropriados em campo de busca, lista de resultados e estados de carregamento/erro.
- Suporte a leitores de tela anunciando atualização do clima exibido.

## Restrições técnicas de alto nível

- **Fonte de dados obrigatória**: Open-Meteo — Geocoding API (`https://geocoding-api.open-meteo.com/v1/search`) e Forecast API (`https://api.open-meteo.com/v1/forecast`). Sem uso de outro provedor nesta versão.
- **Sem chaves de API**: Open-Meteo é gratuita e não exige autenticação; nenhuma credencial deve ser exposta ao frontend.
- **Frontend não chama Open-Meteo diretamente**: toda comunicação com o provedor externo passa **exclusivamente pelo backend** existente, que expõe um endpoint próprio para o frontend.
- **Privacidade**: coordenadas de geolocalização do usuário não devem ser persistidas; podem ser usadas apenas em tempo de requisição.
- **Desempenho**: tempo de resposta P95 do endpoint backend ≤ **1,5 s** em condições normais; resposta total percebida pelo usuário ≤ **3 s**.
- **Resiliência**: falhas do provedor externo devem ser tratadas com mensagem clara ao usuário (sem crash da página).
- **Conformidade**: respeitar os termos de uso e atribuição da Open-Meteo conforme exigido pela fonte.
- **Internacionalização inicial**: textos em **português (Brasil)**; unidades métricas (°C, km/h).

Os detalhes de implementação (formato exato do endpoint, caching, bibliotecas, layout final) serão tratados na Especificação Técnica.

## Fora do escopo

Esta primeira versão **não** incluirá:

- **Autenticação de usuário e cidades favoritas**: sem login, sem persistência de cidades preferidas por usuário.
- **Alertas e notificações**: sem push, e-mail ou avisos de condições climáticas extremas.
- **Dados históricos**: sem consulta a clima passado; apenas condições atuais e previsão futura via Open-Meteo.
- **Mapas e radares visuais**: sem mapas interativos, camadas de radar ou sobreposições geográficas.
- **Comparação simultânea entre múltiplas cidades** em um único painel.
- **Personalização de unidades** (ex.: alternar °C/°F, km/h/mph) — fica como consideração futura.
- **Outros provedores de clima** além do Open-Meteo.

(Nota: riscos técnicos de implementação serão detalhados na Especificação Técnica.)
