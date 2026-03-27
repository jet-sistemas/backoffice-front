---
name: Select patrocinadores UI
overview: Enriquecer a listagem do `ActiveSponsorSelect` com indicador visual de ativo/inativo (tooltip) e badge de tier (ouro/prata/bronze), alinhado ao padrão já usado na tabela de benefícios. Isso implica alargar o tipo de opção no hook e passar a incluir patrocinadores inativos na paginação (hoje são filtrados).
todos:
  - id: extend-hook
    content: Enriquecer ActiveSponsorOption (tier, isActive), remover filtro só-ativo, ajustar queryKey
    status: completed
  - id: fallback-props
    content: Atualizar fallbackOption + benefit-list-page com campos do SponsorMinDTO
    status: completed
  - id: select-ui
    content: Renderizar bolinha + Tooltip + Badge por opção no ActiveSponsorSelect
    status: completed
isProject: false
---

# Melhorias visuais no select de patrocinadores

## Contexto

- O combobox está em `[src/components/active-sponsor-select.tsx](src/components/active-sponsor-select.tsx)`: cada opção é um `SelectItem` que hoje só renderiza `s.publicName`.
- Os dados vêm de `[src/hooks/use-active-sponsor-options-paginated-query.ts](src/hooks/use-active-sponsor-options-paginated-query.ts)`. O mapper **descarta** entradas com `!s.isActive` (linha 20), logo **não há patrocinadores inativos na lista** — só aparecem via `fallbackOption` na edição em `[src/pages/benefit/benefit-list-page.tsx](src/pages/benefit/benefit-list-page.tsx)`.
- Já existem variantes de `Badge` para tiers em `[src/components/ui/badge.tsx](src/components/ui/badge.tsx)` (`gold`, `silver`, `bronze`) e o mesmo padrão de labels/variantes na página de benefícios (`[TIER_LABELS` / `TIER_BADGE_VARIANT](src/pages/benefit/benefit-list-page.tsx)` ~linhas 74–87).

## Alterações propostas

### 1. Hook: tipo e dados por opção

- Estender `ActiveSponsorOption` com `tier: SponsorTierEnum` e `isActive: boolean` (import de `[src/types/user.ts](src/types/user.ts)`).
- Em `mapPageToActiveSponsors`, **deixar de filtrar** por `isActive` e continuar a deduplicar por `s.id` (mantém uma linha por patrocinador). Se o mesmo `id` aparecer em mais de uma linha da API, usar valores já coerentes do objeto `sponsor`.
- Atualizar a chave de query (ex.: trocar o segmento `"active-paginated"` por algo como `"paginated"`) para **não reutilizar cache** que só tinha ativos.

### 2. Props do select: `fallbackOption` alinhado ao benefício

- Alargar `fallbackOption` em `[active-sponsor-select.tsx](src/components/active-sponsor-select.tsx)` para incluir `tier` e `isActive` (equivale a estender o objeto atual com os campos já presentes em `[SponsorMinDTO](src/types/benefit.ts)`).
- Em `[benefit-list-page.tsx](src/pages/benefit/benefit-list-page.tsx)`, passar `editing.sponsor` completo no `fallbackOption` (ou pelo menos `id`, `publicName`, `tier`, `isActive`).

### 3. UI: bolinha + tooltip + medalha

- Dentro de cada `SelectItem` (exceto a opção “sem patrocinador”), renderizar um único bloco flexível como filho de `SelectItem` (o componente já encapsula em `ItemText` em `[select.tsx](src/components/ui/select.tsx)`):
  - **Bolinha**: `span` redondo (`size-2` ou similar), `bg-green-600` se `isActive`, `bg-red-600` caso contrário, com `shrink-0`.
  - **Tooltip** “Ativo” / “Inativo”: envolver a bolinha com `[Tooltip](src/components/ui/tooltip.tsx)` + `TooltipTrigger` + `TooltipContent` (texto em português como pedido). Garantir `TooltipProvider` no componente ou confirmar que o layout atual já envolve a página (há provider no `[sidebar.tsx](src/components/ui/sidebar.tsx)` — se a página de benefícios usar esse layout, pode bastar; caso contrário, um `TooltipProvider` local no `ActiveSponsorSelect` evita dependência do layout).
  - **Nome**: `publicName` com truncagem se necessário (`min-w-0`, `truncate`) para não estourar a largura do popper.
  - **Medalha**: `[Badge](src/components/ui/badge.tsx)` com `variant` `gold` | `silver` | `bronze` e texto `Ouro` / `Prata` / `Bronze` (reutilizar o mesmo mapa de labels/variantes que na lista de benefícios, ou um mini mapa local no ficheiro do select para não aumentar o acoplamento à página).

### 4. Acessibilidade

- No trigger do tooltip da bolinha, usar `aria-label` adequado (ex.: “Patrocinador ativo” / “Patrocinador inativo”) para não depender só do hover.
- Manter o `SelectItem` com `value` numérico como hoje; não alterar o contrato de `onChange`.

## Ficheiros principais

| Ficheiro                                                                                                   | Mudança                                                                   |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `[use-active-sponsor-options-paginated-query.ts](src/hooks/use-active-sponsor-options-paginated-query.ts)` | Tipo enriquecido, mapper sem filtro só-ativo, queryKey ajustada           |
| `[active-sponsor-select.tsx](src/components/active-sponsor-select.tsx)`                                    | Render da linha (bolinha + tooltip + nome + badge), tipo `fallbackOption` |
| `[benefit-list-page.tsx](src/pages/benefit/benefit-list-page.tsx)`                                         | `fallbackOption` com `tier` e `isActive`                                  |

## Nota de produto

Incluir inativos na lista permite associar visualmente tiers e estado; se à posteriori quiserem **impedir** escolher inativos em _novos_ benefícios mas mantê-los na edição, isso seria uma regra extra (não pedida agora).
