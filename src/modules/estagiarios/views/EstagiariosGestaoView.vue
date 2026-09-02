<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

import { estagiarioService } from '@/modules/estagiarios/services/estagiarioService'
import type {
  ApiErrorResponse,
  EstagiarioResponse,
  TipoBolsaEstagiario,
} from '@/modules/estagiarios/types/estagiario'

type FiltroStatus = 'TODOS' | 'ATIVOS' | 'ENCERRADOS'

const estagiarios = ref<EstagiarioResponse[]>([])
const carregando = ref(false)
const erro = ref('')
const busca = ref('')
const filtroStatus = ref<FiltroStatus>('TODOS')
const laboratorioId = ref('TODOS')
const tipoBolsa = ref<TipoBolsaEstagiario | 'TODOS'>('TODOS')
const selecionado = ref<EstagiarioResponse | null>(null)

const tiposBolsa: Array<{ valor: TipoBolsaEstagiario; rotulo: string }> = [
  { valor: 'BOLSA_CNPQ', rotulo: 'Bolsa CNPq' },
  { valor: 'BOLSA_CAPES', rotulo: 'Bolsa CAPES' },
  { valor: 'BOLSA_INSTITUCIONAL', rotulo: 'Bolsa institucional' },
  { valor: 'VOLUNTARIO', rotulo: 'Voluntário' },
]

const laboratorios = computed(() => {
  const mapa = new Map<string, string>()
  estagiarios.value.forEach((estagiario) => {
    if (estagiario.laboratorioId && estagiario.laboratorioNome) {
      mapa.set(estagiario.laboratorioId, estagiario.laboratorioNome)
    }
  })
  return [...mapa.entries()]
    .map(([id, nome]) => ({ id, nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
})

const ativos = computed(() => estagiarios.value.filter((item) => item.ativo))
const encerrados = computed(() => estagiarios.value.filter((item) => !item.ativo))

const encerramEmBreve = computed(() => {
  const hoje = inicioDoDia(new Date())
  const limite = new Date(hoje)
  limite.setDate(limite.getDate() + 30)

  return ativos.value.filter((item) => {
    if (!item.dataFimEstagio) return false
    const fim = dataLocal(item.dataFimEstagio)
    return fim >= hoje && fim <= limite
  }).length
})

const semDataFim = computed(() => ativos.value.filter((item) => !item.dataFimEstagio).length)

const estagiariosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')

  return estagiarios.value.filter((item) => {
    const statusOk = filtroStatus.value === 'TODOS'
      || (filtroStatus.value === 'ATIVOS' && item.ativo)
      || (filtroStatus.value === 'ENCERRADOS' && !item.ativo)
    const laboratorioOk = laboratorioId.value === 'TODOS' || item.laboratorioId === laboratorioId.value
    const bolsaOk = tipoBolsa.value === 'TODOS' || item.tipoBolsa === tipoBolsa.value
    const buscaOk = !termo || [
      item.usuarioNome,
      item.laboratorioNome ?? '',
      rotuloBolsa(item.tipoBolsa),
      item.observacao ?? '',
    ].some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))

    return statusOk && laboratorioOk && bolsaOk && buscaOk
  })
})

function inicioDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

function dataLocal(valor: string) {
  const [ano, mes, dia] = valor.split('-').map(Number)
  return new Date(ano, (mes ?? 1) - 1, dia ?? 1)
}

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? 'Não foi possível carregar os estagiários.'
  }
  return error instanceof Error ? error.message : 'Não foi possível carregar os estagiários.'
}

function rotuloBolsa(valor: TipoBolsaEstagiario) {
  return tiposBolsa.find((tipo) => tipo.valor === valor)?.rotulo ?? valor
}

function formatarData(valor: string | null) {
  if (!valor) return 'Sem data definida'
  return new Intl.DateTimeFormat('pt-BR').format(dataLocal(valor))
}

function periodo(estagiario: EstagiarioResponse) {
  return `${formatarData(estagiario.dataInicioEstagio)} — ${estagiario.dataFimEstagio ? formatarData(estagiario.dataFimEstagio) : 'em andamento'}`
}

function situacaoPeriodo(estagiario: EstagiarioResponse) {
  if (!estagiario.ativo) return 'Estágio encerrado'
  if (!estagiario.dataFimEstagio) return 'Ativo · sem data final definida'

  const hoje = inicioDoDia(new Date())
  const fim = dataLocal(estagiario.dataFimEstagio)
  const dias = Math.ceil((fim.getTime() - hoje.getTime()) / 86_400_000)

  if (dias < 0) return `Data final vencida há ${Math.abs(dias)} dia(s)`
  if (dias === 0) return 'Término previsto para hoje'
  if (dias <= 30) return `Término em ${dias} dia(s)`
  return `Ativo · ${dias} dia(s) até o término previsto`
}

