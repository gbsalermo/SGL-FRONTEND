<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { pedidoService } from '@/modules/pedidos/services/pedidoService'
import type { ApiErrorResponse, PedidoResponse, StatusPedido } from '@/modules/pedidos/types/pedido'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const pedidos = ref<PedidoResponse[]>([])
const carregando = ref(false)
const erro = ref('')
const busca = ref('')
const status = ref<StatusPedido | 'TODOS'>('TODOS')
const pedidoExpandidoId = ref<string | null>(null)

const criadoAgora = computed(() => route.query.criado === '1')

const pedidosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()

  return pedidos.value.filter((pedido) => {
    const statusOk = status.value === 'TODOS' || pedido.status === status.value
    if (!statusOk) return false
    if (!termo) return true

    return [
      pedido.projetoNome,
      pedido.laboratorioNome,
      pedido.status,
      pedido.urgente ? 'urgente' : null,
      pedido.motivoUrgencia,
      pedido.observacao,
      ...pedido.itens.map((item) => item.produtoNome),
    ]
      .filter(Boolean)
      .some((valor) => String(valor).toLowerCase().includes(termo))
  })
})

const resumo = computed(() => ({
  pendentes: pedidos.value.filter((pedido) => pedido.status === 'PENDENTE').length,
  aprovados: pedidos.value.filter((pedido) => pedido.status === 'APROVADO').length,
  entregues: pedidos.value.filter((pedido) => pedido.status === 'ENTREGUE').length,
}))

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? 'Não foi possível carregar os pedidos.'
  }
  return error instanceof Error ? error.message : 'Não foi possível carregar os pedidos.'
}

async function carregarPedidos() {
  const usuarioId = session.usuario?.id
  if (!usuarioId) return

  carregando.value = true
  erro.value = ''

  try {
    pedidos.value = await pedidoService.listarPorUsuario(usuarioId)
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregando.value = false
  }
}

function formatarData(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor))
}

function statusLabel(valor: StatusPedido) {
  const labels: Record<StatusPedido, string> = {
    PENDENTE: 'Pendente',
    APROVADO: 'Aprovado',
    REJEITADO: 'Rejeitado',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
  }
  return labels[valor]
}

function produtosVisiveis(pedido: PedidoResponse) {
  return pedido.itens.slice(0, 2)
}

function produtosRestantes(pedido: PedidoResponse) {
  return Math.max(0, pedido.itens.length - 2)
}

function alternarDetalhes(pedidoId: string) {
  pedidoExpandidoId.value = pedidoExpandidoId.value === pedidoId ? null : pedidoId
}

onMounted(carregarPedidos)
</script>

