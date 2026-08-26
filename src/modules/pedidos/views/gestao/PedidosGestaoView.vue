<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { pedidoService } from '@/modules/pedidos/services/pedidoService'
import type { PedidoResponse, StatusPedido } from '@/modules/pedidos/types/pedido'

const pedidos = ref<PedidoResponse[]>([])
const carregando = ref(true)
const erro = ref('')
const busca = ref('')
const status = ref<StatusPedido | 'TODOS'>('TODOS')
const somenteUrgentes = ref(false)
const pedidoExpandido = ref<string | null>(null)

const statusOptions: Array<{ label: string; value: StatusPedido | 'TODOS' }> = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Pendentes', value: 'PENDENTE' },
  { label: 'Aprovados', value: 'APROVADO' },
  { label: 'Rejeitados', value: 'REJEITADO' },
  { label: 'Entregues', value: 'ENTREGUE' },
  { label: 'Cancelados', value: 'CANCELADO' },
]

const totais = computed(() => ({
  pendentes: pedidos.value.filter((pedido) => pedido.status === 'PENDENTE').length,
  urgentes: pedidos.value.filter((pedido) => pedido.urgente).length,
  aprovados: pedidos.value.filter((pedido) => pedido.status === 'APROVADO').length,
  entregues: pedidos.value.filter((pedido) => pedido.status === 'ENTREGUE').length,
}))

const pedidosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()

  return pedidos.value.filter((pedido) => {
    if (status.value !== 'TODOS' && pedido.status !== status.value) return false
    if (somenteUrgentes.value && !pedido.urgente) return false
    if (!termo) return true

    const texto = [
      pedido.usuarioNome,
      pedido.laboratorioNome,
      pedido.projetoNome,
      pedido.status,
      pedido.observacao,
      pedido.motivoUrgencia,
      ...pedido.itens.map((item) => item.produtoNome),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return texto.includes(termo)
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

function alternarDetalhe(id: string) {
  pedidoExpandido.value = pedidoExpandido.value === id ? null : id
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

onMounted(carregar)
</script>

<template>
  <section class="gestao-pedidos">
    <div class="gestao-pedidos__breadcrumb">Operação / Pedidos</div>

    <header class="gestao-pedidos__header">
      <div>
        <h1>Pedidos</h1>
        <p>Analise solicitações, acompanhe aprovações e registre o andamento dos pedidos.</p>
      </div>
      <button type="button" @click="carregar">Atualizar</button>
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

    <div class="gestao-filters">
      <label class="gestao-search">
        <span>Buscar</span>
        <input v-model="busca" type="search" placeholder="Produto, solicitante, laboratório, projeto..." />
      </label>

      <label>
        <span>Status</span>
        <select v-model="status">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="gestao-urgent-filter">
        <input v-model="somenteUrgentes" type="checkbox" />
        <span>Somente urgentes</span>
      </label>
    </div>

    <div v-if="carregando" class="gestao-state">Carregando pedidos...</div>
    <div v-else-if="erro" class="gestao-state gestao-state--error">{{ erro }}</div>
    <div v-else-if="pedidosFiltrados.length === 0" class="gestao-state">Nenhum pedido encontrado para os filtros atuais.</div>

    <div v-else class="gestao-table-wrap">
      <table class="gestao-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Solicitante</th>
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
                <small v-if="pedido.projetoNome">{{ pedido.projetoNome }}</small>
              </td>
              <td>
                <strong>{{ produtosResumo(pedido) }}</strong>
                <small>{{ pedido.itens.length }} {{ pedido.itens.length === 1 ? 'item' : 'itens' }}</small>
              </td>
              <td>{{ pedido.laboratorioNome }}</td>
              <td>
                <span class="status-chip" :data-status="pedido.status">{{ pedido.status }}</span>
              </td>
              <td>
                <span v-if="pedido.urgente" class="urgent-chip">URGENTE</span>
                <span v-else class="neutral-copy">Normal</span>
              </td>
              <td>
                <button class="detail-button" type="button" @click="alternarDetalhe(pedido.id)">
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
                      <span v-if="item.quantidadeAprovada !== null">Aprovado: {{ item.quantidadeAprovada }}</span>
                    </div>
                  </div>

                  <div class="gestao-detail__context">
                    <h3>Contexto</h3>
                    <p><span>Status</span><strong>{{ pedido.status }}</strong></p>
                    <p><span>Projeto</span><strong>{{ pedido.projetoNome ?? 'Sem projeto' }}</strong></p>
                    <p><span>Laboratório</span><strong>{{ pedido.laboratorioNome }}</strong></p>
                    <p><span>Urgência</span><strong>{{ pedido.urgente ? 'Pedido marcado como urgente' : 'Normal' }}</strong></p>
                  </div>

                  <div v-if="pedido.observacao || pedido.motivoUrgencia" class="gestao-detail__note">
                    <h3>Observação / descrição</h3>
                    <p>{{ pedido.observacao || pedido.motivoUrgencia }}</p>
                    <p v-if="pedido.observacao && pedido.motivoUrgencia && pedido.motivoUrgencia !== pedido.observacao">
                      {{ pedido.motivoUrgencia }}
                    </p>
                  </div>

                  <div v-if="pedido.status === 'PENDENTE'" class="gestao-detail__actions">
                    <span>Ações de aprovação/rejeição entram no próximo refinamento após validação visual desta tela.</span>
                  </div>
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
.gestao-pedidos__header h1 { margin: 0; color: #1a1a2e; font-size: 28px; }
.gestao-pedidos__header p { margin: 7px 0 0; color: #64748b; font-size: 14px; }
.gestao-pedidos__header button { padding: 10px 16px; border: 0; border-radius: 8px; background: #1a4da1; color: #fff; font-weight: 700; cursor: pointer; }

.gestao-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 22px 0 18px; }
.gestao-summary article { padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.gestao-summary span { display: block; color: #64748b; font-size: 12px; font-weight: 700; }
.gestao-summary strong { display: block; margin-top: 8px; color: #0d2b5e; font-size: 26px; }
.gestao-summary small { display: block; margin-top: 3px; color: #94a3b8; font-size: 11px; }
.gestao-summary__urgent { border-color: #fecaca !important; background: #fffafa !important; }
.gestao-summary__urgent strong { color: #b42318; }

.gestao-filters { display: grid; grid-template-columns: minmax(280px, 1fr) 190px auto; align-items: end; gap: 12px; margin-bottom: 14px; padding: 14px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.gestao-filters label:not(.gestao-urgent-filter) { display: flex; flex-direction: column; gap: 6px; }
.gestao-filters label > span { color: #475569; font-size: 11px; font-weight: 700; }
.gestao-filters input[type='search'], .gestao-filters select { min-height: 38px; padding: 0 11px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1a1a2e; outline: none; }
.gestao-filters input:focus, .gestao-filters select:focus { border-color: #2d6bc4; box-shadow: 0 0 0 3px rgb(45 107 196 / 10%); }
.gestao-urgent-filter { min-height: 38px; display: flex; align-items: center; gap: 8px; padding: 0 10px; }

.gestao-table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.gestao-table { width: 100%; border-collapse: collapse; min-width: 1040px; }
.gestao-table th { padding: 11px 13px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 800; letter-spacing: .04em; text-align: left; text-transform: uppercase; }
.gestao-table td { padding: 12px 13px; border-bottom: 1px solid #eef2f7; color: #334155; font-size: 12px; vertical-align: middle; }
.gestao-table tbody > tr:not(.gestao-detail-row):hover { background: #fbfdff; }
.gestao-table td strong { display: block; color: #1e293b; font-size: 12px; }
.gestao-table td small { display: block; margin-top: 3px; color: #94a3b8; font-size: 10px; }
.status-chip, .urgent-chip { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; font-size: 9px; font-weight: 800; }
.status-chip[data-status='PENDENTE'] { background: #fff7d6; color: #946200; }
.status-chip[data-status='APROVADO'] { background: #e8f1ff; color: #1a4da1; }
.status-chip[data-status='REJEITADO'], .status-chip[data-status='CANCELADO'] { background: #f1f5f9; color: #64748b; }
.status-chip[data-status='ENTREGUE'] { background: #e7f7ed; color: #007a3d; }
.urgent-chip { background: #fee2e2; color: #b42318; }
.neutral-copy { color: #94a3b8; font-size: 11px; }
.detail-button { width: 30px; height: 30px; border: 0; border-radius: 7px; background: #f1f5f9; color: #0d2b5e; cursor: pointer; }
.detail-button:hover { background: #e2e8f0; }

.gestao-detail-row td { padding: 0; background: #f8fafc; }
.gestao-detail { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(230px, .8fr); gap: 18px; padding: 18px 22px; border-bottom: 1px solid #e2e8f0; }
.gestao-detail h3 { margin: 0 0 10px; color: #0d2b5e; font-size: 12px; }
.gestao-detail__item { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 18px; padding: 9px 0; border-bottom: 1px dashed #dbe3ec; }
.gestao-detail__item div { min-width: 0; }
.gestao-detail__item span { color: #475569; font-size: 11px; }
.gestao-detail__context p { display: flex; justify-content: space-between; gap: 12px; margin: 7px 0; }
.gestao-detail__context p span { color: #64748b; font-size: 11px; }
.gestao-detail__context p strong { font-size: 11px; text-align: right; }
.gestao-detail__note { grid-column: 1 / -1; padding: 12px 14px; border-left: 3px solid #2d6bc4; border-radius: 6px; background: #fff; }
.gestao-detail__note p { margin: 4px 0 0; color: #475569; font-size: 12px; line-height: 1.5; }
.gestao-detail__actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; color: #64748b; font-size: 11px; }
.gestao-state { padding: 34px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff; color: #64748b; text-align: center; }
.gestao-state--error { border-color: #fecaca; color: #b42318; background: #fffafa; }

@media (max-width: 1000px) {
  .gestao-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gestao-filters { grid-template-columns: 1fr 180px; }
  .gestao-urgent-filter { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
  .gestao-pedidos__header { flex-direction: column; }
  .gestao-summary, .gestao-filters { grid-template-columns: 1fr; }
  .gestao-urgent-filter { grid-column: auto; }
}
</style>
