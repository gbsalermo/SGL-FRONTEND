<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { pedidoService } from '@/modules/pedidos/services/pedidoService'
import type { MovimentacaoPedidoResponse, PedidoResponse, StatusPedido } from '@/modules/pedidos/types/pedido'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const pedidos = ref<PedidoResponse[]>([])
const movimentacoesPorPedido = ref<Record<string, MovimentacaoPedidoResponse[]>>({})
const carregandoMovimentacoes = ref<Record<string, boolean>>({})
const carregando = ref(true)
const erro = ref('')
const busca = ref('')
const filtrosAbertos = ref(false)
const status = ref<StatusPedido | 'TODOS'>('TODOS')
const urgencia = ref<'TODOS' | 'URGENTE' | 'NORMAL'>('TODOS')
const laboratorio = ref('TODOS')
const dataInicio = ref('')
const dataFim = ref('')
const ordenarPor = ref<'DATA' | 'LABORATORIO' | 'PROJETO' | 'STATUS' | 'PRODUTO' | 'URGENCIA'>('DATA')
const direcao = ref<'ASC' | 'DESC'>('DESC')
const pedidoExpandido = ref<string | null>(null)

const quantidadesAprovadas = ref<Record<string, number>>({})
const observacaoAprovacao = ref('')
const acaoJustificada = ref<'REJEITAR' | 'CANCELAR' | null>(null)
const justificativa = ref('')
const executandoAcao = ref(false)
const erroAcao = ref('')
const sucessoAcao = ref('')

const statusOptions: Array<{ label: string; value: StatusPedido | 'TODOS' }> = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Pendentes', value: 'PENDENTE' },
  { label: 'Aprovados', value: 'APROVADO' },
  { label: 'Rejeitados', value: 'REJEITADO' },
  { label: 'Entregues', value: 'ENTREGUE' },
  { label: 'Cancelados', value: 'CANCELADO' },
]

const laboratorios = computed(() => [...new Set(pedidos.value.map((pedido) => pedido.laboratorioNome))].sort((a, b) => a.localeCompare(b, 'pt-BR')))
const totais = computed(() => ({
  pendentes: pedidos.value.filter((pedido) => pedido.status === 'PENDENTE').length,
  urgentes: pedidos.value.filter((pedido) => pedido.urgente).length,
  aprovados: pedidos.value.filter((pedido) => pedido.status === 'APROVADO').length,
  entregues: pedidos.value.filter((pedido) => pedido.status === 'ENTREGUE').length,
}))

function valorOrdenacao(pedido: PedidoResponse) {
  if (ordenarPor.value === 'LABORATORIO') return pedido.laboratorioNome
  if (ordenarPor.value === 'PROJETO') return pedido.projetoNome ?? ''
  if (ordenarPor.value === 'STATUS') return pedido.status
  if (ordenarPor.value === 'PRODUTO') return pedido.itens.map((item) => item.produtoNome).sort().join(' ')
  if (ordenarPor.value === 'URGENCIA') return pedido.urgente ? 1 : 0
  return new Date(pedido.dataSolicitacao).getTime()
}

const pedidosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  const inicio = dataInicio.value ? new Date(`${dataInicio.value}T00:00:00`).getTime() : null
  const fim = dataFim.value ? new Date(`${dataFim.value}T23:59:59.999`).getTime() : null

  const filtrados = pedidos.value.filter((pedido) => {
    if (status.value !== 'TODOS' && pedido.status !== status.value) return false
    if (urgencia.value === 'URGENTE' && !pedido.urgente) return false
    if (urgencia.value === 'NORMAL' && pedido.urgente) return false
    if (laboratorio.value !== 'TODOS' && pedido.laboratorioNome !== laboratorio.value) return false
    const dataPedido = new Date(pedido.dataSolicitacao).getTime()
    if (inicio !== null && dataPedido < inicio) return false
    if (fim !== null && dataPedido > fim) return false
    if (!termo) return true

    return [pedido.usuarioNome, pedido.laboratorioNome, pedido.projetoNome, pedido.status, pedido.urgente ? 'urgente' : 'normal', pedido.observacao, pedido.motivoUrgencia, ...pedido.itens.map((item) => item.produtoNome)]
      .filter(Boolean).join(' ').toLowerCase().includes(termo)
  })

  return [...filtrados].sort((a, b) => {
    const valorA = valorOrdenacao(a)
    const valorB = valorOrdenacao(b)
    const comparacao = typeof valorA === 'number' && typeof valorB === 'number'
      ? valorA - valorB
      : String(valorA).localeCompare(String(valorB), 'pt-BR', { sensitivity: 'base' })
    return direcao.value === 'ASC' ? comparacao : -comparacao
  })
})

