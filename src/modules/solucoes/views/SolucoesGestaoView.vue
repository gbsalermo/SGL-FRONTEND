<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { solucaoService } from '../services/solucaoService'
import {
  erroSolucao, exibirQuantidade, statusSolucaoLabel,
  type MovimentacaoSolucao, type PedidoSolucao, type StatusSolucao,
} from '../types/solucao'
import '../styles/solucoes.css'

type Operacao = 'APROVAR' | 'ENTREGAR' | 'REJEITAR' | 'CANCELAR'
type Filtro = StatusSolucao | 'TODOS'
const session = useSessionStore()
const route = useRoute()
const carregando = ref(true)
const executando = ref(false)
const erro = ref('')
const erroAcao = ref('')
const sucesso = ref('')
const busca = ref('')
const filtroStatus = ref<Filtro>('TODOS')
const pedidos = ref<PedidoSolucao[]>([])
const expandidoId = ref<string | null>(null)
const movimentacoes = ref<Record<string, MovimentacaoSolucao[]>>({})
const carregandoMovimentos = ref<Record<string, boolean>>({})
const acaoAberta = ref<Operacao | null>(null)
const pedidoAlvo = ref<PedidoSolucao | null>(null)
const justificativa = ref('')
const preparada = ref<'NAO' | 'SIM' | ''>('')
const obsAprovacao = ref('')

const filtros: Array<{valor: Filtro; rotulo: string}> = [
  { valor: 'TODOS', rotulo: 'Todos' },
  { valor: 'PENDENTE', rotulo: 'Pendentes' },
  { valor: 'EM_PREPARACAO', rotulo: 'Em preparação' },
  { valor: 'ENTREGUE', rotulo: 'Entregues' },
  { valor: 'REJEITADO', rotulo: 'Rejeitados' },
  { valor: 'CANCELADO', rotulo: 'Cancelados' },
]
const indicadores: Array<{status: StatusSolucao; titulo: string; detalhe: string}> = [
  {status:'PENDENTE', titulo:'Pendentes', detalhe:'aguardando análise'},
  {status:'EM_PREPARACAO', titulo:'Em preparação', detalhe:'componentes já alocados'},
  {status:'ENTREGUE', titulo:'Entregues', detalhe:'recebimento confirmado'},
  {status:'REJEITADO', titulo:'Rejeitados', detalhe:'solicitações recusadas'},
  {status:'CANCELADO', titulo:'Cancelados', detalhe:'com ou sem preparo'},
]
const pedidosFiltrados = computed(() => pedidos.value
  .filter(p => filtroStatus.value === 'TODOS' || p.status === filtroStatus.value)
  .filter(p => !busca.value.trim() || [
    p.id, p.id.slice(0, 8), p.nomeSolucao, p.usuarioNome, p.projetoNome, p.laboratorioNome, p.atividadeOrigemNome, p.sciOrigemNome, p.status,
    ...p.itens.map(i => i.produtoNome),
  ].some(v => String(v || '').toLocaleLowerCase('pt-BR').includes(busca.value.trim().toLocaleLowerCase('pt-BR'))))
  .sort((a, b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao)))
