<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { relatorioService } from '@/modules/relatorios/services/relatorioService'
import type {
  NivelRiscoRelatorio,
  OrigemMovimentacaoRelatorio,
  OrgaoFiscalizadorRelatorio,
  RelatorioEstagiariosResponse,
  RelatorioEstoqueLotesResponse,
  RelatorioMovimentacoesResponse,
  RelatorioProdutosResponse,
  RelatorioResumoOperacionalResponse,
  SituacaoLoteRelatorio,
  TipoMovimentacaoRelatorio,
} from '@/modules/relatorios/types/relatorio'
import { http } from '@/services/http'

type TipoRelatorio =
  | 'estagiarios'
  | 'produtos'
  | 'movimentacoes'
  | 'resumo-operacional'
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
  { id: 'movimentacoes', titulo: 'Movimentações', descricao: 'Entradas, saídas e recortes por pedido', icone: 'troca' },
  { id: 'resumo-operacional', titulo: 'Resumo operacional', descricao: 'Principais entradas, saídas e lotes', icone: 'resumo' },
  { id: 'estoque-lotes', titulo: 'Estoque e lotes', descricao: 'Posição de estoque, mínimos e vencimentos', icone: 'estoque' },
  { id: 'residuos', titulo: 'Resíduos', descricao: 'Geração, riscos, armazenamento e despacho', icone: 'residuo' },
  { id: 'fiscalizacao', titulo: 'Fiscalização', descricao: 'Produtos fiscalizados e sua rastreabilidade', icone: 'escudo' },
]

const relatorioSelecionado = ref<TipoRelatorio>('estagiarios')

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

const resumoProdutoId = ref('')
const resumoLimite = ref(5)

const estoqueUnidadeId = ref('')
const estoqueProdutoId = ref('')
const estoqueSituacao = ref<SituacaoFiltro>('')
const estoqueNivel = ref<SimNaoFiltro>('')
const estoqueSituacaoLote = ref<'' | SituacaoLoteRelatorio>('')
const estoqueDiasVencimento = ref(30)

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
const carregando = ref(false)
const erro = ref('')

const opcaoSelecionada = computed(
  () => relatorios.find((item) => item.id === relatorioSelecionado.value) ?? relatorios[0],
)

const relatorioEstagiariosSelecionado = computed(() => relatorioSelecionado.value === 'estagiarios')
const relatorioProdutosSelecionado = computed(() => relatorioSelecionado.value === 'produtos')
const relatorioMovimentacoesSelecionado = computed(() => relatorioSelecionado.value === 'movimentacoes')
const relatorioResumoSelecionado = computed(() => relatorioSelecionado.value === 'resumo-operacional')
const relatorioEstoqueSelecionado = computed(() => relatorioSelecionado.value === 'estoque-lotes')
const relatorioResiduosSelecionado = computed(() => relatorioSelecionado.value === 'residuos')

const possuiResultado = computed(() => {
  if (relatorioEstagiariosSelecionado.value) return Boolean(resultadoEstagiarios.value)
  if (relatorioProdutosSelecionado.value) return Boolean(resultadoProdutos.value)
  if (relatorioMovimentacoesSelecionado.value) return Boolean(resultadoMovimentacoes.value)
  if (relatorioResumoSelecionado.value) return Boolean(resultadoResumoOperacional.value)
  if (relatorioEstoqueSelecionado.value) return Boolean(resultadoEstoqueLotes.value)
  return false
})

