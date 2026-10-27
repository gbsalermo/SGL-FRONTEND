<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { relatorioService, ultimaConsultaRelatorio } from '@/modules/relatorios/services/relatorioService'
import type { RelatorioProjetosResponse } from '@/modules/relatorios/types/projetosRelatorio'
import type {
  NivelRiscoRelatorio,
  OrigemMovimentacaoRelatorio,
  OrgaoFiscalizadorRelatorio,
  RelatorioEstagiariosResponse,
  RelatorioEstoqueLotesResponse,
  RelatorioFiscalizacaoResponse,
  RelatorioMovimentacoesResponse,
  RelatorioProdutosResponse,
  RelatorioResumoOperacionalResponse,
  SituacaoLoteRelatorio,
  TipoMovimentacaoRelatorio,
} from '@/modules/relatorios/types/relatorio'
import { http } from '@/services/http'
import { projetosService } from '@/modules/projetos/services/projetosService'
import type { ProjetoOperacional, SciOperacional, AtividadeOperacional } from '@/modules/projetos/types/projetos'

type TipoRelatorio =
  | 'estagiarios'
  | 'produtos'
  | 'movimentacoes'
  | 'projetos'
  | 'estoque-lotes'
  | 'residuos'
  | 'fiscalizacao'

type SituacaoFiltro = '' | 'ativo' | 'inativo'
type SimNaoFiltro = '' | 'sim' | 'nao'

interface LaboratorioResumo {
  id: string
  nome: string
}

interface UnidadeResumo {
  id: string
  nome: string
  sigla: string | null
}

interface ProdutoResumo {
  id: string
  nome: string
  fiscalizado?: boolean
  unidadeMedida?: string | null
}

interface UsuarioResumo {
  id: string
  nome: string
}

interface LoteResumo {
  id: string
  codigoInterno: string | null
  numeroLote: string | null
}

interface RelatorioOpcao {
  id: TipoRelatorio
  titulo: string
  descricao: string
  icone: 'documento' | 'produto' | 'troca' | 'resumo' | 'estoque' | 'residuo' | 'escudo'
}

const relatorios: RelatorioOpcao[] = [
  { id: 'estagiarios', titulo: 'Estagiários', descricao: 'Ativos, inativos ou todos, por laboratório', icone: 'documento' },
  { id: 'produtos', titulo: 'Produtos', descricao: 'Catálogo, riscos, perecibilidade e fiscalização', icone: 'produto' },
  { id: 'movimentacoes', titulo: 'Movimentações', descricao: 'Resumo e detalhamento das operações', icone: 'troca' },
  { id: 'projetos', titulo: 'Projetos', descricao: 'SCI, atividades, participações e execução', icone: 'documento' },
  { id: 'estoque-lotes', titulo: 'Estoque e lotes', descricao: 'Posição de estoque, mínimos e vencimentos', icone: 'estoque' },
  { id: 'residuos', titulo: 'Resíduos', descricao: 'Geração, riscos, armazenamento e despacho', icone: 'residuo' },
  { id: 'fiscalizacao', titulo: 'Fiscalização', descricao: 'Produtos fiscalizados e sua rastreabilidade', icone: 'escudo' },
]

const relatorioSelecionado = ref<TipoRelatorio>('estagiarios')
const modoMovimentacoes = ref<'resumo' | 'detalhamento'>('resumo')
const projetoStatus = ref('')
const projetoExecucao = ref('')
const projetoAtivo = ref<SituacaoFiltro>('')
const projetoRecurso = ref<SimNaoFiltro>('')

const situacao = ref<SituacaoFiltro>('')
const laboratorioId = ref('')
const dataInicio = ref('')
const dataFim = ref('')
const tipoBolsa = ref('')
const busca = ref('')

const produtoSituacao = ref<SituacaoFiltro>('')
const produtoFiscalizado = ref<SimNaoFiltro>('')
const produtoPerecivel = ref<SimNaoFiltro>('')
const produtoRisco = ref<'' | NivelRiscoRelatorio>('')
const produtoOrgao = ref<'' | OrgaoFiscalizadorRelatorio>('')

const movimentoTipo = ref<'' | TipoMovimentacaoRelatorio>('')
const movimentoOrigem = ref<'' | OrigemMovimentacaoRelatorio>('')
const movimentoProdutoId = ref('')
const movimentoUsuarioId = ref('')
const movimentoLoteId = ref('')
const movimentoEmbalagem = ref('')
const movimentoForma = ref('')
const movimentoApresentacao = ref('')
const movimentoProjetoId = ref('')
const movimentoSciId = ref('')
const movimentoAtividadeId = ref('')
const movimentoMostrarQuantidades = ref(false)
const movimentoMaisFiltros = ref(false)
const projetosContexto = ref<ProjetoOperacional[]>([])
const scisContexto = ref<SciOperacional[]>([])
const atividadesContexto = ref<AtividadeOperacional[]>([])
const embalagensDisponiveis = ref<string[]>([])

const resumoProdutoId = ref('')

const estoqueUnidadeId = ref('')
const estoqueProdutoId = ref('')
const estoqueSituacao = ref<SituacaoFiltro>('')
const estoqueNivel = ref<SimNaoFiltro>('')
const estoqueSituacaoLote = ref<'' | SituacaoLoteRelatorio>('')
const estoqueDiasVencimento = ref(30)

const fiscalProdutoId = ref('')
const fiscalOrgao = ref<'' | OrgaoFiscalizadorRelatorio>('')
const fiscalUnidadeId = ref('')
const fiscalDiasVencimento = ref(30)

const laboratorios = ref<LaboratorioResumo[]>([])
const unidades = ref<UnidadeResumo[]>([])
const produtos = ref<ProdutoResumo[]>([])
const usuarios = ref<UsuarioResumo[]>([])
const lotes = ref<LoteResumo[]>([])

const resultadoEstagiarios = ref<RelatorioEstagiariosResponse | null>(null)
const resultadoProdutos = ref<RelatorioProdutosResponse | null>(null)
const resultadoMovimentacoes = ref<RelatorioMovimentacoesResponse | null>(null)
const resultadoResumoOperacional = ref<RelatorioResumoOperacionalResponse | null>(null)
const resultadoEstoqueLotes = ref<RelatorioEstoqueLotesResponse | null>(null)
const resultadoFiscalizacao = ref<RelatorioFiscalizacaoResponse | null>(null)
const resultadoProjetos = ref<RelatorioProjetosResponse | null>(null)
const carregando = ref(false)
const erro = ref('')

const opcaoSelecionada = computed(
  () => relatorios.find((item) => item.id === relatorioSelecionado.value) ?? relatorios[0],
)

const relatorioEstagiariosSelecionado = computed(() => relatorioSelecionado.value === 'estagiarios')
const relatorioProdutosSelecionado = computed(() => relatorioSelecionado.value === 'produtos')
const relatorioMovimentacoesSelecionado = computed(() => relatorioSelecionado.value === 'movimentacoes' && modoMovimentacoes.value === 'detalhamento')
const relatorioResumoSelecionado = computed(() => relatorioSelecionado.value === 'movimentacoes' && modoMovimentacoes.value === 'resumo')
const relatorioProjetosSelecionado = computed(() => relatorioSelecionado.value === 'projetos')
const relatorioEstoqueSelecionado = computed(() => relatorioSelecionado.value === 'estoque-lotes')
const relatorioResiduosSelecionado = computed(() => relatorioSelecionado.value === 'residuos')
const relatorioFiscalizacaoSelecionado = computed(() => relatorioSelecionado.value === 'fiscalizacao')

watch(modoMovimentacoes, () => {
  limparResultados()
  ultimaConsultaRelatorio.value = null
  erro.value = ''
})


const produtosFiscalizados = computed(() => produtos.value.filter((produto) => produto.fiscalizado))

const possuiResultado = computed(() => {
  if (relatorioEstagiariosSelecionado.value) return Boolean(resultadoEstagiarios.value)
  if (relatorioProdutosSelecionado.value) return Boolean(resultadoProdutos.value)
  if (relatorioMovimentacoesSelecionado.value) return Boolean(resultadoMovimentacoes.value)
  if (relatorioResumoSelecionado.value) return Boolean(resultadoResumoOperacional.value)
  if (relatorioEstoqueSelecionado.value) return Boolean(resultadoEstoqueLotes.value)
  if (relatorioProjetosSelecionado.value) return Boolean(resultadoProjetos.value)
  if (relatorioFiscalizacaoSelecionado.value) return Boolean(resultadoFiscalizacao.value)
  return false
})

const geradoEm = computed(() => {
  if (relatorioEstagiariosSelecionado.value) return resultadoEstagiarios.value?.geradoEm
  if (relatorioProdutosSelecionado.value) return resultadoProdutos.value?.geradoEm
  if (relatorioMovimentacoesSelecionado.value) return resultadoMovimentacoes.value?.geradoEm
  if (relatorioResumoSelecionado.value) return resultadoResumoOperacional.value?.geradoEm
  if (relatorioEstoqueSelecionado.value) return resultadoEstoqueLotes.value?.geradoEm
  if (relatorioProjetosSelecionado.value) return resultadoProjetos.value?.geradoEm
  if (relatorioFiscalizacaoSelecionado.value) return resultadoFiscalizacao.value?.geradoEm
  return undefined
})

const tiposBolsa = computed(() => {
  const valores = new Set(
    (resultadoEstagiarios.value?.itens ?? [])
      .map((item) => item.tipoBolsa)
      .filter((valor): valor is string => Boolean(valor)),
  )
  return [...valores].sort((a, b) => a.localeCompare(b, 'pt-BR'))
})

const itensEstagiariosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')
  return (resultadoEstagiarios.value?.itens ?? []).filter((item) => {
    const bolsaOk = !tipoBolsa.value || item.tipoBolsa === tipoBolsa.value
    const buscaOk =
      !termo ||
      item.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
      item.email.toLocaleLowerCase('pt-BR').includes(termo)
    return bolsaOk && buscaOk
  })
})

