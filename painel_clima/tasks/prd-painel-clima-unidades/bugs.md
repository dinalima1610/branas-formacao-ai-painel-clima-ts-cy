# Bugs - Painel de Clima - Unidades

## BUG-01 - Contraste insuficiente em textos da interface

- **Severidade:** Media
- **Status:** Aberto
- **Evidencia:** `../../qa-curitiba-english-imperial-desktop.png`, `../../qa-loaded-mobile.png`
- **Requisito impactado:** Acessibilidade do PRD, WCAG 2.2 AA
- **Local:** `frontend/src/features/weather/components/language-selector.tsx:43`, `frontend/src/pages/weather-page.tsx:86`, `frontend/src/pages/weather-page.tsx:93`

### Descricao

O estado selecionado do seletor de idioma usa texto branco sobre `#cc785c`, resultando em contraste aproximado de **3.28:1** para texto normal de 14px. A dica da busca usa `#6c6a64` sobre o painel `#efe9de`, com contraste aproximado de **4.48:1**. Ambos ficam abaixo do minimo **4.5:1** exigido para texto normal em WCAG AA/2.2.

## BUG-02 - `tasks.md` nao reflete implementacao concluida

- **Severidade:** Baixa
- **Status:** Resolvido
- **Evidencia:** `tasks.md`
- **Requisito impactado:** Checklist de QA do `spec-driven/execute_qa.md`

### Descricao

O arquivo `tasks.md` desta feature ainda marca todas as tarefas como pendentes (`[ ]`), apesar de os arquivos de implementacao e testes existirem e os testes passarem. O checklist de QA exige verificar tasks completas antes de aprovar.

## Adendo - Resolucao da pendencia de tasks

Em 2026-05-16, a pendencia documental do `BUG-02` foi corrigida. O arquivo `tasks.md` da feature Painel de Clima - Unidades foi revisado e as tarefas ja implementadas foram marcadas como concluidas (`[x]`). A pendencia de tasks fica encerrada; a falha de contraste do `BUG-01` permanece aberta.
