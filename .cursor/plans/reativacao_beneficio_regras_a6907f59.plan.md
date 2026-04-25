---
name: reativacao_beneficio_regras
overview: Implementar reativação individual de benefício com regras por tipo de vínculo (geral vs patrocinador), ajustando front/back e cobrindo cenários críticos com testes automatizados e guardrails de performance de escrita no banco.
todos:
  - id: back-add-activate-endpoint
    content: Adicionar endpoint PATCH /benefit/{id}/activate em openapi/resource/service admin
    status: completed
  - id: back-enforce-activation-rules
    content: Implementar BenefitService.activate com regra por sponsor ativo/inativo e idempotência de persistência
    status: completed
  - id: back-optimize-bulk-updates
    content: Ajustar queries de ativar/desativar em lote para atualizar apenas registros que mudam de estado
    status: completed
  - id: front-add-activate-mutation
    content: Adicionar API/hook de ativação de benefício e integração na listagem
    status: completed
  - id: front-adjust-disabled-rules
    content: Atualizar regra do botão para habilitar reativação de benefício geral e bloquear apenas quando sponsor inativo
    status: completed
  - id: tests-backend
    content: Criar/ajustar testes Quarkus para cenários de reativação válida/inválida
    status: completed
  - id: tests-frontend
    content: Criar/ajustar testes Vitest da lista de benefícios para estados de habilitação e ação de reativar
    status: completed
isProject: false
---

# Reativação de benefício com regras de patrocinador

## Objetivo
Permitir reativar benefícios inativos na listagem, com estas regras:
- Benefício **geral** (sem patrocinador) pode ser reativado diretamente.
- Benefício vinculado a patrocinador só pode ser reativado se o patrocinador estiver ativo.
- Se o patrocinador estiver inativo, o usuário deve primeiro reativar o patrocinador ou desvincular o benefício (editar `sponsorId = null`) antes de reativar.

## Backend (Quarkus)
- Adicionar endpoint de ativação em [`/home/carlos/Documents/codes/work/jet/backoffice/src/main/java/backoffice/v1/openapi/api/AdminApi.java`](/home/carlos/Documents/codes/work/jet/backoffice/src/main/java/backoffice/v1/openapi/api/AdminApi.java):
  - `PATCH /v1/admin/benefit/{id}/activate`.
- Implementar no resource correspondente (`AdminResource`) delegando para `AdminService`.
- Em `AdminService`, criar método `activateBenefit(id)` chamando `BenefitService.activate(id)`.
- Em [`/home/carlos/Documents/codes/work/jet/backoffice/src/main/java/backoffice/v1/services/BenefitService.java`](/home/carlos/Documents/codes/work/jet/backoffice/src/main/java/backoffice/v1/services/BenefitService.java):
  - Criar `@Transactional activate(Long benefitId)` com regra:
    - Se `benefit.sponsor == null`: ativar.
    - Se `benefit.sponsor != null` e `sponsor.isActive == true`: ativar.
    - Se `benefit.sponsor != null` e `sponsor.isActive == false`: lançar `BusinessException` com mensagem padronizada de `MessageErrorEnum` (reaproveitar `SPONSOR_NOT_ACTIVE` se aderente).
  - Tornar `activate/deactivate` idempotentes: não persistir se já estiver no estado alvo.
- Evitar escrita desnecessária em lote:
  - Em `BenefitRepository.activateBySponsorId`/`deactivateBySponsorId`, filtrar por estado atual (`isActive = false/true`) para reduzir updates sem mudança.

## Frontend (React)
- Em [`/home/carlos/Documents/codes/work/jet/backoffice-front/src/api/benefit-api.ts`](/home/carlos/Documents/codes/work/jet/backoffice-front/src/api/benefit-api.ts):
  - Adicionar `activateBenefit(id)` para `PATCH /v1/admin/benefit/{id}/activate`.
- Criar hook de mutação (`use-activate-benefit-mutation.ts`) com invalidação da query `['benefits']`.
- Ajustar [`/home/carlos/Documents/codes/work/jet/backoffice-front/src/pages/benefit/benefit-list-page.tsx`](/home/carlos/Documents/codes/work/jet/backoffice-front/src/pages/benefit/benefit-list-page.tsx):
  - Botão de ação passa a executar:
    - `deactivate` quando ativo.
    - `activate` quando inativo e elegível.
  - Regra de disabled para item inativo:
    - **habilitado** se benefício geral (`sponsor == null`).
    - **habilitado** se possui patrocinador ativo.
    - **desabilitado** se possui patrocinador inativo.
  - Atualizar `aria-label`/`title` para explicar bloqueio por patrocinador inativo e orientar ação de desvincular/reativar patrocinador.

## Testes automatizados
- Backend (`@QuarkusTest`):
  - Novo(s) teste(s) em `AdminResource*Test` cobrindo:
    - reativar benefício geral inativo -> `200`.
    - reativar benefício com patrocinador ativo -> `200`.
    - reativar benefício com patrocinador inativo -> `400` com mensagem esperada.
    - idempotência (ativar já ativo / desativar já inativo) sem regressão funcional.
- Frontend (Vitest/RTL):
  - Em `benefit-list-page.test.tsx`:
    - botão de reativar habilitado para benefício geral inativo e chama mutation de ativação.
    - botão desabilitado para benefício inativo com patrocinador inativo.
    - botão habilitado para benefício inativo com patrocinador ativo.

## Critérios de aceite
- UI permite reativação conforme regras de negócio.
- Backend impede reativação inválida com resposta padronizada.
- Fluxo continua compatível com reativação em cascata já existente ao ativar usuário patrocinador.
- Sem updates redundantes quando estado não muda (redução de carga no banco).
- Testes automatizados cobrindo os cenários críticos acima.