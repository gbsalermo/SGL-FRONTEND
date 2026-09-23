<script setup lang="ts">
import axios from 'axios'
import { computed, nextTick, onMounted, ref } from 'vue'

import { residuoService } from '@/modules/residuos/services/residuoService'
import type {
  ApiErrorResponse,
  ClasseResiduoResponse,
  CriarResiduoRequest,
  EstadoFisicoResiduo,
  MedidaSegurancaResiduo,
  ModeloResiduoResponse,
  NivelRiscoResiduo,
  ProdutoResiduoResponse,
  ProjetoResiduoResponse,
  ResiduoResponse,
  TipoRiscoResiduo,
  UnidadeMedidaResiduo,
} from '@/modules/residuos/types/residuo'
import { useSessionStore } from '@/stores/session'

type OrigemComponente = 'CATALOGO' | 'LIVRE'
type ModoPreenchimento = 'MANUAL' | 'MODELO'

interface ComponenteForm {
  origem: OrigemComponente
  produtoId: string
  nomeComponente: string
  principal: boolean
  concentracaoOuQuantidade: string
  observacao: string
}

const niveisRisco: Array<{ value: NivelRiscoResiduo; label: string }> = [
  { value: 'NENHUM', label: 'Nenhum' },
  { value: 'BAIXO', label: 'Baixo' },
  { value: 'MEDIO', label: 'Médio' },
  { value: 'ALTO', label: 'Alto' },
]

const tiposRisco: Array<{ value: Exclude<TipoRiscoResiduo, 'NENHUM'>; label: string }> = [
  { value: 'INFLAMAVEL', label: 'Inflamável' },
  { value: 'RADIOATIVO', label: 'Radioativo' },
  { value: 'TOXICO', label: 'Tóxico' },
  { value: 'CORROSIVO', label: 'Corrosivo' },
  { value: 'BIOLOGICO', label: 'Biológico' },
  { value: 'IRRITANTE', label: 'Irritante' },
  { value: 'PERIGO_SAUDE', label: 'Perigo à saúde' },
  { value: 'OXIDANTE', label: 'Oxidante' },
  { value: 'EXPLOSIVO', label: 'Explosivo' },
  { value: 'GAS_PRESSURIZADO', label: 'Gás pressurizado' },
  { value: 'PERIGO_AMBIENTAL', label: 'Perigo ambiental' },
]

const estadosFisicos: Array<{ value: EstadoFisicoResiduo; label: string }> = [
  { value: 'LIQUIDO', label: 'Líquido' },
  { value: 'SOLIDO', label: 'Sólido' },
  { value: 'SEMISSOLIDO', label: 'Semissólido' },
  { value: 'GASOSO', label: 'Gasoso' },
  { value: 'OUTRO', label: 'Outro' },
]

const medidasSeguranca: Array<{ value: MedidaSegurancaResiduo; label: string }> = [
  { value: 'LUVAS', label: 'Luvas' },
  { value: 'OCULOS_PROTECAO', label: 'Óculos de proteção' },
  { value: 'PROTECAO_RESPIRATORIA', label: 'Proteção respiratória' },
  { value: 'JALECO_AVENTAL', label: 'Jaleco / avental' },
  { value: 'OUTRO', label: 'Outro' },
]

const unidadesMedida: Array<{ value: UnidadeMedidaResiduo; label: string }> = [
  { value: 'ML', label: 'mL' },
  { value: 'L', label: 'L' },
  { value: 'MG', label: 'mg' },
  { value: 'G', label: 'g' },
  { value: 'KG', label: 'kg' },
  { value: 'UNIDADE', label: 'Unidade' },
  { value: 'REACAO', label: 'Reação' },
  { value: 'CAIXA', label: 'Caixa' },
  { value: 'FRASCO', label: 'Frasco' },
  { value: 'AMPOLA', label: 'Ampola' },
  { value: 'PAR', label: 'Par' },
  { value: 'METRO', label: 'Metro' },
  { value: 'OUTRO', label: 'Outro' },
]

const session = useSessionStore()
const projetos = ref<ProjetoResiduoResponse[]>([])
const produtos = ref<ProdutoResiduoResponse[]>([])
const classesResiduo = ref<ClasseResiduoResponse[]>([])
const modelosResiduo = ref<ModeloResiduoResponse[]>([])
const modoPreenchimento = ref<ModoPreenchimento>('MANUAL')
const modeloResiduoId = ref('')
const projetoId = ref('')
const descricao = ref('')
const processoOrigem = ref('')
const estadoFisico = ref<EstadoFisicoResiduo>('LIQUIDO')
const tratamentoRealizado = ref(false)
const descricaoTratamento = ref('')
const recipiente = ref('')
const quantidade = ref<number | null>(null)
const unidadeMedida = ref<UnidadeMedidaResiduo>('ML')
const nivelRiscoInformado = ref<NivelRiscoResiduo>('BAIXO')
const riscosInformados = ref<TipoRiscoResiduo[]>([])
const observacaoGerador = ref('')
const classesInformadasIds = ref<string[]>([])
const medidasSegurancaInformadas = ref<MedidaSegurancaResiduo[]>([])
const observacaoSegurancaInformada = ref('')
const componentes = ref<ComponenteForm[]>([novoComponente(true)])
const carregandoDados = ref(false)
const enviando = ref(false)
const erro = ref('')
const errosFormulario = ref<Record<string, string>>({})
const avisoDados = ref('')
const avisoModelo = ref('')
const resultado = ref<ResiduoResponse | null>(null)

