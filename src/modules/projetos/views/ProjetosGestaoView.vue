<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

import { projetosService } from '@/modules/projetos/services/projetosService'
import type {
  AtividadeOperacional,
  AtividadeRequest,
  ProjetoOperacional,
  SciOperacional,
  SciRequest,
  SituacaoExecucaoProjeto,
  StatusProjeto,
} from '@/modules/projetos/types/projetos'
import { useSessionStore } from '@/stores/session'

type FiltroStatus = 'TODOS' | StatusProjeto
type ModalHierarquia = 'sci' | 'atividade' | null

interface SciForm {
  projetoId: string
  codigoSeg: string
  nome: string
  responsavel: string
  dataInicio: string
  dataFim: string
  status: StatusProjeto
  situacaoExecucao: SituacaoExecucaoProjeto
  ativo: boolean
}

interface AtividadeForm {
  sciId: string
  codigoSeg: string
  nome: string
  responsavel: string
  dataInicio: string
  dataFim: string
  status: StatusProjeto
  situacaoExecucao: SituacaoExecucaoProjeto
  ativo: boolean
}

const session = useSessionStore()

const projetos = ref<ProjetoOperacional[]>([])
const scis = ref<SciOperacional[]>([])
const atividades = ref<AtividadeOperacional[]>([])
const projetoSelecionadoId = ref<string | null>(null)

const busca = ref('')
const filtroStatus = ref<FiltroStatus>('TODOS')
const carregando = ref(false)
const carregandoDetalhes = ref(false)
const erro = ref('')
const modal = ref<ModalHierarquia>(null)
const editandoId = ref<string | null>(null)
const salvandoHierarquia = ref(false)
const erroModal = ref('')

const statusOpcoes: StatusProjeto[] = [
  'ATIVO',
  'ENCERRADO_COM_AVALIACAO_PENDENTE',
  'CONCLUIDO',
]

const situacaoOpcoes: SituacaoExecucaoProjeto[] = [
  'NAO_INFORMADO',
  'EM_ANDAMENTO_NO_PRAZO',
  'EM_ANDAMENTO_ATRASADO',
  'EXECUCAO_CANCELADA',
]

const sciForm = ref<SciForm>({
  projetoId: '',
  codigoSeg: '',
  nome: '',
  responsavel: '',
  dataInicio: '',
  dataFim: '',
  status: 'ATIVO',
  situacaoExecucao: 'NAO_INFORMADO',
  ativo: true,
})

const atividadeForm = ref<AtividadeForm>({
  sciId: '',
  codigoSeg: '',
  nome: '',
  responsavel: '',
  dataInicio: '',
  dataFim: '',
  status: 'ATIVO',
  situacaoExecucao: 'NAO_INFORMADO',
  ativo: true,
})

const ehAdministrador = computed(() => session.usuario?.perfil === 'ADMINISTRADOR')

const termoBusca = computed(() => busca.value.trim().toLocaleLowerCase('pt-BR'))

const projetosFiltrados = computed(() => {
  return projetos.value.filter((projeto) => {
    const bateStatus = filtroStatus.value === 'TODOS' || projeto.status === filtroStatus.value
    const campos = [
      projeto.nome,
      projeto.codigoSeg ?? '',
      projeto.laboratorioNome,
      projeto.responsavel ?? '',
      projeto.descricao ?? '',
    ]
    const bateBusca = !termoBusca.value
      || campos.some((campo) => campo.toLocaleLowerCase('pt-BR').includes(termoBusca.value))

    return bateStatus && bateBusca
  })
})

const projetoSelecionado = computed(() =>
  projetos.value.find((item) => item.id === projetoSelecionadoId.value) ?? null,
)

const resumo = computed(() => ({
  total: projetos.value.length,
  ativos: projetos.value.filter((item) => item.status === 'ATIVO').length,
  atrasados: projetos.value.filter((item) => item.situacaoExecucao === 'EM_ANDAMENTO_ATRASADO').length,
  concluidos: projetos.value.filter((item) => item.status === 'CONCLUIDO').length,
}))

const atividadesSemSci = computed(() =>
  atividades.value.filter((atividade) => !scis.value.some((sci) => sci.id === atividade.sciId)),
)

function atividadesDoSci(sciId: string) {
  return atividades.value.filter((atividade) => atividade.sciId === sciId)
}

function mensagemErro(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    return data?.message || fallback
  }
  return fallback
}

function formatarData(valor?: string | null) {
  if (!valor) return 'Não definida'
  const [ano, mes, dia] = valor.split('-')
  if (!ano || !mes || !dia) return valor
  return `${dia}/${mes}/${ano}`
}

function rotuloStatus(status: StatusProjeto) {
  const rotulos: Record<StatusProjeto, string> = {
    ATIVO: 'Ativo',
    ENCERRADO_COM_AVALIACAO_PENDENTE: 'Avaliação pendente',
    CONCLUIDO: 'Concluído',
  }
  return rotulos[status]
}

