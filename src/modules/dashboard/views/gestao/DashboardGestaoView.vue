<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { estoqueService } from '@/modules/estoque/services/estoqueService'
import type { EstoqueCentralResponse, LoteResponse } from '@/modules/estoque/types/estoque'
import { movimentacaoService } from '@/modules/movimentacoes/services/movimentacaoService'
import type { MovimentacaoEstoqueResponse, TipoMovimentacao } from '@/modules/movimentacoes/types/movimentacao'
import { pedidoService } from '@/modules/pedidos/services/pedidoService'
import type { PedidoResponse } from '@/modules/pedidos/types/pedido'
import { residuoService } from '@/modules/residuos/services/residuoService'
import type { ResiduoResponse } from '@/modules/residuos/types/residuo'
import { useSessionStore } from '@/stores/session'

interface ItemAtencao {
  id: string
  tipo: 'pedido' | 'estoque' | 'residuo' | 'lote'
  categoria: string
  titulo: string
  descricao: string
  detalhe: string
  nivel: 'critico' | 'alto' | 'medio'
  rota: string
}

interface ResumoLaboratorio {
  id: string
  nome: string
  pedidosPendentes: number
  urgentes: number
  residuosAtivos: number
  total: number
}

const router = useRouter()
const session = useSessionStore()

const carregando = ref(true)
const erro = ref('')
const atualizadoEm = ref<Date | null>(null)
const pedidos = ref<PedidoResponse[]>([])
const estoquesBaixos = ref<EstoqueCentralResponse[]>([])
const residuos = ref<ResiduoResponse[]>([])
const movimentacoes = ref<MovimentacaoEstoqueResponse[]>([])
const lotes = ref<LoteResponse[]>([])

const hoje = computed(() => inicioDoDia(new Date()))

const pedidosUrgentes = computed(() =>
  pedidos.value.filter((pedido) => pedido.status === 'PENDENTE' && pedido.urgente),
)

const pedidosPendentes = computed(() =>
  pedidos.value.filter((pedido) => pedido.status === 'PENDENTE'),
)

const pedidosAprovados = computed(() =>
  pedidos.value.filter((pedido) => pedido.status === 'APROVADO'),
)

const residuosPendentesAnalise = computed(() =>
  residuos.value.filter((residuo) => residuo.status === 'INFORMADO' || residuo.status === 'EM_ANALISE'),
)

const residuosAtivos = computed(() =>
  residuos.value.filter((residuo) => residuo.status !== 'DESPACHADO'),
)

const lotesVencidos = computed(() =>
  lotes.value.filter((lote) => {
    if (!lote.ativo || !lote.dataValidade) return false
    return fimDoDia(new Date(`${lote.dataValidade}T00:00:00`)).getTime() < hoje.value.getTime()
  }),
)

const lotesVencendo30Dias = computed(() =>
  lotes.value.filter((lote) => diasAteValidade(lote) >= 0 && diasAteValidade(lote) <= 30),
)

const lotesVencendo7Dias = computed(() =>
  lotes.value.filter((lote) => diasAteValidade(lote) >= 0 && diasAteValidade(lote) <= 7),
)

const processos = computed(() => {
  const itens = [
    {
      titulo: 'Fila de aprovação',
      descricao: 'Pedidos aguardando sua aprovação',
      valor: pedidosPendentes.value.length,
      tom: 'azul',
      rota: '/pedidos?status=PENDENTE',
    },
    {
      titulo: 'Resíduos aguardando análise',
      descricao: 'Informados ou já em análise pela gestão',
      valor: residuosPendentesAnalise.value.length,
      tom: 'roxo',
      rota: '/residuos?filtro=pendentes-analise',
    },
    {
      titulo: 'Pedidos aprovados para entrega',
      descricao: 'Solicitações prontas para atendimento',
      valor: pedidosAprovados.value.length,
      tom: 'verde',
      rota: '/pedidos?status=APROVADO',
    },
    {
      titulo: 'Lotes próximos do vencimento',
      descricao: 'Validade dentro dos próximos 30 dias',
      valor: lotesVencendo30Dias.value.length,
      tom: 'laranja',
      rota: '/estoque',
    },
  ]

  const maior = Math.max(...itens.map((item) => item.valor), 1)
  return itens.map((item) => ({ ...item, carga: Math.round((item.valor / maior) * 100) }))
})

