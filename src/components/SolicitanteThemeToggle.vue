<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSessionStore } from '@/stores/session'

const TEMA_STORAGE_KEY = 'sgl.theme'
type TemaAplicacao = 'light' | 'dark'

const session = useSessionStore()
const tema = ref<TemaAplicacao>(carregarTema())

const visivel = computed(() => {
  const perfil = session.usuario?.perfil
  return perfil === 'TECNICO'
    || perfil === 'ANALISTA'
    || perfil === 'PESQUISADOR'
    || perfil === 'ESTAGIARIO'
})

function carregarTema(): TemaAplicacao {
  try {
    return localStorage.getItem(TEMA_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function aplicarTema(novoTema: TemaAplicacao) {
  tema.value = novoTema
  document.body.classList.toggle('sgl-dark-active', novoTema === 'dark')
  document.body.classList.toggle('sgl-light-active', novoTema === 'light')

  try {
    localStorage.setItem(TEMA_STORAGE_KEY, novoTema)
  } catch {
    // Mantém a troca de tema funcional mesmo sem persistência local.
  }
}
</script>

<template>
  <div v-if="visivel" class="solicitante-theme-control" aria-label="Aparência">
    <span class="solicitante-theme-control__label">Aparência</span>

    <div class="solicitante-theme-toggle">
      <button
        type="button"
        title="Modo claro"
        aria-label="Ativar modo claro"
        :aria-pressed="tema === 'light'"
        :class="{ active: tema === 'light' }"
        @click="aplicarTema('light')"
      >
        ☀
      </button>
      <button
        type="button"
        title="Modo escuro"
        aria-label="Ativar modo escuro"
        :aria-pressed="tema === 'dark'"
        :class="{ active: tema === 'dark' }"
        @click="aplicarTema('dark')"
      >
        ☾
      </button>
    </div>
  </div>
</template>

<style scoped>
.solicitante-theme-control {
  position: fixed;
  z-index: 45;
  top: 11px;
  right: 132px;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 9px 0 11px;
  border: 1px solid #dbe3ee;
  border-radius: 9px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgb(15 23 42 / 7%);
}

.solicitante-theme-control__label {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.solicitante-theme-toggle {
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  border-radius: 7px;
  background: #f1f5f9;
}

.solicitante-theme-toggle button {
  width: 30px;
  height: 28px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}

.solicitante-theme-toggle button:hover {
  background: #e2e8f0;
  color: #1a4da1;
}

.solicitante-theme-toggle button.active {
  background: #1f5dbe;
  color: #ffffff;
}

:global(body.sgl-dark-active) .solicitante-theme-control {
  border-color: #2a3c55;
  background: #111e31;
  box-shadow: none;
}

:global(body.sgl-dark-active) .solicitante-theme-control__label {
  color: #a7b5c9;
}

:global(body.sgl-dark-active) .solicitante-theme-toggle {
  background: #17263d;
}

:global(body.sgl-dark-active) .solicitante-theme-toggle button {
  color: #9eacc0;
}

:global(body.sgl-dark-active) .solicitante-theme-toggle button:hover {
  background: #203855;
  color: #dce8fb;
}

:global(body.sgl-dark-active) .solicitante-theme-toggle button.active {
  background: #315fae;
  color: #ffffff;
}

@media (max-width: 860px) {
  .solicitante-theme-control__label {
    display: none;
  }

  .solicitante-theme-control {
    right: 118px;
    padding-inline: 4px;
  }
}

@media (max-width: 720px) {
  .solicitante-theme-control {
    top: 8px;
    right: 106px;
  }
}
</style>
