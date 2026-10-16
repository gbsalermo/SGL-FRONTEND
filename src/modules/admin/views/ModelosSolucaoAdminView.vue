<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useSessionStore } from '@/stores/session'
import { solucaoService } from '@/modules/solucoes/services/solucaoService'
import {
  erroSolucao, exibirQuantidade, unidadesCompativeis,
  type ComponenteModeloInput, type ModeloSolucao, type ModeloSolucaoInput,
  type PedidoSolucao, type UnidadeProduto,
} from '@/modules/solucoes/types/solucao'

defineProps<{ embedded?: boolean }>()
const session = useSessionStore()
const modelos = ref<ModeloSolucao[]>([])
const produtos = ref<UnidadeProduto[]>([])
const pedidos = ref<PedidoSolucao[]>([])
const carregando = ref(false)
const salvando = ref(false)
const erro = ref('')
const erroEditor = ref('')
const sucesso = ref('')
const busca = ref('')
const mostrarInativos = ref(false)
const editorAberto = ref(false)
const idEdicao = ref<string | null>(null)
const form = ref<ModeloSolucaoInput>(novoForm())
const promoverAberto = ref(false)
const pedidoPromover = ref('')
const nomePromover = ref('')

function novoForm(): ModeloSolucaoInput {
  return {
    unidadeId: session.usuario?.unidadeId ?? '',
    nome: '', descricao: null, instrucoesPreparo: null, ativo: true,
    componentes: [{produtoId:'',quantidade:1,unidadeMedida:'ML'}],
  }
}
const modelosFiltrados = computed(() => modelos.value.filter(m =>
  (mostrarInativos.value || m.ativo) &&
  (!busca.value.trim() || [m.nome,m.descricao,m.instrucoesPreparo]
    .some(v => String(v || '').toLocaleLowerCase('pt-BR').includes(busca.value.trim().toLocaleLowerCase('pt-BR'))))))
const pedidosAvulsos = computed(() => pedidos.value.filter(p => !p.modeloSolucaoId)
  .sort((a,b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao)))
const pedidoSelecionado = computed(() => pedidosAvulsos.value.find(p => p.id === pedidoPromover.value))

