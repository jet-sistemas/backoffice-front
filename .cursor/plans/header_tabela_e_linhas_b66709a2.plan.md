---
name: Header tabela e linhas
overview: "Padronizar cantos arredondados do cabeçalho/células da tabela, aplicar fundo branco (surface card) ao header do admin com ícone de notificações à direita, e estilizar linhas inativas conforme o frame Pencil `cgcR2` (cores cinza, fundo #FAFAFA, hierarquia de texto)."
todos:
  - id: table-rounding
    content: "Ajustar `table.tsx`: wrapper com cantos + classes first/last th/td para raio consistente"
    status: completed
  - id: admin-header
    content: "`admin-layout.tsx`: `bg-card`, `Bell` à direita com `ml-auto`"
    status: completed
  - id: inactive-rows-sponsor
    content: "`sponsor-list-page.tsx`: classes Pencil/cinza para `!accountActive` + badge/ações"
    status: completed
  - id: inactive-rows-benefit
    content: "`benefit-list-page.tsx`: mesma lógica para `!b.isActive`"
    status: completed
isProject: false
---

# Plano: header administrativo, tabela arredondada e linhas inativas

## Contexto no código

- O header citado está em [`backoffice-front/src/components/layout/admin-layout.tsx`](home/carlos/Documents/codes/work/jet/backoffice-front/src/components/layout/admin-layout.tsx) (linhas ~171–178): `<header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">` dentro de `SidebarInset`.
- Componentes de tabela: [`backoffice-front/src/components/ui/table.tsx`](home/carlos/Documents/codes/work/jet/backoffice-front/src/components/ui/table.tsx) (`Table`, `TableHeader`, `TableHead`, `TableRow`, `TableCell`). As listas usam o padrão `<div className="rounded-lg border bg-card"><Table>…</Table></div>` (ex.: [`sponsor-list-page.tsx`](home/carlos/Documents/codes/work/jet/backoffice-front/src/pages/sponsor/sponsor-list-page.tsx), [`benefit-list-page.tsx`](home/carlos/Documents/codes/work/jet/backoffice-front/src/pages/benefit/benefit-list-page.tsx)).
- Linha inativa em patrocinadores: `user.accountActive === false` na `TableRow` (~423).
- Tokens em [`backoffice-front/src/index.css`](home/carlos/Documents/codes/work/jet/backoffice-front/src/index.css): no tema claro `--card: #fff`; o fundo da página é `--background: #f7f8fa`. Usar **`bg-card`** no header alinha “branco” ao design system sem quebrar o tema escuro (onde card já é a superfície correta).

## 1. Header: fundo claro + ícone de notificação à direita

- Em `admin-layout.tsx`, no `<header>`:
  - Adicionar `bg-card` (equivalente a branco no light; consistente no dark).
  - Manter `border-b` e altura.
  - Importar `Bell` de `lucide-react`.
  - Incluir um `Button` `variant="ghost"` `size="icon"` com `aria-label="Notificações"` (e `sr-only` se preferir), **sem ação** por enquanto, posicionado com **`ml-auto`** no flex do header para ficar no extremo direito (toggle + separador + título à esquerda; ícone à direita).

## 2. Tabela: cantos curvos alinhados (thead vs última linha)

- O problema é típico quando só a “caixa” externa tem `rounded-lg` mas `th`/`td` não compartilham o mesmo raio nos quatro cantos.
- Abordagem recomendada (centralizada em `table.tsx` para todas as tabelas):
  - No **wrapper** do `Table` (`data-slot="table-container"`), além de `overflow-x-auto`, adicionar **`rounded-lg overflow-hidden`** para que o conteúdo respeite o mesmo raio do card pai quando o card também for `rounded-lg` (equivalente visual aos cantos curvos sem depender só do clipping).
  - Complementar com classes nos **primeiros `th` do thead** e **últimos `td` do tbody** para garantir cantos explícitos onde o layout exigir, por exemplo (tailwind arbitrary selectors no container ou no `thead`/`tbody`):
    - Primeira linha do header: `rounded-tl-lg` na primeira célula, `rounded-tr-lg` na última.
    - Última linha do body: `rounded-bl-lg` na primeira célula, `rounded-br-lg` na última.
- Validar no navegador que `border-collapse` padrão não anula o efeito; se necessário, ajustar para `border-separate border-spacing-0` **apenas se** houver regressão visual (mudança mínima).

Arquivos tocados: principalmente [`table.tsx`](home/carlos/Documents/codes/work/jet/backoffice-front/src/components/ui/table.tsx); sem alterar o `rounded-lg` das páginas salvo se o wrapper duplicar raio (evitar dobrar borda — preferir uma única fonte de verdade).

## 3. Linhas inativas: estilo Pencil `cgcR2` (só aparência)

Referência MCP (`batch_get`, node `cgcR2` — frame “Row4”, inativo):

- Fundo da linha: **`#FAFAFA`** (equiv. Tailwind `bg-neutral-50`).
- Borda inferior suave: **`#F3F4F6`** (ex.: `border-b border-neutral-100`).
- Texto principal/secundário em tons **cinza** (`#6B7280`, `#9CA3AF`): mapear para `text-muted-foreground` e variações (`text-muted-foreground/90` na linha inativa).
- Status “desativado” no design: pill com borda **`#D1D5DB`**, texto **`#9CA3AF`**, indicador circular — pode aproximar com `Badge` `variant="outline"` + classes: `rounded-full border-neutral-300 bg-transparent text-neutral-500` e um ponto `size-1.5 rounded-full bg-neutral-400` opcional alinhado ao texto “Inativo”.
- Botões secundários com aparência mais “apagada” no estado inativo (ex.: opacidade no grupo de ações ou no ícone de editar), em linha com o frame (ícone lápis com fundo neutro e opacidade reduzida).

Implementação sugerida:

- Exportar uma **string de classes** reutilizável (ex. `tableRowInactiveClassName`) em um único lugar — ou constante em `table.tsx` exportada — para não duplicar.
- **Patrocinadores**: em `sponsor-list-page.tsx`, na `TableRow`, `className={cn(..., !user.accountActive && tableRowInactiveClassName)}` e ajustar células internas (nome com peso cor, email mais muted) quando inativo.
- **Benefícios** (mesmo padrão “inativo”): em `benefit-list-page.tsx`, quando `!b.isActive`, aplicar a mesma classe na `TableRow` e tons equivalentes, para manter consistência entre telas de lista.

Escopo: **não** alterar dados/API; apenas classes condicionais.

## Ordem de implementação sugerida

1. `table.tsx` (wrapper + cantos + export opcional da classe de linha inativa).
2. `admin-layout.tsx` (header).
3. `sponsor-list-page.tsx` e `benefit-list-page.tsx` (condicionais + badges/ações inativas).

## Verificação

- Checar visualmente listagem de patrocinadores com linhas ativas e inativas e benefícios inativos.
- Confirmar que o header contrasta com `main` (fundo `#f7f8fa` no light) e que o ícone permanece à direita em larguras menores.
