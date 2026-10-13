<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { solucaoService } from '../services/solucaoService'
import {
  erroSolucao, exibirQuantidade, statusSolucaoLabel, unidadesCompativeis,
  type ComponenteModeloInput, type ModeloSolucao, type ModeloSolucaoInput,
  type MovimentacaoSolucao, type PedidoSolucao, type StatusSolucao,
  type UnidadeProduto, type UnidadeSolucao,
} from '../types/solucao'
import '../styles/solucoes.css'

type Operacao = 'APROVAR' | 'ENTREGAR' | 'REJEITAR' | 'CANCELAR' | 'PROMOVER'
const router = useRouter()
const session = useSessionStore()
const aba = ref<'PEDIDOS' | 'CATALOGO'>('PEDIDOS')
const carregando = ref(true)
const executando = ref(false)
const erro = ref('')
const sucesso = ref('')
const busca = ref('')
const filtroStatus = ref<StatusSolucao | 'TODOS'>('TODOS')
const pedidos = ref<PedidoSolucao[]>([])
const modelos = ref<ModeloSolucao[]>([])
const produtos = ref<UnidadeProduto[]>([])
const expandidoId = ref<string | null>(null)
const movimentacoes = ref<Record<string, MovimentacaoSolucao[]>>({})
const carregandoMovimentos = ref(false)
const acaoAberta = ref<Operacao | null>(null)
const pedidoAlvo = ref<PedidoSolucao | null>(null)
const justificativa = ref('')
const preparada = ref<'NAO' | 'SIM' | ''>('')
const nomePromovido = ref('')
const obsAprovacao = ref('')
const mostrarInativos = ref(false)
const editorModeloAberto = ref(false)
const idModeloEdicao = ref<string | null>(null)
const erroEditor = ref('')
const salvandoModelo = ref(false)
const formModelo = ref<ModeloSolucaoInput>(novoModeloForm())

function novoModeloForm(): ModeloSolucaoInput {
  return { unidadeId: session.usuario?.unidadeId || '', nome: '', descricao: null,
    instrucoesPreparo: null, ativo: true, componentes: [{ produtoId: '', quantidade: 1, unidadeMedida: 'ML' }] }
}
const pedidosFiltrados = computed(() => pedidos.value
  .filter(p => filtroStatus.value === 'TODOS' || p.status === filtroStatus.value)
  .filter(p => !busca.value.trim() || [
    p.nomeSolucao, p.usuarioNome, p.projetoNome, p.laboratorioNome, p.status,
    ...p.itens.map(i => i.produtoNome),
  ].some(v => String(v || '').toLowerCase().includes(busca.value.trim().toLowerCase())))
  .sort((a,b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao)))
const modelosFiltrados = computed(() => modelos.value.filter(m => (mostrarInativos.value || m.ativo)
  && (!busca.value.trim() || m.nome.toLowerCase().includes(busca.value.trim().toLowerCase()))))
