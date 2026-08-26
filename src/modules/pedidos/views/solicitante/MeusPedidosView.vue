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
const selecionado = ref<PedidoResponse | null>(null)

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
              <th class="actions-column">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pedido in pedidosFiltrados" :key="pedido.id">
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
                <button class="details-button" type="button" @click="selecionado = pedido">
                  Ver detalhes
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="selecionado" class="dialog-backdrop" @click.self="selecionado = null">
      <section class="detail-dialog" role="dialog" aria-modal="true" aria-label="Detalhes do pedido">
        <header>
          <div>
            <span class="dialog-eyebrow">Pedido {{ selecionado.id.slice(0, 8).toUpperCase() }}</span>
            <h2>Detalhes da solicitação</h2>
          </div>
          <button type="button" aria-label="Fechar" @click="selecionado = null">×</button>
        </header>

        <div class="detail-meta">
          <div>
            <span>Status</span>
            <strong>{{ statusLabel(selecionado.status) }}</strong>
            <small v-if="selecionado.urgente" class="urgent-status">Pedido urgente</small>
          </div>
          <div><span>Projeto</span><strong>{{ selecionado.projetoNome ?? 'Sem projeto' }}</strong></div>
          <div><span>Solicitado em</span><strong>{{ formatarData(selecionado.dataSolicitacao) }}</strong></div>
        </div>

        <div v-if="selecionado.urgente && selecionado.motivoUrgencia" class="detail-note detail-note--urgent">
          <span>Motivo da urgência</span>
          <p>{{ selecionado.motivoUrgencia }}</p>
        </div>

        <div class="detail-items">
          <h3>Materiais</h3>
          <div v-for="item in selecionado.itens" :key="item.id" class="detail-item">
            <div>
              <strong>{{ item.produtoNome }}</strong>
              <span>{{ item.produtoUnidadeArmazenamento }}</span>
            </div>
            <div class="detail-quantity">
              <span>Solicitado: {{ item.quantidadeSolicitada }}</span>
              <span v-if="item.quantidadeAprovada != null">Aprovado: {{ item.quantidadeAprovada }}</span>
            </div>
          </div>
        </div>

        <div v-if="selecionado.observacao" class="detail-note">
          <span>Observação</span>
          <p>{{ selecionado.observacao }}</p>
        </div>
      </section>
    </div>
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
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: #fbfdff; }
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

.actions-column { text-align: right; }
.details-button { border: 0; background: transparent; color: var(--sgl-primary); font-size: 12px; font-weight: 750; cursor: pointer; }
.state-box { min-height: 230px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 28px; color: var(--sgl-text-muted); text-align: center; }
.state-box strong { color: var(--sgl-text); }
.state-box button { margin-top: 6px; border: 0; background: transparent; color: var(--sgl-primary); font-weight: 700; cursor: pointer; }
.state-box--error strong { color: var(--sgl-error); }

.dialog-backdrop { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 20px; background: rgb(5 16 37 / 45%); backdrop-filter: blur(2px); }
.detail-dialog { width: min(100%, 680px); max-height: 86vh; overflow-y: auto; border-radius: 10px; background: #fff; box-shadow: 0 24px 60px rgb(5 16 37 / 25%); }
.detail-dialog > header { display: flex; justify-content: space-between; gap: 20px; padding: 20px 22px; border-bottom: 1px solid var(--sgl-border); }
.dialog-eyebrow { color: var(--sgl-primary); font-size: 11px; font-weight: 800; text-transform: uppercase; }
.detail-dialog h2 { margin: 4px 0 0; font-size: 21px; }
.detail-dialog > header button { width: 34px; height: 34px; border: 0; border-radius: 50%; background: #f4f6f9; color: var(--sgl-text); font-size: 22px; cursor: pointer; }
.detail-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; padding: 18px 22px; background: #f8fafc; }
.detail-meta div { display: flex; flex-direction: column; gap: 4px; }
.detail-meta span, .detail-note > span { color: var(--sgl-text-muted); font-size: 10px; font-weight: 800; text-transform: uppercase; }
.detail-meta strong { font-size: 12px; }
.detail-meta .urgent-status { margin-top: 3px; }
.detail-items, .detail-note { padding: 20px 22px; }
.detail-items h3 { margin: 0 0 12px; font-size: 14px; }
.detail-item { display: flex; justify-content: space-between; gap: 18px; padding: 13px 0; border-top: 1px solid #edf1f6; }
.detail-item > div:first-child, .detail-quantity { display: flex; flex-direction: column; gap: 3px; }
.detail-item span { color: var(--sgl-text-muted); font-size: 11px; }
.detail-quantity { text-align: right; }
.detail-note { border-top: 1px solid var(--sgl-border); }
.detail-note--urgent { border-top-color: #fecaca; background: #fffafa; }
.detail-note--urgent > span, .detail-note--urgent p { color: #b42318; }
.detail-note p { margin: 8px 0 0; color: #46536a; font-size: 13px; line-height: 1.55; }

@media (max-width: 760px) {
  .page-heading { align-items: stretch; flex-direction: column; }
  .primary-action { align-self: flex-start; }
  .summary-grid, .filter-surface, .detail-meta { grid-template-columns: 1fr; }
  .status-filter { grid-template-columns: 70px 1fr; }
}
</style>