const usuario = computed(() => session.usuario)
const podeAdicionarComponente = computed(() => componentes.value.length < 12)
const medidasSugeridasProdutos = computed(() => {
  const sugeridas = new Set<MedidaSegurancaResiduo>()
  componentes.value
    .filter((componente) => componente.origem === 'CATALOGO' && componente.produtoId)
    .forEach((componente) => {
      produtoSelecionado(componente.produtoId)?.medidasSegurancaRecomendadas?.forEach((medida) => sugeridas.add(medida))
    })
  return [...sugeridas]
})

function novoComponente(principal = false): ComponenteForm {
  return {
    origem: 'LIVRE',
    produtoId: '',
    nomeComponente: '',
    principal,
    concentracaoOuQuantidade: '',
    observacao: '',
  }
}

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const api = error.response?.data
    if (api?.message) return api.message

    if (Array.isArray(api?.fieldErrors)) {
      const mensagens = api.fieldErrors.map((item) => item.message).filter(Boolean)
      if (mensagens.length > 0) return mensagens.join(' ')
    }

    if (api?.fieldErrors && !Array.isArray(api.fieldErrors)) {
      const mensagens = Object.values(api.fieldErrors).filter(Boolean)
      if (mensagens.length > 0) return mensagens.join(' ')
    }

    return 'Não foi possível informar o resíduo.'
  }

  return error instanceof Error ? error.message : 'Não foi possível informar o resíduo.'
}

async function carregarDados() {
  const laboratorioId = usuario.value?.laboratorioId
  if (!laboratorioId) {
    erro.value = 'Seu usuário precisa estar vinculado a um laboratório para informar resíduos.'
    return
  }

  carregandoDados.value = true
  erro.value = ''
  avisoDados.value = ''

  const [projetosResult, produtosResult, classesResult, modelosResult] = await Promise.allSettled([
    residuoService.listarProjetosPorLaboratorio(laboratorioId),
    residuoService.listarProdutosAtivos(),
    residuoService.listarClassesAtivas(),
    residuoService.listarModelosResiduoAtivos(),
  ])

  if (projetosResult.status === 'fulfilled') {
    projetos.value = projetosResult.value
  } else {
    avisoDados.value = 'Não foi possível carregar os projetos. Você ainda pode informar o resíduo sem projeto vinculado.'
  }

  if (produtosResult.status === 'fulfilled') {
    produtos.value = produtosResult.value
  } else {
    avisoDados.value = avisoDados.value
      ? `${avisoDados.value} O catálogo de produtos também não pôde ser carregado; use componentes livres.`
      : 'O catálogo de produtos não pôde ser carregado. Você ainda pode informar componentes livremente.'
  }

  if (classesResult.status === 'fulfilled') {
    classesResiduo.value = classesResult.value
  } else {
    avisoDados.value = avisoDados.value
      ? `${avisoDados.value} As classes de resíduo não puderam ser carregadas.`
      : 'As classes de resíduo não puderam ser carregadas.'
  }

  if (modelosResult.status === 'fulfilled') {
    modelosResiduo.value = modelosResult.value
  } else {
    avisoDados.value = avisoDados.value
      ? `${avisoDados.value} Os modelos de resíduo não puderam ser carregados.`
      : 'Os modelos de resíduo não puderam ser carregados. Você ainda pode preencher o formulário manualmente.'
  }

  carregandoDados.value = false
}

function produtoSelecionado(produtoId: string) {
  return produtos.value.find((produto) => produto.id === produtoId)
}

function limparDadosPreenchidosPorModelo() {
  descricao.value = ''
  processoOrigem.value = ''
  estadoFisico.value = 'LIQUIDO'
  tratamentoRealizado.value = false
  descricaoTratamento.value = ''
  recipiente.value = ''
  unidadeMedida.value = 'ML'
  nivelRiscoInformado.value = 'BAIXO'
  riscosInformados.value = []
  classesInformadasIds.value = []
  medidasSegurancaInformadas.value = []
  observacaoSegurancaInformada.value = ''
  componentes.value = [novoComponente(true)]
  errosFormulario.value = {}
}

function selecionarModoPreenchimento(modo: ModoPreenchimento) {
  modoPreenchimento.value = modo

  if (modo === 'MANUAL') {
    modeloResiduoId.value = ''
    avisoModelo.value = ''
    limparDadosPreenchidosPorModelo()
  }
}

