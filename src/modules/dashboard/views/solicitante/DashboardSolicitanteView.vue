<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { pedidoService } from '@/modules/pedidos/services/pedidoService'
import type { PedidoResponse, StatusPedido } from '@/modules/pedidos/types/pedido'
import { residuoService } from '@/modules/residuos/services/residuoService'
import type { ResiduoResponse, StatusResiduo } from '@/modules/residuos/types/residuo'
import { useSessionStore } from '@/stores/session'

interface AtualizacaoUsuario {
  id: string
  tipo: 'pedido' | 'residuo'
  titulo: string
  detalhe: string
  data: string
  rota: string
  classe: 'blue' | 'orange' | 'green' | 'slate'
}

const router = useRouter()
const session = useSessionStore()

const carregando = ref(true)
const erro = ref('')
const pedidos = ref<PedidoResponse[]>([])
const residuos = ref<ResiduoResponse[]>([])
const atualizadoEm = ref(new Date())

const primeiroNome = computed(() => session.usuario?.nome?.trim().split(/\s+/)[0] || 'usuário')

const pedidosPendentes = computed(() => pedidos.value.filter((pedido) => pedido.status === 'PENDENTE'))
const pedidosAprovados = computed(() => pedidos.value.filter((pedido) => pedido.status === 'APROVADO'))
const pedidosEntregues = computed(() => pedidos.value.filter((pedido) => pedido.status === 'ENTREGUE'))
const residuosAtivos = computed(() => residuos.value.filter((residuo) => residuo.status !== 'DESPACHADO'))

const pedidoMaisRecente = computed(() =>
  [...pedidos.value].sort(
    (a, b) => new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime(),
  )[0] ?? null,
)

const residuoMaisRecente = computed(() =>
  [...residuos.value].sort((a, b) => dataMaisRecenteResiduo(b).getTime() - dataMaisRecenteResiduo(a).getTime())[0] ?? null,
)

const atualizacoes = computed<AtualizacaoUsuario[]>(() => {
  const itens: AtualizacaoUsuario[] = []

  pedidos.value.forEach((pedido) => {
    itens.push({
      id: `pedido-${pedido.id}-solicitado`,
      tipo: 'pedido',
      titulo: `${codigoPedido(pedido)} foi solicitado`,
      detalhe: pedido.itens.slice(0, 2).map((item) => item.produtoNome).join(' · ') || 'Pedido sem itens',
      data: pedido.dataSolicitacao,
      rota: `/meus-pedidos?pedido=${encodeURIComponent(pedido.id)}`,
      classe: 'blue',
    })
  })

  residuos.value.forEach((residuo) => {
    const codigo = codigoResiduo(residuo)
    itens.push({
      id: `residuo-${residuo.id}-informado`,
      tipo: 'residuo',
      titulo: `${codigo} foi informado`,
      detalhe: residuo.descricao,
      data: residuo.dataInformacao,
      rota: `/meus-residuos?residuo=${encodeURIComponent(residuo.id)}`,
      classe: 'orange',
    })

    if (residuo.dataRecebimento) {
      itens.push({
        id: `residuo-${residuo.id}-recebido`,
        tipo: 'residuo',
        titulo: `${codigo} entrou em análise`,
        detalhe: 'Recebido pela equipe responsável',
        data: residuo.dataRecebimento,
        rota: `/meus-residuos?residuo=${encodeURIComponent(residuo.id)}`,
        classe: 'orange',
      })
    }

    if (residuo.dataLiberacao) {
      itens.push({
        id: `residuo-${residuo.id}-liberado`,
        tipo: 'residuo',
        titulo: `${codigo} foi liberado`,
        detalhe: 'Liberado para armazenamento temporário',
        data: residuo.dataLiberacao,
        rota: `/meus-residuos?residuo=${encodeURIComponent(residuo.id)}`,
        classe: 'green',
      })
    }

    if (residuo.dataArmazenamentoTemporario) {
      itens.push({
        id: `residuo-${residuo.id}-armazenado`,
        tipo: 'residuo',
        titulo: `${codigo} foi armazenado`,
        detalhe: residuo.localArmazenamentoTemporario || 'Armazenamento temporário registrado',
        data: residuo.dataArmazenamentoTemporario,
        rota: `/meus-residuos?residuo=${encodeURIComponent(residuo.id)}`,
        classe: 'green',
      })
    }

    if (residuo.dataDespacho) {
      itens.push({
        id: `residuo-${residuo.id}-despachado`,
        tipo: 'residuo',
        titulo: `${codigo} foi despachado`,
        detalhe: residuo.destinoFinalConfirmado || 'Destinação final registrada',
        data: residuo.dataDespacho,
        rota: `/meus-residuos?residuo=${encodeURIComponent(residuo.id)}`,
        classe: 'slate',
      })
    }
  })

  return itens
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 6)
})