const resumo = computed(() => ({
  pendentes: pedidos.value.filter(p => p.status === 'PENDENTE').length,
  preparo: pedidos.value.filter(p => p.status === 'EM_PREPARACAO').length,
  entregues: pedidos.value.filter(p => p.status === 'ENTREGUE').length,
  cancelados: pedidos.value.filter(p => p.status === 'CANCELADO').length,
}))
const estados: StatusSolucao[] = ['PENDENTE','EM_PREPARACAO','ENTREGUE','REJEITADO','CANCELADO']
function produto(id: string) { return produtos.value.find(p => p.id === id) }
function corrigirUnidade(item: ComponenteModeloInput) {
  item.unidadeMedida = produto(item.produtoId)?.unidadeMedida || 'ML'
  item.quantidade = 1
}
function adicionarIngrediente() {
  formModelo.value.componentes.push({ produtoId:'', quantidade:1, unidadeMedida:'ML' })
}
function removerIngrediente(index: number) {
  if (formModelo.value.componentes.length > 1) formModelo.value.componentes.splice(index,1)
}
async function carregar() {
  erro.value = ''
  carregando.value = true
  try {
    const unidade = session.usuario?.unidadeId
    if (!unidade) throw new Error('Sua sessão não está vinculada a uma Unidade.')
    const [pedidosData, modelosData, produtosData] = await Promise.all([
      solucaoService.listarPedidos(), solucaoService.listarModelos(), solucaoService.listarProdutos(unidade),
    ])
    pedidos.value = pedidosData
    modelos.value = modelosData
    produtos.value = produtosData
  } catch(e) { erro.value = erroSolucao(e) } finally { carregando.value = false }
}
async function alternarDetalhes(p: PedidoSolucao) {
  expandidoId.value = expandidoId.value === p.id ? null : p.id
  if (expandidoId.value !== p.id) return
  carregandoMovimentos.value = true
  try { movimentacoes.value[p.id] = await solucaoService.listarMovimentacoes(p.id) }
  catch(e) { erro.value = erroSolucao(e) }
  finally { carregandoMovimentos.value = false }
}
function abrirAcao(p: PedidoSolucao, acao: Operacao) {
  pedidoAlvo.value = p
  acaoAberta.value = acao
  preparada.value = ''
  justificativa.value = ''
  obsAprovacao.value = ''
  nomePromovido.value = p.nomeSolucao || 'Nova solução'
  erro.value = ''
  sucesso.value = ''
}
function fecharAcao() {
  if (!executando.value) { acaoAberta.value = null; pedidoAlvo.value = null }
}
async function executarAcao() {
  if (!pedidoAlvo.value || !acaoAberta.value) return
  const p = pedidoAlvo.value
  erro.value = ''
  try {
    const action = acaoAberta.value
    if (action === 'APROVAR' && !session.usuario?.id) throw new Error('Usuário responsável não identificado.')
    if (action === 'REJEITAR' && !justificativa.value.trim()) throw new Error('Informe a justificativa da rejeição.')
    if (action === 'CANCELAR' && !justificativa.value.trim()) throw new Error('Informe o motivo do cancelamento.')
    if (action === 'CANCELAR' && p.status === 'EM_PREPARACAO' && !preparada.value)
      throw new Error('Confirme se a solução já foi preparada fisicamente.')
    if (action === 'PROMOVER' && !nomePromovido.value.trim()) throw new Error('Informe o nome do modelo a cadastrar.')

    executando.value = true
    if (action === 'APROVAR') {
      await solucaoService.aprovar(p.id, session.usuario!.id, p.itens, obsAprovacao.value)
    } else if (action === 'ENTREGAR') {
      await solucaoService.entregar(p.id)
    } else if (action === 'REJEITAR') {
      await solucaoService.rejeitar(p.id, justificativa.value.trim())
    } else if (action === 'CANCELAR') {
      await solucaoService.cancelar(p.id,
        p.status === 'EM_PREPARACAO' ? preparada.value === 'SIM' : null, justificativa.value.trim())
    } else {
      await solucaoService.promoverPedido(p.id, nomePromovido.value.trim())
    }
    acaoAberta.value = null
    pedidoAlvo.value = null
    sucesso.value = action === 'APROVAR' ? 'Solução aprovada. Componentes baixados do estoque e pedido em preparação.'
      : action === 'ENTREGAR' ? 'Entrega confirmada, sem nova baixa de estoque.'
      : action === 'CANCELAR' ? 'Cancelamento registrado conforme o estado físico informado.'
      : action === 'REJEITAR' ? 'Solução rejeitada.' : 'Modelo cadastrado no catálogo.'
    delete movimentacoes.value[p.id]
    await carregar()
  } catch(e) { erro.value = erroSolucao(e) } finally { executando.value = false }
}
function abrirModelo(modelo?: ModeloSolucao) {
  erroEditor.value = ''
  if (modelo) {
    idModeloEdicao.value = modelo.id
    formModelo.value = {
      unidadeId: session.usuario?.unidadeId || '',
      nome: modelo.nome, descricao: modelo.descricao, instrucoesPreparo: modelo.instrucoesPreparo,
      ativo: modelo.ativo,
      componentes: modelo.componentes.map(c => ({
        produtoId:c.produtoId, quantidade:c.quantidade, unidadeMedida:c.unidadeMedida,
      })),
    }
  } else {
    idModeloEdicao.value = null
    formModelo.value = novoModeloForm()
  }
  editorModeloAberto.value = true
}
function validarModelo() {
  const f = formModelo.value
  if (!f.nome.trim()) throw new Error('Informe o nome do modelo.')
  if (!f.componentes.length) throw new Error('Inclua ao menos um Produto na composição.')
  const usados = new Set<string>()
  for(const c of f.componentes) {
    const p = produto(c.produtoId)
    if (!p) throw new Error('Selecione um Produto válido para cada componente.')
    if (usados.has(c.produtoId)) throw new Error('Um Produto não pode aparecer duas vezes no mesmo modelo.')
    usados.add(c.produtoId)
    if (!Number.isFinite(c.quantidade) || c.quantidade <= 0) throw new Error('Informe uma quantidade positiva.')
    if (!unidadesCompativeis(p.unidadeMedida).includes(c.unidadeMedida))
      throw new Error(`Unidade incompatível com ${p.nome}.`)
  }
}
async function salvarModelo() {
  erroEditor.value = ''
  try {
    validarModelo()
    salvandoModelo.value = true
    const payload = { ...formModelo.value, nome: formModelo.value.nome.trim() }
    if (idModeloEdicao.value) await solucaoService.atualizarModelo(idModeloEdicao.value, payload)
    else await solucaoService.cadastrarModelo(payload)
    editorModeloAberto.value = false
    sucesso.value = idModeloEdicao.value ? 'Modelo atualizado.' : 'Modelo adicionado ao catálogo.'
    await carregar()
    aba.value = 'CATALOGO'
  } catch(e) { erroEditor.value = erroSolucao(e) } finally { salvandoModelo.value = false }
}
async function inativarModelo(m: ModeloSolucao) {
  if (!window.confirm(`Inativar o modelo "${m.nome}"? Solicitações antigas serão preservadas.`)) return
  erro.value = ''
  try {
    await solucaoService.inativarModelo(m.id)
    sucesso.value = 'Modelo inativado.'
    await carregar()
  } catch(e) { erro.value = erroSolucao(e) }
}
onMounted(() => { void carregar() })
</script>

