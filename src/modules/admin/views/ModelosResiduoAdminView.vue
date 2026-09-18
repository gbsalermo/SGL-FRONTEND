<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import type {
  ApiErrorAdmin,
  ClasseResiduoCadastro,
  ComponenteModeloResiduoRequest,
  EstadoFisicoModeloResiduo,
  MedidaSegurancaCadastro,
  ModeloResiduoCadastro,
  ModeloResiduoRequest,
  NivelRiscoCadastro,
  ProdutoCadastro,
  TipoRiscoCadastro,
  UnidadeMedidaCadastro,
} from '@/modules/admin/types/cadastros'
import { useSessionStore } from '@/stores/session'

interface ComponenteForm {
  produtoId: string
  nomeComponente: string
  principal: boolean
  concentracaoOuQuantidade: string
  observacao: string
}

interface ModeloForm {
  nome: string
  descricao: string
  processoOrigem: string
  estadoFisico: EstadoFisicoModeloResiduo
  tratamentoRealizado: boolean
  descricaoTratamento: string
  recipiente: string
  unidadeMedida: UnidadeMedidaCadastro
  nivelRisco: NivelRiscoCadastro
  riscos: TipoRiscoCadastro[]
  classesIds: string[]
  medidasSeguranca: MedidaSegurancaCadastro[]
  observacaoSeguranca: string
  componentes: ComponenteForm[]
  ativo: boolean
}

const router = useRouter()
const session = useSessionStore()

const modelos = ref<ModeloResiduoCadastro[]>([])
const classes = ref<ClasseResiduoCadastro[]>([])
const produtos = ref<ProdutoCadastro[]>([])
const carregando = ref(false)
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')
const busca = ref('')
const mostrarInativos = ref(false)
const editorAberto = ref(false)
const idEdicao = ref<string | null>(null)
const form = ref<ModeloForm>(novoForm())

const estadosFisicos: EstadoFisicoModeloResiduo[] = ['LIQUIDO', 'SOLIDO', 'SEMISSOLIDO', 'GASOSO', 'OUTRO']
const unidadesMedida: UnidadeMedidaCadastro[] = [
  'ML', 'L', 'MG', 'G', 'KG', 'UNIDADE', 'REACAO', 'CAIXA', 'FRASCO', 'AMPOLA', 'PAR', 'METRO', 'OUTRO',
]
const niveisRisco: NivelRiscoCadastro[] = ['NENHUM', 'BAIXO', 'MEDIO', 'ALTO']
const tiposRisco: TipoRiscoCadastro[] = [
  'NENHUM', 'INFLAMAVEL', 'RADIOATIVO', 'TOXICO', 'CORROSIVO', 'BIOLOGICO', 'IRRITANTE',
  'PERIGO_SAUDE', 'OXIDANTE', 'EXPLOSIVO', 'GAS_PRESSURIZADO', 'PERIGO_AMBIENTAL',
]
const medidasSeguranca: MedidaSegurancaCadastro[] = [
  'LUVAS', 'OCULOS_PROTECAO', 'PROTECAO_RESPIRATORIA', 'JALECO_AVENTAL', 'OUTRO',
]

const modelosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')
  return modelos.value.filter((modelo) => {
    if (!mostrarInativos.value && !modelo.ativo) return false
    if (!termo) return true
    return [
      modelo.nome,
      modelo.descricao,
      modelo.processoOrigem,
      modelo.classes.map((classe) => classe.codigo).join(' '),
    ].some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
  })
})

function novoComponente(principal = false): ComponenteForm {
  return {
    produtoId: '',
    nomeComponente: '',
    principal,
    concentracaoOuQuantidade: '',
    observacao: '',
  }
}

