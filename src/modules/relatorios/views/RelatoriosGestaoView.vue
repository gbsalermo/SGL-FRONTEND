<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { relatorioService } from '@/modules/relatorios/services/relatorioService'
import type {
  OrigemMovimentacaoRelatorio,
  RelatorioEstagiariosResponse,
  RelatorioMovimentacoesResponse,
  RelatorioResumoOperacionalResponse,
  TipoMovimentacaoRelatorio,
} from '@/modules/relatorios/types/relatorio'
import { http } from '@/services/http'

type TipoRelatorio =
  | 'estagiarios'
  | 'movimentacoes'
  | 'resumo-operacional'
  | 'pedidos-entregues'
  | 'estoque-lotes'
  | 'fiscalizacao'

type SituacaoFiltro = '' | 'ativo' | 'inativo'

interface LaboratorioResumo {
  id: string
  nome: string
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
  icone: 'documento' | 'troca' | 'resumo' | 'pedidos' | 'estoque' | 'escudo'
}

const relatorios: RelatorioOpcao[] = [
  { id: 'estagiarios', titulo: 'Estagiários', descricao: 'Ativos, inativos ou todos, por laboratório', icone: 'documento' },
  { id: 'movimentacoes', titulo: 'Movimentações', descricao: 'Entradas, saídas, ajustes, devoluções e descartes', icone: 'troca' },
  { id: 'resumo-operacional', titulo: 'Resumo operacional', descricao: 'Principais entradas, saídas e lotes', icone: 'resumo' },
  { id: 'pedidos-entregues', titulo: 'Pedidos entregues', descricao: 'Total de pedidos e itens entregues', icone: 'pedidos' },
  { id: 'estoque-lotes', titulo: 'Estoque e lotes', descricao: 'Posição de estoque, lotes, vencimentos e mínimos', icone: 'estoque' },
  { id: 'fiscalizacao', titulo: 'Fiscalização', descricao: 'Produtos fiscalizados e sua rastreabilidade', icone: 'escudo' },
]

const relatorioSelecionado = ref<TipoRelatorio>('estagiarios')

const situacao = ref<SituacaoFiltro>('')
const laboratorioId = ref('')
const dataInicio = ref('')
const dataFim = ref('')
const tipoBolsa = ref('')
const busca = ref('')

const movimentoTipo = ref<'' | TipoMovimentacaoRelatorio>('')
const movimentoOrigem = ref<'' | OrigemMovimentacaoRelatorio>('')
const movimentoProdutoId = ref('')
const movimentoUsuarioId = ref('')
const movimentoLoteId = ref('')

const resumoProdutoId = ref('')
const resumoLimite = ref(5)

const laboratorios = ref<LaboratorioResumo[]>([])
const produtos = ref<ProdutoResumo[]>([])
const usuarios = ref<UsuarioResumo[]>([])
const lotes = ref<LoteResumo[]>([])

const resultadoEstagiarios = ref<RelatorioEstagiariosResponse | null>(null)
const resultadoMovimentacoes = ref<RelatorioMovimentacoesResponse | null>(null)
const resultadoResumoOperacional = ref<RelatorioResumoOperacionalResponse | null>(null)
const carregando = ref(false)
const erro = ref('')

const opcaoSelecionada = computed(
  () => relatorios.find((item) => item.id === relatorioSelecionado.value) ?? relatorios[0],
)

const relatorioEstagiariosSelecionado = computed(() => relatorioSelecionado.value === 'estagiarios')
const relatorioMovimentacoesSelecionado = computed(() => relatorioSelecionado.value === 'movimentacoes')
const relatorioResumoSelecionado = computed(() => relatorioSelecionado.value === 'resumo-operacional')

const possuiResultado = computed(() => {
  if (relatorioEstagiariosSelecionado.value) return Boolean(resultadoEstagiarios.value)
  if (relatorioMovimentacoesSelecionado.value) return Boolean(resultadoMovimentacoes.value)
  if (relatorioResumoSelecionado.value) return Boolean(resultadoResumoOperacional.value)
  return false
})