function aplicarModeloSelecionado() {
  if (!modeloResiduoId.value) {
    avisoModelo.value = ''
    return
  }

  const modelo = modelosResiduo.value.find((item) => item.id === modeloResiduoId.value)
  if (!modelo) return

  descricao.value = modelo.descricao
  processoOrigem.value = modelo.processoOrigem
  estadoFisico.value = modelo.estadoFisico
  tratamentoRealizado.value = modelo.tratamentoRealizado
  descricaoTratamento.value = modelo.descricaoTratamento ?? ''
  recipiente.value = modelo.recipiente
  unidadeMedida.value = modelo.unidadeMedida
  nivelRiscoInformado.value = modelo.nivelRisco
  riscosInformados.value = modelo.nivelRisco === 'NENHUM'
    ? []
    : modelo.riscos.filter((risco) => risco !== 'NENHUM')

  const classesAtivas = new Set(classesResiduo.value.map((classe) => classe.id))
  classesInformadasIds.value = modelo.classes
    .map((classe) => classe.id)
    .filter((id) => classesAtivas.has(id))

  medidasSegurancaInformadas.value = [...modelo.medidasSeguranca]
  observacaoSegurancaInformada.value = modelo.observacaoSeguranca ?? ''

  componentes.value = modelo.componentes.map((item) => {
    const produtoDisponivel = Boolean(
      item.produtoId
      && produtos.value.some((produto) => produto.id === item.produtoId),
    )

    return {
      origem: produtoDisponivel ? 'CATALOGO' : 'LIVRE',
      produtoId: produtoDisponivel ? item.produtoId! : '',
      nomeComponente: produtoDisponivel ? '' : item.nomeComponente,
      principal: Boolean(item.principal),
      concentracaoOuQuantidade: item.concentracaoOuQuantidade ?? '',
      observacao: item.observacao ?? '',
    } satisfies ComponenteForm
  })

  if (componentes.value.length === 0) {
    componentes.value = [novoComponente(true)]
  } else if (!componentes.value.some((item) => item.principal)) {
    componentes.value[0]!.principal = true
  }

  errosFormulario.value = {}
  avisoModelo.value = `Modelo "${modelo.nome}" aplicado. Revise os dados e informe os valores específicos desta ocorrência antes de enviar.`
}

function selecionarOrigem(componente: ComponenteForm, origem: OrigemComponente) {
  componente.origem = origem
  if (origem === 'CATALOGO') componente.nomeComponente = ''
  else componente.produtoId = ''
}

function adicionarComponente() {
  if (!podeAdicionarComponente.value) return
  componentes.value.push(novoComponente(false))
}

function removerComponente(index: number) {
  if (componentes.value.length === 1) return
  const removidoPrincipal = componentes.value[index]?.principal
  componentes.value.splice(index, 1)
  if (removidoPrincipal && componentes.value.length > 0) componentes.value[0]!.principal = true
}

function definirPrincipal(index: number) {
  componentes.value.forEach((componente, indice) => {
    componente.principal = indice === index
  })
}

function alterarNivelRisco() {
  if (nivelRiscoInformado.value === 'NENHUM') riscosInformados.value = []
}

function aplicarSugestoesSeguranca() {
  medidasSegurancaInformadas.value = [...new Set([
    ...medidasSegurancaInformadas.value,
    ...medidasSugeridasProdutos.value,
  ])]
  if (medidasSegurancaInformadas.value.length > 0) limparErroFormulario('seguranca')
}

function limparErroFormulario(campo: string) {
  if (!errosFormulario.value[campo]) return
  const atualizados = { ...errosFormulario.value }
  delete atualizados[campo]
  errosFormulario.value = atualizados
}

async function focarPrimeiroErroFormulario() {
  await nextTick()
  document.querySelector<HTMLElement>('[data-form-error="true"]')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function validarFormulario() {
  if (!usuario.value?.id || !usuario.value.laboratorioId) {
    throw new Error('Sessão sem usuário ou laboratório válido.')
  }

  const erros: Record<string, string> = {}

  if (nivelRiscoInformado.value !== 'NENHUM' && riscosInformados.value.length === 0) {
    erros.riscos = 'Selecione pelo menos um risco percebido ou marque o nível como Nenhum.'
  }

  if (classesInformadasIds.value.length === 0) {
    erros.classes = classesResiduo.value.length === 0
      ? 'Nenhuma classe de resíduo está disponível para esta Unidade.'
      : 'Selecione pelo menos uma classe de resíduo.'
  }

  if (medidasSegurancaInformadas.value.length === 0) {
    erros.seguranca = 'Selecione pelo menos uma medida de Segurança / EPI.'
  }

  if (medidasSegurancaInformadas.value.includes('OUTRO') && !observacaoSegurancaInformada.value.trim()) {
    erros.segurancaOutro = 'Descreva a medida de segurança marcada como Outro.'
  }

  errosFormulario.value = erros

  if (Object.keys(erros).length > 0) {
    void focarPrimeiroErroFormulario()
    return false
  }

  return true
}

function montarPayload(): CriarResiduoRequest {
  const riscos: TipoRiscoResiduo[] = nivelRiscoInformado.value === 'NENHUM'
    ? ['NENHUM']
    : riscosInformados.value.filter((risco) => risco !== 'NENHUM')

  return {
    usuarioGeradorId: usuario.value!.id,
    laboratorioId: usuario.value!.laboratorioId!,
    projetoId: projetoId.value || null,
    descricao: descricao.value.trim(),
    processoOrigem: processoOrigem.value.trim(),
    estadoFisico: estadoFisico.value,
    tratamentoRealizado: tratamentoRealizado.value,
    descricaoTratamento: tratamentoRealizado.value ? descricaoTratamento.value.trim() : null,
    recipiente: recipiente.value.trim(),
    quantidade: Number(quantidade.value),
    unidadeMedida: unidadeMedida.value,
    nivelRiscoInformado: nivelRiscoInformado.value,
    riscosInformados: riscos,
    observacaoGerador: observacaoGerador.value.trim() || null,
    classesInformadasIds: [...classesInformadasIds.value],
    medidasSegurancaInformadas: [...medidasSegurancaInformadas.value],
    observacaoSegurancaInformada: observacaoSegurancaInformada.value.trim() || null,
    componentes: componentes.value.map((componente) => ({
      produtoId: componente.origem === 'CATALOGO' ? componente.produtoId : null,
      nomeComponente: componente.origem === 'LIVRE' ? componente.nomeComponente.trim() : null,
      principal: componente.principal,
      concentracaoOuQuantidade: componente.concentracaoOuQuantidade.trim() || null,
      observacao: componente.observacao.trim() || null,
    })),
  }
}

async function enviarResiduo() {
  erro.value = ''

  try {
    errosFormulario.value = {}
    if (!validarFormulario()) return
    enviando.value = true
    resultado.value = await residuoService.criar(montarPayload())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    enviando.value = false
  }
}

function limparFormulario() {
  modoPreenchimento.value = 'MANUAL'
  modeloResiduoId.value = ''
  projetoId.value = ''
  descricao.value = ''
  processoOrigem.value = ''
  estadoFisico.value = 'LIQUIDO'
  tratamentoRealizado.value = false
  descricaoTratamento.value = ''
  recipiente.value = ''
  quantidade.value = null
  unidadeMedida.value = 'ML'
  nivelRiscoInformado.value = 'BAIXO'
  riscosInformados.value = []
  observacaoGerador.value = ''
  classesInformadasIds.value = []
  medidasSegurancaInformadas.value = []
  observacaoSegurancaInformada.value = ''
  componentes.value = [novoComponente(true)]
  erro.value = ''
  errosFormulario.value = {}
  avisoModelo.value = ''
  resultado.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatarData(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor))
}