const resumoEstagiarios = computed(() => ({
  total: itensEstagiariosFiltrados.value.length,
  ativos: itensEstagiariosFiltrados.value.filter((item) => item.ativo).length,
  inativos: itensEstagiariosFiltrados.value.filter((item) => !item.ativo).length,
}))

const quantidadesAgrupadas = computed(() => {
  const mapa = new Map<string, { id: string; nome: string; unidade: string | null; tipo: string; quantidade: number }>()
  for (const item of resultadoMovimentacoes.value?.itens ?? []) {
    const unidade = item.unidadeMedida ?? unidadeProduto(item.produtoId)
    const id = `${item.produtoId}:${item.tipoMovimentacao}:${unidade ?? ''}`
    const atual = mapa.get(id) ?? { id, nome: item.produtoNome, unidade, tipo: item.tipoMovimentacao, quantidade: 0 }
    atual.quantidade += Number(item.quantidadeMovimentada)
    mapa.set(id, atual)
  }
  return [...mapa.values()]
})

function limparResultados() {
  resultadoEstagiarios.value = null
  resultadoProdutos.value = null
  resultadoMovimentacoes.value = null
  resultadoResumoOperacional.value = null
  resultadoEstoqueLotes.value = null
  resultadoFiscalizacao.value = null
  resultadoProjetos.value = null
}

function selecionarRelatorio(id: TipoRelatorio) {
  relatorioSelecionado.value = id
  limparResultados()
  ultimaConsultaRelatorio.value = null
  erro.value = ''
}

function limparFiltros() {
  situacao.value = ''
  laboratorioId.value = ''
  dataInicio.value = ''
  dataFim.value = ''
  tipoBolsa.value = ''
  busca.value = ''
  produtoSituacao.value = ''
  produtoFiscalizado.value = ''
  produtoPerecivel.value = ''
  produtoRisco.value = ''
  produtoOrgao.value = ''
  movimentoTipo.value = ''
  movimentoOrigem.value = ''
  movimentoProdutoId.value = ''
  movimentoUsuarioId.value = ''
  movimentoLoteId.value = ''
  movimentoEmbalagem.value = ''
  movimentoForma.value = ''
  movimentoApresentacao.value = ''
  movimentoProjetoId.value = ''
  movimentoSciId.value = ''
  movimentoAtividadeId.value = ''
  movimentoMostrarQuantidades.value = false
  movimentoMaisFiltros.value = false
  resumoProdutoId.value = ''
  estoqueUnidadeId.value = ''
  estoqueProdutoId.value = ''
  estoqueSituacao.value = ''
  estoqueNivel.value = ''
  estoqueSituacaoLote.value = ''
  estoqueDiasVencimento.value = 30
  fiscalProdutoId.value = ''
  fiscalOrgao.value = ''
  fiscalUnidadeId.value = ''
  fiscalDiasVencimento.value = 30
  projetoStatus.value = ''
  projetoExecucao.value = ''
  projetoAtivo.value = ''
  projetoRecurso.value = ''
  limparResultados()
  ultimaConsultaRelatorio.value = null
  erro.value = ''
}

function validarPeriodo() {
  if (dataInicio.value && dataFim.value && dataInicio.value > dataFim.value) {
    erro.value = 'A data inicial não pode ser posterior à data final.'
    return false
  }
  if ((dataInicio.value && !dataFim.value) || (!dataInicio.value && dataFim.value)) {
    erro.value = 'Para filtrar por período, informe a data inicial e a data final.'
    return false
  }
  return true
}

async function visualizarRelatorio() {
  erro.value = ''

  const usaPeriodo =
    relatorioEstagiariosSelecionado.value ||
    relatorioMovimentacoesSelecionado.value ||
    relatorioResumoSelecionado.value ||
    relatorioFiscalizacaoSelecionado.value
  if (usaPeriodo && !validarPeriodo()) return
  if (relatorioProjetosSelecionado.value && dataInicio.value && dataFim.value && dataInicio.value > dataFim.value) {
    erro.value = 'A data inicial não pode ser posterior à data final.'
    return
  }

  if (relatorioResiduosSelecionado.value) {
    erro.value = 'O relatório de Resíduos já faz parte da central e será ativado quando a branch do módulo de resíduos for integrada à base de Relatórios.'
    return
  }

  carregando.value = true
  ultimaConsultaRelatorio.value = null
  try {
    if (relatorioProjetosSelecionado.value) {
      limparResultados()
      resultadoProjetos.value = await relatorioService.listarProjetos({
        laboratorioId: laboratorioId.value || undefined,
        status: projetoStatus.value || undefined,
        situacaoExecucao: projetoExecucao.value || undefined,
        ativo: projetoAtivo.value === '' ? undefined : projetoAtivo.value === 'ativo',
        recursoExterno: projetoRecurso.value === '' ? undefined : projetoRecurso.value === 'sim',
        dataInicio: dataInicio.value || undefined,
        dataFim: dataFim.value || undefined,
      })
      return
    }
    if (relatorioEstagiariosSelecionado.value) {
      limparResultados()
      resultadoEstagiarios.value = await relatorioService.listarEstagiarios({
        ativo: situacao.value === '' ? undefined : situacao.value === 'ativo',
        laboratorioId: laboratorioId.value || undefined,
        dataInicio: dataInicio.value || undefined,
        dataFim: dataFim.value || undefined,
      })
      return
    }

    if (relatorioProdutosSelecionado.value) {
      limparResultados()
      resultadoProdutos.value = await relatorioService.listarProdutos({
        ativo: produtoSituacao.value === '' ? undefined : produtoSituacao.value === 'ativo',
        fiscalizado: produtoFiscalizado.value === '' ? undefined : produtoFiscalizado.value === 'sim',
        perecivel: produtoPerecivel.value === '' ? undefined : produtoPerecivel.value === 'sim',
        risco: produtoRisco.value || undefined,
        orgaoFiscalizador: produtoOrgao.value || undefined,
      })
      return
    }

    if (relatorioMovimentacoesSelecionado.value) {
      limparResultados()
      resultadoMovimentacoes.value = await relatorioService.listarMovimentacoes({
        tipo: movimentoTipo.value || undefined,
        origem: movimentoOrigem.value || undefined,
        produtoId: movimentoProdutoId.value || undefined,
        laboratorioId: laboratorioId.value || undefined,
        usuarioId: movimentoUsuarioId.value || undefined,
        loteId: movimentoLoteId.value || undefined,
        tipoEmbalagem: movimentoEmbalagem.value || undefined,
        formaConsumo: movimentoForma.value || undefined,
        mostrarQuantidades: movimentoMostrarQuantidades.value,
        projetoId: movimentoProjetoId.value || undefined,
        sciId: movimentoSciId.value || undefined,
        atividadeId: movimentoAtividadeId.value || undefined,
        dataInicio: dataInicio.value || undefined,
        dataFim: dataFim.value || undefined,
      })
      return
    }

    if (relatorioResumoSelecionado.value) {
      limparResultados()
      resultadoResumoOperacional.value = await relatorioService.obterResumoOperacional({
        produtoId: resumoProdutoId.value || undefined,
        dataInicio: dataInicio.value || undefined,
        dataFim: dataFim.value || undefined,
      })
      return
    }

    if (relatorioEstoqueSelecionado.value) {
      limparResultados()
      resultadoEstoqueLotes.value = await relatorioService.listarEstoqueLotes({
        unidadeId: estoqueUnidadeId.value || undefined,
        produtoId: estoqueProdutoId.value || undefined,
        ativoEstoque: estoqueSituacao.value === '' ? undefined : estoqueSituacao.value === 'ativo',
        abaixoMinimo: estoqueNivel.value === '' ? undefined : estoqueNivel.value === 'sim',
        validade: estoqueSituacaoLote.value || undefined,
        diasVencimento: estoqueDiasVencimento.value,
      })
      return
    }

    limparResultados()
    resultadoFiscalizacao.value = await relatorioService.listarFiscalizacao({
      produtoId: fiscalProdutoId.value || undefined,
      orgaoFiscalizador: fiscalOrgao.value || undefined,
      unidadeId: fiscalUnidadeId.value || undefined,
      dataInicio: dataInicio.value || undefined,
      dataFim: dataFim.value || undefined,
      diasVencimento: fiscalDiasVencimento.value,
    })
  } catch (e) {
    console.error(e)
    limparResultados()
    erro.value = 'Não foi possível carregar o relatório. Verifique a API e tente novamente.'
  } finally {
    carregando.value = false
  }
}

function formatarData(valor: string | null) {
  if (!valor) return '—'
  const [ano, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarDataHora(valor: string) {
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return valor
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(data)
}

function formatarRotulo(valor: string | null) {
  if (!valor) return '—'
  return valor
    .toLocaleLowerCase('pt-BR')
    .replaceAll('_', ' ')
    .replace(/(^|\s)\S/g, (letra) => letra.toLocaleUpperCase('pt-BR'))
}

function formatarOrgaos(valores: string[]) {
  if (!valores.length) return '—'
  return valores.map((item) => formatarRotulo(item)).join(', ')
}

function unidadeProduto(id?: string | null) {
  return produtos.value.find((produto) => produto.id === id)?.unidadeMedida ?? null
}

function formatarQuantidadeComUnidade(valor: number, unidade?: string | null) {
  const numero = Number(valor)
  const formatado = Number.isFinite(numero)
    ? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 }).format(numero)
    : String(valor)
  const simbolos: Record<string, string> = {
    ML: 'mL', L: 'L', MG: 'mg', G: 'g', KG: 'kg',
    METRO: 'm', UNIDADE: 'un.', REACAO: 'reações',
  }
  return unidade ? `${formatado} ${simbolos[unidade] ?? unidade}` : formatado
}

