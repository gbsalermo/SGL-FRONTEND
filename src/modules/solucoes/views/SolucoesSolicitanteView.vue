<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { solucaoService } from '../services/solucaoService'
import {
  erroSolucao, exibirQuantidade, statusSolucaoLabel, unidadesCompativeis,
  type ComponenteModeloInput, type ModeloSolucao, type PedidoSolucao,
  type ProjetoSolucao, type UnidadeProduto, type UnidadeSolucao,
} from '../types/solucao'
import '../styles/solucoes.css'

interface ComponenteForm {
  produtoId: string
  quantidade: number | null
  unidadeMedida: UnidadeSolucao | ''
}

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const carregando = ref(true)
const enviando = ref(false)
const erro = ref('')
const aviso = ref('')
const busca = ref('')
const exibirFormulario = ref(route.query.nova === '1')
const origem = ref<'PADRAO' | 'PERSONALIZADA'>('PADRAO')
const modelos = ref<ModeloSolucao[]>([])
const projetos = ref<ProjetoSolucao[]>([])
const produtos = ref<UnidadeProduto[]>([])
const pedidos = ref<PedidoSolucao[]>([])
const expandidoId = ref<string | null>(null)
const projetoId = ref('')
const modeloId = ref('')
const nomeSolucao = ref('')
const observacao = ref('')
const urgente = ref(false)
const ingredientes = ref<ComponenteForm[]>([{ produtoId: '', quantidade: 1, unidadeMedida: '' }])

const modeloSelecionado = computed(() => modelos.value.find(x => x.id === modeloId.value))
const meusPedidos = computed(() => pedidos.value
  .filter(p => p.usuarioId === session.usuario?.id)
  .sort((a, b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao)))
const pedidosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')
  return meusPedidos.value.filter(p => !termo || [
    p.nomeSolucao, p.projetoNome, p.laboratorioNome, p.status,
    ...p.itens.map(item => item.produtoNome),
  ].some(valor => String(valor || '').toLocaleLowerCase('pt-BR').includes(termo)))
})
const podeAdicionar = computed(() =>
  ingredientes.value.length < produtos.value.length && ingredientes.value.every(i => Boolean(i.produtoId)))
const resumo = computed(() => ({
  pendentes: meusPedidos.value.filter(p => p.status === 'PENDENTE').length,
  preparo: meusPedidos.value.filter(p => p.status === 'EM_PREPARACAO').length,
  entregues: meusPedidos.value.filter(p => p.status === 'ENTREGUE').length,
}))
const produtosDisponiveis = computed(() => produtos.value.filter(p => p.quantidadeAtual > 0))

