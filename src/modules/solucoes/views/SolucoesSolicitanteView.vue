<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { solucaoService } from '../services/solucaoService'
import { erroSolucao, exibirQuantidade, statusSolucaoLabel, type PedidoSolucao, type StatusSolucao } from '../types/solucao'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const pedidos = ref<PedidoSolucao[]>([])
const carregando = ref(false)
const erro = ref('')
const busca = ref('')
const status = ref<StatusSolucao | 'TODOS'>('TODOS')
const pedidoExpandidoId = ref<string | null>(null)

const criadoAgora = computed(() => route.query.criado === '1')
const pedidoAlvo = computed(() => typeof route.query.pedido === 'string' ? route.query.pedido : '')
const pedidosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')
  return pedidos.value
    .filter(p => p.usuarioId === session.usuario?.id)
    .filter(p => status.value === 'TODOS' || p.status === status.value)
    .filter(p => !termo || [
      p.nomeSolucao, p.projetoNome, p.laboratorioNome, p.atividadeOrigemNome, p.sciOrigemNome, p.status,
      p.urgente ? 'urgente' : '', p.observacao,
      ...p.itens.map(item => item.produtoNome),
    ].some(texto => String(texto || '').toLocaleLowerCase('pt-BR').includes(termo)))
    .sort((a, b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao))
})
const resumo = computed(() => {
  const meus = pedidos.value.filter(p => p.usuarioId === session.usuario?.id)
  return {
    pendentes: meus.filter(p => p.status === 'PENDENTE').length,
    preparo: meus.filter(p => p.status === 'EM_PREPARACAO').length,
    entregues: meus.filter(p => p.status === 'ENTREGUE').length,
  }
})
function aplicarStatusDaRota() {
  const valor = typeof route.query.status === 'string' ? route.query.status.toUpperCase() : ''
  const validos: StatusSolucao[] = ['PENDENTE', 'EM_PREPARACAO', 'ENTREGUE', 'REJEITADO', 'CANCELADO']
  status.value = validos.includes(valor as StatusSolucao) ? valor as StatusSolucao : 'TODOS'
}
function abrirPedidoDaRota() {
  if (!pedidoAlvo.value) return
  const pedido = pedidos.value.find(p => p.id === pedidoAlvo.value && p.usuarioId === session.usuario?.id)
  if (!pedido) return
  pedidoExpandidoId.value = pedido.id
  requestAnimationFrame(() => {
    document.getElementById(`solucao-${pedido.id}`)?.scrollIntoView({ behavior:'smooth', block:'center' })
  })
}
async function carregarPedidos() {
  const usuarioId = session.usuario?.id
  if (!usuarioId) { erro.value = 'Sessão sem usuário identificado.'; return }
  carregando.value = true
  erro.value = ''
  try {
    pedidos.value = await solucaoService.listarMinhas(usuarioId)
    aplicarStatusDaRota()
    abrirPedidoDaRota()
  } catch (e) { erro.value = erroSolucao(e) }
  finally { carregando.value = false }
}
function formatarData(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle:'short', timeStyle:'short' }).format(new Date(valor))
}
function alternarDetalhes(id: string) { pedidoExpandidoId.value = pedidoExpandidoId.value === id ? null : id }
watch([() => route.query.status, () => route.query.pedido], () => {
  aplicarStatusDaRota()
  if (!carregando.value) abrirPedidoDaRota()
})
onMounted(carregarPedidos)
</script>

