<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import LoginBrandPanel from '../components/LoginBrandPanel.vue'
import { ehPerfilGestao } from '@/modules/auth/perfis'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()

const verificando = ref(false)
const aviso = ref('')

async function verificarNovamente() {
  aviso.value = ''
  verificando.value = true
  try {
    const usuario = await session.atualizarUsuario()
    if (usuario.situacao === 'ATIVO') {
      await router.replace(ehPerfilGestao(usuario.perfil) ? '/dashboard' : '/inicio')
      return
    }
    aviso.value = 'Seu acesso ainda não foi liberado.'
  } catch {
    aviso.value = 'Não foi possível verificar agora. Tente novamente em instantes.'
  } finally {
    verificando.value = false
  }
}

async function sair() {
  session.sair()
  await router.replace('/login')
}
</script>

<template>
  <main class="aguardando-page">
    <LoginBrandPanel />

    <section class="aguardando" aria-labelledby="aguardando-title">
      <div class="aguardando__content">
        <h1 id="aguardando-title">Aguardando aprovação</h1>
        <p class="aguardando__texto">
          Seu acesso ao SGL foi registrado. Um gestor da sua Unidade precisa liberar seu laboratório e perfil.
        </p>
        <p v-if="session.usuario" class="aguardando__quem">
          {{ session.usuario.nome }}<span v-if="session.usuario.unidadeSigla"> · {{ session.usuario.unidadeSigla }}</span>
        </p>

        <p v-if="aviso" class="aguardando__aviso" role="status">{{ aviso }}</p>

        <div class="aguardando__acoes">
          <button class="aguardando__primario" type="button" :disabled="verificando" @click="verificarNovamente">
            {{ verificando ? 'Verificando...' : 'Verificar novamente' }}
          </button>
          <button class="aguardando__secundario" type="button" @click="sair">Sair</button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.aguardando-page {
  /* Same fixed light identity as the login page, which this screen continues. */
  --sgl-primary: #1a4da1;
  --sgl-primary-dark: #0d2b5e;
  --sgl-surface: #ffffff;
  --sgl-text: #1a1a2e;
  --sgl-text-muted: #64748b;
  --sgl-border: #e2e8f0;

  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  background: #ffffff;
  color: #1a1a2e;
  color-scheme: light;
}

.aguardando {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px clamp(24px, 7vw, 112px);
}

.aguardando__content {
  width: min(100%, 500px);
  text-align: center;
}

.aguardando h1 {
  margin: 0;
  color: var(--sgl-text);
  font-size: clamp(28px, 2.5vw, 38px);
  font-weight: 750;
  letter-spacing: -0.03em;
}

.aguardando__texto {
  margin: 16px 0 0;
  color: var(--sgl-text-muted);
  font-size: 17px;
  line-height: 1.55;
}

.aguardando__quem {
  margin: 20px 0 0;
  color: var(--sgl-text);
  font-weight: 650;
}

.aguardando__aviso {
  margin: 20px 0 0;
  padding: 10px 12px;
  border: 1px solid var(--sgl-border);
  border-radius: 6px;
  background: #f5f7fa;
  color: var(--sgl-text-muted);
  font-size: 14px;
}

.aguardando__acoes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 36px;
}

.aguardando__primario,
.aguardando__secundario {
  min-height: 56px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.aguardando__primario {
  border: 0;
  background: var(--sgl-primary);
  color: #fff;
}

.aguardando__primario:hover:not(:disabled) {
  background: var(--sgl-primary-dark);
}

.aguardando__primario:disabled {
  opacity: 0.65;
  cursor: wait;
}

.aguardando__secundario {
  border: 1px solid var(--sgl-border);
  background: transparent;
  color: var(--sgl-text);
}

.aguardando__primario:focus-visible,
.aguardando__secundario:focus-visible {
  outline: 3px solid rgb(45 107 196 / 28%);
  outline-offset: 3px;
}

@media (max-width: 840px) {
  .aguardando-page {
    grid-template-columns: 1fr;
  }

  .aguardando {
    min-height: auto;
    padding: 54px 24px 68px;
  }
}
</style>
