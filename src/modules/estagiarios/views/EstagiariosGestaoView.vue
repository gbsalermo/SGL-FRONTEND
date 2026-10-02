<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

import { estagiarioService } from '@/modules/estagiarios/services/estagiarioService'
import { useSessionStore } from '@/stores/session'
import type {
  ApiErrorResponse,
  AtividadeDisponivelEstagioResponse,
  CulturaEstagioResponse,
  CursoEstagioResponse,
  EstagiarioResponse,
  FormacaoEstagiario,
  ObservacaoVinculoEstagioResponse,
  SituacaoEstagio,
  TipoBolsaEstagiario,
  UsuarioOpcaoEstagioResponse,
  VinculoEstagioAtividadeResponse,
  VinculoEstagioResponse,
} from '@/modules/estagiarios/types/estagiario'

type EstadoOperacional = 'OPERACIONAL' | 'SEM_ATIVIDADE' | 'ENCERRADO'
type StatusTabela = 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'PRORROGADO' | 'ENCERRADO'
type FiltroStatus = 'TODOS' | StatusTabela

const session = useSessionStore()

const estagiarios = ref<EstagiarioResponse[]>([])
const carregando = ref(false)
const erro = ref('')
const busca = ref('')
const filtroStatus = ref<FiltroStatus>('TODOS')
const filtroFormacao = ref<FormacaoEstagiario | 'TODOS'>('TODOS')
const contexto = ref('TODOS')
const selecionado = ref<EstagiarioResponse | null>(null)

const acaoErro = ref('')
const acaoSucesso = ref('')
const processandoAcao = ref(false)

const modalAtividadeAberto = ref(false)
const atividadesDisponiveis = ref<AtividadeDisponivelEstagioResponse[]>([])
const atividadeSelecionadaId = ref('')
const atividadeInicio = ref('')
const atividadeObservacao = ref('')

const modalEditarParticipacaoAberto = ref(false)
const participacaoEdicao = ref<VinculoEstagioAtividadeResponse | null>(null)
const participacaoEdicaoAtividadeId = ref('')
const participacaoEdicaoInicio = ref('')
const participacaoEdicaoObservacao = ref('')

const modalEncerrarParticipacaoAberto = ref(false)
const participacaoEncerramento = ref<VinculoEstagioAtividadeResponse | null>(null)
const participacaoEncerramentoId = ref('')
const participacaoDataFim = ref('')

const modalBolsaAberto = ref(false)
const tipoOperacaoBolsa = ref<'PRORROGAR' | 'NOVA'>('PRORROGAR')
const prorrogacaoFimPrevista = ref('')
const novaBolsaTipo = ref<TipoBolsaEstagiario>('BOLSA_INSTITUCIONAL')
const novaBolsaInicio = ref('')
const novaBolsaFimPrevista = ref('')

const modalCulturasAberto = ref(false)
const participacaoCulturas = ref<VinculoEstagioAtividadeResponse | null>(null)
const culturasDisponiveis = ref<CulturaEstagioResponse[]>([])
const culturasSelecionadas = ref<string[]>([])
const novaCulturaNome = ref('')

const observacoesVinculo = ref<ObservacaoVinculoEstagioResponse[]>([])
const carregandoObservacoes = ref(false)
const modalObservacaoAberto = ref(false)
const observacaoTexto = ref('')

const modalTreinamentoAberto = ref(false)
const treinamentoNovoEstado = ref(false)
const treinamentoObservacao = ref('')

const modalVinculoAberto = ref(false)
const cursosDisponiveis = ref<CursoEstagioResponse[]>([])
const orientadoresDisponiveis = ref<UsuarioOpcaoEstagioResponse[]>([])
const edicaoOrientadorId = ref('')
const edicaoDataInicio = ref('')
const edicaoDataFimPrevista = ref('')
const edicaoTipoBolsa = ref<TipoBolsaEstagiario>('BOLSA_INSTITUCIONAL')
const edicaoFormacao = ref<FormacaoEstagiario>('GRADUACAO')
const edicaoFormacaoOutro = ref('')
const NOVO_CURSO_VALUE = '__NOVO_CURSO__'

const edicaoCursoId = ref('')
const edicaoNovoCursoNome = ref('')
const edicaoObservacao = ref('')

const formacoes: Record<FormacaoEstagiario, string> = {
  ENSINO_MEDIO: 'Ensino médio',
  GRADUACAO: 'Graduação',
  MESTRADO: 'Mestrado',
  DOUTORADO: 'Doutorado',
  POS_DOUTORADO: 'Pós-doutorado',
  APOIO_ADMINISTRATIVO: 'Apoio administrativo',
  APOIO_TECNICO: 'Apoio técnico',
  OUTRO: 'Outro',
}

const opcoesFormacao = Object.entries(formacoes)
  .map(([valor, rotulo]) => ({
    valor: valor as FormacaoEstagiario,
    rotulo,
  }))


const opcoesBolsa: Array<{ valor: TipoBolsaEstagiario; rotulo: string }> = [
  { valor: 'BOLSA_CNPQ', rotulo: 'Bolsa CNPq' },
  { valor: 'BOLSA_CAPES', rotulo: 'Bolsa CAPES' },
  { valor: 'BOLSA_INSTITUCIONAL', rotulo: 'Bolsa institucional' },
  { valor: 'VOLUNTARIO', rotulo: 'Voluntário' },
  { valor: 'CONTRATUAL', rotulo: 'Contrato' },
]

const situacoes: Record<SituacaoEstagio, string> = {
  EM_ANDAMENTO: 'Em andamento',
  PRORROGADO: 'Prorrogado',
  FINALIZADO: 'Encerrado',
}

function vinculoAtual(estagiario: EstagiarioResponse) {
  return estagiario.vinculos?.find((item) => item.situacao !== 'FINALIZADO')
    ?? estagiario.vinculos?.[0]
    ?? null
}

function participacoesAtivas(vinculo: VinculoEstagioResponse | null) {
  return vinculo?.participacoesAtividade?.filter((item) => item.ativa) ?? []
}

function estadoOperacional(estagiario: EstagiarioResponse): EstadoOperacional {
  const vinculo = vinculoAtual(estagiario)

  if (!vinculo || vinculo.situacao === 'FINALIZADO') return 'ENCERRADO'

  if (
    Boolean(estagiario.usuarioAtivo)
    && participacoesAtivas(vinculo).length > 0
  ) {
    return 'OPERACIONAL'
  }

  return 'SEM_ATIVIDADE'
}

function rotuloBolsa(valor: TipoBolsaEstagiario | null | undefined) {
  if (valor === 'BOLSA_CNPQ') return 'Bolsa CNPq'
  if (valor === 'BOLSA_CAPES') return 'Bolsa CAPES'
  if (valor === 'BOLSA_INSTITUCIONAL') return 'Bolsa institucional'
  if (valor === 'VOLUNTARIO') return 'Voluntário'
  if (valor === 'CONTRATUAL') return 'Contrato'
  return 'Não informado'
}

function rotuloFormacao(vinculo: VinculoEstagioResponse | null) {
  if (!vinculo?.formacao) return 'Formação não informada'
  if (vinculo.formacao === 'OUTRO') return vinculo.formacaoOutro || 'Outra formação'
  return formacoes[vinculo.formacao]
}

function rotuloSituacao(valor: SituacaoEstagio | null | undefined) {
  return valor ? situacoes[valor] : 'Não informada'
}

function statusTabela(estagiario: EstagiarioResponse): StatusTabela {
  const vinculo = vinculoAtual(estagiario)

  if (!vinculo || vinculo.situacao === 'FINALIZADO') return 'ENCERRADO'

  const participacoes = vinculo.participacoesAtividade ?? []

  if (participacoes.length === 0) return 'NAO_INICIADO'
  if (vinculo.situacao === 'PRORROGADO') return 'PRORROGADO'

  return 'EM_ANDAMENTO'
}

function rotuloStatusTabela(status: StatusTabela) {
  if (status === 'NAO_INICIADO') return 'Não iniciado'
  if (status === 'PRORROGADO') return 'Prorrogado'
  if (status === 'ENCERRADO') return 'Encerrado'
  return 'Em andamento'
}

function classeStatusTabela(status: StatusTabela) {
  if (status === 'NAO_INICIADO') return 'status-pill--pending'
  if (status === 'PRORROGADO') return 'status-pill--extended'
  if (status === 'ENCERRADO') return 'status-pill--closed'
  return 'status-pill--active'
}

function detalheStatusTabela(estagiario: EstagiarioResponse) {
  const status = statusTabela(estagiario)
  const vinculo = vinculoAtual(estagiario)

  if (status === 'NAO_INICIADO') return 'Sem atividade vinculada'
  if (status === 'ENCERRADO') return 'Vínculo finalizado'

  return participacoesAtivas(vinculo).length > 0
    ? 'Com atividade ativa'
    : 'Sem atividade ativa'
}


function formatarData(valor: string | null | undefined) {
  if (!valor) return 'Não informada'
  const [ano, mes, dia] = valor.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(ano, (mes ?? 1) - 1, dia ?? 1))
}

function dataLocal(valor: string) {
  const [ano, mes, dia] = valor.split('-').map(Number)
  return new Date(ano, (mes ?? 1) - 1, dia ?? 1)
}

function formatarDataHora(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor))
}

function rotuloEventoObservacao(observacao: ObservacaoVinculoEstagioResponse) {
  if (observacao.evento === 'TREINAMENTO_CONCLUIDO') return 'Treinamento de segurança concluído'
  if (observacao.evento === 'TREINAMENTO_REVERTIDO') return 'Conclusão do treinamento revertida'
  return observacao.tipo === 'TREINAMENTO_SEGURANCA'
    ? 'Observação sobre treinamento de segurança'
    : 'Observação operacional'
}

function fimExibicao(vinculo: VinculoEstagioResponse | null) {
  if (!vinculo) return null
  return vinculo.dataFimEfetiva || vinculo.dataFimPrevista
}

function fimBasePeriodo(vinculo: VinculoEstagioResponse | null) {
  if (!vinculo) return null

  if (
    vinculo.situacao === 'PRORROGADO'
    && vinculo.dataFimPrevistaOriginal
  ) {
    return vinculo.dataFimPrevistaOriginal
  }

  return vinculo.dataFimEfetiva || vinculo.dataFimPrevista
}

function possuiProrrogacaoExibivel(vinculo: VinculoEstagioResponse | null) {
  return Boolean(
    vinculo?.situacao === 'PRORROGADO'
    && vinculo.dataFimPrevistaOriginal
    && vinculo.dataFimPrevista,
  )
}

function textoContextoSemAtividade(estagiario: EstagiarioResponse) {
  const vinculo = vinculoAtual(estagiario)
  return (vinculo?.participacoesAtividade?.length ?? 0) > 0
    ? 'Sem atividades ativas'
    : 'Sem atividades vinculadas'
}

function contagemContexto(vinculo: VinculoEstagioResponse | null) {
  const participacoes = participacoesAtivas(vinculo)
  const projetos = new Set(participacoes.map((item) => item.projetoId).filter(Boolean))
  const laboratorios = new Set(participacoes.map((item) => item.laboratorioId).filter(Boolean))

  return {
    atividades: participacoes.length,
    projetos: projetos.size,
    laboratorios: laboratorios.size,
  }
}

function textoQuantidade(valor: number, singular: string, plural: string) {
  return `${valor} ${valor === 1 ? singular : plural}`
}

function nomesCulturas(participacao: VinculoEstagioAtividadeResponse) {
  return participacao.culturas?.length
    ? participacao.culturas.map((cultura) => cultura.nome).join(', ')
    : 'Nenhuma cultura associada'
}