function rotuloSituacao(valor: ProjetoOperacional['situacaoExecucao']) {
  const rotulos: Record<ProjetoOperacional['situacaoExecucao'], string> = {
    NAO_INFORMADO: 'Não informado',
    EM_ANDAMENTO_NO_PRAZO: 'No prazo',
    EM_ANDAMENTO_ATRASADO: 'Em atraso',
    EXECUCAO_CANCELADA: 'Execução cancelada',
  }
  return rotulos[valor]
}

function classeStatus(status: StatusProjeto) {
  if (status === 'CONCLUIDO') return 'badge--success'
  if (status === 'ENCERRADO_COM_AVALIACAO_PENDENTE') return 'badge--warning'
  return 'badge--primary'
}

function classeSituacao(valor: ProjetoOperacional['situacaoExecucao']) {
  if (valor === 'EM_ANDAMENTO_ATRASADO' || valor === 'EXECUCAO_CANCELADA') return 'badge--danger'
  if (valor === 'EM_ANDAMENTO_NO_PRAZO') return 'badge--success'
  return 'badge--neutral'
}

function abrirNovoSci() {
  if (!projetoSelecionado.value) return

  editandoId.value = null
  erroModal.value = ''
  sciForm.value = {
    projetoId: projetoSelecionado.value.id,
    codigoSeg: '',
    nome: '',
    responsavel: '',
    dataInicio: projetoSelecionado.value.dataInicio ?? '',
    dataFim: projetoSelecionado.value.dataFim ?? '',
    status: 'ATIVO',
    situacaoExecucao: 'NAO_INFORMADO',
    ativo: true,
  }
  modal.value = 'sci'
}

function abrirEditarSci(sci: SciOperacional) {
  editandoId.value = sci.id
  erroModal.value = ''
  sciForm.value = {
    projetoId: sci.projetoId,
    codigoSeg: sci.codigoSeg,
    nome: sci.nome,
    responsavel: sci.responsavel ?? '',
    dataInicio: sci.dataInicio,
    dataFim: sci.dataFim ?? '',
    status: sci.status,
    situacaoExecucao: sci.situacaoExecucao,
    ativo: sci.ativo,
  }
  modal.value = 'sci'
}

function abrirNovaAtividade(sci: SciOperacional) {
  editandoId.value = null
  erroModal.value = ''
  atividadeForm.value = {
    sciId: sci.id,
    codigoSeg: '',
    nome: '',
    responsavel: '',
    dataInicio: sci.dataInicio,
    dataFim: sci.dataFim ?? '',
    status: 'ATIVO',
    situacaoExecucao: 'NAO_INFORMADO',
    ativo: true,
  }
  modal.value = 'atividade'
}

function abrirEditarAtividade(atividade: AtividadeOperacional) {
  editandoId.value = atividade.id
  erroModal.value = ''
  atividadeForm.value = {
    sciId: atividade.sciId,
    codigoSeg: atividade.codigoSeg,
    nome: atividade.nome,
    responsavel: atividade.responsavel ?? '',
    dataInicio: atividade.dataInicio,
    dataFim: atividade.dataFim ?? '',
    status: atividade.status,
    situacaoExecucao: atividade.situacaoExecucao,
    ativo: atividade.ativo,
  }
  modal.value = 'atividade'
}

function fecharModal() {
  if (salvandoHierarquia.value) return
  modal.value = null
  editandoId.value = null
  erroModal.value = ''
}

async function salvarSci() {
  if (!sciForm.value.projetoId || !sciForm.value.codigoSeg.trim() || !sciForm.value.nome.trim() || !sciForm.value.dataInicio) {
    erroModal.value = 'Informe Código SEG, título e data de início do SCI.'
    return
  }

  if (sciForm.value.dataFim && sciForm.value.dataFim < sciForm.value.dataInicio) {
    erroModal.value = 'A data final do SCI não pode ser anterior à data inicial.'
    return
  }

  const payload: SciRequest = {
    projetoId: sciForm.value.projetoId,
    codigoSeg: sciForm.value.codigoSeg.trim(),
    nome: sciForm.value.nome.trim(),
    responsavel: sciForm.value.responsavel.trim() || null,
    dataInicio: sciForm.value.dataInicio,
    dataFim: sciForm.value.dataFim || null,
    status: sciForm.value.status,
    situacaoExecucao: sciForm.value.situacaoExecucao,
    ativo: sciForm.value.ativo,
  }

  salvandoHierarquia.value = true
  erroModal.value = ''

  try {
    if (editandoId.value) {
      await projetosService.atualizarSci(editandoId.value, payload)
    } else {
      await projetosService.criarSci(payload)
    }

    modal.value = null
    editandoId.value = null
    await carregarDetalhes(payload.projetoId)
  } catch (error) {
    erroModal.value = mensagemErro(error, 'Não foi possível salvar o SCI.')
  } finally {
    salvandoHierarquia.value = false
  }
}