const itensAtencao = computed<ItemAtencao[]>(() => {
  const itens: ItemAtencao[] = []

  pedidosUrgentes.value.forEach((pedido) => {
    itens.push({
      id: `pedido-${pedido.id}`,
      tipo: 'pedido',
      categoria: 'Pedido urgente',
      titulo: `Pedido ${codigoCurto(pedido.id)} · ${pedido.usuarioNome}`,
      descricao: pedido.itens.map((item) => item.produtoNome).slice(0, 2).join(' · ') || 'Solicitação sem itens',
      detalhe: tempoDesde(pedido.dataSolicitacao),
      nivel: 'critico',
      rota: '/pedidos?status=PENDENTE&urgencia=URGENTE',
    })
  })

  lotesVencidos.value.forEach((lote) => {
    itens.push({
      id: `lote-vencido-${lote.id}`,
      tipo: 'lote',
      categoria: 'Lote vencido',
      titulo: `${lote.codigoInterno} · ${lote.produtoNome}`,
      descricao: `Validade ${formatarData(lote.dataValidade)}`,
      detalhe: 'Ação imediata',
      nivel: 'critico',
      rota: `/estoque/${lote.estoqueCentralId}`,
    })
  })

  estoquesBaixos.value.forEach((estoque) => {
    itens.push({
      id: `estoque-${estoque.id}`,
      tipo: 'estoque',
      categoria: 'Estoque crítico',
      titulo: estoque.produtoNome,
      descricao: `Atual: ${formatarNumero(estoque.quantidadeAtual)} · mínimo: ${formatarNumero(estoque.quantidadeMinima)}`,
      detalhe: 'Repor estoque',
      nivel: 'alto',
      rota: `/estoque/${estoque.id}`,
    })
  })

  lotesVencendo7Dias.value.forEach((lote) => {
    itens.push({
      id: `lote-${lote.id}`,
      tipo: 'lote',
      categoria: 'Vencimento próximo',
      titulo: `${lote.codigoInterno} · ${lote.produtoNome}`,
      descricao: `Validade ${formatarData(lote.dataValidade)}`,
      detalhe: diasAteValidade(lote) === 0 ? 'Vence hoje' : `Vence em ${diasAteValidade(lote)} dia(s)`,
      nivel: diasAteValidade(lote) <= 2 ? 'alto' : 'medio',
      rota: `/estoque/${lote.estoqueCentralId}`,
    })
  })

  residuosPendentesAnalise.value.forEach((residuo) => {
    itens.push({
      id: `residuo-${residuo.id}`,
      tipo: 'residuo',
      categoria: residuo.status === 'INFORMADO' ? 'Resíduo aguardando análise' : 'Resíduo em análise',
      titulo: residuo.codigoRastreio || `Resíduo ${codigoCurto(residuo.id)}`,
      descricao: `${residuo.descricao} · ${residuo.laboratorioNome}`,
      detalhe: tempoDesde(residuo.dataRecebimento || residuo.dataInformacao),
      nivel: residuo.nivelRiscoInformado === 'ALTO' ? 'alto' : 'medio',
      rota: '/residuos?filtro=pendentes-analise',
    })
  })

  const peso = { critico: 3, alto: 2, medio: 1 }
  return itens
    .sort((a, b) => peso[b.nivel] - peso[a.nivel])
    .slice(0, 5)
})

const ultimasMovimentacoes = computed(() =>
  [...movimentacoes.value]
    .sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime())
    .slice(0, 7),
)

