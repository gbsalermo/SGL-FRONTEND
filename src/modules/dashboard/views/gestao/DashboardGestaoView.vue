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

interface BarraAtividade {
  data: string
  valor: number
  percentual: number
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
const laboratorios = ref<LaboratorioCadastro[]>([])
const usuarios = ref<UsuarioPermissao[]>([])

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
  laboratorios.value.filter((laboratorio) => laboratorio.ativo && (!unidadeId.value || laboratorio.unidadeId === unidadeId.value)),
)

const usuariosAtivos = computed(() =>
  usuarios.value.filter((usuario) => usuario.ativo && (!unidadeId.value || usuario.unidadeId === unidadeId.value)),
)

const pedidosHoje = computed(() =>
  pedidos.value.filter((pedido) => mesmoDia(new Date(pedido.dataSolicitacao), new Date())),
)

const entradasHoje = computed(() =>
  movimentacoes.value.filter((movimentacao) => movimentacao.tipoMovimentacao === 'ENTRADA' && mesmoDia(new Date(movimentacao.dataMovimentacao), new Date())),
)

const saidasHoje = computed(() =>
  movimentacoes.value.filter((movimentacao) => movimentacao.tipoMovimentacao === 'SAIDA' && mesmoDia(new Date(movimentacao.dataMovimentacao), new Date())),
)

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
    .slice(0, 6)
})

const ultimasMovimentacoes = computed(() =>
  [...movimentacoes.value]
    .sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime())
    .slice(0, 7),
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
    .slice(0, 4)
})

const barrasAtividade = computed<BarraAtividade[]>(() => {
  const dias: Array<{ data: Date; chave: string; valor: number }> = []
  for (let deslocamento = 11; deslocamento >= 0; deslocamento -= 1) {
    const data = new Date()
    data.setHours(0, 0, 0, 0)
    data.setDate(data.getDate() - deslocamento)
    dias.push({ data, chave: chaveDia(data), valor: 0 })
  }

  const mapa = new Map(dias.map((dia) => [dia.chave, dia]))
  movimentacoes.value.forEach((movimentacao) => {
    const data = new Date(movimentacao.dataMovimentacao)
    const registro = mapa.get(chaveDia(data))
    if (registro) registro.valor += 1
  })

  const maior = Math.max(...dias.map((dia) => dia.valor), 1)
  return dias.map((dia) => ({
    data: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(dia.data),
    valor: dia.valor,
    percentual: dia.valor === 0 ? 8 : Math.max(15, Math.round((dia.valor / maior) * 100)),
  }))
})