function fimReferenciaParticipacao(participacao: VinculoEstagioAtividadeResponse) {
  return participacao.dataFimParticipacao
    || participacao.atividadeDataFim
    || participacao.projetoDataFim
    || null
}

function usaPrazoDoProjeto(participacao: VinculoEstagioAtividadeResponse) {
  return Boolean(
    participacao.ativa
    && !participacao.atividadeDataFim
    && participacao.projetoDataFim,
  )
}

function participacaoSelecionadaParaEncerrar() {
  return participacoesAtivas(vinculoSelecionado.value)
    .find((participacao) => participacao.id === participacaoEncerramentoId.value)
    ?? participacaoEncerramento.value
    ?? null
}

function mensagemErro(error: unknown, padrao = 'Não foi possível carregar os dados de estagiários.') {
  if (axios.isAxiosError<ApiErrorResponse>(error)) return error.response?.data?.message ?? padrao
  return error instanceof Error ? error.message : padrao
}

const contextos = computed(() => {
  const opcoes = new Map<string, string>()

  estagiarios.value.forEach((estagiario) => {
    estagiario.vinculos?.forEach((vinculo) => {
      vinculo.participacoesAtividade?.forEach((participacao) => {
        if (participacao.projetoId && participacao.projetoNome) {
          opcoes.set(`PROJETO:${participacao.projetoId}`, `Projeto · ${participacao.projetoNome}`)
        }
        if (participacao.laboratorioId && participacao.laboratorioNome) {
          opcoes.set(`LAB:${participacao.laboratorioId}`, `Laboratório · ${participacao.laboratorioNome}`)
        }
      })
    })
  })

  return [...opcoes.entries()]
    .map(([valor, rotulo]) => ({ valor, rotulo }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
})

function correspondeContexto(estagiario: EstagiarioResponse) {
  if (contexto.value === 'TODOS') return true

  const [tipo, id] = contexto.value.split(':')
  const vinculo = vinculoAtual(estagiario)

  return participacoesAtivas(vinculo).some((participacao) => {
    if (tipo === 'PROJETO') return participacao.projetoId === id
    if (tipo === 'LAB') return participacao.laboratorioId === id
    return false
  })
}

function termosPesquisa(estagiario: EstagiarioResponse) {
  const vinculo = vinculoAtual(estagiario)
  const participacoes = vinculo?.participacoesAtividade ?? []

  return [
    estagiario.usuarioNome,
    estagiario.unidadeNome ?? '',
    rotuloBolsa(vinculo?.tipoBolsa),
    rotuloFormacao(vinculo),
    vinculo?.cursoNome ?? '',
    vinculo?.orientadorNome ?? '',
    vinculo?.referenciaInstitucional ?? '',
    ...participacoes.flatMap((item) => [
      item.atividadeNome ?? '',
      item.atividadeCodigoSeg ?? '',
      item.sciNome ?? '',
      item.projetoNome ?? '',
      item.laboratorioNome ?? '',
      ...(item.culturas ?? []).map((cultura) => cultura.nome),
    ]),
  ]
}

const estagiariosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')

  return estagiarios.value.filter((estagiario) => {
    const vinculo = vinculoAtual(estagiario)

    const statusOk = filtroStatus.value === 'TODOS' || filtroStatus.value === statusTabela(estagiario)
    const formacaoOk = filtroFormacao.value === 'TODOS' || vinculo?.formacao === filtroFormacao.value
    const contextoOk = correspondeContexto(estagiario)
    const buscaOk = !termo || termosPesquisa(estagiario)
      .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))

    return statusOk && formacaoOk && contextoOk && buscaOk
  })
})

const operacionais = computed(() => estagiarios.value.filter((item) => estadoOperacional(item) === 'OPERACIONAL'))
const semAtividade = computed(() => estagiarios.value.filter((item) => estadoOperacional(item) === 'SEM_ATIVIDADE'))
const encerrados = computed(() => estagiarios.value.filter((item) => estadoOperacional(item) === 'ENCERRADO'))

const encerramEmBreve = computed(() => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const limite = new Date(hoje)
  limite.setDate(limite.getDate() + 30)

  return estagiarios.value.filter((estagiario) => {
    const vinculo = vinculoAtual(estagiario)
    if (!vinculo || vinculo.situacao === 'FINALIZADO' || !vinculo.dataFimPrevista) return false
    const fim = dataLocal(vinculo.dataFimPrevista)
    return fim >= hoje && fim <= limite
  }).length
})

const vinculoSelecionado = computed(() => selecionado.value ? vinculoAtual(selecionado.value) : null)

async function carregarObservacoesVinculo() {
  const vinculo = vinculoSelecionado.value

  if (!vinculo) {
    observacoesVinculo.value = []
    return
  }

  carregandoObservacoes.value = true

  try {
    observacoesVinculo.value = await estagiarioService.listarObservacoes(vinculo.id)
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível carregar as observações do vínculo.')
  } finally {
    carregandoObservacoes.value = false
  }
}

async function abrirDetalhes(estagiario: EstagiarioResponse) {
  selecionado.value = estagiario
  observacoesVinculo.value = []
  await carregarObservacoesVinculo()
}

function fecharDetalhes() {
  selecionado.value = null
  observacoesVinculo.value = []
  acaoErro.value = ''
  acaoSucesso.value = ''
}

function limparFiltros() {
  busca.value = ''
  filtroStatus.value = 'TODOS'
  filtroFormacao.value = 'TODOS'
  contexto.value = 'TODOS'
}

async function carregar() {
  carregando.value = true
  erro.value = ''

  try {
    estagiarios.value = await estagiarioService.listarTodos()

    if (selecionado.value) {
      selecionado.value = estagiarios.value.find((item) => item.id === selecionado.value?.id) ?? null
    }
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregando.value = false
  }
}

function hojeIso() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function limparFeedbackAcao() {
  acaoErro.value = ''
  acaoSucesso.value = ''
}

async function abrirEditarVinculo() {
  const vinculo = vinculoSelecionado.value
  const estagiario = selecionado.value

  if (!vinculo || !estagiario || vinculo.situacao === 'FINALIZADO') return

  limparFeedbackAcao()

  edicaoOrientadorId.value = vinculo.orientadorId || ''
  edicaoDataInicio.value = vinculo.dataInicio
  edicaoDataFimPrevista.value = vinculo.dataFimPrevista || ''
  edicaoTipoBolsa.value = vinculo.tipoBolsa
  edicaoFormacao.value = vinculo.formacao || 'GRADUACAO'
  edicaoFormacaoOutro.value = vinculo.formacaoOutro || ''
  edicaoCursoId.value = vinculo.cursoId || ''
  edicaoNovoCursoNome.value = ''
  edicaoObservacao.value = vinculo.observacao || ''

  modalVinculoAberto.value = true

  try {
    const [cursos, usuarios] = await Promise.all([
      estagiarioService.listarCursosAtivos(),
      estagiarioService.listarUsuarios(),
    ])

    cursosDisponiveis.value = cursos
    orientadoresDisponiveis.value = usuarios.filter((usuario) =>
      usuario.ativo
      && usuario.unidadeId === estagiario.unidadeId
      && ['ANALISTA', 'PESQUISADOR'].includes(usuario.perfil),
    )
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível carregar os dados de edição do vínculo.')
  }
}

function fecharModalVinculo() {
  modalVinculoAberto.value = false
}

function abrirEditarBolsa() {
  const vinculo = vinculoSelecionado.value

  if (!vinculo || vinculo.situacao === 'FINALIZADO') return

  limparFeedbackAcao()
  tipoOperacaoBolsa.value = 'PRORROGAR'
  prorrogacaoFimPrevista.value = ''
  novaBolsaTipo.value = vinculo.tipoBolsa
  novaBolsaInicio.value = hojeIso()
  novaBolsaFimPrevista.value = ''
  modalBolsaAberto.value = true
}

function fecharModalBolsa() {
  modalBolsaAberto.value = false
}

async function salvarBolsa() {
  const vinculo = vinculoSelecionado.value

  if (!vinculo) return

  limparFeedbackAcao()

  if (tipoOperacaoBolsa.value === 'PRORROGAR') {
    if (!prorrogacaoFimPrevista.value) {
      acaoErro.value = 'Informe a nova data final prevista.'
      return
    }

    if (!vinculo.dataFimPrevista) {
      acaoErro.value = 'A bolsa atual não possui data final prevista.'
      return
    }

    if (prorrogacaoFimPrevista.value <= vinculo.dataFimPrevista) {
      acaoErro.value = 'A prorrogação deve informar uma data posterior ao término atual.'
      return
    }

    processandoAcao.value = true

    try {
      await estagiarioService.prorrogarBolsa(vinculo.id, {
        novaDataFimPrevista: prorrogacaoFimPrevista.value,
      })

      modalBolsaAberto.value = false
      acaoSucesso.value = 'Bolsa atual prorrogada e histórico atualizado.'
      await carregar()
    } catch (error) {
      acaoErro.value = mensagemErro(error, 'Não foi possível prorrogar a bolsa atual.')
    } finally {
      processandoAcao.value = false
    }

    return
  }

  if (!novaBolsaInicio.value || !novaBolsaFimPrevista.value) {
    acaoErro.value = 'Informe a data inicial e a data final prevista da nova bolsa.'
    return
  }

  if (novaBolsaFimPrevista.value < novaBolsaInicio.value) {
    acaoErro.value = 'A data final prevista não pode ser anterior à data inicial.'
    return
  }

  if (novaBolsaInicio.value > hojeIso()) {
    acaoErro.value = 'Para registrar uma nova bolsa local, a data inicial deve ser hoje ou uma data passada.'
    return
  }

  processandoAcao.value = true

  try {
    await estagiarioService.registrarNovaBolsa(vinculo.id, {
      tipoBolsa: novaBolsaTipo.value,
      dataInicio: novaBolsaInicio.value,
      dataFimPrevista: novaBolsaFimPrevista.value,
    })

    modalBolsaAberto.value = false
    acaoSucesso.value = 'Nova bolsa registrada. A bolsa anterior foi preservada no histórico.'
    await carregar()
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível registrar a nova bolsa.')
  } finally {
    processandoAcao.value = false
  }
}

async function salvarVinculo() {
  const vinculo = vinculoSelecionado.value
  if (!vinculo) return

  limparFeedbackAcao()

  if (!edicaoOrientadorId.value) {
    acaoErro.value = 'Selecione um Orientador.'
    return
  }

  if (!edicaoDataInicio.value || !edicaoDataFimPrevista.value) {
    acaoErro.value = 'Data de início e data final prevista são obrigatórias.'
    return
  }

  if (edicaoDataFimPrevista.value < edicaoDataInicio.value) {
    acaoErro.value = 'A data final prevista não pode ser anterior à data de início.'
    return
  }

  if (edicaoFormacao.value === 'OUTRO' && !edicaoFormacaoOutro.value.trim()) {
    acaoErro.value = 'Informe a descrição da formação.'
    return
  }

  if (edicaoCursoId.value === NOVO_CURSO_VALUE && !edicaoNovoCursoNome.value.trim()) {
    acaoErro.value = 'Informe o nome do novo Curso.'
    return
  }

  if (edicaoCursoId.value === NOVO_CURSO_VALUE && !selecionado.value?.unidadeId) {
    acaoErro.value = 'A Unidade do Estagiário não foi identificada.'
    return
  }

  processandoAcao.value = true

  try {
    let cursoId: string | null = edicaoCursoId.value || null

    if (edicaoCursoId.value === NOVO_CURSO_VALUE) {
      const criado = await estagiarioService.criarCurso(
        selecionado.value!.unidadeId!,
        edicaoNovoCursoNome.value.trim(),
      )

      cursoId = criado.id
      cursosDisponiveis.value = [...cursosDisponiveis.value, criado]
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      edicaoCursoId.value = criado.id
      edicaoNovoCursoNome.value = ''
    }

    await estagiarioService.atualizarVinculo(vinculo.id, {
      orientadorId: edicaoOrientadorId.value,
      dataInicio: edicaoDataInicio.value,
      dataFimPrevista: edicaoDataFimPrevista.value,
      tipoBolsa: edicaoTipoBolsa.value,
      formacao: edicaoFormacao.value,
      formacaoOutro: edicaoFormacao.value === 'OUTRO'
        ? edicaoFormacaoOutro.value.trim()
        : null,
      cursoId,
      observacao: edicaoObservacao.value.trim() || null,
    })

    modalVinculoAberto.value = false
    acaoSucesso.value = 'Dados do vínculo atualizados no SGL.'
    await carregar()
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível atualizar o vínculo.')
  } finally {
    processandoAcao.value = false
  }
}