async function salvarAtividade() {
  if (!atividadeForm.value.sciId || !atividadeForm.value.codigoSeg.trim() || !atividadeForm.value.nome.trim() || !atividadeForm.value.dataInicio) {
    erroModal.value = 'Informe Código SEG, título e data de início da Atividade.'
    return
  }

  if (atividadeForm.value.dataFim && atividadeForm.value.dataFim < atividadeForm.value.dataInicio) {
    erroModal.value = 'A data final da Atividade não pode ser anterior à data inicial.'
    return
  }

  const payload: AtividadeRequest = {
    sciId: atividadeForm.value.sciId,
    codigoSeg: atividadeForm.value.codigoSeg.trim(),
    nome: atividadeForm.value.nome.trim(),
    responsavel: atividadeForm.value.responsavel.trim() || null,
    dataInicio: atividadeForm.value.dataInicio,
    dataFim: atividadeForm.value.dataFim || null,
    status: atividadeForm.value.status,
    situacaoExecucao: atividadeForm.value.situacaoExecucao,
    ativo: atividadeForm.value.ativo,
  }

  salvandoHierarquia.value = true
  erroModal.value = ''

  try {
    if (editandoId.value) {
      await projetosService.atualizarAtividade(editandoId.value, payload)
    } else {
      await projetosService.criarAtividade(payload)
    }

    modal.value = null
    editandoId.value = null

    if (projetoSelecionadoId.value) {
      await carregarDetalhes(projetoSelecionadoId.value)
    }
  } catch (error) {
    erroModal.value = mensagemErro(error, 'Não foi possível salvar a Atividade.')
  } finally {
    salvandoHierarquia.value = false
  }
}

async function carregarDetalhes(projetoId: string) {
  projetoSelecionadoId.value = projetoId
  carregandoDetalhes.value = true
  erro.value = ''

  try {
    const [listaScis, listaAtividades] = await Promise.all([
      projetosService.listarScisPorProjeto(projetoId),
      projetosService.listarAtividadesPorProjeto(projetoId),
    ])

    if (projetoSelecionadoId.value !== projetoId) return

    scis.value = listaScis
    atividades.value = listaAtividades
  } catch (error) {
    scis.value = []
    atividades.value = []
    erro.value = mensagemErro(error, 'Não foi possível carregar a hierarquia do projeto.')
  } finally {
    carregandoDetalhes.value = false
  }
}