<template>
  <section class="pedidos-page">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">Pedidos / Meus pedidos</p>
        <h1>Meus pedidos</h1>
        <p class="page-subtitle">Acompanhe suas solicitações de materiais e o status de atendimento.</p>
      </div>

      <button class="primary-action" type="button" @click="router.push('/pedidos/novo')">
        <span>+</span>
        Novo pedido
      </button>
    </header>

    <div v-if="criadoAgora" class="success-banner">
      Pedido enviado com sucesso. Ele já aparece na sua lista como pendente.
    </div>

    <div class="summary-grid">
      <article class="summary-card">
        <span>Pendentes</span>
        <strong>{{ resumo.pendentes }}</strong>
        <small>Aguardando análise</small>
      </article>
      <article class="summary-card">
        <span>Aprovados</span>
        <strong>{{ resumo.aprovados }}</strong>
        <small>Em atendimento</small>
      </article>
      <article class="summary-card">
        <span>Entregues</span>
        <strong>{{ resumo.entregues }}</strong>
        <small>Solicitações concluídas</small>
      </article>
    </div>

    <section class="filter-surface">
      <div class="search-control">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </svg>
        <input v-model="busca" type="search" placeholder="Buscar por produto, projeto, urgência ou observação..." />
      </div>

      <label class="status-filter">
        <span>Status</span>
        <select v-model="status">
          <option value="TODOS">Todos</option>
          <option value="PENDENTE">Pendente</option>
          <option value="APROVADO">Aprovado</option>
          <option value="REJEITADO">Rejeitado</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </label>
    </section>

    <section class="table-surface">
      <div v-if="carregando" class="state-box">Carregando seus pedidos...</div>

      <div v-else-if="erro" class="state-box state-box--error">
        <strong>Não foi possível carregar.</strong>
        <span>{{ erro }}</span>
        <button type="button" @click="carregarPedidos">Tentar novamente</button>
      </div>

      <div v-else-if="pedidosFiltrados.length === 0" class="state-box">
        <strong>Nenhum pedido encontrado.</strong>
        <span v-if="pedidos.length === 0">Sua primeira solicitação pode ser criada pelo botão “Novo pedido”.</span>
        <span v-else>Altere a busca ou o filtro de status.</span>
      </div>

      <div v-else class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Produtos</th>
              <th>Itens</th>
              <th>Status</th>
              <th>Laboratório</th>
              <th class="actions-column">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="pedido in pedidosFiltrados" :key="pedido.id">
              <tr class="order-row" :class="{ 'order-row--expanded': pedidoExpandidoId === pedido.id }">
                <td>
                  <strong class="table-primary">{{ formatarData(pedido.dataSolicitacao) }}</strong>
                  <span class="table-secondary">{{ pedido.id.slice(0, 8).toUpperCase() }}</span>
                </td>

                <td class="products-column">
                  <div class="product-summary">
                    <strong v-for="item in produtosVisiveis(pedido)" :key="item.id">
                      {{ item.produtoNome }}
                    </strong>
                    <span v-if="produtosRestantes(pedido) > 0" class="more-products">
                      + {{ produtosRestantes(pedido) }} outro(s)
                    </span>
                    <small>Projeto: {{ pedido.projetoNome ?? 'Sem projeto' }}</small>
                  </div>
                </td>

                <td>
                  <strong class="table-primary">{{ pedido.itens.length }}</strong>
                  <span class="table-secondary">produto(s)</span>
                </td>

                <td>
                  <div class="status-cell">
                    <span class="status-chip" :class="`status-chip--${pedido.status.toLowerCase()}`">
                      {{ statusLabel(pedido.status) }}
                    </span>
                    <span v-if="pedido.urgente" class="urgent-status">Pedido urgente</span>
                  </div>
                </td>

                <td>{{ pedido.laboratorioNome }}</td>

                <td class="actions-column">
                  <button
                    class="expand-button"
                    :class="{ 'expand-button--open': pedidoExpandidoId === pedido.id }"
                    type="button"
                    :aria-expanded="pedidoExpandidoId === pedido.id"
                    :aria-label="pedidoExpandidoId === pedido.id ? 'Recolher detalhes do pedido' : 'Expandir detalhes do pedido'"
                    @click="alternarDetalhes(pedido.id)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m8 10 4 4 4-4" />
                    </svg>
                  </button>
                </td>
              </tr>

              <tr v-if="pedidoExpandidoId === pedido.id" class="expanded-row">
                <td colspan="6">
                  <div class="expanded-panel">
                    <div class="expanded-heading">
                      <div>
                        <span>Pedido {{ pedido.id.slice(0, 8).toUpperCase() }}</span>
                        <strong>Detalhes da solicitação</strong>
                      </div>
                      <span class="expanded-date">Solicitado em {{ formatarData(pedido.dataSolicitacao) }}</span>
                    </div>

                    <div class="expanded-grid">
                      <section class="expanded-section expanded-section--materials">
                        <h3>Materiais solicitados</h3>
                        <div class="material-list">
                          <div v-for="item in pedido.itens" :key="item.id" class="material-item">
                            <div>
                              <strong>{{ item.produtoNome }}</strong>
                              <span>{{ item.produtoUnidadeArmazenamento }}</span>
                            </div>
                            <div class="material-quantity">
                              <span>Solicitado</span>
                              <strong>{{ item.quantidadeSolicitada }}</strong>
                              <small v-if="item.quantidadeAprovada != null">
                                Aprovado: {{ item.quantidadeAprovada }}
                              </small>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section class="expanded-section">
                        <h3>Informações do pedido</h3>
                        <dl class="info-list">
                          <div>
                            <dt>Status</dt>
                            <dd>{{ statusLabel(pedido.status) }}</dd>
                          </div>
                          <div>
                            <dt>Projeto</dt>
                            <dd>{{ pedido.projetoNome ?? 'Sem projeto' }}</dd>
                          </div>
                          <div>
                            <dt>Laboratório</dt>
                            <dd>{{ pedido.laboratorioNome }}</dd>
                          </div>
                        </dl>
                      </section>

                      <section v-if="pedido.urgente" class="expanded-section expanded-section--urgent">
                        <h3>Urgência</h3>
                        <span class="urgent-status">Pedido urgente</span>
                        <p>{{ pedido.motivoUrgencia || 'Motivo de urgência não informado.' }}</p>
                      </section>

                      <section class="expanded-section">
                        <h3>Observação / descrição</h3>
                        <p>{{ pedido.observacao || 'Nenhuma observação informada neste pedido.' }}</p>
                      </section>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<style scoped>