async function abrirAssociarAtividade() {
  if (!vinculoSelecionado.value || vinculoSelecionado.value.situacao === 'FINALIZADO') return

  limparFeedbackAcao()
  atividadeSelecionadaId.value = ''
  atividadeInicio.value = hojeIso()
  atividadeObservacao.value = ''
  modalAtividadeAberto.value = true

  if (atividadesDisponiveis.value.length > 0) return

  try {
    atividadesDisponiveis.value = await estagiarioService.listarAtividadesDisponiveis()
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível carregar as Atividades disponíveis.')
  }
}

function fecharModalAtividade() {
  modalAtividadeAberto.value = false
}

async function associarAtividade() {
  if (!vinculoSelecionado.value) return

  if (!atividadeSelecionadaId.value) {
    acaoErro.value = 'Selecione uma Atividade.'
    return
  }

  if (!atividadeInicio.value) {
    acaoErro.value = 'Informe a data de início da participação.'
    return
  }

  limparFeedbackAcao()
  processandoAcao.value = true

  try {
    await estagiarioService.associarAtividade(vinculoSelecionado.value.id, {
      atividadeId: atividadeSelecionadaId.value,
      dataInicioParticipacao: atividadeInicio.value,
      observacao: atividadeObservacao.value.trim() || null,
      culturaIds: [],
    })

    modalAtividadeAberto.value = false
    acaoSucesso.value = 'Atividade associada ao vínculo.'
    await carregar()
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível associar a Atividade.')
  } finally {
    processandoAcao.value = false
  }
}


async function carregarAtividadesDisponiveis() {
  if (atividadesDisponiveis.value.length > 0) return

  atividadesDisponiveis.value = await estagiarioService.listarAtividadesDisponiveis()
}

async function abrirEditarParticipacao(participacao: VinculoEstagioAtividadeResponse) {
  if (!participacao.ativa) return

  limparFeedbackAcao()
  participacaoEdicao.value = participacao
  participacaoEdicaoAtividadeId.value = participacao.atividadeId || ''
  participacaoEdicaoInicio.value = participacao.dataInicioParticipacao
  participacaoEdicaoObservacao.value = participacao.observacao || ''
  modalEditarParticipacaoAberto.value = true

  try {
    await carregarAtividadesDisponiveis()
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível carregar as Atividades disponíveis.')
  }
}

function fecharModalEditarParticipacao() {
  modalEditarParticipacaoAberto.value = false
  participacaoEdicao.value = null
}

async function salvarEdicaoParticipacao() {
  const participacao = participacaoEdicao.value

  if (!participacao) return

  if (!participacaoEdicaoAtividadeId.value) {
    acaoErro.value = 'Selecione uma Atividade.'
    return
  }

  if (!participacaoEdicaoInicio.value) {
    acaoErro.value = 'Informe a data de início da participação.'
    return
  }

  limparFeedbackAcao()
  processandoAcao.value = true

  try {
    await estagiarioService.atualizarParticipacao(participacao.id, {
      atividadeId: participacaoEdicaoAtividadeId.value,
      dataInicioParticipacao: participacaoEdicaoInicio.value,
      observacao: participacaoEdicaoObservacao.value.trim() || null,
      culturaIds: participacao.culturas?.map((cultura) => cultura.id) ?? [],
    })

    modalEditarParticipacaoAberto.value = false
    participacaoEdicao.value = null
    acaoSucesso.value = 'Participação atualizada.'
    await carregar()
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível atualizar a participação.')
  } finally {
    processandoAcao.value = false
  }
}

function abrirEncerrarParticipacao(participacao?: VinculoEstagioAtividadeResponse) {
  if (participacao && !participacao.ativa) return

  limparFeedbackAcao()
  participacaoEncerramento.value = participacao ?? null
  participacaoEncerramentoId.value = participacao?.id ?? ''
  participacaoDataFim.value = hojeIso()
  modalEncerrarParticipacaoAberto.value = true
}

function fecharModalEncerrarParticipacao() {
  modalEncerrarParticipacaoAberto.value = false
  participacaoEncerramento.value = null
  participacaoEncerramentoId.value = ''
}

async function encerrarParticipacao() {
  const participacao = participacaoSelecionadaParaEncerrar()

  if (!participacao) {
    acaoErro.value = 'Selecione a Atividade que será encerrada.'
    return
  }

  if (!participacaoDataFim.value) {
    acaoErro.value = 'Informe a data final da participação.'
    return
  }

  if (participacaoDataFim.value < participacao.dataInicioParticipacao) {
    acaoErro.value = 'A data final não pode ser anterior ao início da participação.'
    return
  }

  limparFeedbackAcao()
  processandoAcao.value = true

  try {
    await estagiarioService.encerrarParticipacao(participacao.id, participacaoDataFim.value)

    modalEncerrarParticipacaoAberto.value = false
    participacaoEncerramento.value = null
    participacaoEncerramentoId.value = ''
    acaoSucesso.value = 'Atividade encerrada para este Estagiário.'
    await carregar()
  } catch (error) {
    acaoErro.value = mensagemErro(
      error,
      'Não foi possível encerrar a participação. Se esta for a última participação ativa, associe ou corrija outra Atividade antes.',
    )
  } finally {
    processandoAcao.value = false
  }
}

function abrirModalTreinamento() {
  const vinculo = vinculoSelecionado.value

  if (!vinculo || vinculo.situacao === 'FINALIZADO') return

  limparFeedbackAcao()
  treinamentoNovoEstado.value = !Boolean(vinculo.treinamentoSegurancaConcluido)
  treinamentoObservacao.value = ''
  modalTreinamentoAberto.value = true
}

function fecharModalTreinamento() {
  modalTreinamentoAberto.value = false
  treinamentoObservacao.value = ''
}

async function salvarTreinamento() {
  const vinculo = vinculoSelecionado.value
  const usuarioId = session.usuario?.id

  if (!vinculo || !usuarioId) {
    acaoErro.value = 'Não foi possível identificar o vínculo ou o usuário operador.'
    return
  }

  limparFeedbackAcao()
  processandoAcao.value = true

  try {
    await estagiarioService.alterarTreinamento(
      vinculo.id,
      usuarioId,
      treinamentoNovoEstado.value,
      treinamentoObservacao.value.trim() || null,
    )

    modalTreinamentoAberto.value = false
    acaoSucesso.value = treinamentoNovoEstado.value
      ? 'Treinamento de segurança registrado.'
      : 'Conclusão do treinamento de segurança revertida.'

    await carregar()
    await carregarObservacoesVinculo()
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível alterar o treinamento de segurança.')
  } finally {
    processandoAcao.value = false
  }
}

function abrirModalObservacao() {
  if (!vinculoSelecionado.value) return

  limparFeedbackAcao()
  observacaoTexto.value = ''
  modalObservacaoAberto.value = true
}

function fecharModalObservacao() {
  modalObservacaoAberto.value = false
  observacaoTexto.value = ''
}

async function salvarObservacao() {
  const vinculo = vinculoSelecionado.value
  const usuarioId = session.usuario?.id
  const texto = observacaoTexto.value.trim()

  if (!vinculo || !usuarioId) {
    acaoErro.value = 'Não foi possível identificar o vínculo ou o usuário operador.'
    return
  }

  if (!texto) {
    acaoErro.value = 'Digite a observação.'
    return
  }

  limparFeedbackAcao()
  processandoAcao.value = true

  try {
    await estagiarioService.adicionarObservacao(vinculo.id, usuarioId, texto)

    modalObservacaoAberto.value = false
    observacaoTexto.value = ''
    acaoSucesso.value = 'Observação registrada.'
    await carregarObservacoesVinculo()
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível registrar a observação.')
  } finally {
    processandoAcao.value = false
  }
}

async function abrirGerenciarCulturas(participacao: VinculoEstagioAtividadeResponse) {
  if (!participacao.ativa) return

  limparFeedbackAcao()
  participacaoCulturas.value = participacao
  culturasSelecionadas.value = participacao.culturas?.map((cultura) => cultura.id) ?? []
  novaCulturaNome.value = ''
  modalCulturasAberto.value = true

  if (culturasDisponiveis.value.length > 0) return

  try {
    culturasDisponiveis.value = await estagiarioService.listarCulturasAtivas()
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível carregar as Culturas.')
  }
}

function fecharModalCulturas() {
  modalCulturasAberto.value = false
  participacaoCulturas.value = null
}

async function criarCulturaNoModal() {
  const unidadeId = selecionado.value?.unidadeId
  const nome = novaCulturaNome.value.trim()

  if (!unidadeId) {
    acaoErro.value = 'A Unidade do Estagiário não foi identificada.'
    return
  }

  if (!nome) {
    acaoErro.value = 'Informe o nome da nova Cultura.'
    return
  }

  limparFeedbackAcao()
  processandoAcao.value = true

  try {
    const criada = await estagiarioService.criarCultura(unidadeId, nome)

    culturasDisponiveis.value = [...culturasDisponiveis.value, criada]
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

    if (!culturasSelecionadas.value.includes(criada.id)) {
      culturasSelecionadas.value = [...culturasSelecionadas.value, criada.id]
    }

    novaCulturaNome.value = ''
    acaoSucesso.value = 'Cultura criada e selecionada para esta participação.'
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível criar a Cultura.')
  } finally {
    processandoAcao.value = false
  }
}