<template>
  <section class="pedidos-page minhas-solucoes-page">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">Soluções / Minhas soluções</p>
        <h1>Minhas soluções</h1>
        <p class="page-subtitle">Acompanhe suas solicitações de soluções e o status de preparação e entrega.</p>
      </div>
      <button class="primary-action" type="button" @click="router.push('/solucoes/solicitar')">
        <span>+</span> Solicitar solução
      </button>
    </header>

    <div v-if="criadoAgora" class="success-banner">
      Solicitação enviada com sucesso. Ela já aparece na lista como pendente.
    </div>

    <div class="summary-grid">
      <article class="summary-card">
        <span>Pendentes</span><strong>{{ resumo.pendentes }}</strong><small>Aguardando análise</small>
      </article>
      <article class="summary-card">
        <span>Em preparação</span><strong>{{ resumo.preparo }}</strong><small>Preparação em andamento</small>
      </article>
      <article class="summary-card">
        <span>Entregues</span><strong>{{ resumo.entregues }}</strong><small>Solicitações concluídas</small>
      </article>
    </div>

    <section class="filter-surface">
      <div class="search-control">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>
        <input v-model="busca" type="search" aria-label="Buscar soluções" placeholder="Buscar por solução, produto, projeto ou observação..." />
      </div>
      <label class="status-filter">
        <span>Status</span>
        <select v-model="status">
          <option value="TODOS">Todos</option>
          <option value="PENDENTE">Pendente</option>
          <option value="EM_PREPARACAO">Em preparação</option>
          <option value="REJEITADO">Rejeitado</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </label>
    </section>

    <section class="table-surface">
      <div v-if="carregando" class="state-box">Carregando suas soluções...</div>
      <div v-else-if="erro" class="state-box state-box--error">
        <strong>Não foi possível carregar.</strong><span>{{ erro }}</span>
        <button type="button" @click="carregarPedidos">Tentar novamente</button>
      </div>
      <div v-else-if="pedidosFiltrados.length === 0" class="state-box">
        <strong>Nenhuma solução encontrada.</strong>
        <span v-if="pedidos.length === 0">Sua primeira solicitação pode ser criada pelo botão “Solicitar solução”.</span>
        <span v-else>Altere a busca ou o filtro de status.</span>
      </div>
      <div v-else class="table-scroll">
        <table>
          <thead><tr>
            <th>Data</th><th>Solução</th><th>Componentes</th><th>Status</th><th>Laboratório</th><th class="actions-column">Detalhes</th>
          </tr></thead>
          <tbody>
            <template v-for="pedido in pedidosFiltrados" :key="pedido.id">
              <tr :id="`solucao-${pedido.id}`" class="order-row"
                :class="{ 'order-row--expanded':pedidoExpandidoId === pedido.id, 'order-row--target':pedidoAlvo === pedido.id }">
                <td>
                  <strong class="table-primary">{{ formatarData(pedido.dataSolicitacao) }}</strong>
                  <span class="table-secondary">{{ pedido.id.slice(0,8).toUpperCase() }}</span>
                </td>
                <td class="products-column">
                  <div class="product-summary">
                    <strong>{{ pedido.nomeSolucao || 'Solução' }}</strong>
                    <span v-if="pedido.modeloSolucaoId" class="table-secondary">Padrão da cartilha</span>
                    <span v-else class="table-secondary">Fora do catálogo</span>
                    <small>Projeto: {{ pedido.projetoNome || 'Sem projeto' }}</small>
                  </div>
                </td>
                <td>
                  <strong class="table-primary">{{ pedido.itens.length }}</strong>
                  <span class="table-secondary">{{ pedido.itens.length === 1 ? 'produto' : 'produtos' }}</span>
                </td>
                <td>
                  <div class="status-cell">
                    <span class="status-chip" :class="`status-chip--${pedido.status.toLowerCase()}`">{{ statusSolucaoLabel[pedido.status] }}</span>
                    <span v-if="pedido.urgente" class="urgent-status">Pedido urgente</span>
                  </div>
                </td>
                <td>{{ pedido.laboratorioNome }}</td>
                <td class="actions-column">
                  <button type="button" class="expand-button" :class="{ 'expand-button--open':pedidoExpandidoId === pedido.id }"
                    :aria-expanded="pedidoExpandidoId === pedido.id"
                    :aria-label="pedidoExpandidoId === pedido.id ? 'Recolher detalhes da solução' : 'Expandir detalhes da solução'"
                    @click="alternarDetalhes(pedido.id)">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" /></svg>
                  </button>
                </td>
              </tr>
              <tr v-if="pedidoExpandidoId === pedido.id" class="expanded-row">
                <td colspan="6">
                  <div class="expanded-panel">
                    <div class="expanded-heading">
                      <div><span>Solução {{ pedido.id.slice(0,8).toUpperCase() }}</span><strong>Detalhes da solicitação</strong></div>
                      <span class="expanded-date">Solicitada em {{ formatarData(pedido.dataSolicitacao) }}</span>
                    </div>
                    <div class="expanded-grid">
                      <section class="expanded-section expanded-section--materials">
                        <h3>Componentes da preparação</h3>
                        <div class="material-list">
                          <div v-for="item in pedido.itens" :key="item.id" class="material-item">
                            <div><strong>{{ item.produtoNome }}</strong><span>{{ item.unidadeMedidaSolicitada || 'Unidade canônica' }}</span></div>
                            <div class="material-quantity" :class="{ 'material-quantity--approved':item.quantidadeAprovada != null }">
                              <span>{{ item.quantidadeAprovada != null ? 'Aprovado' : 'Solicitado' }}</span>
                              <strong>{{ exibirQuantidade(item.quantidadeNaUnidadeSolicitada ?? item.quantidadeSolicitada) }} {{ item.unidadeMedidaSolicitada || '' }}</strong>
                              <small v-if="item.quantidadeAprovada != null">Componente aprovado</small>
                            </div>
                          </div>
                        </div>
                      </section>
                      <section class="expanded-section">
                        <h3>Informações da solicitação</h3>
                        <dl class="info-list">
                          <div><dt>Status</dt><dd>{{ statusSolucaoLabel[pedido.status] }}</dd></div>
                          <div><dt>Tipo</dt><dd>{{ pedido.modeloSolucaoId ? 'Solução padrão' : 'Fora do catálogo' }}</dd></div>
                          <div><dt>Atividade</dt><dd>{{ pedido.atividadeOrigemNome || (pedido.atividadeOrigemId ? 'Atividade vinculada' : 'Não registrada nesta solicitação') }}</dd></div>
                          <div v-if="pedido.sciOrigemNome || pedido.sciOrigemId"><dt>SCI</dt><dd>{{ pedido.sciOrigemNome || 'Origem registrada' }}</dd></div>
                          <div><dt>Projeto</dt><dd>{{ pedido.projetoNome || 'Sem projeto' }}</dd></div>
                          <div><dt>Laboratório</dt><dd>{{ pedido.laboratorioNome }}</dd></div>
                        </dl>
                        <div v-if="pedido.urgente" class="expanded-urgency"><span class="urgent-status">Pedido urgente</span></div>
                      </section>
                      <section class="expanded-section expanded-section--observation">
                        <h3>Exigências / finalidade</h3><p>{{ pedido.observacao?.trim() || 'Nenhuma observação informada.' }}</p>
                      </section>
                      <section class="expanded-section expanded-section--instructions">
                        <h3>Cartilha / instruções de preparo</h3>
                        <p>{{ pedido.instrucoesPreparoSolucao?.trim() || 'Sem instruções registradas para esta solicitação.' }}</p>
                      </section>
                      <section v-if="pedido.status === 'CANCELADO'" class="expanded-section expanded-section--cancellation">
                        <h3>Cancelamento</h3>
                        <p>{{ pedido.solucaoPreparadaNoCancelamento ? 'Solução já preparada: os ingredientes permaneceram consumidos.' : pedido.estoqueRevertidoNoCancelamento ? 'Solução não preparada: a saída dos componentes foi revertida.' : 'Cancelada antes de ocorrer movimentação de estoque.' }}</p>
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
.minhas-solucoes-page { width: min(100%, 1260px); margin: 0 auto; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 26px; }
.breadcrumb { margin: 0 0 10px; color: var(--sgl-text-muted); font-size: 13px; }
.page-heading h1 { margin: 0; font-size:var(--sgl-font-page-title); line-height: 1.1; letter-spacing: -0.035em; }
.page-subtitle { margin: 8px 0 0; color: var(--sgl-text-muted); font-size: 14px; }

