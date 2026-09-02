# Fechamento do Primeiro Protótipo — SGL

**Status:** planejamento oficial de fechamento  
**Base atual:** `main` após Resíduos, Estagiários, relatórios e exportações  
**Objetivo:** concluir o frontend operacional e congelar o primeiro protótipo funcional antes da homologação completa.

## Etapas já concluídas

```text
1. Resíduos                                                   ✅ concluído e mergeado
2. Estagiários + auditoria de pessoas por laboratório         ✅ concluído e mergeado
3. Administração → Cadastros                                  🟡 em desenvolvimento
```

## Decisão atual sobre os rótulos

O QR Code foi retirado da experiência visual do protótipo atual por decisão de produto. O backend pode manter o campo técnico existente sem que ele seja exibido ou impresso.

O rótulo físico de Resíduos usa:

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

O rótulo de Produto usa os dados do catálogo e destaca explicitamente fiscalização/controle externo quando aplicável.

## Ordem oficial restante

```text
1. Resíduos                                                    ✅

2. Estagiários                                                 ✅
   ├── listagem
   ├── cadastro
   ├── edição
   ├── vínculo com laboratório/unidade
   ├── período de estágio
   ├── encerramento de estágio
   └── relatório Pessoas por laboratório

3. Administração → Cadastros                                  ← ATUAL
   ├── Laboratórios
   │   ├── unidade institucional
   │   ├── responsável
   │   └── ativação/inativação
   ├── Projetos
   │   ├── laboratório
   │   ├── período
   │   └── ativação/inativação
   ├── Produtos
   │   ├── catálogo-base
   │   ├── riscos/perecibilidade
   │   ├── fiscalização externa
   │   └── ativação/inativação
   └── Permissões
       └── alterar apenas o perfil de usuários já existentes

   NÃO FAZER NESTA ETAPA:
   ├── CRUD manual de Usuários
   └── CRUD manual de Unidades

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

## Regra institucional de Administração → Cadastros

A área de Cadastros repassa e mantém os dados-base necessários ao sistema.

### Usuários

O usuário **não é criado manualmente nesta interface**. O cadastro deverá nascer/sincronizar automaticamente a partir do login institucional quando a autenticação definitiva for integrada.

A única manutenção administrativa prevista sobre usuários nesta etapa é:

```text
alterar perfil/permissão de acesso
```

Isso é exclusivo de `ADMINISTRADOR` na interface e usa endpoint específico que não altera nome, e-mail, senha, unidade ou laboratório.

### Unidades

Unidades são dados institucionais e aparecem somente como referência para vínculos e auditoria. Não haverá CRUD manual de Unidade nesta etapa.

### Produtos

Produto é catálogo-base. Estoque, lotes e movimentações continuam em suas áreas operacionais e não devem ser duplicados em Cadastros.

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
