# Fechamento do Primeiro Protótipo — SGL

**Status:** planejamento oficial de fechamento  
**Base:** `main` após Relatórios, exportações e 404  
**Objetivo:** concluir o frontend operacional e congelar o primeiro protótipo funcional antes da homologação completa.

## Estado da branch `feat/residuos-interface` — 01/09/2026

```text
Backend de Resíduos — fluxo base validado                 ✅
Frontend — Informar resíduo                               ✅ validado visual/funcionalmente
Frontend — Meus resíduos                                  🟡 implementado; aguardando validação
Frontend Gestão — Central de resíduos                     🟡 implementado; aguardando validação
Frontend Gestão — Recebimento                             🟡 implementado; aguardando validação
Frontend Gestão — Análise/classificação                   🟡 implementado; aguardando validação
Rótulo / QR / impressão                                   ⏳ próximo bloco após validação
Armazenamento temporário                                  ⏳
Despacho / destinação                                     ⏳
Histórico visual                                          ⏳
Relatório / PDF / XLSX                                    ⏳
```

A análise usa o contrato real `PUT /api/v1/residuos/{id}/analisar-liberar`. Por isso, ao confirmar a classificação, o backend também muda o resíduo para `LIBERADO_PARA_ARMAZENAMENTO` e gera o código de rastreio. Nesta etapa o frontend **não** renderiza nem imprime rótulo/QR; essa experiência começa no bloco seguinte.

## Ordem oficial restante

```text
1. Resíduos
   ├── backend reconciliado com a main
   ├── frente do usuário comum
   │   ├── Informar resíduo
   │   └── Meus resíduos
   ├── frente da Gestão
   │   ├── receber
   │   ├── analisar/classificar
   │   ├── liberar/rotular
   │   ├── armazenar temporariamente
   │   └── despachar/destinar
   ├── histórico/rastreabilidade
   ├── rótulo/QR/impressão
   └── relatório + PDF/XLSX

2. Estagiários
   ├── listagem
   ├── cadastro
   ├── edição
   ├── vínculo com laboratório/unidade
   ├── período de estágio
   └── encerramento de estágio

3. Administração → Cadastros
   ├── Produtos
   │   └── incluir fiscalização
   ├── Laboratórios
   ├── Projetos
   └── Usuários

4. Dashboard
   └── indicadores úteis por perfil, sem duplicar telas operacionais

5. Alertas operacionais
   ├── pedidos pendentes/urgentes
   ├── estoque baixo
   ├── lotes próximos do vencimento
   ├── lotes vencidos
   └── resíduos aguardando ação

6. Aparência
   ├── tema claro
   ├── tema escuro
   └── persistência da preferência

7. Diretrizes de permissões
   ├── ADMINISTRADOR
   ├── GESTOR
   ├── ESTAGIARIO
   ├── PESQUISADOR
   ├── ANALISTA
   └── TECNICO

8. Congelamento do primeiro protótipo

9. Homologação completa do protótipo congelado
   └── executar `docs/PLANO_TESTES_PRIMEIRO_PROTOTIPO.md`
```

## Regra para Resíduos

Resíduos possui duas experiências diferentes, como Pedidos:

```text
Usuário comum
→ gera o resíduo no laboratório
→ informa ao SGL
→ acompanha o ciclo

Gestão
→ recebe fisicamente
→ confere
→ confirma/corrige riscos
→ rotula
→ armazena temporariamente
→ despacha/destina
```

É um fluxo conceitualmente inverso ao Pedido:

```text
PEDIDO
usuário solicita → Gestão atende → material sai para o laboratório

RESÍDUO
laboratório gera → usuário informa → material chega à Gestão
```

`Produto` e `Resíduo` são domínios diferentes. Um componente de resíduo pode referenciar um Produto apenas para rastreabilidade; isso não altera estoque automaticamente.

## Diretrizes de permissões antes da implementação definitiva

Antes da autenticação/autorização final, documentar uma matriz funcional de permissões. A matriz será uma referência de UX e negócio; não deve ser confundida com segurança real enquanto a sessão DEV existir.

A revisão precisa responder, para cada perfil:

- quais menus aparecem;
- quais unidades/laboratórios podem ser visualizados;
- quais registros podem ser criados;
- quais registros podem ser editados;
- quais transições de Pedido/Resíduo podem ser executadas;
- quais relatórios podem ser consultados/exportados;
- quais cadastros administrativos ficam disponíveis;
- quais ações exigem Gestor ou Administrador.

## Critério de congelamento

O primeiro protótipo só será congelado quando:

```text
fluxos principais do usuário comum funcionarem
fluxos principais de Gestão funcionarem
Administração/Cadastros essenciais funcionarem
Resíduos estiver completo de ponta a ponta
Dashboard e alertas estiverem conectados aos dados reais
claro/escuro estiver funcional
404 e estados básicos de erro estiverem tratados
diretrizes de permissão estiverem documentadas
sem pendência funcional conhecida que impeça a homologação
```

Após o congelamento, nenhuma nova funcionalidade entra antes da bateria de testes. Correções encontradas durante a homologação serão tratadas como estabilização do protótipo.