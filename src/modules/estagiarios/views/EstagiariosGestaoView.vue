<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

import { estagiarioService } from '@/modules/estagiarios/services/estagiarioService'
import type {
  ApiErrorResponse,
  EstagiarioResponse,
  FormacaoEstagiario,
  SituacaoEstagio,
  TipoBolsaEstagiario,
  VinculoEstagioAtividadeResponse,
  VinculoEstagioResponse,
} from '@/modules/estagiarios/types/estagiario'

type FiltroStatus = 'TODOS' | 'OPERACIONAL' | 'SEM_ATIVIDADE' | 'ENCERRADO'
type EstadoOperacional = Exclude<FiltroStatus, 'TODOS'>

const estagiarios = ref<EstagiarioResponse[]>([])
const carregando = ref(false)
const erro = ref('')
const busca = ref('')
const filtroStatus = ref<FiltroStatus>('TODOS')
const tipoBolsa = ref<TipoBolsaEstagiario | 'TODOS'>('TODOS')
const contexto = ref('TODOS')
const selecionado = ref<EstagiarioResponse | null>(null)

const tiposBolsa: Array<{ valor: TipoBolsaEstagiario; rotulo: string }> = [
  { valor: 'BOLSA_CNPQ', rotulo: 'CNPq' },
  { valor: 'BOLSA_CAPES', rotulo: 'CAPES' },
  { valor: 'BOLSA_INSTITUCIONAL', rotulo: 'Institucional' },
  { valor: 'VOLUNTARIO', rotulo: 'Voluntário' },
  { valor: 'CONTRATUAL', rotulo: 'Contratual' },
]

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

function rotuloEstado(estado: EstadoOperacional) {
  if (estado === 'OPERACIONAL') return 'Operacional'
  if (estado === 'SEM_ATIVIDADE') return 'Sem atividade'
  return 'Encerrado'
}

function classeEstado(estado: EstadoOperacional) {
  if (estado === 'OPERACIONAL') return 'status-pill--active'
  if (estado === 'SEM_ATIVIDADE') return 'status-pill--pending'
  return 'status-pill--closed'
}

function rotuloBolsa(valor: TipoBolsaEstagiario | null | undefined) {
  return tiposBolsa.find((item) => item.valor === valor)?.rotulo ?? 'Não informado'
}

function rotuloFormacao(vinculo: VinculoEstagioResponse | null) {
  if (!vinculo?.formacao) return 'Formação não informada'
  if (vinculo.formacao === 'OUTRO') return vinculo.formacaoOutro || 'Outra formação'
  return formacoes[vinculo.formacao]
}

function rotuloSituacao(valor: SituacaoEstagio | null | undefined) {
  return valor ? situacoes[valor] : 'Não informada'
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

function fimExibicao(vinculo: VinculoEstagioResponse | null) {
  if (!vinculo) return null
  return vinculo.dataFimEfetiva || vinculo.dataFimPrevista
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
    const estado = estadoOperacional(estagiario)
    const vinculo = vinculoAtual(estagiario)

    const statusOk = filtroStatus.value === 'TODOS' || filtroStatus.value === estado
    const bolsaOk = tipoBolsa.value === 'TODOS' || vinculo?.tipoBolsa === tipoBolsa.value
    const contextoOk = correspondeContexto(estagiario)
    const buscaOk = !termo || termosPesquisa(estagiario)
      .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))

    return statusOk && bolsaOk && contextoOk && buscaOk
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

function abrirDetalhes(estagiario: EstagiarioResponse) {
  selecionado.value = estagiario
}

function fecharDetalhes() {
  selecionado.value = null
}

