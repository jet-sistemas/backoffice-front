---
name: Alinhar tabela benefícios
overview: "Testes automatizados primeiro (Vitest/RTL), depois ajustes visuais na tabela de benefícios para espelhar patrocinadores: peso do nome, status Inativo sem bolinha, badge de tier neutro quando inativo."
todos:
  - id: benefit-list-tests
    content: Criar benefit-list-page.test.tsx (mocks + asserções de classes/DOM); rodar e verificar RED
    status: completed
  - id: benefit-name-weight
    content: "Célula Nome: inactive → font-thin text-neutral-600 (remover font-semibold)"
    status: completed
  - id: benefit-inativo-dot
    content: Remover bolinha do span Inativo; só texto como em sponsor-list
    status: completed
  - id: benefit-tier-badge
    content: "Badge tier: cn(inactive && \"opacity-90 bg-neutral-200 text-neutral-500\")"
    status: completed
  - id: benefit-tests-green
    content: Rodar testes e confirmar GREEN após implementação
    status: completed
isProject: false
---

# Alinhar estilos da tabela de benefícios com patrocinadores

## Ordem de trabalho (obrigatória)

1. **Implementar testes primeiro** em [backoffice-front/src/pages/benefit/benefit-list-page.test.tsx](backoffice-front/src/pages/benefit/benefit-list-page.test.tsx) — devem **falhar** (RED) enquanto a página ainda tiver o comportamento antigo.
2. Aplicar as alterações em [backoffice-front/src/pages/benefit/benefit-list-page.tsx](backoffice-front/src/pages/benefit/benefit-list-page.tsx) até os testes passarem (GREEN).
3. Reexecutar `npm test` (ou `npx vitest run`) e checagem visual opcional.

O projeto já usa **Vitest** (jsdom), **@testing-library/react** e **setupTests.ts** com `@testing-library/jest-dom` — seguir o mesmo padrão dos testes em [backoffice-front/src/lib/r2-public-url.test.ts](backoffice-front/src/lib/r2-public-url.test.ts) (import explícito de `vitest`).

## Testes automatizados (funcionalidade entendida)

**Objetivo:** garantir o contrato visual/comportamental da **tabela** alinhado a [backoffice-front/src/pages/sponsor/sponsor-list-page.tsx](backoffice-front/src/pages/sponsor/sponsor-list-page.tsx) para linhas de benefício **inativas** (`!b.isActive`).

### Infra de renderização

- Envolver `BenefitListPage` em `QueryClientProvider` com `QueryClient` configurado com `retry: false` em queries e mutations (evita flakiness).
- `vi.mock('@/hooks/use-benefit-list-query')` retornando dados controlados: pelo menos um benefício **inativo** com `sponsor` (ex.: tier `BRONZE`, `isActive: true`) para exercitar a coluna Patrocinador + badge de tier; opcionalmente um benefício ativo para regressão.
- Fazer `vi.mock` de `useCreateBenefitMutation`, `useUpdateBenefitMutation` e `useDeactivateBenefitMutation` com objetos `{ mutate: vi.fn(), isPending: false, ... }` mínimos.
- `vi.mock('@/components/active-sponsor-select')` com um componente mínimo (ex.: `() => null` ou select fake) para não depender de `useActiveSponsorOptionsPaginatedQuery` nem de rede.

### Casos a cobrir

1. **Nome em benefício inativo** — célula do nome (`TableCell` do primeiro dado) **não** deve usar `font-semibold` para realçar; deve alinhar ao patrocinador: `font-thin` e `text-neutral-600` quando inativo, mantendo `font-medium` no estado ativo (teste de regressão: benefício ativo continua com `font-medium` e sem `font-thin` no nome, se fizer sentido com a implementação final).

2. **Status "Inativo"** — no ramo inativo, não deve existir elemento decorativo de “bolinha” (ex.: `span` com classes tipo `size-1.5` + `rounded-full` usadas para o ponto) dentro da célula de estado; o texto "Inativo" continua acessível.

3. **Badge de tier (coluna Patrocinador)** — quando o **benefício** está inativo, o `Badge` do tier do patrocinador deve incluir as classes de neutralização `bg-neutral-200` e `text-neutral-500` (e `opacity-90` alinhado ao sponsor), de forma que o `className` efetivo reflita o estado inativo da linha.

**Execução:** `npm test -- --run src/pages/benefit/benefit-list-page.test.tsx` (ou caminho equivalente).

---

## Referência (patrocinadores)

Em [backoffice-front/src/pages/sponsor/sponsor-list-page.tsx](backoffice-front/src/pages/sponsor/sponsor-list-page.tsx):

- **Nome:** `font-medium`; se inativo, `font-thin text-neutral-600`.
- **Inativo:** bolinha comentada; só o texto no pill.
- **Tier:** `cn(inactive && "opacity-90 bg-neutral-200 text-neutral-500")`.

## Alterações na página (após testes RED)

Arquivo: [backoffice-front/src/pages/benefit/benefit-list-page.tsx](backoffice-front/src/pages/benefit/benefit-list-page.tsx)

1. **Célula "Nome":** trocar `inactive && "font-semibold text-neutral-600"` por `inactive && "font-thin text-neutral-600"`.

2. **Estado inativo:** remover o `span` da bolinha (`size-1.5` / `rounded-full`); manter o pill com "Inativo" como no sponsor.

3. **Badge de tier na coluna Patrocinador:** `className={cn(inactive && "opacity-90 bg-neutral-200 text-neutral-500")}` além da variante existente.

`tableRowInactiveClassName` em [backoffice-front/src/components/ui/table.tsx](backoffice-front/src/components/ui/table.tsx) segue compartilhado; sem mudança necessária.

## Verificação manual (opcional)

- `/admin/beneficios` com itens inativos vs `/admin/patrocinadores`.