function produtoPorId(id: string) { return produtos.value.find(p => p.id === id) }
function atualizarProduto(item: ComponenteForm) {
  const p = produtoPorId(item.produtoId)
  item.unidadeMedida = p?.unidadeMedida || ''
  item.quantidade = 1
}
function adicionarComponente() {
  if (podeAdicionar.value) ingredientes.value.push({ produtoId: '', quantidade: 1, unidadeMedida: '' })
}
function removerComponente(index: number) {
  if (ingredientes.value.length > 1) ingredientes.value.splice(index, 1)
}
function reiniciarFormulario() {
  projetoId.value = ''
  modeloId.value = ''
  nomeSolucao.value = ''
  observacao.value = ''
  urgente.value = false
  ingredientes.value = [{ produtoId: '', quantidade: 1, unidadeMedida: '' }]
}
async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const laboratorio = session.usuario?.laboratorioId
    const unidade = session.usuario?.unidadeId
    if (!laboratorio || !unidade) throw new Error('Seu usuário precisa possuir laboratório e Unidade para solicitar Soluções.')
    const [catalogo, projetosData, produtosData, pedidosData] = await Promise.all([
      solucaoService.listarModelos(true),
      solucaoService.listarProjetosPorLaboratorio(laboratorio),
      solucaoService.listarProdutos(unidade),
      solucaoService.listarMinhas(session.usuario!.id),
    ])
    modelos.value = catalogo
    projetos.value = projetosData
    produtos.value = produtosData
    pedidos.value = pedidosData
    if (catalogo.length === 0) origem.value = 'PERSONALIZADA'
  } catch (e) { erro.value = erroSolucao(e) } finally { carregando.value = false }
}
function validar() {
  if (!session.usuario?.id || !session.usuario.laboratorioId) throw new Error('Sessão sem usuário ou laboratório.')
  if (!projetoId.value) throw new Error('Selecione o projeto ao qual a Solução será vinculada.')
  if (origem.value === 'PADRAO') {
    if (!modeloId.value || !modeloSelecionado.value) throw new Error('Selecione um modelo de Solução.')
    if (modeloSelecionado.value.componentes.length === 0) throw new Error('O modelo não possui componentes.')
    return
  }
  if (!nomeSolucao.value.trim()) throw new Error('Informe o nome da Solução personalizada.')
  if (!ingredientes.value.length) throw new Error('Informe pelo menos um Produto.')
  const selecionados = new Set<string>()
  for (const item of ingredientes.value) {
    const produto = produtoPorId(item.produtoId)
    if (!produto || !item.unidadeMedida) throw new Error('Selecione o Produto e sua unidade de medida.')
    if (selecionados.has(produto.id)) throw new Error('Um mesmo Produto não pode aparecer duas vezes na Solução.')
    selecionados.add(produto.id)
    if (!Number.isFinite(item.quantidade) || Number(item.quantidade) <= 0)
      throw new Error(`Informe uma quantidade positiva para ${produto.nome}.`)
    if (!unidadesCompativeis(produto.unidadeMedida).includes(item.unidadeMedida as UnidadeSolucao))
      throw new Error(`Unidade incompatível para ${produto.nome}.`)
  }
}
async function solicitar() {
  erro.value = ''
  aviso.value = ''
  try {
    validar()
    enviando.value = true
    const personalizadas: ComponenteModeloInput[] = ingredientes.value.map(i => ({
      produtoId: i.produtoId,
      quantidade: Number(i.quantidade),
      unidadeMedida: i.unidadeMedida as UnidadeSolucao,
    }))
    const criado = await solucaoService.solicitar({
      tipo: 'SOLUCAO',
      usuarioId: session.usuario!.id,
      laboratorioId: session.usuario!.laboratorioId!,
      projetoId: projetoId.value,
      nomeSolucao: origem.value === 'PERSONALIZADA' ? nomeSolucao.value.trim() : undefined,
      modeloSolucaoId: origem.value === 'PADRAO' ? modeloId.value : undefined,
      urgente: urgente.value,
      observacao: observacao.value.trim() || null,
      motivoUrgencia: null,
      arquivoDocumento: null,
      itens: origem.value === 'PADRAO' ? [] : personalizadas,
    })
    await carregar()
    exibirFormulario.value = false
    reiniciarFormulario()
    expandidoId.value = criado.id
    aviso.value = 'Solicitação registrada. A Solução está pendente de análise do gestor.'
    void router.replace({ path: route.path })
  } catch (e) { erro.value = erroSolucao(e) } finally { enviando.value = false }
}
watch(origem, () => { erro.value = ''; modeloId.value = ''; ingredientes.value = [{ produtoId: '', quantidade: 1, unidadeMedida: '' }] })
onMounted(() => { void carregar() })
</script>