<template>
  <section class="sol-page">
    <header class="sol-header">
      <div>
        <div class="sol-breadcrumb">Operação / Gestão de soluções</div>
        <h1>Gestão de soluções</h1>
        <p>Acompanhe os pedidos de preparação, aprove a composição e confirme a entrega. Administre também os modelos reutilizáveis da Unidade.</p>
      </div>
      <div class="sol-actions">
        <button class="sol-btn" :disabled="carregando" @click="carregar">Atualizar</button>
        <button class="sol-btn sol-btn--primary" @click="router.push('/solucoes/nova?nova=1')">+ Nova solicitação</button>
      </div>
    </header>
    <div class="sol-summary">
      <div class="sol-stat"><span class="sol-muted">Pendentes</span><strong>{{ resumo.pendentes }}</strong></div>
      <div class="sol-stat"><span class="sol-muted">Em preparação</span><strong>{{ resumo.preparo }}</strong></div>
      <div class="sol-stat"><span class="sol-muted">Entregues</span><strong>{{ resumo.entregues }}</strong></div>
      <div class="sol-stat"><span class="sol-muted">Canceladas</span><strong>{{ resumo.cancelados }}</strong></div>
    </div>
    <div v-if="erro" class="sol-error" role="alert" style="margin-bottom:15px">{{ erro }}</div>
    <div v-if="sucesso" class="sol-success" role="status" style="margin-bottom:15px">{{ sucesso }}</div>
    <div class="sol-toolbar">
      <div class="sol-segment">
        <button :class="{ active: aba === 'PEDIDOS' }" @click="aba = 'PEDIDOS'; busca = ''">Solicitações</button>
        <button :class="{ active: aba === 'CATALOGO' }" @click="aba = 'CATALOGO'; busca = ''">Catálogo de soluções</button>
      </div>
      <input v-model="busca" type="search" :placeholder="aba === 'PEDIDOS' ? 'Buscar solução, solicitante, laboratório ou produto...' : 'Buscar modelo no catálogo...'" aria-label="Busca" />
    </div>

    <template v-if="aba === 'PEDIDOS'">
      <div class="sol-toolbar"><div class="sol-actions">
        <button class="sol-btn" :class="{ 'sol-btn--light': filtroStatus === 'TODOS' }" @click="filtroStatus = 'TODOS'">Todas</button>
        <button v-for="s in estados" :key="s" class="sol-btn" :class="{ 'sol-btn--light': filtroStatus === s }" @click="filtroStatus = s">{{ statusSolucaoLabel[s] }}</button>
      </div><span class="sol-muted">{{ pedidosFiltrados.length }} solicitação(ões)</span></div>
      <div v-if="carregando" class="sol-empty">Carregando soluções...</div>
      <div v-else-if="pedidosFiltrados.length === 0" class="sol-empty">Nenhuma solicitação de Solução encontrada.</div>
      <div v-else class="sol-stack">
        <article v-for="p in pedidosFiltrados" :key="p.id" class="sol-card">
          <div class="sol-list-head">
            <div>
              <div class="sol-actions" style="margin-bottom:7px"><h3>{{ p.nomeSolucao || 'Solução' }}</h3><span class="sol-pill" :class="'sol-pill--' + p.status">{{ statusSolucaoLabel[p.status] }}</span></div>
              <p class="sol-muted" style="margin:0">{{ p.usuarioNome }} · {{ p.projetoNome || 'Sem projeto' }} · {{ p.laboratorioNome }}</p>
              <p class="sol-muted" style="margin:5px 0">{{ new Date(p.dataSolicitacao).toLocaleString('pt-BR') }} · {{ p.itens.length }} componente(s)</p>
            </div>
            <div class="sol-actions">
              <button v-if="p.status === 'PENDENTE'" class="sol-btn sol-btn--primary" @click="abrirAcao(p,'APROVAR')">Analisar e aprovar</button>
              <button v-if="p.status === 'PENDENTE'" class="sol-btn" @click="abrirAcao(p,'REJEITAR')">Rejeitar</button>
              <button v-if="p.status === 'EM_PREPARACAO'" class="sol-btn sol-btn--primary" @click="abrirAcao(p,'ENTREGAR')">Confirmar entrega</button>
              <button v-if="p.status === 'PENDENTE' || p.status === 'EM_PREPARACAO'" class="sol-btn sol-btn--danger" @click="abrirAcao(p,'CANCELAR')">Cancelar</button>
              <button v-if="!p.modeloSolucaoId" class="sol-btn" @click="abrirAcao(p,'PROMOVER')">Salvar no catálogo</button>
              <button class="sol-btn" @click="alternarDetalhes(p)">{{ expandidoId === p.id ? 'Ocultar' : 'Detalhes' }}</button>
            </div>
          </div>
          <div v-if="expandidoId === p.id" class="sol-details">
            <p class="sol-muted">{{ p.observacao || 'Sem observações adicionais.' }}</p>
            <div class="sol-table-wrap">
              <table class="sol-table"><thead><tr><th>Produto</th><th>Quantidade solicitada</th><th>Aprovada (unidade canônica)</th></tr></thead>
                <tbody><tr v-for="item in p.itens" :key="item.id">
                  <td>{{ item.produtoNome }}</td>
                  <td>{{ exibirQuantidade(item.quantidadeNaUnidadeSolicitada ?? item.quantidadeSolicitada) }} {{ item.unidadeMedidaSolicitada || '' }}</td>
                  <td>{{ item.quantidadeAprovada === null ? '—' : exibirQuantidade(item.quantidadeAprovada) }}</td>
                </tr></tbody>
              </table>
            </div>
            <p v-if="p.status === 'CANCELADO'" class="sol-note" style="margin-top:10px">
              {{ p.solucaoPreparadaNoCancelamento ? 'Preparação já realizada: ingredientes consumidos, sem reversão de estoque.' : p.estoqueRevertidoNoCancelamento ? 'Não preparada: saídas revertidas ao estoque.' : 'Cancelado antes de gerar saídas.' }}
            </p>
            <h4 style="margin-bottom:6px">Movimentações vinculadas</h4>
            <div v-if="carregandoMovimentos && !movimentacoes[p.id]" class="sol-muted">Consultando movimentações...</div>
            <div v-else-if="(movimentacoes[p.id] || []).length === 0" class="sol-muted">Sem movimentações registradas para este Pedido.</div>
            <div v-else class="sol-table-wrap"><table class="sol-table">
              <thead><tr><th>Produto</th><th>Movimentação</th><th>Quantidade</th><th>Lote</th><th>Data</th></tr></thead>
              <tbody><tr v-for="m in movimentacoes[p.id]" :key="m.id"><td>{{ m.produtoNome }}</td><td>{{ m.tipoMovimentacao }}</td><td>{{ exibirQuantidade(m.quantidadeMovimentada) }}</td><td>{{ m.codigoInternoLote || m.numeroLote || '—' }}</td><td>{{ new Date(m.dataMovimentacao).toLocaleString('pt-BR') }}</td></tr></tbody>
            </table></div>
          </div>
        </article>
      </div>
    </template>

    <template v-else>
      <div class="sol-toolbar">
        <label class="sol-check"><input v-model="mostrarInativos" type="checkbox" /> Mostrar inativos</label>
        <button class="sol-btn sol-btn--primary" @click="abrirModelo()">+ Cadastrar modelo</button>
      </div>
      <div v-if="carregando" class="sol-empty">Carregando catálogo...</div>
      <div v-else-if="modelosFiltrados.length === 0" class="sol-empty">Nenhum modelo encontrado. Cadastre uma Solução padrão para disponibilizá-la aos solicitantes.</div>
      <div v-else class="sol-grid">
        <article v-for="m in modelosFiltrados" :key="m.id" class="sol-card">
          <div class="sol-list-head"><h3>{{ m.nome }}</h3><span class="sol-pill">{{ m.ativo ? 'Ativa' : 'Inativa' }}</span></div>
          <p class="sol-muted">{{ m.descricao || 'Modelo reutilizável da Unidade' }}</p>
          <ul class="sol-detail-list"><li v-for="i in m.componentes" :key="i.id"><span>{{ i.produtoNome }}</span><b>{{ exibirQuantidade(i.quantidade) }} {{ i.unidadeMedida }}</b></li></ul>
          <p v-if="m.instrucoesPreparo" class="sol-note">{{ m.instrucoesPreparo }}</p>
          <div class="sol-actions" style="margin-top:15px"><button class="sol-btn" @click="abrirModelo(m)">Editar</button><button v-if="m.ativo" class="sol-btn sol-btn--danger" @click="inativarModelo(m)">Inativar</button></div>
        </article>
      </div>
    </template>

    <div v-if="acaoAberta && pedidoAlvo" class="sol-dialog-overlay" @click.self="fecharAcao">
      <section class="sol-dialog" role="dialog" aria-modal="true" :aria-label="'Operação sobre ' + pedidoAlvo.nomeSolucao">
        <h2>{{ acaoAberta === 'APROVAR' ? 'Aprovar preparação' : acaoAberta === 'ENTREGAR' ? 'Confirmar entrega' : acaoAberta === 'CANCELAR' ? 'Cancelar solução' : acaoAberta === 'PROMOVER' ? 'Adicionar ao catálogo' : 'Rejeitar solicitação' }}</h2>
        <p class="sol-muted">{{ pedidoAlvo.nomeSolucao }} — {{ pedidoAlvo.usuarioNome }}</p>
        <div v-if="erro" class="sol-error" role="alert" style="margin:12px 0">{{ erro }}</div>
        <template v-if="acaoAberta === 'APROVAR'">
          <div class="sol-note">A aprovação dá baixa em todos os componentes do estoque e muda o estado para <b>EM PREPARAÇÃO</b>. Para alterar a composição, rejeite a solicitação e peça uma nova receita.</div>
          <ul class="sol-detail-list"><li v-for="item in pedidoAlvo.itens" :key="item.id"><span>{{ item.produtoNome }}</span><b>{{ exibirQuantidade(item.quantidadeNaUnidadeSolicitada ?? item.quantidadeSolicitada) }} {{ item.unidadeMedidaSolicitada || '' }}</b></li></ul>
          <label class="sol-field"><span>Observação da aprovação</span><textarea v-model="obsAprovacao" placeholder="Opcional" /></label>
        </template>
        <template v-if="acaoAberta === 'ENTREGAR'">
          <p class="sol-note">Confirme apenas após o recebimento real da Solução pelo solicitante. O estoque já foi descontado na aprovação e não sofrerá segunda baixa.</p>
        </template>
        <template v-if="acaoAberta === 'CANCELAR'">
          <p v-if="pedidoAlvo.status === 'EM_PREPARACAO'" class="sol-note">A Solução já foi preparada fisicamente? Esta resposta define se os componentes poderão ser restaurados ao estoque ou permanecerão consumidos.</p>
          <div v-if="pedidoAlvo.status === 'EM_PREPARACAO'" class="sol-form-row" style="margin:12px 0">
            <label class="sol-check"><input v-model="preparada" type="radio" value="NAO" name="preparo-cancelamento" /> Não, não foi preparada — reverter componentes</label>
            <label class="sol-check"><input v-model="preparada" type="radio" value="SIM" name="preparo-cancelamento" /> Sim, foi preparada — manter consumo</label>
          </div>
          <p v-else class="sol-note">Este Pedido ainda está pendente: não houve baixa de Produtos a reverter.</p>
          <label class="sol-field"><span>Justificativa *</span><textarea v-model="justificativa" placeholder="Motivo do cancelamento" /></label>
        </template>
        <template v-if="acaoAberta === 'REJEITAR'"><label class="sol-field"><span>Justificativa *</span><textarea v-model="justificativa" placeholder="Explique a rejeição ao solicitante" /></label></template>
        <template v-if="acaoAberta === 'PROMOVER'">
          <p class="sol-note">A composição será copiada para o catálogo da Unidade. O Pedido original não será alterado, e não haverá movimentação de estoque.</p>
          <label class="sol-field"><span>Nome do modelo *</span><input v-model="nomePromovido" maxlength="150" /></label>
        </template>
        <div class="sol-dialog-footer"><button class="sol-btn" :disabled="executando" @click="fecharAcao">Voltar</button><button class="sol-btn" :class="acaoAberta === 'CANCELAR' || acaoAberta === 'REJEITAR' ? 'sol-btn--danger' : 'sol-btn--primary'" :disabled="executando" @click="executarAcao">{{ executando ? 'Processando...' : 'Confirmar' }}</button></div>
      </section>
    </div>

    <div v-if="editorModeloAberto" class="sol-dialog-overlay" @click.self="!salvandoModelo && (editorModeloAberto = false)">
      <section class="sol-dialog" role="dialog" aria-modal="true" aria-label="Editor de modelo de solução">
        <h2>{{ idModeloEdicao ? 'Editar solução padrão' : 'Nova solução padrão' }}</h2>
        <p class="sol-muted">Somente modelos do catálogo são reutilizáveis. Solicitações personalizadas permanecem particulares aos respectivos Pedidos.</p>
        <div v-if="erroEditor" class="sol-error" role="alert" style="margin-bottom:12px">{{ erroEditor }}</div>
        <div class="sol-form">
          <label class="sol-field"><span>Nome *</span><input v-model="formModelo.nome" maxlength="150" placeholder="Ex.: Solução tampão" /></label>
          <label class="sol-field"><span>Descrição</span><textarea v-model="formModelo.descricao" maxlength="1000" /></label>
          <label class="sol-field"><span>Orientações para preparo</span><textarea v-model="formModelo.instrucoesPreparo" maxlength="2000" /></label>
          <div class="sol-list-head"><h3>Componentes</h3><button class="sol-btn sol-btn--light" @click="adicionarIngrediente">+ Produto</button></div>
          <div v-for="(item,i) in formModelo.componentes" :key="i" class="sol-ingredient">
            <label class="sol-field"><span>Produto {{ i + 1 }}</span>
              <select v-model="item.produtoId" @change="corrigirUnidade(item)">
                <option value="">Selecione</option>
                <option v-for="p in produtos" :key="p.id" :value="p.id" :disabled="formModelo.componentes.some((other,j) => j !== i && other.produtoId === p.id)">{{ p.nome }}</option>
              </select>
            </label>
            <label class="sol-field"><span>Quantidade</span><input v-model.number="item.quantidade" type="number" min="0.000001" step="any" /></label>
            <label class="sol-field"><span>Unidade</span><select v-model="item.unidadeMedida"><option v-for="u in unidadesCompativeis(produto(item.produtoId)?.unidadeMedida)" :key="u" :value="u">{{ u }}</option></select></label>
            <button class="sol-btn" :disabled="formModelo.componentes.length === 1" @click="removerIngrediente(i)">Retirar</button>
          </div>
          <label class="sol-check"><input v-model="formModelo.ativo" type="checkbox" /> Modelo ativo no catálogo</label>
          <div class="sol-dialog-footer"><button class="sol-btn" :disabled="salvandoModelo" @click="editorModeloAberto = false">Cancelar</button><button class="sol-btn sol-btn--primary" :disabled="salvandoModelo" @click="salvarModelo">{{ salvandoModelo ? 'Salvando...' : 'Salvar modelo' }}</button></div>
        </div>
      </section>
    </div>
  </section>
</template>

