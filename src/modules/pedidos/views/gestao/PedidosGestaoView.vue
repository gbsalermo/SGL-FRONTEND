<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { pedidoService } from '@/modules/pedidos/services/pedidoService'
import type { PedidoResponse, StatusPedido } from '@/modules/pedidos/types/pedido'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const pedidos = ref<PedidoResponse[]>([])
const carregando = ref(true)
const erro = ref('')
const busca = ref('')
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

const laboratorios = computed(() =>
  [...new Set(pedidos.value.map((pedido) => pedido.laboratorioNome))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR')),
)

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
  if (ordenarPor.value === 'PRODUTO') {
    return pedido.itens.map((item) => item.produtoNome).sort().join(' ')
  }
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

    const texto = [
      pedido.usuarioNome,
      pedido.laboratorioNome,
      pedido.projetoNome,
      pedido.status,
      pedido.urgente ? 'urgente' : 'normal',
      pedido.observacao,
      pedido.motivoUrgencia,
      ...pedido.itens.map((item) => item.produtoNome),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return texto.includes(termo)
  })

  return [...filtrados].sort((a, b) => {
    const valorA = valorOrdenacao(a)
    const valorB = valorOrdenacao(b)

    let comparacao = 0
    if (typeof valorA === 'number' && typeof valorB === 'number') {
      comparacao = valorA - valorB
    } else {
      comparacao = String(valorA).localeCompare(String(valorB), 'pt-BR', { sensitivity: 'base' })
    }

    return direcao.value === 'ASC' ? comparacao : -comparacao
  })
})

function dataFormatada(data: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(data))
}

function produtosResumo(pedido: PedidoResponse) {
  const nomes = pedido.itens.map((item) => item.produtoNome)
  if (nomes.length <= 2) return nomes.join(', ')
  return `${nomes.slice(0, 2).join(', ')} +${nomes.length - 2}`
}

function limparAcao() {
  acaoJustificada.value = null
  justificativa.value = ''
  observacaoAprovacao.value = ''
  erroAcao.value = ''
  sucessoAcao.value = ''
}

function prepararPedido(pedido: PedidoResponse) {
  quantidadesAprovadas.value = Object.fromEntries(
    pedido.itens.map((item) => [item.id, item.quantidadeAprovada ?? item.quantidadeSolicitada]),
  )
  limparAcao()
}

function alternarDetalhe(pedido: PedidoResponse) {
  if (pedidoExpandido.value === pedido.id) {
    pedidoExpandido.value = null
    limparAcao()
    return
  }

  pedidoExpandido.value = pedido.id
  prepararPedido(pedido)
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
}

async function aprovar(pedido: PedidoResponse) {
  erroAcao.value = ''
  sucessoAcao.value = ''

  const aprovadorId = session.usuario?.id
  if (!aprovadorId) {
    erroAcao.value = 'Usuário aprovador não identificado na sessão.'
    return
  }

  const itens = pedido.itens.map((item) => ({
    itemId: item.id,
    quantidadeAprovada: Number(quantidadesAprovadas.value[item.id]),
  }))

  const invalido = itens.some((item, index) =>
    !Number.isInteger(item.quantidadeAprovada)
    || item.quantidadeAprovada < 1
    || item.quantidadeAprovada > pedido.itens[index]!.quantidadeSolicitada,
  )

  if (invalido) {
    erroAcao.value = 'As quantidades aprovadas devem ficar entre 1 e a quantidade solicitada.'
    return
  }

  if (!window.confirm('Confirma a aprovação deste pedido com as quantidades informadas?')) return

  executandoAcao.value = true
  try {
    const atualizado = await pedidoService.aprovar(pedido.id, {
      usuarioAprovadorId: aprovadorId,
      observacao: observacaoAprovacao.value.trim() || null,
      itens,
    })
    atualizarPedido(atualizado)
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
  if (!motivo) {
    erroAcao.value = acaoJustificada.value === 'REJEITAR'
      ? 'Informe o motivo da rejeição.'
      : 'Informe o motivo do cancelamento.'
    return
  }

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
    const atualizado = await pedidoService.entregar(pedido.id)
    atualizarPedido(atualizado)
  } catch (error) {
    erroAcao.value = mensagemErro(error)
  } finally {
    executandoAcao.value = false
  }
}

