<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import type { LaboratorioCadastro, UsuarioPermissao } from '@/modules/admin/types/cadastros'
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
  residuosAnalise: number
  total: number
}

type PainelResumo = 'laboratorios' | 'rapido'

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
const laboratorios = ref<LaboratorioCadastro[]>([])
const usuarios = ref<UsuarioPermissao[]>([])
const painelResumo = ref<PainelResumo>('laboratorios')
const indiceLaboratorio = ref(0)

const hoje = computed(() => inicioDoDia(new Date()))
const unidadeId = computed(() => session.usuario?.unidadeId ?? null)

const pedidosUrgentes = computed(() =>
  pedidos.value.filter((pedido) => pedido.status === 'PENDENTE' && pedido.urgente),
)

const pedidosPendentes = computed(() =>
  pedidos.value.filter((pedido) => pedido.status === 'PENDENTE'),
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

const laboratoriosAtivos = computed(() =>
  laboratorios.value.filter(
    (laboratorio) => laboratorio.ativo && (!unidadeId.value || laboratorio.unidadeId === unidadeId.value),
  ),
)

const usuariosAtivos = computed(() =>
  usuarios.value.filter(
    (usuario) => usuario.ativo && (!unidadeId.value || usuario.unidadeId === unidadeId.value),
  ),
)

const entradasHoje = computed(() =>
  movimentacoes.value.filter(
    (movimentacao) =>
      movimentacao.tipoMovimentacao === 'ENTRADA' &&
      mesmoDia(new Date(movimentacao.dataMovimentacao), new Date()),
  ),
)

const saidasHoje = computed(() =>
  movimentacoes.value.filter(
    (movimentacao) =>
      movimentacao.tipoMovimentacao === 'SAIDA' &&
      mesmoDia(new Date(movimentacao.dataMovimentacao), new Date()),
  ),
)

const movimentacoesHoje = computed(() => entradasHoje.value.length + saidasHoje.value.length)

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
      rota: `/pedidos?status=PENDENTE&urgencia=URGENTE&pedido=${encodeURIComponent(pedido.id)}`,
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
      rota: `/estoque/${lote.estoqueCentralId}?lote=${encodeURIComponent(lote.id)}&situacao=VENCIDO`,
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
      rota: `/estoque/${lote.estoqueCentralId}?lote=${encodeURIComponent(lote.id)}&situacao=PROXIMO`,
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
      rota: `/residuos?filtro=pendentes-analise&residuo=${encodeURIComponent(residuo.id)}`,
    })
  })

  const peso = { critico: 3, alto: 2, medio: 1 }
  return itens
    .sort((a, b) => peso[b.nivel] - peso[a.nivel])
    .slice(0, 8)
})

const ultimasMovimentacoes = computed(() =>
  [...movimentacoes.value]
    .sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime())
    .slice(0, 10),
)

const resumoLaboratorios = computed<ResumoLaboratorio[]>(() => {
  const mapa = new Map<string, ResumoLaboratorio>()

  laboratoriosAtivos.value.forEach((laboratorio) => {
    mapa.set(laboratorio.id, {
      id: laboratorio.id,
      nome: laboratorio.nome,
      pedidosPendentes: 0,
      urgentes: 0,
      residuosAtivos: 0,
      residuosAnalise: 0,
      total: 0,
    })
  })

  pedidosPendentes.value.forEach((pedido) => {
    const atual = mapa.get(pedido.laboratorioId) ?? {
      id: pedido.laboratorioId,
      nome: pedido.laboratorioNome,
      pedidosPendentes: 0,
      urgentes: 0,
      residuosAtivos: 0,
      residuosAnalise: 0,
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
      residuosAnalise: 0,
      total: 0,
    }
    atual.residuosAtivos += 1
    if (['INFORMADO', 'EM_ANALISE'].includes(residuo.status)) atual.residuosAnalise += 1
    mapa.set(residuo.laboratorioId, atual)
  })

  return [...mapa.values()]
    .map((item) => ({
      ...item,
      total: item.pedidosPendentes + item.urgentes + item.residuosAtivos + item.residuosAnalise,
    }))
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR'))
})

const laboratorioAtual = computed(() => {
  if (resumoLaboratorios.value.length === 0) return null
  const indice = Math.min(indiceLaboratorio.value, resumoLaboratorios.value.length - 1)
  return resumoLaboratorios.value[indice]
})