function total(filtro: Filtro): number {
  return filtro === 'TODOS' ? pedidos.value.length : pedidos.value.filter(p => p.status === filtro).length
}
async function carregar() {
  carregando.value = true
  erro.value = ''
  try { pedidos.value = await solucaoService.listarPedidos() }
  catch(e) { erro.value = erroSolucao(e) }
  finally { carregando.value = false }
}
async function alternarDetalhes(p: PedidoSolucao) {
  expandidoId.value = expandidoId.value === p.id ? null : p.id
  if (expandidoId.value !== p.id || movimentacoes.value[p.id]) return
  carregandoMovimentos.value[p.id] = true
  try { movimentacoes.value[p.id] = await solucaoService.listarMovimentacoes(p.id) }
  catch(e) { erro.value = erroSolucao(e) }
  finally { carregandoMovimentos.value[p.id] = false }
}
function abrirAcao(p: PedidoSolucao, acao: Operacao) {
  pedidoAlvo.value = p
  acaoAberta.value = acao
  preparada.value = ''
  justificativa.value = ''
  obsAprovacao.value = ''
  erroAcao.value = ''
  sucesso.value = ''
}
function fecharAcao() { if (!executando.value) { acaoAberta.value = null; pedidoAlvo.value = null } }
async function executarAcao() {
  if (!pedidoAlvo.value || !acaoAberta.value) return
  const p = pedidoAlvo.value
  erroAcao.value = ''
  try {
    const action = acaoAberta.value
    if (action === 'APROVAR' && !session.usuario?.id)
      throw new Error('Usuário aprovador não identificado.')
    if ((action === 'REJEITAR' || action === 'CANCELAR') && !justificativa.value.trim())
      throw new Error('Informe a justificativa da operação.')
    if (action === 'CANCELAR' && p.status === 'EM_PREPARACAO' && !preparada.value)
      throw new Error('Confirme se a Solução já foi preparada.')
    executando.value = true
    if (action === 'APROVAR') {
      if (p.projetoSemVinculoDireto && !window.confirm(
        'ATENÇÃO: solicitante sem vínculo direto com o projeto. Confirma que está ciente e deseja aprovar a solução?',
      )) { executando.value = false; return }
      await solucaoService.aprovar(p.id, session.usuario!.id, p.itens, obsAprovacao.value)
    } else if (action === 'ENTREGAR') {
      await solucaoService.entregar(p.id)
    } else if (action === 'REJEITAR') {
      await solucaoService.rejeitar(p.id, justificativa.value.trim())
    } else {
      await solucaoService.cancelar(p.id,
        p.status === 'EM_PREPARACAO' ? preparada.value === 'SIM' : null,
        justificativa.value.trim())
    }
    // Encerrar o modal apos sucesso, mesmo com a requisicao ainda marcada como executando.
    acaoAberta.value = null
    pedidoAlvo.value = null
    sucesso.value = action === 'APROVAR'
      ? 'Solução aprovada. Componentes movimentados uma única vez; pedido em preparação.'
      : action === 'ENTREGAR' ? 'Entrega confirmada sem nova baixa no estoque.'
      : action === 'CANCELAR' ? 'Cancelamento registrado, respeitando a confirmação de preparo.'
      : 'Solicitação rejeitada.'
    delete movimentacoes.value[p.id]
    await carregar()
  } catch(e) { erroAcao.value = erroSolucao(e) }
  finally { executando.value = false }
}
async function abrirPedidoDaRota() {
  const id = typeof route.query.pedido === 'string' ? route.query.pedido : ''
  if (!id) return
  const pedido = pedidos.value.find(p => p.id === id)
  if (!pedido) return
  filtroStatus.value = 'TODOS'
  busca.value = ''
  if (expandidoId.value !== pedido.id) await alternarDetalhes(pedido)
  await nextTick()
  document.getElementById(`solucao-${pedido.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
watch(() => route.query.pedido, () => {
  if (!carregando.value) void abrirPedidoDaRota()
})
onMounted(async () => { await carregar(); await abrirPedidoDaRota() })
</script>

<template>
  <section class="residuos-gestao-page residuos-completo sol-gestao">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">OPERAÇÃO / SOLUÇÕES</p>
        <h1>Central de soluções</h1>
        <p>Analise solicitações, acompanhe preparações, confirme entregas e gerencie os cancelamentos.</p>
      </div>
      <button class="secondary-action" type="button" :disabled="carregando" @click="carregar">Atualizar dados</button>
    </header>

    <div class="metrics-grid metrics-grid--solucoes">
      <article v-for="item in indicadores" :key="item.status">
        <span>{{ item.titulo }}</span>
        <strong>{{ total(item.status) }}</strong>
        <small>{{ item.detalhe }}</small>
      </article>
    </div>

    <div v-if="sucesso" class="feedback feedback--success" role="status">{{ sucesso }}</div>
    <div v-if="erro" class="feedback feedback--error" role="alert">{{ erro }}</div>

    <section class="workspace-card">
      <div class="status-tabs" role="tablist" aria-label="Filtrar soluções por status">
        <button v-for="item in filtros" :key="item.valor" type="button" role="tab"
          :aria-selected="filtroStatus === item.valor"
          :class="{ active: filtroStatus === item.valor }" @click="filtroStatus = item.valor">
          {{ item.rotulo }} <small>{{ total(item.valor) }}</small>
        </button>
      </div>
      <div class="toolbar">
        <label>
          <span>Busca</span>
          <input v-model="busca" type="search" placeholder="Código, solução, solicitante, laboratório, projeto ou produto..." />
        </label>
        <div class="toolbar-note">{{ pedidosFiltrados.length }} registro(s) exibido(s)</div>
      </div>

      <div v-if="carregando" class="state-box">Carregando solicitações...</div>
      <div v-else-if="pedidosFiltrados.length === 0" class="state-box">Nenhuma solicitação de Solução encontrada neste recorte.</div>
      <div v-else class="table-wrap">
        <table class="sol-table--records">
          <thead><tr><th>Status</th><th>Solução / Solicitante</th><th>Laboratório / Projeto</th><th>Componentes</th><th>Solicitação</th><th>Ações</th></tr></thead>
          <tbody v-for="p in pedidosFiltrados" :key="p.id">
            <tr :id="`solucao-${p.id}`" class="solution-row">
              <td><span class="sol-status" :data-status="p.status">{{ statusSolucaoLabel[p.status] }}</span></td>
              <td><button type="button" class="solution-expand" :aria-expanded="expandidoId === p.id" @click="alternarDetalhes(p)"><strong>{{ p.nomeSolucao || 'Solução' }}</strong><small>Código {{ p.id.slice(0, 8).toUpperCase() }}</small><small>{{ p.usuarioNome }}</small></button></td>
              <td>{{ p.laboratorioNome }}<small>{{ p.projetoNome || 'Sem Projeto' }}</small></td>
              <td>{{ p.itens.length }} produto(s)</td>
              <td>{{ new Date(p.dataSolicitacao).toLocaleDateString('pt-BR') }}</td>
              <td class="actions-column">
                <button type="button" class="sol-expand-button" :class="{ 'sol-expand-button--open': expandidoId === p.id }"
                  :aria-expanded="expandidoId === p.id" :aria-label="expandidoId === p.id ? 'Recolher detalhes da solução' : 'Expandir detalhes da solução'"
                  @click="alternarDetalhes(p)">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" /></svg>
                </button>
              </td>
            </tr>
            <tr v-if="expandidoId === p.id" class="sol-expanded-row">
              <td colspan="6">
                <div class="sol-details">
                  <div class="sol-detail-heading"><div><h3>{{ p.nomeSolucao }}</h3><p class="sol-muted">Solução {{ p.id.slice(0, 8).toUpperCase() }} · {{ p.usuarioNome }} · {{ p.laboratorioNome }}</p></div>
                    <span class="sol-status" :data-status="p.status">{{ statusSolucaoLabel[p.status] }}</span>
                  </div>
                  <div v-if="p.atividadeOrigemNome || p.sciOrigemNome" class="sol-request-context">
                    <strong>Contexto operacional registrado no pedido</strong>
                    <p v-if="p.atividadeOrigemNome">Atividade: {{ p.atividadeOrigemNome }}</p>
                    <p v-if="p.sciOrigemNome">SCI: {{ p.sciOrigemNome }}</p>
                    <p>Projeto: {{ p.projetoNome || 'Sem projeto' }} · Laboratório: {{ p.laboratorioNome }}</p>
                     <p v-if="p.projetoSemVinculoDireto" role="alert" class="warning-note">Atenção: solicitante sem vínculo direto com o projeto. Confira o contexto antes de aprovar.</p>
                  </div>
                  <div class="sol-request-context"><strong>Finalidade e exigências do solicitante</strong><p>{{ p.observacao || 'Não foram informadas exigências adicionais.' }}</p></div>
                  <div class="sol-table-wrap"><table class="sol-table">
                    <thead><tr><th>Componente</th><th>Quantidade necessária</th></tr></thead>
                    <tbody><tr v-for="item in p.itens" :key="item.id">
                      <td>{{ item.produtoNome }}</td>
                      <td>{{ exibirQuantidade(item.quantidadeNaUnidadeSolicitada ?? item.quantidadeSolicitada) }} {{ item.unidadeMedidaSolicitada || '' }}</td>
                    </tr></tbody>
                  </table></div>
                  <div v-if="p.status === 'CANCELADO'" class="sol-note">
                    {{ p.solucaoPreparadaNoCancelamento ? 'Preparação realizada: os ingredientes permanecem consumidos.' : p.estoqueRevertidoNoCancelamento ? 'Preparação não realizada: componentes retornaram ao estoque.' : 'Cancelamento sem saída de estoque.' }}
                  </div>
                  <h3>Cartilha de preparo</h3><p class="sol-note">{{ p.instrucoesPreparoSolucao || 'Sem instruções de preparo registradas neste pedido.' }}</p>
                  <section v-if="p.status === 'PENDENTE' || p.status === 'EM_PREPARACAO'" class="sol-detail-actions">
                    <div><h3>Ações da solução</h3><p class="sol-muted">Confira a composição e a cartilha antes de realizar a operação.</p></div>
                    <div class="sol-detail-buttons">
                      <button v-if="p.status === 'PENDENTE'" class="analysis-action" type="button" @click="abrirAcao(p,'APROVAR')">Aprovar preparação</button>
                      <button v-if="p.status === 'EM_PREPARACAO'" class="primary-action" type="button" @click="abrirAcao(p,'ENTREGAR')">Confirmar entrega</button>
                      <button v-if="p.status === 'PENDENTE'" class="secondary-action" type="button" @click="abrirAcao(p,'REJEITAR')">Rejeitar</button>
                      <button v-if="p.status === 'EM_PREPARACAO'" class="admin-cancel-action" type="button" @click="abrirAcao(p,'CANCELAR')">Cancelar preparação</button>
                    </div>
                  </section>
                  <h3>Movimentações vinculadas</h3>
                  <div v-if="carregandoMovimentos[p.id]" class="sol-muted">Carregando movimentações...</div>
                  <div v-else-if="!(movimentacoes[p.id] || []).length" class="sol-muted">Nenhuma movimentação registrada neste Pedido.</div>
                  <table v-else class="sol-table">
                    <thead><tr><th>Produto</th><th>Tipo</th><th>Quantidade</th><th>Lote</th><th>Data</th></tr></thead>
                    <tbody><tr v-for="m in movimentacoes[p.id]" :key="m.id">
                      <td>{{ m.produtoNome }}</td><td>{{ m.tipoMovimentacao }}</td><td>{{ exibirQuantidade(m.quantidadeMovimentada) }}</td><td>{{ m.codigoInternoLote || m.numeroLote || '—' }}</td><td>{{ new Date(m.dataMovimentacao).toLocaleString('pt-BR') }}</td>
                    </tr></tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="acaoAberta && pedidoAlvo" class="modal-backdrop" @click.self="fecharAcao">
      <section class="modal-card" role="dialog" aria-modal="true" :aria-label="'Operação sobre ' + pedidoAlvo.nomeSolucao">
        <header><div><span>GESTÃO DE SOLUÇÕES</span><h2>{{ acaoAberta === 'APROVAR' ? 'Aprovar preparação' : acaoAberta === 'ENTREGAR' ? 'Confirmar entrega' : acaoAberta === 'CANCELAR' ? 'Cancelar solução' : 'Rejeitar solicitação' }}</h2></div>
          <button type="button" aria-label="Fechar" :disabled="executando" @click="fecharAcao">×</button>
        </header>
        <div class="modal-content">
        <p class="sol-muted">{{ pedidoAlvo.nomeSolucao }} — {{ pedidoAlvo.usuarioNome }}</p>
        <div v-if="erroAcao" class="sol-error" role="alert">{{ erroAcao }}</div>
        <template v-if="acaoAberta === 'APROVAR'">
          <div class="sol-note">A aprovação debita todos os componentes do estoque e altera o pedido para <b>Em preparação</b>. Para modificar a composição, rejeite a solicitação e peça uma nova receita.</div>
          <ul class="sol-detail-list"><li v-for="item in pedidoAlvo.itens" :key="item.id">
            <span>{{ item.produtoNome }}</span><b>{{ exibirQuantidade(item.quantidadeNaUnidadeSolicitada ?? item.quantidadeSolicitada) }} {{ item.unidadeMedidaSolicitada || '' }}</b>
          </li></ul>
          <label class="sol-field"><span>Observação da aprovação</span><textarea v-model="obsAprovacao" placeholder="Opcional" /></label>
        </template>
        <p v-if="acaoAberta === 'ENTREGAR'" class="sol-note">Confirme somente após o recebimento real. O estoque já foi debitado na aprovação e não sofrerá uma segunda baixa.</p>
        <template v-if="acaoAberta === 'CANCELAR'">
          <p v-if="pedidoAlvo.status === 'EM_PREPARACAO'" class="sol-note">A Solução já foi preparada fisicamente? Essa confirmação define a reversão dos componentes.</p>
          <div v-if="pedidoAlvo.status === 'EM_PREPARACAO'" class="sol-form sol-preparo-opcoes">
            <label class="sol-check"><input v-model="preparada" name="preparo-cancelamento" type="radio" value="NAO" /> Não, não foi preparada — reverter componentes</label>
            <label class="sol-check"><input v-model="preparada" name="preparo-cancelamento" type="radio" value="SIM" /> Sim, foi preparada — manter consumo</label>
          </div>
          <p v-else class="sol-note">Este Pedido está pendente, sem baixa de estoque a reverter.</p>
          <label class="sol-field"><span>Justificativa *</span><textarea v-model="justificativa" placeholder="Motivo do cancelamento" /></label>
        </template>
        <label v-if="acaoAberta === 'REJEITAR'" class="sol-field"><span>Justificativa *</span><textarea v-model="justificativa" placeholder="Explique a rejeição" /></label>
        </div>
        <footer>
          <button class="secondary-action" type="button" :disabled="executando" @click="fecharAcao">Voltar</button>
          <button :class="acaoAberta === 'CANCELAR' || acaoAberta === 'REJEITAR' ? 'admin-cancel-action' : 'primary-action'" type="button" :disabled="executando" @click="executarAcao">{{ executando ? 'Processando...' : acaoAberta === 'APROVAR' ? 'Aprovar solução' : acaoAberta === 'ENTREGAR' ? 'Confirmar entrega' : acaoAberta === 'CANCELAR' ? 'Cancelar solução' : 'Rejeitar solicitação' }}</button>
        </footer>
      </section>
    </div>
  </section>
</template>

