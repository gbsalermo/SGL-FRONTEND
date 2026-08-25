<script setup lang="ts">
import { ref } from 'vue'

const usuario = ref('')
const senha = ref('')
const mostrarSenha = ref(false)

function entrar() {
  // A autenticação real será integrada em uma etapa posterior.
}
</script>

<template>
  <main class="login-page">
    <section class="login-brand" aria-label="Apresentação do SGL">
      <div class="login-brand__content">
        <p class="login-brand__embrapa" aria-label="Embrapa">Embrapa</p>

        <div class="login-brand__identity">
          <div class="sgl-mark" aria-label="SGL — Sistema de Gestão de Laboratórios">
            <div class="sgl-mark__symbol" aria-hidden="true">
              <svg viewBox="0 0 90 90" role="img">
                <path d="M35 12h20M39 12v20L24 65c-3 8 2 13 11 13h20c9 0 14-5 11-13L51 32V12" />
                <path d="M29 59c11 5 22-7 34-2l4 13c1 4-2 7-7 7H31c-5 0-8-3-7-7l5-11Z" class="sgl-mark__liquid" />
                <circle cx="65" cy="28" r="5" class="sgl-mark__accent" />
                <path d="M57 36c12 2 19 11 20 22" class="sgl-mark__accent-line" />
              </svg>
            </div>

            <div class="sgl-mark__wording">
              <strong>SGL</strong>
              <span>Sistema de Gestão de Laboratórios</span>
            </div>
          </div>

          <div class="login-brand__modules" aria-hidden="true">
            <span>
              <svg viewBox="0 0 24 24">
                <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
                <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
              </svg>
            </span>
            <span>
              <svg viewBox="0 0 24 24">
                <path d="M4 4h16v16H4zM4 10h16M9 4v6M15 4v6M8 15h3M14 15h3" />
              </svg>
            </span>
            <span>
              <svg viewBox="0 0 24 24">
                <path d="M7 4h10v3H7zM5 6h14v15H5z" />
                <path d="m8 11 1.5 1.5L12 10M8 16l1.5 1.5L12 15M14 11h2M14 16h2" />
              </svg>
            </span>
            <span>
              <svg viewBox="0 0 24 24">
                <path d="M3 7h7l2 2h9v10H3zM3 7V5h7l2 2" />
              </svg>
            </span>
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
          <h1 id="login-title">Bem-vindo de volta!</h1>
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

          <button class="login-submit" type="submit">Entrar</button>
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
  background: var(--sgl-surface);
  color: var(--sgl-text);
}

.login-brand {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background-image:
    linear-gradient(180deg, rgb(13 43 94 / 76%), rgb(26 77 161 / 82%)),
    url('https://images.unsplash.com/photo-1631556759511-6ce895fbf0ad?auto=format&fit=crop&w=1800&q=85');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.login-brand::before,
.login-brand::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgb(255 255 255 / 8%);
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
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(38px, 5vw, 72px);
  color: #fff;
}

.login-brand__embrapa {
  margin: clamp(18px, 4vh, 52px) 0 0;
  font-size: clamp(25px, 2.2vw, 34px);
  font-weight: 800;
  font-style: italic;
  line-height: 1;
  letter-spacing: -0.045em;
}

.login-brand__identity {
  width: min(100%, 590px);
  margin: auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.sgl-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
}

.sgl-mark__symbol {
  width: clamp(88px, 8vw, 126px);
  height: clamp(88px, 8vw, 126px);
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: linear-gradient(145deg, rgb(45 107 196 / 60%), rgb(13 43 94 / 80%));
  border: 1px solid rgb(255 255 255 / 22%);
  box-shadow: inset 0 0 28px rgb(255 255 255 / 8%);
}

.sgl-mark__symbol svg {
  width: 78%;
  height: 78%;
  fill: none;
  stroke: #fff;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sgl-mark__symbol .sgl-mark__liquid {
  fill: rgb(0 122 61 / 88%);
  stroke: #78c696;
}

.sgl-mark__symbol .sgl-mark__accent {
  fill: #58b47f;
  stroke: #a5d6a7;
}