function novoForm(): ModeloForm {
  return {
    nome: '',
    descricao: '',
    processoOrigem: '',
    estadoFisico: 'LIQUIDO',
    tratamentoRealizado: false,
    descricaoTratamento: '',
    recipiente: '',
    unidadeMedida: 'ML',
    nivelRisco: 'BAIXO',
    riscos: [],
    classesIds: [],
    medidasSeguranca: [],
    observacaoSeguranca: '',
    componentes: [novoComponente(true)],
    ativo: true,
  }
}

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<ApiErrorAdmin>(error)) {
    return error.response?.data?.message ?? 'Não foi possível concluir a operação.'
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.'
}

function rotuloEnum(valor: string) {
  const especiais: Record<string, string> = {
    ML: 'mL', MG: 'mg', KG: 'kg', PERIGO_SAUDE: 'Perigo à saúde',
    GAS_PRESSURIZADO: 'Gás pressurizado', OCULOS_PROTECAO: 'Óculos de proteção',
    PROTECAO_RESPIRATORIA: 'Proteção respiratória', JALECO_AVENTAL: 'Jaleco / avental',
  }
  return especiais[valor]
    ?? valor.toLocaleLowerCase('pt-BR').replaceAll('_', ' ').replace(/(^|\s)\S/g, (letra) => letra.toLocaleUpperCase('pt-BR'))
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const [modelosResult, classesResult, produtosResult] = await Promise.all([
      cadastrosAdminService.listarModelosResiduo(),
      cadastrosAdminService.listarClassesResiduo(),
      cadastrosAdminService.listarProdutos(),
    ])
    modelos.value = [...modelosResult].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    classes.value = classesResult.filter((item) => item.ativo)
    produtos.value = produtosResult.filter((item) => item.ativo)
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregando.value = false
  }
}

function abrirNovo() {
  idEdicao.value = null
  form.value = novoForm()
  erro.value = ''
  sucesso.value = ''
  editorAberto.value = true
}

function editar(modelo: ModeloResiduoCadastro) {
  idEdicao.value = modelo.id
  form.value = {
    nome: modelo.nome,
    descricao: modelo.descricao,
    processoOrigem: modelo.processoOrigem,
    estadoFisico: modelo.estadoFisico,
    tratamentoRealizado: modelo.tratamentoRealizado,
    descricaoTratamento: modelo.descricaoTratamento ?? '',
    recipiente: modelo.recipiente,
    unidadeMedida: modelo.unidadeMedida,
    nivelRisco: modelo.nivelRisco,
    riscos: [...modelo.riscos],
    classesIds: modelo.classes.map((classe) => classe.id),
    medidasSeguranca: [...modelo.medidasSeguranca],
    observacaoSeguranca: modelo.observacaoSeguranca ?? '',
    componentes: modelo.componentes.map((componente) => ({
      produtoId: componente.produtoId ?? '',
      nomeComponente: componente.nomeComponente,
      principal: componente.principal,
      concentracaoOuQuantidade: componente.concentracaoOuQuantidade ?? '',
      observacao: componente.observacao ?? '',
    })),
    ativo: modelo.ativo,
  }
  if (form.value.componentes.length === 0) form.value.componentes = [novoComponente(true)]
  erro.value = ''
  sucesso.value = ''
  editorAberto.value = true
}

function fecharEditor() {
  if (salvando.value) return
  editorAberto.value = false
  idEdicao.value = null
}

function alternarItem<T>(lista: T[], item: T, marcado: boolean) {
  const set = new Set(lista)
  if (marcado) set.add(item)
  else set.delete(item)
  return [...set]
}

function eventoMarcado(event: Event) {
  return event.target instanceof HTMLInputElement && event.target.checked
}

function adicionarComponente() {
  form.value.componentes.push(novoComponente(false))
}

function removerComponente(index: number) {
  if (form.value.componentes.length === 1) return
  const eraPrincipal = form.value.componentes[index]?.principal
  form.value.componentes.splice(index, 1)
  if (eraPrincipal && form.value.componentes.length > 0) form.value.componentes[0]!.principal = true
}

function definirPrincipal(index: number) {
  form.value.componentes.forEach((item, i) => {
    item.principal = i === index
  })
}

