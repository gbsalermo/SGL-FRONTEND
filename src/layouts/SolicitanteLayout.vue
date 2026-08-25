<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import logoSgl from '@/assets/images/auth/sgl-logo.png'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()

const iniciais = computed(() => {
  const nome = session.usuario?.nome ?? 'Usuário'
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('')
})

function sair() {
  session.sair()
  router.replace('/login')
}
</script>

<template>
  <div class="solicitante-shell">
    <aside class="solicitante-sidebar">
      <div class="solicitante-sidebar__brand">
        <img :src="logoSgl" alt="SGL — Sistema de Gestão de Laboratórios" />
      </div>

      <nav class="solicitante-nav" aria-label="Navegação principal">
        <p class="solicitante-nav__group">PRINCIPAL</p>

        <router-link class="solicitante-nav__item" to="/meus-pedidos">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4h14v16H5z" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
          <span>Meus pedidos</span>
        </router-link>

        <p class="solicitante-nav__group solicitante-nav__group--spaced">SOLICITAÇÕES</p>

        <router-link class="solicitante-nav__item" to="/pedidos/novo">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Novo pedido</span>
        </router-link>
      </nav>

      <div class="solicitante-sidebar__user">
        <div class="solicitante-avatar">{{ iniciais }}</div>
        <div class="solicitante-usercopy">
          <strong>{{ session.usuario?.nome }}</strong>
          <span>{{ session.usuario?.email }}</span>
          <small>{{ session.usuario?.perfil }}</small>
        </div>
      </div>
    </aside>

    <div class="solicitante-workspace">
      <header class="solicitante-topbar">
        <div class="solicitante-topbar__context">
          <strong>{{ session.usuario?.laboratorioNome ?? 'Laboratório não vinculado' }}</strong>
          <span>{{ session.usuario?.unidadeNome ?? 'Unidade não vinculada' }}</span>
        </div>

        <button class="solicitante-logout" type="button" @click="sair">
          <span>Sair</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />
          </svg>
        </button>
      </header>

      <main class="solicitante-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.solicitante-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 258px minmax(0, 1fr);
  background: var(--sgl-background);
  color: var(--sgl-text);
}

.solicitante-sidebar {
  position: sticky;
  top: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 18px 20px;
  background:
    linear-gradient(180deg, #07142f 0%, #0d2147 100%);
  color: #fff;
}

.solicitante-sidebar__brand {
  min-height: 92px;
  display: grid;
  place-items: center;
  border-bottom: 1px solid rgb(255 255 255 / 11%);
}

.solicitante-sidebar__brand img {
  width: 178px;
  max-height: 74px;
  object-fit: contain;
  filter: drop-shadow(0 4px 14px rgb(0 0 0 / 22%));
}

.solicitante-nav {
  padding-top: 28px;
}

.solicitante-nav__group {
  margin: 0 10px 10px;
  color: #8fa3c4;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.solicitante-nav__group--spaced {
  margin-top: 28px;
}

.solicitante-nav__item {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 46px;
  padding: 0 13px;
  border-radius: 8px;
  color: #eef4ff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition:
    background var(--sgl-transition-fast) ease,
    transform var(--sgl-transition-fast) ease;
}

.solicitante-nav__item + .solicitante-nav__item {
  margin-top: 6px;
}

.solicitante-nav__item:hover {
  background: rgb(45 107 196 / 19%);
}

.solicitante-nav__item.router-link-active {
  background: linear-gradient(135deg, #1a4da1, #214fb8);
}

.solicitante-nav__item svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.solicitante-sidebar__user {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 18px 4px 2px;
  border-top: 1px solid rgb(255 255 255 / 11%);
}

.solicitante-avatar {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #2d6bc4;
  color: #fff;
  font-weight: 800;
}

.solicitante-usercopy {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.solicitante-usercopy strong,
.solicitante-usercopy span,
.solicitante-usercopy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.solicitante-usercopy strong {
  font-size: 13px;
}

.solicitante-usercopy span {
  margin-top: 2px;
  color: #aebed7;
  font-size: 11px;
}

.solicitante-usercopy small {
  margin-top: 5px;
  color: #83a8ff;
  font-size: 10px;
  font-weight: 700;
}

.solicitante-workspace {
  min-width: 0;
}

.solicitante-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: #08162f;
  color: #fff;
  box-shadow: 0 4px 14px rgb(6 18 40 / 8%);
}

.solicitante-topbar__context {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.solicitante-topbar__context strong {
  font-size: 13px;
}

.solicitante-topbar__context span {
  color: #9fb0ca;
  font-size: 11px;
}

.solicitante-logout {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 0 14px;
  border: 1px solid rgb(255 255 255 / 23%);
  border-radius: 7px;
  background: transparent;
  color: #fff;
  cursor: pointer;
}

.solicitante-logout:hover {
  background: rgb(255 255 255 / 7%);
}

.solicitante-logout svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.solicitante-main {
  min-height: calc(100vh - 72px);
  padding: 30px;
  background:
    radial-gradient(circle at top left, rgb(45 107 196 / 6%), transparent 28%),
    var(--sgl-background);
}

@media (max-width: 900px) {
  .solicitante-shell {
    grid-template-columns: 1fr;
  }

  .solicitante-sidebar {
    position: static;
    min-height: auto;
    padding: 14px 18px;
  }

  .solicitante-sidebar__brand {
    min-height: 58px;
    border-bottom: 0;
  }

  .solicitante-sidebar__brand img {
    width: 145px;
  }

  .solicitante-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding-top: 12px;
  }

  .solicitante-nav__group,
  .solicitante-sidebar__user {
    display: none;
  }

  .solicitante-topbar {
    position: static;
    min-height: 62px;
    padding-inline: 18px;
  }

  .solicitante-main {
    min-height: calc(100vh - 62px);
    padding: 20px;
  }
}

@media (max-width: 560px) {
  .solicitante-topbar__context {
    max-width: 68%;
  }

  .solicitante-logout span {
    display: none;
  }

  .solicitante-main {
    padding: 16px;
  }
}
</style>