function limparFiltros() {
  busca.value = ''
  filtroStatus.value = 'TODOS'
  tipoBolsa.value = 'TODOS'
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
          <span>Situação</span>
          <select v-model="filtroStatus">
            <option value="TODOS">Todos</option>
            <option value="OPERACIONAL">Operacional</option>
            <option value="SEM_ATIVIDADE">Sem atividade</option>
            <option value="ENCERRADO">Encerrado</option>
          </select>
        </label>

        <label class="field">
          <span>Tipo de vínculo</span>
          <select v-model="tipoBolsa">
            <option value="TODOS">Todos</option>
            <option v-for="tipo in tiposBolsa" :key="tipo.valor" :value="tipo.valor">
              {{ tipo.rotulo }}
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
          v-if="busca || filtroStatus !== 'TODOS' || tipoBolsa !== 'TODOS' || contexto !== 'TODOS'"
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
              <th>Estado</th>
              <th>Estagiário</th>
              <th>Vínculo</th>
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
              <td>
                <span
                  class="status-pill"
                  :class="classeEstado(estadoOperacional(estagiario))"
                >
                  <span class="status-dot" />
                  {{ rotuloEstado(estadoOperacional(estagiario)) }}
                </span>
              </td>

              <td class="student-cell">
                <strong>{{ estagiario.usuarioNome }}</strong>
                <small>{{ rotuloFormacao(vinculoAtual(estagiario)) }}</small>
                <small class="student-course">
                  {{ vinculoAtual(estagiario)?.cursoNome || 'Curso não informado' }}
                </small>
              </td>

              <td class="link-cell">
                <strong>{{ rotuloBolsa(vinculoAtual(estagiario)?.tipoBolsa) }}</strong>
                <span
                  v-if="vinculoAtual(estagiario)"
                  class="link-state"
                  :class="{ 'link-state--closed': vinculoAtual(estagiario)?.situacao === 'FINALIZADO' }"
                >
                  {{ rotuloSituacao(vinculoAtual(estagiario)?.situacao) }}
                </span>
              </td>

              <td>
                <div
                  v-if="estadoOperacional(estagiario) === 'OPERACIONAL'"
                  class="context-preview"
                >
                  <span>{{ textoQuantidade(contagemContexto(vinculoAtual(estagiario)).atividades, 'atividade', 'atividades') }}</span>
                  <span>{{ textoQuantidade(contagemContexto(vinculoAtual(estagiario)).projetos, 'projeto', 'projetos') }}</span>
                  <span>{{ textoQuantidade(contagemContexto(vinculoAtual(estagiario)).laboratorios, 'laboratório', 'laboratórios') }}</span>
                </div>

                <span
                  v-else-if="estadoOperacional(estagiario) === 'SEM_ATIVIDADE'"
                  class="context-empty"
                >
                  Aguardando atividade
                </span>

                <span v-else class="history-preview">
                  Histórico disponível
                </span>
              </td>

              <td class="period-cell">
                <strong>{{ formatarData(vinculoAtual(estagiario)?.dataInicio) }}</strong>
                <small>até</small>
                <strong>{{ formatarData(fimExibicao(vinculoAtual(estagiario))) }}</strong>
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
                :class="classeEstado(estadoOperacional(selecionado))"
              >
                <span class="status-dot" />
                {{ rotuloEstado(estadoOperacional(selecionado)) }}
              </span>
            </div>
            <p>{{ selecionado.unidadeNome || 'Unidade não informada' }}</p>
          </div>

          <button type="button" aria-label="Fechar" @click="fecharDetalhes">×</button>
        </header>

        <div class="detail-content">
          <template v-if="vinculoSelecionado">
            <section class="drawer-section">
              <div class="section-heading">
                <span class="section-icon">01</span>
                <h3>Vínculo institucional</h3>
              </div>

              <div class="institutional-card">
                <div class="institutional-title">
                  <strong>{{ rotuloBolsa(vinculoSelecionado.tipoBolsa) }}</strong>
                  <span class="link-state" :class="{ 'link-state--closed': vinculoSelecionado.situacao === 'FINALIZADO' }">
                    {{ rotuloSituacao(vinculoSelecionado.situacao) }}
                  </span>
                </div>

                <div class="institutional-period">
                  <span>{{ formatarData(vinculoSelecionado.dataInicio) }}</span>
                  <span>→</span>
                  <span>{{ formatarData(fimExibicao(vinculoSelecionado)) }}</span>
                </div>

                <p>
                  Referência:
                  <strong>{{ vinculoSelecionado.referenciaInstitucional || 'não informada' }}</strong>
                </p>
              </div>
            </section>

            <section class="drawer-section compact-section">
              <div class="section-heading">
                <span class="section-icon">02</span>
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
                <span class="section-icon">03</span>
                <h3>Orientador</h3>
              </div>

              <p class="single-value">{{ vinculoSelecionado.orientadorNome || 'Não informado' }}</p>
            </section>

            <section class="drawer-section compact-section">
              <div class="section-heading">
                <span class="section-icon">04</span>
                <h3>Segurança</h3>
              </div>

              <div
                class="training-card"
                :class="{ 'training-card--pending': !vinculoSelecionado.treinamentoSegurancaConcluido }"
              >
                <span class="training-check">{{ vinculoSelecionado.treinamentoSegurancaConcluido ? '✓' : '!' }}</span>
                <div>
                  <strong>
                    {{ vinculoSelecionado.treinamentoSegurancaConcluido ? 'Treinamento concluído' : 'Treinamento pendente' }}
                  </strong>
                  <small>
                    {{ vinculoSelecionado.treinamentoSegurancaConcluido ? 'Conclusão registrada no vínculo' : 'Aguardando registro de conclusão' }}
                  </small>
                </div>
              </div>
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
                      <dd>
                        {{ participacao.culturas?.length
                          ? participacao.culturas.map((cultura) => cultura.nome).join(', ')
                          : 'Nenhuma cultura associada' }}
                      </dd>
                    </div>
                  </dl>

                  <div class="participation-period">
                    {{ formatarData(participacao.dataInicioParticipacao) }}
                    <span>→</span>
                    {{ participacao.dataFimParticipacao ? formatarData(participacao.dataFimParticipacao) : 'atual' }}
                  </div>
                </article>
              </div>
            </section>

            <section v-if="selecionado.vinculos.length > 0" class="drawer-section">
              <div class="section-heading">
                <span class="section-icon">06</span>
                <h3>Histórico de vínculos</h3>
              </div>

              <div class="timeline">
                <article v-for="vinculo in selecionado.vinculos" :key="vinculo.id" class="timeline-item">
                  <span class="timeline-dot" :class="{ 'timeline-dot--closed': vinculo.situacao === 'FINALIZADO' }" />
                  <div>
                    <strong>{{ rotuloBolsa(vinculo.tipoBolsa) }}</strong>
                    <small>{{ formatarData(vinculo.dataInicio) }} → {{ formatarData(fimExibicao(vinculo)) }}</small>
                  </div>
                  <span class="link-state" :class="{ 'link-state--closed': vinculo.situacao === 'FINALIZADO' }">
                    {{ rotuloSituacao(vinculo.situacao) }}
                  </span>
                </article>
              </div>
            </section>

            <section v-if="vinculoSelecionado.observacao" class="drawer-section">
              <div class="section-heading">
                <span class="section-icon">07</span>
                <h3>Observação</h3>
              </div>
              <p class="observation">{{ vinculoSelecionado.observacao }}</p>
            </section>
          </template>

          <div v-else class="drawer-empty">
            Nenhum vínculo institucional foi encontrado para este Estagiário.
          </div>
        </div>
      </aside>
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
  font-size: 10px;
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
  font-size: 13px;
}

