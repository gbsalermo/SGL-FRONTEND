<script setup lang="ts">
import logoEmbrapa from '@/assets/images/auth/embrapa-white.png'
import laboratorio from '@/assets/images/auth/login-laboratorio.jpg'
import logoPrincipal from '@/assets/images/auth/sgl-logo.png'
</script>

<template>
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
        <img
          :src="logoPrincipal"
          alt="SGL — Sistema de Gestão de Laboratórios"
          class="login-brand__logo"
        />

        <p class="login-brand__message">
          Gestão integrada para pedidos, estoque, lotes e relatórios.
        </p>

        <div
          class="login-brand__modules"
          aria-label="Pedidos, estoque, gestão e documentos"
        >
          <span class="login-brand__module">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
              <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
            </svg>
          </span>

          <span class="login-brand__module">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 4h16v16H4z" />
              <path d="M4 10h16M9 4v6M15 4v6M8 15h3M14 15h3" />
            </svg>
          </span>

          <span class="login-brand__module">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 4h10v3H7z" />
              <path d="M5 6h14v15H5z" />
              <path d="m8 11 1.5 1.5L12 10M8 16l1.5 1.5L12 15M14 11h2M14 16h2" />
            </svg>
          </span>

          <span class="login-brand__module">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 7h7l2 2h9v10H3z" />
              <path d="M3 7V5h7l2 2" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
      135deg,
      rgb(13 43 94 / 95%) 0%,
      rgb(18 55 116 / 92%) 48%,
      rgb(26 77 161 / 88%) 100%
    );
}

.login-brand::before,
.login-brand::after {
  content: '';
  position: absolute;
  z-index: 1;
  border-radius: 50%;
  background: rgb(255 255 255 / 5%);
  pointer-events: none;
}

.login-brand::before {
  width: 280px;
  height: 280px;
  top: -160px;
  left: -130px;
}

.login-brand::after {
  width: 360px;
  height: 360px;
  right: -195px;
  bottom: -185px;
}

.login-brand__content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(46px, 6vh, 70px);
  padding: clamp(34px, 4vw, 60px);
  color: #fff;
}

.login-brand__embrapa {
  width: clamp(150px, 12vw, 202px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 3px 10px rgb(0 0 0 / 16%));
}

.login-brand__identity {
  width: min(100%, 620px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.login-brand__logo {
  display: block;
  width: min(88%, 530px);
  max-height: 270px;
  object-fit: contain;
  filter: drop-shadow(0 8px 22px rgb(0 0 0 / 12%));
}

.login-brand__message {
  margin: 26px 0 0;
  max-width: 520px;
  color: rgb(255 255 255 / 95%);
  font-size: clamp(15px, 1.2vw, 18px);
  line-height: 1.6;
  text-shadow: 0 1px 6px rgb(0 0 0 / 14%);
}

.login-brand__modules {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 2.8vw, 40px);
  margin-top: 12px;
}

.login-brand__module {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  color: #ffffff;
}

.login-brand__module:nth-child(odd) {
  color: #8ed0a9;
}

.login-brand__module svg {
  width: 36px;
  height: 36px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.65;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (max-width: 1100px) {
  .login-brand__content {
    gap: 42px;
    padding: 38px;
  }

  .login-brand__embrapa {
    width: 150px;
  }

  .login-brand__logo {
    width: min(92%, 450px);
  }
}

@media (max-width: 840px) {
  .login-brand {
    min-height: 360px;
    background-position: center 55%;
  }

  .login-brand__content {
    min-height: 360px;
    gap: 24px;
    padding: 26px 24px 30px;
  }

  .login-brand__embrapa {
    width: 124px;
  }

  .login-brand__logo {
    width: min(86%, 420px);
  }

  .login-brand__message {
    margin-top: 18px;
    font-size: 14px;
  }

  .login-brand__modules {
    margin-top: 10px;
    gap: 16px;
  }

  .login-brand__module {
    width: 38px;
    height: 38px;
  }

  .login-brand__module svg {
    width: 29px;
    height: 29px;
  }
}

@media (max-width: 480px) {
  .login-brand,
  .login-brand__content {
    min-height: 300px;
  }

  .login-brand__embrapa {
    width: 112px;
  }

  .login-brand__logo {
    width: min(92%, 320px);
  }

  .login-brand__message {
    max-width: 300px;
  }

  .login-brand__modules {
    margin-top: 8px;
    gap: 14px;
  }

  .login-brand__module {
    width: 32px;
    height: 32px;
  }

  .login-brand__module svg {
    width: 25px;
    height: 25px;
  }
}
</style>