async function salvarCulturas() {
  if (!participacaoCulturas.value) return

  limparFeedbackAcao()
  processandoAcao.value = true

  try {
    await estagiarioService.atualizarCulturas(
      participacaoCulturas.value.id,
      culturasSelecionadas.value,
    )

    modalCulturasAberto.value = false
    participacaoCulturas.value = null
    acaoSucesso.value = 'Culturas da participação atualizadas.'
    await carregar()
  } catch (error) {
    acaoErro.value = mensagemErro(error, 'Não foi possível atualizar as Culturas.')
  } finally {
    processandoAcao.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <section class="intern-page">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">GESTÃO / ESTAGIÁRIOS</p>
        <h1>Estagiários</h1>
        <p>Acompanhamento institucional e operacional dos vínculos.</p>
      </div>

      <div class="heading-actions">
        <button class="primary-action" type="button" :disabled="carregando" @click="carregar">
          {{ carregando ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>
    </header>

    <section class="metrics-grid">
      <article class="metric-card metric-card--success">
        <span>Operacionais</span>
        <strong>{{ operacionais.length }}</strong>
        <small>com participação ativa</small>
      </article>

      <article class="metric-card metric-card--warning">
        <span>Sem atividade</span>
        <strong>{{ semAtividade.length }}</strong>
        <small>aguardando contexto operacional</small>
      </article>

      <article class="metric-card metric-card--info">
        <span>Até 30 dias</span>
        <strong>{{ encerramEmBreve }}</strong>
        <small>próximos do término previsto</small>
      </article>

      <article class="metric-card">
        <span>Encerrados</span>
        <strong>{{ encerrados.length }}</strong>
        <small>vínculos finalizados</small>
      </article>
    </section>

    <div v-if="erro" class="feedback feedback--error">{{ erro }}</div>

    <section class="workspace-card">
      <div class="filters-grid">
        <label class="field field--search">
          <span>Busca</span>
          <input
            v-model="busca"
            type="search"
            placeholder="Nome, curso, projeto, laboratório..."
          />
        </label>

        <label class="field">
          <span>Status</span>
          <select v-model="filtroStatus">
            <option value="TODOS">Todos</option>
            <option value="NAO_INICIADO">Não iniciado</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="PRORROGADO">Prorrogado</option>
            <option value="ENCERRADO">Encerrado</option>
          </select>
        </label>

        <label class="field">
          <span>Formação</span>
          <select v-model="filtroFormacao">
            <option value="TODOS">Todos</option>
            <option v-for="opcao in opcoesFormacao" :key="opcao.valor" :value="opcao.valor">
              {{ opcao.rotulo }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>Projeto / Laboratório</span>
          <select v-model="contexto">
            <option value="TODOS">Todos</option>
            <option v-for="opcao in contextos" :key="opcao.valor" :value="opcao.valor">
              {{ opcao.rotulo }}
            </option>
          </select>
        </label>
      </div>

      <div class="filter-summary">
        <div>
          <strong>{{ estagiariosFiltrados.length }}</strong>
          <span>registro(s)</span>
        </div>

        <button
          v-if="busca || filtroStatus !== 'TODOS' || filtroFormacao !== 'TODOS' || contexto !== 'TODOS'"
          type="button"
          @click="limparFiltros"
        >
          Limpar filtros
        </button>
      </div>

      <div v-if="carregando" class="state-box">Carregando estagiários...</div>
      <div v-else-if="estagiariosFiltrados.length === 0" class="state-box">
        Nenhum estagiário encontrado.
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Estagiário</th>
              <th>Formação</th>
              <th>Contexto operacional</th>
              <th>Período</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="estagiario in estagiariosFiltrados"
              :key="estagiario.id"
              @click="abrirDetalhes(estagiario)"
            >
              <td class="status-cell">
                <span
                  class="status-pill"
                  :class="classeStatusTabela(statusTabela(estagiario))"
                >
                  <span class="status-dot" />
                  {{ rotuloStatusTabela(statusTabela(estagiario)) }}
                </span>
                <small class="status-reason">{{ detalheStatusTabela(estagiario) }}</small>
              </td>

              <td class="student-cell">
                <strong>{{ estagiario.usuarioNome }}</strong>
                <small class="student-responsible">
                  Orientador: {{ vinculoAtual(estagiario)?.orientadorNome || 'Não informado' }}
                </small>
              </td>

              <td class="formation-cell">
                <strong>{{ rotuloFormacao(vinculoAtual(estagiario)) }}</strong>
                <small>{{ vinculoAtual(estagiario)?.cursoNome || 'Curso não informado' }}</small>
              </td>

              <td>
                <div
                  v-if="estadoOperacional(estagiario) === 'OPERACIONAL'"
                  class="context-preview"
                >
                  <span class="context-item">
                    <svg class="context-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 5h6M7 3h10v4H7zM6 7h12v14H6zM9 11h6M9 15h6" />
                    </svg>
                    {{ textoQuantidade(contagemContexto(vinculoAtual(estagiario)).atividades, 'atividade', 'atividades') }}
                  </span>
                  <span class="context-item">
                    <svg class="context-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 7h7l2 2h9v10H3zM3 7V5h7l2 2" />
                    </svg>
                    {{ textoQuantidade(contagemContexto(vinculoAtual(estagiario)).projetos, 'projeto', 'projetos') }}
                  </span>
                  <span class="context-item">
                    <svg class="context-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8" />
                    </svg>
                    {{ textoQuantidade(contagemContexto(vinculoAtual(estagiario)).laboratorios, 'laboratório', 'laboratórios') }}
                  </span>
                </div>

                <span
                  v-else-if="estadoOperacional(estagiario) === 'SEM_ATIVIDADE'"
                  class="context-empty-text"
                >
                  {{ textoContextoSemAtividade(estagiario) }}
                </span>

                <span
                  v-else
                  class="history-preview"
                  title="Abra os detalhes para consultar o histórico"
                >
                  Histórico disponível
                </span>
              </td>

              <td class="period-cell">
                <div class="period-range">
                  <strong>{{ formatarData(vinculoAtual(estagiario)?.dataInicio) }}</strong>
                  <span class="period-separator">até</span>
                  <strong>{{ formatarData(fimBasePeriodo(vinculoAtual(estagiario))) }}</strong>
                </div>
                <small
                  v-if="possuiProrrogacaoExibivel(vinculoAtual(estagiario))"
                  class="extension-note"
                >
                  Prorrogado <span class="extension-separator">até</span> {{ formatarData(vinculoAtual(estagiario)?.dataFimPrevista) }}
                </small>
              </td>

              <td class="actions-column" @click.stop>
                <button class="detail-action" type="button" @click="abrirDetalhes(estagiario)">
                  Detalhes <span aria-hidden="true">›</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="selecionado" class="drawer-backdrop" @click.self="fecharDetalhes">
      <aside class="detail-drawer" role="dialog" aria-modal="true" aria-label="Detalhes do estagiário">
        <header class="drawer-header">
          <div>
            <p class="drawer-kicker">DETALHES DO ESTAGIÁRIO</p>
            <div class="drawer-title-row">
              <h2>{{ selecionado.usuarioNome }}</h2>
              <span
                class="status-pill"
                :class="classeStatusTabela(statusTabela(selecionado))"
              >
                <span class="status-dot" />
                {{ rotuloStatusTabela(statusTabela(selecionado)) }}
              </span>
            </div>
            <p>{{ selecionado.unidadeNome || 'Unidade não informada' }}</p>
          </div>

          <button type="button" aria-label="Fechar" @click="fecharDetalhes">×</button>
        </header>

        <div class="detail-content">
          <div v-if="acaoErro" class="feedback feedback--error drawer-feedback">{{ acaoErro }}</div>
          <div v-if="acaoSucesso" class="feedback feedback--success drawer-feedback">{{ acaoSucesso }}</div>

          <template v-if="vinculoSelecionado">
            <section class="drawer-section compact-section drawer-section--actions">
              <div class="section-heading">
                <span class="section-icon">01</span>
                <h3>Ações operacionais</h3>
              </div>

              <div class="operational-actions">
                <button
                  v-if="vinculoSelecionado.situacao !== 'FINALIZADO'"
                  class="drawer-action drawer-action--primary"
                  type="button"
                  :disabled="processandoAcao"
                  @click="abrirEditarVinculo"
                >
                  Editar vínculo
                </button>

                <button
                  v-if="vinculoSelecionado.situacao !== 'FINALIZADO'"
                  class="drawer-action"
                  type="button"
                  :disabled="processandoAcao"
                  @click="abrirEditarBolsa"
                >
                  Editar bolsa
                </button>

                <button
                  v-if="vinculoSelecionado.situacao !== 'FINALIZADO'"
                  class="drawer-action"
                  type="button"
                  :disabled="processandoAcao"
                  @click="abrirAssociarAtividade"
                >
                  Associar atividade
                </button>

                <button
                  v-if="participacoesAtivas(vinculoSelecionado).length > 0"
                  class="drawer-action"
                  type="button"
                  :disabled="processandoAcao"
                  @click="abrirEncerrarParticipacao()"
                >
                  Encerrar atividade
                </button>

                <button
                  class="drawer-action training-action"
                  :class="{
                    'training-action--complete': vinculoSelecionado.treinamentoSegurancaConcluido,
                    'training-action--pending': !vinculoSelecionado.treinamentoSegurancaConcluido,
                  }"
                  type="button"
                  :disabled="processandoAcao || vinculoSelecionado.situacao === 'FINALIZADO'"
                  @click="abrirModalTreinamento"
                >
                  <span class="training-action-icon" aria-hidden="true">
                    {{ vinculoSelecionado.treinamentoSegurancaConcluido ? '✓' : '!' }}
                  </span>
                  <span>
                    {{ vinculoSelecionado.treinamentoSegurancaConcluido
                      ? 'Treinamento concluído'
                      : 'Treinamento pendente' }}
                  </span>
                </button>
              </div>
            </section>

            <section class="drawer-section">
              <div class="section-heading">
                <span class="section-icon">02</span>
                <h3>Bolsa / Vínculo</h3>
              </div>

              <div class="institutional-card">
                <div class="card-subtitle">
                  {{ vinculoSelecionado.situacao === 'FINALIZADO' ? 'Último vínculo' : 'Bolsa vigente' }}
                </div>

                <div class="institutional-title">
                  <strong>{{ rotuloBolsa(vinculoSelecionado.tipoBolsa) }}</strong>
                  <span class="link-state" :class="{ 'link-state--closed': vinculoSelecionado.situacao === 'FINALIZADO' }">
                    {{ rotuloSituacao(vinculoSelecionado.situacao) }}
                  </span>
                </div>

                <div class="institutional-period">
                  <span>{{ formatarData(vinculoSelecionado.dataInicio) }}</span>
                  <span class="period-separator">até</span>
                  <span>{{ formatarData(fimBasePeriodo(vinculoSelecionado)) }}</span>
                </div>

                <p
                  v-if="possuiProrrogacaoExibivel(vinculoSelecionado)"
                  class="drawer-extension-note"
                >
                  Prorrogado <span class="extension-separator">até</span> <strong>{{ formatarData(vinculoSelecionado.dataFimPrevista) }}</strong>
                </p>

                <p>
                  Referência:
                  <strong>{{ vinculoSelecionado.referenciaInstitucional || 'não informada' }}</strong>
                </p>

                <div class="link-history-divider" />

                <div class="card-subtitle card-subtitle--history">Histórico de vínculos</div>

                <div class="timeline timeline--inside-card">
                  <article v-for="vinculo in selecionado.vinculos" :key="vinculo.id" class="timeline-item">
                    <span class="timeline-dot" :class="{ 'timeline-dot--closed': vinculo.situacao === 'FINALIZADO' }" />
                    <div>
                      <strong>{{ rotuloBolsa(vinculo.tipoBolsa) }}</strong>
                      <small>
                        {{ formatarData(vinculo.dataInicio) }}
                        até
                        {{ formatarData(fimExibicao(vinculo)) }}
                      </small>
                    </div>
                    <span class="link-state" :class="{ 'link-state--closed': vinculo.situacao === 'FINALIZADO' }">
                      {{ rotuloSituacao(vinculo.situacao) }}
                    </span>
                  </article>
                </div>
              </div>
            </section>

            <section class="drawer-section compact-section">
              <div class="section-heading">
                <span class="section-icon">03</span>
                <h3>Formação</h3>
              </div>

              <div class="detail-grid">
                <article>
                  <span>Formação</span>
                  <strong>{{ rotuloFormacao(vinculoSelecionado) }}</strong>
                </article>

                <article>
                  <span>Curso</span>
                  <strong>{{ vinculoSelecionado.cursoNome || 'Não informado' }}</strong>
                </article>
              </div>
            </section>

            <section class="drawer-section compact-section">
              <div class="section-heading">
                <span class="section-icon">04</span>
                <h3>Orientador</h3>
              </div>

              <p class="single-value">{{ vinculoSelecionado.orientadorNome || 'Não informado' }}</p>
            </section>

            <section class="drawer-section">
              <div class="section-heading">
                <span class="section-icon">05</span>
                <h3>Participações em atividades</h3>
              </div>

              <div v-if="vinculoSelecionado.participacoesAtividade.length === 0" class="drawer-empty">
                Este vínculo ainda não possui participação em Atividade.
              </div>

              <div v-else class="participations-list">
                <article
                  v-for="participacao in vinculoSelecionado.participacoesAtividade"
                  :key="participacao.id"
                  class="participation-card"
                >
                  <div class="participation-header">
                    <div>
                      <span class="participation-dot" :class="{ 'participation-dot--closed': !participacao.ativa }" />
                      <strong>{{ participacao.atividadeNome || 'Atividade sem nome' }}</strong>
                    </div>

                    <span
                      class="participation-state"
                      :class="{ 'participation-state--closed': !participacao.ativa }"
                    >
                      {{ participacao.ativa ? 'Participação ativa' : 'Participação encerrada' }}
                    </span>
                  </div>

                  <dl>
                    <div>
                      <dt>SCI</dt>
                      <dd>{{ participacao.sciNome || 'Não informado' }}</dd>
                    </div>
                    <div>
                      <dt>Projeto</dt>
                      <dd>{{ participacao.projetoNome || 'Não informado' }}</dd>
                    </div>
                    <div>
                      <dt>Laboratório</dt>
                      <dd>{{ participacao.laboratorioNome || 'Não informado' }}</dd>
                    </div>
                    <div>
                      <dt>Culturas</dt>
                      <dd>{{ nomesCulturas(participacao) }}</dd>
                    </div>
                  </dl>

                  <div v-if="participacao.ativa" class="participation-actions">
                    <button type="button" @click="abrirEditarParticipacao(participacao)">
                      Editar participação
                    </button>
                    <button type="button" @click="abrirGerenciarCulturas(participacao)">
                      Gerenciar culturas
                    </button>
                    <button
                      class="participation-action--danger"
                      type="button"
                      @click="abrirEncerrarParticipacao(participacao)"
                    >
                      Encerrar atividade
                    </button>
                  </div>

                  <div class="participation-period">
                    {{ formatarData(participacao.dataInicioParticipacao) }}
                    <span>até</span>
                    {{ fimReferenciaParticipacao(participacao) ? formatarData(fimReferenciaParticipacao(participacao)) : 'atual' }}
                    <small v-if="usaPrazoDoProjeto(participacao)">prazo do Projeto</small>
                  </div>
                </article>
              </div>
            </section>

            <section class="drawer-section observations-section">
              <div class="section-heading section-heading--with-action">
                <div class="section-heading-main">
                  <span class="section-icon">06</span>
                  <h3>Observações</h3>
                </div>

                <button class="section-inline-action" type="button" @click="abrirModalObservacao">
                  + Adicionar observação
                </button>
              </div>

              <div v-if="carregandoObservacoes" class="drawer-empty">
                Carregando observações...
              </div>

              <div v-else class="observations-list">
                <article v-if="vinculoSelecionado.observacao" class="observation-entry">
                  <div class="observation-entry-header">
                    <span class="observation-kind">Vínculo</span>
                    <small>Observação atual do vínculo</small>
                  </div>
                  <p>{{ vinculoSelecionado.observacao }}</p>
                </article>

                <article
                  v-for="participacao in vinculoSelecionado.participacoesAtividade.filter((item) => Boolean(item.observacao))"
                  :key="`participacao-${participacao.id}`"
                  class="observation-entry"
                >
                  <div class="observation-entry-header">
                    <span class="observation-kind">Participação</span>
                    <small>{{ participacao.atividadeNome || 'Atividade' }}</small>
                  </div>
                  <p>{{ participacao.observacao }}</p>
                </article>

                <article
                  v-for="observacao in observacoesVinculo"
                  :key="observacao.id"
                  class="observation-entry"
                  :class="{ 'observation-entry--training': observacao.tipo === 'TREINAMENTO_SEGURANCA' }"
                >
                  <div class="observation-entry-header">
                    <span class="observation-kind">
                      {{ observacao.tipo === 'TREINAMENTO_SEGURANCA' ? 'Treinamento' : 'Operacional' }}
                    </span>
                    <small>{{ formatarDataHora(observacao.dataHora) }} · {{ observacao.usuarioNome }}</small>
                  </div>
                  <strong>{{ rotuloEventoObservacao(observacao) }}</strong>
                  <p v-if="observacao.texto">{{ observacao.texto }}</p>
                </article>

                <div
                  v-if="
                    !vinculoSelecionado.observacao
                    && !vinculoSelecionado.participacoesAtividade.some((item) => Boolean(item.observacao))
                    && observacoesVinculo.length === 0
                  "
                  class="drawer-empty"
                >
                  Nenhuma observação registrada para este vínculo.
                </div>
              </div>
            </section>
          </template>

          <div v-else class="drawer-empty">
            Nenhum vínculo institucional foi encontrado para este Estagiário.
          </div>
        </div>
      </aside>
    </div>

    <div v-if="modalVinculoAberto" class="action-modal-backdrop" @click.self="fecharModalVinculo">
      <section class="action-modal-card action-modal-card--large" role="dialog" aria-modal="true" aria-label="Editar vínculo">
        <header>
          <div>
            <span>DADOS DO SGL</span>
            <h2>Editar vínculo</h2>
            <p>O ambiente institucional prevalece quando sincronizar um campo também mantido pelo SGL.</p>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharModalVinculo">×</button>
        </header>

        <div class="action-modal-content">
          <div v-if="acaoErro" class="feedback feedback--error">{{ acaoErro }}</div>

          <div class="edit-link-grid">
            <label class="action-field">
              <span>Formação</span>
              <select v-model="edicaoFormacao">
                <option v-for="opcao in opcoesFormacao" :key="opcao.valor" :value="opcao.valor">
                  {{ opcao.rotulo }}
                </option>
              </select>
            </label>

            <label v-if="edicaoFormacao === 'OUTRO'" class="action-field">
              <span>Descrição da formação</span>
              <input v-model="edicaoFormacaoOutro" type="text" />
            </label>

            <label class="action-field">
              <span>Curso</span>
              <select v-model="edicaoCursoId">
                <option value="">Sem curso</option>
                <option v-for="curso in cursosDisponiveis" :key="curso.id" :value="curso.id">
                  {{ curso.nome }}
                </option>
                <option :value="NOVO_CURSO_VALUE">Outro / adicionar novo curso</option>
              </select>
            </label>

            <label v-if="edicaoCursoId === NOVO_CURSO_VALUE" class="action-field">
              <span>Novo curso</span>
              <input
                v-model="edicaoNovoCursoNome"
                type="text"
                maxlength="120"
                placeholder="Ex.: Engenharia Ambiental"
              />
              <small>O Curso será criado no catálogo da Unidade e já ficará selecionado no vínculo.</small>
            </label>

            <div class="action-field action-field--readonly">
              <span>Bolsa / modalidade</span>
              <strong>{{ rotuloBolsa(edicaoTipoBolsa) }}</strong>
              <small>Somente leitura. Para trocar a bolsa, use “Editar bolsa” nas Ações operacionais.</small>
            </div>

            <label class="action-field">
              <span>Orientador / responsável</span>
              <select v-model="edicaoOrientadorId">
                <option value="">Selecione</option>
                <option v-for="usuario in orientadoresDisponiveis" :key="usuario.id" :value="usuario.id">
                  {{ usuario.nome }}
                </option>
              </select>
            </label>

            <label class="action-field">
              <span>Data de início</span>
              <input v-model="edicaoDataInicio" type="date" />
            </label>

            <label class="action-field">
              <span>Data final prevista</span>
              <input v-model="edicaoDataFimPrevista" type="date" required />
              <small>Obrigatória. Todo estágio deve possuir término previsto.</small>
            </label>
          </div>

          <label class="action-field">
            <span>Observação</span>
            <textarea v-model="edicaoObservacao" rows="3" placeholder="Opcional" />
          </label>
        </div>

        <footer>
          <button class="drawer-action" type="button" @click="fecharModalVinculo">
            Cancelar
          </button>
          <button
            class="drawer-action drawer-action--primary"
            type="button"
            :disabled="processandoAcao"
            @click="salvarVinculo"
          >
            {{ processandoAcao ? 'Salvando...' : 'Salvar alterações' }}
          </button>
        </footer>
      </section>
    </div>

    <div v-if="modalBolsaAberto" class="action-modal-backdrop" @click.self="fecharModalBolsa">
      <section class="action-modal-card" role="dialog" aria-modal="true" aria-label="Editar bolsa">
        <header>
          <div>
            <span>ALTERNATIVA LOCAL</span>
            <h2>Editar bolsa</h2>
            <p>
              Escolha entre prorrogar a bolsa atual ou registrar uma nova ocorrência.
              O ambiente institucional continua sendo a fonte prioritária quando fornecer esse evento.
            </p>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharModalBolsa">×</button>
        </header>

        <div class="action-modal-content">
          <div v-if="acaoErro" class="feedback feedback--error">{{ acaoErro }}</div>

          <div class="scholarship-current">
            <span>Bolsa atual</span>
            <strong>{{ rotuloBolsa(vinculoSelecionado?.tipoBolsa) }}</strong>
            <small>
              {{ formatarData(vinculoSelecionado?.dataInicio) }}
              <span class="scholarship-modal-separator">até</span>
              {{ formatarData(fimBasePeriodo(vinculoSelecionado)) }}
            </small>
          </div>

          <div class="scholarship-mode-selector" role="group" aria-label="Tipo de alteração da bolsa">
            <button
              type="button"
              :class="{ 'scholarship-mode-option--active': tipoOperacaoBolsa === 'PRORROGAR' }"
              @click="tipoOperacaoBolsa = 'PRORROGAR'; acaoErro = ''"
            >
              <strong>Prorrogar bolsa atual</strong>
              <small>Mantém o mesmo vínculo e amplia somente a data final prevista.</small>
            </button>

            <button
              type="button"
              :class="{ 'scholarship-mode-option--active': tipoOperacaoBolsa === 'NOVA' }"
              @click="tipoOperacaoBolsa = 'NOVA'; acaoErro = ''"
            >
              <strong>Registrar nova bolsa</strong>
              <small>Encerra a ocorrência atual e cria uma nova, preservando o histórico.</small>
            </button>
          </div>

          <template v-if="tipoOperacaoBolsa === 'PRORROGAR'">
            <div class="scholarship-extension-summary">
              <span>Término atual</span>
              <strong>{{ formatarData(vinculoSelecionado?.dataFimPrevista) }}</strong>
            </div>

            <label class="action-field">
              <span>Nova data final prevista</span>
              <input
                v-model="prorrogacaoFimPrevista"
                type="date"
                :min="vinculoSelecionado?.dataFimPrevista || undefined"
              />
              <small>A nova data deve ser posterior ao término atual.</small>
            </label>
          </template>

          <template v-else>
            <label class="action-field">
              <span>Nova bolsa / modalidade</span>
              <select v-model="novaBolsaTipo">
                <option v-for="opcao in opcoesBolsa" :key="opcao.valor" :value="opcao.valor">
                  {{ opcao.rotulo }}
                </option>
              </select>
            </label>

            <div class="edit-link-grid scholarship-date-grid">
              <label class="action-field">
                <span>Data inicial da nova bolsa</span>
                <input v-model="novaBolsaInicio" type="date" :max="hojeIso()" />
                <small>A bolsa atual será encerrada no dia anterior.</small>
              </label>

              <label class="action-field">
                <span>Data final prevista</span>
                <input v-model="novaBolsaFimPrevista" type="date" />
                <small class="field-helper-placeholder" aria-hidden="true">Alinhamento</small>
              </label>
            </div>

            <p class="culture-guidance">
              Formação, Curso, Orientador, treinamento e participações são preservados conforme o período da nova ocorrência.
            </p>
          </template>
        </div>

        <footer>
          <button class="drawer-action" type="button" @click="fecharModalBolsa">
            Cancelar
          </button>
          <button
            class="drawer-action drawer-action--primary"
            type="button"
            :disabled="processandoAcao"
            @click="salvarBolsa"
          >
            {{ processandoAcao
              ? 'Salvando...'
              : tipoOperacaoBolsa === 'PRORROGAR'
                ? 'Confirmar prorrogação'
                : 'Confirmar nova bolsa' }}
          </button>
        </footer>
      </section>
    </div>

    <div v-if="modalAtividadeAberto" class="action-modal-backdrop" @click.self="fecharModalAtividade">
      <section class="action-modal-card" role="dialog" aria-modal="true" aria-label="Associar atividade">
        <header>
          <div>
            <span>AÇÃO OPERACIONAL</span>
            <h2>Associar atividade</h2>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharModalAtividade">×</button>
        </header>

        <div class="action-modal-content">
          <div v-if="acaoErro" class="feedback feedback--error">{{ acaoErro }}</div>

          <label class="action-field">
            <span>Atividade</span>
            <select v-model="atividadeSelecionadaId">
              <option value="">Selecione</option>
              <option
                v-for="atividade in atividadesDisponiveis"
                :key="atividade.id"
                :value="atividade.id"
              >
                {{ atividade.nome }} · Projeto: {{ atividade.projetoNome || 'não informado' }}
              </option>
            </select>
          </label>

          <label class="action-field">
            <span>Início da participação</span>
            <input v-model="atividadeInicio" type="date" />
          </label>

          <label class="action-field">
            <span>Observação</span>
            <textarea
              v-model="atividadeObservacao"
              rows="3"
              placeholder="Opcional"
            />
          </label>
        </div>

        <footer>
          <button class="drawer-action" type="button" @click="fecharModalAtividade">
            Cancelar
          </button>
          <button
            class="drawer-action drawer-action--primary"
            type="button"
            :disabled="processandoAcao"
            @click="associarAtividade"
          >
            {{ processandoAcao ? 'Associando...' : 'Associar atividade' }}
          </button>
        </footer>
      </section>
    </div>

    <div
      v-if="modalEditarParticipacaoAberto"
      class="action-modal-backdrop"
      @click.self="fecharModalEditarParticipacao"
    >
      <section class="action-modal-card" role="dialog" aria-modal="true" aria-label="Editar participação">
        <header>
          <div>
            <span>CORREÇÃO OPERACIONAL</span>
            <h2>Editar participação</h2>
            <p>Use esta opção para corrigir uma Atividade vinculada por engano ou ajustar os dados da participação.</p>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharModalEditarParticipacao">×</button>
        </header>

        <div class="action-modal-content">
          <div v-if="acaoErro" class="feedback feedback--error">{{ acaoErro }}</div>

          <label class="action-field">
            <span>Atividade</span>
            <select v-model="participacaoEdicaoAtividadeId">
              <option value="">Selecione</option>
              <option
                v-for="atividade in atividadesDisponiveis"
                :key="atividade.id"
                :value="atividade.id"
              >
                {{ atividade.nome }} · Projeto: {{ atividade.projetoNome || 'não informado' }}
              </option>
            </select>
          </label>

          <label class="action-field">
            <span>Início da participação</span>
            <input v-model="participacaoEdicaoInicio" type="date" />
          </label>

          <label class="action-field">
            <span>Observação</span>
            <textarea
              v-model="participacaoEdicaoObservacao"
              rows="3"
              placeholder="Opcional"
            />
          </label>

          <p class="culture-guidance">
            As Culturas já associadas serão preservadas. Se precisar alterá-las, use “Gerenciar culturas”.
          </p>
        </div>

        <footer>
          <button class="drawer-action" type="button" @click="fecharModalEditarParticipacao">
            Cancelar
          </button>
          <button
            class="drawer-action drawer-action--primary"
            type="button"
            :disabled="processandoAcao"
            @click="salvarEdicaoParticipacao"
          >
            {{ processandoAcao ? 'Salvando...' : 'Salvar participação' }}
          </button>
        </footer>
      </section>
    </div>

    <div
      v-if="modalEncerrarParticipacaoAberto"
      class="action-modal-backdrop"
      @click.self="fecharModalEncerrarParticipacao"
    >
      <section class="action-modal-card" role="dialog" aria-modal="true" aria-label="Encerrar atividade">
        <header>
          <div>
            <span>CONFIRMAÇÃO</span>
            <h2>Encerrar atividade</h2>
            <p>
              O vínculo do Estagiário continua ativo; apenas a participação nesta Atividade será encerrada.
            </p>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharModalEncerrarParticipacao">×</button>
        </header>

        <div class="action-modal-content">
          <div v-if="acaoErro" class="feedback feedback--error">{{ acaoErro }}</div>

          <label class="action-field">
            <span>Atividade</span>
            <select v-model="participacaoEncerramentoId">
              <option value="">Selecione</option>
              <option
                v-for="participacao in participacoesAtivas(vinculoSelecionado)"
                :key="participacao.id"
                :value="participacao.id"
              >
                {{ participacao.atividadeNome || 'Atividade sem nome' }} · Projeto:
                {{ participacao.projetoNome || 'não informado' }}
              </option>
            </select>
          </label>

          <div v-if="participacaoSelecionadaParaEncerrar()" class="participation-ending-summary">
            <strong>{{ participacaoSelecionadaParaEncerrar()?.atividadeNome || 'Atividade selecionada' }}</strong>
            <small>
              Projeto: {{ participacaoSelecionadaParaEncerrar()?.projetoNome || 'não informado' }}
            </small>
          </div>

          <label class="action-field">
            <span>Data final da participação</span>
            <input v-model="participacaoDataFim" type="date" />
            <small>
              A regra da Etapa 6 continua válida: a última participação ativa não pode ser encerrada
              enquanto o vínculo de estágio estiver em andamento.
            </small>
          </label>
        </div>

        <footer>
          <button class="drawer-action" type="button" @click="fecharModalEncerrarParticipacao">
            Cancelar
          </button>
          <button
            class="drawer-action drawer-action--danger"
            type="button"
            :disabled="processandoAcao"
            @click="encerrarParticipacao"
          >
            {{ processandoAcao ? 'Encerrando...' : 'Confirmar encerramento' }}
          </button>
        </footer>
      </section>
    </div>

    <div v-if="modalCulturasAberto" class="action-modal-backdrop" @click.self="fecharModalCulturas">
      <section class="action-modal-card" role="dialog" aria-modal="true" aria-label="Gerenciar culturas">
        <header>
          <div>
            <span>AÇÃO OPERACIONAL</span>
            <h2>Gerenciar culturas</h2>
            <p>{{ participacaoCulturas?.atividadeNome || 'Participação selecionada' }}</p>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharModalCulturas">×</button>
        </header>

        <div class="action-modal-content">
          <div v-if="acaoErro" class="feedback feedback--error">{{ acaoErro }}</div>

          <p class="culture-guidance">
            Selecione as Culturas relacionadas a esta participação.
          </p>

          <div v-if="culturasDisponiveis.length === 0" class="drawer-empty">
            Nenhuma Cultura ativa disponível.
          </div>

          <template v-else>
            <label
              v-for="cultura in culturasDisponiveis"
              :key="cultura.id"
              class="culture-option"
            >
              <input v-model="culturasSelecionadas" type="checkbox" :value="cultura.id" />
              <span>{{ cultura.nome }}</span>
            </label>
          </template>

          <div class="culture-create">
            <div>
              <strong>Adicionar nova Cultura</strong>
              <small>Se ela ainda não existir na Unidade, crie e associe sem sair desta tela.</small>
            </div>

            <div class="culture-create-row">
              <input
                v-model="novaCulturaNome"
                type="text"
                maxlength="120"
                placeholder="Nome da nova Cultura"
                @keyup.enter="criarCulturaNoModal"
              />
              <button
                class="drawer-action"
                type="button"
                :disabled="processandoAcao || !novaCulturaNome.trim()"
                @click="criarCulturaNoModal"
              >
                + Adicionar
              </button>
            </div>
          </div>
        </div>

        <footer>
          <button class="drawer-action" type="button" @click="fecharModalCulturas">
            Cancelar
          </button>
          <button
            class="drawer-action drawer-action--primary"
            type="button"
            :disabled="processandoAcao"
            @click="salvarCulturas"
          >
            {{ processandoAcao ? 'Salvando...' : 'Salvar culturas' }}
          </button>
        </footer>
      </section>
    </div>

    <div v-if="modalTreinamentoAberto" class="action-modal-backdrop" @click.self="fecharModalTreinamento">
      <section class="action-modal-card" role="dialog" aria-modal="true" aria-label="Treinamento de segurança">
        <header>
          <div>
            <span>CONFIRMAÇÃO</span>
            <h2>
              {{ treinamentoNovoEstado ? 'Registrar treinamento' : 'Reverter treinamento' }}
            </h2>
            <p>
              {{ treinamentoNovoEstado
                ? 'Confirme a conclusão do treinamento de segurança.'
                : 'A conclusão deixará de valer para este vínculo, mas o evento continuará no histórico.' }}
            </p>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharModalTreinamento">×</button>
        </header>

        <div class="action-modal-content">
          <div v-if="acaoErro" class="feedback feedback--error">{{ acaoErro }}</div>

          <div
            class="training-confirm-state"
            :class="{ 'training-confirm-state--revert': !treinamentoNovoEstado }"
          >
            <span>{{ treinamentoNovoEstado ? '✓' : '↶' }}</span>
            <div>
              <strong>
                {{ treinamentoNovoEstado ? 'Treinamento concluído' : 'Treinamento volta para pendente' }}
              </strong>
              <small>A alteração será registrada no histórico do vínculo.</small>
            </div>
          </div>

          <label class="action-field">
            <span>Observação sobre o treinamento de segurança</span>
            <textarea
              v-model="treinamentoObservacao"
              rows="4"
              maxlength="1000"
              placeholder="Opcional. Ex.: treinamento presencial realizado no laboratório."
            />
          </label>
        </div>

        <footer>
          <button class="drawer-action" type="button" @click="fecharModalTreinamento">
            Cancelar
          </button>
          <button
            class="drawer-action"
            :class="treinamentoNovoEstado ? 'drawer-action--success' : 'drawer-action--warning'"
            type="button"
            :disabled="processandoAcao"
            @click="salvarTreinamento"
          >
            {{ processandoAcao
              ? 'Salvando...'
              : treinamentoNovoEstado
                ? 'Confirmar conclusão'
                : 'Confirmar reversão' }}
          </button>
        </footer>
      </section>
    </div>

    <div v-if="modalObservacaoAberto" class="action-modal-backdrop" @click.self="fecharModalObservacao">
      <section class="action-modal-card" role="dialog" aria-modal="true" aria-label="Adicionar observação">
        <header>
          <div>
            <span>REGISTRO OPERACIONAL</span>
            <h2>Adicionar observação</h2>
            <p>A observação ficará vinculada a este vínculo e identificará o usuário que a registrou.</p>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharModalObservacao">×</button>
        </header>

        <div class="action-modal-content">
          <div v-if="acaoErro" class="feedback feedback--error">{{ acaoErro }}</div>

          <label class="action-field">
            <span>Observação</span>
            <textarea
              v-model="observacaoTexto"
              rows="5"
              maxlength="1000"
              placeholder="Digite a observação operacional..."
            />
            <small>{{ observacaoTexto.length }}/1000</small>
          </label>
        </div>

        <footer>
          <button class="drawer-action" type="button" @click="fecharModalObservacao">
            Cancelar
          </button>
          <button
            class="drawer-action drawer-action--primary"
            type="button"
            :disabled="processandoAcao || !observacaoTexto.trim()"
            @click="salvarObservacao"
          >
            {{ processandoAcao ? 'Salvando...' : 'Registrar observação' }}
          </button>
        </footer>
      </section>
    </div>
  </section>
</template>

<style scoped>
.intern-page {
  max-width: 1560px;
  margin: 0 auto;
  color: #17243a;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.heading-actions {
  display: flex;
  gap: 9px;
}

.breadcrumb {
  margin: 0 0 8px;
  color: #2456c4;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .08em;
}

.page-heading h1 {
  margin: 0;
  color: #0a1c3b;
  font-size: 31px;
}

.page-heading p:not(.breadcrumb) {
  margin: 8px 0 0;
  color: #66758a;
  font-size: 14px;
}

.primary-action,
.detail-action {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 7px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.primary-action {
  border: 1px solid #2456c4;
  background: #2456c4;
  color: #fff;
}

.detail-action {
  border: 1px solid #cbd7e6;
  background: #fff;
  color: #2456c4;
  white-space: nowrap;
}

.primary-action:disabled {
  opacity: .55;
  cursor: default;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.metric-card {
  position: relative;
  overflow: hidden;
  min-height: 112px;
  padding: 18px 20px;
  border: 1px solid #dce4ef;
  border-radius: 10px;
  background: #fff;
}

.metric-card::before {
  position: absolute;
  top: 18px;
  left: 18px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #6d7c90;
  content: '';
}

.metric-card--success,
.metric-card--warning,
.metric-card--info {
  border-color: #dce4ef;
  background: #fff;
}

.metric-card--success::before {
  background: #1aa35b;
}

.metric-card--warning::before {
  background: #e3a008;
}

.metric-card--info::before {
  background: #2474d9;
}

.metric-card span {
  display: block;
  padding-left: 19px;
  color: #55657a;
  font-size: 12px;
  font-weight: 850;
}

.metric-card strong {
  display: block;
  margin-top: 10px;
  color: #132944;
  font-size: 28px;
}

.metric-card small {
  display: block;
  margin-top: 6px;
  color: #8390a2;
  font-size: 12.5px;
}

.metric-card {
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-card--success:hover {
  border-color: #7bc89b;
  background: #eefaf2;
}

.metric-card--warning:hover {
  border-color: #e1bd58;
  background: #fff5d7;
}

.metric-card--info:hover {
  border-color: #78a9e9;
  background: #edf5ff;
}

.metric-card:not(.metric-card--success):not(.metric-card--warning):not(.metric-card--info):hover {
  border-color: #a9b5c4;
  background: #f5f7fa;
}

.feedback {
  margin-bottom: 16px;
  padding: 13px 15px;
  border-radius: 8px;
  font-size: 13px;
}

.feedback--error {
  background: #fff4f4;
  color: #9f2e2e;
}

.workspace-card {
  overflow: hidden;
  border: 1px solid #dbe3ee;
  border-radius: 11px;
  background: #fff;
}

.filters-grid {
  display: grid;
  grid-template-columns: minmax(300px, 1.5fr) repeat(3, minmax(170px, .8fr));
  gap: 12px;
  padding: 18px;
  background: #fbfcfe;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field > span {
  color: #66758a;
  font-size: 10.5px;
  font-weight: 850;
  text-transform: uppercase;
}

.field input,
.field select {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #d4dde9;
  border-radius: 7px;
  background: #fff;
  color: #23354e;
  font: inherit;
  font-size: 13px;
}

.filter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-top: 1px solid #edf1f5;
  border-bottom: 1px solid #edf1f5;
  color: #6c7a8d;
  font-size: 12.5px;
}

.filter-summary > div {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.filter-summary strong {
  color: #17243a;
}

.filter-summary button {
  border: 0;
  background: transparent;
  color: #2456c4;
  font: inherit;
  font-weight: 750;
  cursor: pointer;
}

.state-box {
  padding: 34px;
  text-align: center;
  color: #708096;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1160px;
  border-collapse: collapse;
}

th {
  padding: 12px 15px;
  background: #f8fafd;
  color: #738197;
  font-size: 10.5px;
  text-align: left;
  text-transform: uppercase;
}

td {
  padding: 17px 16px;
  border-top: 1px solid #edf1f5;
  color: #37475e;
  font-size: 12.5px;
  line-height: 1.5;
  vertical-align: middle;
}

tbody tr {
  height: 78px;
  cursor: pointer;
}

tbody tr:hover {
  background: #f8fbff;
}

td strong,
td small {
  display: block;
}

td small {
  margin-top: 4px;
  color: #8793a4;
}

.student-cell strong {
  color: #17243a;
  font-size: 13px;
}

.student-responsible {
  color: #64748a;
}

.formation-cell strong {
  color: #17243a;
  font-size: 13px;
}

.formation-cell small {
  color: #64748a;
}

.status-cell {
  min-width: 150px;
}

.status-reason {
  margin-top: 7px;
  color: #7d8a9c;
  font-size: 10.5px;
}

.link-cell strong {
  margin-bottom: 7px;
  color: #17243a;
}

.link-state {
  display: inline-flex;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  background: #dcecff;
  color: #2365bd;
  font-size: 10px;
  font-weight: 800;
}

.link-state--closed {
  background: #edf0f4;
  color: #667386;
}

.context-preview {
  display: grid;
  gap: 6px;
}

.context-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #34465e;
  font-size: 12.5px;
  font-weight: 650;
}

.context-icon {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  fill: none;
  stroke: #61738a;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.context-empty-text {
  color: #7a8798;
  font-size: 12px;
  font-weight: 650;
}

.history-preview {
  color: #7a8798;
  font-size: 12px;
  font-weight: 650;
  transition: color 150ms ease;
}

tbody tr:hover .history-preview {
  color: #556477;
}

.period-cell strong {
  color: #26384f;
}

.period-cell small {
  margin: 2px 0;
}

.actions-column {
  text-align: right;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  min-height: 25px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.status-pill--active {
  background: #e9f7ef;
  color: #207847;
}

.status-pill--pending {
  background: #fff5dc;
  color: #aa7200;
}

.status-pill--extended {
  background: #e4efff;
  color: #2a66b7;
}

.status-pill--closed {
  background: #eef1f5;
  color: #657287;
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  justify-content: flex-end;
  background: rgb(13 25 45 / 42%);
}

.detail-drawer {
  width: min(860px, 96vw);
  height: 100vh;
  overflow-y: auto;
  background: #fff;
  box-shadow: -18px 0 48px rgb(25 43 70 / 15%);
}

.drawer-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 24px 30px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
}

.drawer-kicker {
  margin: 0 0 11px;
  color: #6e7d91;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .06em;
}

.drawer-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.drawer-title-row h2 {
  margin: 0;
  color: #13233b;
  font-size: 23px;
}

.drawer-header p:not(.drawer-kicker) {
  margin: 6px 0 0;
  color: #758397;
  font-size: 12.5px;
}

.drawer-header > button {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: #f1f4f8;
  color: #34445a;
  font-size: 24px;
  cursor: pointer;
}

.detail-content {
  display: grid;
  gap: 0;
  padding: 28px 30px 42px;
}

.drawer-section {
  padding: 21px 0;
  border-bottom: 1px solid #e8edf3;
}

.compact-section {
  padding-block: 17px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 13px;
}

.section-heading h3 {
  margin: 0;
  color: #17243a;
  font-size: 11.5px;
  text-transform: uppercase;
}

.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: #eef4fb;
  color: #45617f;
  font-size: 8px;
  font-weight: 900;
}

.institutional-card {
  padding: 16px;
  border: 1px solid #dce5ef;
  border-radius: 9px;
  background: #fbfcfe;
}

.institutional-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.institutional-title > strong {
  color: #17243a;
  font-size: 13px;
}

.institutional-period {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  color: #43566f;
  font-size: 12.5px;
}

.institutional-card p {
  margin: 10px 0 0;
  color: #728095;
  font-size: 12.5px;
}

.institutional-card p strong {
  color: #42546c;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.detail-grid article {
  padding: 13px 14px;
  border: 1px solid #dfe6ef;
  border-radius: 8px;
  background: #fafcff;
}

.detail-grid span {
  display: block;
  color: #7b889a;
  font-size: 9.5px;
  font-weight: 850;
  text-transform: uppercase;
}

.detail-grid strong {
  display: block;
  margin-top: 5px;
  color: #2a3b52;
  font-size: 12.5px;
}

.single-value {
  margin: 0;
  color: #2a3b52;
  font-size: 12.5px;
  font-weight: 700;
}

.training-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 14px;
  border: 1px solid #cfe6d8;
  border-radius: 8px;
  background: #f2fbf5;
}

.training-card--pending {
  border-color: #eddcb1;
  background: #fffaf0;
}

.training-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #1d9b56;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
}

.training-card--pending .training-check {
  background: #d89a08;
}

.training-card strong,
.training-card small {
  display: block;
}

.training-card strong {
  color: #23683f;
  font-size: 12.5px;
}

.training-card--pending strong {
  color: #8c6508;
}

.training-card small {
  margin-top: 4px;
  color: #6f7e8f;
  font-size: 10px;
}

.drawer-empty {
  padding: 18px;
  border: 1px dashed #ced8e5;
  border-radius: 8px;
  background: #fafcff;
  color: #748399;
  font-size: 11px;
  text-align: center;
}

.participations-list {
  display: grid;
  gap: 10px;
}

.participation-card {
  padding: 14px;
  border: 1px solid #dfe6ef;
  border-radius: 9px;
  background: #fff;
}

.participation-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.participation-header > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.participation-header strong {
  color: #25364d;
  font-size: 12.5px;
}

.participation-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #1ca35b;
}

.participation-dot--closed {
  background: #aab4c1;
}

.participation-state {
  display: inline-flex;
  padding: 5px 8px;
  border-radius: 999px;
  background: #e9f7ef;
  color: #207847;
  font-size: 8px;
  font-weight: 800;
}

.participation-state--closed {
  background: #eef1f5;
  color: #697789;
}

.participation-card dl {
  display: grid;
  gap: 6px;
  margin: 12px 0 0 17px;
}

.participation-card dl > div {
  display: grid;
  grid-template-columns: 76px 1fr;
  gap: 8px;
}

.participation-card dt {
  color: #8290a2;
  font-size: 9.5px;
}

.participation-card dd {
  margin: 0;
  color: #43546b;
  font-size: 10.5px;
}

.participation-period {
  display: flex;
  gap: 6px;
  margin: 11px 0 0 17px;
  color: #7b889b;
  font-size: 10px;
}

.timeline {
  display: grid;
  gap: 0;
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  gap: 9px;
  min-height: 52px;
}

.timeline-item::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 4px;
  width: 1px;
  background: #d8e1ec;
  content: '';
}

.timeline-item:first-child::before {
  top: 50%;
}

.timeline-item:last-child::before {
  bottom: 50%;
}

.timeline-dot {
  z-index: 1;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #2b75d6;
}

.timeline-dot--closed {
  background: #98a5b6;
}

.timeline-item strong,
.timeline-item small {
  display: block;
}

.timeline-item strong {
  color: #2c3e55;
  font-size: 12.5px;
}

.timeline-item small {
  margin-top: 4px;
  color: #8390a2;
  font-size: 10px;
}

.observation {
  margin: 0;
  padding: 13px 14px;
  border-radius: 8px;
  background: #f7f9fc;
  color: #526278;
  font-size: 12.5px;
  line-height: 1.5;
}


.period-cell {
  min-width: 230px;
}

.period-range {
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.period-separator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #8a98aa;
  font-size: 10.5px;
  font-weight: 400 !important;
}

.extension-note {
  margin-top: 7px !important;
  color: #4f79b7 !important;
  font-size: 10.5px !important;
  font-weight: 700;
}

.extension-separator {
  font-weight: 400 !important;
}

.drawer-extension-note {
  color: #4f79b7 !important;
}

.drawer-feedback {
  margin: 0 0 18px;
}

.feedback--success {
  background: #eef9f2;
  color: #26734a;
}

.operational-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.drawer-action {
  min-height: 41px;
  padding: 0 15px;
  border: 1px solid #cbd7e6;
  border-radius: 7px;
  background: #fff;
  color: #315174;
  font: inherit;
  font-size: 10.5px;
  font-weight: 800;
  cursor: pointer;
}

.drawer-action--primary {
  border-color: #2456c4;
  background: #2456c4;
  color: #fff;
}

.drawer-action:disabled {
  opacity: .55;
  cursor: default;
}

.participation-actions {
  margin: 12px 0 0 17px;
}

.participation-actions button {
  min-height: 35px;
  padding: 0 11px;
  border: 1px solid #cbd7e6;
  border-radius: 6px;
  background: #fff;
  color: #315174;
  font: inherit;
  font-size: 9.5px;
  font-weight: 800;
  cursor: pointer;
}

.action-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(13 25 45 / 48%);
}