<template>
  <section class="sol-page">
    <header class="sol-header">
      <div>
        <div class="sol-breadcrumb">Operação / Soluções</div>
        <h1>Minhas soluções</h1>
        <p>Solicite uma preparação composta de vários produtos, a partir do catálogo ou de uma composição personalizada. Você receberá uma única solução preparada.</p>
      </div>
      <div class="sol-actions">
        <button class="sol-btn" type="button" :disabled="carregando" @click="carregar">Atualizar</button>
        <button class="sol-btn sol-btn--primary" type="button" @click="exibirFormulario = !exibirFormulario; erro = ''">
          {{ exibirFormulario ? 'Fechar formulário' : '+ Solicitar solução' }}
        </button>
      </div>
    </header>

    <div class="sol-summary">
      <div class="sol-stat"><span class="sol-muted">Pendentes</span><strong>{{ resumo.pendentes }}</strong></div>
      <div class="sol-stat"><span class="sol-muted">Em preparação</span><strong>{{ resumo.preparo }}</strong></div>
      <div class="sol-stat"><span class="sol-muted">Entregues</span><strong>{{ resumo.entregues }}</strong></div>
    </div>
    <p v-if="erro" class="sol-error" role="alert">{{ erro }}</p>
    <p v-if="aviso" class="sol-success" role="status">{{ aviso }}</p>

    <div v-if="exibirFormulario" class="sol-card" style="margin-bottom:20px">
      <h2>Nova solicitação de Solução</h2>
      <div class="sol-form">
        <div class="sol-note">Todos os componentes serão vinculados ao mesmo Pedido. A aprovação reservará/baixará os Produtos no estoque, e a entrega será confirmada somente ao receber a Solução.</div>
        <div class="sol-form-row">
          <label class="sol-field"><span>Projeto responsável *</span>
            <select v-model="projetoId" :disabled="carregando" required>
              <option value="">Selecione o Projeto</option>
              <option v-for="p in projetos" :key="p.id" :value="p.id">{{ p.nome }}</option>
            </select>
          </label>
          <label class="sol-field"><span>Laboratório</span>
            <input :value="session.usuario?.laboratorioNome || 'Não vinculado'" disabled />
          </label>
        </div>
        <div class="sol-field"><span>Tipo de composição</span>
          <div class="sol-segment" role="group" aria-label="Origem da composição">
            <button type="button" :class="{ active: origem === 'PADRAO' }" @click="origem = 'PADRAO'">Catálogo padrão</button>
            <button type="button" :class="{ active: origem === 'PERSONALIZADA' }" @click="origem = 'PERSONALIZADA'">Personalizada</button>
          </div>
        </div>

        <template v-if="origem === 'PADRAO'">
          <label class="sol-field"><span>Solução do catálogo *</span>
            <select v-model="modeloId" :disabled="modelos.length === 0">
              <option value="">Selecione uma Solução cadastrada pelo gestor</option>
              <option v-for="m in modelos" :key="m.id" :value="m.id">{{ m.nome }}</option>
            </select>
          </label>
          <div v-if="modelos.length === 0" class="sol-note">Ainda não há soluções padrões ativas. Você pode solicitar uma composição personalizada.</div>
          <div v-if="modeloSelecionado" class="sol-card" style="background:var(--sgl-surface-soft,#f5f8fc)">
            <h3>{{ modeloSelecionado.nome }}</h3>
            <p class="sol-muted">{{ modeloSelecionado.descricao || 'Preparação cadastrada no catálogo da Unidade.' }}</p>
            <ul class="sol-detail-list">
              <li v-for="c in modeloSelecionado.componentes" :key="c.id">
                <span>{{ c.produtoNome }}</span><b>{{ exibirQuantidade(c.quantidade) }} {{ c.unidadeMedida }}</b>
              </li>
            </ul>
            <div v-if="modeloSelecionado.instrucoesPreparo" class="sol-note">{{ modeloSelecionado.instrucoesPreparo }}</div>
          </div>
        </template>
        <template v-else>
          <label class="sol-field"><span>Nome da solução *</span>
            <input v-model="nomeSolucao" maxlength="150" placeholder="Ex.: Solução tampão para projeto" required />
          </label>
          <div class="sol-list-head"><h3>Composição</h3><button class="sol-btn sol-btn--light" type="button" :disabled="!podeAdicionar" @click="adicionarComponente">+ Adicionar produto</button></div>
          <div v-if="produtosDisponiveis.length === 0" class="sol-note">Não há Produtos com estoque positivo disponíveis nesta Unidade.</div>
          <div v-for="(item, index) in ingredientes" :key="index" class="sol-ingredient">
            <label class="sol-field"><span>Produto {{ index + 1 }} *</span>
              <select v-model="item.produtoId" @change="atualizarProduto(item)">
                <option value="">Selecione</option>
                <option v-for="p in produtosDisponiveis" :key="p.id" :value="p.id" :disabled="ingredientes.some((outro, i) => i !== index && outro.produtoId === p.id)">
                  {{ p.nome }} ({{ exibirQuantidade(p.quantidadeAtual) }} {{ p.unidadeMedida }})
                </option>
              </select>
            </label>
            <label class="sol-field"><span>Quantidade *</span>
              <input v-model.number="item.quantidade" type="number" step="any" min="0.000001" placeholder="Ex.: 10" required />
            </label>
            <label class="sol-field"><span>Unidade *</span>
              <select v-model="item.unidadeMedida" :disabled="!item.produtoId">
                <option value="">Selecione</option>
                <option v-for="u in unidadesCompativeis(produtoPorId(item.produtoId)?.unidadeMedida)" :key="u" :value="u">{{ u }}</option>
              </select>
            </label>
            <button class="sol-btn" type="button" :disabled="ingredientes.length === 1" @click="removerComponente(index)">Retirar</button>
          </div>
        </template>
        <label class="sol-field"><span>Observações / finalidade</span><textarea v-model="observacao" maxlength="1500" placeholder="Descreva a finalidade da preparação ou informações importantes para a análise." /></label>
        <label class="sol-check"><input v-model="urgente" type="checkbox" /> Marcar como urgente (informativo)</label>
        <div class="sol-actions" style="justify-content:flex-end">
          <button class="sol-btn" type="button" @click="exibirFormulario = false">Cancelar edição</button>
          <button class="sol-btn sol-btn--primary" type="button" :disabled="enviando || carregando" @click="solicitar">{{ enviando ? 'Enviando...' : 'Enviar solicitação' }}</button>
        </div>
      </div>
    </div>

    <div class="sol-card">
      <div class="sol-toolbar"><h2 style="margin:0">Histórico das minhas soluções</h2><input v-model="busca" type="search" aria-label="Buscar Solução" placeholder="Buscar por nome, Projeto, Produto ou status..." /></div>
      <div v-if="carregando" class="sol-empty">Carregando solicitações...</div>
      <div v-else-if="pedidosFiltrados.length === 0" class="sol-empty">Nenhuma Solução encontrada. Faça sua primeira solicitação.</div>
      <div v-else class="sol-stack">
        <article v-for="pedido in pedidosFiltrados" :key="pedido.id" class="sol-card" style="padding:15px">
          <div class="sol-list-head">
            <div><h3>{{ pedido.nomeSolucao || 'Solução' }}</h3><span class="sol-muted">{{ pedido.projetoNome || 'Projeto não informado' }} · {{ new Date(pedido.dataSolicitacao).toLocaleString('pt-BR') }}</span></div>
            <div class="sol-actions"><span class="sol-pill" :class="'sol-pill--' + pedido.status">{{ statusSolucaoLabel[pedido.status] }}</span><button class="sol-btn" type="button" @click="expandidoId = expandidoId === pedido.id ? null : pedido.id">{{ expandidoId === pedido.id ? 'Ocultar' : 'Detalhes' }}</button></div>
          </div>
          <div v-if="expandidoId === pedido.id" class="sol-details">
            <p class="sol-muted">{{ pedido.observacao || 'Sem observações adicionais.' }}</p>
            <ul class="sol-detail-list"><li v-for="item in pedido.itens" :key="item.id"><span>{{ item.produtoNome }}</span><strong>{{ exibirQuantidade(item.quantidadeNaUnidadeSolicitada ?? item.quantidadeSolicitada) }} {{ item.unidadeMedidaSolicitada || '' }}</strong></li></ul>
            <p v-if="pedido.status === 'EM_PREPARACAO'" class="sol-note">Componentes aprovados e separados do estoque. A solução aguarda preparação e entrega.</p>
            <p v-if="pedido.status === 'CANCELADO'" class="sol-note">Cancelamento registrado. {{ pedido.solucaoPreparadaNoCancelamento ? 'A preparação já havia ocorrido; ingredientes consumidos.' : pedido.estoqueRevertidoNoCancelamento ? 'Produtos retornaram ao estoque.' : 'Sem saída de estoque a reverter.' }}</p>
            <p v-if="pedido.status === 'PENDENTE'" class="sol-note">Aguardando análise do gestor. Para solicitar cancelamento, entre em contato com a gestão do laboratório.</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