.pedidos-page { width: min(100%, 1260px); margin: 0 auto; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 26px; }
.breadcrumb { margin: 0 0 10px; color: var(--sgl-text-muted); font-size: 13px; }
.page-heading h1 { margin: 0; font-size: clamp(28px, 3vw, 38px); line-height: 1.1; letter-spacing: -0.035em; }
.page-subtitle { margin: 8px 0 0; color: var(--sgl-text-muted); font-size: 14px; }

.primary-action {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 0 18px;
  border: 0;
  border-radius: 7px;
  background: var(--sgl-primary);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgb(26 77 161 / 15%);
}
.primary-action:hover { background: var(--sgl-primary-dark); }
.primary-action span { font-size: 22px; line-height: 1; }

.success-banner { margin-bottom: 20px; padding: 13px 16px; border: 1px solid #b7e2c9; border-radius: 8px; background: #effaf3; color: #176b3c; font-size: 13px; }
.summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
.summary-card { min-height: 116px; padding: 17px 19px; border: 1px solid var(--sgl-border); border-radius: 9px; background: #fff; box-shadow: 0 5px 18px rgb(15 37 71 / 4%); }
.summary-card span, .summary-card small { display: block; color: var(--sgl-text-muted); }
.summary-card span { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.045em; }
.summary-card strong { display: block; margin: 7px 0 4px; font-size: 27px; }
.summary-card small { font-size: 12px; }

.filter-surface { display: grid; grid-template-columns: minmax(0, 1fr) 210px; gap: 12px; margin-bottom: 18px; padding: 14px; border: 1px solid var(--sgl-border); border-radius: 9px; background: #fff; box-shadow: 0 5px 18px rgb(15 37 71 / 4%); }
.search-control { min-height: 44px; display: flex; align-items: center; gap: 10px; padding: 0 13px; border: 1px solid #cbd5e1; border-radius: 6px; }
.search-control:focus-within { border-color: var(--sgl-primary); box-shadow: 0 0 0 3px rgb(26 77 161 / 8%); }
.search-control svg { width: 19px; height: 19px; fill: none; stroke: var(--sgl-text-muted); stroke-width: 1.8; }
.search-control input { width: 100%; border: 0; outline: 0; color: var(--sgl-text); }
.status-filter { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 9px; }
.status-filter span { color: var(--sgl-text-muted); font-size: 12px; font-weight: 700; }
.status-filter select { min-height: 44px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0 10px; background: #fff; color: var(--sgl-text); }

.table-surface { overflow: hidden; border: 1px solid var(--sgl-border); border-radius: 9px; background: #fff; box-shadow: 0 7px 24px rgb(15 37 71 / 5%); }
.table-scroll { overflow-x: auto; }
table { width: 100%; min-width: 980px; border-collapse: collapse; font-size: 13px; }
th, td { padding: 14px 16px; border-bottom: 1px solid #edf1f6; text-align: left; vertical-align: middle; }
th { color: #35415a; background: #fbfcfe; font-size: 11px; text-transform: uppercase; letter-spacing: 0.035em; }
.order-row:hover { background: #fbfdff; }
.order-row--expanded { background: #f8fbff; }
.table-primary, .table-secondary { display: block; }
.table-primary { color: var(--sgl-text); font-weight: 650; }
.table-secondary { margin-top: 3px; color: var(--sgl-text-muted); font-size: 11px; }

.products-column { width: 34%; min-width: 260px; }
.product-summary { display: flex; flex-direction: column; gap: 3px; }
.product-summary strong { color: var(--sgl-text); font-size: 12px; font-weight: 700; line-height: 1.35; }
.product-summary small { margin-top: 3px; color: var(--sgl-text-muted); font-size: 10px; }
.more-products { width: fit-content; margin-top: 2px; color: var(--sgl-primary); font-size: 10px; font-weight: 700; }

.status-cell { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.status-chip, .urgent-status { display: inline-flex; align-items: center; width: fit-content; min-height: 25px; padding: 0 9px; border-radius: 999px; font-size: 10px; font-weight: 800; line-height: 1; text-transform: uppercase; white-space: nowrap; }
.status-chip--pendente { background: #fff4da; color: #a05b00; }
.status-chip--aprovado { background: #e6f6ed; color: #187443; }
.status-chip--rejeitado { background: #feecec; color: #c62828; }
.status-chip--entregue { background: #e9f1ff; color: #1a4da1; }
.status-chip--cancelado { background: #eef1f5; color: #586579; }
.urgent-status { border: 1px solid #fecaca; background: #feecec; color: #b42318; letter-spacing: 0.025em; transition: background-color 160ms ease, border-color 160ms ease; }
.urgent-status:hover { border-color: #f4a6a6; background: #ffdede; }

.actions-column { width: 74px; text-align: center; }
.expand-button {
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border: 1px solid #d9e2ee;
  border-radius: 7px;
  background: #fff;
  color: var(--sgl-primary);
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}
.expand-button:hover { border-color: #b8c8dc; background: #f3f7fc; }
.expand-button svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform 180ms ease; }
.expand-button--open { border-color: #b8cbee; background: #eef4ff; }
.expand-button--open svg { transform: rotate(180deg); }

.expanded-row > td { padding: 0; background: #f8fafc; }
.expanded-panel { padding: 22px 24px 24px; border-bottom: 1px solid #dce5f0; box-shadow: inset 0 6px 12px rgb(15 37 71 / 3%); }
.expanded-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 18px; }
.expanded-heading > div { display: flex; flex-direction: column; gap: 3px; }
.expanded-heading > div > span { color: var(--sgl-primary); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.035em; }
.expanded-heading > div > strong { font-size: 16px; }
.expanded-date { color: var(--sgl-text-muted); font-size: 11px; }

.expanded-grid { display: grid; grid-template-columns: 1.45fr 1fr; gap: 14px; }
.expanded-section { min-width: 0; padding: 16px; border: 1px solid #e1e8f1; border-radius: 8px; background: #fff; }
.expanded-section h3 { margin: 0 0 12px; color: #26344b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
.expanded-section p { margin: 9px 0 0; color: #4d5a70; font-size: 12px; line-height: 1.55; }
.expanded-section--materials { grid-row: span 2; }
.expanded-section--urgent { border-color: #fecaca; background: #fffafa; }
.expanded-section--urgent h3, .expanded-section--urgent p { color: #b42318; }

.material-list { display: flex; flex-direction: column; }
.material-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 11px 0; border-top: 1px solid #edf1f6; }
.material-item:first-child { border-top: 0; padding-top: 0; }
.material-item:last-child { padding-bottom: 0; }
.material-item > div:first-child { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.material-item > div:first-child strong { color: var(--sgl-text); font-size: 12px; }
.material-item > div:first-child span { color: var(--sgl-text-muted); font-size: 10px; }
.material-quantity { flex: 0 0 auto; display: grid; grid-template-columns: auto auto; gap: 2px 8px; text-align: right; }
.material-quantity span { color: var(--sgl-text-muted); font-size: 9px; text-transform: uppercase; }
.material-quantity strong { font-size: 13px; }
.material-quantity small { grid-column: 1 / -1; color: #187443; font-size: 9px; }

.info-list { display: grid; gap: 10px; margin: 0; }
.info-list div { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 10px; }
.info-list dt { color: var(--sgl-text-muted); font-size: 10px; font-weight: 700; text-transform: uppercase; }
.info-list dd { margin: 0; color: var(--sgl-text); font-size: 11px; font-weight: 650; }

.state-box { min-height: 230px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 28px; color: var(--sgl-text-muted); text-align: center; }
.state-box strong { color: var(--sgl-text); }
.state-box button { margin-top: 6px; border: 0; background: transparent; color: var(--sgl-primary); font-weight: 700; cursor: pointer; }
.state-box--error strong { color: var(--sgl-error); }

@media (max-width: 760px) {
  .page-heading { align-items: stretch; flex-direction: column; }
  .primary-action { align-self: flex-start; }
  .summary-grid, .filter-surface, .expanded-grid { grid-template-columns: 1fr; }
  .status-filter { grid-template-columns: 70px 1fr; }
  .expanded-section--materials { grid-row: auto; }
  .expanded-heading { flex-direction: column; }
}
</style>