async function carregarDashboard() {
  carregando.value = true
  erro.value = ''

  if (!unidadeId.value) {
    erro.value = 'O usuário de gestão não possui unidade vinculada. Alguns indicadores podem ficar indisponíveis.'
  }

  try {
    const [
      pedidosResult,
      estoquesResult,
      baixosResult,
      residuosResult,
      movimentacoesResult,
      laboratoriosResult,
      usuariosResult,
    ] = await Promise.allSettled([
      pedidoService.listarTodos(),
      unidadeId.value ? estoqueService.listarPorUnidade(unidadeId.value) : Promise.resolve([]),
      unidadeId.value ? estoqueService.listarEstoqueBaixo(unidadeId.value) : Promise.resolve([]),
      residuoService.listarTodos(),
      movimentacaoService.listarTodos(),
      cadastrosAdminService.listarLaboratorios(),
      cadastrosAdminService.listarUsuarios(),
    ])

    pedidos.value = pedidosResult.status === 'fulfilled' ? pedidosResult.value : []
    estoquesBaixos.value = baixosResult.status === 'fulfilled' ? baixosResult.value.filter((item) => item.ativo) : []
    residuos.value = residuosResult.status === 'fulfilled' ? residuosResult.value : []
    movimentacoes.value = movimentacoesResult.status === 'fulfilled' ? movimentacoesResult.value : []
    laboratorios.value = laboratoriosResult.status === 'fulfilled' ? laboratoriosResult.value : []
    usuarios.value = usuariosResult.status === 'fulfilled' ? usuariosResult.value : []

    const estoques = estoquesResult.status === 'fulfilled' ? estoquesResult.value.filter((item) => item.ativo) : []
    const resultadosLotes = await Promise.allSettled(
      estoques.map((estoque) => estoqueService.listarLotesPorEstoque(estoque.id)),
    )
    lotes.value = resultadosLotes
      .filter((resultado): resultado is PromiseFulfilledResult<LoteResponse[]> => resultado.status === 'fulfilled')
      .flatMap((resultado) => resultado.value)
      .filter((lote) => lote.ativo)

    indiceLaboratorio.value = 0

    const falhas = [
      pedidosResult,
      estoquesResult,
      baixosResult,
      residuosResult,
      movimentacoesResult,
      laboratoriosResult,
      usuariosResult,
    ].filter((resultado) => resultado.status === 'rejected').length

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

function abrirMovimentacao(movimentacao: MovimentacaoEstoqueResponse) {
  if (movimentacao.tipoMovimentacao === 'SAIDA' && movimentacao.pedidoId) {
    router.push(`/pedidos?pedido=${encodeURIComponent(movimentacao.pedidoId)}`)
    return
  }
  if (movimentacao.estoqueCentralId) {
    const lote = movimentacao.loteId ? `?lote=${encodeURIComponent(movimentacao.loteId)}` : ''
    router.push(`/estoque/${movimentacao.estoqueCentralId}${lote}`)
    return
  }
  if (movimentacao.pedidoId) {
    router.push(`/pedidos?pedido=${encodeURIComponent(movimentacao.pedidoId)}`)
    return
  }
  router.push(`/movimentacoes?movimentacao=${encodeURIComponent(movimentacao.id)}`)
}

function laboratorioAnterior() {
  const total = resumoLaboratorios.value.length
  if (total <= 1) return
  indiceLaboratorio.value = (indiceLaboratorio.value - 1 + total) % total
}

function proximoLaboratorio() {
  const total = resumoLaboratorios.value.length
  if (total <= 1) return
  indiceLaboratorio.value = (indiceLaboratorio.value + 1) % total
}

function inicioDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

function fimDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59, 999)
}

