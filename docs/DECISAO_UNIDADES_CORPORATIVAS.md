# Decisão de Arquitetura — Unidades via integração corporativa

**Data:** 26/08/2026  
**Status:** decisão aprovada para implementação futura  
**Impacto atual:** documentação e planejamento; fluxo DEV permanece inalterado

---

## 1. Decisão

`Unidade` **não terá cadastro manual no frontend do SGL**.

Portanto, a etapa futura **Administração → Cadastros** deve conter:

```text
Cadastros
├── Produtos
├── Laboratórios
├── Projetos
├── Usuários
└── Estagiários
```

Não criar:

```text
Cadastros → Unidades
/cadastros/unidades
```

Qualquer documentação anterior que apresente `Unidades` como CRUD administrativo de uso normal deve ser considerada substituída por esta decisão.

---

## 2. Origem da Unidade

A unidade institucional do usuário virá da **API corporativa** no fluxo de autenticação definitiva.

No primeiro acesso/autenticação corporativa, o SGL deverá receber um JSON com as informações institucionais da pessoa. Entre os dados recebidos estará a identificação da `Unidade` à qual a pessoa pertence.

Exemplo conceitual — o contrato real deverá seguir a API corporativa quando estiver disponível:

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

Os nomes e formatos acima são apenas ilustrativos. Não fixar o DTO definitivo antes de conhecer o contrato real da API corporativa.

---

## 3. Regra de sincronização

Fluxo futuro obrigatório:

```text
login pela API corporativa
→ receber JSON institucional
→ extrair identificação da unidade
→ procurar unidade correspondente no SGL

se a unidade já existir
→ reutilizar a unidade existente
→ associar/anexar o usuário a ela

se a unidade ainda não existir
→ criar a unidade automaticamente com os dados corporativos
→ associar/anexar o usuário à nova unidade
```

A operação deve ser **idempotente**: logins posteriores do mesmo usuário não podem criar unidades duplicadas.

---

## 4. Identidade e deduplicação

A futura integração não deve decidir que duas unidades são iguais apenas pelo nome exibido.

Prioridade desejada para identificação:

```text
1. código/identificador corporativo estável, se fornecido pela API
2. outro identificador institucional único e estável
3. nome/sigla somente como apoio e compatibilidade, não como primeira escolha
```

Quando o contrato corporativo for conhecido, o backend deverá definir uma chave de integração própria para impedir duplicidade e permitir atualização segura de nome/sigla sem recriar a unidade.

---

## 5. Responsabilidade do backend

A regra de criação/reutilização de Unidade pertence ao **backend**, não ao frontend.

O frontend deverá apenas consumir a sessão já resolvida, contendo a unidade vinculada ao usuário.

Fluxo esperado:

```text
API corporativa
→ serviço de autenticação/sincronização do SGL
→ resolve/cria Unidade
→ resolve/cria/atualiza vínculo do Usuário
→ sessão/resposta para o frontend
```

Não implementar no Vue lógica de deduplicação ou criação automática de Unidade.

---

## 6. Relação com os demais cadastros

A retirada de `Unidade` do cadastro manual **não elimina a entidade Unidade do domínio**.

Ela continua sendo usada para:

```text
Usuário → Unidade
Laboratório → Unidade
Estoque Central → Unidade
consultas e relatórios por Unidade
contexto institucional da sessão
```

A diferença é apenas a **origem e governança do dado**:

```text
antes previsto: administrador cadastra manualmente
agora definido: integração corporativa cria/reutiliza automaticamente
```

Produtos, Laboratórios, Projetos e demais cadastros continuam seguindo seus fluxos administrativos próprios enquanto não houver outra decisão de integração corporativa.

---

## 7. Compatibilidade com o modo DEV atual

**Não alterar agora o login temporário de desenvolvimento.**

O ambiente atual usa usuários/unidades já presentes no banco para permitir o desenvolvimento das interfaces. Essa base deve continuar funcionando normalmente até a etapa de autenticação corporativa.

Portanto, nesta fase:

```text
DataInitializer / dados DEV existentes       → permanecem
login DEV atual                              → permanece
CRUD/backend de Unidade já existente         → não precisa ser removido agora
rota/tela futura de cadastro manual          → não implementar
integração automática corporativa            → implementar na etapa de autenticação
```

Manter o CRUD técnico existente no backend por enquanto evita quebrar testes, seeds e ferramentas internas. Quando a integração corporativa for implementada, avaliar se endpoints de escrita de Unidade devem ser restringidos a uso interno ou removidos da superfície administrativa.

---

## 8. Critérios para a implementação futura

Quando chegar a etapa **Autenticação / Autorização / Integração corporativa**, validar:

- contrato real do JSON corporativo;
- identificador estável da unidade;
- criação automática quando inexistente;
- reutilização sem duplicidade quando existente;
- associação do usuário à unidade resolvida;
- atualização segura de nome/sigla quando a fonte corporativa mudar;
- concorrência de dois primeiros logins da mesma unidade ao mesmo tempo;
- constraint única no banco para o identificador corporativo escolhido;
- transação envolvendo resolução da unidade e sincronização do usuário;
- comportamento para unidade ausente ou inválida no JSON;
- auditoria da origem corporativa dos dados.

---

## 9. Regra resumida para retomada

> Unidade é dado institucional proveniente da API corporativa. O administrador não cria Unidade manualmente. No login, o backend procura a unidade pelo identificador corporativo: se existir, reutiliza e associa o usuário; se não existir, cria e associa. O modo DEV atual permanece intacto até essa integração ser implementada.
