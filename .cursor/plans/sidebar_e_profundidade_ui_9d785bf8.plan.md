---
name: Sidebar e profundidade UI
overview: "Ajustar tokens de tema e componentes do sidebar para: fundo branco na barra lateral, área principal `#F7F8FA`, divisor visível entre header e conteúdo, e estados hover/active em azul claro conforme o `jet-design.pen` (nós RWsdX, eNiGt, VnGQe, 87fvr)."
todos:
  - id: tokens-index-css
    content: "Atualizar :root em index.css: --background #F7F8FA, --sidebar #fff, --sidebar-accent #EEF2FF, --sidebar-accent-foreground #050469, --sidebar-border contraste; revisar .dark mínimo"
    status: completed
  - id: divider-admin-layout
    content: Ajustar Separator entre SidebarHeader e SidebarContent em admin-layout.tsx (largura total, sem mx-2 que encurta a linha)
    status: completed
  - id: sidebar-menu-styles
    content: Ajustar sidebarMenuButtonVariants + SidebarGroupLabel em sidebar.tsx para cores/peso do Pencil; corrigir shadow outline com var() em vez de hsl()
    status: completed
  - id: verify-ui
    content: Verificar visualmente hover/active, footer e contraste do divisor; rodar lint nos arquivos alterados
    status: completed
isProject: false
---

# Plano: sidebar branca, canvas `#F7F8FA`, hover azul e divisor correto

## Contexto técnico

- O **tom “laranja/pêssego”** no hover e no avatar do rodapé vem de [`src/index.css`](file:///home/carlos/Documents/codes/work/jet/backoffice-front/src/index.css): em `:root`, `--sidebar-accent: oklch(0.95 0.02 50)` (matiz ~50 = amarelo/laranja). Os botões do menu usam `hover:bg-sidebar-accent` / `data-[active=true]:bg-sidebar-accent` em [`src/components/ui/sidebar.tsx`](file:///home/carlos/Documents/codes/work/jet/backoffice-front/src/components/ui/sidebar.tsx) (`sidebarMenuButtonVariants`).
- A **área principal** (`SidebarInset`) já usa `bg-background` — trocar `--background` para `#F7F8FA` aplica o “tom de profundidade” em todo o inset (header + `<main>`), mantendo **cards/overlays brancos** via `--card` / `--popover` que continuam `#fff`.
- O **sidebar** usa `bg-sidebar`; hoje é quase branco (`oklch(0.98 0 0)`). Para bater com o pedido, passar a **`#ffffff`** explícito.
- O **referencial Pencil** (nós lidos via MCP) define:
  - Item ativo: fundo **`#EEF2FF`**, ícone/texto **`#050469`**, texto com peso maior.
  - Itens inativos: **`#6B7280`**.
  - Rótulo “GESTÃO”: **`#9CA3AF`**, tipografia compacta e forte.

## Alterações propostas

### 1. Tokens globais em [`src/index.css`](file:///home/carlos/Documents/codes/work/jet/backoffice-front/src/index.css) (`:root`)

- `--background: #F7F8FA` — canvas padrão (profundidade).
- Manter `--card` e `--popover` em `#fff` (cards e overlays brancos, como combinado).
- `--sidebar: #ffffff` — sidebar explicitamente branca.
- `--sidebar-accent: #EEF2FF` — hover/active alinhado ao Pencil (substitui o oklch com matiz laranja).
- `--sidebar-accent-foreground: #050469` — texto/ícone no estado destacado (já é a cor primária do produto).
- `--sidebar-border: #E5E7EB` (ou equivalente) — **contraste suficiente** para a linha entre header e conteúdo sobre fundo branco (hoje `oklch(0.9 0 0)` quase some).

Revisar `.dark` apenas para **consistência** (não misturar laranja no accent claro, se ainda houver); ajuste mínimo se algum token claro vazar no tema escuro.

### 2. Divisor entre `SidebarHeader` e `SidebarContent`

Arquivo: [`src/components/layout/admin-layout.tsx`](file:///home/carlos/Documents/codes/work/jet/backoffice-front/src/components/layout/admin-layout.tsx).

Hoje: `<Separator className="mx-2 w-auto bg-sidebar-border" />`.

Problemas típicos: `mx-2` deixa a linha **mais curta** que a área útil; com borda muito clara a linha **some**.

Ação: trocar para um separador **largura total do painel** (sem indentação horizontal), mantendo `h-px` do componente [`src/components/ui/separator.tsx`](file:///home/carlos/Documents/codes/work/jet/backoffice-front/src/components/ui/separator.tsx), e usar `bg-sidebar-border` (ou `bg-border`, coerente com o token ajustado). Ex.: classes do tipo `mx-0 w-full shrink-0 bg-sidebar-border` (ajustar fino após ver no browser).

### 3. Estilo dos itens de menu vs. Pencil

Arquivo: [`src/components/ui/sidebar.tsx`](file:///home/carlos/Documents/codes/work/jet/backoffice-front/src/components/ui/sidebar.tsx).

- Em `sidebarMenuButtonVariants` (string base do `cva`):
  - Estado **repouso**: `text-muted-foreground` (próximo de `#6B7280`; se precisar bater exato ao pixel, usar `text-[#6B7280]`).
  - **Hover / active**: `hover:text-sidebar-accent-foreground` e manter `data-[active=true]:text-sidebar-accent-foreground`.
  - **Peso ativo**: trocar `data-[active=true]:font-medium` para `data-[active=true]:font-semibold` (equivalente ao 600 do Pencil).

- `SidebarGroupLabel`: aproximar do frame `RWsdX` — por exemplo `text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]` (ou token dedicado em `:root` se preferir evitar hex espalhado).

### 4. Corrigir sombra do variant `outline` (regressão com cores não-HSL)

No mesmo `sidebar.tsx`, o variant `outline` usa `shadow-[0_0_0_1px_hsl(var(--sidebar-border))]` e `hsl(var(--sidebar-accent))`. Com tokens em **hex/oklch**, isso pode quebrar.

Substituir por algo que aceite qualquer cor CSS, por exemplo `shadow-[0_0_0_1px_var(--sidebar-border)]` e `hover:shadow-[0_0_0_1px_var(--sidebar-accent)]`.

### 5. Limpeza opcional (baixa prioridade)

- [`src/pages/login-page.tsx`](file:///home/carlos/Documents/codes/work/jet/backoffice-front/src/pages/login-page.tsx): se `--background` global for `#F7F8FA`, a `main` pode usar `bg-background` em vez de `bg-[#F7F8FA]` para uma única fonte de verdade.

## Verificação

- Abrir layout admin: sidebar **branca**, linha entre logo e “Gestão” **visível e alinhada**.
- Hover e rota ativa: fundo **azul clarinho** (`#EEF2FF`), sem laranja; avatar no footer com o mesmo accent (azul).
- Conteúdo principal: fundo **`#F7F8FA`**; cards (ex.: listagens com `bg-card`) permanecem **brancos**.
