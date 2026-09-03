<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import GestaoUserProfile from '@/components/GestaoUserProfile.vue'
import logoSgl from '@/assets/images/auth/sgl-logo.png'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const route = useRoute()
const session = useSessionStore()
const recolhida = ref(false)
const pedidosAbertos = ref(route.path === '/pedidos')

const ehAdministrador = computed(() => session.usuario?.perfil === 'ADMINISTRADOR')

// O retorno no topbar é reservado a telas realmente aninhadas/detalhadas.
// Seções principais acessadas pela sidebar não exibem uma seta de retorno.
const podeVoltar = computed(() => /^\/estoque\/[^/]+$/.test(route.path) || /^\/produtos\/[^/]+$/.test(route.path))

watch(
  () => route.path,
  (path) => {
    if (path === '/pedidos') pedidosAbertos.value = true
  },
)

function abrirTodosPedidos() {
  pedidosAbertos.value = true
  router.push('/pedidos')
}

function voltar() {
  if (route.path.startsWith('/estoque/')) {
    router.push('/estoque')
    return
  }

  if (route.path.startsWith('/produtos/')) {
    router.push('/produtos')
    return
  }

  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/pedidos')
}

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
      </div>

      <div class="gestao-tools">
        <button class="gestao-tool" type="button" title="Aparência">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
          </svg>
          <span v-if="!recolhida">Aparência</span>
          <span v-if="!recolhida" class="gestao-tool__switch" aria-hidden="true">☼ ◐</span>
        </button>

        <button class="gestao-tool" type="button" title="Alertas operacionais">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
          </svg>
          <span v-if="!recolhida">Alertas operacionais</span>
          <small v-if="!recolhida" class="gestao-alert-badge">—</small>
        </button>
      </div>

      <nav class="gestao-nav" aria-label="Navegação da gestão">
        <p v-if="!recolhida">PRINCIPAL</p>
        <router-link to="/dashboard" title="Dashboard">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 11 12 4l9 7v9H3zM9 20v-6h6v6" />
          </svg>
          <span v-if="!recolhida">Dashboard</span>
        </router-link>

        <p v-if="!recolhida" class="gestao-nav__group">OPERAÇÃO</p>

        <div class="gestao-nav-parent" :class="{ 'gestao-nav-parent--active': route.path === '/pedidos' }">
          <button class="gestao-nav-parent__main" type="button" title="Pedidos" @click="abrirTodosPedidos">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="4" width="14" height="16" rx="1" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
            <span v-if="!recolhida">Pedidos</span>
          </button>
          <button
            v-if="!recolhida"
            class="gestao-nav-parent__toggle"
            type="button"
            :aria-label="pedidosAbertos ? 'Recolher filtros de pedidos' : 'Expandir filtros de pedidos'"
            @click.stop="pedidosAbertos = !pedidosAbertos"
          >
            {{ pedidosAbertos ? '⌄' : '›' }}
          </button>
        </div>

        <div v-if="pedidosAbertos && !recolhida" class="gestao-subnav">
          <router-link :to="{ path: '/pedidos' }" :class="{ 'gestao-subnav--active': !route.query.status }">Todos os pedidos</router-link>
          <router-link :to="{ path: '/pedidos', query: { status: 'PENDENTE' } }">Pendentes</router-link>
          <router-link :to="{ path: '/pedidos', query: { status: 'APROVADO' } }">Aprovados</router-link>
          <router-link :to="{ path: '/pedidos', query: { status: 'ENTREGUE' } }">Entregues</router-link>
          <router-link :to="{ path: '/pedidos', query: { status: 'REJEITADO' } }">Rejeitados</router-link>
          <router-link :to="{ path: '/pedidos', query: { status: 'CANCELADO' } }">Cancelados</router-link>
        </div>

        <router-link to="/estoque" title="Estoque">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" />
          </svg>
          <span v-if="!recolhida">Estoque</span>
        </router-link>
        <router-link to="/movimentacoes" title="Movimentações">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 8h14M15 5l3 3-3 3M20 16H6M9 13l-3 3 3 3" />
          </svg>
          <span v-if="!recolhida">Movimentações</span>
        </router-link>
        <router-link to="/relatorios" title="Relatórios">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 20V10h3v10M11 20V4h3v16M17 20v-7h3v7" />
          </svg>
          <span v-if="!recolhida">Relatórios</span>
        </router-link>

        <router-link to="/estagiarios" title="Estagiários">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="8" r="3" />
            <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 7h5M18.5 4.5v5" />
          </svg>
          <span v-if="!recolhida">Estagiários</span>
        </router-link>

        <router-link to="/residuos" title="Resíduos">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h10l-1 16H8L7 5ZM5 5h14M9 5V3h6v2M10 9v8M14 9v8" />
          </svg>
          <span v-if="!recolhida">Resíduos</span>
        </router-link>

        <p v-if="!recolhida" class="gestao-nav__group">SOLICITAÇÕES</p>
        <router-link to="/solicitacoes/novo" title="Novo pedido">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          <span v-if="!recolhida">Novo pedido</span>
        </router-link>
        <router-link to="/solicitacoes/meus-pedidos" title="Meus pedidos">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" /></svg>
          <span v-if="!recolhida">Meus pedidos</span>
        </router-link>

        <template v-if="ehAdministrador">
          <p v-if="!recolhida" class="gestao-nav__group">ADMINISTRAÇÃO</p>
          <div class="gestao-nav__future" title="Cadastros — etapa de Administração">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="9" cy="8" r="3" />
              <path d="M3 20v-2a6 6 0 0 1 12 0v2M17 8h4M19 6v4" />
            </svg>
            <span v-if="!recolhida">Cadastros</span>
            <small v-if="!recolhida">em breve</small>
          </div>
        </template>
      </nav>

      <GestaoUserProfile :compact="recolhida" />
    </aside>

    <div class="gestao-workspace">
      <header class="gestao-topbar">
        <button class="gestao-topbar__collapse" type="button" :aria-label="recolhida ? 'Expandir menu' : 'Recolher menu'" @click="recolhida = !recolhida">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4v16" />
          </svg>
        </button>

        <button v-if="podeVoltar" class="gestao-topbar__back" type="button" aria-label="Voltar" @click="voltar">←</button>

        <div class="gestao-topbar__spacer" />

        <button class="gestao-topbar__search" type="button" title="Busca global — será ativada quando os contratos estiverem completos">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></svg>
        </button>

        <button class="gestao-topbar__logout" type="button" @click="sair">
          <span>Sair</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" /></svg>
        </button>
      </header>

      <main class="gestao-main"><router-view /></main>
    </div>
  </div>