const resumoLaboratorios = computed<ResumoLaboratorio[]>(() => {
  const mapa = new Map<string, ResumoLaboratorio>()

  pedidosPendentes.value.forEach((pedido) => {
    const atual = mapa.get(pedido.laboratorioId) ?? {
      id: pedido.laboratorioId,
      nome: pedido.laboratorioNome,
      pedidosPendentes: 0,
      urgentes: 0,
      residuosAtivos: 0,
      total: 0,
    }
    atual.pedidosPendentes += 1
    if (pedido.urgente) atual.urgentes += 1
    mapa.set(pedido.laboratorioId, atual)
  })

  residuosAtivos.value.forEach((residuo) => {
    const atual = mapa.get(residuo.laboratorioId) ?? {
      id: residuo.laboratorioId,
      nome: residuo.laboratorioNome,
      pedidosPendentes: 0,
      urgentes: 0,
      residuosAtivos: 0,
      total: 0,
    }
    atual.residuosAtivos += 1
    mapa.set(residuo.laboratorioId, atual)
  })

  return [...mapa.values()]
    .map((item) => ({ ...item, total: item.pedidosPendentes + item.residuosAtivos + item.urgentes }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4)
})

async function carregarDashboard() {
  carregando.value = true
  erro.value = ''

  const unidadeId = session.usuario?.unidadeId
  if (!unidadeId) {
    erro.value = 'O usuário de gestão não possui unidade vinculada. Não foi possível carregar os indicadores de estoque.'
    carregando.value = false
    return
  }

  try {
    const [pedidosResult, estoquesResult, baixosResult, residuosResult, movimentacoesResult] = await Promise.allSettled([
      pedidoService.listarTodos(),
      estoqueService.listarPorUnidade(unidadeId),
      estoqueService.listarEstoqueBaixo(unidadeId),
      residuoService.listarTodos(),
      movimentacaoService.listarTodos(),
    ])

    pedidos.value = pedidosResult.status === 'fulfilled' ? pedidosResult.value : []
    estoquesBaixos.value = baixosResult.status === 'fulfilled' ? baixosResult.value.filter((item) => item.ativo) : []
    residuos.value = residuosResult.status === 'fulfilled' ? residuosResult.value : []
    movimentacoes.value = movimentacoesResult.status === 'fulfilled' ? movimentacoesResult.value : []

    const estoques = estoquesResult.status === 'fulfilled' ? estoquesResult.value.filter((item) => item.ativo) : []
    const resultadosLotes = await Promise.allSettled(
      estoques.map((estoque) => estoqueService.listarLotesPorEstoque(estoque.id)),
    )
    lotes.value = resultadosLotes
      .filter((resultado): resultado is PromiseFulfilledResult<LoteResponse[]> => resultado.status === 'fulfilled')
      .flatMap((resultado) => resultado.value)
      .filter((lote) => lote.ativo)

    const falhas = [pedidosResult, estoquesResult, baixosResult, residuosResult, movimentacoesResult]
      .filter((resultado) => resultado.status === 'rejected').length

    if (falhas > 0) {
      erro.value = `Alguns indicadores não puderam ser atualizados (${falhas} fonte${falhas > 1 ? 's' : ''}). Os dados disponíveis continuam exibidos.`
    }

    atualizadoEm.value = new Date()
  } catch (error) {
    console.error(error)
    erro.value = 'Não foi possível carregar o painel operacional. Tente atualizar novamente.'
  } finally {
    carregando.value = false
  }
}

function abrir(rota: string) {
  router.push(rota)
}

function inicioDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

function fimDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59, 999)
}

function diasAteValidade(lote: LoteResponse) {
  if (!lote.ativo || !lote.dataValidade) return Number.POSITIVE_INFINITY
  const validade = inicioDoDia(new Date(`${lote.dataValidade}T00:00:00`))
  return Math.ceil((validade.getTime() - hoje.value.getTime()) / 86_400_000)
}

function formatarData(data: string | null) {
  if (!data) return 'Sem data'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${data}T00:00:00`))
}

function formatarHora(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(data))
}

function formatarNumero(valor: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(valor)
}

function codigoCurto(id: string) {
  return `#${id.replaceAll('-', '').slice(-6).toUpperCase()}`
}

function tempoDesde(data: string) {
  const momento = new Date(data)
  const diferencaHoras = Math.max(0, Math.floor((Date.now() - momento.getTime()) / 3_600_000))
  if (diferencaHoras < 1) return 'Agora'
  if (diferencaHoras < 24) return `Há ${diferencaHoras} h`
  const dias = Math.floor(diferencaHoras / 24)
  return `Há ${dias} dia${dias > 1 ? 's' : ''}`
}

function movimentoMeta(tipo: TipoMovimentacao) {
  const mapa: Record<TipoMovimentacao, { rotulo: string; classe: string }> = {
    ENTRADA: { rotulo: 'Entrada', classe: 'entrada' },
    SAIDA: { rotulo: 'Saída', classe: 'saida' },
    AJUSTE: { rotulo: 'Ajuste', classe: 'ajuste' },
    DEVOLUCAO: { rotulo: 'Devolução', classe: 'devolucao' },
    DESCARTE_VENCIMENTO: { rotulo: 'Descarte', classe: 'descarte' },
  }
  return mapa[tipo]
}

function descricaoMovimentacao(movimentacao: MovimentacaoEstoqueResponse) {
  const quantidade = formatarNumero(movimentacao.quantidadeMovimentada)
  const lote = movimentacao.codigoInternoLote ? ` · ${movimentacao.codigoInternoLote}` : ''
  return `${movimentacao.produtoNome}${lote} · ${quantidade}`
}

onMounted(carregarDashboard)
</script>