function validar() {
  if (!session.usuario?.unidadeId) throw new Error('Usuário sem Unidade vinculada.')
  if (!form.value.nome.trim()) throw new Error('Informe o nome do modelo.')
  if (!form.value.descricao.trim()) throw new Error('Informe a descrição.')
  if (!form.value.processoOrigem.trim()) throw new Error('Informe o processo de origem.')
  if (!form.value.recipiente.trim()) throw new Error('Informe o recipiente.')
  if (form.value.tratamentoRealizado && !form.value.descricaoTratamento.trim()) {
    throw new Error('Descreva o tratamento padrão.')
  }
  if (form.value.classesIds.length === 0) throw new Error('Selecione pelo menos uma classe de resíduo.')
  if (form.value.medidasSeguranca.includes('OUTRO') && !form.value.observacaoSeguranca.trim()) {
    throw new Error('Descreva a medida de segurança marcada como Outro.')
  }
  if (form.value.componentes.length === 0) throw new Error('Informe pelo menos um componente.')
  for (const componente of form.value.componentes) {
    if (!componente.produtoId && !componente.nomeComponente.trim()) {
      throw new Error('Todo componente precisa de um produto ou nome livre.')
    }
  }
}

function payload(): ModeloResiduoRequest {
  const componentes: ComponenteModeloResiduoRequest[] = form.value.componentes.map((item) => ({
    produtoId: item.produtoId || null,
    nomeComponente: item.nomeComponente.trim() || null,
    principal: item.principal,
    concentracaoOuQuantidade: item.concentracaoOuQuantidade.trim() || null,
    observacao: item.observacao.trim() || null,
  }))

  return {
    unidadeId: session.usuario!.unidadeId!,
    nome: form.value.nome.trim(),
    descricao: form.value.descricao.trim(),
    processoOrigem: form.value.processoOrigem.trim(),
    estadoFisico: form.value.estadoFisico,
    tratamentoRealizado: form.value.tratamentoRealizado,
    descricaoTratamento: form.value.tratamentoRealizado ? form.value.descricaoTratamento.trim() : null,
    recipiente: form.value.recipiente.trim(),
    unidadeMedida: form.value.unidadeMedida,
    nivelRisco: form.value.nivelRisco,
    riscos: [...form.value.riscos],
    classesIds: [...form.value.classesIds],
    medidasSeguranca: [...form.value.medidasSeguranca],
    observacaoSeguranca: form.value.observacaoSeguranca.trim() || null,
    componentes,
    ativo: form.value.ativo,
  }
}

async function salvar() {
  erro.value = ''
  sucesso.value = ''
  try {
    validar()
    salvando.value = true
    if (idEdicao.value) {
      await cadastrosAdminService.atualizarModeloResiduo(idEdicao.value, payload())
      sucesso.value = 'Modelo de resíduo atualizado.'
    } else {
      await cadastrosAdminService.criarModeloResiduo(payload())
      sucesso.value = 'Modelo de resíduo cadastrado.'
    }
    editorAberto.value = false
    idEdicao.value = null
    await carregar()
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    salvando.value = false
  }
}

async function inativar(modelo: ModeloResiduoCadastro) {
  if (!window.confirm(`Inativar o modelo "${modelo.nome}"? Resíduos já registrados não serão alterados.`)) return
  erro.value = ''
  sucesso.value = ''
  try {
    await cadastrosAdminService.inativarModeloResiduo(modelo.id)
    sucesso.value = 'Modelo inativado. O histórico de resíduos existentes permanece intacto.'
    await carregar()
  } catch (error) {
    erro.value = mensagemErro(error)
  }
}

onMounted(carregar)
</script>

