<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'

import { ROTULOS_PERFIL } from '@/modules/auth/perfis'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()
const router = useRouter()

const visivel = computed(() => session.autenticado && session.sessaoDeTeste && Boolean(session.usuario))

const VARIAVEL_ALTURA = '--sgl-faixa-teste-altura'
// Single source of truth: published to the layouts and bound into the CSS below.
const ALTURA_FAIXA = '48px'

// Layouts with fixed sidebars read this variable to start below the banner instead of under it.
watch(visivel, (mostrando) => {
  const raiz = document.documentElement.style
  if (mostrando) raiz.setProperty(VARIAVEL_ALTURA, ALTURA_FAIXA)
  else raiz.removeProperty(VARIAVEL_ALTURA)
}, { immediate: true })

onBeforeUnmount(() => document.documentElement.style.removeProperty(VARIAVEL_ALTURA))

const descricao = computed(() => {
  const usuario = session.usuario
  if (!usuario) return ''
  return [ROTULOS_PERFIL[usuario.perfil], usuario.unidadeSigla].filter(Boolean).join(' · ')
})

async function trocarUsuario() {
  // The session must end first: the global route guard would otherwise redirect a pending user
  // away from /login/teste before the page could clear the session itself.
  session.sair()
  await router.push('/login/teste')
}
</script>

<template>
  <div v-if="visivel" class="sessao-teste" data-test="faixa-teste" role="status">
    <p class="sessao-teste__texto">
      <span aria-hidden="true">⚠ </span><strong>Sessão de teste</strong> como
      <strong>{{ session.usuario?.nome }}</strong> · {{ descricao }}
    </p>
    <button type="button" class="sessao-teste__botao" data-test="trocar" @click="trocarUsuario">
      Trocar usuário
    </button>
  </div>
</template>

<style scoped>
/* Takes space in the flow (pushing the app down) but sticks on scroll, so the layouts' 48px offsets
   stay valid. z-index sits above the Gestao sidebar (30) and the theme toggle (45). */
.sessao-teste {
  position: sticky;
  top: 0;
  z-index: 50;
  box-sizing: border-box;
  height: v-bind(ALTURA_FAIXA);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 32px;
  background: #fff7e6;
  border-bottom: 1px solid #f5d38a;
  color: #7a4b00;
  font-size: 14px;
}

.sessao-teste__texto { flex: 1 1 auto; min-width: 0; margin: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.sessao-teste__botao {
  flex: none;
  padding: 6px 20px;
  border: 1px solid #f5d38a;
  border-radius: 8px;
  background: #fff;
  color: #7a4b00;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.sessao-teste__botao:hover { background: #fffaf0; }
.sessao-teste__botao:focus-visible { outline: 2px solid #7a4b00; outline-offset: 2px; }
</style>