.primary-action {
  min-height:40px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 0 18px;
  border: 0;
  border-radius:6px;
  background: var(--sgl-primary);
  color: var(--sgl-surface);
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgb(26 77 161 / 15%);
}
.primary-action:hover { background: var(--sgl-primary-dark); }
.primary-action span { font-size: 22px; line-height: 1; }

.success-banner { margin-bottom: 20px; padding: 13px 16px; border: 1px solid var(--sgl-border); border-radius: 8px; background: var(--sgl-surface-interactive); color: var(--sgl-success); font-size: 13px; }
.summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
.summary-card { min-height: 116px; padding: 17px 19px; border: 1px solid var(--sgl-border); border-radius:8px; background: var(--sgl-surface); box-shadow: 0 5px 18px rgb(15 37 71 / 4%); }
.summary-card span, .summary-card small { display: block; color: var(--sgl-text-muted); }
.summary-card span { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.045em; }
.summary-card strong { display: block; margin: 7px 0 4px; font-size: 27px; }
.summary-card small { font-size: 12px; }

.filter-surface { display: grid; grid-template-columns: minmax(0, 1fr) 210px; gap: 12px; margin-bottom: 18px; padding: 14px; border: 1px solid var(--sgl-border); border-radius:8px; background: var(--sgl-surface); box-shadow: 0 5px 18px rgb(15 37 71 / 4%); }
.search-control { min-height:40px; display: flex; align-items: center; gap: 10px; padding: 0 13px; border: 1px solid var(--sgl-border-strong); border-radius: 6px; }
.search-control:focus-within { border-color: var(--sgl-primary); box-shadow: 0 0 0 3px rgb(26 77 161 / 8%); }
.search-control svg { width: 19px; height: 19px; fill: none; stroke: var(--sgl-text-muted); stroke-width: 1.8; }
.search-control input { width: 100%; border: 0; outline: 0; color: var(--sgl-text); }
.status-filter { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 9px; }
.status-filter span { color: var(--sgl-text-muted); font-size: 12px; font-weight: 700; }
.status-filter select { min-height:40px; border: 1px solid var(--sgl-border-strong); border-radius: 6px; padding: 0 10px; background: var(--sgl-surface); color: var(--sgl-text); }

