<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()

const usuario = ref('')
const senha = ref('')
const mostrarSenha = ref(false)
const carregando = ref(false)
const erro = ref('')

async function entrar() {
  erro.value = ''
  carregando.value = true

  try {
    const usuarioAutenticado = await session.entrarDesenvolvimento(usuario.value, senha.value)
    const perfil = usuarioAutenticado.perfil

    await router.replace(
      perfil === 'GESTOR' || perfil === 'ADMINISTRADOR'
        ? '/pedidos'
        : '/meus-pedidos',
    )
  } catch (error) {
    erro.value = error instanceof Error ? error.message : 'Não foi possível acessar o sistema.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <section class="login-access" aria-labelledby="login-title">
    <div class="login-access__content">
      <header class="login-header">
        <h1 id="login-title">Bem-vindo</h1>
        <p>Acesse o sistema para continuar</p>
      </header>

      <form class="login-form" @submit.prevent="entrar">
        <div class="login-field">
          <label for="usuario">Usuário de colaborador</label>

          <div class="login-field__control">
            <svg class="login-field__icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </svg>

            <input
              id="usuario"
              v-model="usuario"
              name="usuario"
              type="text"
              autocomplete="username"
              placeholder="Digite seu usuário de colaborador"
            />
          </div>
        </div>

        <div class="login-field">
          <label for="senha">Senha</label>

          <div class="login-field__control">
            <svg class="login-field__icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
            </svg>

            <input
              id="senha"
              v-model="senha"
              name="senha"
              :type="mostrarSenha ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Digite sua senha"
            />

            <button
              class="login-field__visibility"
              type="button"
              :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
              @click="mostrarSenha = !mostrarSenha"
            >
              <svg v-if="!mostrarSenha" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>

              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path d="m3 3 18 18M10.7 6.1A9 9 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-2.1 2.8M6.2 6.2C3.8 8 2.5 12 2.5 12S6 18 12 18c1.5 0 2.8-.4 4-1" />
              </svg>
            </button>
          </div>
        </div>

        <p v-if="erro" class="login-error" role="alert">{{ erro }}</p>

        <button class="login-submit" type="submit" :disabled="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.login-access {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px clamp(36px, 7vw, 112px);
  background: var(--sgl-surface, #ffffff);
}

.login-access__content {
  width: min(100%, 500px);
}

.login-header {
  margin-bottom: 56px;
  text-align: center;
}

.login-header h1 {
  margin: 0;
  color: var(--sgl-text, #1a1a2e);
  font-size: clamp(30px, 2.5vw, 40px);
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.035em;
}

.login-header p {
  margin: 13px 0 0;
  color: var(--sgl-text-muted, #64748b);
  font-size: 17px;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 29px;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.login-field label {
  color: var(--sgl-text, #1a1a2e);
  font-size: 15px;
  font-weight: 700;
}

.login-field__control {
  min-height: 62px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 18px;
  border: 1px solid var(--sgl-border, #e2e8f0);
  border-radius: var(--sgl-radius-control, 6px);
  background: #fff;
  transition:
    border-color var(--sgl-transition-fast, 180ms) ease,
    box-shadow var(--sgl-transition-fast, 180ms) ease;
}

.login-field__control:focus-within {
  border-color: var(--sgl-primary, #1a4da1);
  box-shadow: 0 0 0 3px rgb(26 77 161 / 11%);
}

.login-field__icon {
  width: 25px;
  height: 25px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--sgl-text-muted, #64748b);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login-field input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--sgl-text, #1a1a2e);
  font-size: 16px;
}

.login-field input::placeholder {
  color: #94a3b8;
  opacity: 1;
}

.login-field__visibility {
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--sgl-text-muted, #64748b);
  cursor: pointer;
  transition:
    color var(--sgl-transition-fast, 180ms) ease,
    background var(--sgl-transition-fast, 180ms) ease;
}

.login-field__visibility:hover {
  color: var(--sgl-primary, #1a4da1);
  background: rgb(26 77 161 / 7%);
}

.login-field__visibility:focus-visible {
  outline: 2px solid var(--sgl-primary, #1a4da1);
  outline-offset: 2px;
}

.login-field__visibility svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login-error {
  margin: -10px 0 -5px;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fff1f1;
  color: #b42318;
  font-size: 12px;
}

.login-submit {
  min-height: 62px;
  margin-top: 8px;
  border: 0;
  border-radius: var(--sgl-radius-control, 6px);
  background: var(--sgl-primary, #1a4da1);
  color: #fff;
  font-size: 17px;
  font-weight: 750;
  cursor: pointer;
  transition:
    background var(--sgl-transition-fast, 180ms) ease,
    box-shadow var(--sgl-transition-fast, 180ms) ease,
    transform 100ms ease;
}

.login-submit:hover:not(:disabled) {
  background: var(--sgl-primary-dark, #0d2b5e);
  box-shadow: 0 8px 20px rgb(26 77 161 / 18%);
}

.login-submit:disabled {
  opacity: 0.65;
  cursor: wait;
}

.login-submit:active {
  transform: translateY(1px);
}

.login-submit:focus-visible {
  outline: 3px solid rgb(45 107 196 / 28%);
  outline-offset: 3px;
}

@media (max-width: 1100px) {
  .login-access {
    padding-inline: 52px;
  }
}

@media (max-width: 840px) {
  .login-access {
    min-height: auto;
    padding: 54px 24px 68px;
  }

  .login-header {
    margin-bottom: 42px;
  }
}

@media (max-width: 480px) {
  .login-header h1 {
    font-size: 28px;
  }

  .login-header p {
    font-size: 15px;
  }

  .login-field__control,
  .login-submit {
    min-height: 58px;
  }
}
</style>
