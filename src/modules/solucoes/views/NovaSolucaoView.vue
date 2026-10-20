<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import SeletorParticipacaoOperacional from '@/modules/operacao/components/SeletorParticipacaoOperacional.vue'
import { contextoOperacionalService } from '@/modules/operacao/services/contextoOperacionalService'
import {
  prepararSelecaoContextoEstagiario,
  resolverContextoEstagiario,
  type ContextoParticipacaoOperacional,
} from '@/modules/operacao/types/contextoOperacional'
import { listarLaboratoriosOperacionais, podeEscolherLaboratorio, type LaboratorioOperacional } from '@/modules/operacao/services/laboratoriosOperacionais'

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
const laboratorios = ref<LaboratorioOperacional[]>([])
const laboratorioSelecionadoId = ref('')
const gestao = computed(() => podeEscolherLaboratorio(session.usuario?.perfil))
const estagiario = computed(() => session.usuario?.perfil === 'ESTAGIARIO')
const contextos = ref<ContextoParticipacaoOperacional[]>([])
const participacaoSelecionadaId = ref('')
const opcoesContexto = computed(() => prepararSelecaoContextoEstagiario(contextos.value, session.usuario?.unidadeId || ''))
const contextoResolvido = computed(() => resolverContextoEstagiario(
  opcoesContexto.value, participacaoSelecionadaId.value, session.usuario?.unidadeId || '',
))
const participacaoSelecionada = computed(() => opcoesContexto.value.contextosElegiveis
  .find(x => x.participacaoId === participacaoSelecionadaId.value))
const laboratorioOperacionalId = computed(() => estagiario.value
  ? contextoResolvido.value?.laboratorioId || ''
  : gestao.value ? laboratorioSelecionadoId.value : session.usuario?.laboratorioId || '')
const laboratorioOperacional = computed(() => laboratorios.value.find(l => l.id === laboratorioOperacionalId.value))
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
const usuario = computed(() => session.usuario)
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
    const laboratorio = laboratorioOperacionalId.value
    const unidade = session.usuario?.unidadeId
    if (!unidade || (!gestao.value && !estagiario.value && !laboratorio)) throw new Error('Unidade e laboratório operacional são necessários.')
    if (gestao.value) laboratorios.value = await listarLaboratoriosOperacionais(unidade)
    const [catalogo, projetosData, produtosData, contextosData] = await Promise.all([
      solucaoService.listarModelos(true),
      !estagiario.value && laboratorio
        ? solucaoService.listarProjetosPorLaboratorio(laboratorio)
        : Promise.resolve([] as ProjetoSolucao[]),
      solucaoService.listarProdutos(unidade),
      estagiario.value && session.usuario?.id
        ? contextoOperacionalService.listarParticipacoesEstagiario(session.usuario.id)
        : Promise.resolve([] as ContextoParticipacaoOperacional[]),
    ])
    contextos.value = contextosData
    participacaoSelecionadaId.value = estagiario.value
      ? prepararSelecaoContextoEstagiario(contextosData, unidade).participacaoSugeridaId || ''
      : ''
    modelos.value = catalogo
    projetos.value = projetosData
    produtos.value = produtosData
    if (catalogo.length === 0) origem.value = 'PERSONALIZADA'
  } catch (e) { erro.value = erroSolucao(e) } finally { carregando.value = false }
}
async function selecionarLaboratorio() {
  projetoId.value = ''
  projetos.value = []
  if (!laboratorioOperacionalId.value) return
  try { projetos.value = await solucaoService.listarProjetosPorLaboratorio(laboratorioOperacionalId.value) }
  catch (e) { erro.value = erroSolucao(e) }
}
function validar() {
  if (!session.usuario?.id) throw new Error('Não foi possível identificar o solicitante.')
  if (estagiario.value && !contextoResolvido.value)
    throw new Error('Selecione uma participação elegível para solicitar a Solução.')
  if (!laboratorioOperacionalId.value) throw new Error('Selecione o laboratório de destino.')
  if (!estagiario.value && !projetoId.value)
    throw new Error('Selecione o projeto ao qual a Solução será vinculada.')
  if (origem.value === 'PADRAO') {
    if (!modeloId.value || !modeloSelecionado.value) throw new Error('Selecione um modelo de Solução.')
    if (modeloSelecionado.value.componentes.length === 0) throw new Error('O modelo não possui componentes.')
    return
  }
  if (!nomeSolucao.value.trim()) throw new Error('Informe o nome da Solução personalizada.')
  if (!ingredientes.value.length) throw new Error('Informe pelo menos um Produto conhecido para avaliar a preparação.')
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
      ...(estagiario.value
        ? { participacaoId: contextoResolvido.value!.participacaoId }
        : { laboratorioId: laboratorioOperacionalId.value, projetoId: projetoId.value }),
      nomeSolucao: origem.value === 'PERSONALIZADA' ? nomeSolucao.value.trim() : undefined,
      modeloSolucaoId: origem.value === 'PADRAO' ? modeloId.value : undefined,
      urgente: urgente.value,
      observacao: observacao.value.trim() || null,
      motivoUrgencia: null,
      arquivoDocumento: null,
      itens: origem.value === 'PADRAO' ? [] : personalizadas,
    })
    await router.push(gestao.value ? '/solucoes' : {path: '/minhas-solucoes',query:{criado:'1'}})
  } catch (e) { erro.value = erroSolucao(e) } finally { enviando.value = false }
}
watch(origem, () => { erro.value = ''; modeloId.value = ''; ingredientes.value = [{ produtoId: '', quantidade: 1, unidadeMedida: '' }] })
onMounted(() => { void carregar() })
</script>