.table-surface { overflow: hidden; border: 1px solid var(--sgl-border); border-radius:8px; background: var(--sgl-surface); box-shadow: 0 7px 24px rgb(15 37 71 / 5%); }
.table-scroll { overflow-x: auto; }
table { width: 100%; min-width: 980px; border-collapse: collapse; font-size: 13px; }
th, td { padding: 14px 16px; border-bottom: 1px solid var(--sgl-border); text-align: left; vertical-align: middle; }
th { color: var(--sgl-text-muted); background: var(--sgl-surface-soft); font-size: 11px; text-transform: uppercase; letter-spacing: 0.035em; }
.order-row { transition: background 160ms ease, box-shadow 160ms ease; }
.order-row:hover { background: var(--sgl-surface-soft); }
.order-row--expanded { background: var(--sgl-surface-soft); }
.order-row--target { background: var(--sgl-surface-interactive) ; box-shadow: inset 4px 0 0 var(--sgl-primary); }
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
.status-chip--pendente { background: var(--sgl-surface-interactive); color: var(--sgl-warning); }
.status-chip--aprovado { background: var(--sgl-surface-interactive); color: var(--sgl-success); }
.status-chip--rejeitado { background: var(--sgl-surface-interactive); color: var(--sgl-error); }
.status-chip--entregue { background: var(--sgl-surface-interactive); color: var(--sgl-primary); }
.status-chip--cancelado { background: var(--sgl-neutral-soft); color: var(--sgl-neutral); }
.urgent-status { border: 1px solid var(--sgl-border-strong); background: var(--sgl-surface-interactive); color: var(--sgl-error); letter-spacing: 0.025em; transition: background-color 160ms ease, border-color 160ms ease; }
.urgent-status:hover { border-color: var(--sgl-border-strong); background: var(--sgl-surface-interactive); }

.actions-column { width: 74px; text-align: center; }
.expand-button {
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border: 1px solid var(--sgl-border);
  border-radius:6px;
  background: var(--sgl-surface);
  color: var(--sgl-primary);
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}
.expand-button:hover { border-color: var(--sgl-border-strong); background: var(--sgl-surface-soft); }
.expand-button svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform 180ms ease; }
.expand-button--open { border-color: var(--sgl-border-strong); background: var(--sgl-surface-interactive); }
.expand-button--open svg { transform: rotate(180deg); }