function produto(id: string) {return produtos.value.find(p => p.id === id)}
function escolherProduto(item: ComponenteModeloInput) {
  item.unidadeMedida = produto(item.produtoId)?.unidadeMedida ?? 'ML'
  item.quantidade = 1
}
async function carregar() {
  erro.value = ''
  carregando.value = true
  try {
    const unidadeId = session.usuario?.unidadeId
    if (!unidadeId || session.usuario?.perfil !== 'ADMINISTRADOR')
      throw new Error('A área de modelos é destinada ao Administrador vinculado à Unidade.')
    const [catalogo,prods,solicitacoes] = await Promise.all([
      solucaoService.listarModelos(), solucaoService.listarProdutos(unidadeId),
      solucaoService.listarPedidos(),
    ])
    modelos.value = catalogo
    produtos.value = prods
    pedidos.value = solicitacoes
  } catch(e) { erro.value = erroSolucao(e) }
  finally {carregando.value = false}
}
function abrirNovo() {
  idEdicao.value = null
  form.value = novoForm()
  erroEditor.value = ''
  editorAberto.value = true
}
function editar(modelo: ModeloSolucao) {
  idEdicao.value = modelo.id
  form.value = {
    unidadeId: session.usuario?.unidadeId || '',
    nome: modelo.nome, descricao:modelo.descricao,
    instrucoesPreparo:modelo.instrucoesPreparo,ativo:modelo.ativo,
    componentes:modelo.componentes.map(c => ({
      produtoId:c.produtoId,quantidade:c.quantidade,unidadeMedida:c.unidadeMedida,
    })),
  }
  erroEditor.value = ''
  editorAberto.value = true
}
function validar() {
  const m = form.value
  if (!m.nome.trim()) throw new Error('Informe o nome do modelo de Solução.')
  if (!m.componentes.length) throw new Error('Informe ao menos um componente.')
  const usados = new Set<string>()
  for(const c of m.componentes) {
    const p = produto(c.produtoId)
    if (!p) throw new Error('Selecione um Produto válido.')
    if (usados.has(c.produtoId)) throw new Error('O mesmo Produto foi selecionado duas vezes.')
    usados.add(c.produtoId)
    if (!Number.isFinite(c.quantidade) || c.quantidade <= 0)
      throw new Error('Informe quantidades positivas para todos os componentes.')
    if (!unidadesCompativeis(p.unidadeMedida).includes(c.unidadeMedida))
      throw new Error('A unidade física de ' + p.nome + ' é incompatível.')
  }
}
async function salvar() {
  erroEditor.value = ''
  try {
    validar()
    salvando.value = true
    const payload = {...form.value,nome:form.value.nome.trim()}
    if(idEdicao.value) await solucaoService.atualizarModelo(idEdicao.value,payload)
    else await solucaoService.cadastrarModelo(payload)
    editorAberto.value = false
    sucesso.value = idEdicao.value ? 'Modelo de Solução atualizado.' : 'Modelo de Solução cadastrado.'
    await carregar()
  } catch(e) {erroEditor.value = erroSolucao(e)}
  finally {salvando.value = false}
}
async function inativar(modelo: ModeloSolucao) {
  if (!window.confirm('Inativar o modelo "'+ modelo.nome +'"? Os pedidos existentes serão preservados.')) return
  try {
    await solucaoService.inativarModelo(modelo.id)
    sucesso.value = 'Modelo inativado.'
    await carregar()
  } catch(e) {erro.value = erroSolucao(e)}
}
function fecharEditor() {if (!salvando.value) editorAberto.value = false}
async function promover() {
  erroEditor.value = ''
  try {
    if (!pedidoSelecionado.value) throw new Error('Selecione uma solicitação personalizada.')
    if (!nomePromover.value.trim()) throw new Error('Informe um nome para o modelo.')
    salvando.value = true
    await solucaoService.promoverPedido(pedidoPromover.value,nomePromover.value.trim())
    promoverAberto.value = false
    pedidoPromover.value = ''
    nomePromover.value = ''
    sucesso.value = 'Composição copiada para o catálogo, sem alterar a solicitação de origem.'
    await carregar()
  } catch(e) {erroEditor.value = erroSolucao(e)}
  finally {salvando.value = false}
}
onMounted(() => {void carregar()})
</script>