onMounted(carregarDados)
</script>

<template>
  <section class="residuo-page">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">Resíduos / Informar resíduo</p>
        <h1>Informar resíduo</h1>
        <p>Registre o material gerado no laboratório para que a Gestão possa receber, classificar, rotular e destinar corretamente.</p>
      </div>
    </header>

    <div class="context-grid">
      <article>
        <span>Gerador</span>
        <strong>{{ usuario?.nome }}</strong>
        <small>{{ usuario?.email }}</small>
      </article>
      <article>
        <span>Laboratório</span>
        <strong>{{ usuario?.laboratorioNome ?? 'Não vinculado' }}</strong>
        <small>{{ usuario?.unidadeNome ?? 'Unidade não vinculada' }}</small>
      </article>
    </div>

    <div v-if="resultado" class="success-surface">
      <div class="success-icon" aria-hidden="true">✓</div>
      <div class="success-copy">
        <span>RESÍDUO INFORMADO</span>
        <h2>Registro enviado para a Gestão</h2>
        <p>O resíduo foi registrado como <strong>INFORMADO</strong>. A classificação técnica final será realizada pela Gestão sem alterar sua declaração original.</p>
        <div class="success-meta">
          <div><small>Código SGL</small><strong>{{ resultado.codigoRastreio ?? 'Código indisponível' }}</strong></div>
          <div><small>Data</small><strong>{{ formatarData(resultado.dataInformacao) }}</strong></div>
          <div><small>Componentes</small><strong>{{ resultado.componentes.length }}</strong></div>
        </div>
      </div>
      <button type="button" @click="limparFormulario">Informar outro resíduo</button>
    </div>

    <form v-else class="residuo-form" @submit.prevent="enviarResiduo">
      <div v-if="avisoDados" class="notice notice--warning">{{ avisoDados }}</div>
      <div v-if="avisoModelo" class="notice notice--model">{{ avisoModelo }}</div>
      <div v-if="erro" class="notice notice--error">{{ erro }}</div>

      <section class="model-picker">
        <div class="model-picker__intro">
          <strong>Como deseja informar este resíduo?</strong>
          <p>O modelo apenas pré-preenche dados recorrentes. O registro enviado continua sendo um Resíduo independente.</p>
        </div>

        <div class="model-mode-switch" role="group" aria-label="Modo de preenchimento do resíduo">
          <button
            type="button"
            :class="{ active: modoPreenchimento === 'MANUAL' }"
            @click="selecionarModoPreenchimento('MANUAL')"
          >
            Preenchimento manual
          </button>
          <button
            type="button"
            :class="{ active: modoPreenchimento === 'MODELO' }"
            :disabled="modelosResiduo.length === 0"
            @click="selecionarModoPreenchimento('MODELO')"
          >
            Usar modelo
          </button>
        </div>

        <div v-if="modoPreenchimento === 'MODELO'" class="model-picker__selection">
          <label class="field">
            <span>Modelo de resíduo</span>
            <select
              v-model="modeloResiduoId"
              :disabled="carregandoDados"
              @change="aplicarModeloSelecionado"
            >
              <option value="">Selecione um modelo...</option>
              <option v-for="modelo in modelosResiduo" :key="modelo.id" :value="modelo.id">
                {{ modelo.nome }}
              </option>
            </select>
            <small>Depois de aplicado, todos os campos continuam editáveis antes do envio.</small>
          </label>
        </div>

        <p v-else-if="!carregandoDados && modelosResiduo.length === 0" class="model-picker__empty">
          Nenhum modelo ativo está cadastrado para esta Unidade. O preenchimento manual continua disponível normalmente.
        </p>
      </section>

      <section class="form-section">
        <div class="section-title">
          <span>1</span>
          <div>
            <h2>Origem do resíduo</h2>
            <p>Explique o que foi gerado e em qual processo. O projeto é opcional.</p>
          </div>
        </div>

        <div class="form-grid form-grid--two">
          <label class="field">
            <span>Projeto <small>(opcional)</small></span>
            <select v-model="projetoId" :disabled="carregandoDados">
              <option value="">Sem projeto vinculado</option>
              <option v-for="projeto in projetos" :key="projeto.id" :value="projeto.id">{{ projeto.nome }}</option>
            </select>
          </label>

          <label class="field">
            <span>Descrição do resíduo</span>
            <input v-model="descricao" required placeholder="Ex.: Mistura residual da extração de DNA" />
          </label>
        </div>

        <label class="field">
          <span>Procedência / uso do Resíduo</span>
          <textarea v-model="processoOrigem" rows="3" required placeholder="Informe de qual processo, atividade ou uso surgiu o Resíduo..." />
        </label>
      </section>

      <section class="form-section">
        <div class="section-title">
          <span>2</span>
          <div>
            <h2>Recipiente e quantidade</h2>
            <p>Informe como o material foi acondicionado e a quantidade aproximada entregue.</p>
          </div>
        </div>

        <div class="form-grid form-grid--quantity">
          <label class="field">
            <span>Recipiente</span>
            <input v-model="recipiente" required placeholder="Ex.: Frasco de vidro de 500 mL" />
          </label>
          <label class="field">
            <span>Quantidade</span>
            <input v-model.number="quantidade" type="number" min="0.001" step="0.001" required placeholder="0" />
          </label>
          <label class="field">
            <span>Unidade</span>
            <select v-model="unidadeMedida" required>
              <option v-for="unidade in unidadesMedida" :key="unidade.value" :value="unidade.value">{{ unidade.label }}</option>
            </select>
          </label>
        </div>

        <div class="form-grid form-grid--two">
          <label class="field">
            <span>Estado físico</span>
            <select v-model="estadoFisico" required>
              <option v-for="item in estadosFisicos" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
          <label class="check-line treatment-check">
            <input v-model="tratamentoRealizado" type="checkbox" />
            <span>Este resíduo já recebeu tratamento</span>
          </label>
        </div>
        <label v-if="tratamentoRealizado" class="field">
          <span>Tratamento realizado</span>
          <textarea v-model="descricaoTratamento" rows="2" required placeholder="Descreva o tratamento aplicado..." />
        </label>
      </section>

      <section class="form-section">
        <div class="section-title">
          <span>3</span>
          <div>
            <h2>Riscos percebidos</h2>
            <p>Esta é a declaração do laboratório. A Gestão poderá confirmar ou corrigir a classificação sem apagar o que foi informado aqui.</p>
          </div>
        </div>

        <label class="field risk-level">
          <span>Nível de risco informado</span>
          <select v-model="nivelRiscoInformado" @change="alterarNivelRisco">
            <option v-for="nivel in niveisRisco" :key="nivel.value" :value="nivel.value">{{ nivel.label }}</option>
          </select>
        </label>

        <div
          v-if="nivelRiscoInformado !== 'NENHUM'"
          class="risk-grid"
          :class="{ 'validation-box--error': errosFormulario.riscos }"
          :data-form-error="Boolean(errosFormulario.riscos)"
        >
          <label v-for="risco in tiposRisco" :key="risco.value" class="risk-option">
            <input v-model="riscosInformados" type="checkbox" :value="risco.value" @change="limparErroFormulario('riscos')" />
            <span>{{ risco.label }}</span>
          </label>
        </div>
        <p v-if="errosFormulario.riscos" class="inline-error">{{ errosFormulario.riscos }}</p>
        <div v-else-if="nivelRiscoInformado === 'NENHUM'" class="risk-none">Você informou que não percebe risco específico. O backend registrará essa declaração como <strong>NENHUM</strong>.</div>
      </section>

      <section class="form-section">
        <div class="section-title section-title--action">
          <div class="section-title__copy">
            <span>4</span>
            <div>
              <h2>Composição</h2>
              <p>Informe um ou mais componentes. Produto do catálogo é apenas referência e não movimenta estoque.</p>
            </div>
          </div>
          <button class="add-component" type="button" :disabled="!podeAdicionarComponente" @click="adicionarComponente">+ Adicionar componente</button>
        </div>

        <div class="components-list">
          <article v-for="(componente, index) in componentes" :key="index" class="component-card">
            <header class="component-card__header">
              <div>
                <span>Componente {{ index + 1 }}</span>
                <strong v-if="componente.principal">Principal</strong>
              </div>
              <button v-if="componentes.length > 1" type="button" class="remove-component" @click="removerComponente(index)">Remover</button>
            </header>

            <div class="origin-switch" role="group" aria-label="Origem do componente">
              <button type="button" :class="{ active: componente.origem === 'CATALOGO' }" @click="selecionarOrigem(componente, 'CATALOGO')">Produto do catálogo</button>
              <button type="button" :class="{ active: componente.origem === 'LIVRE' }" @click="selecionarOrigem(componente, 'LIVRE')">Componente livre</button>
            </div>

            <div class="component-grid">
              <label v-if="componente.origem === 'CATALOGO'" class="field component-name">
                <span>Produto</span>
                <select v-model="componente.produtoId" required>
                  <option value="" disabled>Selecione um produto</option>
                  <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
                    {{ produto.nome }}{{ produto.codigoReferencia ? ` · ${produto.codigoReferencia}` : '' }}
                  </option>
                </select>
                <small v-if="produtoSelecionado(componente.produtoId)">
                  {{ produtoSelecionado(componente.produtoId)?.unidadeArmazenamento ?? 'Produto cadastrado' }} · vínculo somente para composição
                </small>
              </label>

              <label v-else class="field component-name">
                <span>Nome do componente</span>
                <input v-model="componente.nomeComponente" required placeholder="Ex.: Solução tampão residual" />
                <small>Use texto livre quando o material não existir no catálogo.</small>
              </label>

              <label class="field">
                <span>Concentração / quantidade <small>(opcional)</small></span>
                <input v-model="componente.concentracaoOuQuantidade" placeholder="Ex.: aprox. 100 mL ou 70%" />
              </label>
            </div>

            <label class="field component-observation">
              <span>Observação do componente <small>(opcional)</small></span>
              <input v-model="componente.observacao" placeholder="Informações complementares sobre este componente..." />
            </label>

            <button type="button" class="principal-action" :class="{ active: componente.principal }" @click="definirPrincipal(index)">
              <span class="principal-indicator" aria-hidden="true">{{ componente.principal ? '✓' : '' }}</span>
              {{ componente.principal ? 'Componente principal' : 'Definir como principal' }}
            </button>
          </article>
        </div>
      </section>

      <section class="form-section">
        <div class="section-title">
          <span>5</span>
          <div>
            <h2>Classes e segurança</h2>
            <p>Selecione as classes aplicáveis e registre as medidas de segurança consideradas para esta ocorrência.</p>
          </div>
        </div>

        <div>
          <strong class="field-group-title">Classes de Resíduo</strong>
          <div
            class="risk-grid class-grid validation-box"
            :class="{ 'validation-box--error': errosFormulario.classes }"
            :data-form-error="Boolean(errosFormulario.classes)"
          >
            <label v-for="classe in classesResiduo" :key="classe.id" class="risk-option class-option">
              <input
                v-model="classesInformadasIds"
                type="checkbox"
                :value="classe.id"
                @change="limparErroFormulario('classes')"
              />
              <span><b>{{ classe.codigo }}</b> — {{ classe.descricao }}</span>
            </label>
            <p v-if="!carregandoDados && classesResiduo.length === 0" class="inline-warning">
              Nenhuma classe de resíduo cadastrada para esta Unidade.
            </p>
          </div>
          <p v-if="errosFormulario.classes" class="inline-error">{{ errosFormulario.classes }}</p>
        </div>

        <div>
          <div class="security-heading">
            <strong class="field-group-title">Segurança / EPI</strong>
            <button v-if="medidasSugeridasProdutos.length" type="button" class="suggest-action" @click="aplicarSugestoesSeguranca">Aplicar sugestões dos produtos</button>
          </div>
          <p v-if="medidasSugeridasProdutos.length" class="suggestion-copy">
            Sugestões do catálogo: {{ medidasSugeridasProdutos.map((medida) => medidasSeguranca.find((item) => item.value === medida)?.label ?? medida).join(' · ') }}.
          </p>
          <div
            class="risk-grid class-grid validation-box"
            :class="{ 'validation-box--error': errosFormulario.seguranca }"
            :data-form-error="Boolean(errosFormulario.seguranca)"
          >
            <label v-for="medida in medidasSeguranca" :key="medida.value" class="risk-option class-option">
              <input
                v-model="medidasSegurancaInformadas"
                type="checkbox"
                :value="medida.value"
                @change="limparErroFormulario('seguranca')"
              />
              <span>{{ medida.label }}</span>
            </label>
          </div>
          <p v-if="errosFormulario.seguranca" class="inline-error">{{ errosFormulario.seguranca }}</p>
          <label class="field security-note">
            <span>Orientação complementar <small>(obrigatória para Outro)</small></span>
            <textarea
              v-model="observacaoSegurancaInformada"
              rows="2"
              placeholder="Descreva outras medidas ou cuidados relevantes..."
              :class="{ 'input--error': errosFormulario.segurancaOutro }"
              :data-form-error="Boolean(errosFormulario.segurancaOutro)"
              @input="limparErroFormulario('segurancaOutro')"
            />
            <small v-if="errosFormulario.segurancaOutro" class="inline-error">{{ errosFormulario.segurancaOutro }}</small>
          </label>
        </div>
      </section>

      <section class="form-section form-section--last">
        <div class="section-title">
          <span>6</span>
          <div>
            <h2>Observações finais</h2>
            <p>Adicione qualquer informação que ajude a Gestão no recebimento e na conferência.</p>
          </div>
        </div>

        <label class="field">
          <span>Observação do gerador <small>(opcional)</small></span>
          <textarea v-model="observacaoGerador" rows="3" placeholder="Ex.: recipiente fechado, material gerado hoje, cuidados no transporte interno..." />
        </label>
      </section>

      <footer class="form-footer">
        <div>
          <strong>Ao enviar</strong>
          <span>o resíduo entra como INFORMADO e aguarda o recebimento físico pela Gestão.</span>
        </div>
        <button class="submit-action" type="submit" :disabled="enviando || carregandoDados">
          {{ enviando ? 'Enviando...' : 'Informar resíduo' }}
        </button>
      </footer>
    </form>
  </section>
