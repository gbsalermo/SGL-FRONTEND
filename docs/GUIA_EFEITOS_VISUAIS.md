# Guia de Efeitos Visuais e Microinterações - SGL

> Catálogo reutilizável para projetos web. Os exemplos usam CSS puro e podem ser aplicados em Vue, React, Angular ou HTML convencional.

## 1. Modal com background desfocado (efeito principal)

### Resultado
Ao abrir um modal, a página permanece visível, porém escurecida e desfocada. O modal fica nítido em primeiro plano.

### Quando usar
- confirmações;
- formulários rápidos;
- detalhes sem abandonar a tela atual;
- ações que exigem foco temporário do usuário.

### Estrutura
```html
<div class="modal-backdrop">
  <section class="modal-card">
    Conteúdo do modal
  </section>
</div>
```

### CSS copiável
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: grid;
  place-items: center;
  padding: 24px;

  background: rgb(5 16 37 / 55%);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.modal-card {
  width: min(620px, 100%);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 28px 80px rgb(5 16 37 / 32%);
}
```

### Ajustes rápidos
- Blur sutil: `blur(2px)`
- Blur padrão recomendado: `blur(3px)`
- Blur forte: `blur(5px)`
- Quanto maior a opacidade do `background`, mais escura fica a página atrás.

### Regra
Use `backdrop-filter` no backdrop, não no modal. O modal deve permanecer nítido.

---

## 2. Entrada e saída suave do modal

### Resultado
O backdrop aparece por fade enquanto o modal sobe alguns pixels e ganha escala.

```css
.modal-enter-active,
.modal-leave-active {
  transition: opacity 180ms ease;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 180ms ease, opacity 180ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  opacity: 0;
  transform: translateY(10px) scale(.985);
}
```

Em Vue, essas classes podem ser usadas com `<Transition name="modal">`.

---

## 3. Hover de card navegável

### Resultado
O card responde ao mouse com pequena elevação, borda, fundo e sombra.

```css
.card-interativo {
  border: 1px solid #e2e8f0;
  background: #fff;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease;
}

.card-interativo:hover {
  transform: translateY(-3px);
  border-color: #9bb9e5;
  background: #fbfdff;
  box-shadow: 0 12px 28px rgb(15 23 42 / 10%);
}
```

### Regra
Use hover destacado somente em elementos clicáveis/navegáveis. Cards puramente informativos devem permanecer estáveis.

---

## 4. Hover de botão

```css
.botao {
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.botao:hover {
  transform: translateY(-1px);
  background: #2d6bc4;
  box-shadow: 0 6px 16px rgb(26 77 161 / 20%);
}
```

O deslocamento deve ser pequeno para não fazer a interface parecer instável.

---

## 5. Feedback de clique

### Resultado
O botão reduz levemente enquanto está pressionado.

```css
.botao:active {
  transform: scale(.98);
}
```

É um feedback curto. Evite escalas muito menores que `.97`.

---

## 6. Foco visível em campos e ações

### Campo
```css
.campo {
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.campo:focus {
  border-color: #2d6bc4;
  box-shadow: 0 0 0 3px rgb(45 107 196 / 13%);
}
```

### Botão acessível por teclado
```css
.botao:focus-visible {
  outline: 3px solid rgb(45 107 196 / 25%);
  outline-offset: 2px;
}
```

Não remova o foco sem fornecer outro indicador visual.

---

## 7. Mudança semântica de cor no hover

Pode-se usar a interação para reforçar o significado da ação.

```css
.card-entrada:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.card-saida:hover {
  border-color: #ef4444;
  background: #fef2f2;
}

.card-alerta:hover {
  border-color: #eab308;
  background: #fefce8;
}
```

A cor deve complementar texto/ícone; não deve ser a única forma de transmitir significado.

---

## 8. Destaque temporário

Útil quando uma ação leva o usuário até um registro específico.

```css
.item-destacado {
  animation: destaque-item 900ms ease-out;
}

@keyframes destaque-item {
  from {
    background: #ffe6a8;
  }

  to {
    background: #fff8e8;
  }
}
```

Use animações curtas e não repetitivas.

---

## 9. Hover apenas onde existe mouse

Evita comportamentos estranhos em dispositivos touch.

```css
@media (hover: hover) and (pointer: fine) {
  .item-interativo {
    transition: background 160ms ease, transform 160ms ease;
  }

  .item-interativo:hover {
    transform: translateY(-1px);
  }
}
```

---

## 10. Respeito a movimento reduzido

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}
```

Esse bloco deve acompanhar aplicações que utilizam animações e transições.

---

## 11. Tokens sugeridos

Centralizar valores facilita replicar a identidade sem copiar números por todo o projeto.

```css
:root {
  --ui-focus: #2d6bc4;

  --ui-shadow-soft: 0 2px 8px rgb(15 23 42 / 6%);
  --ui-shadow-floating: 0 10px 24px rgb(15 23 42 / 14%);

  --ui-press-scale: .98;

  --ui-transition-fast: 180ms;
  --ui-transition-route: 300ms;

  --ui-backdrop: rgb(5 16 37 / 55%);
  --ui-backdrop-blur: 3px;
}
```

---

## 12. Padrão recomendado

| Situação | Efeito |
| --- | --- |
| Modal | overlay escuro + blur + sombra nível alto |
| Drawer | overlay + slide coerente com a origem |
| Card clicável | hover discreto + borda/fundo/sombra |
| Card informativo | sem hover de navegação |
| Botão | mudança de cor + elevação mínima |
| Clique | `scale(.98)` |
| Campo focado | borda + anel de foco |
| Registro localizado | destaque temporário |
| Touch | evitar hover dependente de mouse |
| Acessibilidade | respeitar `prefers-reduced-motion` |

## Referências internas do SGL

Este catálogo consolida padrões observados e documentados no frontend do SGL. Para a identidade completa, consultar também:

- `docs/IDENTIDADE_VISUAL.md`
- `docs/PADRAO_VISUAL_PRE_PRODUCAO.md`
- `src/styles/tokens.css`

O catálogo é intencionalmente independente das regras de negócio do SGL para permitir reutilização em outros projetos.