<template>
  <section class="models-page modelos-solucao-admin">
    <header class="page-header">
      <div>
        <p v-if="!embedded">ADMINISTRAÇÃO / CADASTROS / RESÍDUOS E SOLUÇÕES</p>
        <h1>Modelos de solução</h1>
        <span>Gerencie composições reutilizáveis da Unidade, disponíveis aos solicitantes.</span>
      </div>
      <div class="header-actions">
        <button class="ghost" type="button" @click="promoverAberto = true; erroEditor = ''">Importar de solicitação</button>
        <button class="primary" type="button" @click="abrirNovo">+ Novo modelo</button>
      </div>
    </header>
    <div class="notice">Modelos são somente receitas do catálogo: o estoque é movimentado pelo Pedido de Solução, e solicitações personalizadas não entram automaticamente no catálogo.</div>
    <div v-if="erro" class="feedback error" role="alert">{{ erro }}</div>
    <div v-if="sucesso" class="feedback success" role="status">{{ sucesso }}</div>
    <section class="workspace">
      <div class="toolbar">
        <label><span>Buscar</span><input v-model="busca" type="search" placeholder="Nome, descrição ou orientações..." /></label>
        <label class="toggle"><input v-model="mostrarInativos" type="checkbox" /> Mostrar inativos</label>
        <button class="ghost" type="button" :disabled="carregando" @click="carregar">{{ carregando ? 'Atualizando...' : 'Atualizar' }}</button>
      </div>
      <div v-if="carregando" class="state">Carregando modelos...</div>
      <div v-else-if="!modelosFiltrados.length" class="state">Nenhum modelo de Solução encontrado nesta Unidade.</div>
      <div v-else class="cards">
        <article v-for="m in modelosFiltrados" :key="m.id" class="model-card" :class="{inactive:!m.ativo}">
          <header><div><span>{{ m.ativo ? 'ATIVO' : 'INATIVO' }}</span><h2>{{ m.nome }}</h2></div>
            <strong>{{ m.componentes.length }} componente(s)</strong></header>
          <p>{{ m.descricao || 'Modelo reutilizável de preparação.' }}</p>
          <dl>
            <div><dt>Composição</dt><dd>{{ m.componentes.map(c => c.produtoNome + ' (' + exibirQuantidade(c.quantidade) + ' ' + c.unidadeMedida + ')').join(' · ') }}</dd></div>
            <div><dt>Preparo</dt><dd>{{ m.instrucoesPreparo || 'Sem orientações adicionais.' }}</dd></div>
          </dl>
          <footer><button class="ghost" @click="editar(m)">Editar</button><button v-if="m.ativo" class="danger" @click="inativar(m)">Inativar</button></footer>
        </article>
      </div>
    </section>

    <div v-if="editorAberto" class="backdrop" @click.self="fecharEditor">
      <section class="editor" role="dialog" aria-modal="true" aria-label="Cadastro de modelo de Solução">
        <header><div><span>MODELO DE SOLUÇÃO</span><h2>{{ idEdicao ? 'Editar modelo' : 'Novo modelo' }}</h2></div><button type="button" aria-label="Fechar" @click="fecharEditor">×</button></header>
        <div class="editor-body">
          <div v-if="erroEditor" class="feedback error" role="alert">{{ erroEditor }}</div>
          <div class="grid">
            <label><span>Nome *</span><input v-model="form.nome" maxlength="150" /></label>
            <label><span>Descrição</span><textarea v-model="form.descricao" maxlength="1000" /></label>
            <label><span>Orientações de preparo</span><textarea v-model="form.instrucoesPreparo" maxlength="2000" /></label>
            <label class="check"><input v-model="form.ativo" type="checkbox" /> Modelo ativo</label>
          </div>
          <section class="components">
            <header><div><strong>Composição</strong><small>Produtos reais, quantidades decimais e unidades físicas.</small></div>
              <button class="ghost" type="button" @click="form.componentes.push({produtoId:'',quantidade:1,unidadeMedida:'ML'})">+ Componente</button></header>
            <article v-for="(c,index) in form.componentes" :key="index">
              <header class="component-card-header"><strong>Componente {{ index+1 }}</strong>
                <button class="ghost" type="button" :disabled="form.componentes.length === 1" @click="form.componentes.splice(index,1)">Retirar</button></header>
              <div class="grid three">
                <label><span>Produto *</span><select v-model="c.produtoId" @change="escolherProduto(c)">
                  <option value="">Selecione</option><option v-for="p in produtos" :key="p.id" :value="p.id" :disabled="form.componentes.some((outro,i) => i !== index && outro.produtoId === p.id)">{{ p.nome }}</option>
                </select></label>
                <label><span>Quantidade *</span><input v-model.number="c.quantidade" type="number" step="any" min="0.000001" /></label>
                <label><span>Unidade *</span><select v-model="c.unidadeMedida">
                  <option v-for="u in unidadesCompativeis(produto(c.produtoId)?.unidadeMedida)" :key="u" :value="u">{{ u }}</option>
                </select></label>
              </div>
            </article>
          </section>
        </div>
        <footer><button class="ghost" :disabled="salvando" @click="fecharEditor">Cancelar</button><button class="primary" :disabled="salvando" @click="salvar">{{ salvando ? 'Salvando...' : 'Salvar modelo' }}</button></footer>
      </section>
    </div>

    <div v-if="promoverAberto" class="backdrop" @click.self="!salvando && (promoverAberto = false)">
      <section class="editor editor--promover" role="dialog" aria-modal="true" aria-label="Transformar solicitação em modelo">
        <header><div><span>CATÁLOGO</span><h2>Importar de solicitação</h2></div><button type="button" aria-label="Fechar" @click="promoverAberto = false">×</button></header>
        <div class="editor-body">
          <p class="notice">A composição será copiada de uma solicitação personalizada; o Pedido original e as movimentações não serão alterados.</p>
          <div v-if="erroEditor" class="feedback error">{{ erroEditor }}</div>
          <label><span>Solicitação personalizada</span><select v-model="pedidoPromover" @change="nomePromover = pedidoSelecionado?.nomeSolucao || ''">
            <option value="">Selecione</option>
            <option v-for="p in pedidosAvulsos" :key="p.id" :value="p.id">{{ p.nomeSolucao }} — {{ p.usuarioNome }} / {{ p.projetoNome || 'Sem Projeto' }}</option>
          </select></label>
          <label><span>Nome do novo modelo</span><input v-model="nomePromover" maxlength="150" /></label>
          <div v-if="pedidoSelecionado" class="notice">{{ pedidoSelecionado.itens.length }} componente(s) serão copiados para o catálogo.</div>
        </div>
        <footer><button class="ghost" @click="promoverAberto = false">Voltar</button><button class="primary" :disabled="salvando" @click="promover">Cadastrar no catálogo</button></footer>
      </section>
    </div>
  </section>
