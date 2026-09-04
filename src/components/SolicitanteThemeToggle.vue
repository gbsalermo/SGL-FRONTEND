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
  <div v-if="visivel" class="solicitante-theme-toggle" aria-label="Aparência">
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
</template>

<style scoped>
.solicitante-theme-toggle {
  position: fixed;
  z-index: 45;
  top: 17px;
  right: 102px;
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  border: 1px solid #dbe3ee;
  border-radius: 9px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgb(15 23 42 / 7%);
}

.solicitante-theme-toggle button {
  width: 32px;
  height: 30px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
}

.solicitante-theme-toggle button.active {
  background: #1f5dbe;
  color: #ffffff;
}

:global(body.sgl-dark-active) .solicitante-theme-toggle {
  border-color: #2a3c55;
  background: #111e31;
  box-shadow: none;
}

:global(body.sgl-dark-active) .solicitante-theme-toggle button {
  color: #9eacc0;
}

:global(body.sgl-dark-active) .solicitante-theme-toggle button.active {
  background: #315fae;
  color: #ffffff;
}

@media (max-width: 720px) {
  .solicitante-theme-toggle {
    top: 12px;
    right: 84px;
  }
}
</style>
