# Fechamento do Primeiro Protótipo — SGL

**Status:** planejamento oficial de fechamento  
**Base:** `main` após Relatórios, exportações e 404  
**Objetivo:** concluir o frontend operacional e congelar o primeiro protótipo funcional antes da homologação completa.

## Estado da branch `feat/residuos-interface` — 01/09/2026

```text
Backend de Resíduos — fluxo base                          ✅ validado
Frontend — Informar resíduo                               ✅ validado visual/funcionalmente
Frontend — Meus resíduos                                  🟡 implementado; aguardando validação integrada
Frontend Gestão — Central de resíduos                     🟡 implementado; aguardando validação integrada
Frontend Gestão — Recebimento                             🟡 implementado; aguardando validação integrada
Frontend Gestão — Análise/classificação                   ✅ validado pelo usuário
Rótulo com código + pictogramas + impressão               🟡 implementado; aguardando validação
Armazenamento temporário                                  🟡 implementado; aguardando validação
Despacho / destinação                                     🟡 implementado; aguardando validação
Histórico visual                                          🟡 implementado; aguardando validação
Relatório de Resíduos                                     🟡 implementado; aguardando validação
Exportação PDF / XLSX de Resíduos                         🟡 implementado; aguardando validação
```

### Decisão atual sobre o rótulo

O QR Code foi retirado da experiência visual do protótipo atual por decisão de produto. O backend pode manter o campo técnico existente sem que ele seja exibido ou impresso.

O rótulo físico usa:

```text
código SGL de rastreio
pictogramas conforme riscos confirmados pela Gestão
composição do resíduo
nível de risco confirmado
laboratório e gerador
processo de origem e recipiente
armazenamento e destino previstos
quantidade
logo da Embrapa
```

Os pictogramas são assets PNG locais em `public/assets/residuos/pictogramas/` e a marca da Embrapa fica em `public/assets/residuos/marcas/embrapa.png`.

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
   ├── rótulo + impressão
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

## Validação integrada pendente do módulo de Resíduos

Antes de considerar a etapa 1 encerrada, validar localmente:

```text
Meus resíduos e detalhe do usuário
recebimento pela Gestão
análise/classificação
rótulo com código + pictogramas + logo Embrapa
pré-visualização de impressão sem sidebar/topbar
confirmação de armazenamento temporário
confirmação de despacho
histórico visual com todos os eventos
relatório filtrável
exportação PDF
exportação XLSX
```

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