</template>
<style scoped>
.models-page { width: min(100%, 1500px); margin: 0 auto; color: var(--sgl-text, var(--sgl-text)); }
.page-header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 20px; }
.page-header p { margin: 0 0 7px; color: var(--sgl-primary); font-size: 11px; font-weight: 900; letter-spacing: .05em; }
.page-header h1 { margin: 0; font-size: var(--sgl-font-page-title); }
.page-header span { display: block; margin-top: 7px; color: var(--sgl-text-muted); font-size: 13px; }
.header-actions { display: flex; gap: 10px; }
.notice, .feedback { margin-bottom: 14px; padding: 13px 15px; border-radius: 8px; font-size: 12px; }
.notice { border: 1px solid var(--sgl-border); background: var(--sgl-surface-interactive); color: var(--sgl-text); }
.feedback.success { border: 1px solid var(--sgl-border); background: var(--sgl-surface-interactive); color: var(--sgl-success); }
.feedback.error { border: 1px solid var(--sgl-border); background: var(--sgl-surface-interactive); color: var(--sgl-error); }
.editor-feedback { margin: 0; }
.workspace { border: 1px solid var(--sgl-border); border-radius: 12px; background: var(--sgl-surface, var(--sgl-surface)); overflow: hidden; }
.toolbar { display: flex; align-items: end; gap: 14px; padding: 16px; border-bottom: 1px solid var(--sgl-border); }
.toolbar label:first-child { flex: 1; }
.toolbar label span, .editor label > span { display: block; margin-bottom: 6px; font-size: 11px; font-weight: 800; }
.toolbar input[type=search], .editor input:not([type=checkbox]), .editor select, .editor textarea { width: 100%; min-height: 40px; padding: 9px 11px; border: 1px solid var(--sgl-border-strong); border-radius: 6px; background: var(--sgl-surface, var(--sgl-surface)); color: inherit; font: inherit; }
.editor textarea { min-height: 70px; resize: vertical; }
.toggle, .check, .choice { display: inline-flex; align-items: center; gap: 7px; font-size: 11.5px; }
.state { padding: 34px; color: var(--sgl-text-muted); text-align: center; }
.cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding: 16px; }
.model-card { display: grid; gap: 12px; padding: 18px; border: 1px solid var(--sgl-border); border-radius: 10px; background: var(--sgl-surface, var(--sgl-surface)); }
.model-card.inactive { opacity: .65; }
.model-card header, .model-card footer, .components > header, .editor > header, .editor > footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.model-card header span, .editor > header span { color: var(--sgl-primary); font-size: 9px; font-weight: 900; letter-spacing: .06em; }
.model-card h2 { margin: 3px 0 0; font-size: 17px; }
.model-card p { margin: 0; color: var(--sgl-text-muted); font-size: 12px; line-height: 1.5; }
.model-card dl { display: grid; gap: 7px; margin: 0; }
.model-card dl div { display: grid; grid-template-columns: 92px 1fr; gap: 10px; }
.model-card dt { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--sgl-text-muted); }
.model-card dd { margin: 0; font-size: 11.5px; }
.primary, .ghost, .danger, .component-actions button { min-height: 40px; padding: 0 13px; border-radius: 6px; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.primary { border: 0; background: var(--sgl-primary); color: var(--sgl-surface); }
.ghost { border: 1px solid var(--sgl-border-strong); background: transparent; color: inherit; }
.danger { border: 1px solid var(--sgl-border-strong); background: var(--sgl-surface-interactive); color: var(--sgl-error); }
.backdrop { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; padding: 20px; background: rgb(12 24 42 / 55%); }
.editor { width: min(100%, 940px); max-height: 92vh; display: grid; grid-template-rows: auto 1fr auto; overflow: hidden; border-radius: 12px; background: var(--sgl-surface, var(--sgl-surface)); box-shadow: 0 24px 70px rgb(0 0 0 / 25%); }
.editor > header, .editor > footer { padding: 16px 20px; border-bottom: 1px solid var(--sgl-border); }
.editor > footer { border-top: 1px solid var(--sgl-border); border-bottom: 0; justify-content: flex-end; }
.editor > header h2 { margin: 3px 0 0; }
.editor > header > button { border: 0; background: transparent; color: inherit; font-size: 24px; cursor: pointer; }
.editor-body { overflow: auto; display: grid; gap: 16px; padding: 20px; }
.grid { display: grid; gap: 14px; }
.grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
fieldset { display: flex; flex-wrap: wrap; gap: 8px 16px; margin: 0; padding: 13px; border: 1px solid var(--sgl-border); border-radius: 8px; }
legend { padding: 0 6px; font-size: 11px; font-weight: 850; }
.components { display: grid; gap: 10px; }
.components > header small { display: block; margin-top: 3px; color: var(--sgl-text-muted); }
.components article { display: grid; gap: 12px; padding: 14px; border: 1px solid var(--sgl-border); border-radius: 8px; }
.component-card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.component-card-header > div { display: flex; align-items: center; gap: 9px; }
.component-card-header > div > span { color: var(--sgl-text-muted); font-size: 10px; font-weight: 850; text-transform: uppercase; }
.component-card-header > div > strong { padding: 4px 7px; border-radius: 999px; background: var(--sgl-surface-interactive); color: var(--sgl-success); font-size: 8px; text-transform: uppercase; }
.origin-switch { display: inline-flex; justify-self: start; overflow: hidden; border: 1px solid var(--sgl-border-strong); border-radius: 6px; background: var(--sgl-surface); }
.origin-switch button { min-height: 40px; padding: 0 13px; border: 0; border-right: 1px solid var(--sgl-border); background: transparent; color: var(--sgl-text-muted); font: inherit; font-size: 10.5px; font-weight: 800; cursor: pointer; }
.origin-switch button:last-child { border-right: 0; }
.origin-switch button.active { background: var(--sgl-primary); color: var(--sgl-surface); }
.components label small { color: var(--sgl-text-muted); font-size: 9px; line-height: 1.4; }
.component-actions { display: flex; gap: 10px; }
.component-actions button { border: 1px solid var(--sgl-border-strong); background: transparent; color: inherit; }
.component-actions button.selected { border-color: var(--sgl-border-strong); background: var(--sgl-surface-interactive); color: var(--sgl-success); }
.remove-component { min-height: auto; padding: 0; border: 0; background: transparent; }
.danger-link { color: var(--sgl-error); }
@media (max-width: 820px) {
  .page-header, .toolbar { align-items: stretch; flex-direction: column; }
  .header-actions { flex-wrap: wrap; }
  .cards, .grid.two, .grid.three { grid-template-columns: 1fr; }
}

.modelos-solucao-admin .editor--promover { width:min(660px,100%); }
.modelos-solucao-admin .editor--promover .editor-body label { display:grid; gap:6px; }
.modelos-solucao-admin .editor--promover .editor-body label span { font-size:12px; font-weight:750; }
.modelos-solucao-admin .editor--promover .editor-body label select,
.modelos-solucao-admin .editor--promover .editor-body label input { width:100%; min-height:40px; background:var(--sgl-surface); color:var(--sgl-text); border:1px solid var(--sgl-border-strong); border-radius:7px; padding:8px 11px; }
@media(max-width:760px) { .modelos-solucao-admin .grid.three { grid-template-columns:1fr; } }

/* Complemento institucional de tema e controles: nao alterar a base Modelos de Residuos. */
.modelos-solucao-admin .page-header h1 { font-size:var(--sgl-font-page-title); }
.modelos-solucao-admin .workspace,
.modelos-solucao-admin .model-card,
.modelos-solucao-admin .editor { background:var(--sgl-surface); border-color:var(--sgl-border); color:var(--sgl-text); border-radius:var(--sgl-radius-surface); }
.modelos-solucao-admin .notice { border-color:var(--sgl-border); background:var(--sgl-surface-interactive); color:var(--sgl-text); }
.modelos-solucao-admin .feedback.success { border-color:var(--sgl-border); background:var(--sgl-surface-interactive); color:var(--sgl-success); }
.modelos-solucao-admin .feedback.error { border-color:var(--sgl-border); background:var(--sgl-surface-interactive); color:var(--sgl-error); }
.modelos-solucao-admin :is(.toolbar input[type=search],.editor input:not([type=checkbox]),.editor select,.editor textarea) { min-height:40px; border-radius:var(--sgl-radius-control); border-color:var(--sgl-border-strong); background:var(--sgl-surface); color:var(--sgl-text); }
.modelos-solucao-admin :is(.primary,.ghost,.danger,.component-actions button) { min-height:40px; border-radius:var(--sgl-radius-control); font-size:var(--sgl-font-body); }
.modelos-solucao-admin .ghost { background:var(--sgl-surface); border-color:var(--sgl-border-strong); color:var(--sgl-text); }
.modelos-solucao-admin .danger { background:var(--sgl-surface-interactive); border-color:var(--sgl-border-strong); color:var(--sgl-error); }
.modelos-solucao-admin .model-card :is(h2,dd),.modelos-solucao-admin .editor :is(h2,strong) { color:var(--sgl-text); }
.modelos-solucao-admin .model-card dt,
.modelos-solucao-admin .editor label > span { color:var(--sgl-text-muted); font-size:var(--sgl-font-label); }
.modelos-solucao-admin .backdrop { backdrop-filter:blur(3px); background:rgb(7 17 31 / 55%); }
.modelos-solucao-admin .editor > header,
.modelos-solucao-admin .editor > footer,
.modelos-solucao-admin .components article { border-color:var(--sgl-border); background:var(--sgl-surface); }
.modelos-solucao-admin .editor > header > button { width:40px; height:40px; border-radius:var(--sgl-radius-control); font-size:24px; }

</style>