const geradoEm = computed(() => {
  if (relatorioEstagiariosSelecionado.value) return resultadoEstagiarios.value?.geradoEm
  if (relatorioMovimentacoesSelecionado.value) return resultadoMovimentacoes.value?.geradoEm
  if (relatorioResumoSelecionado.value) return resultadoResumoOperacional.value?.geradoEm
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
  resultadoMovimentacoes.value = null
  resultadoResumoOperacional.value = null
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
  movimentoTipo.value = ''
  movimentoOrigem.value = ''
  movimentoProdutoId.value = ''
  movimentoUsuarioId.value = ''
  movimentoLoteId.value = ''
  resumoProdutoId.value = ''
  resumoLimite.value = 5
  limparResultados()
  erro.value = ''
}

async function visualizarRelatorio() {
  erro.value = ''

  if (dataInicio.value && dataFim.value && dataInicio.value > dataFim.value) {
    erro.value = 'A data inicial não pode ser posterior à data final.'
    return
  }

  if ((dataInicio.value && !dataFim.value) || (!dataInicio.value && dataFim.value)) {
    erro.value = 'Para filtrar por período, informe a data inicial e a data final.'
    return
  }

  if (!relatorioEstagiariosSelecionado.value && !relatorioMovimentacoesSelecionado.value && !relatorioResumoSelecionado.value) {
    erro.value = 'Este relatório já está previsto na central e será conectado quando o endpoint correspondente for implementado.'
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

    limparResultados()
    resultadoResumoOperacional.value = await relatorioService.obterResumoOperacional({
      produtoId: resumoProdutoId.value || undefined,
      dataInicio: dataInicio.value || undefined,
      dataFim: dataFim.value || undefined,
      limite: resumoLimite.value,
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

function sinalQuantidade(tipo: TipoMovimentacaoRelatorio) {
  if (tipo === 'ENTRADA' || tipo === 'DEVOLUCAO') return '+'
  if (tipo === 'SAIDA' || tipo === 'DESCARTE_VENCIMENTO') return '−'
  return ''
}

onMounted(async () => {
  const resultados = await Promise.allSettled([
    http.get<LaboratorioResumo[]>('/v1/laboratorios'),
    http.get<ProdutoResumo[]>('/v1/produtos'),
    http.get<UsuarioResumo[]>('/v1/usuarios'),
    http.get<LoteResumo[]>('/v1/lotes'),
  ])

  const [labs, prods, users, lots] = resultados
  if (labs.status === 'fulfilled') laboratorios.value = [...labs.value.data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
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
          <button
            v-for="item in relatorios"
            :key="item.id"
            class="relatorio-opcao"
            :class="{ 'relatorio-opcao--ativo': relatorioSelecionado === item.id }"
            type="button"
            @click="selecionarRelatorio(item.id)"
          >
            <span class="relatorio-opcao__icone" aria-hidden="true">
              <svg v-if="item.icone === 'documento'" viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6" /></svg>
              <svg v-else-if="item.icone === 'troca'" viewBox="0 0 24 24"><path d="M4 8h14M15 5l3 3-3 3M20 16H6M9 13l-3 3 3 3" /></svg>
              <svg v-else-if="item.icone === 'resumo'" viewBox="0 0 24 24"><path d="M5 3h11v14H5zM8 7h5M8 10h5M8 13h3M17 13h3v8h-8v-3M16 17h1M16 15v4" /></svg>
              <svg v-else-if="item.icone === 'pedidos'" viewBox="0 0 24 24"><path d="M6 3h10l3 3v15H6zM9 9h6M9 13h6M9 17h4" /></svg>
              <svg v-else-if="item.icone === 'estoque'" viewBox="0 0 24 24"><path d="M4 7h16v13H4zM7 7V4h10v3M4 12h16M9 12v3h6v-3" /></svg>
              <svg v-else viewBox="0 0 24 24"><path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6zM12 8v8M9 12h6" /></svg>
            </span>
            <span class="relatorio-opcao__texto"><strong>{{ item.titulo }}</strong><small>{{ item.descricao }}</small></span>
          </button>
        </div>
        <div class="exportacao-info">
          <span class="exportacao-info__icone">i</span>
          <div><strong>Exportação</strong><p>Todos os relatórios poderão ser exportados em <b>PDF</b> ou <b>Excel</b>.</p></div>
        </div>
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

          <div v-else class="filtros-indisponiveis"><strong>{{ opcaoSelecionada.titulo }}</strong><span>Os filtros deste relatório serão ativados junto ao endpoint correspondente.</span></div>

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

          <div v-else-if="relatorioMovimentacoesSelecionado && resultadoMovimentacoes" class="preview-result">
            <div class="resumo-cards resumo-cards--movimentacoes">
              <article><span>Movimentações</span><strong>{{ resultadoMovimentacoes.totalMovimentacoes }}</strong></article>
              <article><span>Entradas</span><strong>{{ resultadoMovimentacoes.quantidadeEntradas }} un.</strong></article>
              <article><span>Saídas</span><strong>{{ resultadoMovimentacoes.quantidadeSaidas }} un.</strong></article>
              <article><span>Devoluções</span><strong>{{ resultadoMovimentacoes.quantidadeDevolucoes }} un.</strong></article>
              <article><span>Descartes</span><strong>{{ resultadoMovimentacoes.quantidadeDescartes }} un.</strong></article>
              <article><span>Ajustes</span><strong>{{ resultadoMovimentacoes.quantidadeAjustes }} un.</strong></article>
            </div>
            <div class="table-wrap"><table class="movimentacoes-table"><thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Quantidade</th><th>Lote</th><th>Laboratório</th><th>Origem</th><th>Responsável</th><th>Saldo</th></tr></thead><tbody><tr v-for="item in resultadoMovimentacoes.itens" :key="item.id"><td>{{ formatarDataHora(item.dataMovimentacao) }}</td><td><strong>{{ item.produtoNome }}</strong><small v-if="item.pedidoSolicitanteNome">Solicitante: {{ item.pedidoSolicitanteNome }}</small></td><td><span class="status status--mov">{{ formatarRotulo(item.tipoMovimentacao) }}</span></td><td class="quantidade" :class="{ 'quantidade--entrada': item.tipoMovimentacao === 'ENTRADA' || item.tipoMovimentacao === 'DEVOLUCAO', 'quantidade--saida': item.tipoMovimentacao === 'SAIDA' || item.tipoMovimentacao === 'DESCARTE_VENCIMENTO' }">{{ sinalQuantidade(item.tipoMovimentacao) }}{{ item.quantidadeMovimentada }} un.</td><td><strong>{{ item.codigoInternoLote || '—' }}</strong><small v-if="item.numeroLote">Fornecedor: {{ item.numeroLote }}</small></td><td>{{ item.laboratorioNome || '—' }}</td><td>{{ formatarRotulo(item.origem) }}</td><td>{{ item.usuarioNome }}</td><td>{{ item.quantidadeAnterior }} → {{ item.quantidadeAtual }}</td></tr><tr v-if="resultadoMovimentacoes.itens.length === 0"><td colspan="9" class="table-empty">Nenhuma movimentação encontrada com os filtros informados.</td></tr></tbody></table></div>
          </div>

          <div v-else-if="relatorioResumoSelecionado && resultadoResumoOperacional" class="preview-result">
            <div class="resumo-cards resumo-cards--operacional">
              <article><span>Movimentações</span><strong>{{ resultadoResumoOperacional.totalMovimentacoes }}</strong></article>
              <article class="card-kpi--entrada"><span>Entradas</span><strong>{{ resultadoResumoOperacional.quantidadeEntradas }} un.</strong></article>
              <article class="card-kpi--saida"><span>Saídas</span><strong>{{ resultadoResumoOperacional.quantidadeSaidas }} un.</strong></article>
              <article class="card-kpi--descarte"><span>Descartes</span><strong>{{ resultadoResumoOperacional.quantidadeDescartes }} un.</strong></article>
              <article><span>Produtos movimentados</span><strong>{{ resultadoResumoOperacional.produtosMovimentados }}</strong></article>
              <article><span>Lotes movimentados</span><strong>{{ resultadoResumoOperacional.lotesMovimentados }}</strong></article>
            </div>

            <div class="ranking-grid">
              <section class="ranking-card ranking-card--entrada">
                <header><div><span>Ranking</span><h3>Principais entradas</h3></div><strong>Quantidade</strong></header>
                <ol>
                  <li v-for="(item, index) in resultadoResumoOperacional.principaisEntradas" :key="item.produtoId">
                    <span class="ranking-posicao">{{ index + 1 }}</span>
                    <div><strong>{{ item.produtoNome }}</strong><small>{{ item.movimentacoes }} movimentação(ões)</small></div>
                    <b>+{{ item.quantidade }} un.</b>
                  </li>
                  <li v-if="resultadoResumoOperacional.principaisEntradas.length === 0" class="ranking-empty">Nenhuma entrada encontrada.</li>
                </ol>
              </section>

              <section class="ranking-card ranking-card--saida">
                <header><div><span>Ranking</span><h3>Principais saídas</h3></div><strong>Quantidade</strong></header>
                <ol>
                  <li v-for="(item, index) in resultadoResumoOperacional.principaisSaidas" :key="item.produtoId">
                    <span class="ranking-posicao">{{ index + 1 }}</span>
                    <div><strong>{{ item.produtoNome }}</strong><small>{{ item.movimentacoes }} movimentação(ões)</small></div>
                    <b>−{{ item.quantidade }} un.</b>
                  </li>
                  <li v-if="resultadoResumoOperacional.principaisSaidas.length === 0" class="ranking-empty">Nenhuma saída encontrada.</li>
                </ol>
              </section>
            </div>

            <section class="lotes-ranking">
              <div class="section-heading"><div><span>Rastreabilidade</span><h3>Lotes mais movimentados</h3></div><small>Movimentação acumulada no período selecionado</small></div>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Lote</th><th>Produto</th><th>Movimentado</th><th>Entradas</th><th>Saídas</th><th>Saldo atual</th><th>Validade</th></tr></thead>
                  <tbody>
                    <tr v-for="(item, index) in resultadoResumoOperacional.lotesMaisMovimentados" :key="item.loteId">
                      <td><span class="ranking-posicao ranking-posicao--table">{{ index + 1 }}</span></td>
                      <td><strong>{{ item.codigoInterno || '—' }}</strong><small v-if="item.numeroLote">Fornecedor: {{ item.numeroLote }}</small></td>
                      <td>{{ item.produtoNome || '—' }}</td>
                      <td><strong>{{ item.quantidadeMovimentada }} un.</strong><small>{{ item.movimentacoes }} operação(ões)</small></td>
                      <td class="quantidade quantidade--entrada">+{{ item.quantidadeEntradas }} un.</td>
                      <td class="quantidade quantidade--saida">−{{ item.quantidadeSaidas }} un.</td>
                      <td>{{ item.saldoAtual }} un.</td>
                      <td>{{ formatarData(item.dataValidade) }}</td>
                    </tr>
                    <tr v-if="resultadoResumoOperacional.lotesMaisMovimentados.length === 0"><td colspan="8" class="table-empty">Nenhum lote movimentado com os filtros informados.</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>

    <footer class="exportacao-footer"><span>Após visualizar o relatório, você poderá exportá-lo nos formatos:</span><button type="button" disabled title="Exportação PDF será conectada ao backend na próxima etapa"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v5h5" /></svg>PDF</button><button type="button" disabled title="Exportação Excel será conectada ao backend na próxima etapa"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM9 4v16M9 9h10M9 14h10" /></svg>Excel</button></footer>
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
.filtros-body--movimentacoes { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.filtros-body--resumo { grid-template-columns: minmax(220px, .9fr) minmax(360px, 1.5fr) minmax(180px, .7fr); }
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
.filtros-indisponiveis span { font-size: 12px; }
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
.resumo-cards article { padding: 13px 15px; border: 1px solid #e0e6ef; border-radius: 7px; background: #f9fbfd; transition: border-color 150ms ease, background 150ms ease, transform 150ms ease; }
.resumo-cards span { display: block; color: #74829a; font-size: 11.5px; font-weight: 700; }
.resumo-cards strong { display: block; margin-top: 4px; color: #1d3150; font-size: 21px; }
.resumo-cards--movimentacoes strong, .resumo-cards--operacional strong { font-size: 18px; }
.card-kpi--entrada:hover { border-color: #7fb0ef; background: #eef6ff; transform: translateY(-1px); }
.card-kpi--entrada:hover strong { color: #1a4da1; }
.card-kpi--saida:hover { border-color: #e29a94; background: #fff1f0; transform: translateY(-1px); }
.card-kpi--saida:hover strong { color: #b42318; }
.card-kpi--descarte:hover { border-color: #e5c365; background: #fff9df; transform: translateY(-1px); }
.card-kpi--descarte:hover strong { color: #8a6500; }
.ranking-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
.ranking-card { overflow: hidden; border: 1px solid #e0e6ef; border-radius: 8px; background: #fff; }
.ranking-card header { min-height: 62px; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 15px; border-bottom: 1px solid #e8edf3; }
.ranking-card header span, .section-heading span { color: #8290a5; font-size: 10px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; }
.ranking-card header h3, .section-heading h3 { margin: 3px 0 0; color: #20314d; font-size: 14px; }
.ranking-card header > strong { color: #74829a; font-size: 10.5px; text-transform: uppercase; }
.ranking-card--entrada header { background: #f6faff; }
.ranking-card--saida header { background: #fff7f6; }
.ranking-card ol { margin: 0; padding: 0; list-style: none; }
.ranking-card li { min-height: 58px; display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 9px 14px; border-bottom: 1px solid #eef2f6; }
.ranking-card li:last-child { border-bottom: 0; }
.ranking-card li > div { min-width: 0; }
.ranking-card li strong { display: block; overflow: hidden; color: #2a3a54; font-size: 12px; white-space: nowrap; text-overflow: ellipsis; }
.ranking-card li small { display: block; margin-top: 3px; color: #8b98aa; font-size: 10.5px; }
.ranking-card li b { font-size: 12.5px; white-space: nowrap; }
.ranking-card--entrada li b { color: #1a4da1; }
.ranking-card--saida li b { color: #b42318; }
.ranking-posicao { width: 24px; height: 24px; display: inline-grid; place-items: center; border-radius: 999px; background: #eef2f7; color: #64748b; font-size: 10px; font-weight: 900; }
.ranking-posicao--table { width: 22px; height: 22px; }
.ranking-empty { display: block !important; padding: 20px 14px !important; color: #8995a7; text-align: center; font-size: 11.5px; }
.lotes-ranking { margin-top: 4px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 10px; }
.section-heading small { color: #8995a7; font-size: 10.5px; }
.table-wrap { overflow-x: auto; border: 1px solid #e0e6ee; border-radius: 7px; }
table { width: 100%; min-width: 900px; border-collapse: collapse; }
.movimentacoes-table { min-width: 1240px; }
th { padding: 10px 12px; background: #f5f7fa; border-bottom: 1px solid #dde4ec; color: #617089; font-size: 10.5px; font-weight: 800; letter-spacing: .02em; text-align: left; text-transform: uppercase; }
td { padding: 11px 12px; border-bottom: 1px solid #edf1f5; color: #35445d; font-size: 12px; vertical-align: middle; }
tbody tr:last-child td { border-bottom: 0; }
td strong { display: block; color: #22334e; font-size: 12.5px; }
td small { display: block; margin-top: 3px; color: #8491a4; font-size: 10.5px; }
.status { display: inline-flex; min-width: 62px; justify-content: center; padding: 4px 8px; border-radius: 999px; font-size: 10.5px; font-weight: 800; }
.status--ativo { background: #e8f7ee; color: #18713d; }
.status--inativo { background: #f0f2f5; color: #687488; }
.status--mov { background: #eef4ff; color: #295ea9; white-space: nowrap; }
.quantidade { font-weight: 800; white-space: nowrap; }
.quantidade--entrada { color: #1a4da1; }
.quantidade--saida { color: #b42318; }
.table-empty { padding: 28px; color: #7e8a9e; text-align: center; }
.exportacao-footer { margin-top: 22px; min-height: 58px; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 18px; border: 1px solid #a9d7b8; border-radius: 7px; background: #f4fbf6; color: #52645b; font-size: 12px; }
.exportacao-footer button { height: 31px; display: inline-flex; align-items: center; gap: 6px; padding: 0 10px; border: 1px solid #d4dce4; border-radius: 5px; background: #fff; color: #5e6978; font: inherit; font-size: 11.5px; font-weight: 800; }
.exportacao-footer button:first-of-type { color: #d14235; }
.exportacao-footer button:last-of-type { color: #277845; }
.exportacao-footer button:disabled { opacity: .72; cursor: not-allowed; }
.exportacao-footer svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
@media (max-width: 1180px) { .relatorios-grid { grid-template-columns: 290px minmax(0, 1fr); } .filtros-body, .filtros-body--movimentacoes, .filtros-body--resumo { grid-template-columns: repeat(2, minmax(0, 1fr)); } .campo--periodo { grid-column: span 2; } }
@media (max-width: 900px) { .relatorios-page { padding: 22px 18px 30px; } .relatorios-grid { grid-template-columns: 1fr; } .relatorios-lista { grid-template-columns: repeat(2, minmax(0, 1fr)); } .exportacao-info { grid-column: 1 / -1; } .ranking-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .relatorios-page { padding: 18px 12px 24px; } .relatorios-header h1 { font-size: 25px; } .relatorios-lista, .filtros-body, .filtros-body--movimentacoes, .filtros-body--resumo, .resumo-cards { grid-template-columns: 1fr; } .campo--periodo, .campo--busca { grid-column: auto; } .periodo-inputs { grid-template-columns: 1fr; } .periodo-inputs span { text-align: center; } .filtros-actions, .exportacao-footer, .section-heading { align-items: stretch; flex-direction: column; } .btn { width: 100%; } .exportacao-footer button { justify-content: center; } }
</style>