function dataFormatada(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(data))
}

function produtosResumo(pedido: PedidoResponse) {
  const nomes = pedido.itens.map((item) => item.produtoNome)
  if (nomes.length <= 2) return nomes.join(', ')
  return `${nomes.slice(0, 2).join(', ')} +${nomes.length - 2}`
}

function formaSolicitada(item: PedidoResponse['itens'][number]) {
  const rotulos: Record<string, [string, string]> = {
    UNITARIO: ['unidade', 'unidades'], KIT: ['kit', 'kits'], CAIXA: ['caixa', 'caixas'], GARRAFA: ['garrafa', 'garrafas'], GALAO: ['galão', 'galões'],
  }
  const quantidade = item.quantidadeEmbalagensSolicitada ?? item.quantidadeSolicitada
  const [singular, plural] = rotulos[item.tipoEmbalagemSolicitada] ?? ['unidade', 'unidades']
  const nome = quantidade === 1 ? singular : plural
  if (item.tipoEmbalagemSolicitada === 'UNITARIO') return `${quantidade} ${nome}`
  return `${quantidade} ${nome} · ${item.multiplicadorSolicitado} unit. cada`
}

function movimentosDoItem(pedidoId: string, produtoId: string) {
  return (movimentacoesPorPedido.value[pedidoId] ?? []).filter((mov) => mov.produtoId === produtoId)
}

async function carregarMovimentacoesPedido(pedido: PedidoResponse) {
  if (!['APROVADO', 'ENTREGUE'].includes(pedido.status) || movimentacoesPorPedido.value[pedido.id]) return
  carregandoMovimentacoes.value[pedido.id] = true
  try {
    movimentacoesPorPedido.value[pedido.id] = await pedidoService.listarMovimentacoesPorPedido(pedido.id)
  } catch {
    movimentacoesPorPedido.value[pedido.id] = []
  } finally {
    carregandoMovimentacoes.value[pedido.id] = false
  }
}

function limparAcao() {
  acaoJustificada.value = null
  justificativa.value = ''
  observacaoAprovacao.value = ''
  erroAcao.value = ''
  sucessoAcao.value = ''
}

function prepararPedido(pedido: PedidoResponse) {
  quantidadesAprovadas.value = Object.fromEntries(pedido.itens.map((item) => [item.id, item.quantidadeAprovada ?? item.quantidadeSolicitada]))
  limparAcao()
}

async function alternarDetalhe(pedido: PedidoResponse) {
  if (pedidoExpandido.value === pedido.id) {
    pedidoExpandido.value = null
    limparAcao()
    return
  }
  pedidoExpandido.value = pedido.id
  prepararPedido(pedido)
  await carregarMovimentacoesPedido(pedido)
}

function mensagemErro(error: unknown) {
  const apiError = error as { response?: { data?: { message?: string } } }
  return apiError.response?.data?.message ?? 'Não foi possível concluir a operação.'
}

function atualizarPedido(atualizado: PedidoResponse) {
  const indice = pedidos.value.findIndex((pedido) => pedido.id === atualizado.id)
  if (indice >= 0) pedidos.value[indice] = atualizado
  prepararPedido(atualizado)
  sucessoAcao.value = 'Operação concluída com sucesso.'
  void carregarMovimentacoesPedido(atualizado)
}

async function aprovar(pedido: PedidoResponse) {
  erroAcao.value = ''
  sucessoAcao.value = ''
  const aprovadorId = session.usuario?.id
  if (!aprovadorId) return void (erroAcao.value = 'Usuário aprovador não identificado na sessão.')

  const itens = pedido.itens.map((item) => ({ itemId: item.id, quantidadeAprovada: Number(quantidadesAprovadas.value[item.id]) }))
  const invalido = itens.some((aprovacao, index) => {
    const item = pedido.itens[index]!
    if (!Number.isInteger(aprovacao.quantidadeAprovada) || aprovacao.quantidadeAprovada < 1 || aprovacao.quantidadeAprovada > item.quantidadeSolicitada) return true
    return item.tipoEmbalagemSolicitada !== 'UNITARIO' && aprovacao.quantidadeAprovada % item.multiplicadorSolicitado !== 0
  })

  if (invalido) {
    erroAcao.value = 'As quantidades aprovadas devem respeitar a quantidade solicitada e a embalagem escolhida pelo solicitante.'
    return
  }

  if (!window.confirm('Confirma a aprovação deste pedido com as quantidades informadas?')) return
  executandoAcao.value = true
  try {
    atualizarPedido(await pedidoService.aprovar(pedido.id, {
      usuarioAprovadorId: aprovadorId,
      observacao: observacaoAprovacao.value.trim() || null,
      itens,
    }))
  } catch (error) {
    erroAcao.value = mensagemErro(error)
  } finally {
    executandoAcao.value = false
  }
}