<template>
  <section class="dashboard-page">
    <header class="dashboard-heading">
      <div>
        <span class="dashboard-eyebrow">GESTÃO OPERACIONAL</span>
        <h1>Painel Operacional do Dia</h1>
        <p>Tudo o que precisa de atenção, o que está pendente e o que vem acontecendo na operação.</p>
      </div>
      <button class="dashboard-refresh" type="button" :disabled="carregando" @click="carregarDashboard">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>
        {{ carregando ? 'Atualizando...' : 'Atualizar dados' }}
      </button>
    </header>

    <div v-if="erro" class="dashboard-warning" role="status">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.8 20h18.4L12 3ZM12 9v5M12 17.5v.5" /></svg>
      <span>{{ erro }}</span>
    </div>

    <div class="dashboard-kpis" aria-label="Indicadores principais">
      <button class="kpi-card kpi-card--blue" type="button" @click="abrir('/pedidos?status=PENDENTE')">
        <span class="kpi-icon"><svg viewBox="0 0 24 24"><path d="M5 5h14v14H5zM8 9h8M8 13h8M8 17h5" /></svg></span>
        <span><small>Pedidos</small><strong>{{ pedidosPendentes.length }}</strong><em>Solicitações pendentes</em></span>
      </button>
      <button class="kpi-card kpi-card--red" type="button" @click="abrir('/pedidos?status=PENDENTE&urgencia=URGENTE')">
        <span class="kpi-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></svg></span>
        <span><small>Urgentes</small><strong>{{ pedidosUrgentes.length }}</strong><em>Requerem prioridade</em></span>
      </button>
      <button class="kpi-card kpi-card--orange" type="button" @click="abrir('/estoque?situacao=BAIXO')">
        <span class="kpi-icon"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" /></svg></span>
        <span><small>Baixo estoque</small><strong>{{ estoquesBaixos.length }}</strong><em>Itens abaixo do mínimo</em></span>
      </button>
      <button class="kpi-card kpi-card--purple" type="button" @click="abrir('/residuos?filtro=pendentes-analise')">
        <span class="kpi-icon"><svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 17l-5-9V3M8 14h8" /></svg></span>
        <span><small>Resíduos a analisar</small><strong>{{ residuosPendentesAnalise.length }}</strong><em>Pendentes ou em análise</em></span>
      </button>
      <button class="kpi-card kpi-card--amber" type="button" @click="abrir('/estoque')">
        <span class="kpi-icon"><svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 14h3M13 14h3" /></svg></span>
        <span><small>Vencendo em 30 dias</small><strong>{{ lotesVencendo30Dias.length }}</strong><em>{{ lotesVencidos.length }} lote(s) já vencido(s)</em></span>
      </button>
    </div>

    <div class="dashboard-primary-grid">
      <article class="dashboard-panel dashboard-panel--processos">
        <header class="panel-heading">
          <div><span class="panel-icon panel-icon--blue">☷</span><h2>Processos</h2></div>
          <button type="button" @click="abrir('/pedidos')">Ver tudo</button>
        </header>
        <div v-if="carregando" class="panel-loading">Carregando processos...</div>
        <div v-else class="process-list">
          <button v-for="processo in processos" :key="processo.titulo" class="process-item" type="button" @click="abrir(processo.rota)">
            <span class="process-icon" :class="`process-icon--${processo.tom}`">
              <svg v-if="processo.tom === 'azul'" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="16" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
              <svg v-else-if="processo.tom === 'roxo'" viewBox="0 0 24 24"><path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 17l-5-9V3M8 14h8" /></svg>
              <svg v-else-if="processo.tom === 'verde'" viewBox="0 0 24 24"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 17a2 2 0 1 0 0 .01M17 17a2 2 0 1 0 0 .01" /></svg>
              <svg v-else viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
            </span>
            <span class="process-copy">
              <strong>{{ processo.titulo }}</strong>
              <small>{{ processo.descricao }}</small>
              <span class="process-meter" title="Carga relativa deste processo em comparação aos demais processos exibidos">
                <span :class="`process-meter__fill process-meter__fill--${processo.tom}`" :style="{ width: `${processo.carga}%` }" />
              </span>
            </span>
            <span class="process-value">{{ processo.valor }}</span>
          </button>
        </div>
        <button class="panel-footer-link" type="button" @click="abrir('/pedidos')">Ver todos os processos <span>→</span></button>
      </article>

      <article class="dashboard-panel dashboard-panel--attention">
        <header class="panel-heading panel-heading--danger">
          <div><span class="panel-icon panel-icon--red">△</span><h2>Precisa de atenção</h2></div>
          <button type="button" @click="abrir('/pedidos')">Ver tudo</button>
        </header>
        <div v-if="carregando" class="panel-loading">Buscando prioridades...</div>
        <div v-else-if="itensAtencao.length === 0" class="panel-empty">Nenhuma pendência crítica encontrada agora.</div>
        <div v-else class="attention-list">
          <button v-for="(item, index) in itensAtencao" :key="item.id" class="attention-item" :class="`attention-item--${item.nivel}`" type="button" @click="abrir(item.rota)">
            <span class="attention-rank">{{ index + 1 }}</span>
            <span class="attention-copy">
              <em>{{ item.categoria }}</em>
              <strong>{{ item.titulo }}</strong>
              <small>{{ item.descricao }}</small>
            </span>
            <span class="attention-detail">{{ item.detalhe }}</span>
          </button>
        </div>
        <button class="panel-footer-link" type="button" @click="abrir('/pedidos')">Ver todas as pendências críticas <span>→</span></button>
      </article>

      <article class="dashboard-panel dashboard-panel--history">
        <header class="panel-heading">
          <div><span class="panel-icon panel-icon--blue">↕</span><h2>Últimas movimentações</h2></div>
          <button type="button" @click="abrir('/movimentacoes')">Ver tudo</button>
        </header>
        <div v-if="carregando" class="panel-loading">Carregando histórico...</div>
        <div v-else-if="ultimasMovimentacoes.length === 0" class="panel-empty">Nenhuma movimentação registrada.</div>
        <div v-else class="timeline-list">
          <button v-for="(movimentacao, index) in ultimasMovimentacoes" :key="movimentacao.id" class="timeline-item" type="button" @click="abrir('/movimentacoes')">
            <time>{{ formatarHora(movimentacao.dataMovimentacao) }}</time>
            <span class="timeline-axis" :class="`timeline-axis--${movimentoMeta(movimentacao.tipoMovimentacao).classe}`">
              <span class="timeline-line timeline-line--top" v-if="index > 0" />
              <span class="timeline-dot" />
              <span class="timeline-line timeline-line--bottom" v-if="index < ultimasMovimentacoes.length - 1" />
            </span>
            <span class="timeline-copy">
              <strong>{{ movimentoMeta(movimentacao.tipoMovimentacao).rotulo }} registrada</strong>
              <small>{{ descricaoMovimentacao(movimentacao) }}</small>
            </span>
            <span class="timeline-status" :class="`timeline-status--${movimentoMeta(movimentacao.tipoMovimentacao).classe}`">{{ movimentoMeta(movimentacao.tipoMovimentacao).rotulo }}</span>
          </button>
        </div>
        <button class="panel-footer-link" type="button" @click="abrir('/movimentacoes')">Ver todo o histórico <span>→</span></button>
      </article>
    </div>

    <div class="dashboard-secondary-grid">
      <article class="dashboard-panel dashboard-panel--labs">
        <header class="panel-heading">
          <div><span class="panel-icon panel-icon--blue">⌂</span><h2>Resumo por laboratório</h2></div>
          <button type="button" @click="abrir('/pedidos')">Ver pedidos</button>
        </header>
        <div v-if="carregando" class="panel-loading">Consolidando laboratórios...</div>
        <div v-else-if="resumoLaboratorios.length === 0" class="panel-empty">Não há processos ativos por laboratório.</div>
        <div v-else class="labs-grid">
          <button v-for="laboratorio in resumoLaboratorios" :key="laboratorio.id" class="lab-card" type="button" @click="abrir('/pedidos')">
            <strong>{{ laboratorio.nome }}</strong>
            <span><small>Pedidos pendentes</small><b>{{ laboratorio.pedidosPendentes }}</b></span>
            <span><small>Urgentes</small><b class="lab-value--red">{{ laboratorio.urgentes }}</b></span>
            <span><small>Resíduos ativos</small><b class="lab-value--purple">{{ laboratorio.residuosAtivos }}</b></span>
            <em>Ver detalhes →</em>
          </button>
        </div>
        <footer class="labs-footer">
          <span><strong>{{ pedidosPendentes.length }}</strong> pedidos pendentes</span>
          <span><strong>{{ residuosAtivos.length }}</strong> resíduos ativos</span>
          <small v-if="atualizadoEm">Atualizado às {{ formatarHora(atualizadoEm.toISOString()) }}</small>
        </footer>
      </article>

      <article class="dashboard-panel dashboard-panel--actions">
        <header class="panel-heading">
          <div><span class="panel-icon panel-icon--blue">⌁</span><h2>Ações rápidas</h2></div>
        </header>
        <div class="quick-actions">
          <button type="button" class="quick-action quick-action--blue" @click="abrir('/pedidos?status=PENDENTE')"><span>✓</span><div><strong>Aprovar pedidos</strong><small>Analisar solicitações pendentes</small></div><b>›</b></button>
          <button type="button" class="quick-action quick-action--green" @click="abrir('/estoque')"><span>↓</span><div><strong>Abrir estoque</strong><small>Consultar lotes e registrar entradas</small></div><b>›</b></button>
          <button type="button" class="quick-action quick-action--orange" @click="abrir('/movimentacoes')"><span>⇄</span><div><strong>Movimentações</strong><small>Auditoria de entradas e saídas</small></div><b>›</b></button>
          <button type="button" class="quick-action quick-action--purple" @click="abrir('/residuos')"><span>♙</span><div><strong>Ver resíduos</strong><small>Acompanhar gestão e análise</small></div><b>›</b></button>
          <button type="button" class="quick-action quick-action--wide" @click="abrir('/relatorios')"><span>▤</span><div><strong>Emitir relatório</strong><small>Gerar relatórios gerenciais e operacionais</small></div><b>›</b></button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 18px;
  color: var(--sgl-text);
}