async function carregarDashboard() {
  const usuarioId = session.usuario?.id
  if (!usuarioId) {
    erro.value = 'Não foi possível identificar o usuário da sessão.'
    carregando.value = false
    return
  }

  carregando.value = true
  erro.value = ''

  const [pedidosResult, residuosResult] = await Promise.allSettled([
    pedidoService.listarPorUsuario(usuarioId),
    residuoService.listarPorGerador(usuarioId),
  ])

  pedidos.value = pedidosResult.status === 'fulfilled' ? pedidosResult.value : []
  residuos.value = residuosResult.status === 'fulfilled' ? residuosResult.value : []

  const falhas = [pedidosResult, residuosResult].filter((resultado) => resultado.status === 'rejected').length
  if (falhas > 0) {
    erro.value = falhas === 2
      ? 'Não foi possível carregar seus pedidos e resíduos. Tente atualizar novamente.'
      : 'Parte dos seus dados não pôde ser atualizada. O conteúdo disponível continua exibido.'
  }

  atualizadoEm.value = new Date()
  carregando.value = false
}

function abrir(rota: string) {
  router.push(rota)
}

function codigoPedido(pedido: PedidoResponse) {
  return `PED-${pedido.id.replaceAll('-', '').slice(-6).toUpperCase()}`
}

function codigoResiduo(residuo: ResiduoResponse) {
  return residuo.codigoRastreio || `RES-${residuo.id.replaceAll('-', '').slice(-6).toUpperCase()}`
}

function dataMaisRecenteResiduo(residuo: ResiduoResponse) {
  const datas = [
    residuo.dataDespacho,
    residuo.dataArmazenamentoTemporario,
    residuo.dataLiberacao,
    residuo.dataRecebimento,
    residuo.dataInformacao,
  ].filter((valor): valor is string => Boolean(valor))

  return new Date(datas[0] || residuo.dataInformacao)
}

function formatarDataHora(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor))
}

function formatarDataCabecalho(data: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data)
}

function formatarHora(data: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(typeof data === 'string' ? new Date(data) : data)
}