.action-modal-card {
  width: min(100%, 620px);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  border: 1px solid #dbe3ee;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 18px 50px rgb(15 23 42 / 18%);
}

.action-modal-card > header,
.action-modal-card > footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 30px;
}

.action-modal-card > header {
  border-bottom: 1px solid #e2e8f0;
}

.action-modal-card > footer {
  justify-content: flex-end;
  border-top: 1px solid #e2e8f0;
}

.action-modal-card > header span {
  color: #748399;
  font-size: 9.5px;
  font-weight: 850;
  letter-spacing: .05em;
}

.action-modal-card h2 {
  margin: 9px 0 0;
  color: #17243a;
  font-size: 23px;
  line-height: 1.2;
}

.action-modal-card header p {
  margin: 5px 0 0;
  color: #728095;
  font-size: 11px;
}

.action-modal-card header > button {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: #f1f4f8;
  color: #34445a;
  font-size: 24px;
  cursor: pointer;
}

.action-modal-content {
  display: grid;
  gap: 18px;
  padding: 26px 30px;
}

.action-field {
  display: grid;
  gap: 8px;
}

.action-field > span {
  color: #66758a;
  font-size: 10.5px;
  font-weight: 750;
}

.action-field input,
.action-field select,
.action-field textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  background: #fff;
  color: #25364d;
  font: inherit;
  font-size: 12.5px;
}

