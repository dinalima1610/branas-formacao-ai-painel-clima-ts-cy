# API/REST/HTTP

- Use a biblioteca Express para mapear endpoints e tratar requisições e respostas HTTP. Nunca instale bibliotecas diferentes para essa finalidade.

```ts
// Bom
import express from "express";
const app = express();
app.get("/playlists", listPlaylists);
```

- Siga o padrão REST para consultas, mantendo nomes de recursos em inglês e no plural, permitindo navegabilidade em recursos aninhados. Por exemplo: `/playlists/:playlistId/videos` ou `/customers/:customerId/invoices`. Nesses casos, o aninhamento faz sentido porque cada playlist pode ter um conjunto de vídeos e cada cliente pode ter um conjunto de notas fiscais.

```
GET /playlists/:playlistId/videos
GET /customers/:customerId/invoices
```

- Recursos compostos e verbos devem usar kebab-case. Por exemplo: `scheduled-events` ou `process-payment`.

```
GET /scheduled-events
POST /process-payment
```

- Evite criar endpoints com mais de 3 recursos. Nesses casos, prefira chamadas mais diretas. A exceção é quando há regra de segurança atrelada a um conjunto específico de endpoints, por exemplo: `/public` ou `/users/:userId`.

```
// Ruim
GET /channels/:channelId/playlists/:playlistId/videos/:videoId/comments

// Bom
GET /videos/:videoId/comments
```

- Para mutações, NÃO siga o padrão REST estrito. Use combinação de REST para navegar recursos e verbos para representar a ação executada, sempre com POST. Por exemplo: `/users/:userId/change-password` ou `/users/:userId/block`, e NÃO `PUT /users/:userId`.

```ts
// Bom
POST /users/:userId/change-password
POST /users/:userId/block

// Ruim
PUT /users/:userId
```

- O formato do payload de requisição e resposta deve ser sempre JSON, salvo quando outro formato (texto ou XML, por exemplo) for especificado.

- Siga sempre regras de segurança, validando autenticação e autorização. Nunca crie endpoints sem middlewares de segurança. Siga o padrão de navegação dos endpoints existentes e, em dúvida, pergunte antes de implementar.

- Códigos de retorno:

* Retorne 200 em caso de sucesso

* Retorne 404 se o recurso não for encontrado

* Retorne 500 se for erro inesperado

* Retorne 422 se for erro de regra de negócio

* Retorne 400 se a requisição estiver malformada

* Retorne 401 se o usuário não estiver autenticado

* Retorne 403 se o usuário não estiver autorizado

```ts
app.get("/playlists/:id", async (req, res) => {
  const playlist = await findPlaylist(req.params.id);
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });
  return res.status(200).json(playlist);
});
```

- Documente endpoints, métodos e códigos de status de cada um usando OpenAPI.

- Implemente paginação para consultas mais complexas, com base em `limit` e `offset` passados na query string.

```
GET /playlists?limit=10&offset=20
```

- Implemente resposta parcial para consultas que retornam grande volume de dados.

```
GET /playlists?fields=id,name,createdAt
```

* Use a API `fetch` nativa para chamar APIs externas quando necessário (Node.js 18+ e ambientes modernos com `fetch` global). Não adicione cliente HTTP só por conveniência; use `fetch` com `async`/`await`, trate `response.ok` e faça o parse do corpo (`json()`, `text()`, etc.) conforme o contrato da API.

```ts
const response = await fetch("https://api.external.com/data");
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
```
