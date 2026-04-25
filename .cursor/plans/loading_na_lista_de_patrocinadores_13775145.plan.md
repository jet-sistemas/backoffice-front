---
name: Loading na lista de patrocinadores
overview: "Com a busca já server-side (parâmetro `search` + debounce), completar a UI com estado de carregamento coerente: `isFetching`/`isLoading`, opcionalmente o intervalo até o debounce assentar, indicador no card, campos desabilitados, Limpar tudo só quando aplicável e fora da consulta, tabela com contraste reduzido e bloqueio de ações, paginação desabilitada via `ListPaginationBar`."
todos:
  - id: extend-pagination
    content: Adicionar prop `disabled` em ListPaginationBar e aplicar em botões/nav
    status: completed
  - id: sponsor-list-busy
    content: "SponsorListPage: listQueryBusy (fetch + opcional searchSettling), indicador, disabled nos controles, Limpar tudo condicional, wrapper na tabela, paginação disabled; copiar textos de ajuda se ainda falarem em filtro só local"
    status: completed
isProject: false
---

# Feedback visual durante carregamento da lista de patrocinadores

## Contexto atual (pós busca na API)

- A listagem de patrocinadores já usa **busca no servidor**: [`SponsorListPage`](backoffice-front/src/pages/sponsor/sponsor-list-page.tsx) envia `search: searchQuery` para [`useUserListQuery`](backoffice-front/src/hooks/use-user-list-query.ts) (chave `['users', params]` inclui o texto), com [`useDebouncedValue`](backoffice-front/src/hooks/use-debounced-value.ts) (ex.: 500ms) e **sem filtro local** — os dados exibidos vêm direto de `data` (`sponsors` mapeados da resposta).
- Backend: parâmetro `search` na listagem (ver plano concluído [busca_patrocinadores_servidor_41c10095.plan.md](busca_patrocinadores_servidor_41c10095.plan.md) / `UserRepository`, `ListUsersQueryDTO`, etc.).
- [`useUserListQuery`](backoffice-front/src/hooks/use-user-list-query.ts) mantém `placeholderData: keepPreviousData`: após o primeiro sucesso, mudanças de **filtros, busca (após debounce), página** disparam refetch com **`isFetching === true`** e **`isLoading === false`**, mantendo dados anteriores na tela. **Ainda falta** tratamento visual sistemático desse refetch (e, se desejado, do período **entre digitação e fim do debounce**, onde ainda não há `isFetching`).

## Comportamento desejado (implementação UI)

1. **Estado “lista ocupada”**  
   - Base: `listQueryBusy = isLoading || isFetching`.  
   - **Recomendado** alinhar à UX da busca com debounce:  
     `searchSettling = searchTerm.trim() !== debouncedSearch.trim()`  
     (utilizador alterou o campo e o valor ainda não foi aplicado à query).  
     Então: **`listQueryBusy = isLoading || isFetching || searchSettling`**.  
   - Assim, o indicador de carregamento e o bloqueio cobrem **digitação na busca**, **refetch** e **carga inicial**.

2. **Card “Filtrar e buscar”**  
   - À direita do cabeçalho: quando `listQueryBusy`, mostrar **“Buscando resultados…”** (ou “Aplicando filtros…” se quiserem diferenciar só `searchSettling` — opcional) + `Loader2` com `animate-spin` (padrão em [`sponsor-edit-page.tsx`](backoffice-front/src/pages/sponsor/sponsor-edit-page.tsx)).  
   - **Botão “Limpar tudo”**: **ocultar** enquanto `listQueryBusy`. Mostrar só quando há filtros/busca ativos **e** `!listQueryBusy`, alinhado ao código atual:  
     `(hasActiveServerFilters || hasActiveSearch) && !listQueryBusy`,  
     com `hasActiveSearch` coerente com `searchTerm` / `debouncedSearch` (já existe variante na página).  
   - **`disabled={listQueryBusy}`** em: input de busca, todos os `Select`, e botão “Tentar novamente” na UI de erro, se aplicável.  
   - **Textos de ajuda** no card: se ainda mencionarem “filtro só na página carregada” ou “campo de texto oculta linhas localmente”, **atualizar** para refletir busca no servidor e paginação coerente com o termo.

3. **Tabela**  
   - Lista renderizada a partir de `sponsors` (resposta da API), condições `!isLoading && !isError && sponsors.length > 0`.  
   - Wrapper com `relative`; quando **`!isLoading && listQueryBusy`** (refetch com placeholder e/ou `searchSettling`): `opacity-50`–`opacity-60` + **`pointer-events-none`** para bloquear ações e links.  
   - `aria-busy={listQueryBusy}` no wrapper quando a tabela estiver visível.

4. **Paginação**  
   - Estender [`ListPaginationBar`](backoffice-front/src/components/list-pagination-bar.tsx) com **`disabled?: boolean`**.  
   - `disabled={listQueryBusy}` em `SponsorListPage`.

5. **Escopo**  
   - [`sponsor-list-page.tsx`](backoffice-front/src/pages/sponsor/sponsor-list-page.tsx) + [`list-pagination-bar.tsx`](backoffice-front/src/components/list-pagination-bar.tsx).  
   - [`benefit-list-page.tsx`](backoffice-front/src/pages/benefit/benefit-list-page.tsx): sem mudança obrigatória (prop opcional).

## Relação com a busca na API

- Qualquer alteração que mude `UserListParams` (incluindo `search` após o debounce) já dispara nova consulta → **`isFetching`**.  
- O estado de loading na UI deve tratar isso **igual** aos outros filtros.  
- O **debounce** é a única diferença: sem `searchSettling`, há um atraso sem `isFetching`; incluir `searchSettling` em `listQueryBusy` fecha esse buraco de UX.
