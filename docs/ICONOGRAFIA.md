# Iconografia — SGL Frontend

**Etapa:** 1.3 — Figma e padrões visuais  
**Status:** decisão conceitual aprovada; implementação futura

Este documento registra o padrão visual e de interação dos ícones do SGL. Não define biblioteca definitiva nem código Vue/CSS nesta etapa.

---

## 1. Objetivo

Os ícones devem ser:

- visíveis;
- autoexplicativos;
- consistentes;
- discretamente animados;
- adequados a um sistema administrativo;
- complementares ao texto, nunca substitutos de informação importante.

Regra principal:

> Ícone ajuda a reconhecer; texto explica.

---

## 2. Estilo base

```text
normal
→ outline moderno
→ traço suficientemente visível
→ monocromático

ativo
→ filled quando a família escolhida oferecer equivalente coerente
```

Cor padrão:

- preto/grafite de destaque em superfícies claras;
- branco/claro em superfícies escuras;
- azul institucional para destaque/interação quando necessário.

Não usar azul + verde dentro de todos os ícones operacionais. Duas cores permanentes aumentariam complexidade e ruído visual sem benefício funcional.

---

## 3. Tamanhos de referência

```text
menu/sidebar        ~20–22 px
botões              ~18–20 px
destaque maior      ~24 px quando necessário
```

A espessura do outline deve permanecer consistente entre as famílias de ícones.

---

## 4. Interação

### Hover

```text
leve escala/movimento
+ mudança suave de destaque
```

A animação deve apenas confirmar que o elemento respondeu ao usuário.

### Clique

```text
pequeno efeito de pressão
→ escala ligeiramente menor
→ retorno rápido
```

### Ativo

```text
outline
→ filled quando disponível
+ destaque visual do item ativo
```

Não usar:

- bounce contínuo;
- rotação gratuita;
- animação infinita;
- movimentos grandes;
- animações diferentes sem linguagem comum.

---

## 5. Cor semântica

A cor adicional aparece quando comunica estado real.

```text
AZUL
→ neutro
→ informação
→ estado normal

VERDE
→ sucesso
→ confirmação

AMARELO
→ atenção
→ pendência

VERMELHO
→ erro
→ crítico
→ urgência
```

Exemplos de ícones ilustrativos:

| Situação | Cor auxiliar |
|---|---|
| Estoque baixo | amarelo |
| Pedido aprovado | verde |
| Entrada registrada | verde |
| Próximo do vencimento | amarelo |
| Vencido | vermelho |
| Relatório gerado | azul ou verde conforme contexto |
| Nenhum resultado | neutro/azul |

---

## 6. Uso por contexto

### Sidebar aberta

```text
ícone + texto
```

### Sidebar recolhida

```text
ícone
+ tooltip no hover
```

### Botões

Ícone complementa o rótulo quando a ação não é universalmente óbvia.

### Cards e estados

Podem usar ícones ilustrativos maiores e símbolos auxiliares semânticos.

### Alertas operacionais

A lâmpada é exceção semântica importante:

```text
azul     → sem pendências
amarelo  → pendências
vermelho → existe urgência
```

---

## 7. Conceitos visuais preferidos

| Área | Conceito de ícone |
|---|---|
| Dashboard | grid |
| Pedidos | clipboard/documento |
| Novo pedido | documento + |
| Estoque | caixa/prateleira |
| Lotes | caixas/embalagens |
| Entrada | caixa + seta de entrada |
| Descarte | lixeira/descarte |
| Movimentações | setas bidirecionais |
| Relatórios | gráfico/documento |
| Produtos | caixa/frasco |
| Laboratórios | frasco/erlenmeyer |
| Projetos | pasta/briefcase |
| Usuários | pessoa/grupo |
| Estagiários | pessoa/crachá |
| Documentos | arquivo/pasta |
| Configuração | engrenagem |
| Alertas | lâmpada |

Os desenhos finais dependerão da biblioteca escolhida na etapa técnica, preservando esses conceitos.

---

## 8. Acessibilidade

Futuramente:

- tooltips não devem ser a única forma de comunicar informação crítica;
- ícone-only precisa de nome acessível;
- ações importantes mantêm rótulo quando houver espaço;
- microanimações devem respeitar preferência de movimento reduzido.

---

## 9. Referência visual

A imagem-exemplo de iconografia será adicionada manualmente ao README pelo mantenedor.

Ela deve servir apenas como **guia conceitual** e demonstrar:

- outline em estado normal;
- filled em estado ativo;
- preto/grafite como cor operacional padrão em fundo claro;
- microinteração de hover/click;
- cores auxiliares semânticas para estados.

A imagem não define biblioteca obrigatória nem substitui estas regras escritas.