function mesmoDia(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
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
  const contexto = movimentacao.laboratorioNome ? ` · ${movimentacao.laboratorioNome}` : ''
  return `${movimentacao.produtoNome}${lote} · ${quantidade}${contexto}`
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
      <button class="kpi-card kpi-card--amber" type="button" @click="abrir('/estoque/lotes-vencendo')">
        <span class="kpi-icon"><svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 14h3M13 14h3" /></svg></span>
        <span><small>Vencendo em 30 dias</small><strong>{{ lotesVencendo30Dias.length }}</strong><em>{{ lotesVencidos.length }} lote(s) já vencido(s)</em></span>
      </button>
    </div>

    <div class="dashboard-content-grid">
      <article class="dashboard-panel dashboard-panel--fixed dashboard-panel--attention">
        <header class="panel-heading panel-heading--danger">
          <div>
            <span class="panel-icon panel-icon--red">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.8 20h18.4L12 3ZM12 9v5M12 17.5v.5" /></svg>
            </span>
            <h2>Precisa de atenção</h2>
            <span v-if="itensAtencao.length" class="heading-count heading-count--red">{{ itensAtencao.length }}</span>
          </div>
        </header>

        <div v-if="carregando" class="panel-loading">Buscando prioridades...</div>
        <div v-else-if="itensAtencao.length === 0" class="panel-empty">Nenhuma pendência crítica encontrada agora.</div>
        <div v-else class="attention-list panel-scroll">
          <button
            v-for="item in itensAtencao"
            :key="item.id"
            class="attention-item"
            :class="[`attention-item--${item.nivel}`, `attention-item--${item.tipo}`]"
            type="button"
            @click="abrir(item.rota)"
          >
            <span class="attention-icon">
              <svg v-if="item.tipo === 'pedido'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></svg>
              <svg v-else-if="item.tipo === 'estoque'" viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" /></svg>
              <svg v-else-if="item.tipo === 'residuo'" viewBox="0 0 24 24"><path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 17l-5-9V3M8 14h8" /></svg>
              <svg v-else viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
            </span>
            <span class="attention-copy">
              <em>{{ item.categoria }}</em>
              <strong>{{ item.titulo }}</strong>
              <small>{{ item.descricao }}</small>
            </span>
            <span class="attention-side">
              <span>{{ item.detalhe }}</span>
              <svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
            </span>
          </button>
        </div>

        <footer class="panel-hint">Clique em uma pendência para abrir o contexto correspondente.</footer>
      </article>

      <article class="dashboard-panel dashboard-panel--fixed dashboard-panel--history">
        <header class="panel-heading">
          <div>
            <span class="panel-icon panel-icon--blue">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v6h6M12 8v5l3 2" /></svg>
            </span>
            <h2>Últimas movimentações</h2>
          </div>
          <button type="button" @click="abrir('/movimentacoes')">Ver todas</button>
        </header>

        <div v-if="carregando" class="panel-loading">Carregando histórico...</div>
        <div v-else-if="ultimasMovimentacoes.length === 0" class="panel-empty">Nenhuma movimentação registrada.</div>
        <div v-else class="timeline-list panel-scroll">
          <button
            v-for="(movimentacao, index) in ultimasMovimentacoes"
            :key="movimentacao.id"
            class="timeline-item"
            :class="`timeline-item--${movimentoMeta(movimentacao.tipoMovimentacao).classe}`"
            type="button"
            @click="abrirMovimentacao(movimentacao)"
          >
            <time>{{ formatarHora(movimentacao.dataMovimentacao) }}</time>
            <span class="timeline-axis" :class="`timeline-axis--${movimentoMeta(movimentacao.tipoMovimentacao).classe}`">
              <span v-if="index > 0" class="timeline-line timeline-line--top" />
              <span class="timeline-dot" />
              <span v-if="index < ultimasMovimentacoes.length - 1" class="timeline-line timeline-line--bottom" />
            </span>
            <span class="timeline-copy">
              <strong>{{ movimentoMeta(movimentacao.tipoMovimentacao).rotulo }} registrada</strong>
              <small>{{ descricaoMovimentacao(movimentacao) }}</small>
            </span>
            <span class="timeline-status" :class="`timeline-status--${movimentoMeta(movimentacao.tipoMovimentacao).classe}`">
              {{ movimentoMeta(movimentacao.tipoMovimentacao).rotulo }}
            </span>
            <svg class="timeline-chevron" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
          </button>
        </div>

        <button class="panel-footer-link" type="button" @click="abrir('/movimentacoes')">
          Ver todo o histórico <span>→</span>
        </button>
      </article>

      <article class="dashboard-panel dashboard-panel--fixed dashboard-panel--summary">
        <div class="summary-tabs" role="tablist" aria-label="Alternar resumo">
          <button
            type="button"
            role="tab"
            :aria-selected="painelResumo === 'laboratorios'"
            :class="{ 'summary-tab--active': painelResumo === 'laboratorios' }"
            @click="painelResumo = 'laboratorios'"
          >
            <svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v4l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 16l-5-9V3M7.5 14h9" /></svg>
            <span>Resumo por laboratório</span>
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="painelResumo === 'rapido'"
            :class="{ 'summary-tab--active': painelResumo === 'rapido' }"
            @click="painelResumo = 'rapido'"
          >
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
            <span>Resumo rápido</span>
          </button>
        </div>

        <div v-if="painelResumo === 'laboratorios'" class="summary-view">
          <div v-if="carregando" class="panel-loading">Consolidando laboratórios...</div>
          <div v-else-if="!laboratorioAtual" class="panel-empty">Não há laboratórios com dados disponíveis.</div>

          <template v-else>
            <div class="lab-summary-body">
              <article class="lab-card lab-card--single">
                <header>
                  <span class="lab-icon">
                    <svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v4l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 16l-5-9V3M7.5 14h9" /></svg>
                  </span>
                  <span class="lab-title">
                    <small>Laboratório</small>
                    <strong>{{ laboratorioAtual.nome }}</strong>
                  </span>
                </header>

                <div class="lab-metrics">
                  <span><small>Pendências</small><b>{{ laboratorioAtual.pedidosPendentes }}</b></span>
                  <span><small>Urgentes</small><b class="lab-value--red">{{ laboratorioAtual.urgentes }}</b></span>
                  <span><small>Resíduos ativos</small><b class="lab-value--purple">{{ laboratorioAtual.residuosAtivos }}</b></span>
                  <span><small>A analisar</small><b class="lab-value--orange">{{ laboratorioAtual.residuosAnalise }}</b></span>
                </div>

                <div class="lab-total">
                  <span>Total de ocorrências acompanhadas</span>
                  <strong>{{ laboratorioAtual.total }}</strong>
                </div>
              </article>
            </div>

            <div class="lab-navigation">
              <button
                type="button"
                aria-label="Laboratório anterior"
                :disabled="resumoLaboratorios.length <= 1"
                @click="laboratorioAnterior"
              >
                <svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" /></svg>
              </button>

              <span>
                <strong>{{ indiceLaboratorio + 1 }}</strong>
                de {{ resumoLaboratorios.length }}
              </span>

              <button
                type="button"
                aria-label="Próximo laboratório"
                :disabled="resumoLaboratorios.length <= 1"
                @click="proximoLaboratorio"
              >
                <svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
              </button>
            </div>
          </template>
        </div>

        <div v-else class="summary-view summary-view--quick">
          <div class="quick-summary-grid">
            <div class="quick-summary-card quick-summary-card--blue">
              <span class="quick-summary-icon"><svg viewBox="0 0 24 24"><path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z" /></svg></span>
              <span><small>Laboratórios ativos</small><strong>{{ laboratoriosAtivos.length }}</strong></span>
            </div>
            <div class="quick-summary-card quick-summary-card--slate">
              <span class="quick-summary-icon"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3 19c.5-4 2.5-6 6-6s5.5 2 6 6M16 6a3 3 0 0 1 0 6M17 14c2.4.5 3.7 2.2 4 5" /></svg></span>
              <span><small>Usuários ativos</small><strong>{{ usuariosAtivos.length }}</strong></span>
            </div>
            <div class="quick-summary-card quick-summary-card--wide quick-summary-card--pending">
              <span class="quick-summary-icon"><svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="16" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></svg></span>
              <span><small>Pedidos pendentes</small><strong>{{ pedidosPendentes.length }}</strong><em>aguardando andamento da gestão</em></span>
            </div>
            <div class="quick-summary-card quick-summary-card--entry">
              <span class="quick-summary-icon"><svg viewBox="0 0 24 24"><path d="M12 4v12M7 11l5 5 5-5M5 20h14" /></svg></span>
              <span><small>Entradas hoje</small><strong>{{ entradasHoje.length }}</strong></span>
            </div>
            <div class="quick-summary-card quick-summary-card--exit">
              <span class="quick-summary-icon"><svg viewBox="0 0 24 24"><path d="M12 20V8M7 13l5-5 5 5M5 4h14" /></svg></span>
              <span><small>Saídas hoje</small><strong>{{ saidasHoje.length }}</strong></span>
            </div>
          </div>

          <div class="quick-summary-footer">
            <div class="operation-today">
              <span class="operation-today__icon"><svg viewBox="0 0 24 24"><path d="M4 12h4l2-5 4 10 2-5h4" /></svg></span>
              <span>
                <strong>{{ movimentacoesHoje }} movimentação(ões) hoje</strong>
                <small>{{ entradasHoje.length }} entrada(s) · {{ saidasHoje.length }} saída(s)</small>
              </span>
            </div>
            <div class="quick-summary-updated">
              <svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>
              <span v-if="atualizadoEm">Atualizado às {{ formatarHora(atualizadoEm.toISOString()) }}</span>
              <span v-else>Aguardando atualização</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page { width: 100%; max-width: 100%; min-width: 0; display: grid; gap: 18px; overflow-x: hidden; box-sizing: border-box; color: var(--sgl-text); }
.dashboard-heading { min-width: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.dashboard-heading > div { min-width: 0; }
.dashboard-eyebrow { display: block; margin-bottom: 5px; color: var(--sgl-primary); font-size: 10px; font-weight: 800; letter-spacing: .12em; }
.dashboard-heading h1 { margin: 0; color: #111a2f; font-size: clamp(24px, 2.3vw, 31px); line-height: 1.1; }
.dashboard-heading p { margin: 7px 0 0; color: var(--sgl-text-muted); font-size: 13px; }
.dashboard-refresh { min-height: 38px; flex: 0 0 auto; display: inline-flex; align-items: center; gap: 8px; padding: 0 13px; border: 1px solid #b7c7df; border-radius: 7px; background: #fff; color: var(--sgl-primary); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease; }
.dashboard-refresh:hover:not(:disabled) { transform: translateY(-1px); border-color: #7e9bc4; box-shadow: 0 6px 16px rgb(13 43 94 / 10%); }
.dashboard-refresh:disabled { opacity: .55; cursor: wait; }
.dashboard-refresh svg, .dashboard-warning svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.dashboard-warning { min-height: 42px; display: flex; align-items: center; gap: 9px; padding: 9px 12px; border: 1px solid #f4d390; border-radius: 8px; background: #fffbeb; color: #8b5b08; font-size: 12px; }
.dashboard-kpis { min-width: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
.kpi-card { min-width: 0; min-height: 102px; display: grid; grid-template-columns: 46px minmax(0, 1fr); align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--sgl-border); border-radius: 9px; background: var(--sgl-surface); color: var(--sgl-text); text-align: left; font: inherit; cursor: pointer; transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease; }
.kpi-card:hover { transform: translateY(-4px); border-color: #9fb6d8; background: #fbfdff; box-shadow: 0 12px 26px rgb(13 43 94 / 16%); }
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
.dashboard-content-grid { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(330px, .98fr); gap: 14px; align-items: start; }
.dashboard-panel { min-width: 0; display: flex; flex-direction: column; border: 1px solid var(--sgl-border); border-radius: 10px; background: var(--sgl-surface); overflow: hidden; box-shadow: 0 4px 14px rgb(17 26 47 / 3%); }
.dashboard-panel--fixed { height: clamp(390px, 50vh, 470px); max-height: 470px; }
.panel-heading { min-height: 50px; flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 14px; border-bottom: 1px solid #eef2f7; background: linear-gradient(180deg, #fff 0%, #fcfdff 100%); }
.panel-heading > div { display: flex; align-items: center; gap: 8px; min-width: 0; }
.panel-heading h2 { margin: 0; color: var(--sgl-primary); font-size: 13px; }
.panel-heading button { border: 0; background: transparent; color: var(--sgl-primary); font: inherit; font-size: 10px; font-weight: 800; cursor: pointer; }
.panel-heading button:hover { text-decoration: underline; }
.panel-heading--danger h2 { color: #cc2d35; }
.panel-icon { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 7px; }
.panel-icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.panel-icon--blue { background: #edf4ff; color: #1e5bc8; }
.panel-icon--red { background: #fff0f0; color: #df343a; }
.heading-count { min-width: 22px; height: 22px; display: inline-grid; place-items: center; padding: 0 6px; border-radius: 999px; font-size: 9px; font-weight: 900; }
.heading-count--red { background: #fff0f0; color: #d93239; }
.panel-loading, .panel-empty { min-height: 0; flex: 1; display: grid; place-items: center; padding: 24px; color: var(--sgl-text-muted); font-size: 11px; text-align: center; }
.panel-scroll { min-height: 0; flex: 1; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: #c8d3e2 transparent; }
.panel-footer-link { min-height: 42px; flex: 0 0 auto; border: 0; border-top: 1px solid #eef2f7; background: #fff; color: var(--sgl-primary); font: inherit; font-size: 10px; font-weight: 800; cursor: pointer; transition: background 150ms ease; }
.panel-footer-link:hover { background: #f7faff; }
.panel-footer-link span { margin-left: 8px; font-size: 15px; }
.panel-hint { min-height: 38px; flex: 0 0 auto; display: grid; place-items: center; padding: 7px 12px; border-top: 1px solid #eef2f7; background: #fbfcfe; color: #738198; font-size: 9px; text-align: center; }
.attention-list { display: block; padding: 4px 0; }
.attention-item { position: relative; width: 100%; min-height: 72px; display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 9px 12px 9px 14px; border: 1px solid transparent; border-bottom-color: #eef2f7; background: #fff; color: inherit; text-align: left; font: inherit; cursor: pointer; transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease, border-color 180ms ease; }
.attention-item--critico { --attention-accent: #ef3333; }
.attention-item--alto { --attention-accent: #f1841c; }
.attention-item--medio { --attention-accent: #7446df; }
.attention-item::before { content: ''; position: absolute; inset: 8px auto 8px 0; width: 3px; border-radius: 0 4px 4px 0; background: var(--attention-accent, #e6a523); transition: width 180ms ease; }
.attention-item:hover { z-index: 1; transform: translateY(-1px) translateX(2px); border-color: var(--attention-accent, #9fb6d8); box-shadow: 0 8px 18px rgb(13 43 94 / 12%); }
.attention-item:hover::before { width: 5px; }
.attention-item--pedido:hover { background: #fff7f7; }
.attention-item--estoque:hover, .attention-item--lote:hover { background: #fffbf3; }
.attention-item--residuo:hover { background: #faf7ff; }
.attention-icon { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; background: #eef2f7; color: #55627a; }
.attention-icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.attention-item--pedido .attention-icon { background: #fff0f0; color: #e13b3b; }
.attention-item--estoque .attention-icon { background: #fff4e7; color: #ed7b13; }
.attention-item--lote .attention-icon { background: #fff6e7; color: #dc8617; }
.attention-item--residuo .attention-icon { background: #f3efff; color: #7347dd; }
.attention-copy { min-width: 0; display: grid; gap: 2px; }
.attention-copy em { width: fit-content; padding: 2px 5px; border-radius: 4px; background: #fff2f2; color: #dd2d2d; font-size: 8px; font-style: normal; font-weight: 800; }
.attention-item--alto .attention-copy em { background: #fff3e5; color: #d96f0a; }
.attention-item--medio .attention-copy em { background: #f4efff; color: #6942ca; }
.attention-copy strong, .attention-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attention-copy strong { color: #19243a; font-size: 10.5px; }
.attention-copy small { color: var(--sgl-text-muted); font-size: 8.8px; }
.attention-side { min-width: 58px; display: flex; align-items: center; justify-content: flex-end; gap: 4px; color: #6d7789; font-size: 8.5px; font-weight: 800; text-align: right; }
.attention-side svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2; transition: transform 150ms ease; }
.attention-item:hover .attention-side svg { transform: translateX(3px); }
.timeline-list { display: block; padding: 4px 0; }
.timeline-item { width: 100%; min-height: 58px; display: grid; grid-template-columns: 40px 18px minmax(0, 1fr) auto 14px; align-items: stretch; gap: 7px; padding: 0 11px; border: 1px solid transparent; border-bottom-color: #eef2f7; background: #fff; color: inherit; text-align: left; font: inherit; cursor: pointer; transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease, border-color 180ms ease; }
.timeline-item--entrada { --timeline-accent: #2b66d0; }
.timeline-item--saida { --timeline-accent: #e13b3b; }
.timeline-item--ajuste { --timeline-accent: #7446df; }
.timeline-item--devolucao { --timeline-accent: #20a452; }
.timeline-item--descarte { --timeline-accent: #e38a16; }
.timeline-item:hover { z-index: 1; transform: translateY(-1px) translateX(2px); border-color: var(--timeline-accent, #9fb6d8); box-shadow: 0 8px 18px rgb(13 43 94 / 11%); }
.timeline-item--entrada:hover { background: #f3f8ff; }
.timeline-item--saida:hover { background: #fff5f5; }
.timeline-item--ajuste:hover { background: #f9f6ff; }
.timeline-item--devolucao:hover { background: #f4fbf6; }
.timeline-item--descarte:hover { background: #fff8ef; }
.timeline-item time { align-self: center; color: #47566e; font-size: 9px; font-weight: 800; text-align: right; }
.timeline-axis { position: relative; display: grid; place-items: center; color: #2b66d0; }
.timeline-line { position: absolute; left: 50%; width: 1.5px; transform: translateX(-50%); background: #d9e1ec; }
.timeline-line--top { top: 0; bottom: 50%; }
.timeline-line--bottom { top: 50%; bottom: 0; }
.timeline-dot { position: relative; z-index: 2; width: 8px; height: 8px; border: 2px solid currentColor; border-radius: 50%; background: #fff; box-shadow: 0 0 0 2px #fff; transition: transform 150ms ease, background 150ms ease; }
.timeline-item:hover .timeline-dot { transform: scale(1.25); background: currentColor; }
.timeline-axis--entrada { color: #2b66d0; }
.timeline-axis--saida { color: #e13b3b; }
.timeline-axis--ajuste { color: #7446df; }
.timeline-axis--devolucao { color: #20a452; }
.timeline-axis--descarte { color: #e38a16; }
.timeline-copy { min-width: 0; align-self: center; display: grid; gap: 2px; }
.timeline-copy strong, .timeline-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.timeline-copy strong { color: #19243a; font-size: 10px; }
.timeline-copy small { color: var(--sgl-text-muted); font-size: 8.5px; }
.timeline-status { align-self: center; padding: 4px 6px; border-radius: 5px; font-size: 8px; font-weight: 800; white-space: nowrap; }
.timeline-status--entrada { background: #eaf2ff; color: #1c5cc7; }
.timeline-status--saida { background: #fff0f0; color: #d63434; }
.timeline-status--ajuste { background: #f3efff; color: #6942ca; }
.timeline-status--devolucao { background: #ebf8ef; color: #198d45; }
.timeline-status--descarte { background: #fff4e5; color: #cf750c; }
.timeline-chevron { width: 13px; height: 13px; align-self: center; fill: none; stroke: #9aa6b6; stroke-width: 2; transition: transform 150ms ease, stroke 150ms ease; }
.timeline-item:hover .timeline-chevron { transform: translateX(3px); stroke: #315f9f; }
.dashboard-panel--summary { background: #fff; }
.summary-tabs { flex: 0 0 auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; padding: 7px; border-bottom: 1px solid #e8edf4; background: #f7f9fc; }
.summary-tabs button { min-width: 0; min-height: 40px; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 0 10px; border: 1px solid transparent; border-radius: 7px; background: transparent; color: #6a7890; font: inherit; font-size: 9.5px; font-weight: 800; cursor: pointer; transition: background 150ms ease, border-color 150ms ease, color 150ms ease, box-shadow 150ms ease; }
.summary-tabs button:hover { background: #fff; color: #315f9f; }
.summary-tabs button.summary-tab--active { border-color: #d7e1ef; background: #fff; color: #1a4da1; box-shadow: 0 3px 10px rgb(13 43 94 / 7%); }
.summary-tabs svg { width: 16px; height: 16px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.summary-tabs span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.summary-view { min-height: 0; flex: 1; display: flex; flex-direction: column; }
.lab-summary-body { min-height: 0; flex: 1; display: grid; align-items: center; padding: 14px; }
.lab-card { min-width: 0; display: grid; gap: 15px; padding: 16px; border: 1px solid #dfe6ef; border-radius: 11px; background: #fff; box-shadow: 0 6px 18px rgb(13 43 94 / 5%); }
.lab-card--single { width: 100%; }
.lab-card header { min-width: 0; display: flex; align-items: center; gap: 10px; }
.lab-icon { width: 38px; height: 38px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%; background: #f3efff; color: #7044d9; }
.lab-icon svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.lab-title { min-width: 0; display: grid; gap: 3px; }
.lab-title small { color: #8a96a7; font-size: 8px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.lab-title strong { overflow: hidden; color: #17243b; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.lab-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.lab-metrics > span { min-width: 0; display: grid; gap: 5px; padding: 10px; border: 1px solid #e9edf3; border-radius: 8px; background: #f8fafc; }
.lab-metrics small { color: #617086; font-size: 9px; font-weight: 700; }
.lab-metrics b { color: #2d63bf; font-size: 20px; line-height: 1; }
.lab-value--red { color: #e03939 !important; }
.lab-value--purple { color: #7446df !important; }
.lab-value--orange { color: #e48314 !important; }
.lab-total { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 11px; border: 1px solid #e1e8f2; border-radius: 8px; background: #f5f8fc; }
.lab-total span { color: #66758a; font-size: 9px; font-weight: 700; }
.lab-total strong { color: #14294c; font-size: 17px; }
.lab-navigation { min-height: 52px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 8px 12px; border-top: 1px solid #eef2f7; background: #fbfcfe; }
.lab-navigation button { width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid #d5dfec; border-radius: 8px; background: #fff; color: #2456a6; cursor: pointer; transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease; }
.lab-navigation button:hover:not(:disabled) { transform: translateY(-1px); border-color: #9fb4d2; box-shadow: 0 5px 12px rgb(13 43 94 / 9%); }
.lab-navigation button:disabled { opacity: .4; cursor: default; }
.lab-navigation button svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.lab-navigation > span { min-width: 55px; color: #78869a; font-size: 9px; text-align: center; }
.lab-navigation > span strong { color: #243b61; font-size: 11px; }
.summary-view--quick { overflow-y: auto; }
.quick-summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding: 12px; }
.quick-summary-card { min-width: 0; min-height: 68px; display: grid; grid-template-columns: 34px minmax(0, 1fr); align-items: center; gap: 9px; padding: 10px; border: 1px solid #e6ebf2; border-radius: 9px; background: #fbfcfe; }
.quick-summary-card--wide { grid-column: 1 / -1; min-height: 74px; }
.quick-summary-card > span:last-child { min-width: 0; display: grid; gap: 2px; }
.quick-summary-card small { color: #607087; font-size: 9px; font-weight: 700; }
.quick-summary-card strong { color: #17243b; font-size: 20px; line-height: 1; }
.quick-summary-card em { overflow: hidden; color: #8793a5; font-size: 8px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.quick-summary-icon { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 8px; color: #607390; }
.quick-summary-icon svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.quick-summary-card--blue .quick-summary-icon { background: #edf4ff; color: #225ebd; }
.quick-summary-card--slate .quick-summary-icon { background: #eef2f6; color: #52647e; }
.quick-summary-card--pending { border-color: #d9e6fa; background: #f7faff; }
.quick-summary-card--pending .quick-summary-icon { background: #e7f0ff; color: #1e5bc8; }
.quick-summary-card--entry .quick-summary-icon { background: #edf8f1; color: #168847; }
.quick-summary-card--exit .quick-summary-icon { background: #fff0f0; color: #d64040; }
.quick-summary-footer { display: grid; gap: 8px; margin-top: auto; padding: 10px 12px; border-top: 1px solid #eef2f7; background: #f8fafc; }
.operation-today { min-width: 0; display: grid; grid-template-columns: 32px minmax(0, 1fr); align-items: center; gap: 9px; }
.operation-today__icon { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; background: #edf4ff; color: #225ebd; }
.operation-today__icon svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.operation-today > span:last-child { min-width: 0; display: grid; gap: 2px; }
.operation-today strong { color: #24354d; font-size: 10px; }
.operation-today small { color: #7a8798; font-size: 8.5px; }
.quick-summary-updated { display: flex; align-items: center; gap: 6px; color: #8793a5; font-size: 8px; }
.quick-summary-updated svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
@media (max-width: 1280px) { .dashboard-content-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .dashboard-panel--summary { grid-column: 1 / -1; } .dashboard-panel--summary.dashboard-panel--fixed { height: 390px; max-height: 390px; } .lab-summary-body { padding-inline: min(8vw, 72px); } }
@media (max-width: 900px) { .dashboard-heading { flex-direction: column; } .dashboard-refresh { width: 100%; justify-content: center; } .dashboard-content-grid { grid-template-columns: 1fr; } .dashboard-panel--summary { grid-column: auto; } .dashboard-panel--fixed, .dashboard-panel--summary.dashboard-panel--fixed { height: auto; max-height: none; } .panel-scroll { max-height: 350px; } .summary-view { min-height: 330px; } .lab-summary-body { padding-inline: 14px; } }
@media (max-width: 700px) { .attention-item { grid-template-columns: 34px minmax(0, 1fr); } .attention-side { grid-column: 2; justify-content: flex-start; } .timeline-item { grid-template-columns: 38px 16px minmax(0, 1fr) 14px; } .timeline-status { display: none; } .summary-tabs button { font-size: 8.5px; } }
@media (max-width: 480px) { .dashboard-kpis { grid-template-columns: 1fr; } .quick-summary-grid { grid-template-columns: 1fr; } .quick-summary-card--wide { grid-column: auto; } .lab-metrics { grid-template-columns: 1fr; } }
</style>