.action-field input,
.action-field select {
  min-height: 45px;
  padding: 0 12px;
}

.action-field textarea {
  padding: 12px;
  resize: vertical;
}

.culture-guidance {
  margin: 0;
  color: #66758a;
  font-size: 10.5px;
}

.culture-option {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid #e0e7ef;
  border-radius: 7px;
  color: #35475f;
  font-size: 12.5px;
}

.culture-option input {
  width: 16px;
  height: 16px;
}


.action-modal-card--large {
  width: min(100%, 920px);
}

.edit-link-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 15px;
}

.edit-link-grid > .action-field {
  align-content: start;
}

.action-field small {
  color: #7a8798;
  font-size: 10px;
  line-height: 1.5;
}

.action-field--readonly {
  align-content: center;
  min-height: 74px;
  padding: 10px 12px;
  border: 1px solid #dce4ee;
  border-radius: 7px;
  background: #f8fafc;
}

.action-field--readonly strong {
  color: #2d4058;
  font-size: 12.5px;
}

.scholarship-current {
  display: grid;
  gap: 5px;
  padding: 14px;
  border: 1px solid #dce5ef;
  border-radius: 8px;
  background: #f8fafc;
}

.scholarship-current > span {
  color: #78889b;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.scholarship-current strong {
  color: #25364d;
  font-size: 14px;
}