async function carregarDashboard() {
  carregando.value = true
  erro.value = ''

  if (!unidadeId.value) {
    erro.value = 'O usuário de gestão não possui unidade vinculada. Alguns indicadores podem ficar indisponíveis.'
  }

  try {
    const [pedidosResult, estoquesResult, baixosResult, residuosResult, movimentacoesResult, laboratoriosResult, usuariosResult] = await Promise.allSettled([
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

    const falhas = [pedidosResult, estoquesResult, baixosResult, residuosResult, movimentacoesResult, laboratoriosResult, usuariosResult]
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

function abrirMovimentacao(movimentacao: MovimentacaoEstoqueResponse) {
  if (movimentacao.pedidoId) {
    router.push(`/pedidos?pedido=${encodeURIComponent(movimentacao.pedidoId)}`)
    return
  }
  if (movimentacao.estoqueCentralId) {
    const lote = movimentacao.loteId ? `?lote=${encodeURIComponent(movimentacao.loteId)}` : ''
    router.push(`/estoque/${movimentacao.estoqueCentralId}${lote}`)
    return
  }
  router.push(`/movimentacoes?movimentacao=${encodeURIComponent(movimentacao.id)}`)
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

function chaveDia(data: Date) {
  return `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`
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
      <button class="kpi-card kpi-card--amber" type="button" @click="abrir('/estoque')">
        <span class="kpi-icon"><svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 14h3M13 14h3" /></svg></span>
        <span><small>Vencendo em 30 dias</small><strong>{{ lotesVencendo30Dias.length }}</strong><em>{{ lotesVencidos.length }} lote(s) já vencido(s)</em></span>
      </button>
    </div>

    <div class="dashboard-content-grid">
      <article class="dashboard-panel dashboard-panel--attention">
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
        <div v-else class="attention-list">
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
        <footer class="panel-hint">Clique em uma pendência para abrir diretamente o contexto que exige ação.</footer>
      </article>

      <article class="dashboard-panel dashboard-panel--history">
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
        <div v-else class="timeline-list">
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
            <span class="timeline-status" :class="`timeline-status--${movimentoMeta(movimentacao.tipoMovimentacao).classe}`">{{ movimentoMeta(movimentacao.tipoMovimentacao).rotulo }}</span>
            <svg class="timeline-chevron" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
          </button>
        </div>
        <button class="panel-footer-link" type="button" @click="abrir('/movimentacoes')">Ver todo o histórico <span>→</span></button>
      </article>

      <div class="dashboard-right-stack">
        <article class="dashboard-panel dashboard-panel--labs">
          <header class="panel-heading">
            <div>
              <span class="panel-icon panel-icon--purple">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v4l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 16l-5-9V3M7.5 14h9" /></svg>
              </span>
              <h2>Resumo por laboratório</h2>
            </div>
          </header>
          <div v-if="carregando" class="panel-loading panel-loading--compact">Consolidando laboratórios...</div>
          <div v-else-if="resumoLaboratorios.length === 0" class="panel-empty panel-empty--compact">Não há laboratórios com dados disponíveis.</div>
          <div v-else class="labs-grid">
            <article v-for="laboratorio in resumoLaboratorios" :key="laboratorio.id" class="lab-card">
              <header><span class="lab-icon"><svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v4l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 16l-5-9V3M7.5 14h9" /></svg></span><strong>{{ laboratorio.nome }}</strong></header>
              <div class="lab-metrics">
                <span><small>Pendências</small><b>{{ laboratorio.pedidosPendentes }}</b></span>
                <span><small>Urgentes</small><b class="lab-value--red">{{ laboratorio.urgentes }}</b></span>
                <span><small>Resíduos ativos</small><b class="lab-value--purple">{{ laboratorio.residuosAtivos }}</b></span>
                <span><small>A analisar</small><b class="lab-value--orange">{{ laboratorio.residuosAnalise }}</b></span>
              </div>
            </article>
          </div>
        </article>

        <article class="dashboard-panel dashboard-panel--quick-summary">
          <header class="panel-heading">
            <div>
              <span class="panel-icon panel-icon--blue">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
              </span>
              <h2>Resumo rápido</h2>
            </div>
          </header>
          <div class="quick-summary-list">
            <div><span class="quick-summary-icon"><svg viewBox="0 0 24 24"><path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z" /></svg></span><span>Laboratórios ativos</span><strong>{{ laboratoriosAtivos.length }}</strong></div>
            <div><span class="quick-summary-icon"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3 19c.5-4 2.5-6 6-6s5.5 2 6 6M16 6a3 3 0 0 1 0 6M17 14c2.4.5 3.7 2.2 4 5" /></svg></span><span>Usuários ativos</span><strong>{{ usuariosAtivos.length }}</strong></div>
            <div><span class="quick-summary-icon"><svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="16" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></svg></span><span>Pedidos hoje</span><strong>{{ pedidosHoje.length }}</strong></div>
            <div><span class="quick-summary-icon"><svg viewBox="0 0 24 24"><path d="M12 4v12M7 11l5 5 5-5M5 20h14" /></svg></span><span>Entradas hoje</span><strong>{{ entradasHoje.length }}</strong></div>
            <div><span class="quick-summary-icon"><svg viewBox="0 0 24 24"><path d="M12 20V8M7 13l5-5 5 5M5 4h14" /></svg></span><span>Saídas hoje</span><strong>{{ saidasHoje.length }}</strong></div>
          </div>
          <div class="mini-chart" aria-label="Volume de movimentações nos últimos 12 dias">
            <div class="mini-chart-bars">
              <span v-for="barra in barrasAtividade" :key="barra.data" class="mini-chart-column" :title="`${barra.data}: ${barra.valor} movimentação(ões)`">
                <i :style="{ height: `${barra.percentual}%` }" />
              </span>
            </div>
            <div class="quick-summary-updated">
              <svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>
              <span v-if="atualizadoEm">Dados atualizados às {{ formatarHora(atualizadoEm.toISOString()) }}</span>
              <span v-else>Dados aguardando atualização</span>
              <small>atividade dos últimos 12 dias</small>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page { display: grid; gap: 18px; color: var(--sgl-text); }
.dashboard-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.dashboard-eyebrow { display: block; margin-bottom: 5px; color: var(--sgl-primary); font-size: 10px; font-weight: 800; letter-spacing: .12em; }
.dashboard-heading h1 { margin: 0; color: #111a2f; font-size: clamp(24px, 2.3vw, 31px); line-height: 1.1; }
.dashboard-heading p { margin: 7px 0 0; color: var(--sgl-text-muted); font-size: 13px; }
.dashboard-refresh { min-height: 38px; display: inline-flex; align-items: center; gap: 8px; padding: 0 13px; border: 1px solid #b7c7df; border-radius: 7px; background: #fff; color: var(--sgl-primary); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease; }
.dashboard-refresh:hover:not(:disabled) { transform: translateY(-1px); border-color: #7e9bc4; box-shadow: 0 6px 16px rgb(13 43 94 / 10%); }
.dashboard-refresh:disabled { opacity: .55; cursor: wait; }
.dashboard-refresh svg, .dashboard-warning svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.dashboard-warning { min-height: 42px; display: flex; align-items: center; gap: 9px; padding: 9px 12px; border: 1px solid #f4d390; border-radius: 8px; background: #fffbeb; color: #8b5b08; font-size: 12px; }

.dashboard-kpis { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.kpi-card { min-width: 0; min-height: 102px; display: grid; grid-template-columns: 46px 1fr; align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--sgl-border); border-radius: 9px; background: var(--sgl-surface); color: var(--sgl-text); text-align: left; font: inherit; cursor: pointer; transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease; }
.kpi-card:hover { transform: translateY(-4px) scale(1.015); border-color: #9fb6d8; background: #fbfdff; box-shadow: 0 12px 26px rgb(13 43 94 / 16%); }
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

.dashboard-content-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(350px, 1.12fr); gap: 14px; align-items: stretch; }
.dashboard-right-stack { min-width: 0; display: grid; grid-template-rows: auto auto; gap: 14px; align-content: start; }
.dashboard-panel { min-width: 0; display: flex; flex-direction: column; border: 1px solid var(--sgl-border); border-radius: 10px; background: var(--sgl-surface); overflow: hidden; box-shadow: 0 4px 14px rgb(17 26 47 / 3%); }
.panel-heading { min-height: 50px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 14px; border-bottom: 1px solid #eef2f7; background: linear-gradient(180deg, #fff 0%, #fcfdff 100%); }
.panel-heading > div { display: flex; align-items: center; gap: 8px; min-width: 0; }
.panel-heading h2 { margin: 0; color: var(--sgl-primary); font-size: 13px; }
.panel-heading button { border: 0; background: transparent; color: var(--sgl-primary); font: inherit; font-size: 10px; font-weight: 800; cursor: pointer; }
.panel-heading button:hover { text-decoration: underline; }
.panel-heading--danger h2 { color: #cc2d35; }
.panel-icon { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 7px; }
.panel-icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.panel-icon--blue { background: #edf4ff; color: #1e5bc8; }
.panel-icon--red { background: #fff0f0; color: #df343a; }
.panel-icon--purple { background: #f3efff; color: #7044d9; }
.heading-count { min-width: 22px; height: 22px; display: inline-grid; place-items: center; padding: 0 6px; border-radius: 999px; font-size: 9px; font-weight: 900; }
.heading-count--red { background: #fff0f0; color: #d93239; }
.panel-loading, .panel-empty { min-height: 260px; display: grid; place-items: center; padding: 24px; color: var(--sgl-text-muted); font-size: 11px; text-align: center; }
.panel-loading--compact, .panel-empty--compact { min-height: 145px; }
.panel-footer-link { min-height: 42px; margin-top: auto; border: 0; border-top: 1px solid #eef2f7; background: #fff; color: var(--sgl-primary); font: inherit; font-size: 10px; font-weight: 800; cursor: pointer; transition: background 150ms ease; }
.panel-footer-link:hover { background: #f7faff; }
.panel-footer-link span { margin-left: 8px; font-size: 15px; }
.panel-hint { min-height: 42px; display: grid; place-items: center; margin-top: auto; padding: 8px 12px; border-top: 1px solid #eef2f7; background: #fbfcfe; color: #738198; font-size: 9px; text-align: center; }

.attention-list { display: grid; padding: 4px 0; }
.attention-item { position: relative; min-height: 74px; display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 9px 12px 9px 14px; border: 0; border-bottom: 1px solid #eef2f7; background: #fff; color: inherit; text-align: left; font: inherit; cursor: pointer; transition: transform 150ms ease, background 150ms ease, box-shadow 150ms ease; }
.attention-item::before { content: ''; position: absolute; inset: 8px auto 8px 0; width: 3px; border-radius: 0 4px 4px 0; background: #e6a523; transition: width 150ms ease; }
.attention-item--critico::before { background: #ef3333; }
.attention-item--alto::before { background: #f1841c; }
.attention-item--medio::before { background: #7446df; }
.attention-item:hover { z-index: 1; transform: translateX(3px); background: #fbfdff; box-shadow: 0 7px 18px rgb(13 43 94 / 9%); }
.attention-item:hover::before { width: 5px; }
.attention-item--pedido:hover { background: #fff9f9; }
.attention-item--estoque:hover, .attention-item--lote:hover { background: #fffcf7; }
.attention-item--residuo:hover { background: #fbf9ff; }
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
.attention-item:hover .attention-side svg { transform: translateX(2px); }

.timeline-list { display: grid; padding: 4px 0; }
.timeline-item { min-height: 58px; display: grid; grid-template-columns: 40px 18px minmax(0, 1fr) auto 14px; align-items: stretch; gap: 7px; padding: 0 11px; border: 0; background: #fff; color: inherit; text-align: left; font: inherit; cursor: pointer; transition: transform 150ms ease, background 150ms ease, box-shadow 150ms ease; }
.timeline-item:hover { z-index: 1; transform: translateX(2px); background: #f9fbff; box-shadow: 0 7px 18px rgb(13 43 94 / 8%); }
.timeline-item--entrada:hover { background: #f6faff; }
.timeline-item--saida:hover { background: #fff8f8; }
.timeline-item--ajuste:hover { background: #fbf9ff; }
.timeline-item--devolucao:hover { background: #f7fcf8; }
.timeline-item--descarte:hover { background: #fffaf3; }
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
.timeline-item:hover .timeline-chevron { transform: translateX(2px); stroke: #315f9f; }

.labs-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; padding: 11px; }
.lab-card { min-width: 0; min-height: 126px; display: grid; gap: 9px; padding: 11px; border: 1px solid #e5eaf1; border-radius: 9px; background: #fff; transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease; }
.lab-card:hover { transform: translateY(-2px); border-color: #b8cae4; box-shadow: 0 7px 18px rgb(13 43 94 / 8%); }
.lab-card header { min-width: 0; display: flex; align-items: center; gap: 7px; }
.lab-icon { width: 26px; height: 26px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%; background: #f3efff; color: #7044d9; }
.lab-icon svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.lab-card header strong { overflow: hidden; color: #19243a; font-size: 9.5px; text-overflow: ellipsis; white-space: nowrap; }
.lab-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.lab-metrics > span { min-width: 0; display: grid; gap: 3px; padding: 5px 7px; border-right: 1px solid #edf1f6; border-bottom: 1px solid #edf1f6; }
.lab-metrics > span:nth-child(2n) { border-right: 0; }
.lab-metrics > span:nth-last-child(-n+2) { border-bottom: 0; }
.lab-metrics small { color: #728096; font-size: 7.8px; }
.lab-metrics b { color: #2d63bf; font-size: 13px; }
.lab-value--red { color: #e03939 !important; }
.lab-value--purple { color: #7446df !important; }
.lab-value--orange { color: #e48314 !important; }

.quick-summary-list { display: grid; padding: 6px 12px 2px; }
.quick-summary-list > div { min-height: 35px; display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; align-items: center; gap: 7px; border-bottom: 1px solid #eef2f7; color: #536176; font-size: 9px; }
.quick-summary-list > div:last-child { border-bottom: 0; }
.quick-summary-list strong { color: #1d2a42; font-size: 10px; }
.quick-summary-icon { width: 22px; height: 22px; display: grid; place-items: center; color: #607390; }
.quick-summary-icon svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.mini-chart { padding: 9px 12px 11px; border-top: 1px solid #eef2f7; background: #fbfcfe; }
.mini-chart-bars { height: 35px; display: flex; align-items: flex-end; gap: 4px; padding: 0 2px; }
.mini-chart-column { flex: 1; height: 100%; display: flex; align-items: flex-end; justify-content: center; }
.mini-chart-column i { width: 100%; max-width: 8px; min-height: 3px; border-radius: 2px 2px 0 0; background: linear-gradient(180deg, #3c7de5 0%, #8bb5f4 100%); opacity: .9; transition: height 180ms ease, opacity 150ms ease, transform 150ms ease; }
.mini-chart-column:hover i { opacity: 1; transform: scaleX(1.2); }
.quick-summary-updated { display: grid; grid-template-columns: 15px minmax(0, 1fr) auto; align-items: center; gap: 5px; margin-top: 7px; color: #7c899b; font-size: 8px; }
.quick-summary-updated svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.quick-summary-updated small { color: #9aa5b4; font-size: 7px; }

@media (max-width: 1260px) {
  .dashboard-kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .dashboard-content-grid { grid-template-columns: 1fr 1fr; }
  .dashboard-right-stack { grid-column: 1 / -1; grid-template-columns: 1.35fr .65fr; grid-template-rows: none; }
}

@media (max-width: 900px) {
  .dashboard-heading { flex-direction: column; }
  .dashboard-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dashboard-content-grid { grid-template-columns: 1fr; }
  .dashboard-right-stack { grid-column: auto; grid-template-columns: 1fr; }
}

@media (max-width: 620px) {
  .dashboard-kpis { grid-template-columns: 1fr; }
  .labs-grid { grid-template-columns: 1fr; }
  .attention-item { grid-template-columns: 34px minmax(0, 1fr); }
  .attention-side { grid-column: 2; justify-content: flex-start; }
  .timeline-item { grid-template-columns: 38px 16px minmax(0, 1fr) 14px; }
  .timeline-status { display: none; }
  .quick-summary-updated { grid-template-columns: 15px 1fr; }
  .quick-summary-updated small { display: none; }
}
</style>
