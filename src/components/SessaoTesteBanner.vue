<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { ROTULOS_PERFIL } from '@/modules/auth/perfis'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()
const router = useRouter()

const visivel = computed(() => session.autenticado && session.sessaoDeTeste && Boolean(session.usuario))

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
/* In normal flow on purpose: it pushes the app down instead of covering the navigation. */
.sessao-teste {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 48px;
  padding: 0 32px;
  background: #fff7e6;
  border-bottom: 1px solid #f5d38a;
  color: #7a4b00;
  font-size: 14px;
}

.sessao-teste__texto { margin: 0; }

.sessao-teste__botao {
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
