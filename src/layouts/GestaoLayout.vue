<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { type RouteLocationRaw, useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

import GestaoUserProfile from '@/components/GestaoUserProfile.vue'
import logoSgl from '@/assets/images/auth/sgl-logo.png'
import { gestaoShellService, type BaseBuscaGestao } from '@/services/gestaoShellService'
import { useSessionStore } from '@/stores/session'

const TEMA_STORAGE_KEY = 'sgl.theme'

type TemaAplicacao = 'light' | 'dark'
type TipoResultadoBusca = 'pedido' | 'produto' | 'laboratorio' | 'usuario'

type ResumoAlertas = {
  pedidosPendentes: number
  pedidosUrgentes: number
  estoqueBaixo: number
  proximosVencimento: number
  vencidos: number
}

interface ResultadoBuscaGlobal {
  id: string
  tipo: TipoResultadoBusca
  titulo: string
  descricao: string
  detalhe?: string
  termos: string
  destino?: RouteLocationRaw
}

const router = useRouter()
const route = useRoute()
const session = useSessionStore()
const vuetifyTheme = useTheme()

const recolhida = ref(false)
const pedidosAbertos = ref(route.path === '/pedidos')

const tema = ref<TemaAplicacao>(carregarTemaPersistido())

const alertasRef = ref<HTMLElement | null>(null)
const alertasAbertos = ref(false)
const carregandoAlertas = ref(false)
const erroAlertas = ref('')
const ultimaAtualizacaoAlertas = ref('')
const alertas = ref<ResumoAlertas>({
  pedidosPendentes: 0,
  pedidosUrgentes: 0,
  estoqueBaixo: 0,
  proximosVencimento: 0,
  vencidos: 0,
})

const buscaRef = ref<HTMLElement | null>(null)
const campoBuscaRef = ref<HTMLInputElement | null>(null)
const buscaAberta = ref(false)
const termoBusca = ref('')
const carregandoBusca = ref(false)
const baseBuscaCarregada = ref(false)
const erroBusca = ref('')
const baseBusca = ref<BaseBuscaGestao>({
  pedidos: [],
  produtos: [],
  laboratorios: [],
  usuarios: [],
  falhas: [],
})

const ehAdministrador = computed(() => session.usuario?.perfil === 'ADMINISTRADOR')

// O retorno no topbar é reservado a telas realmente aninhadas/detalhadas.
// Seções principais acessadas pela sidebar não exibem uma seta de retorno.
const podeVoltar = computed(() => /^\/estoque\/[^/]+$/.test(route.path) || /^\/produtos\/[^/]+$/.test(route.path))

const totalAlertas = computed(() =>
  alertas.value.pedidosPendentes
  + alertas.value.estoqueBaixo
  + alertas.value.proximosVencimento
  + alertas.value.vencidos,
)

const totalAlertasExibido = computed(() => totalAlertas.value > 99 ? '99+' : String(totalAlertas.value))

const severidadeAlertas = computed<'neutral' | 'warning' | 'critical'>(() => {
  if (alertas.value.pedidosUrgentes > 0 || alertas.value.vencidos > 0) return 'critical'
  if (totalAlertas.value > 0) return 'warning'
  return 'neutral'
})

const resultadosBusca = computed<ResultadoBuscaGlobal[]>(() => {
  const palavras = normalizarBusca(termoBusca.value).split(/\s+/).filter(Boolean)
  if (palavras.length === 0) return []

  const corresponde = (texto: string) => palavras.every((palavra) => texto.includes(palavra))
  const resultados: ResultadoBuscaGlobal[] = []

  for (const pedido of baseBusca.value.pedidos) {
    const termos = normalizarBusca([
      pedido.id,
      pedido.usuarioNome,
      pedido.laboratorioNome,
      pedido.projetoNome,
      pedido.status,
      pedido.observacao,
      pedido.motivoUrgencia,
      ...pedido.itens.map((item) => item.produtoNome),
    ].filter(Boolean).join(' '))

    if (!corresponde(termos)) continue

    resultados.push({
      id: `pedido-${pedido.id}`,
      tipo: 'pedido',
      titulo: `Pedido · ${pedido.usuarioNome}`,
      descricao: `${pedido.laboratorioNome} · ${rotuloStatusPedido(pedido.status)}`,
      detalhe: pedido.urgente ? 'URGENTE' : `ID ${pedido.id.slice(0, 8)}`,
      termos,
      destino: { path: '/pedidos', query: { status: pedido.status, pedido: pedido.id } },
    })
  }

  for (const produto of baseBusca.value.produtos) {
    const termos = normalizarBusca([
      produto.nome,
      produto.codigoReferencia,
      produto.descricao,
      produto.unidadeMedida,
      produto.localizacaoFisica,
    ].filter(Boolean).join(' '))

    if (!corresponde(termos)) continue

    resultados.push({
      id: `produto-${produto.id}`,
      tipo: 'produto',
      titulo: produto.nome,
      descricao: `Código ${produto.codigoReferencia} · ${produto.unidadeMedida}`,
      detalhe: produto.ativo ? 'Produto ativo' : 'Produto inativo',
      termos,
      destino: { path: '/estoque', query: { busca: produto.nome } },
    })
  }

  for (const laboratorio of baseBusca.value.laboratorios) {
    const termos = normalizarBusca([
      laboratorio.nome,
      laboratorio.descricao,
      laboratorio.responsavelNome,
    ].filter(Boolean).join(' '))

    if (!corresponde(termos)) continue

    resultados.push({
      id: `laboratorio-${laboratorio.id}`,
      tipo: 'laboratorio',
      titulo: laboratorio.nome,
      descricao: laboratorio.responsavelNome ? `Responsável: ${laboratorio.responsavelNome}` : 'Sem responsável definido',
      detalhe: laboratorio.ativo ? 'Laboratório ativo' : 'Laboratório inativo',
      termos,
      destino: ehAdministrador.value
        ? { path: '/administracao/cadastros', query: { secao: 'laboratorios', busca: laboratorio.nome } }
        : undefined,
    })
  }

  for (const usuario of baseBusca.value.usuarios) {
    const termos = normalizarBusca([
      usuario.nome,
      usuario.email,
      usuario.perfil,
      usuario.unidadeNome,
      usuario.laboratorioNome,
    ].filter(Boolean).join(' '))

    if (!corresponde(termos)) continue

    resultados.push({
      id: `usuario-${usuario.id}`,
      tipo: 'usuario',
      titulo: usuario.nome,
      descricao: `${usuario.email} · ${rotuloPerfil(usuario.perfil)}`,
      detalhe: usuario.laboratorioNome ?? usuario.unidadeNome ?? 'Sem vínculo operacional',
      termos,
      destino: ehAdministrador.value
        ? { path: '/administracao/cadastros', query: { secao: 'usuarios', busca: usuario.nome } }
        : undefined,
    })
  }

  return resultados.slice(0, 12)
})

watch(
  () => route.path,
  (path) => {
    if (path === '/pedidos') pedidosAbertos.value = true
  },
)

watch(
  () => route.fullPath,
  () => {
    alertasAbertos.value = false
    buscaAberta.value = false
    void carregarAlertas()
  },
)

function carregarTemaPersistido(): TemaAplicacao {
  try {
    return localStorage.getItem(TEMA_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function aplicarTema(novoTema: TemaAplicacao) {
  tema.value = novoTema
  document.documentElement.dataset.theme = novoTema
  vuetifyTheme.global.name.value = novoTema === 'dark' ? 'sglDark' : 'sglLight'

  try {
    localStorage.setItem(TEMA_STORAGE_KEY, novoTema)
  } catch {
    // A aplicação continua funcional mesmo quando o navegador bloqueia persistência local.
  }
}

function alternarTema() {
  aplicarTema(tema.value === 'light' ? 'dark' : 'light')
}

function normalizarBusca(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function rotuloStatusPedido(status: string) {
  const rotulos: Record<string, string> = {
    PENDENTE: 'Pendente',
    APROVADO: 'Aprovado',
    REJEITADO: 'Rejeitado',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
  }
  return rotulos[status] ?? status
}

function rotuloPerfil(perfil: string) {
  return perfil.toLowerCase().replaceAll('_', ' ').replace(/^./, (letra) => letra.toUpperCase())
}

function rotuloTipoResultado(tipo: TipoResultadoBusca) {
  const rotulos: Record<TipoResultadoBusca, string> = {
    pedido: 'Pedido',
    produto: 'Produto',
    laboratorio: 'Laboratório',
    usuario: 'Usuário',
  }
  return rotulos[tipo]
}

async function carregarAlertas() {
  if (carregandoAlertas.value) return

  carregandoAlertas.value = true
  erroAlertas.value = ''

  const [pedidos, estoque] = await Promise.allSettled([
    gestaoShellService.listarPedidosPendentes(),
    gestaoShellService.obterResumoEstoque(session.usuario?.unidadeId),
  ])

  const falhas: string[] = []

  if (pedidos.status === 'fulfilled') {
    alertas.value.pedidosPendentes = pedidos.value.length
    alertas.value.pedidosUrgentes = pedidos.value.filter((pedido) => pedido.urgente).length
  } else {
    falhas.push('pedidos')
  }

  if (estoque.status === 'fulfilled') {
    alertas.value.estoqueBaixo = estoque.value.estoquesAbaixoMinimo
    alertas.value.proximosVencimento = estoque.value.lotesProximosVencimento
    alertas.value.vencidos = estoque.value.lotesVencidos
  } else {
    falhas.push('estoque e lotes')
  }

  erroAlertas.value = falhas.length > 0
    ? `Não foi possível atualizar ${falhas.join(' e ')}.`
    : ''

  ultimaAtualizacaoAlertas.value = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  carregandoAlertas.value = false
}

async function alternarPainelAlertas() {
  alertasAbertos.value = !alertasAbertos.value
  buscaAberta.value = false

  if (alertasAbertos.value) await carregarAlertas()
}

function navegarAlerta(tipo: 'pendentes' | 'estoque-baixo' | 'proximos' | 'vencidos') {
  alertasAbertos.value = false

  if (tipo === 'pendentes') {
    void router.push({ path: '/pedidos', query: { status: 'PENDENTE' } })
    return
  }

  if (tipo === 'estoque-baixo') {
    void router.push({ path: '/estoque', query: { alerta: 'estoque-baixo' } })
    return
  }

  if (tipo === 'proximos') {
    void router.push({ path: '/estoque', query: { validade: 'PROXIMO_VENCIMENTO' } })
    return
  }

  void router.push({ path: '/estoque', query: { validade: 'VENCIDO' } })
}

async function carregarBaseBusca() {
  if (baseBuscaCarregada.value || carregandoBusca.value) return

  carregandoBusca.value = true
  erroBusca.value = ''

  try {
    baseBusca.value = await gestaoShellService.carregarBaseBusca()
    baseBuscaCarregada.value = true

    if (baseBusca.value.falhas.length > 0) {
      erroBusca.value = `Busca parcial: indisponível em ${baseBusca.value.falhas.join(', ')}.`
    }
  } catch {
    erroBusca.value = 'Não foi possível carregar a busca global agora.'
  } finally {
    carregandoBusca.value = false
  }
}

async function alternarBuscaGlobal() {
  buscaAberta.value = !buscaAberta.value
  alertasAbertos.value = false

  if (!buscaAberta.value) return

  await carregarBaseBusca()
  await nextTick()
  campoBuscaRef.value?.focus()
}

function fecharBuscaGlobal() {
  buscaAberta.value = false
}

function abrirResultadoBusca(resultado: ResultadoBuscaGlobal) {
  if (!resultado.destino) return
  fecharBuscaGlobal()
  void router.push(resultado.destino)
}

function abrirPrimeiroResultado() {
  const primeiro = resultadosBusca.value.find((resultado) => resultado.destino)
  if (primeiro) abrirResultadoBusca(primeiro)
}

function abrirAtalhoBusca(tipo: TipoResultadoBusca) {
  if (tipo === 'pedido') {
    fecharBuscaGlobal()
    void router.push('/pedidos')
    return
  }

  if (tipo === 'produto') {
    fecharBuscaGlobal()
    void router.push('/estoque')
    return
  }

  if (!ehAdministrador.value) return

  fecharBuscaGlobal()
  void router.push({
    path: '/administracao/cadastros',
    query: { secao: tipo === 'laboratorio' ? 'laboratorios' : 'usuarios' },
  })
}

function tratarCliqueExterno(event: PointerEvent) {
  const target = event.target
  if (!(target instanceof Node)) return

  if (alertasAbertos.value && alertasRef.value && !alertasRef.value.contains(target)) {
    alertasAbertos.value = false
  }

  if (buscaAberta.value && buscaRef.value && !buscaRef.value.contains(target)) {
    buscaAberta.value = false
  }
}

function tratarAtalhos(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    void alternarBuscaGlobal()
    return
  }

  if (event.key === 'Escape') {
    alertasAbertos.value = false
    buscaAberta.value = false
  }
}

function abrirTodosPedidos() {
  pedidosAbertos.value = true
  void router.push('/pedidos')
}

function voltar() {
  if (route.path.startsWith('/estoque/')) {
    void router.push('/estoque')
    return
  }

  if (route.path.startsWith('/produtos/')) {
    void router.push('/produtos')
    return
  }

  if (window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/pedidos')
}

function sair() {
  session.sair()
  void router.replace('/login')
}

onMounted(() => {
  aplicarTema(tema.value)
  document.addEventListener('pointerdown', tratarCliqueExterno)
  document.addEventListener('keydown', tratarAtalhos)
  void carregarAlertas()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', tratarCliqueExterno)
  document.removeEventListener('keydown', tratarAtalhos)
})
</script>

<template>
  <div class="gestao-shell" :class="{ 'gestao-shell--collapsed': recolhida }">
    <aside class="gestao-sidebar">
      <div class="gestao-brand">
        <img :src="logoSgl" alt="SGL — Sistema de Gestão de Laboratórios" />
      </div>

      <div class="gestao-tools">
        <div v-if="!recolhida" class="gestao-tool gestao-tool--appearance" title="Aparência">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
          </svg>
          <span>Aparência</span>
          <div class="gestao-theme-switch" role="group" aria-label="Tema da aplicação">
            <button
              type="button"
              title="Modo claro"
              aria-label="Ativar modo claro"
              :aria-pressed="tema === 'light'"
              :class="{ 'gestao-theme-switch__option--active': tema === 'light' }"
              @click="aplicarTema('light')"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
              </svg>
            </button>
            <button
              type="button"
              title="Modo escuro"
              aria-label="Ativar modo escuro"
              :aria-pressed="tema === 'dark'"
              :class="{ 'gestao-theme-switch__option--active': tema === 'dark' }"
              @click="aplicarTema('dark')"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.5A8 8 0 1 1 8.5 4 6.5 6.5 0 0 0 20 15.5Z" /></svg>
            </button>
          </div>
        </div>

        <button
          v-else
          class="gestao-tool gestao-tool--theme-compact"
          type="button"
          :title="tema === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'"
          :aria-label="tema === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'"
          @click="alternarTema"
        >
          <svg v-if="tema === 'light'" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.5A8 8 0 1 1 8.5 4 6.5 6.5 0 0 0 20 15.5Z" /></svg>
        </button>

        <div
          ref="alertasRef"
          class="gestao-alerts-wrap"
          :class="`gestao-alerts-wrap--${severidadeAlertas}`"
        >
          <button
            class="gestao-tool gestao-tool--alerts"
            type="button"
            title="Alertas operacionais"
            aria-haspopup="dialog"
            :aria-expanded="alertasAbertos"
            @click="alternarPainelAlertas"
          >
            <svg class="gestao-tool__alert-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
            <span v-if="!recolhida">Alertas operacionais</span>
            <small
              v-if="totalAlertas > 0"
              class="gestao-alert-badge"
              :class="{ 'gestao-alert-badge--compact': recolhida }"
            >
              {{ totalAlertasExibido }}
            </small>
          </button>

          <transition name="gestao-panel">
            <section v-if="alertasAbertos" class="gestao-alert-panel" aria-label="Alertas operacionais">
              <header class="gestao-alert-panel__header">
                <div>
                  <strong>Alertas operacionais</strong>
                  <small>O que precisa de atenção agora</small>
                </div>
                <button type="button" title="Atualizar alertas" aria-label="Atualizar alertas" @click="carregarAlertas">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7" /></svg>
                </button>
              </header>

              <p v-if="erroAlertas" class="gestao-alert-panel__error">{{ erroAlertas }}</p>
              <p v-if="carregandoAlertas" class="gestao-alert-panel__loading">Atualizando alertas...</p>

              <div class="gestao-alert-list">
                <button type="button" @click="navegarAlerta('pendentes')">
                  <span class="gestao-alert-dot" :class="{ 'gestao-alert-dot--critical': alertas.pedidosUrgentes > 0 }" />
                  <span>
                    <strong>Pedidos pendentes</strong>
                    <small v-if="alertas.pedidosUrgentes > 0">{{ alertas.pedidosUrgentes }} urgente(s) aguardando análise</small>
                    <small v-else>Pedidos aguardando análise da gestão</small>
                  </span>
                  <b>{{ alertas.pedidosPendentes }}</b>
                </button>

                <button type="button" @click="navegarAlerta('estoque-baixo')">
                  <span class="gestao-alert-dot" />
                  <span>
                    <strong>Estoque baixo</strong>
                    <small>Itens abaixo da quantidade mínima</small>
                  </span>
                  <b>{{ alertas.estoqueBaixo }}</b>
                </button>

                <button type="button" @click="navegarAlerta('proximos')">
                  <span class="gestao-alert-dot" />
                  <span>
                    <strong>Próximos do vencimento</strong>
                    <small>Lotes dentro da janela de vencimento do backend</small>
                  </span>
                  <b>{{ alertas.proximosVencimento }}</b>
                </button>

                <button type="button" @click="navegarAlerta('vencidos')">
                  <span class="gestao-alert-dot gestao-alert-dot--critical" />
                  <span>
                    <strong>Vencidos</strong>
                    <small>Lotes vencidos que exigem tratamento</small>
                  </span>
                  <b>{{ alertas.vencidos }}</b>
                </button>
              </div>

              <footer class="gestao-alert-panel__footer">
                <span v-if="ultimaAtualizacaoAlertas">Atualizado às {{ ultimaAtualizacaoAlertas }}</span>
                <span v-else>Dados operacionais do sistema</span>
              </footer>
            </section>
          </transition>
        </div>
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

        <div ref="buscaRef" class="gestao-search-wrap">
          <button
            class="gestao-topbar__search"
            :class="{ 'gestao-topbar__search--active': buscaAberta }"
            type="button"
            title="Busca global (Ctrl/Cmd + K)"
            aria-haspopup="dialog"
            :aria-expanded="buscaAberta"
            @click="alternarBuscaGlobal"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></svg>
          </button>

          <transition name="gestao-panel">
            <section v-if="buscaAberta" class="gestao-search-panel" aria-label="Busca global">
              <header>
                <strong>Buscar e filtrar</strong>
                <small>Pesquise no contexto operacional do SGL</small>
              </header>

              <label class="gestao-search-input">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></svg>
                <input
                  ref="campoBuscaRef"
                  v-model="termoBusca"
                  type="search"
                  placeholder="Buscar por pedidos, produtos, laboratórios, usuários..."
                  autocomplete="off"
                  @keydown.enter.prevent="abrirPrimeiroResultado"
                />
                <kbd>⌘K</kbd>
              </label>

              <p v-if="erroBusca" class="gestao-search-panel__warning">{{ erroBusca }}</p>

              <div v-if="!termoBusca.trim()" class="gestao-search-scopes">
                <span>Buscar em</span>

                <button type="button" @click="abrirAtalhoBusca('pedido')">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
                  <span><strong>Pedidos</strong><small>Por ID, solicitante, laboratório, status ou produto</small></span>
                </button>

                <button type="button" @click="abrirAtalhoBusca('produto')">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" /></svg>
                  <span><strong>Produtos</strong><small>Por nome, código, descrição ou localização</small></span>
                </button>

                <button type="button" :disabled="!ehAdministrador" @click="abrirAtalhoBusca('laboratorio')">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>
                  <span><strong>Laboratórios</strong><small>{{ ehAdministrador ? 'Por nome, descrição ou responsável' : 'Consulta detalhada disponível ao administrador' }}</small></span>
                </button>

                <button type="button" :disabled="!ehAdministrador" @click="abrirAtalhoBusca('usuario')">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 8h4M19 6v4" /></svg>
                  <span><strong>Usuários</strong><small>{{ ehAdministrador ? 'Por nome, e-mail, perfil ou laboratório' : 'Consulta detalhada disponível ao administrador' }}</small></span>
                </button>
              </div>

              <div v-else class="gestao-search-results">
                <p v-if="carregandoBusca" class="gestao-search-results__state">Carregando dados da busca...</p>
                <p v-else-if="resultadosBusca.length === 0" class="gestao-search-results__state">Nenhum resultado encontrado para “{{ termoBusca }}”.</p>

                <template v-else>
                  <div class="gestao-search-results__meta">
                    <span>{{ resultadosBusca.length }} resultado(s)</span>
                    <small>Enter abre o primeiro resultado navegável</small>
                  </div>

                  <div class="gestao-search-results__list">
                    <button
                      v-for="resultado in resultadosBusca"
                      :key="resultado.id"
                      type="button"
                      :disabled="!resultado.destino"
                      @click="abrirResultadoBusca(resultado)"
                    >
                      <span class="gestao-search-result__icon">
                        <svg v-if="resultado.tipo === 'pedido'" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
                        <svg v-else-if="resultado.tipo === 'produto'" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" /></svg>
                        <svg v-else-if="resultado.tipo === 'laboratorio'" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>
                        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 8h4M19 6v4" /></svg>
                      </span>
                      <span class="gestao-search-result__content">
                        <strong>{{ resultado.titulo }}</strong>
                        <small>{{ resultado.descricao }}</small>
                        <em v-if="resultado.detalhe">{{ resultado.detalhe }}</em>
                      </span>
                      <span class="gestao-search-result__type">{{ rotuloTipoResultado(resultado.tipo) }}</span>
                    </button>
                  </div>
                </template>
              </div>
            </section>
          </transition>
        </div>

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
.gestao-shell { --sidebar-width: 264px; min-height: 100vh; background: var(--sgl-background, #f5f7fa); color: var(--sgl-text, #1a1a2e); }
.gestao-shell--collapsed { --sidebar-width: 72px; }
.gestao-sidebar { position: fixed; inset: 0 auto 0 0; z-index: 30; width: var(--sidebar-width); height: 100vh; display: flex; flex-direction: column; padding: 18px 14px 16px; background: linear-gradient(180deg, #07142f 0%, #0b1b3a 55%, #0d2147 100%); color: #fff; transition: width 300ms ease; }
.gestao-brand { min-height: 92px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid rgb(255 255 255 / 10%); }
.gestao-brand img { width: 178px; max-height: 72px; object-fit: contain; filter: drop-shadow(0 4px 14px rgb(0 0 0 / 18%)); transition: width 300ms ease; }
.gestao-shell--collapsed .gestao-brand img { width: 42px; object-fit: cover; object-position: left; }
.gestao-tools { position: relative; padding: 16px 0 6px; }
.gestao-tool, .gestao-nav a, .gestao-nav__future, .gestao-nav-parent { width: 100%; min-height: 42px; display: flex; align-items: center; gap: 11px; border: 0; border-radius: 7px; background: transparent; color: #eef4ff; font: inherit; font-size: 12px; font-weight: 600; text-decoration: none; }
.gestao-tool, .gestao-nav a, .gestao-nav__future { padding: 0 11px; }
button.gestao-tool { cursor: pointer; }
.gestao-tool:hover, .gestao-nav a:hover, .gestao-nav-parent:hover { background: rgb(255 255 255 / 6%); }
.gestao-tool svg, .gestao-nav svg, .gestao-nav__future svg, .gestao-topbar svg, .gestao-nav-parent svg, .gestao-alert-panel svg, .gestao-search-panel svg { width: 20px; height: 20px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.gestao-tool--appearance { cursor: default; }
.gestao-theme-switch { margin-left: auto; display: flex; padding: 2px; border: 1px solid rgb(255 255 255 / 14%); border-radius: 8px; background: rgb(0 0 0 / 12%); }
.gestao-theme-switch button { width: 29px; height: 27px; display: grid; place-items: center; border: 0; border-radius: 6px; background: transparent; color: #aebed7; cursor: pointer; transition: 160ms ease; }
.gestao-theme-switch button:hover { color: #fff; background: rgb(255 255 255 / 7%); }
.gestao-theme-switch button.gestao-theme-switch__option--active { background: #2356b8; color: #fff; box-shadow: 0 3px 8px rgb(0 0 0 / 16%); }
.gestao-theme-switch svg { width: 15px; height: 15px; }
.gestao-alerts-wrap { position: relative; }
.gestao-tool--alerts { position: relative; }
.gestao-alerts-wrap--neutral .gestao-tool__alert-icon { color: #8fb0df; }
.gestao-alerts-wrap--warning .gestao-tool__alert-icon { color: #f6c343; }
.gestao-alerts-wrap--critical .gestao-tool__alert-icon { color: #fb7185; }
.gestao-alert-badge { margin-left: auto; min-width: 24px; height: 24px; padding: 0 6px; display: grid; place-items: center; border-radius: 999px; background: #f6c343; color: #17213a; font-size: 11px; font-weight: 800; }
.gestao-alerts-wrap--critical .gestao-alert-badge { background: #fb7185; color: #3c0c16; }
.gestao-alert-badge--compact { position: absolute; top: 2px; right: 2px; min-width: 17px; height: 17px; padding: 0 4px; font-size: 8px; }
.gestao-alert-panel { position: absolute; z-index: 70; top: 0; left: calc(100% + 14px); width: 352px; overflow: hidden; border: 1px solid var(--sgl-border); border-radius: 12px; background: var(--sgl-surface-elevated, #fff); color: var(--sgl-text); box-shadow: 0 18px 44px rgb(4 13 31 / 28%); }
.gestao-alert-panel__header { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 15px 16px 12px; border-bottom: 1px solid var(--sgl-border); }
.gestao-alert-panel__header div { min-width: 0; display: grid; gap: 3px; }
.gestao-alert-panel__header strong { font-size: 13px; }
.gestao-alert-panel__header small { color: var(--sgl-text-muted); font-size: 10px; }
.gestao-alert-panel__header button { width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid var(--sgl-border); border-radius: 8px; background: var(--sgl-surface); color: var(--sgl-primary); cursor: pointer; }
.gestao-alert-panel__header button:hover { background: color-mix(in srgb, var(--sgl-primary) 8%, var(--sgl-surface)); }
.gestao-alert-panel__header button svg { width: 16px; height: 16px; }
.gestao-alert-panel__error, .gestao-alert-panel__loading { margin: 10px 14px 0; padding: 8px 10px; border-radius: 7px; font-size: 10px; }
.gestao-alert-panel__error { background: rgb(220 38 38 / 10%); color: var(--sgl-error); }
.gestao-alert-panel__loading { background: rgb(45 107 196 / 8%); color: var(--sgl-primary); }
.gestao-alert-list { padding: 8px; }
.gestao-alert-list > button { width: 100%; min-height: 58px; display: grid; grid-template-columns: 9px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 9px 10px; border: 0; border-radius: 8px; background: transparent; color: var(--sgl-text); text-align: left; cursor: pointer; }
.gestao-alert-list > button:hover { background: color-mix(in srgb, var(--sgl-primary) 7%, transparent); transform: translateX(2px); }
.gestao-alert-list > button > span:nth-child(2) { min-width: 0; display: grid; gap: 2px; }
.gestao-alert-list strong { font-size: 11px; }
.gestao-alert-list small { color: var(--sgl-text-muted); font-size: 9px; line-height: 1.35; }
.gestao-alert-list b { min-width: 26px; height: 24px; display: grid; place-items: center; border-radius: 999px; background: color-mix(in srgb, var(--sgl-primary) 9%, var(--sgl-surface)); color: var(--sgl-primary); font-size: 10px; }
.gestao-alert-dot { width: 8px; height: 8px; border-radius: 50%; background: #f6c343; box-shadow: 0 0 0 3px rgb(246 195 67 / 12%); }
.gestao-alert-dot--critical { background: #fb7185; box-shadow: 0 0 0 3px rgb(251 113 133 / 12%); }
.gestao-alert-panel__footer { min-height: 36px; display: flex; align-items: center; padding: 0 16px; border-top: 1px solid var(--sgl-border); color: var(--sgl-text-muted); font-size: 9px; }
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
.gestao-workspace { min-width: 0; margin-left: var(--sidebar-width); transition: margin-left 300ms ease; }
.gestao-topbar { position: sticky; top: 0; z-index: 20; min-height: 72px; display: flex; align-items: center; gap: 10px; padding: 0 24px; background: linear-gradient(90deg, #08162f 0%, #0b1934 100%); color: #fff; box-shadow: 0 1px 0 rgb(255 255 255 / 7%); }
.gestao-topbar button { border: 0; background: transparent; color: inherit; cursor: pointer; }
.gestao-topbar__collapse, .gestao-topbar__back, .gestao-topbar__search { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 50%; font-size: 25px; }
.gestao-topbar__collapse:hover, .gestao-topbar__back:hover, .gestao-topbar__search:hover, .gestao-topbar__logout:hover { background: rgb(255 255 255 / 8%); }
.gestao-topbar__collapse svg { width: 19px; height: 19px; }
.gestao-topbar__spacer { flex: 1; }
.gestao-search-wrap { position: relative; }
.gestao-topbar__search { background: rgb(45 107 196 / 14%) !important; }
.gestao-topbar__search--active { background: rgb(45 107 196 / 32%) !important; box-shadow: inset 0 0 0 1px rgb(139 176 235 / 30%); }
.gestao-search-panel { position: absolute; z-index: 80; top: calc(100% + 10px); right: 0; width: min(440px, calc(100vw - 32px)); overflow: hidden; border: 1px solid var(--sgl-border); border-radius: 12px; background: var(--sgl-surface-elevated, #fff); color: var(--sgl-text); box-shadow: 0 20px 48px rgb(4 13 31 / 30%); }
.gestao-search-panel > header { display: grid; gap: 3px; padding: 15px 16px 10px; }
.gestao-search-panel > header strong { font-size: 14px; }
.gestao-search-panel > header small { color: var(--sgl-text-muted); font-size: 10px; }
.gestao-search-input { margin: 0 16px 10px; min-height: 42px; display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; align-items: center; gap: 9px; padding: 0 10px; border: 1px solid color-mix(in srgb, var(--sgl-primary) 55%, var(--sgl-border)); border-radius: 8px; background: var(--sgl-surface); color: var(--sgl-text-muted); box-shadow: 0 0 0 2px color-mix(in srgb, var(--sgl-primary) 7%, transparent); }
.gestao-search-input svg { width: 17px; height: 17px; }
.gestao-search-input input { min-width: 0; border: 0; outline: 0; background: transparent; color: var(--sgl-text); font-size: 11px; }
.gestao-search-input input::placeholder { color: var(--sgl-text-muted); }
.gestao-search-input kbd { padding: 3px 6px; border: 1px solid var(--sgl-border); border-radius: 5px; background: color-mix(in srgb, var(--sgl-background) 45%, var(--sgl-surface)); color: var(--sgl-text-muted); font: inherit; font-size: 9px; }
.gestao-search-panel__warning { margin: 0 16px 8px; padding: 7px 9px; border-radius: 7px; background: rgb(245 158 11 / 10%); color: #b7791f; font-size: 9px; }
.gestao-search-scopes { padding: 2px 8px 10px; border-top: 1px solid color-mix(in srgb, var(--sgl-border) 65%, transparent); }
.gestao-search-scopes > span { display: block; padding: 10px 8px 5px; color: var(--sgl-text-muted); font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.gestao-search-scopes > button { width: 100%; min-height: 56px; display: grid; grid-template-columns: 24px minmax(0, 1fr); align-items: center; gap: 10px; padding: 8px 9px; border: 0; border-radius: 8px; background: transparent; color: var(--sgl-text); text-align: left; }
.gestao-search-scopes > button:not(:disabled):hover { background: color-mix(in srgb, var(--sgl-primary) 7%, transparent); }
.gestao-search-scopes > button:disabled { opacity: .48; cursor: default; }
.gestao-search-scopes > button > span { min-width: 0; display: grid; gap: 2px; }
.gestao-search-scopes strong { font-size: 11px; }
.gestao-search-scopes small { color: var(--sgl-text-muted); font-size: 9px; line-height: 1.35; }
.gestao-search-results { max-height: 410px; overflow-y: auto; border-top: 1px solid color-mix(in srgb, var(--sgl-border) 65%, transparent); }
.gestao-search-results__state { margin: 0; padding: 28px 18px; color: var(--sgl-text-muted); font-size: 10px; text-align: center; }
.gestao-search-results__meta { min-height: 38px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 16px; color: var(--sgl-text-muted); font-size: 9px; }
.gestao-search-results__meta small { font-size: 8px; }
.gestao-search-results__list { padding: 0 8px 9px; }
.gestao-search-results__list > button { width: 100%; min-height: 64px; display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; align-items: center; gap: 9px; padding: 8px 9px; border: 0; border-radius: 8px; background: transparent; color: var(--sgl-text); text-align: left; }
.gestao-search-results__list > button:not(:disabled):hover { background: color-mix(in srgb, var(--sgl-primary) 7%, transparent); transform: translateX(2px); }
.gestao-search-results__list > button:disabled { opacity: .58; cursor: default; }
.gestao-search-result__icon { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 8px; background: color-mix(in srgb, var(--sgl-primary) 9%, var(--sgl-surface)); color: var(--sgl-primary); }
.gestao-search-result__icon svg { width: 17px; height: 17px; }
.gestao-search-result__content { min-width: 0; display: grid; gap: 2px; }
.gestao-search-result__content strong { overflow: hidden; font-size: 10.5px; text-overflow: ellipsis; white-space: nowrap; }
.gestao-search-result__content small { overflow: hidden; color: var(--sgl-text-muted); font-size: 8.5px; text-overflow: ellipsis; white-space: nowrap; }
.gestao-search-result__content em { color: var(--sgl-primary); font-size: 8px; font-style: normal; font-weight: 700; }
.gestao-search-result__type { padding: 4px 6px; border: 1px solid var(--sgl-border); border-radius: 999px; color: var(--sgl-text-muted); font-size: 8px; font-weight: 700; }
.gestao-topbar__logout { min-height: 40px; display: flex; align-items: center; gap: 8px; padding: 0 13px; border: 1px solid rgb(255 255 255 / 18%) !important; border-radius: 8px; font-size: 13px; }
.gestao-topbar__logout svg { width: 18px; height: 18px; }
.gestao-main { min-height: calc(100vh - 72px); padding: 28px 30px 40px; background: linear-gradient(135deg, #f8fafc 0%, #f2f5fa 100%); transition: background 180ms ease, color 180ms ease; }
.gestao-panel-enter-active, .gestao-panel-leave-active { transition: opacity 150ms ease, transform 150ms ease; transform-origin: top right; }
.gestao-panel-enter-from, .gestao-panel-leave-to { opacity: 0; transform: translateY(-4px) scale(.985); }
@media (max-width: 900px) { .gestao-sidebar { position: static; width: 100%; height: auto; } .gestao-shell--collapsed .gestao-sidebar { width: 100%; } .gestao-workspace { margin-left: 0; } .gestao-brand img { width: 150px !important; object-fit: contain !important; } .gestao-nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); } .gestao-nav p { grid-column: 1 / -1; } .gestao-subnav { grid-column: 1 / -1; } .gestao-topbar__collapse { display: none; } .gestao-main { padding: 18px 16px 30px; } .gestao-alert-panel { position: fixed; top: 96px; right: 16px; left: 16px; width: auto; } .gestao-search-panel { position: fixed; top: 78px; right: 16px; left: 16px; width: auto; } }
@media (max-width: 560px) { .gestao-topbar { padding-inline: 14px; } .gestao-topbar__logout span { display: none; } .gestao-search-panel { right: 10px; left: 10px; } .gestao-search-input kbd { display: none; } .gestao-search-input { grid-template-columns: 18px minmax(0, 1fr); } }
</style>

<style>
html[data-theme='dark'] body,
html[data-theme='dark'] #app,
html[data-theme='dark'] .v-application {
  background: var(--sgl-background);
  color: var(--sgl-text);
}

html[data-theme='dark'] .gestao-main {
  background: linear-gradient(135deg, #08111f 0%, #0b1628 100%) !important;
  color: var(--sgl-text) !important;
}

html[data-theme='dark'] .gestao-main :where(
  article,
  [class*='card'],
  [class*='panel'],
  [class*='table-wrap'],
  [class*='table-container'],
  [class*='filters'],
  [class*='filter-box'],
  [class*='preview-result'],
  [class*='modal-content'],
  [class*='dialog-content']
) {
  border-color: var(--sgl-border) !important;
  background-color: var(--sgl-surface) !important;
  color: var(--sgl-text) !important;
}

html[data-theme='dark'] .gestao-main :where(h1, h2, h3, h4, h5, h6, th, label) {
  color: var(--sgl-text) !important;
}

html[data-theme='dark'] .gestao-main :where(p, td) {
  border-color: var(--sgl-border) !important;
  color: var(--sgl-text-muted) !important;
}

html[data-theme='dark'] .gestao-main :where(input, select, textarea) {
  border-color: var(--sgl-border) !important;
  background: var(--sgl-surface-elevated) !important;
  color: var(--sgl-text) !important;
}

html[data-theme='dark'] .gestao-main :where(input, textarea)::placeholder {
  color: #8190a6 !important;
}

html[data-theme='dark'] .gestao-main :where(.secondary-action, .ghost-action, .outline-action) {
  border-color: var(--sgl-border) !important;
  background: var(--sgl-surface-elevated) !important;
  color: var(--sgl-text) !important;
}

html[data-theme='dark'] .gestao-main :where(table, thead, tbody, tr) {
  border-color: var(--sgl-border) !important;
}

html[data-theme='dark'] .gestao-main thead {
  background: #132039 !important;
}

html[data-theme='dark'] .gestao-main hr {
  border-color: var(--sgl-border) !important;
}
</style>