const geradoEm = computed(() => {
  if (relatorioEstagiariosSelecionado.value) return resultadoEstagiarios.value?.geradoEm
  if (relatorioProdutosSelecionado.value) return resultadoProdutos.value?.geradoEm
  if (relatorioMovimentacoesSelecionado.value) return resultadoMovimentacoes.value?.geradoEm
  if (relatorioResumoSelecionado.value) return resultadoResumoOperacional.value?.geradoEm
  if (relatorioEstoqueSelecionado.value) return resultadoEstoqueLotes.value?.geradoEm
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

function limparResultados() {
  resultadoEstagiarios.value = null
  resultadoProdutos.value = null
  resultadoMovimentacoes.value = null
  resultadoResumoOperacional.value = null
  resultadoEstoqueLotes.value = null
}

function selecionarRelatorio(id: TipoRelatorio) {
  relatorioSelecionado.value = id
  limparResultados()
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
  resumoProdutoId.value = ''
  resumoLimite.value = 5
  estoqueUnidadeId.value = ''
  estoqueProdutoId.value = ''
  estoqueSituacao.value = ''
  estoqueNivel.value = ''
  estoqueSituacaoLote.value = ''
  estoqueDiasVencimento.value = 30
  limparResultados()
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

  const usaPeriodo = relatorioEstagiariosSelecionado.value || relatorioMovimentacoesSelecionado.value || relatorioResumoSelecionado.value
  if (usaPeriodo && !validarPeriodo()) return

  if (
    !relatorioEstagiariosSelecionado.value &&
    !relatorioProdutosSelecionado.value &&
    !relatorioMovimentacoesSelecionado.value &&
    !relatorioResumoSelecionado.value &&
    !relatorioEstoqueSelecionado.value
  ) {
    erro.value = relatorioResiduosSelecionado.value
      ? 'O relatório de Resíduos já faz parte da central e será ativado quando a branch do módulo de resíduos for integrada à base de Relatórios.'
      : 'Este relatório já está previsto na central e será conectado quando o endpoint correspondente for implementado.'
    return
  }

  carregando.value = true
  try {
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
        limite: resumoLimite.value,
      })
      return
    }

    limparResultados()
    resultadoEstoqueLotes.value = await relatorioService.listarEstoqueLotes({
      unidadeId: estoqueUnidadeId.value || undefined,
      produtoId: estoqueProdutoId.value || undefined,
      ativoEstoque: estoqueSituacao.value === '' ? undefined : estoqueSituacao.value === 'ativo',
      abaixoMinimo: estoqueNivel.value === '' ? undefined : estoqueNivel.value === 'sim',
      validade: estoqueSituacaoLote.value || undefined,
      diasVencimento: estoqueDiasVencimento.value,
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

onMounted(async () => {
  const resultados = await Promise.allSettled([
    http.get<LaboratorioResumo[]>('/v1/laboratorios'),
    http.get<UnidadeResumo[]>('/v1/unidades'),
    http.get<ProdutoResumo[]>('/v1/produtos'),
    http.get<UsuarioResumo[]>('/v1/usuarios'),
    http.get<LoteResumo[]>('/v1/lotes'),
  ])

  const [labs, units, prods, users, lots] = resultados
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

          <div v-else-if="relatorioMovimentacoesSelecionado" class="filtros-body filtros-body--movimentacoes">
            <div class="campo"><label for="mov-tipo">Tipo</label><select id="mov-tipo" v-model="movimentoTipo"><option value="">Todos</option><option value="ENTRADA">Entrada</option><option value="SAIDA">Saída</option><option value="AJUSTE">Ajuste</option><option value="DEVOLUCAO">Devolução</option><option value="DESCARTE_VENCIMENTO">Descarte por vencimento</option></select></div>
            <div class="campo"><label for="mov-origem">Origem</label><select id="mov-origem" v-model="movimentoOrigem"><option value="">Todas</option><option value="PEDIDO">Pedido</option><option value="COMPRA">Compra</option><option value="AJUSTE">Ajuste</option><option value="DEVOLUCAO">Devolução</option><option value="INVENTARIO">Inventário</option><option value="DESCARTE">Descarte</option></select></div>
            <div class="campo campo--periodo"><label>Período da movimentação</label><div class="periodo-inputs"><input v-model="dataInicio" type="date" aria-label="Data inicial" /><span>até</span><input v-model="dataFim" type="date" aria-label="Data final" /></div></div>
            <div class="campo"><label for="mov-produto">Produto</label><select id="mov-produto" v-model="movimentoProdutoId"><option value="">Todos os produtos</option><option v-for="produto in produtos" :key="produto.id" :value="produto.id">{{ produto.nome }}</option></select></div>
            <div class="campo"><label for="mov-lab">Laboratório</label><select id="mov-lab" v-model="laboratorioId"><option value="">Todos os laboratórios</option><option v-for="laboratorio in laboratorios" :key="laboratorio.id" :value="laboratorio.id">{{ laboratorio.nome }}</option></select></div>
            <div class="campo"><label for="mov-usuario">Responsável pela operação</label><select id="mov-usuario" v-model="movimentoUsuarioId"><option value="">Todos os responsáveis</option><option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">{{ usuario.nome }}</option></select></div>
            <div class="campo campo--busca"><label for="mov-lote">Lote</label><select id="mov-lote" v-model="movimentoLoteId"><option value="">Todos os lotes</option><option v-for="lote in lotes" :key="lote.id" :value="lote.id">{{ lote.codigoInterno || lote.numeroLote || lote.id }}</option></select></div>
          </div>

          <div v-else-if="relatorioResumoSelecionado" class="filtros-body filtros-body--resumo">
            <div class="campo"><label for="resumo-produto">Produto</label><select id="resumo-produto" v-model="resumoProdutoId"><option value="">Todos os produtos</option><option v-for="produto in produtos" :key="produto.id" :value="produto.id">{{ produto.nome }}</option></select></div>
            <div class="campo campo--periodo"><label>Período analisado</label><div class="periodo-inputs"><input v-model="dataInicio" type="date" aria-label="Data inicial" /><span>até</span><input v-model="dataFim" type="date" aria-label="Data final" /></div></div>
            <div class="campo"><label for="resumo-limite">Posições do ranking</label><select id="resumo-limite" v-model.number="resumoLimite"><option :value="5">Top 5</option><option :value="10">Top 10</option><option :value="20">Top 20</option></select></div>
          </div>

          <div v-else-if="relatorioEstoqueSelecionado" class="filtros-body filtros-body--estoque">
            <div class="campo"><label for="estoque-unidade">Unidade</label><select id="estoque-unidade" v-model="estoqueUnidadeId"><option value="">Todas as unidades</option><option v-for="unidade in unidades" :key="unidade.id" :value="unidade.id">{{ unidade.sigla ? `${unidade.sigla} — ${unidade.nome}` : unidade.nome }}</option></select></div>
            <div class="campo"><label for="estoque-produto">Produto</label><select id="estoque-produto" v-model="estoqueProdutoId"><option value="">Todos os produtos</option><option v-for="produto in produtos" :key="produto.id" :value="produto.id">{{ produto.nome }}</option></select></div>
            <div class="campo"><label for="estoque-situacao">Situação do estoque</label><select id="estoque-situacao" v-model="estoqueSituacao"><option value="">Todos</option><option value="ativo">Ativos</option><option value="inativo">Inativos</option></select></div>
            <div class="campo"><label for="estoque-nivel">Nível do estoque</label><select id="estoque-nivel" v-model="estoqueNivel"><option value="">Todos</option><option value="sim">Abaixo ou igual ao mínimo</option><option value="nao">Acima do mínimo</option></select></div>
            <div class="campo"><label for="estoque-lote-situacao">Situação do lote</label><select id="estoque-lote-situacao" v-model="estoqueSituacaoLote"><option value="">Todos</option><option value="VALIDO">Válido</option><option value="PROXIMO_VENCIMENTO">Próximo do vencimento</option><option value="VENCIDO">Vencido</option><option value="SEM_VALIDADE">Sem validade</option><option value="ESGOTADO">Esgotado</option><option value="INATIVO">Inativo</option></select></div>
            <div class="campo"><label for="estoque-dias">Janela de vencimento</label><select id="estoque-dias" v-model.number="estoqueDiasVencimento"><option :value="7">Próximos 7 dias</option><option :value="15">Próximos 15 dias</option><option :value="30">Próximos 30 dias</option><option :value="60">Próximos 60 dias</option><option :value="90">Próximos 90 dias</option></select></div>
          </div>

          <div v-else class="filtros-indisponiveis"><strong>{{ opcaoSelecionada.titulo }}</strong><span v-if="relatorioResiduosSelecionado">A opção já está reservada. A consulta será ativada após a integração do módulo de Resíduos à base de Relatórios.</span><span v-else>Os filtros deste relatório serão ativados junto ao endpoint correspondente.</span></div>

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

          <div v-else-if="relatorioMovimentacoesSelecionado && resultadoMovimentacoes" class="preview-result">
            <div class="resumo-cards resumo-cards--movimentacoes"><article><span>Movimentações</span><strong>{{ resultadoMovimentacoes.totalMovimentacoes }}</strong></article><article><span>Entradas</span><strong>{{ resultadoMovimentacoes.quantidadeEntradas }} un.</strong></article><article><span>Saídas</span><strong>{{ resultadoMovimentacoes.quantidadeSaidas }} un.</strong></article><article><span>Devoluções</span><strong>{{ resultadoMovimentacoes.quantidadeDevolucoes }} un.</strong></article><article><span>Descartes</span><strong>{{ resultadoMovimentacoes.quantidadeDescartes }} un.</strong></article><article><span>Ajustes</span><strong>{{ resultadoMovimentacoes.quantidadeAjustes }} un.</strong></article></div>
            <div class="table-wrap"><table class="movimentacoes-table"><thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Quantidade</th><th>Lote</th><th>Laboratório</th><th>Origem</th><th>Responsável</th><th>Saldo</th></tr></thead><tbody><tr v-for="item in resultadoMovimentacoes.itens" :key="item.id"><td>{{ formatarDataHora(item.dataMovimentacao) }}</td><td><strong>{{ item.produtoNome }}</strong><small v-if="item.pedidoSolicitanteNome">Solicitante: {{ item.pedidoSolicitanteNome }}</small></td><td><span class="status status--mov">{{ formatarRotulo(item.tipoMovimentacao) }}</span></td><td class="quantidade" :class="{ 'quantidade--entrada': item.tipoMovimentacao === 'ENTRADA' || item.tipoMovimentacao === 'DEVOLUCAO', 'quantidade--saida': item.tipoMovimentacao === 'SAIDA' || item.tipoMovimentacao === 'DESCARTE_VENCIMENTO' }">{{ sinalQuantidade(item.tipoMovimentacao) }}{{ item.quantidadeMovimentada }} un.</td><td><strong>{{ item.codigoInternoLote || '—' }}</strong><small v-if="item.numeroLote">Fornecedor: {{ item.numeroLote }}</small></td><td>{{ item.laboratorioNome || '—' }}</td><td>{{ formatarRotulo(item.origem) }}</td><td>{{ item.usuarioNome }}</td><td>{{ item.quantidadeAnterior }} → {{ item.quantidadeAtual }}</td></tr><tr v-if="resultadoMovimentacoes.itens.length === 0"><td colspan="9" class="table-empty">Nenhuma movimentação encontrada com os filtros informados.</td></tr></tbody></table></div>
          </div>

          <div v-else-if="relatorioResumoSelecionado && resultadoResumoOperacional" class="preview-result">
            <div class="resumo-cards resumo-cards--movimentacoes resumo-cards--operacional"><article><span>Movimentações</span><strong>{{ resultadoResumoOperacional.totalMovimentacoes }}</strong></article><article><span>Entradas</span><strong>{{ resultadoResumoOperacional.quantidadeEntradas }} un.</strong></article><article><span>Saídas</span><strong>{{ resultadoResumoOperacional.quantidadeSaidas }} un.</strong></article><article><span>Descartes</span><strong>{{ resultadoResumoOperacional.quantidadeDescartes }} un.</strong></article><article><span>Produtos</span><strong>{{ resultadoResumoOperacional.produtosMovimentados }}</strong></article><article><span>Lotes</span><strong>{{ resultadoResumoOperacional.lotesMovimentados }}</strong></article></div>
            <div class="rankings-grid"><section class="ranking-card ranking-card--entrada"><h3>Principais entradas</h3><ol><li v-for="item in resultadoResumoOperacional.principaisEntradas" :key="item.produtoId"><div><strong>{{ item.produtoNome }}</strong><small>{{ item.movimentacoes }} movimentação(ões)</small></div><b>+{{ item.quantidade }} un.</b></li></ol><p v-if="resultadoResumoOperacional.principaisEntradas.length === 0" class="ranking-empty">Sem entradas no período.</p></section><section class="ranking-card ranking-card--saida"><h3>Principais saídas</h3><ol><li v-for="item in resultadoResumoOperacional.principaisSaidas" :key="item.produtoId"><div><strong>{{ item.produtoNome }}</strong><small>{{ item.movimentacoes }} movimentação(ões)</small></div><b>−{{ item.quantidade }} un.</b></li></ol><p v-if="resultadoResumoOperacional.principaisSaidas.length === 0" class="ranking-empty">Sem saídas no período.</p></section></div>
            <div class="section-heading"><h3>Lotes mais movimentados</h3><span>Ranking por quantidade total movimentada</span></div>
            <div class="table-wrap"><table><thead><tr><th>#</th><th>Lote</th><th>Produto</th><th>Movimentado</th><th>Entradas</th><th>Saídas</th><th>Saldo atual</th><th>Validade</th></tr></thead><tbody><tr v-for="(item, index) in resultadoResumoOperacional.lotesMaisMovimentados" :key="item.loteId"><td><strong>{{ index + 1 }}º</strong></td><td><strong>{{ item.codigoInterno || '—' }}</strong><small v-if="item.numeroLote">Fornecedor: {{ item.numeroLote }}</small></td><td>{{ item.produtoNome || '—' }}</td><td>{{ item.quantidadeMovimentada }} un.<small>{{ item.movimentacoes }} operação(ões)</small></td><td class="quantidade quantidade--entrada">+{{ item.quantidadeEntradas }} un.</td><td class="quantidade quantidade--saida">−{{ item.quantidadeSaidas }} un.</td><td>{{ item.saldoAtual }} un.</td><td>{{ formatarData(item.dataValidade) }}</td></tr><tr v-if="resultadoResumoOperacional.lotesMaisMovimentados.length === 0"><td colspan="8" class="table-empty">Nenhum lote movimentado com os filtros informados.</td></tr></tbody></table></div>
          </div>

          <div v-else-if="relatorioEstoqueSelecionado && resultadoEstoqueLotes" class="preview-result">
            <div class="resumo-cards resumo-cards--estoque"><article><span>Estoques</span><strong>{{ resultadoEstoqueLotes.totalEstoques }}</strong></article><article><span>Abaixo do mínimo</span><strong>{{ resultadoEstoqueLotes.estoquesAbaixoMinimo }}</strong></article><article><span>Saldo total</span><strong>{{ resultadoEstoqueLotes.quantidadeTotalEstoque }} un.</strong></article><article><span>Lotes ativos</span><strong>{{ resultadoEstoqueLotes.lotesAtivos }}</strong></article><article><span>Vencidos</span><strong>{{ resultadoEstoqueLotes.lotesVencidos }}</strong></article><article><span>Próx. vencimento</span><strong>{{ resultadoEstoqueLotes.lotesProximosVencimento }}</strong></article></div>

            <div class="section-heading"><h3>Posição de estoque</h3><span>Saldo atual comparado ao mínimo configurado</span></div>
            <div class="table-wrap"><table class="estoques-table"><thead><tr><th>Produto</th><th>Unidade</th><th>Saldo atual</th><th>Mínimo</th><th>Nível</th><th>Lotes ativos</th><th>Vencidos</th><th>Próx. vencimento</th></tr></thead><tbody><tr v-for="item in resultadoEstoqueLotes.estoques" :key="item.estoqueId"><td><strong>{{ item.produtoNome }}</strong><small>{{ item.codigoReferencia || formatarRotulo(item.unidadeMedida) }}</small></td><td>{{ item.unidadeSigla || item.unidadeNome }}</td><td class="quantidade">{{ item.quantidadeAtual }} un.</td><td>{{ item.quantidadeMinima }} un.</td><td><span class="status" :class="item.abaixoMinimo ? 'status--critico' : 'status--ativo'">{{ item.abaixoMinimo ? 'Abaixo do mínimo' : 'Normal' }}</span></td><td>{{ item.lotesAtivos }}</td><td>{{ item.lotesVencidos }}</td><td>{{ item.lotesProximosVencimento }}</td></tr><tr v-if="resultadoEstoqueLotes.estoques.length === 0"><td colspan="8" class="table-empty">Nenhum estoque encontrado com os filtros informados.</td></tr></tbody></table></div>

            <div class="section-heading section-heading--lotes"><h3>Lotes</h3><span>{{ resultadoEstoqueLotes.totalLotes }} lote(s) na consulta</span></div>
            <div class="table-wrap"><table class="lotes-table"><thead><tr><th>Lote</th><th>Produto</th><th>Unidade</th><th>Entrada</th><th>Inicial</th><th>Disponível</th><th>Validade</th><th>Situação</th></tr></thead><tbody><tr v-for="item in resultadoEstoqueLotes.lotes" :key="item.loteId"><td><strong>{{ item.codigoInterno }}</strong><small v-if="item.numeroLote">Fornecedor: {{ item.numeroLote }}</small></td><td>{{ item.produtoNome }}</td><td>{{ item.unidadeNome }}</td><td>{{ formatarData(item.dataEntrada) }}</td><td>{{ item.quantidadeInicial }} un.</td><td class="quantidade">{{ item.quantidadeDisponivel }} un.</td><td>{{ formatarData(item.dataValidade) }}</td><td><span class="status" :class="classeSituacaoLote(item.situacao)">{{ formatarRotulo(item.situacao) }}</span></td></tr><tr v-if="resultadoEstoqueLotes.lotes.length === 0"><td colspan="8" class="table-empty">Nenhum lote encontrado com os filtros informados.</td></tr></tbody></table></div>
          </div>
        </section>
      </div>
    </div>

    <footer class="exportacao-footer"><span>Após visualizar o relatório, você poderá exportá-lo nos formatos:</span><button type="button" disabled title="Exportação PDF será conectada ao backend na etapa de exportação"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v5h5" /></svg>PDF</button><button type="button" disabled title="Exportação Excel será conectada ao backend na etapa de exportação"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM9 4v16M9 9h10M9 14h10" /></svg>Excel</button></footer>
  </section>
</template>

<style scoped>
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
.filtros-body--movimentacoes, .filtros-body--produtos, .filtros-body--estoque { grid-template-columns: repeat(3, minmax(0, 1fr)); }
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
.resumo-cards--movimentacoes strong, .resumo-cards--produtos strong, .resumo-cards--estoque strong { font-size: 18px; }
.table-wrap { overflow-x: auto; border: 1px solid #e0e6ee; border-radius: 7px; }
table { width: 100%; min-width: 900px; border-collapse: collapse; }
.movimentacoes-table { min-width: 1240px; }
.produtos-table { min-width: 1080px; }
.estoques-table, .lotes-table { min-width: 1050px; }
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
.quantidade--entrada { color: #1a4da1; }
.quantidade--saida { color: #b42318; }
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
@media (max-width: 1180px) { .relatorios-grid { grid-template-columns: 290px minmax(0, 1fr); } .filtros-body, .filtros-body--movimentacoes, .filtros-body--produtos, .filtros-body--resumo, .filtros-body--estoque { grid-template-columns: repeat(2, minmax(0, 1fr)); } .campo--periodo { grid-column: span 2; } }
@media (max-width: 900px) { .relatorios-page { padding: 22px 18px 30px; } .relatorios-grid { grid-template-columns: 1fr; } .relatorios-lista { grid-template-columns: repeat(2, minmax(0, 1fr)); } .exportacao-info { grid-column: 1 / -1; } }
@media (max-width: 640px) { .relatorios-page { padding: 18px 12px 24px; } .relatorios-header h1 { font-size: 25px; } .relatorios-lista, .filtros-body, .filtros-body--movimentacoes, .filtros-body--produtos, .filtros-body--resumo, .filtros-body--estoque, .resumo-cards, .rankings-grid { grid-template-columns: 1fr; } .campo--periodo, .campo--busca { grid-column: auto; } .periodo-inputs { grid-template-columns: 1fr; } .periodo-inputs span { text-align: center; } .filtros-actions, .exportacao-footer { align-items: stretch; flex-direction: column; } .btn { width: 100%; } .exportacao-footer button { justify-content: center; } .section-heading { align-items: flex-start; flex-direction: column; } }
</style>