.expanded-row > td { padding: 0; background: var(--sgl-surface-soft); }
.expanded-panel { padding: 22px 24px 24px; border-bottom: 1px solid var(--sgl-border); box-shadow: inset 0 6px 12px rgb(15 37 71 / 3%); }
.expanded-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 18px; }
.expanded-heading > div { display: flex; flex-direction: column; gap: 3px; }
.expanded-heading > div > span { color: var(--sgl-primary); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.035em; }
.expanded-heading > div > strong { font-size: 16px; }
.expanded-date { color: var(--sgl-text-muted); font-size: 11px; }

.expanded-grid { display: grid; grid-template-columns: 1.45fr 1fr; gap: 14px; }
.expanded-section { min-width: 0; padding: 16px; border: 1px solid var(--sgl-border); border-radius: 8px; background: var(--sgl-surface); }
.expanded-section h3 { margin: 0 0 12px; color: var(--sgl-text); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
.expanded-section p { margin: 9px 0 0; color: var(--sgl-text-muted); font-size: 12px; line-height: 1.55; white-space: pre-line; }
.expanded-section--materials { grid-row: span 2; }
.expanded-section--observation { align-self: stretch; }
.expanded-urgency { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--sgl-border); }

.material-list { display: flex; flex-direction: column; }
.material-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 11px 0; border-top: 1px solid var(--sgl-border); }
.material-item:first-child { border-top: 0; padding-top: 0; }
.material-item:last-child { padding-bottom: 0; }
.material-item > div:first-child { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.material-item > div:first-child strong { color: var(--sgl-text); font-size: 12px; }
.material-item > div:first-child span { color: var(--sgl-text-muted); font-size: 10px; }
.material-quantity { flex: 0 0 auto; display: grid; grid-template-columns: auto auto; align-items: baseline; justify-content: end; gap: 2px 8px; text-align: right; }
.material-quantity span { color: var(--sgl-text-muted); font-size: 9px; text-transform: uppercase; }
.material-quantity--approved > span {
  align-self: baseline;
  color: var(--sgl-success);
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.045em;
}
.material-quantity strong { font-size: 13px; }
.material-quantity small { grid-column: 1 / -1; color: var(--sgl-success); font-size: 9px; }

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

.status-chip--em_preparacao { background:var(--sgl-surface-interactive); color:var(--sgl-primary); }
.expanded-section--instructions { grid-column:1 / -1; }
.expanded-section--instructions p { white-space:pre-wrap; }
.expanded-section--cancellation { grid-column:1 / -1; }
.minhas-solucoes-page .summary-card,
.minhas-solucoes-page .filter-surface,
.minhas-solucoes-page .table-surface,
.minhas-solucoes-page .expanded-section,
.minhas-solucoes-page .expand-button { background:var(--sgl-surface); border-color:var(--sgl-border); }
.minhas-solucoes-page .expanded-row > td,
.minhas-solucoes-page .expanded-panel,
.minhas-solucoes-page .order-row--expanded { background:var(--sgl-surface-soft); }
.minhas-solucoes-page .search-control,
.minhas-solucoes-page .status-filter select { background:var(--sgl-surface-elevated); color:var(--sgl-text); border-color:var(--sgl-border-strong); }
.minhas-solucoes-page .search-control input { background:transparent; }
.minhas-solucoes-page th { color:var(--sgl-text-muted); background:var(--sgl-surface-soft); }
.minhas-solucoes-page .expanded-section h3,
.minhas-solucoes-page .expanded-section p { color:var(--sgl-text); }
.minhas-solucoes-page td,.minhas-solucoes-page .expanded-section { border-color:var(--sgl-border); }
.minhas-solucoes-page .primary-action { box-shadow:none; }
@media(max-width:760px){.minhas-solucoes-page .expanded-section--instructions,.minhas-solucoes-page .expanded-section--cancellation{grid-column:auto;}}
.minhas-solucoes-page .material-quantity > strong {font-size:14px;line-height:1.3;letter-spacing:0;font-weight:700}
.minhas-solucoes-page .material-quantity > span {font-size:11px}
</style>
