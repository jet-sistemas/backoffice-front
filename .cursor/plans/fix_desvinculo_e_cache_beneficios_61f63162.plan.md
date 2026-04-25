---
name: fix_desvinculo_e_cache_beneficios
overview: Corrigir a seleção de patrocinador no modal de edição de benefícios para permitir desvincular com confiabilidade e garantir invalidação de cache de benefícios quando patrocinador é ativado/desativado.
todos:
  - id: fix-sponsor-select-unlink
    content: Corrigir ActiveSponsorSelect para manter seleção de benefício geral (null) sem reverter para patrocinador anterior
    status: completed
  - id: wire-edit-form-unlink
    content: Ajustar integração no modal de edição de benefício caso necessário para preservar sponsorId null até submit
    status: completed
  - id: invalidate-benefits-on-sponsor-toggle
    content: Incluir invalidação da query ['benefits'] nos hooks de ativar/desativar patrocinador
    status: completed
  - id: test-unlink-flow
    content: Adicionar teste do fluxo de desvincular patrocinador no benefit-list-page
    status: completed
  - id: test-cache-invalidation
    content: Adicionar/ajustar testes dos hooks de ativar/desativar patrocinador para verificar invalidação de ['benefits']
    status: completed
  - id: run-frontend-tests
    content: Executar testes frontend relevantes e ajustar falhas
    status: completed
isProject: false
---

# Corrigir desvínculo de patrocinador e invalidação de benefícios

## Escopo
Aplicar dois ajustes no frontend:
- Permitir remover vínculo de patrocinador no `ActiveSponsorSelect` usado em edição de benefício.
- Invalidar cache de benefícios ao ativar/desativar patrocinador.

## Diagnóstico confirmado
- Em [`/home/carlos/Documents/codes/work/jet/backoffice-front/src/components/active-sponsor-select.tsx`](/home/carlos/Documents/codes/work/jet/backoffice-front/src/components/active-sponsor-select.tsx), o select mistura paginação interna + `fallbackOption` + item `Benefício geral`, e o comportamento de seleção atual pode ficar inconsistente ao alternar de patrocinador para `null` no modal de edição.
- Em [`/home/carlos/Documents/codes/work/jet/backoffice-front/src/hooks/use-activate-user-mutation.ts`](/home/carlos/Documents/codes/work/jet/backoffice-front/src/hooks/use-activate-user-mutation.ts) e [`/home/carlos/Documents/codes/work/jet/backoffice-front/src/hooks/use-deactivate-user-mutation.ts`](/home/carlos/Documents/codes/work/jet/backoffice-front/src/hooks/use-deactivate-user-mutation.ts), hoje só invalidamos `['users']` e `['user', userId]`, faltando `['benefits']`.

## Implementação proposta
- Em `active-sponsor-select.tsx`:
  - Tornar o valor “sem patrocinador” robusto no fluxo controlado (`value: null`) para sempre refletir a opção geral ao selecionar `NONE_VALUE`.
  - Garantir consistência dos itens renderizados quando existe `fallbackOption` e a página atual não contém o patrocinador selecionado, evitando re-seleção involuntária do item anterior.
  - Manter a UX atual (opção “Benefício geral (sem patrocinador)” + paginação), mas ajustar a lógica interna para o `onChange(null)` persistir no formulário até submit.
- Em `benefit-list-page.tsx` (se necessário):
  - Ajustar uso do `Controller` apenas se a correção do componente exigir (ex.: `key`/reset de estado local) sem alterar regra de negócio já implementada.
- Em hooks de patrocinador:
  - Adicionar `queryClient.invalidateQueries({ queryKey: ['benefits'] })` no `onSuccess` de:
    - `useActivateUserMutation`
    - `useDeactivateUserMutation`

## Testes automatizados
- Atualizar [`/home/carlos/Documents/codes/work/jet/backoffice-front/src/pages/benefit/benefit-list-page.test.tsx`](/home/carlos/Documents/codes/work/jet/backoffice-front/src/pages/benefit/benefit-list-page.test.tsx):
  - Cobrir fluxo de edição selecionando “Benefício geral (sem patrocinador)” e validar que `updateMutation` recebe `sponsorId: null`.
- Criar/ajustar testes unitários dos hooks de ativação/desativação de patrocinador (se não houver, criar em `src/hooks/`):
  - Validar que no sucesso são invalidadas as queries `['users']`, `['user', userId]` e `['benefits']`.
- Executar suíte alvo de testes frontend (pelo menos os arquivos alterados) e resolver regressões.

## Critérios de aceite
- O usuário consegue, pelo modal de edição de benefício, escolher “Benefício geral (sem patrocinador)” e salvar com desvínculo efetivo.
- Ativar/desativar patrocinador invalida também o cache de benefícios.
- Testes cobrindo ambos os comportamentos passam localmente.