<template>
  <section class="nova-solucao-page">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">Soluções / Solicitar solução</p>
        <h1>Solicitar solução</h1>
        <p>Escolha uma preparação da cartilha ou descreva uma solicitação excepcional.</p>
      </div>
      <button class="secondary-action" type="button" @click="router.push(gestao ? '/solucoes' : '/minhas-solucoes')">{{ gestao ? 'Voltar para gestão' : 'Voltar para minhas soluções' }}</button>
    </header>

    <div class="context-grid">
      <article><span>Solicitante</span><strong>{{ usuario?.nome }}</strong><small>{{ usuario?.email }}</small></article>
      <article><span>Laboratório de destino</span><strong>{{ estagiario ? (participacaoSelecionada?.laboratorioNome || 'Selecione uma participação abaixo') : (laboratorioOperacional?.nome || (gestao ? 'Selecione abaixo' : usuario?.laboratorioNome || 'Não vinculado')) }}</strong><small>{{ usuario?.unidadeNome ?? 'Unidade não vinculada' }}</small></article>
    </div>

    <form class="request-surface" @submit.prevent="solicitar">
      <section class="form-section">
        <div class="section-title"><div><span>1</span><div><h2>Contexto da solicitação</h2><p>Vincule o pedido ao Projeto responsável pela utilização.</p></div></div></div>
        <label v-if="gestao" class="field">
          <span>Laboratório de destino <small>(obrigatório)</small></span>
          <select v-model="laboratorioSelecionadoId" required :disabled="carregando" @change="selecionarLaboratorio">
            <option value="">Selecione um laboratório ativo da Unidade</option>
            <option v-for="laboratorio in laboratorios" :key="laboratorio.id" :value="laboratorio.id">{{ laboratorio.nome }}</option>
          </select>
        </label>
        <SeletorParticipacaoOperacional
          v-if="estagiario"
          v-model="participacaoSelecionadaId"
          :opcoes="opcoesContexto"
          :carregando="carregando"
        />
        <label v-if="!estagiario" class="field">
          <span>Projeto <small>(obrigatório)</small></span>
          <select v-model="projetoId" required :disabled="carregando">
            <option value="">Selecione o Projeto</option>
            <option v-for="p in projetos" :key="p.id" :value="p.id">{{ p.nome }}</option>
          </select>
        </label>
        <div class="urgency-field">
          <div><span class="field-label">Urgência <small>(opcional)</small></span><p>A marcação apenas informa a gestão e não altera automaticamente a prioridade.</p></div>
          <button type="button" class="urgency-toggle" :class="{ 'urgency-toggle--active': urgente }" :aria-pressed="urgente" @click="urgente = !urgente">
            <span class="urgency-toggle__indicator" aria-hidden="true" />{{ urgente ? 'Solicitação urgente' : 'Marcar como urgente' }}
          </button>
        </div>
      </section>

      <section class="form-section">
        <div class="section-title"><div><span>2</span><div><h2>Solução solicitada</h2><p>Prefira uma preparação da cartilha de Soluções do laboratório.</p></div></div></div>
        <div class="sol-type-options" role="group" aria-label="Tipo de solicitação">
          <button type="button" :class="{ active: origem === 'PADRAO' }" @click="origem = 'PADRAO'">Solução padrão</button>
          <button type="button" :class="{ active: origem === 'PERSONALIZADA' }" @click="origem = 'PERSONALIZADA'">Fora do catálogo</button>
        </div>
        <template v-if="origem === 'PADRAO'">
          <label class="field">
            <span>Solução da cartilha <small>(obrigatório)</small></span>
            <select v-model="modeloId" required :disabled="!modelos.length">
              <option value="">Selecione a preparação desejada</option>
              <option v-for="m in modelos" :key="m.id" :value="m.id">{{ m.nome }}</option>
            </select>
          </label>
          <div v-if="!modelos.length" class="state-box">Nenhuma Solução padrão disponível no catálogo da Unidade.</div>
          <div v-if="modeloSelecionado" class="sol-recipe-preview">
            <h3>{{ modeloSelecionado.nome }}</h3>
            <p>{{ modeloSelecionado.descricao || 'Preparação cadastrada na cartilha da Unidade.' }}</p>
            <div class="recipe-composition">
              <strong>Composição</strong>
              <ul><li v-for="c in modeloSelecionado.componentes" :key="c.id">{{ c.produtoNome }} — {{ exibirQuantidade(c.quantidade) }} {{ c.unidadeMedida }}</li></ul>
            </div>
            <div class="recipe-composition">
              <strong>Cartilha de preparo</strong>
              <p class="recipe-instructions">{{ modeloSelecionado.instrucoesPreparo || 'Ainda não há instruções registradas neste modelo.' }}</p>
            </div>
          </div>
        </template>
        <template v-else>
          <label class="field"><span>Nome da Solução <small>(obrigatório)</small></span><input v-model="nomeSolucao" required maxlength="150" placeholder="Informe qual preparação deseja solicitar" /></label>
          <p class="form-guidance">Solicitações fora da cartilha exigem análise da gestão. Informe os componentes conhecidos e descreva as exigências no campo seguinte.</p>
          <div class="section-title section-title--action">
            <div><div><h2>Componentes informados</h2><p>Produtos conhecidos e quantidades da preparação excepcional.</p></div></div>
            <button type="button" :disabled="!podeAdicionar" @click="adicionarComponente">+ Adicionar item</button>
          </div>
          <div class="items-list">
            <div v-for="(item,index) in ingredientes" :key="index" class="item-row">
              <label class="field item-product"><span>Produto</span>
                <select v-model="item.produtoId" required @change="atualizarProduto(item)">
                  <option value="">Selecione um Produto</option>
                  <option v-for="p in produtosDisponiveis" :key="p.id" :value="p.id" :disabled="ingredientes.some((outro,i) => i !== index && outro.produtoId === p.id)">{{ p.nome }}</option>
                </select>
              </label>
              <label class="field"><span>Unidade</span>
                <select v-model="item.unidadeMedida" required :disabled="!item.produtoId">
                  <option value="">Selecione</option>
                  <option v-for="u in unidadesCompativeis(produtoPorId(item.produtoId)?.unidadeMedida)" :key="u" :value="u">{{ u }}</option>
                </select>
              </label>
              <label class="field"><span>Quantidade</span><input v-model.number="item.quantidade" type="number" min="0.000001" step="any" required /></label>
              <button class="remove-item" type="button" :disabled="ingredientes.length===1" aria-label="Retirar componente" @click="removerComponente(index)">×</button>
            </div>
          </div>
        </template>
      </section>

      <section class="form-section">
        <div class="section-title"><div><span>3</span><div><h2>Exigências e finalidade</h2><p>Informe orientações adicionais relevantes para análise e atendimento.</p></div></div></div>
        <label class="field observation-field"><span>Observação / exigências <small>(opcional)</small></span>
          <textarea v-model="observacao" rows="3" maxlength="1500" :placeholder="origem === 'PADRAO' ? 'Informe a finalidade ou alguma observação sobre a preparação...' : 'Informe concentração, volume final, finalidade e exigências especiais de preparo...'" />
        </label>
      </section>
      <div v-if="erro" class="error-banner" role="alert">{{ erro }}</div>
      <footer class="form-footer">
        <p>O pedido ficará pendente até a análise da gestão.<span class="urgent-footer-note">A preparação deverá seguir a cartilha registrada no pedido.</span></p>
        <button class="primary-action" type="submit" :disabled="enviando || carregando || (estagiario && !contextoResolvido)">{{ enviando ? 'Enviando...' : 'Enviar solicitação' }}</button>
      </footer>
    </form>
  </section>