<template>
  <section class="models-page">
    <header class="page-header">
      <div>
        <p>ADMINISTRAÇÃO / CADASTROS / RESÍDUOS</p>
        <h1>Modelos de resíduo</h1>
        <span>Cadastre definições reutilizáveis para acelerar a informação de resíduos recorrentes da Unidade.</span>
      </div>
      <div class="header-actions">
        <button class="ghost" type="button" @click="router.push('/administracao/cadastros')">Voltar aos cadastros</button>
        <button class="primary" type="button" @click="abrirNovo">+ Novo modelo</button>
      </div>
    </header>

    <div class="notice">
      O modelo é apenas uma definição reutilizável. Alterações futuras não modificam resíduos já informados.
    </div>

    <div v-if="sucesso" class="feedback success">{{ sucesso }}</div>
    <div v-if="erro" class="feedback error">{{ erro }}</div>

    <section class="workspace">
      <div class="toolbar">
        <label>
          <span>Buscar</span>
          <input v-model="busca" type="search" placeholder="Nome, descrição, processo ou classe..." />
        </label>
        <label class="toggle"><input v-model="mostrarInativos" type="checkbox" /> Mostrar inativos</label>
        <button class="ghost" type="button" :disabled="carregando" @click="carregar">
          {{ carregando ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>

      <div v-if="carregando" class="state">Carregando modelos...</div>
      <div v-else-if="modelosFiltrados.length === 0" class="state">Nenhum modelo encontrado.</div>

      <div v-else class="cards">
        <article v-for="modelo in modelosFiltrados" :key="modelo.id" class="model-card" :class="{ inactive: !modelo.ativo }">
          <header>
            <div>
              <span>{{ modelo.ativo ? 'ATIVO' : 'INATIVO' }}</span>
              <h2>{{ modelo.nome }}</h2>
            </div>
            <strong>{{ rotuloEnum(modelo.estadoFisico) }}</strong>
          </header>
          <p>{{ modelo.descricao }}</p>
          <dl>
            <div><dt>Processo</dt><dd>{{ modelo.processoOrigem }}</dd></div>
            <div><dt>Recipiente</dt><dd>{{ modelo.recipiente }} · {{ rotuloEnum(modelo.unidadeMedida) }}</dd></div>
            <div><dt>Risco</dt><dd>{{ rotuloEnum(modelo.nivelRisco) }} · {{ modelo.riscos.map(rotuloEnum).join(' · ') || 'Sem risco específico' }}</dd></div>
            <div><dt>Classes</dt><dd>{{ modelo.classes.map((classe) => classe.codigo).join(' · ') }}</dd></div>
            <div><dt>Componentes</dt><dd>{{ modelo.componentes.map((item) => item.nomeComponente).join(' · ') }}</dd></div>
          </dl>
          <footer>
            <button class="ghost" type="button" @click="editar(modelo)">Editar</button>
            <button v-if="modelo.ativo" class="danger" type="button" @click="inativar(modelo)">Inativar</button>
          </footer>
        </article>
      </div>
    </section>

    <div v-if="editorAberto" class="backdrop" @click.self="fecharEditor">
      <section class="editor" role="dialog" aria-modal="true" aria-label="Cadastro de modelo de resíduo">
        <header>
          <div><span>MODELO DE RESÍDUO</span><h2>{{ idEdicao ? 'Editar modelo' : 'Novo modelo' }}</h2></div>
          <button type="button" @click="fecharEditor">×</button>
        </header>

        <div class="editor-body">
          <div class="grid two">
            <label><span>Nome</span><input v-model="form.nome" maxlength="150" /></label>
            <label><span>Estado físico</span><select v-model="form.estadoFisico"><option v-for="item in estadosFisicos" :key="item" :value="item">{{ rotuloEnum(item) }}</option></select></label>
          </div>

          <label><span>Descrição</span><textarea v-model="form.descricao" rows="2" maxlength="1000" /></label>
          <label><span>Processo de origem</span><textarea v-model="form.processoOrigem" rows="2" maxlength="1000" /></label>

          <div class="grid three">
            <label><span>Recipiente</span><input v-model="form.recipiente" maxlength="255" /></label>
            <label><span>Unidade padrão</span><select v-model="form.unidadeMedida"><option v-for="item in unidadesMedida" :key="item" :value="item">{{ rotuloEnum(item) }}</option></select></label>
            <label><span>Nível de risco</span><select v-model="form.nivelRisco"><option v-for="item in niveisRisco" :key="item" :value="item">{{ rotuloEnum(item) }}</option></select></label>
          </div>

          <label class="check"><input v-model="form.tratamentoRealizado" type="checkbox" /> Possui tratamento padrão</label>
          <label v-if="form.tratamentoRealizado"><span>Descrição do tratamento</span><textarea v-model="form.descricaoTratamento" rows="2" maxlength="1000" /></label>

          <fieldset>
            <legend>Riscos</legend>
            <label v-for="item in tiposRisco" :key="item" class="choice">
              <input
                type="checkbox"
                :checked="form.riscos.includes(item)"
                @change="form.riscos = alternarItem(form.riscos, item, eventoMarcado($event))"
              />
              {{ rotuloEnum(item) }}
            </label>
          </fieldset>

          <fieldset>
            <legend>Classes de resíduo</legend>
            <label v-for="classe in classes" :key="classe.id" class="choice">
              <input
                type="checkbox"
                :checked="form.classesIds.includes(classe.id)"
                @change="form.classesIds = alternarItem(form.classesIds, classe.id, eventoMarcado($event))"
              />
              {{ classe.codigo }} — {{ classe.descricao }}
            </label>
          </fieldset>

          <fieldset>
            <legend>Segurança / EPI</legend>
            <label v-for="item in medidasSeguranca" :key="item" class="choice">
              <input
                type="checkbox"
                :checked="form.medidasSeguranca.includes(item)"
                @change="form.medidasSeguranca = alternarItem(form.medidasSeguranca, item, eventoMarcado($event))"
              />
              {{ rotuloEnum(item) }}
            </label>
          </fieldset>
          <label><span>Orientação complementar de segurança</span><textarea v-model="form.observacaoSeguranca" rows="2" maxlength="1000" /></label>

          <section class="components">
            <header><div><strong>Componentes padrão</strong><small>Produto é opcional; texto livre continua permitido.</small></div><button class="ghost" type="button" @click="adicionarComponente">+ Componente</button></header>
            <article v-for="(componente, index) in form.componentes" :key="index">
              <div class="grid two">
                <label><span>Produto do catálogo <small>(opcional)</small></span><select v-model="componente.produtoId"><option value="">Sem produto vinculado</option><option v-for="produto in produtos" :key="produto.id" :value="produto.id">{{ produto.nome }}</option></select></label>
                <label><span>Nome do componente</span><input v-model="componente.nomeComponente" maxlength="255" placeholder="Preenchido automaticamente pelo backend se usar produto" /></label>
              </div>
              <div class="grid two">
                <label><span>Concentração / quantidade</span><input v-model="componente.concentracaoOuQuantidade" maxlength="100" /></label>
                <label><span>Observação</span><input v-model="componente.observacao" maxlength="500" /></label>
              </div>
              <div class="component-actions">
                <button type="button" :class="{ selected: componente.principal }" @click="definirPrincipal(index)">
                  {{ componente.principal ? '✓ Principal' : 'Definir principal' }}
                </button>
                <button v-if="form.componentes.length > 1" class="danger-link" type="button" @click="removerComponente(index)">Remover</button>
              </div>
            </article>
          </section>

          <label class="check"><input v-model="form.ativo" type="checkbox" /> Modelo ativo</label>
        </div>

        <footer>
          <button class="ghost" type="button" @click="fecharEditor">Cancelar</button>
          <button class="primary" type="button" :disabled="salvando" @click="salvar">{{ salvando ? 'Salvando...' : 'Salvar modelo' }}</button>
        </footer>
      </section>
    </div>
  </section>
</template>

<style scoped>
.models-page { width: min(100%, 1500px); margin: 0 auto; color: var(--sgl-text, #16243b); }
.page-header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 20px; }
.page-header p { margin: 0 0 7px; color: var(--sgl-primary); font-size: 11px; font-weight: 900; letter-spacing: .05em; }
.page-header h1 { margin: 0; font-size: 34px; }
.page-header span { display: block; margin-top: 7px; color: var(--sgl-text-muted); font-size: 13px; }
.header-actions { display: flex; gap: 10px; }
.notice, .feedback { margin-bottom: 14px; padding: 13px 15px; border-radius: 8px; font-size: 12px; }
.notice { border: 1px solid #cfe0f5; background: #f4f8ff; color: #355779; }
.feedback.success { border: 1px solid #b9dfc8; background: #f2fbf5; color: #17663f; }
.feedback.error { border: 1px solid #efb9b5; background: #fff3f2; color: #9d251d; }
.workspace { border: 1px solid var(--sgl-border); border-radius: 12px; background: var(--sgl-surface, #fff); overflow: hidden; }
.toolbar { display: flex; align-items: end; gap: 14px; padding: 16px; border-bottom: 1px solid var(--sgl-border); }
.toolbar label:first-child { flex: 1; }
.toolbar label span, .editor label > span { display: block; margin-bottom: 6px; font-size: 11px; font-weight: 800; }
.toolbar input[type=search], .editor input:not([type=checkbox]), .editor select, .editor textarea { width: 100%; min-height: 42px; padding: 9px 11px; border: 1px solid #cbd5e1; border-radius: 7px; background: var(--sgl-surface, #fff); color: inherit; font: inherit; }
.editor textarea { min-height: 70px; resize: vertical; }
.toggle, .check, .choice { display: inline-flex !important; align-items: center; gap: 7px; font-size: 11.5px; }
.state { padding: 34px; color: var(--sgl-text-muted); text-align: center; }
.cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding: 16px; }
.model-card { display: grid; gap: 12px; padding: 18px; border: 1px solid var(--sgl-border); border-radius: 10px; background: var(--sgl-surface, #fff); }
.model-card.inactive { opacity: .65; }
.model-card header, .model-card footer, .components > header, .editor > header, .editor > footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.model-card header span, .editor > header span { color: var(--sgl-primary); font-size: 9px; font-weight: 900; letter-spacing: .06em; }
.model-card h2 { margin: 3px 0 0; font-size: 17px; }
.model-card p { margin: 0; color: var(--sgl-text-muted); font-size: 12px; line-height: 1.5; }
.model-card dl { display: grid; gap: 7px; margin: 0; }
.model-card dl div { display: grid; grid-template-columns: 92px 1fr; gap: 10px; }
.model-card dt { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--sgl-text-muted); }
.model-card dd { margin: 0; font-size: 11.5px; }
.primary, .ghost, .danger, .component-actions button { min-height: 38px; padding: 0 13px; border-radius: 7px; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.primary { border: 0; background: var(--sgl-primary); color: #fff; }
.ghost { border: 1px solid #cbd5e1; background: transparent; color: inherit; }
.danger { border: 1px solid #e0a7a3; background: #fff5f4; color: #a22e26; }
.backdrop { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; padding: 20px; background: rgb(12 24 42 / 55%); }
.editor { width: min(100%, 940px); max-height: 92vh; display: grid; grid-template-rows: auto 1fr auto; overflow: hidden; border-radius: 12px; background: var(--sgl-surface, #fff); box-shadow: 0 24px 70px rgb(0 0 0 / 25%); }
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
.components article { display: grid; gap: 10px; padding: 14px; border: 1px solid var(--sgl-border); border-radius: 8px; }
.component-actions { display: flex; gap: 10px; }
.component-actions button { border: 1px solid #cbd5e1; background: transparent; color: inherit; }
.component-actions button.selected { border-color: #9acdaf; background: #f0faf4; color: #176b43; }
.danger-link { color: #a22e26 !important; }
@media (max-width: 820px) {
  .page-header, .toolbar { align-items: stretch; flex-direction: column; }
  .header-actions { flex-wrap: wrap; }
  .cards, .grid.two, .grid.three { grid-template-columns: 1fr; }
}
</style>
