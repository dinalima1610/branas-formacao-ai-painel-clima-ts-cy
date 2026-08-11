# Bugs - Painel de Clima

## BUG-01 - Contraste insuficiente em textos da interface

- **Severidade:** Media
- **Status:** Aberto
- **Evidencia:** `../../qa-curitiba-english-imperial-desktop.png`, `../../qa-loaded-mobile.png`
- **Requisito impactado:** Acessibilidade do PRD, WCAG 2.2 AA
- **Local:** `frontend/src/features/weather/components/language-selector.tsx:43`, `frontend/src/pages/weather-page.tsx:86`, `frontend/src/pages/weather-page.tsx:93`

### Descricao

O estado selecionado do seletor de idioma usa texto branco sobre `#cc785c`, resultando em contraste aproximado de **3.28:1** para texto normal de 14px. A dica da busca usa `#6c6a64` sobre o painel `#efe9de`, com contraste aproximado de **4.48:1**. Ambos ficam abaixo do minimo **4.5:1** exigido para texto normal em WCAG AA/2.2.

### Passos

1. Acessar `http://127.0.0.1:5173`.
2. Observar o seletor de idioma com `Portuguese`/`English` selecionado.
3. Observar o texto auxiliar abaixo do titulo da busca.
4. Calcular contraste das combinacoes de cor.

### Resultado esperado

Todos os textos normais devem atingir contraste minimo de 4.5:1.

### Resultado atual

O texto selecionado no seletor de idioma e a dica de busca nao atingem 4.5:1.