</template>

<style scoped>
.residuo-page { width: min(100%, 1360px); max-width: 1360px; margin: 0 auto; }
.page-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 26px; margin-bottom: 24px; }
.breadcrumb { margin: 0 0 8px; color: var(--sgl-primary); font-size: 12px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.page-heading h1 { margin: 0; color: #17213a; font-size: clamp(32px, 3vw, 42px); letter-spacing: -.03em; }
.page-heading p:not(.breadcrumb) { max-width: 900px; margin: 9px 0 0; color: var(--sgl-text-muted); font-size: 14px; line-height: 1.6; }
.context-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 22px; }
.context-grid article { min-width: 0; padding: 18px 20px; border: 1px solid var(--sgl-border); border-radius: 10px; background: #fff; box-shadow: 0 8px 24px rgb(25 47 82 / 5%); }
.context-grid span, .context-grid strong, .context-grid small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.context-grid span { color: var(--sgl-text-muted); font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.context-grid strong { margin-top: 6px; color: #1b2941; font-size: 15px; }
.context-grid small { margin-top: 4px; color: #718096; font-size: 11px; }
.residuo-form, .success-surface { overflow: hidden; border: 1px solid var(--sgl-border); border-radius: 12px; background: #fff; box-shadow: 0 16px 44px rgb(30 54 88 / 7%); }
.model-picker { display: grid; gap: 16px; margin: 20px 32px 0; padding: 18px 20px; border: 1px solid #cfe0f5; border-radius: 9px; background: #f6f9ff; }
.model-picker__intro strong { color: #234b82; font-size: 13px; }
.model-picker__intro p { margin: 6px 0 0; color: #657892; font-size: 11.5px; line-height: 1.5; }
.model-mode-switch { display: inline-flex; justify-self: start; overflow: hidden; border: 1px solid #b8c9e4; border-radius: 7px; background: #fff; }
.model-mode-switch button { min-height: 40px; padding: 0 15px; border: 0; border-right: 1px solid #dbe4ef; background: transparent; color: #60748f; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.model-mode-switch button:last-child { border-right: 0; }
.model-mode-switch button.active { background: #174d9d; color: #fff; }
.model-mode-switch button:disabled { opacity: .45; cursor: not-allowed; }
.model-picker__selection { max-width: 620px; }
.model-picker__selection .field { margin-top: 0; }
.model-picker__empty { margin: 0; color: #718096; font-size: 10.5px; line-height: 1.45; }
.form-section { padding: 30px 32px; border-bottom: 1px solid #edf1f5; }
.form-section--last { border-bottom: 0; }
.section-title, .section-title__copy { display: flex; align-items: flex-start; gap: 14px; }
.section-title { margin-bottom: 23px; }
.section-title > span, .section-title__copy > span { width: 34px; height: 34px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 8px; background: #eaf1ff; color: #1b55ad; font-size: 13px; font-weight: 900; }
.section-title h2 { margin: 0; color: #1b2941; font-size: 18px; }
.section-title p { margin: 5px 0 0; color: #718096; font-size: 12.5px; line-height: 1.55; }
.section-title--action { justify-content: space-between; gap: 22px; }
.add-component { min-height: 42px; padding: 0 15px; border: 1px solid #b9c7db; border-radius: 7px; background: #fff; color: #244b82; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }
.add-component:hover:not(:disabled) { border-color: #2d6bc4; background: #f5f9ff; }
.add-component:disabled { opacity: .45; cursor: not-allowed; }
.form-grid { display: grid; gap: 16px; }
.form-grid--two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.form-grid--quantity { grid-template-columns: minmax(0, 2fr) minmax(160px, .7fr) minmax(160px, .7fr); }
.field { display: flex; flex-direction: column; gap: 8px; margin-top: 17px; }
.form-grid > .field { margin-top: 0; }
.field > span { color: #344258; font-size: 12.5px; font-weight: 800; }
.field > span small { color: #8a97a8; font-size: 10.5px; font-weight: 600; }
.field input, .field select, .field textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1f2d43; font: inherit; font-size: 13.5px; outline: 0; transition: border-color 160ms ease, box-shadow 160ms ease; }
.field input, .field select { min-height: 48px; padding: 0 13px; }
.field textarea { resize: vertical; padding: 13px; line-height: 1.55; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: #2d6bc4; box-shadow: 0 0 0 3px rgb(45 107 196 / 9%); }
.check-line { display: inline-flex; align-items: center; gap: 9px; color: #4b5f7b; font-size: 12.5px; font-weight: 700; }
.check-line input { width: 17px; height: 17px; }
.field small { color: #7c8a9d; font-size: 10.5px; line-height: 1.45; }
.risk-level { max-width: 340px; margin-top: 0; }
.risk-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 11px; margin-top: 18px; }
.risk-option { min-height: 48px; display: flex; align-items: center; gap: 10px; padding: 8px 14px; border: 1px solid #d7dee8; border-radius: 7px; background: #fbfcfe; color: #344258; font-size: 11.5px; font-weight: 700; cursor: pointer; }
.risk-option:has(input:checked) { border-color: #6c94d0; background: #eef5ff; color: #1d4f99; }
.risk-option input { width: 16px; height: 16px; flex: 0 0 auto; accent-color: #245eb6; }
.validation-box { padding: 8px; border: 1px solid transparent; border-radius: 9px; }
.validation-box--error { border-color: #e4a39f; background: #fff8f7; }
.inline-error { margin: 7px 0 0; color: #a82820; font-size: 10.5px; font-weight: 750; line-height: 1.45; }
.inline-warning { grid-column: 1 / -1; margin: 0; padding: 12px 14px; border: 1px solid #ead8a6; border-radius: 7px; background: #fffaf0; color: #7a5b12; font-size: 11px; line-height: 1.45; }
.input--error { border-color: #d97068 !important; box-shadow: 0 0 0 3px rgb(196 60 49 / 8%) !important; }
.field-group-title { display: block; margin-bottom: 10px; color: #334a6a; font-size: 12.5px; }
.class-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; }
.class-grid .risk-option { height: 100%; }
.class-option { align-items: center; }
.security-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin: 22px 0 9px; }
.suggest-action { padding: 8px 12px; border: 1px solid #b8c9e4; border-radius: 6px; background: #f6f9ff; color: #28569d; font: inherit; font-size: 11.5px; font-weight: 800; cursor: pointer; }
.suggestion-copy { margin: 0 0 12px; color: #657892; font-size: 11px; line-height: 1.5; }
.security-note { margin-top: 13px; }
.treatment-check { align-self: end; min-height: 48px; }
.risk-none { margin-top: 16px; padding: 14px 16px; border-radius: 7px; background: #f4f7fb; color: #5f6f84; font-size: 11.5px; }
.components-list { display: grid; gap: 14px; }
.component-card { padding: 20px; border: 1px solid #dce3ec; border-radius: 9px; background: #fcfdff; }
.component-card__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 15px; }
.component-card__header > div { display: flex; align-items: center; gap: 10px; }
.component-card__header span { color: #536277; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.component-card__header strong { padding: 5px 8px; border-radius: 999px; background: #e8f7ee; color: #137145; font-size: 9px; text-transform: uppercase; }
.remove-component { border: 0; background: transparent; color: #b42318; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.origin-switch { display: inline-flex; overflow: hidden; margin-bottom: 16px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; }
.origin-switch button { min-height: 40px; padding: 0 14px; border: 0; border-right: 1px solid #dbe2eb; background: transparent; color: #66758a; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.origin-switch button:last-child { border-right: 0; }
.origin-switch button.active { background: #174d9d; color: #fff; }
.component-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(240px, .8fr); gap: 16px; }
.component-observation { margin-top: 14px; }
.principal-action { min-height: 40px; display: inline-flex; align-items: center; gap: 9px; margin-top: 15px; padding: 0 12px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #58677c; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.principal-action.active { border-color: #9ccdb2; background: #f0faf4; color: #167247; }
.principal-indicator { width: 18px; height: 18px; display: grid; place-items: center; border: 1px solid currentColor; border-radius: 50%; font-size: 10px; }
.notice { margin: 20px 32px 0; padding: 14px 16px; border-radius: 7px; font-size: 11.5px; line-height: 1.5; }
.notice--error { border: 1px solid #f1b7b3; background: #fff3f2; color: #9f2018; }
.notice--warning { border: 1px solid #ead8a6; background: #fffaf0; color: #7a5b12; }
.notice--model { border: 1px solid #b9d5ef; background: #f3f8ff; color: #28568f; }
.form-footer { display: flex; align-items: center; justify-content: space-between; gap: 22px; padding: 24px 32px; background: #f8fafc; }
.form-footer > div { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.form-footer strong { color: #344258; font-size: 11.5px; }
.form-footer span { color: #718096; font-size: 11.5px; }
.submit-action { min-width: 180px; min-height: 48px; padding: 0 20px; border: 0; border-radius: 7px; background: linear-gradient(135deg, #174d9d, #2b67c0); color: #fff; font: inherit; font-size: 12.5px; font-weight: 850; cursor: pointer; box-shadow: 0 7px 18px rgb(29 83 166 / 19%); }
.submit-action:hover:not(:disabled) { filter: brightness(1.05); }
.submit-action:disabled { opacity: .55; cursor: not-allowed; box-shadow: none; }
.success-surface { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 20px; padding: 28px; border-color: #bbdfca; background: linear-gradient(135deg, #fbfffc, #f4fbf7); }
.success-icon { width: 56px; height: 56px; display: grid; place-items: center; border-radius: 50%; background: #157347; color: #fff; font-size: 24px; font-weight: 900; }
.success-copy > span { color: #157347; font-size: 10px; font-weight: 900; letter-spacing: .08em; }
.success-copy h2 { margin: 4px 0 6px; color: #173a2a; font-size: 22px; }
.success-copy p { margin: 0; color: #5f7468; font-size: 12px; line-height: 1.55; }
.success-meta { display: grid; grid-template-columns: 2fr 1fr .5fr; gap: 10px; margin-top: 16px; }
.success-meta div { min-width: 0; padding: 10px 12px; border-radius: 6px; background: rgb(255 255 255 / 72%); }
.success-meta small, .success-meta strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.success-meta small { color: #759080; font-size: 9px; text-transform: uppercase; }
.success-meta strong { margin-top: 4px; color: #244a37; font-size: 11px; }
.success-surface > button { min-height: 44px; padding: 0 16px; border: 1px solid #94c4a8; border-radius: 7px; background: #fff; color: #176c46; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
@media (max-width: 900px) {
  .form-grid--two, .form-grid--quantity, .component-grid { grid-template-columns: 1fr; }
  .risk-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .success-surface { grid-template-columns: auto minmax(0, 1fr); }
  .success-surface > button { grid-column: 1 / -1; justify-self: start; }
}
@media (max-width: 620px) {
  .context-grid, .risk-grid { grid-template-columns: 1fr; }
  .form-section { padding: 22px 18px; }
  .section-title--action, .form-footer { align-items: stretch; flex-direction: column; }
  .add-component, .submit-action { width: 100%; }
  .notice { margin-inline: 18px; }
  .form-footer { padding: 20px 18px; }
  .success-surface { grid-template-columns: 1fr; padding: 22px; }
  .success-meta { grid-template-columns: 1fr; }
  .origin-switch, .model-mode-switch { width: 100%; }
  .origin-switch button, .model-mode-switch button { flex: 1; }
  .model-picker { margin-inline: 18px; padding: 16px; }
}
</style>