.scholarship-current small {
  color: #6f7f92;
  font-size: 11px;
}

.scholarship-current small .scholarship-modal-separator {
  font-weight: 400 !important;
}


.scholarship-mode-selector {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.scholarship-mode-selector > button {
  display: grid;
  gap: 5px;
  min-height: 76px;
  padding: 12px 13px;
  border: 1px solid #d5deea;
  border-radius: 8px;
  background: #fff;
  color: #43546b;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.scholarship-mode-selector > button strong {
  color: #2d4058;
  font-size: 11.5px;
}

.scholarship-mode-selector > button small {
  color: #758397;
  font-size: 9.5px;
  line-height: 1.45;
}

.scholarship-mode-selector > .scholarship-mode-option--active {
  border-color: #4c72d9;
  background: #f4f7ff;
  box-shadow: inset 0 0 0 1px #4c72d9;
}

.scholarship-extension-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e0e7ef;
  border-radius: 8px;
  background: #fafcff;
}

.scholarship-extension-summary span {
  color: #758397;
  font-size: 10px;
  font-weight: 750;
}

.scholarship-extension-summary strong {
  color: #2d4058;
  font-size: 12.5px;
}

.scholarship-date-grid .action-field {
  align-content: start;
}

.field-helper-placeholder {
  visibility: hidden;
}