.primary-action,
.detail-action {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 7px;
  font: inherit;
  font-size: 11px;
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

.metric-card--success {
  border-color: #cfe7d8;
  background: linear-gradient(135deg, #f4fcf7, #fff);
}

.metric-card--success::before {
  background: #1aa35b;
}

.metric-card--warning {
  border-color: #eddcb1;
  background: linear-gradient(135deg, #fffaf0, #fff);
}

.metric-card--warning::before {
  background: #e3a008;
}

.metric-card--info {
  border-color: #cedff5;
  background: linear-gradient(135deg, #f4f8ff, #fff);
}

.metric-card--info::before {
  background: #2474d9;
}

.metric-card span {
  display: block;
  padding-left: 19px;
  color: #55657a;
  font-size: 11px;
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
  font-size: 10px;
}

.feedback {
  margin-bottom: 16px;
  padding: 13px 15px;
  border-radius: 8px;
  font-size: 12px;
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
  font-size: 9px;
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
  font-size: 12px;
}

.filter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-top: 1px solid #edf1f5;
  border-bottom: 1px solid #edf1f5;
  color: #6c7a8d;
  font-size: 11px;
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
  font-size: 9px;
  text-align: left;
  text-transform: uppercase;
}

td {
  padding: 15px;
  border-top: 1px solid #edf1f5;
  color: #37475e;
  font-size: 11px;
  vertical-align: middle;
}

tbody tr {
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
  font-size: 12px;
}

.student-course {
  color: #64748a;
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
  font-size: 9px;
  font-weight: 800;
}

.link-state--closed {
  background: #edf0f4;
  color: #667386;
}

.context-preview {
  display: grid;
  gap: 4px;
}

.context-preview span {
  position: relative;
  padding-left: 15px;
  color: #34465e;
  font-size: 10px;
}

.context-preview span::before {
  position: absolute;
  top: 5px;
  left: 1px;
  width: 6px;
  height: 6px;
  border: 1px solid #5f7188;
  border-radius: 2px;
  content: '';
}

.context-empty {
  display: inline-flex;
  padding: 6px 9px;
  border-radius: 999px;
  background: #fff7e6;
  color: #9a6900;
  font-size: 9px;
  font-weight: 750;
}

.history-preview {
  color: #637287;
  font-size: 10px;
  font-weight: 700;
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
  font-size: 9px;
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
  width: min(640px, 96vw);
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
  padding: 24px;
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
  font-size: 11px;
}

.drawer-header > button {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  background: #f1f4f8;
  color: #34445a;
  font-size: 22px;
  cursor: pointer;
}

.detail-content {
  display: grid;
  gap: 0;
  padding: 0 24px 30px;
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
  font-size: 11px;
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
  font-size: 14px;
}

.institutional-period {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  color: #43566f;
  font-size: 11px;
}

.institutional-card p {
  margin: 10px 0 0;
  color: #728095;
  font-size: 10px;
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
  font-size: 8px;
  font-weight: 850;
  text-transform: uppercase;
}

.detail-grid strong {
  display: block;
  margin-top: 5px;
  color: #2a3b52;
  font-size: 11px;
}

.single-value {
  margin: 0;
  color: #2a3b52;
  font-size: 12px;
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
  font-size: 11px;
}

.training-card--pending strong {
  color: #8c6508;
}

.training-card small {
  margin-top: 3px;
  color: #6f7e8f;
  font-size: 9px;
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
  font-size: 11px;
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
  font-size: 9px;
}

.participation-card dd {
  margin: 0;
  color: #43546b;
  font-size: 9px;
}

.participation-period {
  display: flex;
  gap: 6px;
  margin: 11px 0 0 17px;
  color: #7b889b;
  font-size: 8px;
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
  font-size: 10px;
}

.timeline-item small {
  margin-top: 3px;
  color: #8390a2;
  font-size: 8px;
}

.observation {
  margin: 0;
  padding: 13px 14px;
  border-radius: 8px;
  background: #f7f9fc;
  color: #526278;
  font-size: 10px;
  line-height: 1.5;
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
  .detail-grid {
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
</style>