function sinalQuantidade(tipo: TipoMovimentacaoRelatorio) {
  if (tipo === 'ENTRADA' || tipo === 'DEVOLUCAO') return '+'
  if (tipo === 'SAIDA' || tipo === 'DESCARTE_VENCIMENTO') return '−'
  return ''
}

function classeSituacaoLote(situacaoLote: SituacaoLoteRelatorio) {
  if (situacaoLote === 'VALIDO') return 'status--ativo'
  if (situacaoLote === 'PROXIMO_VENCIMENTO') return 'status--alerta'
  if (situacaoLote === 'VENCIDO') return 'status--critico'
  return 'status--inativo'
}

watch([
  situacao, laboratorioId, dataInicio, dataFim, tipoBolsa, busca,
  produtoSituacao, produtoFiscalizado, produtoPerecivel, produtoRisco, produtoOrgao,
  movimentoTipo, movimentoOrigem, movimentoProdutoId, movimentoUsuarioId, movimentoLoteId, movimentoEmbalagem,
  movimentoProjetoId, movimentoSciId, movimentoAtividadeId, movimentoMostrarQuantidades, movimentoApresentacao,
  resumoProdutoId, estoqueUnidadeId, estoqueProdutoId,
  estoqueSituacao, estoqueNivel, estoqueSituacaoLote, estoqueDiasVencimento,
  fiscalProdutoId, fiscalOrgao, fiscalUnidadeId, fiscalDiasVencimento,
  projetoStatus, projetoExecucao, projetoAtivo, projetoRecurso,
], () => {
  ultimaConsultaRelatorio.value = null
  limparResultados()
})

const projetosDoLaboratorio = computed(() =>
  projetosContexto.value.filter((p) => !laboratorioId.value || p.laboratorioId === laboratorioId.value))
watch(laboratorioId, () => {
  movimentoProjetoId.value = ''
  movimentoSciId.value = ''
  movimentoAtividadeId.value = ''
})
watch(movimentoProjetoId, async (id) => {
  movimentoSciId.value = ''
  movimentoAtividadeId.value = ''
  scisContexto.value = []
  atividadesContexto.value = []
  if (!id) return
  try {
    scisContexto.value = await projetosService.listarScisPorProjeto(id)
  } catch (e) { console.error('Falha ao carregar SCIs', e) }
})
watch(movimentoSciId, async (id) => {
  movimentoAtividadeId.value = ''
  atividadesContexto.value = []
  if (!id || !movimentoProjetoId.value) return
  try {
    atividadesContexto.value = (await projetosService.listarAtividadesPorProjeto(movimentoProjetoId.value))
      .filter((a) => a.sciId === id)
  } catch (e) { console.error('Falha ao carregar atividades', e) }
})
watch(movimentoApresentacao, (valor) => {
  if (valor === 'MEDIDA') {
    movimentoForma.value = 'POR_MEDIDA'
    movimentoEmbalagem.value = ''
    movimentoMostrarQuantidades.value = true
  } else if (valor.startsWith('EMBALAGEM:')) {
    movimentoForma.value = 'COMPLETA'
    movimentoEmbalagem.value = valor.slice('EMBALAGEM:'.length)
  } else {
    movimentoForma.value = ''
    movimentoEmbalagem.value = ''
  }
})

watch(movimentoProdutoId, async (id) => {
  movimentoApresentacao.value = ''
  movimentoForma.value = ''
  movimentoEmbalagem.value = ''
  embalagensDisponiveis.value = []
  if (!id) return
  try {
    const { data } = await http.get<string[]>('/v1/relatorios/movimentacoes/embalagens', { params: { produtoId: id } })
    if (movimentoProdutoId.value === id) embalagensDisponiveis.value = data
  } catch (e) { console.error('Falha ao consultar embalagens do produto', e) }
})