async function confirmarAcaoJustificada(pedido: PedidoResponse) {
  erroAcao.value = ''
  sucessoAcao.value = ''
  const motivo = justificativa.value.trim()
  if (!motivo) return void (erroAcao.value = acaoJustificada.value === 'REJEITAR' ? 'Informe o motivo da rejeição.' : 'Informe o motivo do cancelamento.')
  const descricao = acaoJustificada.value === 'REJEITAR' ? 'rejeição' : 'cancelamento'
  if (!window.confirm(`Confirma o ${descricao} deste pedido?`)) return

  executandoAcao.value = true
  try {
    const atualizado = acaoJustificada.value === 'REJEITAR'
      ? await pedidoService.rejeitar(pedido.id, motivo)
      : await pedidoService.cancelar(pedido.id, motivo)
    atualizarPedido(atualizado)
    acaoJustificada.value = null
    justificativa.value = ''
  } catch (error) {
    erroAcao.value = mensagemErro(error)
  } finally {
    executandoAcao.value = false
  }
}

async function entregar(pedido: PedidoResponse) {
  erroAcao.value = ''
  sucessoAcao.value = ''
  if (!window.confirm('Confirma que os materiais deste pedido foram entregues?')) return
  executandoAcao.value = true
  try {
    atualizarPedido(await pedidoService.entregar(pedido.id))
  } catch (error) {
    erroAcao.value = mensagemErro(error)
  } finally {
    executandoAcao.value = false
  }
}

function limparFiltros() {
  busca.value = ''; status.value = 'TODOS'; urgencia.value = 'TODOS'; laboratorio.value = 'TODOS'; dataInicio.value = ''; dataFim.value = ''; ordenarPor.value = 'DATA'; direcao.value = 'DESC'
  if (route.query.status || route.query.urgencia) router.replace({ path: '/pedidos' })
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    pedidos.value = await pedidoService.listarTodos()
  } catch {
    erro.value = 'Não foi possível carregar os pedidos. Verifique a conexão com a API.'
  } finally {
    carregando.value = false
  }
}

watch(() => route.query.status, (valor) => {
  const statusRota = typeof valor === 'string' ? valor.toUpperCase() : ''
  const validos: StatusPedido[] = ['PENDENTE', 'APROVADO', 'REJEITADO', 'ENTREGUE', 'CANCELADO']
  status.value = validos.includes(statusRota as StatusPedido) ? statusRota as StatusPedido : 'TODOS'
  if (status.value !== 'TODOS') filtrosAbertos.value = true
}, { immediate: true })

watch(() => route.query.urgencia, (valor) => {
  const urgenciaRota = typeof valor === 'string' ? valor.toUpperCase() : ''
  urgencia.value = urgenciaRota === 'URGENTE' || urgenciaRota === 'NORMAL' ? urgenciaRota : 'TODOS'
  if (urgencia.value !== 'TODOS') filtrosAbertos.value = true
}, { immediate: true })

onMounted(carregar)
</script>