function abrirDetalhes(estagiario: EstagiarioResponse) {
  selecionado.value = estagiario
}

function fecharDetalhes() {
  selecionado.value = null
}

function limparFiltros() {
  busca.value = ''
  filtroStatus.value = 'TODOS'
  laboratorioId.value = 'TODOS'
  tipoBolsa.value = 'TODOS'
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
        <p>Acompanhe vínculos, laboratórios, bolsas e períodos de estágio cadastrados no SGL.</p>
      </div>
      <button class="secondary-action" type="button" :disabled="carregando" @click="carregar">
        {{ carregando ? 'Atualizando...' : 'Atualizar dados' }}
      </button>
    </header>

    <section class="metrics-grid">
      <article>
        <span>Ativos</span>
        <strong>{{ ativos.length }}</strong>
        <small>vínculos em andamento</small>
      </article>
      <article>
        <span>Encerrados</span>
        <strong>{{ encerrados.length }}</strong>
        <small>histórico preservado</small>
      </article>
      <article :class="{ warning: encerramEmBreve > 0 }">
        <span>Encerram em até 30 dias</span>
        <strong>{{ encerramEmBreve }}</strong>
        <small>exigem acompanhamento</small>
      </article>
      <article>
        <span>Sem data final</span>
        <strong>{{ semDataFim }}</strong>
        <small>estágios ativos sem previsão de término</small>
      </article>
    </section>

    <div v-if="erro" class="feedback feedback--error">{{ erro }}</div>

    <section class="workspace-card">
      <div class="filters-grid">
        <label class="field field--search">
          <span>Busca</span>
          <input v-model="busca" type="search" placeholder="Nome, laboratório, bolsa ou observação..." />
        </label>

        <label class="field">
          <span>Status</span>
          <select v-model="filtroStatus">
            <option value="TODOS">Todos</option>
            <option value="ATIVOS">Ativos</option>
            <option value="ENCERRADOS">Encerrados</option>
          </select>
        </label>

        <label class="field">
          <span>Laboratório</span>
          <select v-model="laboratorioId">
            <option value="TODOS">Todos os laboratórios</option>
            <option v-for="laboratorio in laboratorios" :key="laboratorio.id" :value="laboratorio.id">
              {{ laboratorio.nome }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>Tipo de bolsa</span>
          <select v-model="tipoBolsa">
            <option value="TODOS">Todos os tipos</option>
            <option v-for="tipo in tiposBolsa" :key="tipo.valor" :value="tipo.valor">{{ tipo.rotulo }}</option>
          </select>
        </label>
      </div>

      <div class="filter-summary">
        <div><strong>{{ estagiariosFiltrados.length }}</strong><span>registro(s) exibido(s)</span></div>
        <button v-if="busca || filtroStatus !== 'TODOS' || laboratorioId !== 'TODOS' || tipoBolsa !== 'TODOS'" type="button" @click="limparFiltros">
          Limpar filtros
        </button>
      </div>

      <div v-if="carregando" class="state-box">Carregando estagiários...</div>
      <div v-else-if="estagiarios.length === 0" class="state-box">Nenhum estagiário cadastrado no sistema.</div>
      <div v-else-if="estagiariosFiltrados.length === 0" class="state-box">Nenhum estagiário encontrado para os filtros atuais.</div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Estagiário</th>
              <th>Laboratório</th>
              <th>Bolsa</th>
              <th>Período</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="estagiario in estagiariosFiltrados" :key="estagiario.id" @click="abrirDetalhes(estagiario)">
              <td>
                <span class="status-pill" :class="estagiario.ativo ? 'status-pill--active' : 'status-pill--closed'">
                  {{ estagiario.ativo ? 'ATIVO' : 'ENCERRADO' }}
                </span>
              </td>
              <td>
                <strong>{{ estagiario.usuarioNome }}</strong>
                <small>{{ situacaoPeriodo(estagiario) }}</small>
              </td>
              <td>{{ estagiario.laboratorioNome ?? 'Sem laboratório' }}</td>
              <td>{{ rotuloBolsa(estagiario.tipoBolsa) }}</td>
              <td>
                <strong>{{ formatarData(estagiario.dataInicioEstagio) }}</strong>
                <small>{{ estagiario.dataFimEstagio ? `até ${formatarData(estagiario.dataFimEstagio)}` : 'sem data final' }}</small>
              </td>
              <td class="actions-column" @click.stop>
                <button class="detail-action" type="button" @click="abrirDetalhes(estagiario)">Detalhes</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="selecionado" class="drawer-backdrop" @click.self="fecharDetalhes">
      <aside class="detail-drawer" role="dialog" aria-modal="true" aria-label="Detalhes do estagiário">
        <header>
          <div>
            <span class="status-pill" :class="selecionado.ativo ? 'status-pill--active' : 'status-pill--closed'">
              {{ selecionado.ativo ? 'ATIVO' : 'ENCERRADO' }}
            </span>
            <h2>{{ selecionado.usuarioNome }}</h2>
            <p>{{ selecionado.laboratorioNome ?? 'Sem laboratório vinculado' }}</p>
          </div>
          <button type="button" aria-label="Fechar detalhes" @click="fecharDetalhes">×</button>
        </header>

        <div class="detail-content">
          <section class="detail-grid">
            <article><span>Tipo de bolsa</span><strong>{{ rotuloBolsa(selecionado.tipoBolsa) }}</strong></article>
            <article><span>Situação</span><strong>{{ situacaoPeriodo(selecionado) }}</strong></article>
            <article><span>Início</span><strong>{{ formatarData(selecionado.dataInicioEstagio) }}</strong></article>
            <article><span>Fim</span><strong>{{ formatarData(selecionado.dataFimEstagio) }}</strong></article>
          </section>

          <section class="period-card">
            <span>PERÍODO DO ESTÁGIO</span>
            <strong>{{ periodo(selecionado) }}</strong>
            <p>{{ situacaoPeriodo(selecionado) }}</p>
          </section>

          <section>
            <h3>Vínculo</h3>
            <div class="link-card">
              <div><span>Laboratório</span><strong>{{ selecionado.laboratorioNome ?? 'Não informado' }}</strong></div>
              <div><span>Identificador do usuário</span><code>{{ selecionado.usuarioId }}</code></div>
            </div>
          </section>

          <section>
            <h3>Observação</h3>
            <p class="observation">{{ selecionado.observacao || 'Nenhuma observação registrada para este vínculo.' }}</p>
          </section>

          <div class="next-stage-note">
            Cadastro, edição e encerramento serão ativados no próximo bloco da etapa após a validação desta listagem.
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.intern-page { max-width: 1500px; margin: 0 auto; color: #17243a; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
.breadcrumb { margin: 0 0 8px; color: #2456c4; font-size: 10px; font-weight: 900; letter-spacing: .08em; }
.page-heading h1 { margin: 0; color: #0a1c3b; font-size: 31px; line-height: 1.1; }
.page-heading p:not(.breadcrumb) { max-width: 780px; margin: 8px 0 0; color: #66758a; font-size: 13px; }
.secondary-action, .detail-action { min-height: 40px; padding: 0 14px; border: 1px solid #cfd9e7; border-radius: 7px; background: #fff; color: #24405f; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.secondary-action:hover, .detail-action:hover { border-color: #9eb3d2; background: #f8fbff; }
.secondary-action:disabled { opacity: .55; cursor: default; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.metrics-grid article { min-height: 116px; padding: 18px; border: 1px solid #dce4ef; border-radius: 10px; background: #fff; box-shadow: 0 6px 18px rgb(25 48 82 / 4%); }
.metrics-grid article.warning { border-color: #ecd6a3; background: #fffbf1; }
.metrics-grid span { display: block; color: #68778b; font-size: 10px; font-weight: 850; letter-spacing: .04em; text-transform: uppercase; }
.metrics-grid strong { display: block; margin-top: 10px; color: #0d2852; font-size: 28px; line-height: 1; }
.metrics-grid small { display: block; margin-top: 7px; color: #8390a2; font-size: 10px; }
.feedback { margin-bottom: 16px; padding: 13px 15px; border-radius: 8px; font-size: 12px; }
.feedback--error { border: 1px solid #efc7c7; background: #fff4f4; color: #9f2e2e; }
.workspace-card { overflow: hidden; border: 1px solid #dbe3ee; border-radius: 11px; background: #fff; box-shadow: 0 8px 24px rgb(25 48 82 / 5%); }
.filters-grid { display: grid; grid-template-columns: minmax(300px, 1.6fr) repeat(3, minmax(170px, .7fr)); gap: 12px; padding: 18px; border-bottom: 1px solid #e6ebf2; background: #fbfcfe; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field > span { color: #66758a; font-size: 9px; font-weight: 850; letter-spacing: .05em; text-transform: uppercase; }
.field input, .field select { width: 100%; height: 42px; padding: 0 12px; border: 1px solid #d4dde9; border-radius: 7px; background: #fff; color: #23354e; font: inherit; font-size: 12px; outline: none; }
.field input:focus, .field select:focus { border-color: #6589c8; box-shadow: 0 0 0 3px rgb(50 99 180 / 8%); }
.filter-summary { min-height: 52px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 18px; border-bottom: 1px solid #edf1f5; }
.filter-summary > div { display: flex; align-items: baseline; gap: 7px; }
.filter-summary strong { color: #153d7a; font-size: 17px; }
.filter-summary span { color: #7a8798; font-size: 10px; }
.filter-summary button { border: 0; background: transparent; color: #2456c4; font: inherit; font-size: 10px; font-weight: 800; cursor: pointer; }
.state-box { padding: 34px 20px; color: #708096; font-size: 12px; text-align: center; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 940px; }
th { padding: 12px 15px; border-bottom: 1px solid #e5eaf1; background: #f8fafd; color: #738197; font-size: 9px; font-weight: 900; letter-spacing: .06em; text-align: left; text-transform: uppercase; }
td { padding: 14px 15px; border-bottom: 1px solid #edf1f5; color: #37475e; font-size: 11px; vertical-align: middle; }
tbody tr { cursor: pointer; transition: background 120ms ease; }
tbody tr:hover { background: #f8fbff; }
td strong, td small { display: block; }
td strong { color: #243750; font-size: 12px; }
td small { margin-top: 4px; color: #8793a4; font-size: 9px; }
.actions-column { width: 105px; text-align: right; }
.status-pill { display: inline-flex; min-height: 24px; align-items: center; justify-content: center; padding: 0 9px; border-radius: 999px; font-size: 8px; font-weight: 900; letter-spacing: .05em; }
.status-pill--active { background: #e9f7ef; color: #267748; }
.status-pill--closed { background: #eef1f5; color: #657287; }
.drawer-backdrop { position: fixed; inset: 0; z-index: 70; display: flex; justify-content: flex-end; background: rgb(13 25 45 / 42%); backdrop-filter: blur(1.5px); }
.detail-drawer { width: min(720px, 94vw); height: 100vh; overflow-y: auto; background: #fff; box-shadow: -16px 0 42px rgb(11 27 54 / 18%); }
.detail-drawer > header { position: sticky; top: 0; z-index: 2; display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 24px 26px 20px; border-bottom: 1px solid #e2e8f0; background: #fff; }
.detail-drawer header h2 { margin: 10px 0 3px; color: #142845; font-size: 24px; }
.detail-drawer header p { margin: 0; color: #758397; font-size: 11px; }
.detail-drawer header > button { width: 38px; height: 38px; border: 0; border-radius: 50%; background: #f1f4f8; color: #526178; font-size: 22px; cursor: pointer; }
.detail-content { display: grid; gap: 22px; padding: 24px 26px 34px; }
.detail-content h3 { margin: 0 0 10px; color: #30435d; font-size: 11px; font-weight: 900; letter-spacing: .05em; text-transform: uppercase; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.detail-grid article, .link-card { padding: 14px; border: 1px solid #dfe6ef; border-radius: 8px; background: #fafcff; }
.detail-grid span, .link-card span, .period-card > span { display: block; color: #7b889a; font-size: 8px; font-weight: 850; letter-spacing: .05em; text-transform: uppercase; }
.detail-grid strong { display: block; margin-top: 5px; color: #293c56; font-size: 11px; line-height: 1.35; }
.period-card { padding: 17px; border: 1px solid #ccdaed; border-radius: 9px; background: #f4f8ff; }
.period-card strong { display: block; margin-top: 7px; color: #173e78; font-size: 14px; }
.period-card p { margin: 5px 0 0; color: #6c7b90; font-size: 10px; }
.link-card { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.link-card > div + div { border-left: 1px solid #e2e8f0; padding-left: 14px; }
.link-card strong, .link-card code { display: block; margin-top: 5px; color: #2d415c; font-size: 10px; overflow-wrap: anywhere; }
.observation { margin: 0; padding: 14px; border-radius: 8px; background: #f7f9fc; color: #5c6b80; font-size: 11px; line-height: 1.55; }
.next-stage-note { padding: 13px 15px; border: 1px dashed #c8d4e5; border-radius: 8px; background: #fbfcfe; color: #748296; font-size: 10px; line-height: 1.45; }
@media (max-width: 1100px) { .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .filters-grid { grid-template-columns: 1fr 1fr; } .field--search { grid-column: 1 / -1; } }
@media (max-width: 680px) { .page-heading { align-items: stretch; flex-direction: column; } .metrics-grid, .filters-grid, .detail-grid, .link-card { grid-template-columns: 1fr; } .field--search { grid-column: auto; } .link-card > div + div { border-left: 0; border-top: 1px solid #e2e8f0; padding: 12px 0 0; } }
</style>
