# Decisão de Arquitetura — Unidades e integração corporativa

**Decisão original:** 26/08/2026  
**Revisado em:** 04/09/2026  
**Status:** decisão vigente  
**Estado atual:** isolamento funcional por Unidade já implementado em DEV; resolução corporativa confiável continua futura.

---

## 1. Decisão

`Unidade` **não terá cadastro manual normal no frontend do SGL**.

A central atual de Administração/Cadastros contém:

```text
Cadastros
├── Laboratórios
├── Projetos
├── Produtos
└── Permissões de usuários existentes
```

Não criar como fluxo administrativo normal:

```text
Cadastros → Unidades
/cadastros/unidades
```

Qualquer documentação anterior que apresente `Unidade` como CRUD administrativo comum está superada.

---

## 2. Estado atual — modo DEV

O sistema já possui contexto funcional por Unidade.

A sessão DEV do frontend contém informações como:

```text
unidadeId
unidadeNome
unidadeSigla
laboratorioId
laboratorioNome
```

O interceptor HTTP envia:

```text
X-SGL-Unidade-Id: <unidadeId>
```

No backend:

```text
TenantRequestFilter
→ valida o UUID
→ define TenantContext
→ services/repositories restringem dados da Unidade
→ limpa TenantContext ao final da requisição
```

Esse mecanismo permite validar isolamento entre Unidades no desenvolvimento e já faz parte do estado funcional aprovado.

---

## 3. Limite de segurança do mecanismo atual

O isolamento atual **não é a solução definitiva de autorização**.

Motivo:

```text
unidadeId vem da sessão/localStorage do cliente
→ cliente envia o header
→ backend ainda não deriva tenant de identidade autenticada confiável
```

Portanto:

```text
isolamento funcional multitenant                ✅
validação de cenários entre Unidades            ✅
fronteira definitiva de segurança               ❌
```

Na produção, o tenant deverá ser obtido da sessão/token institucional e não de um valor livremente controlável pelo navegador.

---

## 4. Origem definitiva da Unidade

A Unidade institucional do usuário virá da **integração corporativa** durante a autenticação definitiva.

Conceitualmente, o SGL receberá identidade da pessoa e identificação institucional da Unidade.

Exemplo apenas ilustrativo:

```json
{
  "usuario": {
    "nome": "...",
    "email": "..."
  },
  "unidade": {
    "codigo": "...",
    "nome": "...",
    "sigla": "..."
  }
}
```

Não fixar o DTO definitivo antes de conhecer o contrato real da API corporativa.

---

## 5. Regra futura de sincronização

Fluxo esperado:

```text
login / SSO corporativo
→ receber identidade institucional
→ extrair identificador estável da Unidade
→ procurar Unidade correspondente no SGL

se existir
→ reutilizar
→ sincronizar dados permitidos
→ associar/sincronizar usuário

se não existir
→ criar de forma controlada
→ associar/sincronizar usuário
```

A operação deve ser idempotente: logins posteriores não podem criar Unidades duplicadas.

---

## 6. Identidade e deduplicação

Não considerar duas Unidades iguais apenas pelo nome exibido.

Prioridade desejada:

```text
1. código/identificador corporativo estável
2. outro identificador institucional único
3. nome/sigla apenas como informação auxiliar
```

Quando o contrato corporativo for conhecido, o backend deverá possuir uma chave estável de integração e proteção contra concorrência/duplicidade.

---

## 7. Responsabilidade do backend

A resolução, criação e sincronização institucional de Unidade pertencem ao backend.

Fluxo esperado:

```text
API/SSO corporativo
→ serviço de autenticação/sincronização do SGL
→ resolve/sincroniza Unidade
→ resolve/sincroniza Usuário
→ gera contexto autenticado confiável
→ frontend consome a sessão
```

Não implementar no Vue lógica de deduplicação ou criação automática de Unidade.

---

## 8. Relação com os demais domínios

Retirar Unidade do CRUD manual não elimina a entidade.

Ela continua sendo referência para:

```text
Usuário
Laboratório
Projeto
Estagiário
Pedido
Resíduo
Estoque Central
Lote / Movimentação por contexto de estoque
consultas e relatórios
sessão institucional
```

A decisão trata de **origem e governança do dado**, não da remoção da entidade do domínio.

---

## 9. Compatibilidade com o modo DEV

Até a integração corporativa definitiva:

```text
dados DEV / seeds existentes                     → permanecem
login DEV                                        → permanece temporariamente
isolamento por X-SGL-Unidade-Id                  → permanece para validação
CRUD técnico backend de Unidade                  → pode permanecer para testes/ferramentas
CRUD manual normal no frontend                   → não implementar
```

Quando a autenticação corporativa existir, avaliar a restrição ou remoção de endpoints técnicos de escrita de Unidade da superfície pública.

---

## 10. Critérios para implementação corporativa futura

Validar:

- contrato real da identidade corporativa;
- identificador estável da Unidade;
- criação automática quando inexistente;
- reutilização sem duplicidade;
- sincronização segura de nome/sigla;
- concorrência em primeiros acessos simultâneos;
- constraint única para o identificador institucional;
- transação envolvendo Unidade e Usuário;
- comportamento para Unidade ausente/inválida;
- auditoria da origem corporativa;
- substituição da confiança no `X-SGL-Unidade-Id` informado pelo browser por tenant derivado da identidade autenticada.

---

## 11. Regra resumida para retomada

> Unidade é dado institucional. Hoje o SGL já aplica isolamento funcional por Unidade usando a sessão DEV e `X-SGL-Unidade-Id`. Em produção, o administrador continuará sem cadastrar Unidade manualmente e o backend deverá resolver/sincronizar a Unidade a partir da identidade corporativa, usando um identificador estável e confiável.