</template>

<style scoped>
.nova-solucao-page { width: min(100%, 1180px); margin: 0 auto; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
.breadcrumb { margin: 0 0 10px; color: var(--sgl-text-muted); font-size: 13px; }
.page-heading h1 { margin: 0; font-size:var(--sgl-font-page-title); letter-spacing: -0.035em; }
.page-heading > div > p:last-child { margin: 8px 0 0; color: var(--sgl-text-muted); font-size: 14px; }
.secondary-action, .section-title--action button { min-height: 40px; padding: 0 13px; border: 1px solid var(--sgl-border-strong); border-radius: 6px; background: var(--sgl-surface); color: var(--sgl-text); font-weight: 700; cursor: pointer; }
.secondary-action:hover, .section-title--action button:hover:not(:disabled) { border-color: var(--sgl-primary); color: var(--sgl-primary); }
.section-title--action button:disabled { opacity: .5; cursor: not-allowed; }
.context-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
.context-grid article { padding: 15px 17px; border: 1px solid var(--sgl-border); border-radius: 8px; background: var(--sgl-surface); }
.context-grid span, .context-grid small { display: block; color: var(--sgl-text-muted); }
.context-grid span { margin-bottom: 5px; font-size: 12px; font-weight: 800; text-transform: uppercase; }
.context-grid strong { display: block; font-size: 14px; }
.context-grid small { margin-top: 3px; font-size: 11px; }
.request-surface { overflow: hidden; border: 1px solid var(--sgl-border); border-radius: 8px; background: var(--sgl-surface); box-shadow:none; }
.form-section { padding: 22px; border-bottom: 1px solid var(--sgl-border); }
.section-title { margin-bottom: 18px; }
.section-title, .section-title > div, .section-title--action { display: flex; align-items: flex-start; gap: 12px; }
.section-title--action { justify-content: space-between; }
.section-title > div > span { width: 30px; height: 30px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%; background: var(--sgl-surface-interactive); color: var(--sgl-primary); font-size: 12px; font-weight: 800; }
.section-title h2 { margin: 0; font-size: 16px; }
.section-title p { margin: 4px 0 0; color: var(--sgl-text-muted); font-size: 12px; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field + .field, .urgency-field + .field, .field + .urgency-field, .urgency-guidance + .field { margin-top: 16px; }
.field > span, .field-label { color: var(--sgl-text); font-size: 12px; font-weight: 750; }
.field > span small, .field-label small { color: var(--sgl-text-muted); font-weight: 500; }
.field select, .field input, .field textarea { width: 100%; border: 1px solid var(--sgl-border-strong); border-radius: 6px; background: var(--sgl-surface); color: var(--sgl-text); font: inherit; outline: 0; box-sizing: border-box; }
.field select, .field input { min-height: 40px; padding: 0 12px; }
.field textarea { resize: vertical; padding: 11px 12px; }
.field select:focus, .field input:focus, .field textarea:focus { border-color: var(--sgl-primary); box-shadow: 0 0 0 3px rgb(26 77 161 / 8%); }
.field > small { color: var(--sgl-text-muted); font-size: 10px; line-height: 1.35; }
.package-guidance { color: var(--sgl-warning) ; font-weight: 700; }
.urgency-field { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px; border: 1px solid var(--sgl-border); border-radius: 8px; background: var(--sgl-surface-soft); }
.urgency-field p { margin: 4px 0 0; color: var(--sgl-text-muted); font-size: 11px; }
.urgency-toggle { min-height: 40px; flex: 0 0 auto; display: inline-flex; align-items: center; gap: 8px; padding: 0 13px; border: 1px solid var(--sgl-border-strong); border-radius: 6px; background: var(--sgl-surface); color: var(--sgl-text); font-weight: 750; cursor: pointer; }
.urgency-toggle:hover { border-color: var(--sgl-error); color: var(--sgl-error); }
.urgency-toggle--active { border-color: var(--sgl-border-strong); background: var(--sgl-surface-interactive); color: var(--sgl-error); }
.urgency-toggle__indicator { width: 9px; height: 9px; border: 2px solid currentColor; border-radius: 50%; }
.urgency-toggle--active .urgency-toggle__indicator { background: currentColor; }
.urgency-guidance { margin-top: 12px; padding: 10px 12px; border-left: 3px solid var(--sgl-error); border-radius: 4px; background: var(--sgl-surface-interactive); color: var(--sgl-error); font-size: 11px; line-height: 1.45; }
.observation-field textarea { min-height: 96px; }
.items-list { display: flex; flex-direction: column; gap: 12px; }
.item-row { display: grid; grid-template-columns: minmax(250px, 1.25fr) minmax(250px, 1fr) 120px 38px; align-items: start; gap: 12px; padding: 14px; border: 1px solid var(--sgl-border); border-radius: 8px; background: var(--sgl-surface-soft); }
.item-row .field { align-self: start; }
.item-row .field > small { display: block; min-height: 16px; margin-top: 6px; }
.item-row .field + .field { margin-top: 0; }
.remove-item { width: 38px; height: 44px; align-self: start; margin-top: 26px; border: 1px solid var(--sgl-border); border-radius: 6px; background: var(--sgl-surface); color: var(--sgl-error); font-size: 20px; cursor: pointer; }
.remove-item:disabled { color: var(--sgl-border-strong); cursor: not-allowed; }
.state-box { padding: 24px; color: var(--sgl-text-muted); text-align: center; }
.error-banner { margin: 18px 22px 0; padding: 12px 14px; border: 1px solid var(--sgl-border-strong); border-radius: 7px; background: var(--sgl-surface-interactive); color: var(--sgl-error); font-size: 12px; }
.form-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 22px; background: var(--sgl-surface-soft); }
.form-footer p { margin: 0; color: var(--sgl-text-muted); font-size: 12px; }
.urgent-footer-note { display: block; margin-top: 4px; color: var(--sgl-primary); font-weight: 700; }
.primary-action { min-height: 44px; padding: 0 20px; border: 0; border-radius: 6px; background: var(--sgl-primary); color: var(--sgl-surface); font-weight: 800; cursor: pointer; }
.primary-action:hover:not(:disabled) { background: var(--sgl-primary-dark); }
.primary-action:disabled { opacity: .6; cursor: wait; }
@media (max-width: 900px) { .item-row { grid-template-columns: 1fr 1fr; } .remove-item { width: 100%; } }
@media (max-width: 720px) { .page-heading, .form-footer, .section-title--action, .urgency-field { align-items: stretch; flex-direction: column; } .secondary-action, .primary-action, .section-title--action button, .urgency-toggle { align-self: flex-start; } .context-grid, .item-row { grid-template-columns: 1fr; } }

.sol-type-options {display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;}
.sol-type-options button {min-height:40px;border:1px solid var(--sgl-border-strong);border-radius:6px;background:var(--sgl-surface);color:var(--sgl-text);padding:0 16px;font-weight:700;cursor:pointer;}
.sol-type-options button.active {border-color:var(--sgl-primary);color:var(--sgl-primary);background:var(--sgl-surface-interactive);}
.sol-recipe-preview {border:1px solid var(--sgl-border);border-radius:8px;background:var(--sgl-surface-soft);padding:16px;margin-top:14px;color:var(--sgl-text);}
.sol-recipe-preview h3 {font-size:16px;margin:0 0 8px;}
.sol-recipe-preview p {font-size:13px;color:var(--sgl-text-muted);}
.recipe-composition {border-top:1px solid var(--sgl-border);padding-top:12px;margin-top:12px;}
.recipe-composition strong {font-size:13px;}
.recipe-composition ul {margin:9px 0 0;padding-left:20px;font-size:13px;}
.recipe-instructions {white-space:pre-wrap;line-height:1.6;color:var(--sgl-text);}
.form-guidance {color:var(--sgl-text-muted);font-size:12px;margin:0 0 16px;}
.nova-solucao-page .section-title--action {margin-bottom:14px;}
.nova-solucao-page .section-title--action > div {display:flex;gap:10px;align-items:center;}
.nova-solucao-page .section-title--action button {min-height:34px;padding:0 12px;border:1px solid var(--sgl-border-strong);border-radius:6px;color:var(--sgl-text);background:var(--sgl-surface);cursor:pointer;}
.nova-solucao-page .item-row {grid-template-columns:minmax(210px,2.5fr) minmax(125px,1fr) minmax(100px,1fr) 40px;}
/* Modal/form theme parity derives from institutional SGL tokens instead of a second palette. */
.nova-solucao-page .context-grid article,.nova-solucao-page .request-surface,.nova-solucao-page .item-row {background:var(--sgl-surface);border-color:var(--sgl-border);}
.nova-solucao-page .field :is(input,select,textarea) {background:var(--sgl-surface-elevated);color:var(--sgl-text);border-color:var(--sgl-border-strong);}
.nova-solucao-page .form-footer,.nova-solucao-page .urgency-field {background:var(--sgl-surface-soft);border-color:var(--sgl-border);}
.nova-solucao-page .section-title h2,.nova-solucao-page .page-heading h1 {color:var(--sgl-text);}
@media(max-width:900px){.nova-solucao-page .item-row{grid-template-columns:1fr 1fr;}}
@media(max-width:720px){.nova-solucao-page .item-row{grid-template-columns:1fr;}}
</style>