onMounted(async () => {
  const resultados = await Promise.allSettled([
    http.get<LaboratorioResumo[]>('/v1/laboratorios'),
    http.get<UnidadeResumo[]>('/v1/unidades'),
    http.get<ProdutoResumo[]>('/v1/produtos'),
    http.get<UsuarioResumo[]>('/v1/usuarios'),
    http.get<LoteResumo[]>('/v1/lotes'),
  ])

  const [labs, units, prods, users, lots] = resultados
  try { projetosContexto.value = await projetosService.listarProjetos() } catch (e) { console.error('Falha ao carregar Projetos', e) }
  if (labs.status === 'fulfilled') laboratorios.value = [...labs.value.data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  if (units.status === 'fulfilled') unidades.value = [...units.value.data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  if (prods.status === 'fulfilled') produtos.value = [...prods.value.data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  if (users.status === 'fulfilled') usuarios.value = [...users.value.data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  if (lots.status === 'fulfilled') lotes.value = [...lots.value.data].sort((a, b) => (a.codigoInterno ?? '').localeCompare(b.codigoInterno ?? '', 'pt-BR'))
})
</script>

<template>
  <section class="relatorios-page">
    <header class="relatorios-header">
      <h1>Relatórios</h1>
      <p>Consulte dados e gere relatórios do sistema</p>
    </header>

    <div class="relatorios-grid">
      <aside class="relatorios-selector card">
        <h2>1. Escolha o relatório</h2>
        <div class="relatorios-lista">
          <button v-for="item in relatorios" :key="item.id" class="relatorio-opcao" :class="{ 'relatorio-opcao--ativo': relatorioSelecionado === item.id }" type="button" @click="selecionarRelatorio(item.id)">
            <span class="relatorio-opcao__icone" aria-hidden="true">
              <svg v-if="item.icone === 'documento'" viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6" /></svg>
              <svg v-else-if="item.icone === 'produto'" viewBox="0 0 24 24"><path d="M5 7 12 3l7 4v10l-7 4-7-4zM5 7l7 4 7-4M12 11v10" /></svg>
              <svg v-else-if="item.icone === 'troca'" viewBox="0 0 24 24"><path d="M4 8h14M15 5l3 3-3 3M20 16H6M9 13l-3 3 3 3" /></svg>
              <svg v-else-if="item.icone === 'resumo'" viewBox="0 0 24 24"><path d="M5 3h11v14H5zM8 7h5M8 10h5M8 13h3M17 13h3v8h-8v-3M16 17h1M16 15v4" /></svg>
              <svg v-else-if="item.icone === 'estoque'" viewBox="0 0 24 24"><path d="M4 7h16v13H4zM7 7V4h10v3M4 12h16M9 12v3h6v-3" /></svg>
              <svg v-else-if="item.icone === 'residuo'" viewBox="0 0 24 24"><path d="M9 3h6M10 3v5l-5 9a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-9V3M8 15h8" /></svg>
              <svg v-else viewBox="0 0 24 24"><path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6zM12 8v8M9 12h6" /></svg>
            </span>
            <span class="relatorio-opcao__texto"><strong>{{ item.titulo }}</strong><small>{{ item.descricao }}</small></span>
          </button>
        </div>
        <div class="exportacao-info"><span class="exportacao-info__icone">i</span><div><strong>Exportação</strong><p>Todos os relatórios poderão ser exportados em <b>PDF</b> ou <b>Excel</b>.</p></div></div>
      </aside>

      <div class="relatorios-content">
        <section class="card filtros-card">
          <div class="card-title"><h2>2. Filtros do relatório: {{ opcaoSelecionada.titulo }}</h2></div>

          <div v-if="relatorioSelecionado === 'movimentacoes'" class="modo-movimentacoes">
            <button type="button" :class="{ 'modo-ativo': modoMovimentacoes === 'resumo' }" @click="modoMovimentacoes = 'resumo'">Resumo</button>
            <button type="button" :class="{ 'modo-ativo': modoMovimentacoes === 'detalhamento' }" @click="modoMovimentacoes = 'detalhamento'">Detalhamento</button>
          </div>

          <div v-if="relatorioEstagiariosSelecionado" class="filtros-body">
            <div class="campo"><label for="situacao">Situação</label><select id="situacao" v-model="situacao"><option value="">Todos</option><option value="ativo">Ativos</option><option value="inativo">Inativos</option></select></div>
            <div class="campo"><label for="laboratorio">Laboratório</label><select id="laboratorio" v-model="laboratorioId"><option value="">Todos os laboratórios</option><option v-for="laboratorio in laboratorios" :key="laboratorio.id" :value="laboratorio.id">{{ laboratorio.nome }}</option></select></div>
            <div class="campo campo--periodo"><label>Período do estágio</label><div class="periodo-inputs"><input v-model="dataInicio" type="date" aria-label="Data inicial" /><span>até</span><input v-model="dataFim" type="date" aria-label="Data final" /></div></div>
            <div class="campo"><label for="tipoBolsa">Tipo de bolsa</label><select id="tipoBolsa" v-model="tipoBolsa"><option value="">Todos</option><option v-for="tipo in tiposBolsa" :key="tipo" :value="tipo">{{ formatarRotulo(tipo) }}</option></select></div>
            <div class="campo campo--busca"><label for="busca">Buscar por nome ou email</label><input id="busca" v-model="busca" type="search" placeholder="Digite o nome ou email do estagiário" /></div>
          </div>

          <div v-else-if="relatorioProdutosSelecionado" class="filtros-body filtros-body--produtos">
            <div class="campo"><label for="produto-situacao">Situação</label><select id="produto-situacao" v-model="produtoSituacao"><option value="">Todos</option><option value="ativo">Ativos</option><option value="inativo">Inativos</option></select></div>
            <div class="campo"><label for="produto-fiscalizado">Fiscalizado</label><select id="produto-fiscalizado" v-model="produtoFiscalizado"><option value="">Todos</option><option value="sim">Sim</option><option value="nao">Não</option></select></div>
            <div class="campo"><label for="produto-perecivel">Perecível</label><select id="produto-perecivel" v-model="produtoPerecivel"><option value="">Todos</option><option value="sim">Sim</option><option value="nao">Não</option></select></div>
            <div class="campo"><label for="produto-risco">Nível de risco</label><select id="produto-risco" v-model="produtoRisco"><option value="">Todos</option><option value="NENHUM">Nenhum</option><option value="BAIXO">Baixo</option><option value="MEDIO">Médio</option><option value="ALTO">Alto</option></select></div>
            <div class="campo campo--busca"><label for="produto-orgao">Órgão fiscalizador</label><select id="produto-orgao" v-model="produtoOrgao"><option value="">Todos os órgãos</option><option value="POLICIA_FEDERAL">Polícia Federal</option><option value="VIGILANCIA_SANITARIA">Vigilância Sanitária</option><option value="ANVISA">ANVISA</option><option value="EXERCITO">Exército</option><option value="OUTRO">Outro</option></select></div>
          </div>

          <div v-else-if="relatorioProjetosSelecionado" class="filtros-body filtros-body--projetos">
            <div class="campo"><label for="projeto-laboratorio">Laboratório</label><select id="projeto-laboratorio" v-model="laboratorioId"><option value="">Todos os laboratórios</option><option v-for="lab in laboratorios" :key="lab.id" :value="lab.id">{{ lab.nome }}</option></select></div>
            <div class="campo"><label for="projeto-status">Status</label><select id="projeto-status" v-model="projetoStatus"><option value="">Todos</option><option value="ATIVO">Ativo</option><option value="ENCERRADO_COM_AVALIACAO_PENDENTE">Encerrado com avaliação pendente</option><option value="CONCLUIDO">Concluído</option></select></div>
            <div class="campo"><label for="projeto-execucao">Situação de execução</label><select id="projeto-execucao" v-model="projetoExecucao"><option value="">Todas</option><option value="NAO_INFORMADO">Não informado</option><option value="EM_ANDAMENTO_NO_PRAZO">Em andamento no prazo</option><option value="EM_ANDAMENTO_ATRASADO">Em andamento atrasado</option><option value="EXECUCAO_CANCELADA">Execução cancelada</option></select></div>
            <div class="campo"><label for="projeto-ativo">Registro</label><select id="projeto-ativo" v-model="projetoAtivo"><option value="">Todos</option><option value="ativo">Ativos</option><option value="inativo">Inativos</option></select></div>
            <div class="campo"><label for="projeto-recurso">Recurso externo</label><select id="projeto-recurso" v-model="projetoRecurso"><option value="">Todos</option><option value="sim">Sim</option><option value="nao">Não</option></select></div>
            <div class="campo campo--periodo"><label>Período de execução</label><div class="periodo-inputs"><input v-model="dataInicio" type="date" aria-label="Início do período" /><span>até</span><input v-model="dataFim" type="date" aria-label="Fim do período" /></div></div>
          </div>

          <div v-else-if="relatorioMovimentacoesSelecionado" class="filtros-body filtros-body--movimentacoes">
            <div class="campo"><label for="mov-tipo">Movimentação</label><select id="mov-tipo" v-model="movimentoTipo"><option value="">Todas</option><option value="ENTRADA">Entrada</option><option value="SAIDA">Saída</option><option value="AJUSTE_ENTRADA">Ajuste de entrada</option><option value="AJUSTE_SAIDA">Ajuste de saída</option><option value="DEVOLUCAO">Devolução</option><option value="DESCARTE_VENCIMENTO">Descarte</option></select></div>
            <div class="campo"><label for="mov-origem">Origem</label><select id="mov-origem" v-model="movimentoOrigem"><option value="">Todas</option><option value="PEDIDO">Pedido</option><option value="COMPRA">Compra</option><option value="AJUSTE">Ajuste</option><option value="DEVOLUCAO">Devolução</option><option value="INVENTARIO">Inventário</option><option value="DESCARTE">Descarte</option></select></div>
            <div class="campo"><label for="mov-lab">Laboratório</label><select id="mov-lab" v-model="laboratorioId"><option value="">Todos</option><option v-for="lab in laboratorios" :key="lab.id" :value="lab.id">{{ lab.nome }}</option></select></div>
            <div class="campo"><label for="mov-projeto">Projeto</label><select id="mov-projeto" v-model="movimentoProjetoId"><option value="">Todos / Sem filtro</option><option v-for="projeto in projetosDoLaboratorio" :key="projeto.id" :value="projeto.id">{{ projeto.nome }}</option></select></div>
            <div class="campo"><label for="mov-sci">SCI</label><select id="mov-sci" v-model="movimentoSciId" :disabled="!movimentoProjetoId"><option value="">Todos</option><option v-for="sci in scisContexto" :key="sci.id" :value="sci.id">{{ sci.nome }}</option></select></div>
            <div class="campo"><label for="mov-atividade">Atividade</label><select id="mov-atividade" v-model="movimentoAtividadeId" :disabled="!movimentoSciId"><option value="">Todas</option><option v-for="atividade in atividadesContexto" :key="atividade.id" :value="atividade.id">{{ atividade.nome }}</option></select></div>
            <div class="campo"><label for="mov-produto">Produto</label><select id="mov-produto" v-model="movimentoProdutoId"><option value="">Todos os produtos</option><option v-for="produto in produtos" :key="produto.id" :value="produto.id">{{ produto.nome }}</option></select></div>
            <div class="campo"><label for="mov-apresentacao">Apresentação / Unidade</label><select id="mov-apresentacao" v-model="movimentoApresentacao" :disabled="!movimentoProdutoId"><option value="">Todas as apresentações</option><option value="MEDIDA">{{ unidadeProduto(movimentoProdutoId) === 'REACAO' ? 'Reação individual' : unidadeProduto(movimentoProdutoId) === 'UNIDADE' ? 'Unidade individual' : `Por medida (${formatarRotulo(unidadeProduto(movimentoProdutoId))})` }}</option><option v-for="emb in embalagensDisponiveis.filter(item => item !== 'UNITARIO')" :key="emb" :value="`EMBALAGEM:${emb}`">{{ formatarRotulo(emb) }} completo</option></select></div>
            <div class="campo campo--periodo"><label>Período da movimentação</label><div class="periodo-inputs"><input v-model="dataInicio" type="date" aria-label="Data inicial" /><span>até</span><input v-model="dataFim" type="date" aria-label="Data final" /></div></div>
            <div class="campo campo--quantidades"><label class="movimento-checkbox"><input v-model="movimentoMostrarQuantidades" type="checkbox" /><span>Mostrar quantidades físicas</span></label><small>Desmarcado: contar movimentações. Marcado: incluir quantidades do produto.</small></div>
            <div class="campo campo--busca"><button type="button" class="btn btn--ghost" @click="movimentoMaisFiltros = !movimentoMaisFiltros">{{ movimentoMaisFiltros ? 'Ocultar filtros adicionais' : 'Mais filtros' }}</button></div>
            <template v-if="movimentoMaisFiltros">
              <div class="campo"><label for="mov-usuario">Responsável pela operação</label><select id="mov-usuario" v-model="movimentoUsuarioId"><option value="">Todos</option><option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">{{ usuario.nome }}</option></select></div>
              <div class="campo"><label for="mov-lote">Lote</label><select id="mov-lote" v-model="movimentoLoteId"><option value="">Todos</option><option v-for="lote in lotes" :key="lote.id" :value="lote.id">{{ lote.codigoInterno || lote.numeroLote || lote.id }}</option></select></div>
            </template>
          </div>

          <div v-else-if="relatorioResumoSelecionado" class="filtros-body filtros-body--resumo">
            <div class="campo"><label for="resumo-produto">Produto</label><select id="resumo-produto" v-model="resumoProdutoId"><option value="">Todos os produtos</option><option v-for="produto in produtos" :key="produto.id" :value="produto.id">{{ produto.nome }}</option></select></div>
            <div class="campo campo--periodo"><label>Período analisado</label><div class="periodo-inputs"><input v-model="dataInicio" type="date" aria-label="Data inicial" /><span>até</span><input v-model="dataFim" type="date" aria-label="Data final" /></div></div>
          </div>

          <div v-else-if="relatorioEstoqueSelecionado" class="filtros-body filtros-body--estoque">
            <div class="campo"><label for="estoque-unidade">Unidade</label><select id="estoque-unidade" v-model="estoqueUnidadeId"><option value="">Todas as unidades</option><option v-for="unidade in unidades" :key="unidade.id" :value="unidade.id">{{ unidade.sigla ? `${unidade.sigla} — ${unidade.nome}` : unidade.nome }}</option></select></div>
            <div class="campo"><label for="estoque-produto">Produto</label><select id="estoque-produto" v-model="estoqueProdutoId"><option value="">Todos os produtos</option><option v-for="produto in produtos" :key="produto.id" :value="produto.id">{{ produto.nome }}</option></select></div>
            <div class="campo"><label for="estoque-situacao">Situação do estoque</label><select id="estoque-situacao" v-model="estoqueSituacao"><option value="">Todos</option><option value="ativo">Ativos</option><option value="inativo">Inativos</option></select></div>
            <div class="campo"><label for="estoque-nivel">Nível do estoque</label><select id="estoque-nivel" v-model="estoqueNivel"><option value="">Todos</option><option value="sim">Abaixo ou igual ao mínimo</option><option value="nao">Acima do mínimo</option></select></div>
            <div class="campo"><label for="estoque-lote-situacao">Situação do lote</label><select id="estoque-lote-situacao" v-model="estoqueSituacaoLote"><option value="">Todos</option><option value="VALIDO">Válido</option><option value="PROXIMO_VENCIMENTO">Próximo do vencimento</option><option value="VENCIDO">Vencido</option><option value="SEM_VALIDADE">Sem validade</option><option value="ESGOTADO">Esgotado</option><option value="INATIVO">Inativo</option></select></div>
            <div class="campo"><label for="estoque-dias">Janela de vencimento</label><select id="estoque-dias" v-model.number="estoqueDiasVencimento"><option :value="7">Próximos 7 dias</option><option :value="15">Próximos 15 dias</option><option :value="30">Próximos 30 dias</option><option :value="60">Próximos 60 dias</option><option :value="90">Próximos 90 dias</option></select></div>
          </div>

          <div v-else-if="relatorioFiscalizacaoSelecionado" class="filtros-body filtros-body--fiscalizacao">
            <div class="campo"><label for="fiscal-produto">Produto fiscalizado</label><select id="fiscal-produto" v-model="fiscalProdutoId"><option value="">Todos os produtos fiscalizados</option><option v-for="produto in produtosFiscalizados" :key="produto.id" :value="produto.id">{{ produto.nome }}</option></select></div>
            <div class="campo"><label for="fiscal-orgao">Órgão fiscalizador</label><select id="fiscal-orgao" v-model="fiscalOrgao"><option value="">Todos os órgãos</option><option value="POLICIA_FEDERAL">Polícia Federal</option><option value="VIGILANCIA_SANITARIA">Vigilância Sanitária</option><option value="ANVISA">ANVISA</option><option value="EXERCITO">Exército</option><option value="OUTRO">Outro</option></select></div>
            <div class="campo"><label for="fiscal-unidade">Unidade</label><select id="fiscal-unidade" v-model="fiscalUnidadeId"><option value="">Todas as unidades</option><option v-for="unidade in unidades" :key="unidade.id" :value="unidade.id">{{ unidade.sigla ? `${unidade.sigla} — ${unidade.nome}` : unidade.nome }}</option></select></div>
            <div class="campo campo--periodo"><label>Período das movimentações</label><div class="periodo-inputs"><input v-model="dataInicio" type="date" aria-label="Data inicial" /><span>até</span><input v-model="dataFim" type="date" aria-label="Data final" /></div></div>
            <div class="campo"><label for="fiscal-dias">Janela de vencimento</label><select id="fiscal-dias" v-model.number="fiscalDiasVencimento"><option :value="7">Próximos 7 dias</option><option :value="15">Próximos 15 dias</option><option :value="30">Próximos 30 dias</option><option :value="60">Próximos 60 dias</option><option :value="90">Próximos 90 dias</option></select></div>
          </div>

          <div v-else class="filtros-indisponiveis"><strong>{{ opcaoSelecionada.titulo }}</strong><span>A opção já está reservada. A consulta será ativada após a integração do módulo de Resíduos à base de Relatórios.</span></div>

          <div class="filtros-actions">
            <button class="btn btn--primary" type="button" :disabled="carregando" @click="visualizarRelatorio"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>{{ carregando ? 'Carregando...' : 'Visualizar relatório' }}</button>
            <button class="btn btn--ghost" type="button" @click="limparFiltros"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10M9 7V4h6v3M8 7l1 13h6l1-13M11 11v5M13 11v5" /></svg>Limpar filtros</button>
          </div>
        </section>

        <section class="card preview-card">
          <div class="card-title"><h2>3. Prévia do relatório</h2><span v-if="geradoEm" class="preview-gerado">Gerado em {{ formatarDataHora(geradoEm) }}</span></div>
          <div v-if="erro" class="preview-message preview-message--warning"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 21h20zM12 9v5M12 18h.01" /></svg><p>{{ erro }}</p></div>
          <div v-else-if="!possuiResultado" class="preview-empty"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 8h24l10 10v38H16zM40 8v12h12M24 30h18M24 38h18M24 46h12" /></svg><strong>Nenhum relatório visualizado</strong><p>Defina os filtros desejados e clique em <b>Visualizar relatório</b> para ver os dados aqui.</p></div>

          <div v-else-if="relatorioEstagiariosSelecionado && resultadoEstagiarios" class="preview-result">
            <div class="resumo-cards"><article><span>Total</span><strong>{{ resumoEstagiarios.total }}</strong></article><article><span>Ativos</span><strong>{{ resumoEstagiarios.ativos }}</strong></article><article><span>Inativos</span><strong>{{ resumoEstagiarios.inativos }}</strong></article></div>
            <div class="table-wrap"><table><thead><tr><th>Estagiário</th><th>Laboratório</th><th>Unidade</th><th>Bolsa</th><th>Início</th><th>Fim</th><th>Situação</th></tr></thead><tbody><tr v-for="item in itensEstagiariosFiltrados" :key="item.id"><td><strong>{{ item.nome }}</strong><small>{{ item.email }}</small></td><td>{{ item.laboratorioNome || '—' }}</td><td>{{ item.unidadeNome || '—' }}</td><td>{{ formatarRotulo(item.tipoBolsa) }}</td><td>{{ formatarData(item.dataInicioEstagio) }}</td><td>{{ formatarData(item.dataFimEstagio) }}</td><td><span class="status" :class="item.ativo ? 'status--ativo' : 'status--inativo'">{{ item.ativo ? 'Ativo' : 'Inativo' }}</span></td></tr><tr v-if="itensEstagiariosFiltrados.length === 0"><td colspan="7" class="table-empty">Nenhum estagiário encontrado com os filtros informados.</td></tr></tbody></table></div>
          </div>

          <div v-else-if="relatorioProdutosSelecionado && resultadoProdutos" class="preview-result">
            <div class="resumo-cards resumo-cards--produtos"><article><span>Produtos</span><strong>{{ resultadoProdutos.total }}</strong></article><article><span>Ativos</span><strong>{{ resultadoProdutos.ativos }}</strong></article><article><span>Inativos</span><strong>{{ resultadoProdutos.inativos }}</strong></article><article><span>Fiscalizados</span><strong>{{ resultadoProdutos.fiscalizados }}</strong></article><article><span>Perecíveis</span><strong>{{ resultadoProdutos.pereciveis }}</strong></article><article><span>Com risco</span><strong>{{ resultadoProdutos.comRisco }}</strong></article></div>
            <div class="table-wrap"><table class="produtos-table"><thead><tr><th>Produto</th><th>Código</th><th>Unidade</th><th>Risco</th><th>Perecível</th><th>Fiscalização</th><th>Situação</th></tr></thead><tbody><tr v-for="item in resultadoProdutos.itens" :key="item.id"><td><strong>{{ item.nome }}</strong><small>{{ item.localizacaoFisica || item.descricao || 'Sem informação complementar' }}</small></td><td>{{ item.codigoReferencia || '—' }}</td><td>{{ formatarRotulo(item.unidadeMedida) }}</td><td><span class="status" :class="item.risco === 'ALTO' ? 'status--risco-alto' : item.risco === 'MEDIO' ? 'status--risco-medio' : 'status--neutro'">{{ formatarRotulo(item.risco) }}</span></td><td>{{ item.perecivel ? 'Sim' : 'Não' }}</td><td><span v-if="item.fiscalizado" class="status status--fiscalizado">{{ formatarOrgaos(item.orgaosFiscalizadores) }}</span><span v-else>Não</span></td><td><span class="status" :class="item.ativo ? 'status--ativo' : 'status--inativo'">{{ item.ativo ? 'Ativo' : 'Inativo' }}</span></td></tr><tr v-if="resultadoProdutos.itens.length === 0"><td colspan="7" class="table-empty">Nenhum produto encontrado com os filtros informados.</td></tr></tbody></table></div>
          </div>

          <div v-else-if="relatorioProjetosSelecionado && resultadoProjetos" class="preview-result">
            <div class="resumo-cards">
              <article><span>Projetos</span><strong>{{ resultadoProjetos.totalProjetos }}</strong></article>
              <article><span>SCI</span><strong>{{ resultadoProjetos.totalScis }}</strong></article>
              <article><span>Atividades</span><strong>{{ resultadoProjetos.totalAtividades }}</strong></article>
              <article><span>Participações</span><strong>{{ resultadoProjetos.totalParticipacoes }}</strong></article>
              <article><span>Estagiários distintos</span><strong>{{ resultadoProjetos.totalEstagiariosDistintos }}</strong></article>
            </div>
            <div class="table-wrap"><table>
              <thead><tr><th>Código SEG / Projeto</th><th>Laboratório</th><th>Responsável</th><th>Período</th><th>Status</th><th>Execução</th><th>Recurso externo</th><th>SCI</th><th>Atividades</th><th>Participações</th><th>Estagiários</th></tr></thead>
              <tbody>
                <tr v-for="item in resultadoProjetos.projetos" :key="item.id">
                  <td><strong>{{ item.nome }}</strong><small>{{ item.codigoSeg || 'Sem código SEG' }}</small></td>
                  <td>{{ item.laboratorioNome }}</td><td>{{ item.responsavel || '—' }}</td>
                  <td>{{ formatarData(item.dataInicio) }} – {{ formatarData(item.dataFim) }}</td>
                  <td><span class="status" :class="item.ativo ? 'status--ativo' : 'status--inativo'">{{ formatarRotulo(item.status) }}</span></td>
                  <td>{{ formatarRotulo(item.situacaoExecucao) }}</td>
                  <td>{{ item.possuiRecursoExterno ? item.empresaRecursoExterno || 'Sim' : 'Não' }}</td>
                  <td>{{ item.totalScis }}</td><td>{{ item.totalAtividades }}</td><td>{{ item.totalParticipacoes }}</td><td>{{ item.totalEstagiarios }}</td>
                </tr>
                <tr v-if="resultadoProjetos.projetos.length === 0"><td colspan="11" class="table-empty">Nenhum Projeto encontrado para os filtros informados.</td></tr>
              </tbody>
            </table></div>
          </div>

          <div v-else-if="relatorioMovimentacoesSelecionado && resultadoMovimentacoes" class="preview-result">
            <div class="resumo-cards resumo-cards--movimentacoes"><article><span>Movimentações</span><strong>{{ resultadoMovimentacoes.totalMovimentacoes }}</strong></article><article><span>Entradas</span><strong>{{ resultadoMovimentacoes.itens.filter(item => item.tipoMovimentacao === 'ENTRADA').length }}</strong></article><article><span>Saídas</span><strong>{{ resultadoMovimentacoes.itens.filter(item => item.tipoMovimentacao === 'SAIDA').length }}</strong></article><article><span>Devoluções</span><strong>{{ resultadoMovimentacoes.itens.filter(item => item.tipoMovimentacao === 'DEVOLUCAO').length }}</strong></article><article><span>Descartes</span><strong>{{ resultadoMovimentacoes.itens.filter(item => item.tipoMovimentacao === 'DESCARTE_VENCIMENTO').length }}</strong></article><article><span>Ajustes</span><strong>{{ resultadoMovimentacoes.itens.filter(item => item.tipoMovimentacao === 'AJUSTE_ENTRADA' || item.tipoMovimentacao === 'AJUSTE_SAIDA').length }}</strong></article></div>
            <div v-if="movimentoMostrarQuantidades && resultadoMovimentacoes.itens.length" class="totais-produto">
              <strong>Quantidades por produto e unidade</strong>
              <div v-for="grupo in quantidadesAgrupadas" :key="grupo.id">{{ grupo.nome }} · {{ formatarRotulo(grupo.tipo) }}: {{ formatarQuantidadeComUnidade(grupo.quantidade, grupo.unidade) }}</div>
            </div>
            <p v-if="movimentoEmbalagem && resultadoMovimentacoes.itens.length" class="embalagem-nota">Embalagem filtrada: {{ formatarRotulo(movimentoEmbalagem) }}. Uma saída pode retirar apenas parte do conteúdo de um recipiente; quantidade física e número de recipientes não são equivalentes.</p>
            <div class="table-wrap"><table class="movimentacoes-table"><thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Forma de consumo</th><th v-if="movimentoEmbalagem">Recipientes utilizados</th><th v-if="movimentoMostrarQuantidades">Quantidade retirada</th><th>Lote</th><th>Laboratório</th><th>Origem</th><th>Responsável</th><th v-if="movimentoMostrarQuantidades">Saldo</th></tr></thead><tbody><tr v-for="item in resultadoMovimentacoes.itens" :key="item.id"><td>{{ formatarDataHora(item.dataMovimentacao) }}</td><td><strong>{{ item.produtoNome }}</strong><small v-if="item.pedidoSolicitanteNome">Solicitante: {{ item.pedidoSolicitanteNome }}</small></td><td><span
  class="status status--mov"
  :class="{
    'status--mov-entrada': item.tipoMovimentacao === 'ENTRADA' || item.tipoMovimentacao === 'DEVOLUCAO',
    'status--mov-saida': item.tipoMovimentacao === 'SAIDA',
    'status--mov-ajuste': (item.tipoMovimentacao === 'AJUSTE_ENTRADA' || item.tipoMovimentacao === 'AJUSTE_SAIDA'),
    'status--mov-descarte': item.tipoMovimentacao === 'DESCARTE_VENCIMENTO'
  }"
>
  {{ formatarRotulo(item.tipoMovimentacao) }}
</span></td><td>{{ formatarRotulo(item.formaConsumoIdentificada || 'NAO_DETERMINADA') }}</td><td v-if="movimentoEmbalagem">{{ item.recipientesUtilizados ?? "—" }} {{ formatarRotulo(movimentoEmbalagem).toLowerCase() }}(s)</td><td v-if="movimentoMostrarQuantidades" class="quantidade" :class="{ 'quantidade--entrada': item.tipoMovimentacao === 'ENTRADA' || item.tipoMovimentacao === 'DEVOLUCAO', 'quantidade--saida': item.tipoMovimentacao === 'SAIDA' || item.tipoMovimentacao === 'DESCARTE_VENCIMENTO' }">{{ sinalQuantidade(item.tipoMovimentacao) }}{{ formatarQuantidadeComUnidade(item.quantidadeMovimentada, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }}</td><td><strong>{{ item.codigoInternoLote || '—' }}</strong><small v-if="item.numeroLote">Fornecedor: {{ item.numeroLote }}</small></td><td>{{ item.laboratorioNome || '—' }}</td><td>{{ formatarRotulo(item.origem) }}</td><td>{{ item.usuarioNome }}</td><td v-if="movimentoMostrarQuantidades">{{ formatarQuantidadeComUnidade(item.quantidadeAnterior, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }} → {{ formatarQuantidadeComUnidade(item.quantidadeAtual, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }}</td></tr><tr v-if="resultadoMovimentacoes.itens.length === 0"><td  :colspan="8 + (movimentoMostrarQuantidades ? 2 : 0) + (movimentoEmbalagem ? 1 : 0)" class="table-empty">Nenhuma movimentação encontrada com os filtros informados.</td></tr></tbody></table></div>
          </div>

          <div v-else-if="relatorioResumoSelecionado && resultadoResumoOperacional" class="preview-result">
            <div class="resumo-cards resumo-cards--movimentacoes resumo-cards--operacional">
              <article><span>Movimentações</span><strong>{{ resultadoResumoOperacional.totalMovimentacoes }}</strong></article>
              <article><span>Entradas</span><strong>{{ resultadoResumoOperacional.totalEntradas ?? '—' }}</strong></article>
              <article><span>Saídas</span><strong>{{ resultadoResumoOperacional.totalSaidas ?? '—' }}</strong></article>
              <article><span>Devoluções</span><strong>{{ resultadoResumoOperacional.totalDevolucoes ?? '—' }}</strong></article>
              <article><span>Ajustes</span><strong>{{ resultadoResumoOperacional.totalAjustes ?? '—' }}</strong></article>
              <article><span>Descartes</span><strong>{{ resultadoResumoOperacional.totalDescartes ?? '—' }}</strong></article>
            </div>
            <p class="resumo-explicacao">Os indicadores representam o número de movimentações registradas, independentemente da unidade de medida. Para consultar os registros, acesse Detalhamento.</p>
          </div>

          <div v-else-if="relatorioEstoqueSelecionado && resultadoEstoqueLotes" class="preview-result">
            <div class="resumo-cards resumo-cards--estoque"><article><span>Estoques</span><strong>{{ resultadoEstoqueLotes.totalEstoques }}</strong></article><article><span>Abaixo do mínimo</span><strong>{{ resultadoEstoqueLotes.estoquesAbaixoMinimo }}</strong></article><article><span>Saldo total</span><strong>Por produto</strong></article><article><span>Lotes ativos</span><strong>{{ resultadoEstoqueLotes.lotesAtivos }}</strong></article><article><span>Vencidos</span><strong>{{ resultadoEstoqueLotes.lotesVencidos }}</strong></article><article><span>Próx. vencimento</span><strong>{{ resultadoEstoqueLotes.lotesProximosVencimento }}</strong></article></div>
            <div class="section-heading"><h3>Posição de estoque</h3><span>Saldo atual comparado ao mínimo configurado</span></div>
            <div class="table-wrap"><table class="estoques-table"><thead><tr><th>Produto</th><th>Unidade</th><th>Saldo atual</th><th>Mínimo</th><th>Nível</th><th>Lotes ativos</th><th>Vencidos</th><th>Próx. vencimento</th></tr></thead><tbody><tr v-for="item in resultadoEstoqueLotes.estoques" :key="item.estoqueId"><td><strong>{{ item.produtoNome }}</strong><small>{{ item.codigoReferencia || formatarRotulo(item.unidadeMedida) }}</small></td><td>{{ item.unidadeSigla || item.unidadeNome }}</td><td class="quantidade">{{ formatarQuantidadeComUnidade(item.quantidadeAtual, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }}</td><td>{{ formatarQuantidadeComUnidade(item.quantidadeMinima, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }}</td><td><span class="status" :class="item.abaixoMinimo ? 'status--critico' : 'status--ativo'">{{ item.abaixoMinimo ? 'Abaixo do mínimo' : 'Normal' }}</span></td><td>{{ item.lotesAtivos }}</td><td>{{ item.lotesVencidos }}</td><td>{{ item.lotesProximosVencimento }}</td></tr><tr v-if="resultadoEstoqueLotes.estoques.length === 0"><td colspan="8" class="table-empty">Nenhum estoque encontrado com os filtros informados.</td></tr></tbody></table></div>
            <div class="section-heading section-heading--lotes"><h3>Lotes</h3><span>{{ resultadoEstoqueLotes.totalLotes }} lote(s) na consulta</span></div>
            <div class="table-wrap"><table class="lotes-table"><thead><tr><th>Lote</th><th>Produto</th><th>Unidade</th><th>Entrada</th><th>Inicial</th><th>Disponível</th><th>Validade</th><th>Situação</th><th>Apresentação</th><th>Recipientes</th></tr></thead><tbody><tr v-for="item in resultadoEstoqueLotes.lotes" :key="item.loteId"><td><strong>{{ item.codigoInterno }}</strong><small v-if="item.numeroLote">Fornecedor: {{ item.numeroLote }}</small></td><td>{{ item.produtoNome }}</td><td>{{ item.unidadeNome }}</td><td>{{ formatarData(item.dataEntrada) }}</td><td>{{ formatarQuantidadeComUnidade(item.quantidadeInicial, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }}</td><td class="quantidade">{{ formatarQuantidadeComUnidade(item.quantidadeDisponivel, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }}</td><td>{{ formatarData(item.dataValidade) }}</td><td><span class="status" :class="classeSituacaoLote(item.situacao)">{{ formatarRotulo(item.situacao) }}</span></td><td><strong>{{ item.apresentacao || formatarRotulo(item.tipoEmbalagem) }}</strong><small v-if="item.conteudoPorApresentacao">{{ formatarQuantidadeComUnidade(item.conteudoPorApresentacao, item.unidadeMedida) }} por apresentação</small></td><td><strong>{{ item.recipientesFechados ?? 0 }} fechados</strong><small>{{ item.recipientesAbertos ?? 0 }} abertos · {{ item.recipientesEsgotados ?? 0 }} esgotados</small></td></tr><tr v-if="resultadoEstoqueLotes.lotes.length === 0"><td colspan="10" class="table-empty">Nenhum lote encontrado com os filtros informados.</td></tr></tbody></table></div>
          </div>

          <div v-else-if="relatorioFiscalizacaoSelecionado && resultadoFiscalizacao" class="preview-result">
            <div class="resumo-cards resumo-cards--fiscalizacao">
              <article><span>Produtos fiscalizados</span><strong>{{ resultadoFiscalizacao.totalProdutosFiscalizados }}</strong></article>
              <article><span>Saldo atual</span><strong>Por produto</strong></article>
              <article><span>Lotes ativos</span><strong>{{ resultadoFiscalizacao.lotesAtivos }}</strong></article>
              <article><span>Lotes vencidos</span><strong>{{ resultadoFiscalizacao.lotesVencidos }}</strong></article>
              <article><span>Próx. vencimento</span><strong>{{ resultadoFiscalizacao.lotesProximosVencimento }}</strong></article>
              <article><span>Entradas no período</span><strong>Por produto</strong></article>
              <article><span>Saídas no período</span><strong>Por produto</strong></article>
            </div>

            <div class="section-heading"><h3>Produtos controlados</h3><span>Classificação, saldo e vencimentos</span></div>
            <div class="table-wrap"><table class="fiscal-produtos-table"><thead><tr><th>Produto</th><th>Órgão(s)</th><th>Saldo</th><th>Lotes ativos</th><th>Vencidos</th><th>Próx. venc.</th><th>Entradas</th><th>Saídas</th></tr></thead><tbody><tr v-for="item in resultadoFiscalizacao.produtos" :key="item.produtoId"><td><strong>{{ item.produtoNome }}</strong><small>{{ item.codigoReferencia || item.observacaoFiscalizacao || '—' }}</small></td><td><span class="status status--fiscalizado">{{ formatarOrgaos(item.orgaosFiscalizadores) }}</span></td><td class="quantidade">{{ formatarQuantidadeComUnidade(item.saldoAtual, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }}</td><td>{{ item.lotesAtivos }}</td><td><span :class="item.lotesVencidos ? 'quantidade quantidade--saida' : ''">{{ item.lotesVencidos }}</span></td><td><strong>{{ formatarData(item.proximoVencimento) }}</strong><small>{{ item.lotesProximosVencimento }} na janela</small></td><td class="quantidade quantidade--entrada">+{{ formatarQuantidadeComUnidade(item.quantidadeEntradas, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }}</td><td class="quantidade quantidade--saida">−{{ formatarQuantidadeComUnidade(item.quantidadeSaidas, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }}</td></tr><tr v-if="resultadoFiscalizacao.produtos.length === 0"><td colspan="8" class="table-empty">Nenhum produto fiscalizado encontrado com os filtros informados.</td></tr></tbody></table></div>

            <div class="section-heading section-heading--lotes"><h3>Rastreabilidade de movimentações</h3><span>Destino e responsáveis das movimentações dos produtos controlados</span></div>
            <div class="table-wrap"><table class="fiscalizacao-table"><thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Quantidade</th><th>Lote / validade</th><th>Laboratório</th><th>Projeto</th><th>Solicitante / pedido</th><th>Responsável</th><th>Saldo</th></tr></thead><tbody><tr v-for="item in resultadoFiscalizacao.movimentacoes" :key="item.movimentacaoId"><td>{{ formatarDataHora(item.dataMovimentacao) }}</td><td><strong>{{ item.produtoNome }}</strong></td><td><span
  class="status status--mov"
  :class="{
    'status--mov-entrada': item.tipoMovimentacao === 'ENTRADA' || item.tipoMovimentacao === 'DEVOLUCAO',
    'status--mov-saida': item.tipoMovimentacao === 'SAIDA',
    'status--mov-ajuste': (item.tipoMovimentacao === 'AJUSTE_ENTRADA' || item.tipoMovimentacao === 'AJUSTE_SAIDA'),
    'status--mov-descarte': item.tipoMovimentacao === 'DESCARTE_VENCIMENTO'
  }"
>
  {{ formatarRotulo(item.tipoMovimentacao) }}
</span></td><td class="quantidade" :class="{ 'quantidade--entrada': item.tipoMovimentacao === 'ENTRADA' || item.tipoMovimentacao === 'DEVOLUCAO', 'quantidade--saida': item.tipoMovimentacao === 'SAIDA' || item.tipoMovimentacao === 'DESCARTE_VENCIMENTO' }">{{ sinalQuantidade(item.tipoMovimentacao) }}{{ formatarQuantidadeComUnidade(item.quantidadeMovimentada, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }}</td><td><strong>{{ item.codigoInternoLote || '—' }}</strong><small>{{ item.numeroLote || 'Sem lote fornecedor' }} · {{ formatarData(item.dataValidadeLote) }}</small></td><td>{{ item.laboratorioNome || '—' }}</td><td>{{ item.projetoNome || '—' }}</td><td><strong>{{ item.solicitanteNome || '—' }}</strong><small v-if="item.pedidoId">Pedido: {{ item.pedidoId }}</small></td><td>{{ item.responsavelNome }}</td><td>{{ formatarQuantidadeComUnidade(item.saldoAposMovimentacao, item.unidadeMedida ?? unidadeProduto(item.produtoId)) }}</td></tr><tr v-if="resultadoFiscalizacao.movimentacoes.length === 0"><td colspan="10" class="table-empty">Nenhuma movimentação de produto fiscalizado encontrada no período.</td></tr></tbody></table></div>
          </div>
        </section>
      </div>
    </div>

    <footer class="exportacao-footer"><span>Após visualizar o relatório, você poderá exportá-lo nos formatos:</span><button type="button" disabled title="Exportação PDF será conectada ao backend na etapa de exportação"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v5h5" /></svg>PDF</button><button type="button" disabled title="Exportação Excel será conectada ao backend na etapa de exportação"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM9 4v16M9 9h10M9 14h10" /></svg>Excel</button></footer>
  </section>
</template>

<style scoped>
.campo--quantidades { grid-column: 1 / -1; display: flex; flex-direction: column; gap: 5px; align-items: flex-start; min-width: 0; }
.campo--quantidades .movimento-checkbox { display: inline-flex !important; gap: 8px; align-items: center; width: auto !important; margin: 0; font-weight: 600; cursor: pointer; }
.campo--quantidades .movimento-checkbox input { width: 16px !important; height: 16px !important; flex: 0 0 16px; padding: 0; margin: 0; accent-color: #4b82e7; }
.campo--quantidades small { display: block; font-size: 11px; line-height: 1.4; }
.embalagem-nota { padding: 0 20px 10px; margin: 0; color: var(--sgl-text-secondary, #94a3b8); font-size: 12px; }

.totais-produto { padding: 12px 20px; display: grid; gap: 6px; font-size: 13px; }
.movimento-checkbox { display: flex !important; align-items: center; gap: 9px; }
.movimento-checkbox input { width: auto; height: auto; }

.resumo-explicacao { padding: 0 20px 20px; color: var(--sgl-text-secondary, #64748b); font-size: 13px; }

.modo-movimentacoes { display: flex; gap: 8px; padding: 16px 20px 0; }
.modo-movimentacoes button { min-height: 40px; padding: 0 16px; border-radius: var(--sgl-radius-control, 6px); border: 1px solid var(--sgl-border, #cfd8e5); background: var(--sgl-surface, #fff); color: inherit; cursor: pointer; }
.modo-movimentacoes .modo-ativo { border-color: var(--sgl-primary, #1a4da1); color: var(--sgl-primary, #1a4da1); font-weight: 700; }
.filtros-body--projetos { grid-template-columns: repeat(3, minmax(0, 1fr)); }

.relatorios-page { width: 100%; max-width: 1500px; margin: 0 auto; padding: 30px 30px 38px; color: #1a2742; }
.relatorios-header { margin-bottom: 20px; }
.relatorios-header h1 { margin: 0; font-size: 30px; line-height: 1.15; color: #162541; letter-spacing: -.03em; }
.relatorios-header p { margin: 7px 0 0; color: #70809a; font-size: 14px; }
.relatorios-grid { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 20px; align-items: start; }
.relatorios-content { min-width: 0; display: grid; gap: 20px; }
.card { background: #fff; border: 1px solid #dde4ed; border-radius: 10px; box-shadow: 0 4px 16px rgb(17 35 64 / 7%); }
.relatorios-selector { padding: 18px 14px 14px; }
.relatorios-selector h2, .card-title h2 { margin: 0; color: #1d2d49; font-size: 16px; font-weight: 800; }
.relatorios-selector h2 { padding: 2px 4px 14px; }
.relatorios-lista { display: grid; gap: 8px; }
.relatorio-opcao { width: 100%; min-height: 80px; display: flex; align-items: center; gap: 13px; padding: 13px 14px; border: 1px solid #e1e7ef; border-radius: 7px; background: #fff; color: #24334d; text-align: left; cursor: pointer; transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease; }
.relatorio-opcao:hover { border-color: #aac3ed; background: #fbfdff; }
.relatorio-opcao--ativo { border-color: #4b82e7; background: #f4f8ff; box-shadow: inset 0 0 0 1px rgb(75 130 231 / 8%); }
.relatorio-opcao__icone { width: 34px; height: 34px; flex: 0 0 auto; display: grid; place-items: center; color: #68768c; }
.relatorio-opcao--ativo .relatorio-opcao__icone { color: #1f66dc; }
.relatorio-opcao__icone svg { width: 25px; height: 25px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.relatorio-opcao__texto { min-width: 0; display: grid; gap: 4px; }
.relatorio-opcao__texto strong { font-size: 14px; }
.relatorio-opcao__texto small { color: #74839b; font-size: 12px; line-height: 1.35; }
.exportacao-info { margin-top: 12px; display: flex; gap: 11px; padding: 13px; border: 1px solid #72a0f3; border-radius: 7px; background: #f5f8ff; color: #2458b3; }
.exportacao-info__icone { width: 19px; height: 19px; flex: 0 0 auto; display: grid; place-items: center; margin-top: 1px; border-radius: 999px; background: #2e6ed9; color: #fff; font-size: 12px; font-weight: 900; }
.exportacao-info strong { font-size: 13px; }
.exportacao-info p { margin: 5px 0 0; color: #526d9e; font-size: 11.5px; line-height: 1.45; }
.card-title { min-height: 58px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 20px; border-bottom: 1px solid #e5eaf1; }
.preview-gerado { color: #8290a5; font-size: 11px; }
.filtros-body { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(280px, 1.2fr); gap: 16px 18px; padding: 18px 20px; }
.filtros-body--movimentacoes, .filtros-body--produtos, .filtros-body--estoque, .filtros-body--fiscalizacao { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.filtros-body--resumo { grid-template-columns: minmax(190px, .9fr) minmax(330px, 1.4fr) minmax(170px, .7fr); }
.campo { min-width: 0; display: grid; gap: 7px; }
.campo label { color: #33425c; font-size: 12px; font-weight: 700; }
.campo select, .campo input { width: 100%; height: 39px; padding: 0 11px; border: 1px solid #cfd8e5; border-radius: 6px; background: #fff; color: #26364f; font: inherit; font-size: 12.5px; outline: none; transition: border-color 150ms ease, box-shadow 150ms ease; }
.campo select:focus, .campo input:focus { border-color: #477fe1; box-shadow: 0 0 0 3px rgb(71 127 225 / 12%); }
.campo input::placeholder { color: #9aa6b8; }
.campo--busca { grid-column: span 2; }
.periodo-inputs { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 8px; align-items: center; }
.periodo-inputs span { color: #7d8999; font-size: 12px; }
.filtros-indisponiveis { min-height: 126px; display: grid; place-items: center; align-content: center; gap: 5px; padding: 22px; color: #5e6f89; text-align: center; }
.filtros-indisponiveis strong { color: #243651; }
.filtros-indisponiveis span { max-width: 620px; font-size: 12px; line-height: 1.5; }
.filtros-actions { display: flex; gap: 10px; padding: 15px 20px; border-top: 1px solid #e8edf3; }
.btn { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 16px; border-radius: 6px; font: inherit; font-size: 12.5px; font-weight: 800; cursor: pointer; }
.btn svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.btn:disabled { cursor: wait; opacity: .7; }
.btn--primary { border: 1px solid #1b5fce; background: linear-gradient(135deg, #1e67dd, #1452bd); color: #fff; box-shadow: 0 4px 9px rgb(24 91 202 / 18%); }
.btn--ghost { border: 1px solid #d3dce7; background: #fff; color: #35455f; }
.preview-card { min-height: 320px; }
.preview-empty { min-height: 250px; display: grid; place-items: center; align-content: center; padding: 32px; color: #697890; text-align: center; }
.preview-empty svg { width: 58px; height: 58px; margin-bottom: 14px; fill: #eef2f7; stroke: #a8b3c4; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.preview-empty strong { color: #5a6880; font-size: 15px; }
.preview-empty p { max-width: 460px; margin: 8px 0 0; color: #8190a6; font-size: 12.5px; line-height: 1.5; }
.preview-empty b { color: #34455f; }
.preview-message { min-height: 250px; display: grid; place-items: center; align-content: center; gap: 12px; padding: 32px; text-align: center; }
.preview-message svg { width: 38px; height: 38px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.preview-message p { max-width: 600px; margin: 0; line-height: 1.5; }
.preview-message--warning { color: #8a6414; background: #fffdf7; }
.preview-result { padding: 18px 20px 20px; }
.resumo-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.resumo-cards article { padding: 13px 15px; border: 1px solid #e0e6ef; border-radius: 7px; background: #f9fbfd; }
.resumo-cards span { display: block; color: #74829a; font-size: 11.5px; font-weight: 700; }
.resumo-cards strong { display: block; margin-top: 4px; color: #1d3150; font-size: 21px; }
.resumo-cards--movimentacoes strong, .resumo-cards--produtos strong, .resumo-cards--estoque strong, .resumo-cards--fiscalizacao strong { font-size: 18px; }
.table-wrap { overflow-x: auto; border: 1px solid #e0e6ee; border-radius: 7px; }
table { width: 100%; min-width: 900px; border-collapse: collapse; }
.movimentacoes-table { min-width: 1240px; }
.produtos-table { min-width: 1080px; }
.estoques-table, .lotes-table, .fiscal-produtos-table { min-width: 1050px; }
.fiscalizacao-table { min-width: 1550px; }
th { padding: 10px 12px; background: #f5f7fa; border-bottom: 1px solid #dde4ec; color: #617089; font-size: 10.5px; font-weight: 800; letter-spacing: .02em; text-align: left; text-transform: uppercase; }
td { padding: 11px 12px; border-bottom: 1px solid #edf1f5; color: #35445d; font-size: 12px; vertical-align: middle; }
tbody tr:last-child td { border-bottom: 0; }
td strong { display: block; color: #22334e; font-size: 12.5px; }
td small { display: block; margin-top: 3px; color: #8491a4; font-size: 10.5px; }
.status { display: inline-flex; min-width: 62px; justify-content: center; padding: 4px 8px; border-radius: 999px; font-size: 10.5px; font-weight: 800; }
.status--ativo { background: #e8f7ee; color: #18713d; }
.status--inativo { background: #f0f2f5; color: #687488; }
.status--alerta { background: #fff4d6; color: #8a6500; }
.status--critico { background: #feecec; color: #a52222; }
.status--mov { background: #eef4ff; color: #295ea9; white-space: nowrap; }
.status--fiscalizado { max-width: 230px; background: #eef4ff; color: #1a4da1; white-space: normal; text-align: center; }
.status--risco-alto { background: #feecec; color: #a52222; }
.status--risco-medio { background: #fff4d6; color: #8a6500; }
.status--neutro { background: #f0f2f5; color: #58657a; }
.quantidade { font-weight: 800; white-space: nowrap; }
.quantidade--entrada { color: #1a4da1 !important; }
.quantidade--saida { color: #b42318 !important; }
.table-empty { padding: 28px; color: #7e8a9e; text-align: center; }
.rankings-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
.ranking-card { padding: 16px; border: 1px solid #e0e6ee; border-radius: 8px; background: #fbfcfe; }
.ranking-card h3 { margin: 0 0 12px; color: #263853; font-size: 13px; }
.ranking-card ol { display: grid; gap: 8px; margin: 0; padding: 0; list-style-position: inside; }
.ranking-card li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 10px; border-radius: 6px; background: #fff; color: #46566f; font-size: 11.5px; }
.ranking-card li div { min-width: 0; display: inline-grid; gap: 2px; }
.ranking-card li strong { color: #273952; font-size: 12px; }
.ranking-card li small { color: #8995a7; font-size: 10px; }
.ranking-card li b { white-space: nowrap; font-size: 12px; }
.ranking-card--entrada { border-top: 3px solid #2d6bc4; }
.ranking-card--entrada li b { color: #1a4da1; }
.ranking-card--saida { border-top: 3px solid #d9534f; }
.ranking-card--saida li b { color: #b42318; }
.ranking-empty { margin: 0; color: #8a96a8; font-size: 11px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 12px; margin: 0 0 9px; }
.section-heading--lotes { margin-top: 20px; }
.section-heading h3 { margin: 0; color: #273952; font-size: 13px; }
.section-heading span { color: #8a96a8; font-size: 10.5px; }
.exportacao-footer { margin-top: 22px; min-height: 58px; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 18px; border: 1px solid #a9d7b8; border-radius: 7px; background: #f4fbf6; color: #52645b; font-size: 12px; }
.exportacao-footer button { height: 31px; display: inline-flex; align-items: center; gap: 6px; padding: 0 10px; border: 1px solid #d4dce4; border-radius: 5px; background: #fff; color: #5e6978; font: inherit; font-size: 11.5px; font-weight: 800; }
.exportacao-footer button:first-of-type { color: #d14235; }
.exportacao-footer button:last-of-type { color: #277845; }
.exportacao-footer button:disabled { opacity: .72; cursor: not-allowed; }
.exportacao-footer svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
@media (max-width: 1180px) { .relatorios-grid { grid-template-columns: 290px minmax(0, 1fr); } .filtros-body, .filtros-body--movimentacoes, .filtros-body--produtos, .filtros-body--resumo, .filtros-body--estoque, .filtros-body--fiscalizacao { grid-template-columns: repeat(2, minmax(0, 1fr)); } .campo--periodo { grid-column: span 2; } }
@media (max-width: 900px) { .relatorios-page { padding: 22px 18px 30px; } .relatorios-grid { grid-template-columns: 1fr; } .relatorios-lista { grid-template-columns: repeat(2, minmax(0, 1fr)); } .exportacao-info { grid-column: 1 / -1; } }
@media (max-width: 640px) { .relatorios-page { padding: 18px 12px 24px; } .relatorios-header h1 { font-size: 25px; } .relatorios-lista, .filtros-body, .filtros-body--movimentacoes, .filtros-body--produtos, .filtros-body--resumo, .filtros-body--estoque, .filtros-body--fiscalizacao, .resumo-cards, .rankings-grid { grid-template-columns: 1fr; } .campo--periodo, .campo--busca { grid-column: auto; } .periodo-inputs { grid-template-columns: 1fr; } .periodo-inputs span { text-align: center; } .filtros-actions, .exportacao-footer { align-items: stretch; flex-direction: column; } .btn { width: 100%; } .exportacao-footer button { justify-content: center; } .section-heading { align-items: flex-start; flex-direction: column; } }
</style>
