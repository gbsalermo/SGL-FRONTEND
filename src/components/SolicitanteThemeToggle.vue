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
    <span class="solicitante-theme-toggle__label">Aparência</span>

    <div class="solicitante-theme-toggle__options">
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
.solicitante-theme-toggle {
  position: fixed;
  z-index: 45;
  top: 118px;
  left: 18px;
  width: 222px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 8px 7px 12px;
  border: 1px solid rgb(255 255 255 / 11%);
  border-radius: 8px;
  background: rgb(255 255 255 / 4%);
  color: #eef4ff;
}

.solicitante-theme-toggle__label {
  font-size: 13px;
  font-weight: 600;
}

.solicitante-theme-toggle__options {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 7px;
  background: rgb(4 14 35 / 32%);
}

.solicitante-theme-toggle button {
  width: 30px;
  height: 28px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #9fb0ca;
  font-size: 15px;
  cursor: pointer;
  transition: background var(--sgl-transition-fast) ease, color var(--sgl-transition-fast) ease;
}

.solicitante-theme-toggle button:hover {
  background: rgb(45 107 196 / 22%);
  color: #ffffff;
}

.solicitante-theme-toggle button.active {
  background: #2d62c8;
  color: #ffffff;
}

/* Reserva o mesmo bloco estrutural da opção Aparência da Gestão. */
:global(.solicitante-nav) {
  padding-top: 88px !important;
}

:global(body.sgl-dark-active) .solicitante-theme-toggle {
  border-color: #2a3c55;
  background: #0f1d31;
  color: #f4f7fc;
}

:global(body.sgl-dark-active) .solicitante-theme-toggle__options {
  border-color: #2a3c55;
  background: #0b1728;
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
    top: 112px;
    left: 14px;
    width: 214px;
  }
}
</style>
