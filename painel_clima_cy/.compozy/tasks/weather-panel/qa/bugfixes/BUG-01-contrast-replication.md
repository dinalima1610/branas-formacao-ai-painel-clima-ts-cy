# Bugfix - BUG-01 - Replicação da correção de contraste

Data: 2026-08-10

## Status

Replica a correção de BUG-01 no projeto `painel_clima_cy`.

## Contexto

O BUG-01 foi registrado no projeto `painel_clima` como contraste insuficiente em textos pequenos da interface. Embora os bugs formalmente registrados neste diretório sejam `BUG-001` e `BUG-002`, esta correção foi aplicada também no `painel_clima_cy` por paridade visual e para evitar regressão equivalente na paleta compartilhada.

## Arquivo alterado

- `frontend/src/index.css`

## Correção

- `--primary`: de `15 52% 58%` para `15 46% 45%`.
- `--ring`: de `15 52% 58%` para `15 46% 45%`.
- `--muted-foreground`: de `45 4% 41%` para `45 6% 35%`.
- `--body`: de `60 3% 23%` para `60 3% 20%`.

## Verificação

Contraste calculado em:

- `../../../../../../docs/evidencias/qa/BUG-01-contrast-check.json`
- `../../../../../../docs/evidencias/qa/BUG-01-contrast-fix.md`

Principais resultados:

- Texto `primary` pequeno sobre canvas: `4.83:1` PASS.
- Botão primary com texto branco: `5.08:1` PASS.
- Texto muted sobre surface soft: `5.94:1` PASS.

Testes:

```bash
npm test --prefix painel_clima_cy/frontend -- --run
```

Resultado: PASS, 6 arquivos / 27 testes, com coverage executado pelo script do projeto.

## Observação

Nenhum arquivo original de bug ou evidência foi sobrescrito. Este arquivo registra a replicação da correção de BUG-01 no projeto `painel_clima_cy`.