.dashboard-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.dashboard-eyebrow {
  display: block;
  margin-bottom: 5px;
  color: var(--sgl-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .12em;
}

.dashboard-heading h1 {
  margin: 0;
  color: #111a2f;
  font-size: clamp(24px, 2.3vw, 31px);
  line-height: 1.1;
}

.dashboard-heading p {
  margin: 7px 0 0;
  color: var(--sgl-text-muted);
  font-size: 13px;
}

.dashboard-refresh {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 13px;
  border: 1px solid #b7c7df;
  border-radius: 7px;
  background: #fff;
  color: var(--sgl-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.dashboard-refresh:disabled { opacity: .55; cursor: wait; }
.dashboard-refresh svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

.dashboard-warning {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 12px;
  border: 1px solid #f4d390;
  border-radius: 8px;
  background: #fffbeb;
  color: #8b5b08;
  font-size: 12px;
}
.dashboard-warning svg { width: 18px; height: 18px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.8; }

.dashboard-kpis {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card {
  min-width: 0;
  min-height: 102px;
  display: grid;
  grid-template-columns: 46px 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--sgl-border);
  border-radius: 9px;
  background: var(--sgl-surface);
  color: var(--sgl-text);
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
}
.kpi-card:hover {
  transform: translateY(-4px) scale(1.015);
  border-color: #9fb6d8;
  background: #fbfdff;
  box-shadow: 0 12px 26px rgb(13 43 94 / 16%);
}
.kpi-card > span:last-child { min-width: 0; display: grid; }
.kpi-card small { color: #46566e; font-size: 11px; font-weight: 700; }
.kpi-card strong { margin-top: 2px; color: #111a2f; font-size: 24px; line-height: 1; }
.kpi-card em { margin-top: 8px; overflow: hidden; color: var(--sgl-text-muted); font-size: 9.5px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.kpi-icon { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; }
.kpi-icon svg { width: 23px; height: 23px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.kpi-card--blue .kpi-icon { background: #edf4ff; color: #1e5bc8; }
.kpi-card--red .kpi-icon { background: #fff0f0; color: #e43131; }
.kpi-card--orange .kpi-icon { background: #fff4e7; color: #ed7b13; }
.kpi-card--purple .kpi-icon { background: #f3efff; color: #7347dd; }
.kpi-card--amber .kpi-icon { background: #fff6e7; color: #e58b16; }
.kpi-card--red { border-color: #f1cccc; }
.kpi-card--orange, .kpi-card--amber { border-color: #f1ddbb; }

.dashboard-primary-grid {
  display: grid;
  grid-template-columns: minmax(0, .95fr) minmax(0, 1.15fr) minmax(0, 1.08fr);
  gap: 14px;
  align-items: stretch;
}

.dashboard-secondary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(330px, 1fr);
  gap: 14px;
}

.dashboard-panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--sgl-border);
  border-radius: 9px;
  background: var(--sgl-surface);
  overflow: hidden;
}

.panel-heading {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  border-bottom: 1px solid #eef2f7;
}
.panel-heading > div { display: flex; align-items: center; gap: 8px; min-width: 0; }
.panel-heading h2 { margin: 0; color: var(--sgl-primary); font-size: 13px; }
.panel-heading button { border: 0; background: transparent; color: var(--sgl-primary); font: inherit; font-size: 10px; font-weight: 700; cursor: pointer; }
.panel-heading--danger h2 { color: var(--sgl-error); }
.panel-icon { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 6px; font-size: 15px; font-weight: 900; }
.panel-icon--blue { color: var(--sgl-primary); }
.panel-icon--red { color: var(--sgl-error); }
.panel-loading, .panel-empty { min-height: 220px; display: grid; place-items: center; padding: 24px; color: var(--sgl-text-muted); font-size: 11px; text-align: center; }
.panel-footer-link { min-height: 42px; margin-top: auto; border: 0; border-top: 1px solid #eef2f7; background: #fff; color: var(--sgl-primary); font: inherit; font-size: 10px; font-weight: 700; cursor: pointer; }
.panel-footer-link span { margin-left: 8px; font-size: 15px; }

.process-list { display: grid; }
.process-item {
  min-height: 80px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 34px;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  border: 0;
  border-bottom: 1px solid #eef2f7;
  background: #fff;
  color: inherit;
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.process-item:hover { background: #fbfdff; }
.process-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 9px; }
.process-icon svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.process-icon--azul { background: #edf4ff; color: #1e5bc8; }
.process-icon--roxo { background: #f3efff; color: #7347dd; }
.process-icon--verde { background: #ecf9f0; color: #1b9a4b; }
.process-icon--laranja { background: #fff4e7; color: #ed7b13; }
.process-copy { min-width: 0; display: grid; gap: 3px; }
.process-copy strong { overflow: hidden; color: #18243b; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.process-copy small { overflow: hidden; color: var(--sgl-text-muted); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.process-value { justify-self: end; color: #18243b; font-size: 20px; font-weight: 800; }
.process-meter { width: 100%; height: 4px; display: block; margin-top: 5px; overflow: hidden; border-radius: 999px; background: #e8edf4; }
.process-meter__fill { height: 100%; display: block; min-width: 5px; border-radius: inherit; }
.process-meter__fill--azul { background: #2b66d0; }
.process-meter__fill--roxo { background: #7446df; }
.process-meter__fill--verde { background: #1eaa52; }
.process-meter__fill--laranja { background: #ef861d; }

.attention-list { display: grid; }
.attention-item {
  position: relative;
  min-height: 73px;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 9px 11px 9px 14px;
  border: 0;
  border-bottom: 1px solid #eef2f7;
  background: #fff;
  color: inherit;
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.attention-item::before { content: ''; position: absolute; inset: 7px auto 7px 0; width: 3px; border-radius: 0 4px 4px 0; background: #e6a523; }
.attention-item--critico::before { background: #ef3333; }
.attention-item--alto::before { background: #f1841c; }
.attention-item--medio::before { background: #7446df; }
.attention-item:hover { background: #fffdfb; }
.attention-rank { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; background: #eef2f7; color: #55627a; font-size: 10px; font-weight: 800; }
.attention-item--critico .attention-rank { background: #ef3333; color: #fff; }
.attention-item--alto .attention-rank { background: #f1841c; color: #fff; }
.attention-item--medio .attention-rank { background: #7446df; color: #fff; }
.attention-copy { min-width: 0; display: grid; gap: 2px; }
.attention-copy em { width: fit-content; padding: 2px 5px; border-radius: 4px; background: #fff2f2; color: #dd2d2d; font-size: 8px; font-style: normal; font-weight: 700; }
.attention-item--alto .attention-copy em { background: #fff3e5; color: #d96f0a; }
.attention-item--medio .attention-copy em { background: #f4efff; color: #6942ca; }
.attention-copy strong, .attention-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attention-copy strong { color: #19243a; font-size: 10.5px; }
.attention-copy small { color: var(--sgl-text-muted); font-size: 8.8px; }
.attention-detail { max-width: 72px; color: #7a5261; font-size: 8.5px; font-weight: 700; text-align: right; }

.timeline-list { display: grid; padding: 4px 0; }
.timeline-item {
  min-height: 55px;
  display: grid;
  grid-template-columns: 40px 18px minmax(0, 1fr) auto;
  align-items: stretch;
  gap: 7px;
  padding: 0 11px;
  border: 0;
  background: #fff;
  color: inherit;
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.timeline-item:hover { background: #fbfdff; }
.timeline-item time { align-self: center; color: #47566e; font-size: 9px; font-weight: 700; text-align: right; }
.timeline-axis { position: relative; display: grid; place-items: center; color: #2b66d0; }
.timeline-line { position: absolute; left: 50%; width: 1.5px; transform: translateX(-50%); background: #d9e1ec; }
.timeline-line--top { top: 0; bottom: 50%; }
.timeline-line--bottom { top: 50%; bottom: 0; }
.timeline-dot { position: relative; z-index: 2; width: 7px; height: 7px; border: 2px solid currentColor; border-radius: 50%; background: #fff; box-shadow: 0 0 0 2px #fff; }
.timeline-axis--entrada { color: #2b66d0; }
.timeline-axis--saida { color: #e13b3b; }
.timeline-axis--ajuste { color: #7446df; }
.timeline-axis--devolucao { color: #20a452; }
.timeline-axis--descarte { color: #e38a16; }
.timeline-copy { min-width: 0; align-self: center; display: grid; gap: 2px; }
.timeline-copy strong, .timeline-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.timeline-copy strong { color: #19243a; font-size: 10px; }
.timeline-copy small { color: var(--sgl-text-muted); font-size: 8.5px; }
.timeline-status { align-self: center; padding: 4px 6px; border-radius: 5px; font-size: 8px; font-weight: 700; white-space: nowrap; }
.timeline-status--entrada { background: #eaf2ff; color: #1c5cc7; }
.timeline-status--saida { background: #fff0f0; color: #d63434; }
.timeline-status--ajuste { background: #f3efff; color: #6942ca; }
.timeline-status--devolucao { background: #ebf8ef; color: #198d45; }
.timeline-status--descarte { background: #fff4e5; color: #cf750c; }

.labs-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; padding: 11px; }
.lab-card { min-width: 0; min-height: 145px; display: grid; gap: 7px; padding: 11px; border: 1px solid #e5eaf1; border-radius: 8px; background: #fff; color: inherit; text-align: left; font: inherit; cursor: pointer; }
.lab-card:hover { border-color: #b8cae4; }
.lab-card > strong { overflow: hidden; color: #19243a; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.lab-card > span { display: flex; justify-content: space-between; gap: 8px; }
.lab-card small { color: #526078; font-size: 8.5px; }
.lab-card b { color: #2d63bf; font-size: 10px; }
.lab-value--red { color: #e03939 !important; }
.lab-value--purple { color: #7446df !important; }
.lab-card em { margin-top: auto; color: var(--sgl-primary); font-size: 8.5px; font-style: normal; font-weight: 700; }
.labs-footer { min-height: 42px; display: flex; align-items: center; gap: 18px; padding: 0 13px; border-top: 1px solid #eef2f7; color: var(--sgl-text-muted); font-size: 9px; }
.labs-footer strong { color: #1d2a42; }
.labs-footer small { margin-left: auto; }

.quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; padding: 11px; }
.quick-action { min-width: 0; min-height: 62px; display: grid; grid-template-columns: 34px minmax(0, 1fr) 14px; align-items: center; gap: 9px; padding: 8px 10px; border: 1px solid #e1e7ef; border-radius: 8px; background: #fff; color: inherit; text-align: left; font: inherit; cursor: pointer; }
.quick-action:hover { background: #fbfdff; border-color: #c7d4e6; }
.quick-action > span { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 7px; background: #edf4ff; color: #1d5cca; font-size: 18px; font-weight: 800; }
.quick-action > div { min-width: 0; display: grid; gap: 2px; }
.quick-action strong { overflow: hidden; color: #1d3f83; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.quick-action small { overflow: hidden; color: var(--sgl-text-muted); font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.quick-action b { color: #3b536f; font-size: 18px; font-weight: 400; }
.quick-action--green > span { background: #ebf8ef; color: #16924a; }
.quick-action--green strong { color: #168542; }
.quick-action--orange > span { background: #fff3e5; color: #e97b11; }
.quick-action--orange strong { color: #cf6c0b; }
.quick-action--purple > span { background: #f2edff; color: #7044d9; }
.quick-action--purple strong { color: #6740c7; }
.quick-action--wide { grid-column: 1 / -1; }

@media (max-width: 1180px) {
  .dashboard-kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .dashboard-primary-grid { grid-template-columns: 1fr 1fr; }
  .dashboard-panel--history { grid-column: 1 / -1; }
  .dashboard-secondary-grid { grid-template-columns: 1fr; }
}

@media (max-width: 820px) {
  .dashboard-heading { flex-direction: column; }
  .dashboard-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dashboard-primary-grid { grid-template-columns: 1fr; }
  .dashboard-panel--history { grid-column: auto; }
  .labs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 520px) {
  .dashboard-kpis { grid-template-columns: 1fr; }
  .quick-actions { grid-template-columns: 1fr; }
  .quick-action--wide { grid-column: auto; }
  .labs-grid { grid-template-columns: 1fr; }
  .labs-footer { align-items: flex-start; flex-direction: column; gap: 4px; padding: 10px 13px; }
  .labs-footer small { margin-left: 0; }
}
</style>