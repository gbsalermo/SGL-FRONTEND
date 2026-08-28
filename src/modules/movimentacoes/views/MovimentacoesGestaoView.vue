<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { estoqueService } from '@/modules/estoque/services/estoqueService'
import { movimentacaoService } from '@/modules/movimentacoes/services/movimentacaoService'
import type {
  MovimentacaoEstoqueResponse,
  OrigemMovimentacao,
  TipoMovimentacao,
} from '@/modules/movimentacoes/types/movimentacao'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()

const movimentacoes = ref<MovimentacaoEstoqueResponse[]>([])
const carregando = ref(true)
const erro = ref('')
const busca = ref('')
const filtrosAbertos = ref(false)
const tipo = ref<'TODOS' | TipoMovimentacao>('TODOS')
const origem = ref<'TODAS' | OrigemMovimentacao>('TODAS')
const dataInicio = ref('')
const dataFim = ref('')
const ordem = ref<'RECENTES' | 'ANTIGAS'>('RECENTES')
const expandida = ref<string | null>(null)

const unidadeId = computed(() => session.usuario?.unidadeId)

const tipos: Array<{ valor: TipoMovimentacao; rotulo: string }> = [
  { valor: 'ENTRADA', rotulo: 'Entrada' },
  { valor: 'SAIDA', rotulo: 'Saída' },
  { valor: 'AJUSTE', rotulo: 'Ajuste' },
  { valor: 'DEVOLUCAO', rotulo: 'Devolução' },
  { valor: 'DESCARTE_VENCIMENTO', rotulo: 'Descarte por vencimento' },
]

const origens: Array<{ valor: OrigemMovimentacao; rotulo: string }> = [
  { valor: 'PEDIDO', rotulo: 'Pedido' },
  { valor: 'COMPRA', rotulo: 'Compra' },
  { valor: 'AJUSTE', rotulo: 'Ajuste' },
  { valor: 'DEVOLUCAO', rotulo: 'Devolução' },
  { valor: 'INVENTARIO', rotulo: 'Inventário' },
  { valor: 'DESCARTE', rotulo: 'Descarte' },
]

const resumo = computed(() => ({
  total: movimentacoes.value.length,
  entradas: movimentacoes.value.filter((item) => item.tipoMovimentacao === 'ENTRADA').length,
  saidas: movimentacoes.value.filter((item) => item.tipoMovimentacao === 'SAIDA').length,
  descartes: movimentacoes.value.filter((item) => item.tipoMovimentacao === 'DESCARTE_VENCIMENTO').length,
}))

const movimentacoesFiltradas = computed(() => {
  const termo = busca.value.trim().toLowerCase()

  const filtradas = movimentacoes.value.filter((item) => {
    if (tipo.value !== 'TODOS' && item.tipoMovimentacao !== tipo.value) return false
    if (origem.value !== 'TODAS' && item.origem !== origem.value) return false

    const data = new Date(item.dataMovimentacao)
    if (dataInicio.value && data < new Date(`${dataInicio.value}T00:00:00`)) return false
    if (dataFim.value && data > new Date(`${dataFim.value}T23:59:59`)) return false

    if (!termo) return true

    return [
      item.produtoNome,
      item.codigoInternoLote,
      item.numeroLote,
      item.usuarioNome,
      item.laboratorioNome,
      item.pedidoSolicitanteNome,
      item.observacao,
      rotuloTipo(item.tipoMovimentacao),
      rotuloOrigem(item.origem),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(termo)
  })

  return [...filtradas].sort((a, b) => {
    const comparacao = new Date(a.dataMovimentacao).getTime() - new Date(b.dataMovimentacao).getTime()
    return ordem.value === 'RECENTES' ? -comparacao : comparacao
  })
})

function rotuloTipo(valor: TipoMovimentacao) {
  return tipos.find((item) => item.valor === valor)?.rotulo ?? valor
}

function rotuloOrigem(valor: OrigemMovimentacao) {
  return origens.find((item) => item.valor === valor)?.rotulo ?? valor
}

function classeTipo(valor: TipoMovimentacao) {
  if (valor === 'ENTRADA' || valor === 'DEVOLUCAO') return 'chip chip--positive'
  if (valor === 'DESCARTE_VENCIMENTO') return 'chip chip--danger'
  if (valor === 'AJUSTE') return 'chip chip--warning'
  return 'chip chip--neutral'
}

function sinalQuantidade(valor: TipoMovimentacao) {
  if (valor === 'ENTRADA' || valor === 'DEVOLUCAO') return '+'
  if (valor === 'SAIDA' || valor === 'DESCARTE_VENCIMENTO') return '−'
  return ''
}

function formatarData(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor))
}

function limparFiltros() {
  busca.value = ''
  tipo.value = 'TODOS'
  origem.value = 'TODAS'
  dataInicio.value = ''
  dataFim.value = ''
  ordem.value = 'RECENTES'
}

function alternarDetalhe(id: string) {
  expandida.value = expandida.value === id ? null : id
}