.sgl-mark__symbol .sgl-mark__accent-line {
  stroke: #74c694;
}

.sgl-mark__wording {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.sgl-mark__wording strong {
  font-size: clamp(76px, 8.2vw, 132px);
  font-weight: 800;
  line-height: 0.82;
  letter-spacing: 0.04em;
  text-shadow: 0 4px 18px rgb(0 0 0 / 18%);
}

.sgl-mark__wording span {
  margin-top: 15px;
  font-size: clamp(10px, 0.85vw, 13px);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.login-brand__modules {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(22px, 2.7vw, 38px);
  margin-top: 38px;
}

.login-brand__modules span {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  color: #fff;
}

.login-brand__modules span:nth-child(odd) {
  color: #8bd0a6;
}

.login-brand__modules svg {
  width: 34px;
  height: 34px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.55;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login-brand__message {
  margin: 42px 0 0;
  color: rgb(255 255 255 / 92%);
  font-size: clamp(15px, 1.25vw, 19px);
  line-height: 1.6;
}

.login-access {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px clamp(36px, 7vw, 112px);
  background: #fff;
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
  color: var(--sgl-text);
  font-size: clamp(30px, 2.5vw, 40px);
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.035em;
}

.login-header p {
  margin: 13px 0 0;
  color: var(--sgl-text-muted);
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
  color: var(--sgl-text);
  font-size: 15px;
  font-weight: 700;
}

.login-field__control {
  min-height: 62px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 18px;
  border: 1px solid #cbd5e1;
  border-radius: var(--sgl-radius-control);
  background: #fff;
  transition:
    border-color var(--sgl-transition-fast) ease,
    box-shadow var(--sgl-transition-fast) ease;
}

.login-field__control:focus-within {
  border-color: var(--sgl-primary);
  box-shadow: 0 0 0 3px rgb(26 77 161 / 11%);
}

.login-field__icon {
  width: 25px;
  height: 25px;
  flex: 0 0 auto;
  fill: none;
  stroke: #64748b;
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
  color: var(--sgl-text);
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
  color: #64748b;
  cursor: pointer;
  transition:
    color var(--sgl-transition-fast) ease,
    background var(--sgl-transition-fast) ease;
}

.login-field__visibility:hover {
  color: var(--sgl-primary);
  background: rgb(26 77 161 / 7%);
}

.login-field__visibility:focus-visible {
  outline: 2px solid var(--sgl-primary);
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
  border-radius: var(--sgl-radius-control);
  background: linear-gradient(135deg, #1a4da1, #244fb2);
  color: #fff;
  font-size: 17px;
  font-weight: 750;
  cursor: pointer;
  transition:
    background var(--sgl-transition-fast) ease,
    box-shadow var(--sgl-transition-fast) ease,
    transform 100ms ease;
}

.login-submit:hover {
  background: linear-gradient(135deg, #163f87, #1f469e);
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
    gap: 15px;
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
    min-height: 320px;
  }

  .login-brand__content {
    padding: 26px 24px 30px;
  }

  .login-brand__embrapa {
    margin-top: 0;
    font-size: 22px;
  }

  .login-brand__identity {
    margin-top: 32px;
  }

  .sgl-mark__symbol {
    width: 78px;
    height: 78px;
    border-radius: 17px;
  }

  .sgl-mark__wording strong {
    font-size: 68px;
  }

  .sgl-mark__wording span {
    margin-top: 10px;
    font-size: 8px;
  }

  .login-brand__modules {
    margin-top: 22px;
    gap: 20px;
  }

  .login-brand__modules span {
    width: 30px;
    height: 30px;
  }

  .login-brand__modules svg {
    width: 27px;
    height: 27px;
  }

  .login-brand__message {
    margin-top: 19px;
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
    min-height: 270px;
  }

  .sgl-mark__symbol {
    width: 64px;
    height: 64px;
  }

  .sgl-mark__wording strong {
    font-size: 53px;
  }

  .sgl-mark__wording span {
    max-width: 210px;
    font-size: 7px;
    letter-spacing: 0.13em;
  }

  .login-brand__modules {
    display: none;
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