async function carregar() {
  carregando.value = true
  erro.value = ''

  try {
    const lista = await projetosService.listarProjetos()
    projetos.value = [...lista].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'ATIVO' ? -1 : 1
      return a.nome.localeCompare(b.nome, 'pt-BR')
    })

    const manterSelecionado = projetoSelecionadoId.value
      && projetos.value.some((item) => item.id === projetoSelecionadoId.value)

    const primeiroId = manterSelecionado
      ? projetoSelecionadoId.value
      : projetos.value[0]?.id ?? null

    if (primeiroId) {
      await carregarDetalhes(primeiroId)
    } else {
      projetoSelecionadoId.value = null
      scis.value = []
      atividades.value = []
    }
  } catch (error) {
    erro.value = mensagemErro(error, 'Não foi possível carregar os projetos da Unidade.')
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <main class="projects-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">GESTÃO / PROJETOS</p>
        <h1>Projetos</h1>
        <p class="subtitle">
          Acompanhe Projeto → SCI → Atividades sem precisar navegar primeiro pelo laboratório.
        </p>
      </div>

      <div class="header-actions">
        <router-link
          v-if="ehAdministrador"
          class="button button--ghost"
          :to="{ path: '/administracao/cadastros', query: { secao: 'projetos' } }"
        >
          Administrar cadastros
        </router-link>
        <button class="button button--primary" type="button" :disabled="carregando" @click="carregar">
          {{ carregando ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>
    </header>

    <section class="summary-grid" aria-label="Resumo de projetos">
      <article>
        <span>Total</span>
        <strong>{{ resumo.total }}</strong>
        <small>na Unidade atual</small>
      </article>
      <article>
        <span>Ativos</span>
        <strong>{{ resumo.ativos }}</strong>
        <small>ciclo em andamento</small>
      </article>
      <article>
        <span>Em atraso</span>
        <strong>{{ resumo.atrasados }}</strong>
        <small>situação de execução</small>
      </article>
      <article>
        <span>Concluídos</span>
        <strong>{{ resumo.concluidos }}</strong>
        <small>histórico preservado</small>
      </article>
    </section>

    <p v-if="erro" class="feedback feedback--error">{{ erro }}</p>

    <section class="toolbar-card">
      <label>
        <span>Buscar projeto</span>
        <input
          v-model="busca"
          type="search"
          placeholder="Título, Código SEG, laboratório ou responsável"
        />
      </label>

      <label>
        <span>Status</span>
        <select v-model="filtroStatus">
          <option value="TODOS">Todos</option>
          <option value="ATIVO">Ativos</option>
          <option value="ENCERRADO_COM_AVALIACAO_PENDENTE">Avaliação pendente</option>
          <option value="CONCLUIDO">Concluídos</option>
        </select>
      </label>
    </section>

    <section class="workspace">
      <aside class="project-list-card">
        <header>
          <div>
            <span>PROJETOS</span>
            <strong>{{ projetosFiltrados.length }}</strong>
          </div>
          <small>Clique para abrir a hierarquia</small>
        </header>

        <div v-if="carregando && projetos.length === 0" class="empty-state">
          Carregando projetos...
        </div>

        <div v-else-if="projetosFiltrados.length === 0" class="empty-state">
          Nenhum projeto encontrado para os filtros atuais.
        </div>

        <button
          v-for="projeto in projetosFiltrados"
          :key="projeto.id"
          type="button"
          class="project-item"
          :class="{ 'project-item--active': projetoSelecionadoId === projeto.id }"
          @click="carregarDetalhes(projeto.id)"
        >
          <div class="project-item__top">
            <span class="badge" :class="classeStatus(projeto.status)">
              {{ rotuloStatus(projeto.status) }}
            </span>
            <span class="seg-code">{{ projeto.codigoSeg || 'SEG não definido' }}</span>
          </div>
          <strong>{{ projeto.nome }}</strong>
          <small>{{ projeto.laboratorioNome }}</small>
          <footer>
            <span>{{ projeto.responsavel || 'Responsável não informado' }}</span>
            <span>{{ formatarData(projeto.dataInicio) }}</span>
          </footer>
        </button>
      </aside>

      <article v-if="projetoSelecionado" class="detail-card">
        <header class="detail-hero">
          <div>
            <div class="detail-badges">
              <span class="badge" :class="classeStatus(projetoSelecionado.status)">
                {{ rotuloStatus(projetoSelecionado.status) }}
              </span>
              <span class="badge" :class="classeSituacao(projetoSelecionado.situacaoExecucao)">
                {{ rotuloSituacao(projetoSelecionado.situacaoExecucao) }}
              </span>
            </div>
            <p class="seg-code seg-code--large">{{ projetoSelecionado.codigoSeg || 'Código SEG não definido' }}</p>
            <h2>{{ projetoSelecionado.nome }}</h2>
            <p>{{ projetoSelecionado.descricao || 'Projeto sem descrição cadastrada.' }}</p>
          </div>

          <div class="hierarchy-summary">
            <div>
              <strong>{{ scis.length }}</strong>
              <span>SCI</span>
            </div>
            <div>
              <strong>{{ atividades.length }}</strong>
              <span>Atividades</span>
            </div>
          </div>
        </header>

        <section class="metadata-grid">
          <div>
            <span>Laboratório responsável</span>
            <strong>{{ projetoSelecionado.laboratorioNome }}</strong>
          </div>
          <div>
            <span>Líder / responsável</span>
            <strong>{{ projetoSelecionado.responsavel || 'Não informado' }}</strong>
          </div>
          <div>
            <span>Início</span>
            <strong>{{ formatarData(projetoSelecionado.dataInicio) }}</strong>
          </div>
          <div>
            <span>Fim</span>
            <strong>{{ formatarData(projetoSelecionado.dataFim) }}</strong>
          </div>
          <div>
            <span>Recurso externo</span>
            <strong>{{ projetoSelecionado.possuiRecursoExterno ? 'Sim' : 'Não' }}</strong>
            <small v-if="projetoSelecionado.possuiRecursoExterno">
              {{ projetoSelecionado.empresaRecursoExterno || 'Empresa não informada' }}
            </small>
          </div>
          <div>
            <span>Situação técnica</span>
            <strong>{{ projetoSelecionado.ativo ? 'Habilitado' : 'Inativo' }}</strong>
          </div>
        </section>

        <section class="hierarchy-section">
          <header>
            <div>
              <p class="eyebrow">ESTRUTURA DO PROJETO</p>
              <h3>SCI e Atividades</h3>
            </div>
            <div class="hierarchy-header-actions">
              <small>Os códigos preservam a hierarquia institucional do SEG.</small>
              <button class="button button--primary button--small" type="button" @click="abrirNovoSci">
                + Novo SCI
              </button>
            </div>
          </header>

          <div v-if="carregandoDetalhes" class="empty-state">
            Carregando SCI e Atividades...
          </div>

          <div v-else-if="scis.length === 0" class="empty-state">
            Este projeto ainda não possui SCI cadastrado.
          </div>

          <template v-else>
            <article v-for="sci in scis" :key="sci.id" class="sci-card">
              <header>
                <div>
                  <p class="seg-code">{{ sci.codigoSeg }}</p>
                  <h4>{{ sci.nome }}</h4>
                  <span>{{ sci.responsavel || 'Responsável não informado' }}</span>
                </div>
                <div class="sci-actions">
                  <div class="detail-badges">
                    <span class="badge" :class="classeStatus(sci.status)">
                      {{ rotuloStatus(sci.status) }}
                    </span>
                    <span class="badge" :class="classeSituacao(sci.situacaoExecucao)">
                      {{ rotuloSituacao(sci.situacaoExecucao) }}
                    </span>
                  </div>
                  <div class="inline-actions">
                    <button type="button" @click="abrirEditarSci(sci)">Editar SCI</button>
                    <button type="button" @click="abrirNovaAtividade(sci)">+ Atividade</button>
                  </div>
                </div>
              </header>

              <div class="sci-period">
                <span>{{ formatarData(sci.dataInicio) }}</span>
                <span>→</span>
                <span>{{ formatarData(sci.dataFim) }}</span>
                <strong>{{ atividadesDoSci(sci.id).length }} atividade(s)</strong>
              </div>

              <div v-if="atividadesDoSci(sci.id).length === 0" class="activity-empty">
                Nenhuma Atividade vinculada a este SCI.
              </div>

              <div v-else class="activity-list">
                <article
                  v-for="atividade in atividadesDoSci(sci.id)"
                  :key="atividade.id"
                  class="activity-item"
                >
                  <div>
                    <p class="seg-code">{{ atividade.codigoSeg }}</p>
                    <strong>{{ atividade.nome }}</strong>
                    <span>{{ atividade.responsavel || 'Responsável não informado' }}</span>
                  </div>
                  <div class="activity-item__meta">
                    <span class="badge" :class="classeStatus(atividade.status)">
                      {{ rotuloStatus(atividade.status) }}
                    </span>
                    <small>
                      {{ formatarData(atividade.dataInicio) }} → {{ formatarData(atividade.dataFim) }}
                    </small>
                    <button class="activity-edit" type="button" @click="abrirEditarAtividade(atividade)">
                      Editar
                    </button>
                  </div>
                </article>
              </div>
            </article>
          </template>

          <div v-if="atividadesSemSci.length > 0" class="feedback feedback--warning">
            Existem {{ atividadesSemSci.length }} Atividade(s) retornadas sem SCI visível neste Projeto.
          </div>
        </section>
      </article>

      <article v-else class="detail-card empty-state detail-empty">
        Selecione um Projeto para visualizar seus SCI e Atividades.
      </article>
    </section>

    <div v-if="modal" class="modal-backdrop" @click.self="fecharModal">
      <section class="modal-card" role="dialog" aria-modal="true">
        <header>
          <div>
            <p class="eyebrow">{{ editandoId ? 'EDIÇÃO' : 'NOVO CADASTRO' }}</p>
            <h2>{{ modal === 'sci' ? 'SCI' : 'Atividade' }}</h2>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharModal">×</button>
        </header>

        <p v-if="erroModal" class="feedback feedback--error modal-feedback">{{ erroModal }}</p>

        <form v-if="modal === 'sci'" class="hierarchy-form" @submit.prevent="salvarSci">
          <label class="form-field">
            <span>Projeto</span>
            <input :value="projetoSelecionado?.nome || ''" disabled />
          </label>

          <div class="form-grid">
            <label class="form-field">
              <span>Código SEG *</span>
              <input
                v-model="sciForm.codigoSeg"
                required
                placeholder="XX.XX.XX.XXX.XX.SS"
                :disabled="Boolean(editandoId)"
              />
              <small v-if="editandoId">Código imutável no CRUD comum.</small>
              <small v-else-if="projetoSelecionado?.codigoSeg">Deve manter a raiz de {{ projetoSelecionado.codigoSeg }}.</small>
            </label>
            <label class="form-field">
              <span>Título *</span>
              <input v-model="sciForm.nome" required />
            </label>
            <label class="form-field">
              <span>Responsável</span>
              <input v-model="sciForm.responsavel" />
            </label>
            <label class="form-field">
              <span>Status</span>
              <select v-model="sciForm.status">
                <option v-for="item in statusOpcoes" :key="item" :value="item">{{ rotuloStatus(item) }}</option>
              </select>
            </label>
            <label class="form-field">
              <span>Data de início *</span>
              <input v-model="sciForm.dataInicio" type="date" required :disabled="Boolean(editandoId)" />
              <small v-if="editandoId">A data de início não pode ser alterada depois da criação.</small>
            </label>
            <label class="form-field">
              <span>Data final</span>
              <input v-model="sciForm.dataFim" type="date" />
              <small v-if="editandoId">Aumento de prazo deve usar o fluxo de prorrogação.</small>
            </label>
            <label class="form-field">
              <span>Situação de execução</span>
              <select v-model="sciForm.situacaoExecucao">
                <option v-for="item in situacaoOpcoes" :key="item" :value="item">{{ rotuloSituacao(item) }}</option>
              </select>
            </label>
          </div>

          <label class="check-field">
            <input v-model="sciForm.ativo" type="checkbox" />
            <span>SCI habilitado tecnicamente</span>
          </label>

          <footer class="modal-actions">
            <button class="button button--ghost" type="button" :disabled="salvandoHierarquia" @click="fecharModal">Cancelar</button>
            <button class="button button--primary" type="submit" :disabled="salvandoHierarquia">
              {{ salvandoHierarquia ? 'Salvando...' : 'Salvar SCI' }}
            </button>
          </footer>
        </form>

        <form v-else class="hierarchy-form" @submit.prevent="salvarAtividade">
          <label class="form-field">
            <span>SCI</span>
            <input :value="scis.find((item) => item.id === atividadeForm.sciId)?.nome || ''" disabled />
          </label>

          <div class="form-grid">
            <label class="form-field">
              <span>Código SEG *</span>
              <input
                v-model="atividadeForm.codigoSeg"
                required
                placeholder="XX.XX.XX.XXX.XX.SS.AAA"
                :disabled="Boolean(editandoId)"
              />
              <small v-if="editandoId">Código imutável no CRUD comum.</small>
              <small v-else>Deve herdar integralmente o Código SEG do SCI e acrescentar três dígitos.</small>
            </label>
            <label class="form-field">
              <span>Título *</span>
              <input v-model="atividadeForm.nome" required />
            </label>
            <label class="form-field">
              <span>Responsável</span>
              <input v-model="atividadeForm.responsavel" />
            </label>
            <label class="form-field">
              <span>Status</span>
              <select v-model="atividadeForm.status">
                <option v-for="item in statusOpcoes" :key="item" :value="item">{{ rotuloStatus(item) }}</option>
              </select>
            </label>
            <label class="form-field">
              <span>Data de início *</span>
              <input v-model="atividadeForm.dataInicio" type="date" required :disabled="Boolean(editandoId)" />
              <small v-if="editandoId">A data de início não pode ser alterada depois da criação.</small>
            </label>
            <label class="form-field">
              <span>Data final</span>
              <input v-model="atividadeForm.dataFim" type="date" />
              <small v-if="editandoId">Aumento de prazo deve usar o fluxo de prorrogação.</small>
            </label>
            <label class="form-field">
              <span>Situação de execução</span>
              <select v-model="atividadeForm.situacaoExecucao">
                <option v-for="item in situacaoOpcoes" :key="item" :value="item">{{ rotuloSituacao(item) }}</option>
              </select>
            </label>
          </div>

          <label class="check-field">
            <input v-model="atividadeForm.ativo" type="checkbox" />
            <span>Atividade habilitada tecnicamente</span>
          </label>

          <footer class="modal-actions">
            <button class="button button--ghost" type="button" :disabled="salvandoHierarquia" @click="fecharModal">Cancelar</button>
            <button class="button button--primary" type="submit" :disabled="salvandoHierarquia">
              {{ salvandoHierarquia ? 'Salvando...' : 'Salvar Atividade' }}
            </button>
          </footer>
        </form>
      </section>
    </div>
  </main>
</template>

<style scoped>
.projects-page {
  display: grid;
  gap: 18px;
  color: var(--sgl-text);
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--sgl-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .12em;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(26px, 3vw, 36px);
  line-height: 1;
}

.subtitle {
  max-width: 720px;
  margin: 9px 0 0;
  color: var(--sgl-text-muted);
  font-size: 13px;
}

.header-actions {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
}

.button {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  border: 1px solid var(--sgl-border);
  border-radius: 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.button:disabled {
  opacity: .65;
  cursor: wait;
}

.button--primary {
  border-color: var(--sgl-primary);
  background: var(--sgl-primary);
  color: #fff;
}

.button--ghost {
  background: var(--sgl-surface);
  color: var(--sgl-primary);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-grid article {
  min-height: 112px;
  display: grid;
  align-content: center;
  gap: 5px;
  padding: 17px 18px;
  border: 1px solid var(--sgl-border);
  border-radius: 12px;
  background: var(--sgl-surface);
  box-shadow: 0 8px 24px rgb(15 39 79 / 5%);
}

.summary-grid span {
  color: var(--sgl-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.summary-grid strong {
  font-size: 27px;
}

.summary-grid small {
  color: var(--sgl-text-muted);
  font-size: 10px;
}

.toolbar-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--sgl-border);
  border-radius: 12px;
  background: var(--sgl-surface);
}

.toolbar-card label {
  display: grid;
  gap: 6px;
}

.toolbar-card label > span {
  color: var(--sgl-text-muted);
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.toolbar-card input,
.toolbar-card select {
  width: 100%;
  min-height: 40px;
  border: 1px solid var(--sgl-border);
  border-radius: 8px;
  padding: 0 11px;
  background: var(--sgl-surface);
  color: var(--sgl-text);
  font: inherit;
  font-size: 12px;
}

.workspace {
  min-height: 540px;
  display: grid;
  grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.project-list-card,
.detail-card {
  border: 1px solid var(--sgl-border);
  border-radius: 12px;
  background: var(--sgl-surface);
  overflow: hidden;
  box-shadow: 0 8px 24px rgb(15 39 79 / 5%);
}

.project-list-card {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
  position: sticky;
  top: 88px;
}

.project-list-card > header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 15px;
  border-bottom: 1px solid var(--sgl-border);
  background: var(--sgl-surface);
}

.project-list-card > header div {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.project-list-card > header span,
.project-list-card > header small {
  color: var(--sgl-text-muted);
  font-size: 9px;
  font-weight: 800;
}

.project-item {
  width: 100%;
  display: grid;
  gap: 7px;
  padding: 14px 15px;
  border: 0;
  border-bottom: 1px solid var(--sgl-border);
  background: transparent;
  color: var(--sgl-text);
  text-align: left;
  cursor: pointer;
}

.project-item:hover {
  background: color-mix(in srgb, var(--sgl-primary) 5%, var(--sgl-surface));
}

.project-item--active {
  background: color-mix(in srgb, var(--sgl-primary) 9%, var(--sgl-surface));
  box-shadow: inset 3px 0 0 var(--sgl-primary);
}

.project-item__top,
.project-item footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.project-item > strong {
  font-size: 12px;
  line-height: 1.35;
}

.project-item > small,
.project-item footer {
  color: var(--sgl-text-muted);
  font-size: 9px;
}

.badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  min-height: 23px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
}

.badge--primary {
  background: color-mix(in srgb, var(--sgl-primary) 12%, var(--sgl-surface));
  color: var(--sgl-primary);
}

.badge--success {
  background: color-mix(in srgb, #16835d 13%, var(--sgl-surface));
  color: #16835d;
}

.badge--warning {
  background: color-mix(in srgb, #b7791f 15%, var(--sgl-surface));
  color: #a1630e;
}

.badge--danger {
  background: color-mix(in srgb, #c0392b 12%, var(--sgl-surface));
  color: #bd3023;
}

.badge--neutral {
  background: color-mix(in srgb, var(--sgl-text-muted) 10%, var(--sgl-surface));
  color: var(--sgl-text-muted);
}

.seg-code {
  margin: 0;
  color: var(--sgl-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9px;
  font-weight: 700;
}

.seg-code--large {
  margin-top: 14px;
  font-size: 11px;
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  padding: 22px;
  border-bottom: 1px solid var(--sgl-border);
}

.detail-hero h2 {
  margin: 6px 0 8px;
  font-size: 24px;
}

.detail-hero p:not(.seg-code) {
  max-width: 760px;
  margin: 0;
  color: var(--sgl-text-muted);
  font-size: 12px;
  line-height: 1.55;
}

.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hierarchy-summary {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.hierarchy-summary div {
  min-width: 82px;
  display: grid;
  place-items: center;
  align-content: center;
  padding: 12px;
  border: 1px solid var(--sgl-border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--sgl-primary) 4%, var(--sgl-surface));
}

.hierarchy-summary strong {
  font-size: 24px;
}

.hierarchy-summary span {
  color: var(--sgl-text-muted);
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid var(--sgl-border);
}

.metadata-grid > div {
  min-height: 82px;
  display: grid;
  align-content: center;
  gap: 5px;
  padding: 14px 18px;
  border-right: 1px solid var(--sgl-border);
  border-bottom: 1px solid var(--sgl-border);
}

.metadata-grid > div:nth-child(3n) {
  border-right: 0;
}

.metadata-grid span,
.metadata-grid small {
  color: var(--sgl-text-muted);
  font-size: 9px;
}

.metadata-grid strong {
  font-size: 11px;
}

.hierarchy-section {
  display: grid;
  gap: 12px;
  padding: 20px;
}

.hierarchy-section > header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.hierarchy-section h3 {
  margin: 0;
  font-size: 17px;
}

.hierarchy-section > header small {
  max-width: 340px;
  color: var(--sgl-text-muted);
  font-size: 9px;
  text-align: right;
}

.sci-card {
  border: 1px solid var(--sgl-border);
  border-radius: 10px;
  overflow: hidden;
}

.sci-card > header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 15px;
  background: color-mix(in srgb, var(--sgl-primary) 3%, var(--sgl-surface));
}

.sci-card h4 {
  margin: 4px 0;
  font-size: 13px;
}

.sci-card header span:not(.badge) {
  color: var(--sgl-text-muted);
  font-size: 9px;
}

.sci-period {
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 15px;
  border-top: 1px solid var(--sgl-border);
  border-bottom: 1px solid var(--sgl-border);
  color: var(--sgl-text-muted);
  font-size: 9px;
}

.sci-period strong {
  margin-left: auto;
  color: var(--sgl-text);
}

.activity-list {
  display: grid;
}

.activity-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  padding: 12px 15px;
  border-bottom: 1px solid var(--sgl-border);
}

.activity-item:last-child {
  border-bottom: 0;
}

.activity-item strong,
.activity-item span {
  display: block;
}

.activity-item strong {
  margin-top: 3px;
  font-size: 11px;
}

.activity-item div > span:not(.badge) {
  margin-top: 4px;
  color: var(--sgl-text-muted);
  font-size: 9px;
}

.activity-item__meta {
  display: grid;
  justify-items: end;
  align-content: center;
  gap: 7px;
}

.activity-item__meta small {
  color: var(--sgl-text-muted);
  font-size: 9px;
}

.activity-empty,
.empty-state {
  padding: 18px;
  color: var(--sgl-text-muted);
  font-size: 11px;
  text-align: center;
}

.detail-empty {
  min-height: 300px;
  display: grid;
  place-items: center;
}

.feedback {
  padding: 11px 13px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}

.feedback--error {
  border: 1px solid color-mix(in srgb, #c0392b 30%, var(--sgl-border));
  background: color-mix(in srgb, #c0392b 7%, var(--sgl-surface));
  color: #bd3023;
}

.feedback--warning {
  border: 1px solid color-mix(in srgb, #b7791f 30%, var(--sgl-border));
  background: color-mix(in srgb, #b7791f 7%, var(--sgl-surface));
  color: #9b600d;
}

@media (max-width: 1050px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .project-list-card {
    position: static;
    max-height: 420px;
  }
}

@media (max-width: 700px) {
  .page-header,
  .hierarchy-section > header,
  .detail-hero {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .page-header,
  .hierarchy-section > header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .button {
    flex: 1;
  }

  .summary-grid,
  .toolbar-card,
  .metadata-grid {
    grid-template-columns: 1fr;
  }

  .metadata-grid > div,
  .metadata-grid > div:nth-child(3n) {
    border-right: 0;
  }

  .hierarchy-summary {
    width: 100%;
  }

  .hierarchy-summary div {
    flex: 1;
  }

  .sci-card > header,
  .activity-item {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .activity-item__meta {
    justify-items: start;
  }

  .hierarchy-section > header small {
    text-align: left;
  }
}

.button--small {
  min-height: 34px;
  padding-inline: 11px;
  font-size: 10px;
}

.hierarchy-header-actions {
  display: grid;
  justify-items: end;
  gap: 8px;
}

.sci-actions {
  display: grid;
  justify-items: end;
  gap: 8px;
}

.inline-actions {
  display: flex;
  gap: 6px;
}

.inline-actions button,
.activity-edit {
  min-height: 28px;
  padding: 0 9px;
  border: 1px solid var(--sgl-border);
  border-radius: 6px;
  background: var(--sgl-surface);
  color: var(--sgl-primary);
  font: inherit;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}

.inline-actions button:hover,
.activity-edit:hover {
  background: color-mix(in srgb, var(--sgl-primary) 7%, var(--sgl-surface));
}

.activity-edit {
  margin-top: 3px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(6 18 38 / 58%);
}

.modal-card {
  width: min(760px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  border: 1px solid var(--sgl-border);
  border-radius: 14px;
  background: var(--sgl-surface);
  color: var(--sgl-text);
  box-shadow: 0 24px 70px rgb(5 18 40 / 25%);
}

.modal-card > header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--sgl-border);
  background: var(--sgl-surface);
}

.modal-card > header h2 {
  margin: 0;
  font-size: 20px;
}

.modal-card > header > button {
  width: 34px;
  height: 34px;
  border: 1px solid var(--sgl-border);
  border-radius: 8px;
  background: transparent;
  color: var(--sgl-text);
  font-size: 22px;
  cursor: pointer;
}

.modal-feedback {
  margin: 14px 18px 0;
}

.hierarchy-form {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-field {
  display: grid;
  gap: 6px;
}

.form-field > span {
  color: var(--sgl-text-muted);
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.form-field input,
.form-field select {
  width: 100%;
  min-height: 40px;
  border: 1px solid var(--sgl-border);
  border-radius: 8px;
  padding: 0 10px;
  background: var(--sgl-surface);
  color: var(--sgl-text);
  font: inherit;
  font-size: 11px;
}

.form-field input:disabled {
  opacity: .7;
  background: color-mix(in srgb, var(--sgl-text-muted) 5%, var(--sgl-surface));
}

.form-field small {
  color: var(--sgl-text-muted);
  font-size: 9px;
  line-height: 1.4;
}

.check-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--sgl-text-muted);
  font-size: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
}

@media (max-width: 700px) {
  .hierarchy-header-actions,
  .sci-actions {
    justify-items: start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-backdrop {
    padding: 12px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions .button {
    width: 100%;
  }
}

</style>