async function carregar() {
  if (!unidadeId.value) {
    erro.value = 'O usuário atual não possui unidade vinculada.'
    carregando.value = false
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    const [movimentacoesData, estoquesDaUnidade] = await Promise.all([
      movimentacaoService.listarTodos(),
      estoqueService.listarPorUnidade(unidadeId.value),
    ])

    const estoquesPermitidos = new Set(estoquesDaUnidade.map((item) => item.id))
    movimentacoes.value = movimentacoesData.filter((item) => estoquesPermitidos.has(item.estoqueCentralId))
  } catch {
    erro.value = 'Não foi possível carregar as movimentações da unidade.'
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <section class="movimentacoes-page">
    <div class="breadcrumb">Operação / Movimentações</div>

    <header class="page-header">
      <div>
        <h1>Movimentações</h1>
        <p>Consulte o histórico de entradas, saídas, ajustes, devoluções e descartes registrados no estoque.</p>
      </div>
      <button class="secondary-action" type="button" @click="carregar">Atualizar</button>
    </header>

    <div class="summary-grid">
      <article><span>Movimentações</span><strong>{{ resumo.total }}</strong><small>Registros da unidade</small></article>
      <article class="positive"><span>Entradas</span><strong>{{ resumo.entradas }}</strong><small>Entradas de lote registradas</small></article>
      <article><span>Saídas</span><strong>{{ resumo.saidas }}</strong><small>Baixas vinculadas ao estoque</small></article>
      <article :class="{ danger: resumo.descartes > 0 }"><span>Descartes</span><strong>{{ resumo.descartes }}</strong><small>Descartes por vencimento</small></article>
    </div>

    <section class="filter-card">
      <div class="filter-top">
        <label class="search-field">
          <span>Buscar</span>
          <input v-model="busca" type="search" placeholder="Produto, lote, usuário, laboratório, solicitante..." />
        </label>
        <button class="filter-toggle" :class="{ active: filtrosAbertos }" type="button" :aria-expanded="filtrosAbertos" title="Filtros avançados" @click="filtrosAbertos = !filtrosAbertos">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l-6.5 7.2v5.1L10.5 19v-6.8L4 5Z" /></svg>
        </button>
      </div>

      <div v-if="filtrosAbertos" class="filter-grid">
        <label><span>Tipo</span><select v-model="tipo"><option value="TODOS">Todos</option><option v-for="item in tipos" :key="item.valor" :value="item.valor">{{ item.rotulo }}</option></select></label>
        <label><span>Origem</span><select v-model="origem"><option value="TODAS">Todas</option><option v-for="item in origens" :key="item.valor" :value="item.valor">{{ item.rotulo }}</option></select></label>
        <label><span>Data inicial</span><input v-model="dataInicio" type="date" /></label>
        <label><span>Data final</span><input v-model="dataFim" type="date" /></label>
        <label><span>Ordenação</span><select v-model="ordem"><option value="RECENTES">Mais recentes primeiro</option><option value="ANTIGAS">Mais antigas primeiro</option></select></label>
      </div>

      <div class="filter-footer">
        <span>{{ movimentacoesFiltradas.length }} registro(s) encontrado(s)</span>
        <button type="button" @click="limparFiltros">Limpar filtros</button>
      </div>
    </section>

    <div v-if="carregando" class="state-box">Carregando movimentações...</div>
    <div v-else-if="erro" class="state-box state-box--error">{{ erro }}</div>
    <div v-else-if="movimentacoesFiltradas.length === 0" class="state-box">Nenhuma movimentação encontrada para os filtros atuais.</div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Produto</th>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Lote</th>
            <th>Origem</th>
            <th>Responsável</th>
            <th>Saldo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in movimentacoesFiltradas" :key="item.id">
            <tr class="movement-row" @click="alternarDetalhe(item.id)">
              <td>{{ formatarData(item.dataMovimentacao) }}</td>
              <td><strong>{{ item.produtoNome }}</strong><small v-if="item.laboratorioNome">{{ item.laboratorioNome }}</small></td>
              <td><span :class="classeTipo(item.tipoMovimentacao)">{{ rotuloTipo(item.tipoMovimentacao) }}</span></td>
              <td><strong class="quantity">{{ sinalQuantidade(item.tipoMovimentacao) }}{{ item.quantidadeMovimentada }}</strong></td>
              <td><strong>{{ item.codigoInternoLote || '—' }}</strong><small v-if="item.numeroLote">Lote {{ item.numeroLote }}</small></td>
              <td>{{ rotuloOrigem(item.origem) }}</td>
              <td>{{ item.usuarioNome }}</td>
              <td><strong>{{ item.quantidadeAnterior }}</strong> → <strong>{{ item.quantidadeAtual }}</strong></td>
              <td><button class="detail-button" type="button" :aria-label="expandida === item.id ? 'Recolher detalhes' : 'Ver detalhes'" @click.stop="alternarDetalhe(item.id)">{{ expandida === item.id ? '⌃' : '⌄' }}</button></td>
            </tr>
            <tr v-if="expandida === item.id" class="detail-row">
              <td colspan="9">
                <div class="detail-grid">
                  <div><span>Laboratório</span><strong>{{ item.laboratorioNome || 'Não vinculado' }}</strong></div>
                  <div><span>Solicitante do pedido</span><strong>{{ item.pedidoSolicitanteNome || 'Não vinculado' }}</strong></div>
                  <div><span>Pedido</span><strong>{{ item.pedidoId || 'Não vinculado' }}</strong></div>
                  <div><span>Lote</span><strong>{{ item.codigoInternoLote || item.numeroLote || 'Não vinculado' }}</strong></div>
                  <div class="detail-grid__wide"><span>Observação</span><strong>{{ item.observacao || 'Sem observação registrada.' }}</strong></div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.movimentacoes-page { max-width: 1540px; margin: 0 auto; }
.breadcrumb { margin-bottom: 10px; color: #64748b; font-size: 12px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.page-header h1 { margin: 0; color: #1a1a2e; font-size: 30px; }
.page-header p { margin: 7px 0 0; color: #64748b; font-size: 14px; }
.secondary-action { min-height: 42px; padding: 0 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #334155; font-size: 13px; font-weight: 700; cursor: pointer; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 22px 0 18px; }
.summary-grid article { padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.summary-grid span { display: block; color: #64748b; font-size: 12px; font-weight: 700; }
.summary-grid strong { display: block; margin-top: 8px; color: #0d2b5e; font-size: 26px; }
.summary-grid small { display: block; margin-top: 3px; color: #94a3b8; font-size: 11px; }
.summary-grid .positive { border-color: #bbf7d0; background: #f8fff9; }
.summary-grid .positive strong { color: #007a3d; }
.summary-grid .danger { border-color: #fecaca; background: #fffafa; }
.summary-grid .danger strong { color: #b42318; }
.filter-card { margin-bottom: 16px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 11px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.filter-top { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 12px; }
.search-field, .filter-grid label { display: flex; min-width: 0; flex-direction: column; gap: 6px; }
.search-field span, .filter-grid span { color: #475569; font-size: 11px; font-weight: 700; }
.search-field input, .filter-grid select, .filter-grid input { width: 100%; min-height: 40px; padding: 0 11px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1a1a2e; outline: none; box-sizing: border-box; }
.filter-toggle { width: 36px; height: 36px; display: inline-grid; place-items: center; align-self: end; margin-bottom: 2px; padding: 0; border: 2px solid #1a1a2e; border-radius: 50%; background: #fff; color: #1a1a2e; cursor: pointer; }
.filter-toggle svg { width: 19px; height: 19px; fill: currentColor; }
.filter-toggle.active { border-color: #1a4da1; background: #1a4da1; color: #fff; }
.filter-grid { display: grid; grid-template-columns: repeat(5, minmax(150px, 1fr)); gap: 12px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #eef2f7; }
.filter-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef2f7; color: #64748b; font-size: 11px; }
.filter-footer button { border: 0; background: transparent; color: #1a4da1; font-weight: 700; cursor: pointer; }
.state-box { padding: 36px 20px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff; color: #64748b; text-align: center; }
.state-box--error { border-color: #fecaca; background: #fffafa; color: #b42318; }
.table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
table { width: 100%; min-width: 1200px; border-collapse: collapse; }
th { padding: 12px 13px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 800; text-align: left; text-transform: uppercase; }
td { padding: 13px; border-bottom: 1px solid #eef2f7; color: #334155; font-size: 12px; vertical-align: middle; }
.movement-row { cursor: pointer; }
.movement-row:hover { background: #f8fbff; }
td strong { color: #1e293b; }
td small { display: block; margin-top: 3px; color: #94a3b8; font-size: 10px; }
.quantity { font-size: 14px; }
.chip { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; font-size: 10px; font-weight: 800; white-space: nowrap; }
.chip--positive { background: #dcfce7; color: #166534; }
.chip--danger { background: #fee2e2; color: #b42318; }
.chip--warning { background: #fef3c7; color: #92400e; }
.chip--neutral { background: #dbeafe; color: #1e40af; }
.detail-button { width: 30px; height: 30px; display: grid; place-items: center; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1a4da1; font-size: 15px; font-weight: 800; cursor: pointer; }
.detail-row td { padding: 0; background: #f8fafc; }
.detail-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; padding: 16px 18px; border-bottom: 1px solid #e2e8f0; }
.detail-grid div { min-width: 0; }
.detail-grid span { display: block; margin-bottom: 4px; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.detail-grid strong { display: block; overflow-wrap: anywhere; color: #334155; font-size: 12px; font-weight: 600; }
.detail-grid__wide { grid-column: 1 / -1; }
@media (max-width: 1100px) { .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 720px) { .page-header { flex-direction: column; } .summary-grid, .filter-grid, .detail-grid { grid-template-columns: 1fr; } .detail-grid__wide { grid-column: auto; } }
</style>
