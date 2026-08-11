# Bugfix - BUG-01 - Contraste insuficiente em textos da interface

Data: 2026-08-10

## Status

Corrige BUG-01.

## Arquivos alterados

- `frontend/src/features/weather/components/language-selector.tsx`
- `frontend/src/features/weather/components/search-box.tsx`
- `frontend/src/features/weather/components/unit-system-toggle.tsx`
- `frontend/src/features/weather/components/weather-state-boundary.tsx`
- `frontend/src/pages/weather-page.tsx`
- `frontend/src/index.css`

## Correção

- O seletor de idioma selecionado passou a usar `#a9583e` com texto branco, em vez de `#cc785c`.
- A dica de busca e textos auxiliares relacionados passaram a usar `#5f5b54`, em vez de `#6c6a64` nos pontos que ficavam sobre painel creme.
- O botão pequeno de retry passou a usar `#a9583e` para evitar a mesma combinação reprovada de texto branco sobre coral claro.
- O token `--primary` foi escurecido para manter consistência com a correção.

## Verificação

Contraste calculado em:

- `../../../docs/evidencias/qa/BUG-01-contrast-check.json`
- `../../../docs/evidencias/qa/BUG-01-contrast-fix.md`

Principais resultados:

- Seletor de idioma selecionado: `5.06:1` PASS.
- Dica de busca: `5.59:1` PASS.
- Placeholder/status de busca: `6.41:1` PASS.

Testes:

```bash
npm test --prefix painel_clima/frontend -- --run
```

Resultado: PASS, 16 arquivos / 47 testes.

## Observação

O arquivo original `bugs.md` e o relatório original `qa-report.md` foram preservados como evidências históricas da reprovação.
