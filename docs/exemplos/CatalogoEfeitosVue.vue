<script setup>
import { ref } from 'vue'

const modalAberto = ref(false)
</script>

<template>
  <main class="catalogo-ui">
    <header class="hero">
      <span>CATÁLOGO DE MICROINTERAÇÕES</span>
      <h1>Efeitos visuais reutilizáveis</h1>
      <p>
        Exemplo autocontido em Vue 3. Passe o mouse pelos elementos e abra o modal
        para visualizar overlay, blur, elevação e transições.
      </p>
    </header>

    <section class="grid">
      <article class="demo-card demo-card--hover">
        <small>01 · HOVER</small>
        <h2>Card interativo</h2>
        <p>Borda, fundo, sombra e elevação mudam suavemente ao passar o mouse.</p>
      </article>

      <article class="demo-card">
        <small>02 · FOCO</small>
        <h2>Campo com feedback</h2>
        <label class="field">
          <span>Nome do projeto</span>
          <input placeholder="Clique ou navegue com Tab" />
        </label>
      </article>

      <article class="demo-card">
        <small>03 · AÇÕES</small>
        <h2>Botões</h2>
        <div class="actions">
          <button class="button button--primary">Primário</button>
          <button class="button button--secondary">Secundário</button>
        </div>
      </article>

      <article class="demo-card demo-card--modal">
        <small>04 · DESTAQUE PRINCIPAL</small>
        <h2>Modal com background desfocado</h2>
        <p>O backdrop escurece e desfoca a interface atrás do modal.</p>
        <button class="button button--primary" @click="modalAberto = true">
          Abrir modal com blur
        </button>
      </article>
    </section>

    <Transition name="modal">
      <div
        v-if="modalAberto"
        class="modal-backdrop"
        role="presentation"
        @click.self="modalAberto = false"
      >
        <section
          class="modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalogo-modal-title"
        >
          <header>
            <div>
              <small>MODAL / OVERLAY</small>
              <h2 id="catalogo-modal-title">Background com blur</h2>
            </div>
            <button
              class="close-button"
              aria-label="Fechar modal"
              @click="modalAberto = false"
            >
              ×
            </button>
          </header>

          <div class="modal-content">
            <p>
              O efeito principal está em <code>backdrop-filter: blur(3px)</code>.
              O fundo semitransparente aumenta a separação visual entre a página
              e o conteúdo em primeiro plano.
            </p>

            <div class="code-tip">
              background: rgb(5 16 37 / 55%);<br />
              backdrop-filter: blur(3px);<br />
              -webkit-backdrop-filter: blur(3px);
            </div>
          </div>

          <footer>
            <button class="button button--secondary" @click="modalAberto = false">
              Cancelar
            </button>
            <button class="button button--primary" @click="modalAberto = false">
              Confirmar
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.catalogo-ui {
  --primary: #1a4da1;
  --primary-hover: #2d6bc4;
  --text: #1a1a2e;
  --muted: #64748b;
  --border: #e2e8f0;
  --surface-soft: #f8fafc;
  --transition: 180ms;
  min-height: 100vh;
  padding: 48px;
  background: #f5f7fa;
  color: var(--text);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hero {
  max-width: 760px;
  margin: 0 auto 32px;
}

.hero > span,
.demo-card > small,
.modal-card small {
  color: var(--primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .08em;
}

.hero h1 {
  margin: 8px 0;
  font-size: clamp(28px, 5vw, 44px);
}

.hero p,
.demo-card p,
.modal-content p {
  color: var(--muted);
  line-height: 1.6;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: auto;
}

.demo-card {
  min-height: 190px;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  transition:
    transform var(--transition) ease,
    border-color var(--transition) ease,
    background var(--transition) ease,
    box-shadow var(--transition) ease;
}

.demo-card h2 {
  margin: 8px 0;
}

.demo-card--hover {
  cursor: pointer;
}

.demo-card--hover:hover {
  transform: translateY(-3px);
  border-color: #9bb9e5;
  background: #fbfdff;
  box-shadow: 0 12px 28px rgb(15 23 42 / 10%);
}

.demo-card--modal {
  grid-column: 1 / -1;
}

.field {
  display: grid;
  gap: 7px;
  margin-top: 20px;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.field input {
  height: 42px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  outline: none;
  font: inherit;
  transition: border-color var(--transition) ease, box-shadow var(--transition) ease;
}

.field input:focus {
  border-color: var(--primary-hover);
  box-shadow: 0 0 0 3px rgb(45 107 196 / 13%);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.button {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 7px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform var(--transition) ease,
    background var(--transition) ease,
    border-color var(--transition) ease,
    box-shadow var(--transition) ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button:active {
  transform: scale(.98);
}

.button:focus-visible,
.close-button:focus-visible {
  outline: 3px solid rgb(45 107 196 / 25%);
  outline-offset: 2px;
}

.button--primary {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
}

.button--primary:hover {
  border-color: var(--primary-hover);
  background: var(--primary-hover);
  box-shadow: 0 6px 16px rgb(26 77 161 / 20%);
}

.button--secondary {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
}

.button--secondary:hover {
  border-color: #9fb3cc;
  background: var(--surface-soft);
}

/* EFEITO PRINCIPAL:
   o elemento cobre a viewport e aplica blur no que estiver ATRÁS dele. */
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
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 28px 80px rgb(5 16 37 / 32%);
}

.modal-card > header,
.modal-card > footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
}

.modal-card > header {
  border-bottom: 1px solid var(--border);
}

.modal-card > header h2 {
  margin: 5px 0 0;
}

.modal-card > footer {
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  background: var(--surface-soft);
}

.modal-content {
  padding: 24px;
}

.close-button {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: #f1f5f9;
  color: #334155;
  font-size: 24px;
  cursor: pointer;
  transition: background var(--transition) ease, transform var(--transition) ease;
}

.close-button:hover {
  background: #e2e8f0;
  transform: rotate(4deg);
}

.code-tip {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #dbe7f8;
  border-radius: 9px;
  background: #f7faff;
  color: #334155;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 1.7;
}

/* Entrada e saída do backdrop + modal. */
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

@media (max-width: 720px) {
  .catalogo-ui {
    padding: 28px 18px;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .demo-card--modal {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}
</style>