</template>

<style scoped>
.gestao-shell { --sidebar-width: 264px; width: 100%; max-width: 100%; min-width: 0; min-height: 100vh; overflow-x: hidden; box-sizing: border-box; background: var(--sgl-background, #f5f7fa); color: var(--sgl-text, #1a1a2e); }
.gestao-shell--collapsed { --sidebar-width: 72px; }
.gestao-sidebar { position: fixed; inset: 0 auto 0 0; z-index: 30; width: var(--sidebar-width); height: 100vh; display: flex; flex-direction: column; padding: 18px 14px 16px; box-sizing: border-box; background: linear-gradient(180deg, #07142f 0%, #0b1b3a 55%, #0d2147 100%); color: #fff; transition: width 300ms ease; }
.gestao-brand { min-height: 92px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid rgb(255 255 255 / 10%); }
.gestao-brand img { width: 178px; max-height: 72px; object-fit: contain; filter: drop-shadow(0 4px 14px rgb(0 0 0 / 18%)); transition: width 300ms ease; }
.gestao-shell--collapsed .gestao-brand img { width: 42px; object-fit: cover; object-position: left; }
.gestao-tools { padding: 16px 0 6px; }
.gestao-tool, .gestao-nav a, .gestao-nav__future, .gestao-nav-parent { width: 100%; min-height: 42px; display: flex; align-items: center; gap: 11px; border: 0; border-radius: 7px; background: transparent; color: #eef4ff; font: inherit; font-size: 12px; font-weight: 600; text-decoration: none; }
.gestao-tool, .gestao-nav a, .gestao-nav__future { padding: 0 11px; }
.gestao-tool { cursor: pointer; }
.gestao-tool:hover, .gestao-nav a:hover, .gestao-nav-parent:hover { background: rgb(255 255 255 / 6%); }
.gestao-tool svg, .gestao-nav svg, .gestao-nav__future svg, .gestao-topbar svg, .gestao-nav-parent svg { width: 20px; height: 20px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.gestao-tool__switch { margin-left: auto; padding: 4px 7px; border: 1px solid rgb(255 255 255 / 14%); border-radius: 7px; color: #b9c9e2; font-size: 11px; }
.gestao-alert-badge { margin-left: auto; min-width: 24px; height: 24px; display: grid; place-items: center; border-radius: 999px; background: #f6c343; color: #17213a; font-size: 11px; font-weight: 800; }
.gestao-nav { min-height: 0; flex: 1; overflow-y: auto; padding: 6px 4px 0 0; scrollbar-width: thin; }
.gestao-nav p { margin: 18px 10px 8px; color: #8298ba; font-size: 10px; font-weight: 800; letter-spacing: .1em; }
.gestao-nav__group { margin-top: 22px !important; }
.gestao-nav a + a { margin-top: 3px; }
.gestao-nav a.router-link-active { background: linear-gradient(135deg, #1a4da1 0%, #2456c4 100%); box-shadow: 0 6px 14px rgb(16 63 150 / 18%); }
.gestao-nav-parent { position: relative; margin-right: 4px; padding: 0; }
.gestao-nav-parent--active { background: rgb(26 77 161 / 18%); }
.gestao-nav-parent__main { min-width: 0; flex: 1; min-height: 42px; display: flex; align-items: center; gap: 11px; padding: 0 11px; border: 0; background: transparent; color: inherit; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; text-align: left; }
.gestao-nav-parent__toggle { width: 30px; height: 30px; margin-right: 4px; border: 0; border-radius: 6px; background: transparent; color: #aebed7; cursor: pointer; }
.gestao-nav-parent__toggle:hover { background: rgb(255 255 255 / 6%); color: #fff; }
.gestao-subnav { position: relative; margin: 5px 10px 10px 14px; padding: 2px 0 2px 13px; border-left: 1px solid rgb(143 163 196 / 22%); }
.gestao-subnav a { min-height: 30px; margin: 2px 0; padding: 0 9px; border-radius: 5px; color: #aebed7; font-size: 10px; font-weight: 600; box-shadow: none !important; }
.gestao-subnav a:hover { background: rgb(255 255 255 / 5%); }
.gestao-subnav a.router-link-active, .gestao-subnav a.gestao-subnav--active { background: rgb(45 107 196 / 15%); color: #fff; }
.gestao-nav__future { position: relative; color: #a6b6cf; cursor: default; }
.gestao-nav__future small { margin-left: auto; color: #6f86aa; font-size: 9px; font-weight: 700; }
.gestao-shell--collapsed .gestao-nav a, .gestao-shell--collapsed .gestao-tool, .gestao-shell--collapsed .gestao-nav__future, .gestao-shell--collapsed .gestao-nav-parent { justify-content: center; padding-inline: 0; }
.gestao-shell--collapsed .gestao-nav-parent__main { justify-content: center; padding-inline: 0; }
.gestao-workspace { width: calc(100% - var(--sidebar-width)); max-width: calc(100% - var(--sidebar-width)); min-width: 0; margin-left: var(--sidebar-width); overflow-x: hidden; box-sizing: border-box; transition: width 300ms ease, max-width 300ms ease, margin-left 300ms ease; }
.gestao-topbar { position: sticky; top: 0; z-index: 20; width: 100%; max-width: 100%; min-height: 72px; display: flex; align-items: center; gap: 10px; padding: 0 24px; box-sizing: border-box; background: linear-gradient(90deg, #08162f 0%, #0b1934 100%); color: #fff; box-shadow: 0 1px 0 rgb(255 255 255 / 7%); }
.gestao-topbar button { border: 0; background: transparent; color: inherit; cursor: pointer; }
.gestao-topbar__collapse, .gestao-topbar__back, .gestao-topbar__search { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 50%; font-size: 25px; }
.gestao-topbar__collapse:hover, .gestao-topbar__back:hover, .gestao-topbar__search:hover, .gestao-topbar__logout:hover { background: rgb(255 255 255 / 8%); }
.gestao-topbar__collapse svg { width: 19px; height: 19px; }
.gestao-topbar__spacer { flex: 1; }
.gestao-topbar__search { background: rgb(45 107 196 / 14%) !important; }
.gestao-topbar__logout { min-height: 40px; display: flex; align-items: center; gap: 8px; padding: 0 13px; border: 1px solid rgb(255 255 255 / 18%) !important; border-radius: 8px; font-size: 13px; }
.gestao-topbar__logout svg { width: 18px; height: 18px; }
.gestao-main { width: 100%; max-width: 100%; min-width: 0; min-height: calc(100vh - 72px); padding: clamp(18px, 2vw, 28px) clamp(16px, 2.2vw, 30px) 40px; overflow-x: hidden; box-sizing: border-box; background: linear-gradient(135deg, #f8fafc 0%, #f2f5fa 100%); }
@media (max-width: 900px) { .gestao-sidebar { position: static; width: 100%; height: auto; } .gestao-shell--collapsed .gestao-sidebar { width: 100%; } .gestao-workspace { width: 100%; max-width: 100%; margin-left: 0; } .gestao-brand img { width: 150px !important; object-fit: contain !important; } .gestao-nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); } .gestao-nav p { grid-column: 1 / -1; } .gestao-subnav { grid-column: 1 / -1; } .gestao-topbar__collapse { display: none; } .gestao-main { padding: 18px 16px 30px; } }
</style>