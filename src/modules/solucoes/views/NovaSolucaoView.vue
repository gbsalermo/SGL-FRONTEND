<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { SglBreadcrumb, SglButton } from '@/components/common'
import { solucaoService } from '../services/solucaoService'
import {
  erroSolucao, exibirQuantidade, unidadesCompativeis,
  type ComponenteModeloInput, type ModeloSolucao,
  type ProjetoSolucao, type UnidadeProduto, type UnidadeSolucao,
} from '../types/solucao'
import '../styles/solucoes.css'

interface ComponenteForm {
  produtoId: string
  quantidade: number | null
  unidadeMedida: UnidadeSolucao | ''
}

const router = useRouter()
const session = useSessionStore()
const carregando = ref(true)
const enviando = ref(false)
const erro = ref('')
const origem = ref<'PADRAO' | 'PERSONALIZADA'>('PADRAO')
const modelos = ref<ModeloSolucao[]>([])
const projetos = ref<ProjetoSolucao[]>([])
const produtos = ref<UnidadeProduto[]>([])
const projetoId = ref('')
const modeloId = ref('')
const nomeSolucao = ref('')
const observacao = ref('')
const urgente = ref(false)
const ingredientes = ref<ComponenteForm[]>([{ produtoId: '', quantidade: 1, unidadeMedida: '' }])

const modeloSelecionado = computed(() => modelos.value.find(x => x.id === modeloId.value))
const podeAdicionar = computed(() =>
  ingredientes.value.length < produtos.value.length && ingredientes.value.every(i => Boolean(i.produtoId)))
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
async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const laboratorio = session.usuario?.laboratorioId
    const unidade = session.usuario?.unidadeId
    if (!laboratorio || !unidade) throw new Error('Seu usuário precisa possuir laboratório e Unidade para solicitar Soluções.')
    const [catalogo, projetosData, produtosData] = await Promise.all([
      solucaoService.listarModelos(true),
      solucaoService.listarProjetosPorLaboratorio(laboratorio),
      solucaoService.listarProdutos(unidade),
    ])
    modelos.value = catalogo
    projetos.value = projetosData
    produtos.value = produtosData
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
  try {
    validar()
    enviando.value = true
    const personalizadas: ComponenteModeloInput[] = origem.value === 'PADRAO' ? [] : ingredientes.value.map(i => ({
      produtoId: i.produtoId,
      quantidade: Number(i.quantidade),
      unidadeMedida: i.unidadeMedida as UnidadeSolucao,
    }))
    await solucaoService.solicitar({
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
    await router.push({path: '/minhas-solucoes',query:{criado:'1'}})
  } catch (e) { erro.value = erroSolucao(e) } finally { enviando.value = false }
}
watch(origem, () => { erro.value = ''; modeloId.value = ''; ingredientes.value = [{ produtoId: '', quantidade: 1, unidadeMedida: '' }] })
onMounted(() => { void carregar() })
</script>

<template>
  <section class="sol-page sol-novo-pedido">
    <header class="sol-header">
      <div>
        <SglBreadcrumb :items="[{label:'Soluções',to:'/minhas-solucoes'},{label:'Solicitar solução'}]" />
        <h1>Solicitar solução</h1>
        <p>Selecione uma preparação da cartilha ou descreva uma solicitação excepcional para análise.</p>
      </div>
      <SglButton variant="secondary" @click="router.push('/minhas-solucoes')">Voltar para minhas soluções</SglButton>
    </header>
    <p v-if="erro" class="sol-error" role="alert">{{ erro }}</p>
    <div class="sol-card" style="margin-bottom:20px">
      <h2>Solicitação de preparação</h2>
      <div class="sol-form">
        <div class="sol-note">Escolha preferencialmente uma preparação do catálogo. O laboratório seguirá a composição e as orientações aprovadas para esse modelo.</div>
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
        <div class="sol-field"><span>O que deseja solicitar?</span>
          <div class="sol-segment" role="group" aria-label="Origem da composição">
            <button type="button" :class="{ active: origem === 'PADRAO' }" @click="origem = 'PADRAO'">Solução padrão</button>
            <button type="button" :class="{ active: origem === 'PERSONALIZADA' }" @click="origem = 'PERSONALIZADA'">Fora do catálogo</button>
          </div>
        </div>

        <template v-if="origem === 'PADRAO'">
          <label class="sol-field"><span>Solução do catálogo *</span>
            <select v-model="modeloId" :disabled="modelos.length === 0">
              <option value="">Selecione a Solução que deseja receber</option>
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
            <div class="sol-note"><strong>Cartilha / instruções de preparo</strong><p style="white-space:pre-wrap">{{ modeloSelecionado.instrucoesPreparo || 'O cadastro ainda não possui instruções. A gestão deve complementar a cartilha antes de atender o pedido.' }}</p></div>
          </div>
        </template>
        <template v-else>
          <label class="sol-field"><span>Qual solução deseja? *</span>
            <input v-model="nomeSolucao" maxlength="150" placeholder="Ex.: Solução tampão para projeto" required />
          </label>
          <p class="sol-note">Não encontrou sua Solução no catálogo? Descreva as exigências específicas. A gestão avaliará se a preparação pode ser atendida.</p><div class="sol-list-head"><h3>Componentes solicitados (quando conhecidos)</h3><SglButton variant="secondary" class="sol-btn " type="button" :disabled="!podeAdicionar" @click="adicionarComponente">+ Adicionar produto</SglButton></div>
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
            <SglButton variant="secondary" class="sol-btn" type="button" :disabled="ingredientes.length === 1" @click="removerComponente(index)">Retirar</SglButton>
          </div>
        </template>
        <label class="sol-field"><span>Finalidade ou exigências especiais</span><textarea v-model="observacao" maxlength="1500" placeholder="Para uma Solução fora do catálogo, informe concentração, volume final, finalidade e quaisquer exigências de preparo." /></label>
        <label class="sol-check"><input v-model="urgente" type="checkbox" /> Marcar como urgente (informativo)</label>
        <div class="sol-actions" style="justify-content:flex-end">
          <SglButton variant="secondary" class="sol-btn" type="button" @click="router.push('/minhas-solucoes')">Cancelar edição</SglButton>
          <SglButton variant="primary" class="sol-btn " type="button" :disabled="enviando || carregando" @click="solicitar">{{ enviando ? 'Enviando...' : 'Enviar solicitação' }}</SglButton>
        </div>
      </div>
    </div>


  </section>
</template>
