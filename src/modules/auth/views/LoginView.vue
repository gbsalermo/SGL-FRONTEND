<script setup lang="ts">
import { ref } from 'vue'

import logoEmbrapa from '@/assets/images/embrapa-white.png'
import laboratorio from '@/assets/images/login-laboratorio.jpg.jpg'
import logoSgl from '@/assets/images/sgl-logo.png.png'
import simboloSgl from '@/assets/images/sgl-modules.png'

const usuario = ref('')
const senha = ref('')
const mostrarSenha = ref(false)

function entrar() {
  // A autenticação real será integrada em uma etapa posterior.
}
</script>

<template>
  <main class="login-page">
    <section
      class="login-brand"
      aria-label="Apresentação do SGL"
      :style="{ backgroundImage: `url(${laboratorio})` }"
    >
      <div class="login-brand__overlay" />

      <div class="login-brand__content">
        <img
          :src="logoEmbrapa"
          alt="Embrapa"
          class="login-brand__embrapa"
        />

        <div class="login-brand__identity">
          <div class="sgl-mark">
            <img
              :src="simboloSgl"
              alt=""
              aria-hidden="true"
              class="sgl-mark__symbol"
            />

            <div class="sgl-mark__logo-surface">
              <img
                :src="logoSgl"
                alt="SGL — Sistema de Gestão de Laboratórios"
                class="sgl-mark__logo"
              />
            </div>
          </div>

          <p class="login-brand__message">
            Gestão integrada para pedidos, estoque, lotes e relatórios.
          </p>
        </div>
      </div>
    </section>

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
              <svg
                class="login-field__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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
              <svg
                class="login-field__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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
                <svg
                  v-if="!mostrarSenha"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>

                <svg
                  v-else
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="m3 3 18 18M10.7 6.1A9 9 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-2.1 2.8M6.2 6.2C3.8 8 2.5 12 2.5 12S6 18 12 18c1.5 0 2.8-.4 4-1" />
                </svg>
              </button>
            </div>
          </div>

          <button class="login-submit" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  background: var(--sgl-surface, #ffffff);
  color: var(--sgl-text, #1a1a2e);
}

.login-brand {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background-color: var(--sgl-primary-dark, #0d2b5e);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.login-brand__overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgb(13 43 94 / 78%) 0%,
      rgb(26 77 161 / 74%) 48%,
      rgb(13 43 94 / 84%) 100%
    );
}

.login-brand::before,
.login-brand::after {
  content: '';
  position: absolute;
  z-index: 1;
  border-radius: 50%;
  background: rgb(255 255 255 / 7%);
  pointer-events: none;
}

.login-brand::before {
  width: 280px;
  height: 280px;
  top: -150px;
  left: -120px;
}

.login-brand::after {
  width: 330px;
  height: 330px;
  right: -160px;
  bottom: -170px;
}

.login-brand__content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(38px, 5vw, 72px);
  color: #fff;
}

.login-brand__embrapa {
  width: clamp(126px, 11vw, 178px);
  height: auto;
  margin: clamp(18px, 4vh, 52px) 0 0;
  object-fit: contain;
  filter: drop-shadow(0 3px 8px rgb(0 0 0 / 16%));
}

.login-brand__identity {
  width: min(100%, 660px);
  margin: auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.sgl-mark {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(16px, 2vw, 26px);
}

.sgl-mark__symbol {
  width: clamp(104px, 9vw, 142px);
  aspect-ratio: 420 / 323;
  flex: 0 0 auto;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 20%);
}

.sgl-mark__logo-surface {
  width: min(72%, 440px);
  padding: 12px 16px;
  border: 1px solid rgb(255 255 255 / 36%);
  border-radius: 12px;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 10px 30px rgb(0 0 0 / 14%);
  backdrop-filter: blur(4px);
}

.sgl-mark__logo {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.login-brand__message {
  margin: 38px 0 0;
  color: rgb(255 255 255 / 94%);
  font-size: clamp(15px, 1.2vw, 18px);
  font-weight: 400;
  line-height: 1.6;
  text-shadow: 0 2px 7px rgb(0 0 0 / 16%);
}

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

.login-submit {
  min-height: 62px;
  margin-top: 8px;
  border: 0;
  border-radius: var(--sgl-radius-control, 6px);
  background: linear-gradient(
    135deg,
    var(--sgl-primary, #1a4da1),
    var(--sgl-primary-dark, #0d2b5e)
  );
  color: #fff;
  font-size: 17px;
  font-weight: 750;
  cursor: pointer;
  transition:
    box-shadow var(--sgl-transition-fast, 180ms) ease,
    filter var(--sgl-transition-fast, 180ms) ease,
    transform 100ms ease;
}

.login-submit:hover {
  filter: brightness(0.96);
  box-shadow: 0 8px 20px rgb(26 77 161 / 18%);
}

.login-submit:active {
  transform: translateY(1px);
}

.login-submit:focus-visible {
  outline: 3px solid rgb(45 107 196 / 28%);
  outline-offset: 3px;
}

@media (max-width: 1100px) {
  .login-page {
    grid-template-columns: 46% 54%;
  }

  .login-brand__content {
    padding: 38px;
  }

  .sgl-mark {
    gap: 13px;
  }

  .sgl-mark__symbol {
    width: 92px;
  }

  .sgl-mark__logo-surface {
    width: min(72%, 360px);
  }

  .login-access {
    padding-inline: 52px;
  }
}

@media (max-width: 840px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-brand,
  .login-brand__content {
    min-height: 350px;
  }

  .login-brand {
    background-position: center 55%;
  }

  .login-brand__content {
    padding: 26px 24px 30px;
  }

  .login-brand__embrapa {
    width: 118px;
    margin-top: 0;
  }

  .login-brand__identity {
    margin-top: 28px;
  }

  .sgl-mark__symbol {
    width: 78px;
    border-radius: 14px;
  }

  .sgl-mark__logo-surface {
    width: min(70%, 310px);
    padding: 8px 10px;
  }

  .login-brand__message {
    margin-top: 20px;
    font-size: 14px;
  }

  .login-access {
    min-height: auto;
    padding: 54px 24px 68px;
  }

  .login-header {
    margin-bottom: 42px;
  }
}

@media (max-width: 480px) {
  .login-brand,
  .login-brand__content {
    min-height: 300px;
  }

  .sgl-mark {
    gap: 9px;
  }

  .sgl-mark__symbol {
    width: 62px;
    border-radius: 10px;
  }

  .sgl-mark__logo-surface {
    width: min(72%, 245px);
    padding: 7px 9px;
  }

  .login-brand__message {
    max-width: 300px;
  }

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
