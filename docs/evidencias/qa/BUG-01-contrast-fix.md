# BUG-01 - Correção de Contraste WCAG AA

Data: 2026-08-10

## Escopo

Corrige BUG-01: contraste insuficiente em textos pequenos da interface.

Projetos alterados:

- `painel_clima`
- `painel_clima_cy`

## Alterações

- `painel_clima`: o estado selecionado do seletor de idioma passou de fundo `#cc785c` para `#a9583e` com texto branco.
- `painel_clima`: a dica de busca, placeholder e mensagens auxiliares relacionadas à busca passaram de `#6c6a64` para `#5f5b54`.
- `painel_clima`: controles de foco e ícones relacionados à busca/localização passaram a usar o coral escurecido `#a9583e`.
- `painel_clima`: botão pequeno de retry passou de `#cc785c` para `#a9583e`.
- `painel_clima_cy`: tokens globais `--primary` e `--ring` foram escurecidos de `15 52% 58%` para `15 46% 45%`.
- `painel_clima_cy`: tokens globais `--muted-foreground` e `--body` foram levemente escurecidos para textos auxiliares pequenos.

## Evidência de Contraste

Checker usado:

```bash
node docs/evidencias/qa/contrast-checker.mjs
```

Resultado salvo em:

- `docs/evidencias/qa/BUG-01-contrast-check.json`

Combinações principais:

| Caso | Antes | Depois |
|---|---:|---:|
| Texto branco sobre coral do seletor de idioma | 3.28:1 FAIL | 5.06:1 PASS |
| Dica de busca sobre painel creme | 4.48:1 FAIL | 5.59:1 PASS |
| Placeholder/status de busca sobre canvas | N/A | 6.41:1 PASS |
| `painel_clima_cy` texto `primary` pequeno sobre canvas | N/A | 4.83:1 PASS |
| `painel_clima_cy` botão primary com texto branco | N/A | 5.08:1 PASS |
| `painel_clima_cy` texto muted sobre surface soft | N/A | 5.94:1 PASS |

## Testes

```bash
npm test --prefix painel_clima/frontend -- --run
npm test --prefix painel_clima_cy/frontend -- --run
```

Resultado:

- `painel_clima/frontend`: 16 arquivos / 47 testes PASS.
- `painel_clima_cy/frontend`: 6 arquivos / 27 testes PASS, coverage executado pelo script do projeto.

## Observação

Os arquivos originais de bugs e relatórios de QA não foram sobrescritos. Este arquivo registra a correção de BUG-01 como nova evidência.
