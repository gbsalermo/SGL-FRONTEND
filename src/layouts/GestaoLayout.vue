<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import logoSgl from '@/assets/images/auth/sgl-logo.png'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()
const recolhida = ref(false)
const alertasAbertos = ref(true)

const iniciais = computed(() =>
  (session.usuario?.nome ?? 'Usuário')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join(''),
)

function sair() {
  session.sair()
  router.replace('/login')
}
</script>

<template>
  <div class="gestao-shell" :class="{ 'gestao-shell--collapsed': recolhida }">
    <aside class="gestao-sidebar">
      <div class="gestao-brand">
        <img :src="logoSgl" alt="SGL — Sistema de Gestão de Laboratórios" />
        <button type="button" :aria-label="recolhida ? 'Expandir menu' : 'Recolher menu'" @click="recolhida = !recolhida">
          {{ recolhida ? '›' : '‹' }}
        </button>
      </div>

      <div class="gestao-tools">
        <button class="gestao-tool" type="button" title="Aparência">
          <span aria-hidden="true">◐</span>
          <span v-if="!recolhida">Aparência</span>
        </button>

        <button class="gestao-tool gestao-tool--alert" type="button" @click="alertasAbertos = !alertasAbertos">
          <span aria-hidden="true">💡</span>
          <span v-if="!recolhida">Alertas</span>
          <small v-if="!recolhida">—</small>
        </button>

        <div v-if="alertasAbertos && !recolhida" class="gestao-alerts-placeholder">
          <span>Os alertas serão ligados aos contratos reais nas próximas telas.</span>
        </div>
      </div>

      <nav class="gestao-nav" aria-label="Navegação da gestão">
        <p v-if="!recolhida">PRINCIPAL</p>
        <router-link to="/dashboard" title="Dashboard">
          <span aria-hidden="true">⌂</span>
          <span v-if="!recolhida">Dashboard</span>
        </router-link>

        <p v-if="!recolhida" class="gestao-nav__group">OPERAÇÃO</p>
        <router-link to="/pedidos" title="Pedidos">
          <span aria-hidden="true">▤</span>
          <span v-if="!recolhida">Pedidos</span>
        </router-link>
        <router-link to="/estoque" title="Estoque">
          <span aria-hidden="true">▣</span>
          <span v-if="!recolhida">Estoque</span>
        </router-link>
        <router-link to="/movimentacoes" title="Movimentações">
          <span aria-hidden="true">⇄</span>
          <span v-if="!recolhida">Movimentações</span>
        </router-link>
        <router-link to="/relatorios" title="Relatórios">
          <span aria-hidden="true">▥</span>
          <span v-if="!recolhida">Relatórios</span>
        </router-link>
      </nav>

      <div class="gestao-user">
        <div class="gestao-avatar">{{ iniciais }}</div>
        <div v-if="!recolhida" class="gestao-user__copy">
          <strong>{{ session.usuario?.nome }}</strong>
          <span>{{ session.usuario?.email }}</span>
          <small>{{ session.usuario?.perfil }}</small>
        </div>
      </div>
    </aside>

    <div class="gestao-workspace">
      <header class="gestao-topbar">
        <div>
          <strong>Sistema de Gestão</strong>
          <span>{{ session.usuario?.unidadeNome ?? 'Unidade não vinculada' }}</span>
        </div>
        <button type="button" @click="sair">Sair</button>
      </header>

      <main class="gestao-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.gestao-shell {
  --sidebar-width: 248px;
  min-height: 100vh;
  background: var(--sgl-background);
  color: var(--sgl-text);
}

.gestao-shell--collapsed { --sidebar-width: 72px; }

.gestao-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 30;
  width: var(--sidebar-width);
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 18px 14px 16px;
  background: linear-gradient(180deg, #07142f 0%, #0d2147 100%);
  color: #fff;
  transition: width 300ms ease;
}

.gestao-brand {
  min-height: 76px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
}

.gestao-brand img {
  min-width: 0;
  width: 170px;
  max-height: 62px;
  object-fit: contain;
  transition: width 300ms ease, opacity 200ms ease;
}

.gestao-shell--collapsed .gestao-brand { justify-content: center; }
.gestao-shell--collapsed .gestao-brand img { width: 38px; object-fit: cover; object-position: left; }

.gestao-brand button,
.gestao-topbar button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.gestao-brand button {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  font-size: 24px;
}

.gestao-brand button:hover,
.gestao-tool:hover,
.gestao-nav a:hover { background: rgb(255 255 255 / 8%); }

.gestao-tools { padding: 18px 0 8px; }

.gestao-tool,
.gestao-nav a {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #eaf1ff;
  text-decoration: none;
  cursor: pointer;
}

.gestao-tool small { margin-left: auto; color: #8fa3c4; }

.gestao-alerts-placeholder {
  margin: 6px 8px 10px;
  padding: 10px;
  border-radius: 8px;
  background: rgb(45 107 196 / 12%);
  color: #aebed7;
  font-size: 11px;
  line-height: 1.4;
}

.gestao-nav {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding-top: 8px;
}

.gestao-nav p {
  margin: 14px 10px 8px;
  color: #8fa3c4;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .08em;
}

.gestao-nav__group { margin-top: 22px !important; }
.gestao-nav a + a { margin-top: 4px; }
.gestao-nav a.router-link-active { background: linear-gradient(135deg, #1a4da1, #214fb8); }
.gestao-shell--collapsed .gestao-nav a,
.gestao-shell--collapsed .gestao-tool { justify-content: center; padding-inline: 0; }

.gestao-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid rgb(255 255 255 / 10%);
}

.gestao-avatar {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #2d6bc4;
  font-size: 12px;
  font-weight: 800;
}

.gestao-shell--collapsed .gestao-user { justify-content: center; }

.gestao-user__copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.gestao-user__copy strong,
.gestao-user__copy span,
.gestao-user__copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gestao-user__copy strong { font-size: 12px; }
.gestao-user__copy span { color: #aebed7; font-size: 10px; }
.gestao-user__copy small { margin-top: 3px; color: #83a8ff; font-size: 9px; font-weight: 800; }

.gestao-workspace {
  min-width: 0;
  margin-left: var(--sidebar-width);
  transition: margin-left 300ms ease;
}

.gestao-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #0d2b5e;
  color: #fff;
  box-shadow: 0 1px 0 rgb(255 255 255 / 7%);
}

.gestao-topbar > div { display: flex; flex-direction: column; }
.gestao-topbar strong { font-size: 14px; }
.gestao-topbar span { margin-top: 2px; color: #b9c9e2; font-size: 11px; }
.gestao-topbar button { padding: 8px 10px; border-radius: 7px; }
.gestao-topbar button:hover { background: rgb(255 255 255 / 8%); }

.gestao-main { padding: 24px; }

@media (max-width: 900px) {
  .gestao-sidebar { position: static; width: 100%; height: auto; }
  .gestao-shell--collapsed .gestao-sidebar { width: 100%; }
  .gestao-workspace { margin-left: 0; }
  .gestao-brand img { width: 150px !important; object-fit: contain !important; }
  .gestao-brand button { display: none; }
  .gestao-nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gestao-nav p { grid-column: 1 / -1; }
  .gestao-user { display: none; }
  .gestao-main { padding: 16px; }
}
</style>