.participation-period small {
  margin-left: 3px;
  color: #5c78a1;
  font-size: 9.5px;
  font-weight: 700;
}

@media (hover: hover) and (pointer: fine) {
  .primary-action:hover:not(:disabled) {
    background: #1d4fae;
  }

  .detail-action:hover {
    border-color: #8cb0dc;
    background: #f4f8ff;
  }
}

@media (max-width: 1150px) {
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }

  .field--search {
    grid-column: 1 / -1;
  }
}

@media (max-width: 680px) {
  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .metrics-grid,
  .filters-grid,
  .detail-grid,
  .edit-link-grid {
    grid-template-columns: 1fr;
  }

  .scholarship-mode-selector {
    grid-template-columns: 1fr;
  }

  .field--search {
    grid-column: auto;
  }

  .detail-content {
    padding-inline: 18px;
  }

  .drawer-header {
    padding: 20px 18px;
  }

  .participation-header {
    flex-direction: column;
  }

  .timeline-item {
    grid-template-columns: 18px 1fr;
  }

  .timeline-item .link-state {
    grid-column: 2;
  }
}

/* Etapa 6.5 — consolidação final do drawer */
.section-heading {
  gap: 12px;
}

.section-heading-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-heading--with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.section-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 10px;
  font-size: 11px;
  box-shadow: inset 0 0 0 1px rgb(69 97 127 / 8%);
}

.section-heading h3 {
  font-size: 12.5px;
  letter-spacing: .015em;
}

.drawer-section--actions {
  padding-top: 2px;
}

.training-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.training-action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 900;
}

.training-action--complete {
  border-color: #8acaa7;
  background: #eef9f2;
  color: #247248;
}

.training-action--complete .training-action-icon {
  background: #38a866;
  color: #fff;
}

.training-action--pending {
  border-color: #d6be79;
  background: #fff9e8;
  color: #8a670c;
}

.training-action--pending .training-action-icon {
  background: #d7a817;
  color: #fff;
}

.card-subtitle {
  margin-bottom: 11px;
  color: #6e7d90;
  font-size: 10.5px;
  font-weight: 850;
  letter-spacing: .045em;
  text-transform: uppercase;
}

.card-subtitle--history {
  margin: 0 0 8px;
}

.link-history-divider {
  height: 1px;
  margin: 18px 0 16px;
  background: #e0e7ef;
}

.timeline--inside-card .timeline-item:last-child::before {
  bottom: 50%;
}

.participation-card {
  padding: 18px;
}

.participation-header strong {
  font-size: 14px;
  line-height: 1.35;
}

.participation-state {
  font-size: 10.5px;
}

.participation-card dl {
  margin-top: 15px;
  row-gap: 9px;
}

.participation-card dl > div {
  grid-template-columns: 92px minmax(0, 1fr);
  align-items: start;
}

.participation-card dt,
.participation-card dd {
  min-width: 0;
}

.participation-card dd {
  overflow-wrap: anywhere;
}

.participation-card dt {
  font-size: 10.5px;
  font-weight: 750;
}

.participation-card dd {
  font-size: 12.5px;
  line-height: 1.45;
}

.participation-actions {
  margin-top: 14px;
}

.participation-actions button {
  min-height: 38px;
  padding: 0 13px;
  font-size: 10.5px;
}

.participation-period {
  margin-top: 13px;
  font-size: 11.5px;
  font-weight: 650;
}

.participation-period span {
  font-weight: inherit;
}

.section-inline-action {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid #cbd7e6;
  border-radius: 7px;
  background: #fff;
  color: #315174;
  font: inherit;
  font-size: 10.5px;
  font-weight: 800;
  cursor: pointer;
}

.observations-list {
  display: grid;
  gap: 10px;
}

.observation-entry {
  padding: 14px 15px;
  border: 1px solid #dfe6ef;
  border-radius: 8px;
  background: #fbfcfe;
}

.observation-entry--training {
  border-color: #cfe4d7;
  background: #f4fbf6;
}

.observation-entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.observation-kind {
  display: inline-flex;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  background: #edf3fa;
  color: #49627f;
  font-size: 9.5px;
  font-weight: 850;
  text-transform: uppercase;
}

.observation-entry-header small {
  color: #8190a3;
  font-size: 10px;
}

.observation-entry > strong {
  color: #2d4058;
  font-size: 12px;
}

.observation-entry p {
  margin: 7px 0 0;
  color: #53647a;
  font-size: 12.5px;
  line-height: 1.55;
}

.training-confirm-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #b9dec7;
  border-radius: 8px;
  background: #f0faf4;
}

.training-confirm-state > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 50%;
  background: #39a867;
  color: #fff;
  font-size: 16px;
  font-weight: 900;
}

.training-confirm-state strong,
.training-confirm-state small {
  display: block;
}

.training-confirm-state strong {
  color: #276946;
  font-size: 12.5px;
}

.training-confirm-state small {
  margin-top: 3px;
  color: #688071;
  font-size: 10.5px;
}

.training-confirm-state--revert {
  border-color: #ead9a5;
  background: #fff9e9;
}

.training-confirm-state--revert > span {
  background: #c49312;
}

.training-confirm-state--revert strong {
  color: #765a0c;
}

.drawer-action--success {
  border-color: #2d8f58;
  background: #2d8f58;
  color: #fff;
}

.drawer-action--warning {
  border-color: #a77912;
  background: #a77912;
  color: #fff;
}

.drawer-action--danger {
  border-color: #a74343;
  background: #a74343;
  color: #fff;
}

.participation-action--danger {
  border-color: #d8abab !important;
  color: #9b3535 !important;
}

.participation-header > div {
  min-width: 0;
  flex: 1;
}

.participation-header strong {
  min-width: 0;
  overflow-wrap: anywhere;
}

.participation-ending-summary {
  display: grid;
  gap: 4px;
  padding: 13px 14px;
  border: 1px solid #e0e7ef;
  border-radius: 8px;
  background: #f8fafc;
}

.participation-ending-summary strong {
  color: #2c4058;
  font-size: 12.5px;
}

.participation-ending-summary small {
  color: #78889b;
  font-size: 10.5px;
}

.culture-create {
  display: grid;
  gap: 10px;
  margin-top: 8px;
  padding: 14px;
  border: 1px dashed #cbd7e6;
  border-radius: 8px;
  background: #f8fafc;
}

.culture-create strong,
.culture-create small {
  display: block;
}

.culture-create strong {
  color: #2c4058;
  font-size: 12px;
}

.culture-create small {
  margin-top: 4px;
  color: #78889b;
  font-size: 10.5px;
  line-height: 1.45;
}

.culture-create-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 9px;
}

.culture-create-row input {
  width: 100%;
  min-height: 41px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  background: #fff;
  color: #25364d;
  font: inherit;
  font-size: 12.5px;
}

@media (max-width: 680px) {
  .section-heading--with-action {
    align-items: flex-start;
    flex-direction: column;
  }

  .culture-create-row {
    grid-template-columns: 1fr;
  }
}

</style>