<template>
  <section class="gestao-pedidos">
    <div class="gestao-pedidos__breadcrumb">Operação / Pedidos</div>
    <header class="gestao-pedidos__header">
      <div><h1>Pedidos</h1><p>Acompanhe, filtre, organize e gerencie todos os pedidos do sistema.</p></div>
      <div class="gestao-pedidos__header-actions"><button class="secondary-action" type="button" @click="carregar">Atualizar</button></div>
    </header>

    <div class="gestao-summary">
      <article><span>Pendentes</span><strong>{{ totais.pendentes }}</strong><small>Aguardando análise</small></article>
      <article :class="{ 'gestao-summary__urgent': totais.urgentes > 0 }"><span>Urgentes</span><strong>{{ totais.urgentes }}</strong><small>Marcação informativa</small></article>
      <article><span>Aprovados</span><strong>{{ totais.aprovados }}</strong><small>Aguardando entrega</small></article>
      <article><span>Entregues</span><strong>{{ totais.entregues }}</strong><small>Concluídos</small></article>
    </div>

    <section class="gestao-filter-card" aria-label="Busca, filtros e ordenação">
      <div class="gestao-filter-top">
        <label class="gestao-search"><span>Buscar</span><input v-model="busca" type="search" placeholder="Produto, solicitante, laboratório, projeto, urgência..." /></label>
        <button class="filter-toggle" type="button" :aria-expanded="filtrosAbertos" @click="filtrosAbertos = !filtrosAbertos"><span>Filtros</span><strong>{{ filtrosAbertos ? '⌃' : '⌄' }}</strong></button>
      </div>
      <div v-if="filtrosAbertos" class="gestao-filter-grid gestao-filter-grid--advanced">
        <label><span>Status</span><select v-model="status"><option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></label>
        <label><span>Urgência</span><select v-model="urgencia"><option value="TODOS">Todos</option><option value="URGENTE">Somente urgentes</option><option value="NORMAL">Somente normais</option></select></label>
        <label><span>Laboratório</span><select v-model="laboratorio"><option value="TODOS">Todos os laboratórios</option><option v-for="nome in laboratorios" :key="nome" :value="nome">{{ nome }}</option></select></label>
        <label><span>Data inicial</span><input v-model="dataInicio" type="date" /></label>
        <label><span>Data final</span><input v-model="dataFim" type="date" /></label>
        <label><span>Organizar por</span><select v-model="ordenarPor"><option value="DATA">Data</option><option value="LABORATORIO">Laboratório</option><option value="PROJETO">Projeto</option><option value="STATUS">Status</option><option value="PRODUTO">Produto</option><option value="URGENCIA">Urgência</option></select></label>
        <label><span>Ordem</span><select v-model="direcao"><option value="DESC">Decrescente</option><option value="ASC">Crescente</option></select></label>
      </div>
      <div class="gestao-filter-footer"><span>{{ pedidosFiltrados.length }} pedido(s) encontrado(s)</span><button type="button" @click="limparFiltros">Limpar filtros</button></div>
    </section>

    <div v-if="carregando" class="gestao-state">Carregando pedidos...</div>
    <div v-else-if="erro" class="gestao-state gestao-state--error">{{ erro }}</div>
    <div v-else-if="pedidosFiltrados.length === 0" class="gestao-state">Nenhum pedido encontrado para os filtros atuais.</div>

    <div v-else class="gestao-table-wrap">
      <table class="gestao-table">
        <thead><tr><th>Data</th><th>Solicitante / Projeto</th><th>Produtos</th><th>Laboratório</th><th>Status</th><th>Urgência</th><th></th></tr></thead>
        <tbody>
          <template v-for="pedido in pedidosFiltrados" :key="pedido.id">
            <tr>
              <td>{{ dataFormatada(pedido.dataSolicitacao) }}</td>
              <td><strong>{{ pedido.usuarioNome }}</strong><small>{{ pedido.projetoNome ?? 'Sem projeto' }}</small></td>
              <td><strong>{{ produtosResumo(pedido) }}</strong><small>{{ pedido.itens.length }} {{ pedido.itens.length === 1 ? 'item' : 'itens' }}</small></td>
              <td>{{ pedido.laboratorioNome }}</td>
              <td><span class="status-chip" :data-status="pedido.status">{{ pedido.status }}</span></td>
              <td><span v-if="pedido.urgente" class="urgent-chip">URGENTE</span><span v-else class="neutral-copy">Normal</span></td>
              <td><button class="detail-button" type="button" @click="alternarDetalhe(pedido)">{{ pedidoExpandido === pedido.id ? '⌃' : '⌄' }}</button></td>
            </tr>

            <tr v-if="pedidoExpandido === pedido.id" class="gestao-detail-row">
              <td colspan="7">
                <div class="gestao-detail">
                  <div class="gestao-detail__items">
                    <h3>Materiais solicitados</h3>
                    <div v-for="item in pedido.itens" :key="item.id" class="gestao-detail__item">
                      <div><strong>{{ item.produtoNome }}</strong><small>{{ item.produtoUnidadeArmazenamento }}</small><small class="requested-form">Solicitado como: {{ formaSolicitada(item) }}</small></div>
                      <div class="quantity-card requested-quantity"><strong>QUANT. SOLICITADA</strong><span>{{ item.quantidadeSolicitada }}</span></div>

                      <label v-if="pedido.status === 'PENDENTE'" class="quantity-card approval-quantity">
                        <span>QUANTIDADE A APROVAR</span>
                        <input v-model.number="quantidadesAprovadas[item.id]" type="number" min="1" :max="item.quantidadeSolicitada" :step="item.tipoEmbalagemSolicitada === 'UNITARIO' ? 1 : item.multiplicadorSolicitado" />
                      </label>
                      <div v-else-if="item.quantidadeAprovada !== null" class="quantity-card approved-quantity"><strong>QUANTIDADE APROVADA</strong><span>{{ item.quantidadeAprovada }}</span></div>

                      <div v-if="pedido.status === 'ENTREGUE'" class="delivered-lots">
                        <strong>LOTES UTILIZADOS NA SAÍDA</strong>
                        <span v-if="carregandoMovimentacoes[pedido.id]">Carregando lotes...</span>
                        <span v-else-if="movimentosDoItem(pedido.id, item.produtoId).length === 0">Nenhuma movimentação de saída encontrada.</span>
                        <div v-for="mov in movimentosDoItem(pedido.id, item.produtoId)" :key="mov.id" class="delivered-lot">
                          <b>{{ mov.codigoInternoLote || 'Lote sem código SGL' }}</b>
                          <span>{{ mov.quantidadeMovimentada }} unit. · saída em {{ dataFormatada(mov.dataMovimentacao) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="gestao-detail__context">
                    <h3>Contexto</h3>
                    <p><span>Status</span><strong>{{ pedido.status }}</strong></p><p><span>Projeto</span><strong>{{ pedido.projetoNome ?? 'Sem projeto' }}</strong></p><p><span>Laboratório</span><strong>{{ pedido.laboratorioNome }}</strong></p><p><span>Solicitante</span><strong>{{ pedido.usuarioNome }}</strong></p><p><span>Urgência</span><strong>{{ pedido.urgente ? 'Pedido urgente' : 'Normal' }}</strong></p>
                  </div>

                  <div v-if="pedido.observacao || pedido.motivoUrgencia" class="gestao-detail__note"><h3>Observação / descrição</h3><p>{{ pedido.observacao || pedido.motivoUrgencia }}</p><p v-if="pedido.observacao && pedido.motivoUrgencia && pedido.motivoUrgencia !== pedido.observacao">{{ pedido.motivoUrgencia }}</p></div>

                  <section v-if="pedido.status === 'PENDENTE' || pedido.status === 'APROVADO'" class="gestao-actions-panel">
                    <div class="gestao-actions-panel__heading"><div><h3>Ações do pedido</h3><p>Confira os dados acima antes de alterar o andamento.</p></div><span class="status-chip" :data-status="pedido.status">{{ pedido.status }}</span></div>
                    <label v-if="pedido.status === 'PENDENTE'" class="action-observation"><span>Observação da aprovação (opcional)</span><textarea v-model="observacaoAprovacao" rows="2" placeholder="Ex.: aprovado para atendimento parcial..." /></label>
                    <div class="gestao-actions-buttons">
                      <button v-if="pedido.status === 'PENDENTE'" class="action-button action-button--approve" type="button" :disabled="executandoAcao" @click="aprovar(pedido)">Aprovar pedido</button>
                      <button v-if="pedido.status === 'PENDENTE'" class="action-button action-button--reject" type="button" :disabled="executandoAcao" @click="acaoJustificada = 'REJEITAR'; justificativa = ''; erroAcao = ''; sucessoAcao = ''">Rejeitar</button>
                      <button v-if="pedido.status === 'APROVADO'" class="action-button action-button--deliver" type="button" :disabled="executandoAcao" @click="entregar(pedido)">Registrar entrega</button>
                      <button class="action-button action-button--cancel" type="button" :disabled="executandoAcao" @click="acaoJustificada = 'CANCELAR'; justificativa = ''; erroAcao = ''; sucessoAcao = ''">Cancelar pedido</button>
                    </div>
                    <div v-if="acaoJustificada" class="justification-box"><label><span>{{ acaoJustificada === 'REJEITAR' ? 'Motivo da rejeição' : 'Motivo do cancelamento' }}</span><textarea v-model="justificativa" rows="3" /></label><div><button type="button" @click="acaoJustificada = null; justificativa = ''">Voltar</button><button class="confirm-danger" type="button" @click="confirmarAcaoJustificada(pedido)">Confirmar {{ acaoJustificada === 'REJEITAR' ? 'rejeição' : 'cancelamento' }}</button></div></div>
                    <p v-if="erroAcao" class="operation-message operation-message--error">{{ erroAcao }}</p><p v-if="sucessoAcao" class="operation-message operation-message--success">{{ sucessoAcao }}</p>
                  </section>
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
.gestao-pedidos { max-width: 1540px; margin: 0 auto; }
.gestao-pedidos__breadcrumb { margin-bottom: 10px; color: #64748b; font-size: 12px; }
.gestao-pedidos__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.gestao-pedidos__header h1 { margin: 0; color: #1a1a2e; font-size: 30px; }
.gestao-pedidos__header p { margin: 7px 0 0; color: #64748b; font-size: 14px; }
.gestao-pedidos__header-actions { display: flex; gap: 9px; }
.secondary-action { min-height: 42px; padding: 0 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #334155; font-size: 13px; font-weight: 700; cursor: pointer; }
.gestao-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 22px 0 18px; }
.gestao-summary article { padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.gestao-summary span { display: block; color: #64748b; font-size: 12px; font-weight: 700; }
.gestao-summary strong { display: block; margin-top: 8px; color: #0d2b5e; font-size: 26px; }
.gestao-summary small { display: block; margin-top: 3px; color: #94a3b8; font-size: 11px; }
.gestao-summary__urgent { border-color: #fecaca !important; background: #fffafa !important; }
.gestao-summary__urgent strong { color: #b42318; }
.gestao-filter-card { margin-bottom: 16px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 11px; background: #fff; }
.gestao-filter-top { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 12px; }
.gestao-search, .gestao-filter-grid label { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.gestao-search > span, .gestao-filter-grid label > span { color: #475569; font-size: 11px; font-weight: 700; }
.gestao-search input, .gestao-filter-grid input, .gestao-filter-grid select { width: 100%; min-height: 40px; padding: 0 11px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1a1a2e; }
.filter-toggle { min-width: 108px; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 0 13px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #334155; font-weight: 700; cursor: pointer; }
.gestao-filter-grid { display: grid; grid-template-columns: repeat(4, minmax(150px, 1fr)); gap: 12px; }
.gestao-filter-grid--advanced { margin-top: 14px; padding-top: 14px; border-top: 1px solid #eef2f7; }
.gestao-filter-footer { display: flex; justify-content: space-between; margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef2f7; color: #64748b; font-size: 11px; }
.gestao-filter-footer button { border: 0; background: transparent; color: #1a4da1; font-weight: 700; cursor: pointer; }
.gestao-table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.gestao-table { width: 100%; border-collapse: collapse; min-width: 1080px; }
.gestao-table th { padding: 12px 13px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 800; text-align: left; text-transform: uppercase; }
.gestao-table td { padding: 12px 13px; border-bottom: 1px solid #eef2f7; color: #334155; font-size: 12px; vertical-align: middle; }
.gestao-table td strong { display: block; color: #1e293b; font-size: 12px; }
.gestao-table td small { display: block; margin-top: 3px; color: #94a3b8; font-size: 10px; }
.status-chip, .urgent-chip { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; font-size: 9px; font-weight: 800; }
.status-chip[data-status='PENDENTE'] { background: #fff7d6; color: #946200; }.status-chip[data-status='APROVADO'] { background: #e7f7ed; color: #007a3d; }.status-chip[data-status='REJEITADO'] { background: #fee2e2; color: #b42318; }.status-chip[data-status='CANCELADO'] { background: #f1f5f9; color: #64748b; }.status-chip[data-status='ENTREGUE'] { background: #e8f1ff; color: #1a4da1; }
.urgent-chip { background: #fee2e2; color: #b42318; }.neutral-copy { color: #94a3b8; font-size: 11px; }
.detail-button { width: 30px; height: 30px; border: 0; border-radius: 7px; background: #f1f5f9; color: #0d2b5e; cursor: pointer; }
.gestao-detail-row td { padding: 0; background: #f8fafc; }
.gestao-detail { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, .8fr); gap: 18px; padding: 20px 22px; }
.gestao-detail h3 { margin: 0 0 10px; color: #0d2b5e; font-size: 12px; }
.gestao-detail__item { display: grid; grid-template-columns: minmax(0, 1fr) 132px 132px; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px dashed #dbe3ec; }
.requested-form { color: #1a4da1 !important; font-weight: 700; }
.quantity-card { min-width: 0; min-height: 52px; display: flex; flex-direction: column; justify-content: center; gap: 2px; padding: 6px 8px; border-radius: 6px; }
.quantity-card strong, .approval-quantity > span { color: #475569; font-size: 9px; font-weight: 800; }.quantity-card > span { color: #0d2b5e; font-size: 15px; font-weight: 800; }
.requested-quantity { background: #eef4ff; }.approval-quantity { background: #f8fafc; border: 1px solid #dbe3ec; }.approved-quantity { background: #edf8f1; }
.approval-quantity input { width: 100%; min-height: 27px; margin-top: 2px; padding: 0 7px; border: 1px solid #cbd5e1; border-radius: 5px; }
.delivered-lots { grid-column: 1 / -1; margin-top: 5px; padding: 10px 12px; border: 1px solid #dbe7f8; border-radius: 7px; background: #f8fbff; }
.delivered-lots > strong { color: #64748b; font-size: 9px; }.delivered-lots > span { color: #64748b; font-size: 10px; }
.delivered-lot { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-top: 1px solid #e5edf8; }.delivered-lot:first-of-type { margin-top: 6px; }.delivered-lot b { color: #0d2b5e; font-size: 11px; }.delivered-lot span { color: #475569; font-size: 10px; }
.gestao-detail__context p { display: flex; justify-content: space-between; gap: 12px; margin: 7px 0; }.gestao-detail__context p span { color: #64748b; font-size: 11px; }.gestao-detail__context p strong { font-size: 11px; text-align: right; }
.gestao-detail__note { grid-column: 1 / -1; padding: 12px 14px; border-left: 3px solid #2d6bc4; border-radius: 6px; background: #fff; }.gestao-detail__note p { margin: 4px 0 0; color: #475569; font-size: 12px; }
.gestao-actions-panel { grid-column: 1 / -1; padding: 15px; border: 1px solid #dbe3ec; border-radius: 9px; background: #fff; }.gestao-actions-panel__heading { display: flex; justify-content: space-between; }.gestao-actions-panel__heading p { margin: 0; color: #64748b; font-size: 11px; }
.action-observation { display: flex; flex-direction: column; gap: 6px; margin-top: 13px; }.action-observation textarea, .justification-box textarea { width: 100%; padding: 9px 10px; border: 1px solid #cbd5e1; border-radius: 7px; box-sizing: border-box; }
.gestao-actions-buttons { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 13px; }.action-button { min-height: 36px; padding: 0 12px; border-radius: 7px; font-size: 11px; font-weight: 800; cursor: pointer; }.action-button--approve { border: 0; background: #007a3d; color: #fff; }.action-button--reject { border: 1px solid #fecaca; background: #fff; color: #b42318; }.action-button--deliver { border: 0; background: #1a4da1; color: #fff; }.action-button--cancel { border: 1px solid #cbd5e1; background: #fff; color: #475569; }
.justification-box { margin-top: 13px; padding: 12px; border: 1px solid #fecaca; border-radius: 8px; background: #fff7f7; }.justification-box > div { display: flex; justify-content: flex-end; gap: 8px; margin-top: 9px; }.justification-box button { min-height: 34px; padding: 0 11px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; }.justification-box .confirm-danger { border-color: #b42318; background: #b42318; color: #fff; }
.operation-message { margin: 11px 0 0; padding: 9px 10px; border-radius: 6px; font-size: 11px; }.operation-message--error { background: #fff1f1; color: #b42318; }.operation-message--success { background: #e7f7ed; color: #007a3d; }
.gestao-state { padding: 34px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff; color: #64748b; text-align: center; }.gestao-state--error { border-color: #fecaca; color: #b42318; background: #fffafa; }
@media (max-width: 900px) { .gestao-summary, .gestao-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.gestao-detail { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .gestao-pedidos__header { flex-direction: column; }.gestao-summary, .gestao-filter-grid, .gestao-filter-top { grid-template-columns: 1fr; }.gestao-detail__item { grid-template-columns: 1fr; }.delivered-lot { flex-direction: column; } }
</style>