function tempoRelativo(valor: string) {
  const data = new Date(valor)
  const diferenca = Date.now() - data.getTime()
  const minutos = Math.max(0, Math.floor(diferenca / 60_000))
  if (minutos < 1) return 'Agora'
  if (minutos < 60) return `Há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Há ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias === 1) return 'Ontem'
  if (dias < 7) return `Há ${dias} dias`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(data)
}

function statusPedidoRotulo(status: StatusPedido) {
  const mapa: Record<StatusPedido, string> = {
    PENDENTE: 'Em análise',
    APROVADO: 'Aprovado',
    REJEITADO: 'Rejeitado',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
  }
  return mapa[status]
}

function mensagemPedido(pedido: PedidoResponse) {
  const mapa: Record<StatusPedido, string> = {
    PENDENTE: 'Seu pedido está aguardando análise da equipe de gestão.',
    APROVADO: 'Seu pedido foi aprovado e está pronto para seguir para entrega.',
    REJEITADO: 'Seu pedido foi analisado e rejeitado. Consulte os detalhes para verificar a observação.',
    ENTREGUE: 'Seu pedido foi concluído e registrado como entregue.',
    CANCELADO: 'Este pedido foi cancelado e não seguirá para atendimento.',
  }
  return mapa[pedido.status]
}

function indiceEtapaPedido(status: StatusPedido) {
  if (status === 'APROVADO') return 2
  if (status === 'ENTREGUE') return 3
  return 1
}

function estadoEtapaPedido(pedido: PedidoResponse, indice: number) {
  if (pedido.status === 'REJEITADO' || pedido.status === 'CANCELADO') {
    if (indice === 0) return 'done'
    if (indice === 1) return 'error'
    return 'pending'
  }

  const atual = indiceEtapaPedido(pedido.status)
  if (pedido.status === 'ENTREGUE') return indice <= atual ? 'done' : 'pending'
  if (indice < atual) return 'done'
  if (indice === atual) return 'current'
  return 'pending'
}

function rotuloEtapaPedido(pedido: PedidoResponse, indice: number) {
  const rotulos = ['Solicitado', 'Em análise', 'Aprovado', 'Entregue']
  if (indice === 1 && (pedido.status === 'REJEITADO' || pedido.status === 'CANCELADO')) {
    return statusPedidoRotulo(pedido.status)
  }
  return rotulos[indice]
}

function detalheEtapaPedido(pedido: PedidoResponse, indice: number) {
  if (indice === 0) return formatarDataHora(pedido.dataSolicitacao)
  const estado = estadoEtapaPedido(pedido, indice)
  if (estado === 'error') return 'Encerrado'
  if (estado === 'done') return 'Concluído'
  if (estado === 'current') return 'Status atual'
  return 'Aguardando'
}

function indiceEtapaResiduo(status: StatusResiduo) {
  const mapa: Record<StatusResiduo, number> = {
    INFORMADO: 0,
    EM_ANALISE: 1,
    LIBERADO_PARA_ARMAZENAMENTO: 2,
    ARMAZENADO_TEMPORARIAMENTE: 3,
    DESPACHADO: 4,
  }
  return mapa[status]
}

function estadoEtapaResiduo(residuo: ResiduoResponse, indice: number) {
  const atual = indiceEtapaResiduo(residuo.status)
  if (residuo.status === 'DESPACHADO') return indice <= atual ? 'done' : 'pending'
  if (indice < atual) return 'done'
  if (indice === atual) return 'current'
  return 'pending'
}

function dataEtapaResiduo(residuo: ResiduoResponse, indice: number) {
  return [
    residuo.dataInformacao,
    residuo.dataRecebimento,
    residuo.dataLiberacao,
    residuo.dataArmazenamentoTemporario,
    residuo.dataDespacho,
  ][indice]
}

function detalheEtapaResiduo(residuo: ResiduoResponse, indice: number) {
  const data = dataEtapaResiduo(residuo, indice)
  if (data) return formatarDataHora(data)
  return estadoEtapaResiduo(residuo, indice) === 'current' ? 'Etapa atual' : 'Aguardando'
}

function mensagemResiduo(residuo: ResiduoResponse) {
  const mapa: Record<StatusResiduo, string> = {
    INFORMADO: 'Seu resíduo foi informado e aguarda recebimento pela equipe responsável.',
    EM_ANALISE: 'Seu resíduo foi recebido e está em processo de análise e identificação.',
    LIBERADO_PARA_ARMAZENAMENTO: 'A análise foi concluída e o resíduo está liberado para armazenamento temporário.',
    ARMAZENADO_TEMPORARIAMENTE: 'O resíduo está armazenado temporariamente e aguarda a destinação final.',
    DESPACHADO: 'O resíduo foi despachado e o fluxo de destinação foi concluído.',
  }
  return mapa[residuo.status]
}

onMounted(carregarDashboard)
</script>

<template>
  <section class="user-dashboard">
    <header class="welcome-heading">
      <div class="welcome-copy">
        <span class="eyebrow">ÁREA DO SOLICITANTE</span>
        <h1>Olá, {{ primeiroNome }} <span aria-hidden="true">👋</span></h1>
        <div class="user-context">
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 17l-5-9V3M8 14h8" /></svg>
            {{ session.usuario?.laboratorioNome ?? 'Laboratório não vinculado' }}
          </span>
          <i />
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20V9h12v11M3 9l9-6 9 6M9 13h2M13 13h2M9 17h2M13 17h2" /></svg>
            {{ session.usuario?.unidadeNome ?? 'Unidade não vinculada' }}
          </span>
        </div>
      </div>

      <div class="date-card" aria-label="Data da atualização">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
        <span>{{ formatarDataCabecalho(atualizadoEm) }}</span>
        <b>·</b>
        <span>{{ formatarHora(atualizadoEm) }}</span>
      </div>
    </header>

    <div v-if="erro" class="dashboard-alert" role="status">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 17h.01" /></svg>
      <span>{{ erro }}</span>
      <button type="button" @click="carregarDashboard">Tentar novamente</button>
    </div>

    <section class="overview-section">
      <header class="section-heading">
        <div>
          <h2>Acompanhe suas solicitações</h2>
          <p>Veja rapidamente o andamento dos seus pedidos e resíduos.</p>
        </div>
        <button class="refresh-button" type="button" :disabled="carregando" @click="carregarDashboard">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>
          {{ carregando ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </header>

      <div class="overview-grid">
        <button class="overview-card overview-card--red" type="button" @click="abrir('/meus-pedidos?status=PENDENTE')">
          <span class="overview-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></svg></span>
          <span class="overview-copy"><small>Pedidos pendentes</small><strong>{{ pedidosPendentes.length }}</strong><em>Aguardando análise</em></span>
        </button>

        <button class="overview-card overview-card--green" type="button" @click="abrir('/meus-pedidos?status=APROVADO')">
          <span class="overview-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="m8 12 2.7 2.7L16.5 9" /></svg></span>
          <span class="overview-copy"><small>Pedidos aprovados</small><strong>{{ pedidosAprovados.length }}</strong><em>Prontos para atendimento</em></span>
        </button>

        <button class="overview-card overview-card--orange" type="button" @click="abrir('/meus-residuos?status=ATIVOS')">
          <span class="overview-icon"><svg viewBox="0 0 24 24"><path d="M7 5h10l-1 16H8L7 5ZM5 5h14M9 5V3h6v2M10 9v8M14 9v8" /></svg></span>
          <span class="overview-copy"><small>Resíduos ativos</small><strong>{{ residuosAtivos.length }}</strong><em>Em acompanhamento</em></span>
        </button>

        <button class="overview-card overview-card--blue" type="button" @click="abrir('/meus-pedidos?status=ENTREGUE')">
          <span class="overview-icon"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" /></svg></span>
          <span class="overview-copy"><small>Pedidos entregues</small><strong>{{ pedidosEntregues.length }}</strong><em>Solicitações concluídas</em></span>
        </button>
      </div>
    </section>

    <div class="tracking-grid">
      <article class="tracking-card tracking-card--pedido">
        <header class="tracking-heading">
          <h2>Acompanhamento do pedido mais recente</h2>
          <button type="button" @click="abrir('/meus-pedidos')">Ver todos os pedidos</button>
        </header>

        <div v-if="carregando" class="tracking-state">Carregando pedido...</div>
        <div v-else-if="!pedidoMaisRecente" class="tracking-state tracking-state--empty">
          <strong>Você ainda não possui pedidos.</strong>
          <span>Crie sua primeira solicitação para acompanhar o andamento por aqui.</span>
          <button type="button" @click="abrir('/pedidos/novo')">Novo pedido</button>
        </div>
        <template v-else>
          <button class="tracking-identity" type="button" @click="abrir(`/meus-pedidos?pedido=${encodeURIComponent(pedidoMaisRecente.id)}`)">
            <span class="identity-icon identity-icon--blue"><svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6zM15 3v5h5M9 13h6M9 17h4" /></svg></span>
            <span>
              <strong>{{ codigoPedido(pedidoMaisRecente) }}</strong>
              <small>Solicitado em {{ formatarDataHora(pedidoMaisRecente.dataSolicitacao) }}</small>
            </span>
            <span class="current-status" :data-status="pedidoMaisRecente.status">{{ statusPedidoRotulo(pedidoMaisRecente.status) }}</span>
          </button>

          <div class="progress-track progress-track--pedido">
            <div
              v-for="indice in 4"
              :key="indice"
              class="progress-step"
              :class="`progress-step--${estadoEtapaPedido(pedidoMaisRecente, indice - 1)}`"
            >
              <span class="progress-marker">
                <svg v-if="estadoEtapaPedido(pedidoMaisRecente, indice - 1) === 'done'" viewBox="0 0 24 24"><path d="m7 12 3 3 7-7" /></svg>
                <span v-else>{{ indice }}</span>
              </span>
              <strong>{{ rotuloEtapaPedido(pedidoMaisRecente, indice - 1) }}</strong>
              <small>{{ detalheEtapaPedido(pedidoMaisRecente, indice - 1) }}</small>
            </div>
          </div>

          <div class="tracking-message" :class="{ 'tracking-message--error': ['REJEITADO', 'CANCELADO'].includes(pedidoMaisRecente.status) }">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
            <span>{{ mensagemPedido(pedidoMaisRecente) }}</span>
          </div>
        </template>
      </article>

      <article class="tracking-card tracking-card--residuo">
        <header class="tracking-heading">
          <h2>Acompanhamento do resíduo mais recente</h2>
          <button type="button" @click="abrir('/meus-residuos')">Ver todos os resíduos</button>
        </header>

        <div v-if="carregando" class="tracking-state">Carregando resíduo...</div>
        <div v-else-if="!residuoMaisRecente" class="tracking-state tracking-state--empty">
          <strong>Você ainda não informou resíduos.</strong>
          <span>Quando um resíduo for registrado, o fluxo aparecerá neste painel.</span>
          <button type="button" @click="abrir('/residuos/novo')">Informar resíduo</button>
        </div>
        <template v-else>
          <button class="tracking-identity" type="button" @click="abrir(`/meus-residuos?residuo=${encodeURIComponent(residuoMaisRecente.id)}`)">
            <span class="identity-icon identity-icon--orange"><svg viewBox="0 0 24 24"><path d="M7 5h10l-1 16H8L7 5ZM5 5h14M9 5V3h6v2M10 9v8M14 9v8" /></svg></span>
            <span>
              <strong>{{ codigoResiduo(residuoMaisRecente) }}</strong>
              <small>Informado em {{ formatarDataHora(residuoMaisRecente.dataInformacao) }}</small>
            </span>
          </button>

          <div class="progress-track progress-track--residuo">
            <div
              v-for="(rotulo, indice) in ['Informado', 'Em análise', 'Liberado', 'Armazenado', 'Despachado']"
              :key="rotulo"
              class="progress-step"
              :class="`progress-step--${estadoEtapaResiduo(residuoMaisRecente, indice)}`"
            >
              <span class="progress-marker">
                <svg v-if="estadoEtapaResiduo(residuoMaisRecente, indice) === 'done'" viewBox="0 0 24 24"><path d="m7 12 3 3 7-7" /></svg>
                <span v-else>{{ indice + 1 }}</span>
              </span>
              <strong>{{ rotulo }}</strong>
              <small>{{ detalheEtapaResiduo(residuoMaisRecente, indice) }}</small>
            </div>
          </div>

          <div class="tracking-message tracking-message--orange">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
            <span>{{ mensagemResiduo(residuoMaisRecente) }}</span>
          </div>
        </template>
      </article>
    </div>

    <div class="dashboard-lower-grid">
      <article class="lower-card quick-actions-card">
        <header class="lower-heading">
          <span class="lower-icon lower-icon--bolt">
            <svg viewBox="0 0 24 24"><path d="m13 2-8 12h6l-1 8 9-13h-6z" /></svg>
          </span>
          <h2>Ações rápidas</h2>
        </header>

        <div class="quick-actions-grid">
          <button type="button" @click="abrir('/meus-pedidos')">
            <span class="quick-icon quick-icon--blue"><svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6zM15 3v5h5M9 13h6M9 17h4" /></svg></span>
            <span><strong>Meus pedidos</strong><small>Acompanhe suas solicitações</small></span>
            <svg class="quick-chevron" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
          </button>

          <button type="button" @click="abrir('/meus-residuos')">
            <span class="quick-icon quick-icon--orange"><svg viewBox="0 0 24 24"><path d="M7 5h10l-1 16H8L7 5ZM5 5h14M9 5V3h6v2M10 9v8M14 9v8" /></svg></span>
            <span><strong>Meus resíduos</strong><small>Acompanhe os materiais informados</small></span>
            <svg class="quick-chevron" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
          </button>

          <button type="button" @click="abrir('/pedidos/novo')">
            <span class="quick-icon quick-icon--blue"><svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6zM15 3v5h5M12 12v6M9 15h6" /></svg></span>
            <span><strong>Novo pedido</strong><small>Solicite materiais ao laboratório</small></span>
            <svg class="quick-chevron" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
          </button>

          <button type="button" @click="abrir('/residuos/novo')">
            <span class="quick-icon quick-icon--green"><svg viewBox="0 0 24 24"><path d="M7 5h10l-1 16H8L7 5ZM5 5h14M9 5V3h6v2M12 10v6M9 13h6" /></svg></span>
            <span><strong>Informar resíduo</strong><small>Registre um novo resíduo</small></span>
            <svg class="quick-chevron" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
          </button>
        </div>
      </article>

      <article class="lower-card updates-card">
        <header class="lower-heading lower-heading--between">
          <div>
            <span class="lower-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span>
            <h2>Últimas atualizações</h2>
          </div>
        </header>

        <div v-if="carregando" class="updates-state">Carregando atualizações...</div>
        <div v-else-if="atualizacoes.length === 0" class="updates-state">Nenhuma atualização registrada ainda.</div>
        <div v-else class="updates-list">
          <button v-for="item in atualizacoes" :key="item.id" type="button" @click="abrir(item.rota)">
            <span class="update-icon" :class="`update-icon--${item.classe}`">
              <svg v-if="item.tipo === 'pedido'" viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6zM15 3v5h5M9 13h6M9 17h4" /></svg>
              <svg v-else viewBox="0 0 24 24"><path d="M7 5h10l-1 16H8L7 5ZM5 5h14M9 5V3h6v2M10 9v8M14 9v8" /></svg>
            </span>
            <span class="update-copy"><strong>{{ item.titulo }}</strong><small>{{ item.detalhe }}</small></span>
            <time>{{ tempoRelativo(item.data) }}</time>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.user-dashboard {
  width: min(100%, 1450px);
  margin: 0 auto;
  color: #111d33;
}

.welcome-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;
}

.eyebrow {
  display: block;
  margin-bottom: 6px;
  color: #1c4fac;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .1em;
}

.welcome-copy h1 {
  margin: 0;
  color: #111827;
  font-size: clamp(30px, 3.1vw, 40px);
  line-height: 1.08;
  letter-spacing: -.035em;
}

.user-context {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 13px;
  color: #5f6f86;
  font-size: 13px;
}

.user-context span { display: inline-flex; align-items: center; gap: 7px; }
.user-context svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.user-context i { width: 1px; height: 21px; background: #cdd6e2; }

.date-card {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 14px;
  border: 1px solid #ccd6e4;
  border-radius: 8px;
  background: #fff;
  color: #536176;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 5px 16px rgb(15 37 71 / 4%);
}
.date-card svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.date-card b { color: #9aa6b6; }

.dashboard-alert {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 20px;
  padding: 10px 13px;
  border: 1px solid #f1d28d;
  border-radius: 8px;
  background: #fffaf0;
  color: #82590e;
  font-size: 12px;
}
.dashboard-alert svg { width: 18px; height: 18px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.8; }
.dashboard-alert button { margin-left: auto; border: 0; background: transparent; color: #174ca8; font: inherit; font-weight: 800; cursor: pointer; }

.overview-section { margin-bottom: 22px; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 15px; }
.section-heading h2 { margin: 0; font-size: 23px; letter-spacing: -.025em; }
.section-heading p { margin: 5px 0 0; color: #697991; font-size: 13px; }
.refresh-button { min-height: 38px; display: inline-flex; align-items: center; gap: 7px; padding: 0 12px; border: 1px solid #c7d2e2; border-radius: 7px; background: #fff; color: #1a4da1; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.refresh-button:disabled { opacity: .55; cursor: wait; }
.refresh-button svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }

.overview-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.overview-card {
  min-width: 0;
  min-height: 132px;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #dfe5ee;
  border-radius: 11px;
  background: #fff;
  color: inherit;
  text-align: left;
  font: inherit;
  cursor: pointer;
  box-shadow: 0 6px 18px rgb(15 37 71 / 5%);
  transition: transform 170ms ease, border-color 170ms ease, box-shadow 170ms ease;
}
.overview-card:hover { transform: translateY(-3px); box-shadow: 0 13px 26px rgb(15 37 71 / 10%); }
.overview-icon { width: 56px; height: 56px; display: grid; place-items: center; border-radius: 13px; }
.overview-icon svg { width: 29px; height: 29px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.overview-copy { min-width: 0; display: grid; gap: 4px; }
.overview-copy small { color: #526178; font-size: 13px; }
.overview-copy strong { color: #16233c; font-size: 29px; line-height: 1; }
.overview-copy em { margin-top: 6px; color: #7a8799; font-size: 11px; font-style: normal; }
.overview-card--red:hover { border-color: #e9b9b9; }
.overview-card--red .overview-icon { background: #fff0f0; color: #ef3333; }
.overview-card--red .overview-copy strong { color: #e43a3a; }
.overview-card--green:hover { border-color: #bcdcc7; }
.overview-card--green .overview-icon { background: #eaf8ef; color: #159247; }
.overview-card--green .overview-copy strong { color: #168c47; }
.overview-card--orange:hover { border-color: #f1cba8; }
.overview-card--orange .overview-icon { background: #fff1e7; color: #f17a18; }
.overview-card--orange .overview-copy strong { color: #ed7617; }
.overview-card--blue:hover { border-color: #b9cce9; }
.overview-card--blue .overview-icon { background: #eaf2ff; color: #1d62d2; }
.overview-card--blue .overview-copy strong { color: #1c5ccc; }

.tracking-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 18px; }
.tracking-card { min-width: 0; padding: 20px; border: 1px solid #dce4ee; border-radius: 12px; background: #fff; box-shadow: 0 7px 22px rgb(15 37 71 / 5%); }
.tracking-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 15px; }
.tracking-heading h2 { margin: 0; color: #1b2941; font-size: 16px; }
.tracking-heading button { min-height: 32px; padding: 0 11px; border: 1px solid #d6dfeb; border-radius: 6px; background: #fff; color: #52617a; font: inherit; font-size: 10px; font-weight: 750; cursor: pointer; }
.tracking-heading button:hover { border-color: #9eb4d4; color: #1d50a6; }

.tracking-state { min-height: 250px; display: grid; place-items: center; color: #77869a; font-size: 12px; text-align: center; }
.tracking-state--empty { align-content: center; gap: 7px; padding: 20px; }
.tracking-state--empty strong { color: #24344d; font-size: 14px; }
.tracking-state--empty button { justify-self: center; margin-top: 8px; min-height: 36px; padding: 0 13px; border: 0; border-radius: 7px; background: #174da9; color: #fff; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }

.tracking-identity { width: 100%; display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; font: inherit; cursor: pointer; }
.identity-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 10px; }
.identity-icon svg { width: 23px; height: 23px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.identity-icon--blue { background: #edf4ff; color: #1f62d1; }
.identity-icon--orange { background: #fff0e5; color: #f17716; }
.tracking-identity > span:nth-child(2) { min-width: 0; display: grid; gap: 3px; }
.tracking-identity strong { color: #1757bd; font-size: 14px; }
.tracking-card--residuo .tracking-identity strong { color: #e66e10; }
.tracking-identity small { overflow: hidden; color: #6e7c91; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.current-status { min-height: 26px; display: inline-flex; align-items: center; padding: 0 8px; border-radius: 999px; background: #eef3fb; color: #355274; font-size: 9px; font-weight: 850; text-transform: uppercase; }
.current-status[data-status='PENDENTE'] { background: #fff4da; color: #9b6200; }
.current-status[data-status='APROVADO'] { background: #e8f7ed; color: #147541; }
.current-status[data-status='ENTREGUE'] { background: #eaf2ff; color: #1957b9; }
.current-status[data-status='REJEITADO'] { background: #feecec; color: #bb2828; }
.current-status[data-status='CANCELADO'] { background: #edf0f4; color: #58677b; }

.progress-track { display: grid; gap: 0; margin: 24px 0 20px; }
.progress-track--pedido { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.progress-track--residuo { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.progress-step { position: relative; min-width: 0; display: grid; justify-items: center; gap: 5px; text-align: center; color: #8290a3; }
.progress-step:not(:last-child)::after { content: ''; position: absolute; z-index: 0; top: 14px; left: calc(50% + 15px); right: calc(-50% + 15px); height: 2px; background: #d7dee8; }
.progress-step--done:not(:last-child)::after { background: #2364cb; }
.tracking-card--residuo .progress-step--done:not(:last-child)::after { background: #f07b1c; }
.progress-marker { position: relative; z-index: 1; width: 30px; height: 30px; display: grid; place-items: center; border: 3px solid #c8d0dc; border-radius: 50%; background: #fff; color: #8795a7; font-size: 9px; font-weight: 900; }
.progress-marker svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.progress-step--done .progress-marker { border-color: #2364cb; background: #2364cb; color: #fff; }
.progress-step--current .progress-marker { border-color: #2364cb; color: #2364cb; box-shadow: 0 0 0 4px #e9f1ff; }
.progress-step--error .progress-marker { border-color: #dd3e3e; background: #dd3e3e; color: #fff; box-shadow: 0 0 0 4px #fff0f0; }
.tracking-card--residuo .progress-step--done .progress-marker { border-color: #f07b1c; background: #f07b1c; }
.tracking-card--residuo .progress-step--current .progress-marker { border-color: #f07b1c; color: #f07b1c; box-shadow: 0 0 0 4px #fff1e7; }
.progress-step strong { overflow: hidden; max-width: 100%; color: #25354d; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.progress-step small { overflow: hidden; max-width: 100%; color: #8592a4; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.progress-step--current strong { color: #1d5ac0; }
.tracking-card--residuo .progress-step--current strong { color: #e46e12; }
.progress-step--error strong { color: #c83232; }

.tracking-message { min-height: 45px; display: flex; align-items: center; gap: 9px; padding: 10px 12px; border: 1px solid #cfe0f7; border-radius: 8px; background: #f1f6ff; color: #405675; font-size: 10.5px; line-height: 1.4; }
.tracking-message svg { width: 19px; height: 19px; flex: 0 0 auto; fill: none; stroke: #2364cb; stroke-width: 1.9; }
.tracking-message--orange { border-color: #f6d4bd; background: #fff5ed; }
.tracking-message--orange svg { stroke: #f07b1c; }
.tracking-message--error { border-color: #f1c3c3; background: #fff3f3; color: #833232; }
.tracking-message--error svg { stroke: #d53c3c; }

.dashboard-lower-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.lower-card { min-width: 0; border: 1px solid #dce4ee; border-radius: 12px; background: #fff; box-shadow: 0 7px 22px rgb(15 37 71 / 5%); }
.lower-heading { min-height: 54px; display: flex; align-items: center; gap: 9px; padding: 0 18px; border-bottom: 1px solid #e8edf3; }
.lower-heading--between { justify-content: space-between; }
.lower-heading--between > div { display: flex; align-items: center; gap: 9px; }
.lower-heading h2 { margin: 0; color: #26354d; font-size: 15px; }
.lower-icon { width: 27px; height: 27px; display: grid; place-items: center; color: #294f83; }
.lower-icon--bolt { color: #1762d5; }
.lower-icon svg { width: 21px; height: 21px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }

.quick-actions-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 14px; }
.quick-actions-grid button { min-width: 0; min-height: 82px; display: grid; grid-template-columns: 40px minmax(0, 1fr) 18px; align-items: center; gap: 10px; padding: 12px; border: 1px solid #dfe6ef; border-radius: 9px; background: #fff; color: inherit; text-align: left; font: inherit; cursor: pointer; transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease; }
.quick-actions-grid button:hover { transform: translateY(-2px); border-color: #b7c8de; box-shadow: 0 8px 18px rgb(15 37 71 / 8%); }
.quick-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 9px; }
.quick-icon svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.quick-icon--blue { background: #edf4ff; color: #1d61d0; }
.quick-icon--orange { background: #fff1e7; color: #ec7315; }
.quick-icon--green { background: #eaf8ef; color: #168a47; }
.quick-actions-grid button > span:nth-child(2) { min-width: 0; display: grid; gap: 3px; }
.quick-actions-grid strong { color: #26364e; font-size: 11px; }
.quick-actions-grid small { overflow: hidden; color: #758398; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.quick-chevron { width: 17px; height: 17px; fill: none; stroke: #718198; stroke-width: 2; }

.updates-state { min-height: 235px; display: grid; place-items: center; color: #78879b; font-size: 11px; }
.updates-list { padding: 6px 14px 12px; }
.updates-list button { width: 100%; min-height: 48px; display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; align-items: center; gap: 9px; padding: 6px 2px; border: 0; border-bottom: 1px solid #edf1f5; background: transparent; color: inherit; text-align: left; font: inherit; cursor: pointer; }
.updates-list button:last-child { border-bottom: 0; }
.updates-list button:hover { background: #fbfdff; }
.update-icon { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; }
.update-icon svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.update-icon--blue { background: #edf4ff; color: #1d61d0; }
.update-icon--orange { background: #fff1e7; color: #ec7315; }
.update-icon--green { background: #eaf8ef; color: #168a47; }
.update-icon--slate { background: #eef1f5; color: #5f7087; }
.update-copy { min-width: 0; display: grid; gap: 2px; }
.update-copy strong, .update-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.update-copy strong { color: #2a394f; font-size: 10.5px; }
.update-copy small { color: #7a8798; font-size: 8.5px; }
.updates-list time { color: #8793a4; font-size: 9px; white-space: nowrap; }

@media (max-width: 1180px) {
  .overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tracking-grid, .dashboard-lower-grid { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .welcome-heading, .section-heading { align-items: stretch; flex-direction: column; }
  .date-card { align-self: flex-start; }
  .refresh-button { align-self: flex-start; }
  .tracking-card { padding: 16px; }
  .tracking-heading { align-items: flex-start; flex-direction: column; }
  .progress-step strong { font-size: 9px; }
  .progress-step small { font-size: 7px; }
}

@media (max-width: 560px) {
  .overview-grid, .quick-actions-grid { grid-template-columns: 1fr; }
  .overview-card { min-height: 112px; }
  .user-context i { display: none; }
  .user-context { align-items: flex-start; flex-direction: column; }
  .tracking-identity { grid-template-columns: 40px minmax(0, 1fr); }
  .current-status { grid-column: 2; justify-self: start; }
  .progress-track { overflow-x: auto; padding-bottom: 6px; }
  .progress-track--pedido { min-width: 470px; }
  .progress-track--residuo { min-width: 570px; }
  .updates-list button { grid-template-columns: 32px minmax(0, 1fr); }
  .updates-list time { grid-column: 2; }
}
</style>