function limparFiltros() {
  busca.value = ''
  status.value = 'TODOS'
  urgencia.value = 'TODOS'
  laboratorio.value = 'TODOS'
  dataInicio.value = ''
  dataFim.value = ''
  ordenarPor.value = 'DATA'
  direcao.value = 'DESC'

  if (route.query.status) {
    router.replace({ path: '/pedidos' })
  }
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

watch(
  () => route.query.status,
  (valor) => {
    const statusRota = typeof valor === 'string' ? valor.toUpperCase() : ''
    const validos: StatusPedido[] = ['PENDENTE', 'APROVADO', 'REJEITADO', 'ENTREGUE', 'CANCELADO']
    status.value = validos.includes(statusRota as StatusPedido)
      ? statusRota as StatusPedido
      : 'TODOS'
  },
  { immediate: true },
)

onMounted(carregar)
</script>

<template>
  <section class="gestao-pedidos">
    <div class="gestao-pedidos__breadcrumb">Operação / Pedidos</div>

    <header class="gestao-pedidos__header">
      <div>
        <h1>Pedidos</h1>
        <p>Acompanhe, filtre, organize e gerencie todos os pedidos do sistema.</p>
      </div>
      <div class="gestao-pedidos__header-actions">
        <button class="secondary-action" type="button" @click="carregar">Atualizar</button>
        <router-link class="primary-action" to="/solicitacoes/novo">+ Novo pedido</router-link>
      </div>
    </header>

    <div class="gestao-summary">
      <article>
        <span>Pendentes</span>
        <strong>{{ totais.pendentes }}</strong>
        <small>Aguardando análise</small>
      </article>
      <article :class="{ 'gestao-summary__urgent': totais.urgentes > 0 }">
        <span>Urgentes</span>
        <strong>{{ totais.urgentes }}</strong>
        <small>Marcação informativa</small>
      </article>
      <article>
        <span>Aprovados</span>
        <strong>{{ totais.aprovados }}</strong>
        <small>Aguardando entrega</small>
      </article>
      <article>
        <span>Entregues</span>
        <strong>{{ totais.entregues }}</strong>
        <small>Concluídos</small>
      </article>
    </div>

    <section class="gestao-filter-card" aria-label="Busca, filtros e ordenação">
      <div class="gestao-filter-grid">
        <label class="gestao-search">
          <span>Buscar</span>
          <input v-model="busca" type="search" placeholder="Produto, solicitante, laboratório, projeto, urgência..." />
        </label>

        <label>
          <span>Status</span>
          <select v-model="status">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label>
          <span>Urgência</span>
          <select v-model="urgencia">
            <option value="TODOS">Todos</option>
            <option value="URGENTE">Somente urgentes</option>
            <option value="NORMAL">Somente normais</option>
          </select>
        </label>

        <label>
          <span>Laboratório</span>
          <select v-model="laboratorio">
            <option value="TODOS">Todos os laboratórios</option>
            <option v-for="nome in laboratorios" :key="nome" :value="nome">{{ nome }}</option>
          </select>
        </label>

        <label>
          <span>Data inicial</span>
          <input v-model="dataInicio" type="date" />
        </label>

        <label>
          <span>Data final</span>
          <input v-model="dataFim" type="date" />
        </label>

        <label>
          <span>Organizar por</span>
          <select v-model="ordenarPor">
            <option value="DATA">Data</option>
            <option value="LABORATORIO">Laboratório</option>
            <option value="PROJETO">Projeto</option>
            <option value="STATUS">Status</option>
            <option value="PRODUTO">Produto</option>
            <option value="URGENCIA">Urgência</option>
          </select>
        </label>

        <label>
          <span>Ordem</span>
          <select v-model="direcao">
            <option value="DESC">Decrescente</option>
            <option value="ASC">Crescente</option>
          </select>
        </label>
      </div>

      <div class="gestao-filter-footer">
        <span>{{ pedidosFiltrados.length }} pedido(s) encontrado(s)</span>
        <button type="button" @click="limparFiltros">Limpar filtros</button>
      </div>
    </section>

    <div v-if="carregando" class="gestao-state">Carregando pedidos...</div>
    <div v-else-if="erro" class="gestao-state gestao-state--error">{{ erro }}</div>
    <div v-else-if="pedidosFiltrados.length === 0" class="gestao-state">Nenhum pedido encontrado para os filtros atuais.</div>

    <div v-else class="gestao-table-wrap">
      <table class="gestao-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Solicitante / Projeto</th>
            <th>Produtos</th>
            <th>Laboratório</th>
            <th>Status</th>
            <th>Urgência</th>
            <th aria-label="Detalhes"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="pedido in pedidosFiltrados" :key="pedido.id">
            <tr>
              <td>{{ dataFormatada(pedido.dataSolicitacao) }}</td>
              <td>
                <strong>{{ pedido.usuarioNome }}</strong>
                <small>{{ pedido.projetoNome ?? 'Sem projeto' }}</small>
              </td>
              <td>
                <strong>{{ produtosResumo(pedido) }}</strong>
                <small>{{ pedido.itens.length }} {{ pedido.itens.length === 1 ? 'item' : 'itens' }}</small>
              </td>
              <td>{{ pedido.laboratorioNome }}</td>
              <td><span class="status-chip" :data-status="pedido.status">{{ pedido.status }}</span></td>
              <td>
                <span v-if="pedido.urgente" class="urgent-chip">URGENTE</span>
                <span v-else class="neutral-copy">Normal</span>
              </td>
              <td>
                <button class="detail-button" type="button" @click="alternarDetalhe(pedido)">
                  {{ pedidoExpandido === pedido.id ? '⌃' : '⌄' }}
                </button>
              </td>
            </tr>

            <tr v-if="pedidoExpandido === pedido.id" class="gestao-detail-row">
              <td colspan="7">
                <div class="gestao-detail">
                  <div class="gestao-detail__items">
                    <h3>Materiais solicitados</h3>
                    <div v-for="item in pedido.itens" :key="item.id" class="gestao-detail__item">
                      <div>
                        <strong>{{ item.produtoNome }}</strong>
                        <small>{{ item.produtoUnidadeArmazenamento }}</small>
                      </div>
                      <span>Solicitado: {{ item.quantidadeSolicitada }}</span>
                      <label v-if="pedido.status === 'PENDENTE'" class="approval-quantity">
                        <span>Aprovar</span>
                        <input
                          v-model.number="quantidadesAprovadas[item.id]"
                          type="number"
                          min="1"
                          :max="item.quantidadeSolicitada"
                        />
                      </label>
                      <span v-else-if="item.quantidadeAprovada !== null">Aprovado: {{ item.quantidadeAprovada }}</span>
                    </div>
                  </div>

                  <div class="gestao-detail__context">
                    <h3>Contexto</h3>
                    <p><span>Status</span><strong>{{ pedido.status }}</strong></p>
                    <p><span>Projeto</span><strong>{{ pedido.projetoNome ?? 'Sem projeto' }}</strong></p>
                    <p><span>Laboratório</span><strong>{{ pedido.laboratorioNome }}</strong></p>
                    <p><span>Solicitante</span><strong>{{ pedido.usuarioNome }}</strong></p>
                    <p><span>Urgência</span><strong>{{ pedido.urgente ? 'Pedido urgente' : 'Normal' }}</strong></p>
                  </div>

                  <div v-if="pedido.observacao || pedido.motivoUrgencia" class="gestao-detail__note">
                    <h3>Observação / descrição</h3>
                    <p>{{ pedido.observacao || pedido.motivoUrgencia }}</p>
                    <p v-if="pedido.observacao && pedido.motivoUrgencia && pedido.motivoUrgencia !== pedido.observacao">
                      {{ pedido.motivoUrgencia }}
                    </p>
                  </div>

                  <section v-if="pedido.status === 'PENDENTE' || pedido.status === 'APROVADO'" class="gestao-actions-panel">
                    <div class="gestao-actions-panel__heading">
                      <div>
                        <h3>Ações do pedido</h3>
                        <p>Confira os dados acima antes de alterar o andamento.</p>
                      </div>
                      <span class="status-chip" :data-status="pedido.status">{{ pedido.status }}</span>
                    </div>

                    <label v-if="pedido.status === 'PENDENTE'" class="action-observation">
                      <span>Observação da aprovação (opcional)</span>
                      <textarea v-model="observacaoAprovacao" rows="2" placeholder="Ex.: aprovado para atendimento parcial..." />
                    </label>

                    <div class="gestao-actions-buttons">
                      <button
                        v-if="pedido.status === 'PENDENTE'"
                        class="action-button action-button--approve"
                        type="button"
                        :disabled="executandoAcao"
                        @click="aprovar(pedido)"
                      >
                        Aprovar pedido
                      </button>

                      <button
                        v-if="pedido.status === 'PENDENTE'"
                        class="action-button action-button--reject"
                        type="button"
                        :disabled="executandoAcao"
                        @click="acaoJustificada = 'REJEITAR'; justificativa = ''; erroAcao = ''; sucessoAcao = ''"
                      >
                        Rejeitar
                      </button>

                      <button
                        v-if="pedido.status === 'APROVADO'"
                        class="action-button action-button--deliver"
                        type="button"
                        :disabled="executandoAcao"
                        @click="entregar(pedido)"
                      >
                        Registrar entrega
                      </button>

                      <button
                        class="action-button action-button--cancel"
                        type="button"
                        :disabled="executandoAcao"
                        @click="acaoJustificada = 'CANCELAR'; justificativa = ''; erroAcao = ''; sucessoAcao = ''"
                      >
                        Cancelar pedido
                      </button>
                    </div>

                    <div v-if="acaoJustificada" class="justification-box">
                      <label>
                        <span>{{ acaoJustificada === 'REJEITAR' ? 'Motivo da rejeição' : 'Motivo do cancelamento' }}</span>
                        <textarea
                          v-model="justificativa"
                          rows="3"
                          :placeholder="acaoJustificada === 'REJEITAR' ? 'Explique por que o pedido está sendo rejeitado...' : 'Explique por que o pedido está sendo cancelado...'"
                        />
                      </label>
                      <div>
                        <button type="button" :disabled="executandoAcao" @click="acaoJustificada = null; justificativa = ''">Voltar</button>
                        <button class="confirm-danger" type="button" :disabled="executandoAcao" @click="confirmarAcaoJustificada(pedido)">
                          Confirmar {{ acaoJustificada === 'REJEITAR' ? 'rejeição' : 'cancelamento' }}
                        </button>
                      </div>
                    </div>

                    <p v-if="erroAcao" class="operation-message operation-message--error">{{ erroAcao }}</p>
                    <p v-if="sucessoAcao" class="operation-message operation-message--success">{{ sucessoAcao }}</p>
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
.primary-action, .secondary-action { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; padding: 0 16px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; cursor: pointer; }
.primary-action { border: 0; background: #1a4da1; color: #fff; box-shadow: 0 7px 18px rgb(26 77 161 / 16%); }
.secondary-action { border: 1px solid #cbd5e1; background: #fff; color: #334155; }

.gestao-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 22px 0 18px; }
.gestao-summary article { padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.gestao-summary span { display: block; color: #64748b; font-size: 12px; font-weight: 700; }
.gestao-summary strong { display: block; margin-top: 8px; color: #0d2b5e; font-size: 26px; }
.gestao-summary small { display: block; margin-top: 3px; color: #94a3b8; font-size: 11px; }
.gestao-summary__urgent { border-color: #fecaca !important; background: #fffafa !important; }
.gestao-summary__urgent strong { color: #b42318; }

.gestao-filter-card { margin-bottom: 16px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 11px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.gestao-filter-grid { display: grid; grid-template-columns: minmax(270px, 1.6fr) repeat(3, minmax(150px, .7fr)); gap: 12px; }
.gestao-filter-grid label { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.gestao-filter-grid label > span { color: #475569; font-size: 11px; font-weight: 700; }
.gestao-filter-grid input, .gestao-filter-grid select { width: 100%; min-height: 40px; padding: 0 11px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1a1a2e; outline: none; }
.gestao-filter-grid input:focus, .gestao-filter-grid select:focus { border-color: #2d6bc4; box-shadow: 0 0 0 3px rgb(45 107 196 / 10%); }
.gestao-filter-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef2f7; color: #64748b; font-size: 11px; }
.gestao-filter-footer button { border: 0; background: transparent; color: #1a4da1; font-weight: 700; cursor: pointer; }

.gestao-table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.gestao-table { width: 100%; border-collapse: collapse; min-width: 1080px; }
.gestao-table th { padding: 12px 13px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 800; letter-spacing: .04em; text-align: left; text-transform: uppercase; }
.gestao-table td { padding: 12px 13px; border-bottom: 1px solid #eef2f7; color: #334155; font-size: 12px; vertical-align: middle; }
.gestao-table tbody > tr:not(.gestao-detail-row):hover { background: #fbfdff; }
.gestao-table td strong { display: block; color: #1e293b; font-size: 12px; }
.gestao-table td small { display: block; margin-top: 3px; color: #94a3b8; font-size: 10px; }
.status-chip, .urgent-chip { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; font-size: 9px; font-weight: 800; }
.status-chip[data-status='PENDENTE'] { background: #fff7d6; color: #946200; }
.status-chip[data-status='APROVADO'] { background: #e7f7ed; color: #007a3d; }
.status-chip[data-status='REJEITADO'] { background: #fee2e2; color: #b42318; }
.status-chip[data-status='CANCELADO'] { background: #f1f5f9; color: #64748b; }
.status-chip[data-status='ENTREGUE'] { background: #e8f1ff; color: #1a4da1; }
.urgent-chip { background: #fee2e2; color: #b42318; }
.neutral-copy { color: #94a3b8; font-size: 11px; }
.detail-button { width: 30px; height: 30px; border: 0; border-radius: 7px; background: #f1f5f9; color: #0d2b5e; cursor: pointer; }
.detail-button:hover { background: #e2e8f0; }

.gestao-detail-row td { padding: 0; background: #f8fafc; }
.gestao-detail { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, .8fr); gap: 18px; padding: 20px 22px; border-bottom: 1px solid #e2e8f0; }
.gestao-detail h3 { margin: 0 0 10px; color: #0d2b5e; font-size: 12px; }
.gestao-detail__item { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 18px; padding: 10px 0; border-bottom: 1px dashed #dbe3ec; }
.gestao-detail__item div { min-width: 0; }
.gestao-detail__item span { color: #475569; font-size: 11px; }
.approval-quantity { display: flex; align-items: center; gap: 7px; }
.approval-quantity span { font-weight: 700; }
.approval-quantity input { width: 72px; min-height: 32px; padding: 0 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
.gestao-detail__context p { display: flex; justify-content: space-between; gap: 12px; margin: 7px 0; }
.gestao-detail__context p span { color: #64748b; font-size: 11px; }
.gestao-detail__context p strong { font-size: 11px; text-align: right; }
.gestao-detail__note { grid-column: 1 / -1; padding: 12px 14px; border-left: 3px solid #2d6bc4; border-radius: 6px; background: #fff; }
.gestao-detail__note p { margin: 4px 0 0; color: #475569; font-size: 12px; line-height: 1.5; }

.gestao-actions-panel { grid-column: 1 / -1; padding: 15px; border: 1px solid #dbe3ec; border-radius: 9px; background: #fff; }
.gestao-actions-panel__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; }
.gestao-actions-panel__heading h3 { margin-bottom: 4px; }
.gestao-actions-panel__heading p { margin: 0; color: #64748b; font-size: 11px; }
.action-observation { display: flex; flex-direction: column; gap: 6px; margin-top: 13px; }
.action-observation span, .justification-box label > span { color: #475569; font-size: 11px; font-weight: 700; }
.action-observation textarea, .justification-box textarea { width: 100%; margin-top: 6px; padding: 9px 10px; border: 1px solid #cbd5e1; border-radius: 7px; resize: vertical; color: #1e293b; font: inherit; font-size: 12px; }
.gestao-actions-buttons { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 13px; }
.action-button { min-height: 36px; padding: 0 12px; border-radius: 7px; font-size: 11px; font-weight: 800; cursor: pointer; }
.action-button:disabled, .justification-box button:disabled { opacity: .6; cursor: wait; }
.action-button--approve { border: 0; background: #007a3d; color: #fff; }
.action-button--reject { border: 1px solid #fecaca; background: #fff; color: #b42318; }
.action-button--deliver { border: 0; background: #1a4da1; color: #fff; }
.action-button--cancel { border: 1px solid #cbd5e1; background: #fff; color: #475569; }
.justification-box { margin-top: 13px; padding: 12px; border-radius: 8px; background: #fff7f7; border: 1px solid #fecaca; }
.justification-box label { display: block; }
.justification-box > div { display: flex; justify-content: flex-end; gap: 8px; margin-top: 9px; }
.justification-box button { min-height: 34px; padding: 0 11px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; cursor: pointer; }
.justification-box .confirm-danger { border-color: #b42318; background: #b42318; color: #fff; }
.operation-message { margin: 11px 0 0; padding: 9px 10px; border-radius: 6px; font-size: 11px; }
.operation-message--error { background: #fff1f1; color: #b42318; }
.operation-message--success { background: #e7f7ed; color: #007a3d; }
.gestao-state { padding: 34px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff; color: #64748b; text-align: center; }
.gestao-state--error { border-color: #fecaca; color: #b42318; background: #fffafa; }

@media (max-width: 1180px) {
  .gestao-filter-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .gestao-search { grid-column: span 2; }
}

@media (max-width: 900px) {
  .gestao-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gestao-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gestao-search { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
  .gestao-pedidos__header { flex-direction: column; }
  .gestao-pedidos__header-actions { width: 100%; }
  .gestao-pedidos__header-actions > * { flex: 1; }
  .gestao-summary, .gestao-filter-grid { grid-template-columns: 1fr; }
  .gestao-search { grid-column: auto; }
  .gestao-detail { grid-template-columns: 1fr; }
  .gestao-detail__item { grid-template-columns: 1fr; gap: 6px; }
}
</style>
