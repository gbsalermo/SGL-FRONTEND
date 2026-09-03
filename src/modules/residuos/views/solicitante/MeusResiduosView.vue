<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { residuoService } from '@/modules/residuos/services/residuoService'
import type { ApiErrorResponse, ResiduoResponse, StatusResiduo } from '@/modules/residuos/types/residuo'
import { useSessionStore } from '@/stores/session'

type FiltroStatusResiduo = StatusResiduo | 'TODOS' | 'ATIVOS'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const residuos = ref<ResiduoResponse[]>([])
const carregando = ref(false)
const erro = ref('')
const busca = ref('')
const statusFiltro = ref<FiltroStatusResiduo>('TODOS')
const selecionado = ref<ResiduoResponse | null>(null)

const residuoAlvo = computed(() => typeof route.query.residuo === 'string' ? route.query.residuo : '')

const statusOpcoes: Array<{ valor: FiltroStatusResiduo; rotulo: string }> = [
  { valor: 'TODOS', rotulo: 'Todos' },
  { valor: 'ATIVOS', rotulo: 'Em andamento' },
  { valor: 'INFORMADO', rotulo: 'Informados' },
  { valor: 'EM_ANALISE', rotulo: 'Em análise' },
  { valor: 'LIBERADO_PARA_ARMAZENAMENTO', rotulo: 'Liberados' },
  { valor: 'ARMAZENADO_TEMPORARIAMENTE', rotulo: 'Armazenados' },
  { valor: 'DESPACHADO', rotulo: 'Despachados' },
]

const residuosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return residuos.value.filter((residuo) => {
    const statusOk = statusFiltro.value === 'TODOS'
      || (statusFiltro.value === 'ATIVOS' && residuo.status !== 'DESPACHADO')
      || residuo.status === statusFiltro.value
    const buscaOk = !termo || [
      residuo.descricao,
      residuo.processoOrigem,
      residuo.projetoNome ?? '',
      residuo.codigoRastreio ?? '',
    ].some((valor) => valor.toLowerCase().includes(termo))
    return statusOk && buscaOk
  })
})

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? 'Não foi possível carregar seus resíduos.'
  }
  return error instanceof Error ? error.message : 'Não foi possível carregar seus resíduos.'
}

function statusRotulo(status: StatusResiduo) {
  const mapa: Record<StatusResiduo, string> = {
    INFORMADO: 'Informado',
    EM_ANALISE: 'Em análise',
    LIBERADO_PARA_ARMAZENAMENTO: 'Liberado',
    ARMAZENADO_TEMPORARIAMENTE: 'Armazenado',
    DESPACHADO: 'Despachado',
  }
  return mapa[status]
}

function formatarData(valor: string | null) {
  if (!valor) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor))
}

function formatarRisco(valor: string) {
  return valor
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, (letra) => letra.toUpperCase())
}

function aplicarStatusDaRota() {
  const valor = typeof route.query.status === 'string' ? route.query.status.toUpperCase() : ''
  const validos: FiltroStatusResiduo[] = [
    'TODOS',
    'ATIVOS',
    'INFORMADO',
    'EM_ANALISE',
    'LIBERADO_PARA_ARMAZENAMENTO',
    'ARMAZENADO_TEMPORARIAMENTE',
    'DESPACHADO',
  ]
  statusFiltro.value = validos.includes(valor as FiltroStatusResiduo) ? valor as FiltroStatusResiduo : 'TODOS'
}

function abrirResiduoDaRota() {
  if (!residuoAlvo.value || residuos.value.length === 0) return
  const residuo = residuos.value.find((item) => item.id === residuoAlvo.value)
  if (!residuo) return

  selecionado.value = residuo
  requestAnimationFrame(() => {
    document.getElementById(`residuo-${residuo.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

async function carregar() {
  const usuarioId = session.usuario?.id
  if (!usuarioId) {
    erro.value = 'Sessão sem usuário válido.'
    return
  }

  carregando.value = true
  erro.value = ''
  try {
    residuos.value = await residuoService.listarPorGerador(usuarioId)
    aplicarStatusDaRota()
    abrirResiduoDaRota()
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregando.value = false
  }
}

watch([() => route.query.status, () => route.query.residuo], () => {
  aplicarStatusDaRota()
  if (!carregando.value) abrirResiduoDaRota()
})

onMounted(carregar)
</script>

<template>
  <section class="meus-residuos-page">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">RESÍDUOS / MEUS RESÍDUOS</p>
        <h1>Meus resíduos</h1>
        <p>Acompanhe os materiais informados pelo seu laboratório até a destinação final.</p>
      </div>
      <button class="primary-action" type="button" @click="router.push('/residuos/novo')">+ Informar resíduo</button>
    </header>

    <div class="summary-grid">
      <article>
        <span>Total informado</span>
        <strong>{{ residuos.length }}</strong>
      </article>
      <article>
        <span>Aguardando Gestão</span>
        <strong>{{ residuos.filter((item) => item.status === 'INFORMADO').length }}</strong>
      </article>
      <article>
        <span>Em análise</span>
        <strong>{{ residuos.filter((item) => item.status === 'EM_ANALISE').length }}</strong>
      </article>
      <article>
        <span>Concluídos</span>
        <strong>{{ residuos.filter((item) => item.status === 'DESPACHADO').length }}</strong>
      </article>
    </div>

    <section class="list-surface">
      <div class="toolbar">
        <label class="search-field">
          <span>Buscar</span>
          <input v-model="busca" type="search" placeholder="Descrição, processo, projeto ou código..." />
        </label>
        <label class="filter-field">
          <span>Status</span>
          <select v-model="statusFiltro">
            <option v-for="opcao in statusOpcoes" :key="opcao.valor" :value="opcao.valor">{{ opcao.rotulo }}</option>
          </select>
        </label>
        <button class="secondary-action" type="button" :disabled="carregando" @click="carregar">Atualizar</button>
      </div>

      <div v-if="erro" class="state-box state-box--error">{{ erro }}</div>
      <div v-else-if="carregando" class="state-box">Carregando seus resíduos...</div>
      <div v-else-if="residuosFiltrados.length === 0" class="empty-state">
        <strong>Nenhum resíduo encontrado</strong>
        <p>{{ residuos.length === 0 ? 'Quando você informar um resíduo, ele aparecerá aqui.' : 'Tente alterar os filtros da consulta.' }}</p>
      </div>

      <div v-else class="cards-list">
        <button
          v-for="residuo in residuosFiltrados"
          :id="`residuo-${residuo.id}`"
          :key="residuo.id"
          class="residuo-card"
          :class="{ 'residuo-card--target': residuoAlvo === residuo.id }"
          type="button"
          @click="selecionado = residuo"
        >
          <div class="card-main">
            <div class="card-topline">
              <span class="status-pill" :data-status="residuo.status">{{ statusRotulo(residuo.status) }}</span>
              <small>{{ formatarData(residuo.dataInformacao) }}</small>
            </div>
            <h2>{{ residuo.descricao }}</h2>
            <p>{{ residuo.processoOrigem }}</p>
            <div class="card-meta">
              <span><b>{{ residuo.quantidade }}</b> {{ residuo.unidadeMedida }}</span>
              <span>{{ residuo.componentes.length }} componente(s)</span>
              <span>Risco informado: <b>{{ formatarRisco(residuo.nivelRiscoInformado) }}</b></span>
            </div>
          </div>
          <div class="card-side">
            <span>Código SGL</span>
            <strong>{{ residuo.codigoRastreio ?? 'Aguardando liberação' }}</strong>
            <small>{{ residuo.projetoNome ?? 'Sem projeto vinculado' }}</small>
            <span class="details-link">Ver detalhes →</span>
          </div>
        </button>
      </div>
    </section>

    <div v-if="selecionado" class="drawer-backdrop" @click.self="selecionado = null">
      <aside class="detail-drawer" aria-label="Detalhes do resíduo">
        <header>
          <div>
            <span class="status-pill" :data-status="selecionado.status">{{ statusRotulo(selecionado.status) }}</span>
            <h2>{{ selecionado.descricao }}</h2>
            <p>{{ selecionado.codigoRastreio ?? selecionado.id }}</p>
          </div>
          <button type="button" aria-label="Fechar" @click="selecionado = null">×</button>
        </header>

        <div class="detail-content">
          <section>
            <h3>Origem</h3>
            <dl>
              <div><dt>Laboratório</dt><dd>{{ selecionado.laboratorioNome }}</dd></div>
              <div><dt>Projeto</dt><dd>{{ selecionado.projetoNome ?? 'Sem projeto' }}</dd></div>
              <div><dt>Processo</dt><dd>{{ selecionado.processoOrigem }}</dd></div>
              <div><dt>Recipiente</dt><dd>{{ selecionado.recipiente }}</dd></div>
              <div><dt>Quantidade</dt><dd>{{ selecionado.quantidade }} {{ selecionado.unidadeMedida }}</dd></div>
            </dl>
          </section>

          <section>
            <h3>Composição</h3>
            <article v-for="componente in selecionado.componentes" :key="componente.id" class="component-row">
              <div>
                <strong>{{ componente.nomeComponente }}</strong>
                <small v-if="componente.produtoNomeCatalogo">Produto do catálogo · {{ componente.produtoNomeCatalogo }}</small>
                <small v-else>Componente informado livremente</small>
              </div>
              <span v-if="componente.principal">Principal</span>
              <p v-if="componente.concentracaoOuQuantidade">{{ componente.concentracaoOuQuantidade }}</p>
            </article>
          </section>

          <section class="risk-comparison">
            <div>
              <h3>Declaração do laboratório</h3>
              <strong>{{ formatarRisco(selecionado.nivelRiscoInformado) }}</strong>
              <p>{{ selecionado.riscosInformados.map(formatarRisco).join(' · ') || 'Nenhum risco específico' }}</p>
              <small>{{ selecionado.observacaoGerador ?? 'Sem observação.' }}</small>
            </div>
            <div :class="{ muted: !selecionado.nivelRiscoConfirmado }">
              <h3>Classificação da Gestão</h3>
              <strong>{{ selecionado.nivelRiscoConfirmado ? formatarRisco(selecionado.nivelRiscoConfirmado) : 'Aguardando análise' }}</strong>
              <p>{{ selecionado.riscosConfirmados.length ? selecionado.riscosConfirmados.map(formatarRisco).join(' · ') : 'Ainda não confirmada.' }}</p>
              <small>{{ selecionado.observacaoGestor ?? 'A declaração original permanece preservada.' }}</small>
            </div>
          </section>

          <section>
            <h3>Andamento</h3>
            <dl>
              <div><dt>Informado</dt><dd>{{ formatarData(selecionado.dataInformacao) }}</dd></div>
              <div><dt>Recebido</dt><dd>{{ formatarData(selecionado.dataRecebimento) }}</dd></div>
              <div><dt>Liberado</dt><dd>{{ formatarData(selecionado.dataLiberacao) }}</dd></div>
              <div><dt>Armazenado</dt><dd>{{ formatarData(selecionado.dataArmazenamentoTemporario) }}</dd></div>
              <div><dt>Despachado</dt><dd>{{ formatarData(selecionado.dataDespacho) }}</dd></div>
            </dl>
          </section>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.meus-residuos-page { max-width: 1180px; margin: 0 auto; color: #0b1d3a; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
.breadcrumb { margin: 0 0 12px; color: #1d4bb7; font-size: 11px; font-weight: 800; letter-spacing: .08em; }
.page-heading h1 { margin: 0; font-size: clamp(28px, 3vw, 38px); letter-spacing: -.03em; }
.page-heading > div > p:last-child { margin: 12px 0 0; color: #5e7190; font-size: 13px; }
.primary-action, .secondary-action { min-height: 42px; padding: 0 16px; border-radius: 8px; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }
.primary-action { border: 0; background: #1748a6; color: #fff; }
.secondary-action { border: 1px solid #cbd5e1; background: #fff; color: #253550; }
.secondary-action:disabled { opacity: .55; cursor: default; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.summary-grid article { padding: 16px 18px; border: 1px solid #dfe6ef; border-radius: 10px; background: #fff; }
.summary-grid span { display: block; color: #6b7c97; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.summary-grid strong { display: block; margin-top: 6px; font-size: 24px; }
.list-surface { border: 1px solid #dde5ef; border-radius: 12px; background: #fff; box-shadow: 0 12px 36px rgb(19 47 91 / 5%); }
.toolbar { display: grid; grid-template-columns: minmax(240px, 1fr) 220px auto; gap: 12px; align-items: end; padding: 18px; border-bottom: 1px solid #e6ebf2; }
.search-field, .filter-field { display: flex; flex-direction: column; gap: 6px; }
.search-field span, .filter-field span { color: #45566f; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.search-field input, .filter-field select { min-height: 42px; padding: 0 12px; border: 1px solid #cfd8e6; border-radius: 7px; background: #fff; color: #17233b; font: inherit; font-size: 12px; outline: 0; }
.search-field input:focus, .filter-field select:focus { border-color: #2456c4; box-shadow: 0 0 0 3px rgb(36 86 196 / 8%); }
.state-box, .empty-state { margin: 18px; padding: 28px; border-radius: 9px; background: #f7f9fc; color: #60708a; text-align: center; }
.state-box--error { border: 1px solid #fecaca; background: #fff7f7; color: #a62121; }
.empty-state strong { display: block; color: #263750; }
.empty-state p { margin: 6px 0 0; font-size: 12px; }
.cards-list { padding: 8px 18px 18px; }
.residuo-card { width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) 220px; gap: 22px; padding: 18px 2px; border: 0; border-bottom: 1px solid #e7ecf3; background: transparent; color: inherit; text-align: left; cursor: pointer; transition: background 160ms ease, box-shadow 160ms ease; }
.residuo-card:last-child { border-bottom: 0; }
.residuo-card:hover { background: linear-gradient(90deg, rgb(35 82 176 / 3%), transparent); }
.residuo-card--target { background: #eef5ff !important; box-shadow: inset 4px 0 0 #2d6bc4; }
.card-topline { display: flex; align-items: center; gap: 12px; }
.card-topline small { color: #7c8ba0; font-size: 10px; }
.status-pill { display: inline-flex; align-items: center; min-height: 24px; padding: 0 9px; border-radius: 999px; background: #eef2f7; color: #52647d; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: .04em; }
.status-pill[data-status='INFORMADO'] { background: #eef3ff; color: #2451ad; }
.status-pill[data-status='EM_ANALISE'] { background: #fff7db; color: #8a6200; }
.status-pill[data-status='LIBERADO_PARA_ARMAZENAMENTO'] { background: #e8f7ee; color: #16743a; }
.status-pill[data-status='ARMAZENADO_TEMPORARIAMENTE'] { background: #e9f7f7; color: #126d73; }
.status-pill[data-status='DESPACHADO'] { background: #eef1f5; color: #48576d; }
.card-main h2 { margin: 10px 0 5px; font-size: 16px; }
.card-main > p { margin: 0; color: #63738c; font-size: 12px; }
.card-meta { display: flex; flex-wrap: wrap; gap: 7px 16px; margin-top: 13px; color: #596b85; font-size: 10px; }
.card-side { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; text-align: right; }
.card-side > span:first-child { color: #8491a5; font-size: 9px; font-weight: 800; text-transform: uppercase; }
.card-side strong { margin-top: 4px; font-size: 11px; }
.card-side small { margin-top: 7px; color: #7b899c; font-size: 10px; }
.details-link { margin-top: 12px; color: #2254bc; font-size: 10px; font-weight: 800; }
.drawer-backdrop { position: fixed; inset: 0; z-index: 90; background: rgb(4 15 35 / 42%); }
.detail-drawer { position: absolute; inset: 0 0 0 auto; width: min(100%, 620px); height: 100%; overflow-y: auto; background: #fff; box-shadow: -20px 0 60px rgb(7 25 54 / 18%); }
.detail-drawer > header { display: flex; justify-content: space-between; gap: 20px; padding: 24px 26px; border-bottom: 1px solid #e4eaf1; }
.detail-drawer h2 { margin: 10px 0 4px; font-size: 21px; }
.detail-drawer header p { margin: 0; color: #7c899b; font-size: 10px; }
.detail-drawer header button { width: 36px; height: 36px; border: 0; border-radius: 50%; background: #f2f5f8; color: #26364d; font-size: 22px; cursor: pointer; }
.detail-content { padding: 24px 26px 36px; }
.detail-content section + section { margin-top: 24px; padding-top: 22px; border-top: 1px solid #e9edf3; }
.detail-content h3 { margin: 0 0 12px; color: #263750; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
dl { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; }
dl div { padding: 10px 12px; border-radius: 7px; background: #f7f9fc; }
dt { color: #8290a4; font-size: 9px; font-weight: 800; text-transform: uppercase; }
dd { margin: 5px 0 0; color: #1d2d45; font-size: 11px; font-weight: 700; }
.component-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 12px; padding: 12px; border: 1px solid #e3e9f1; border-radius: 8px; }
.component-row + .component-row { margin-top: 8px; }
.component-row div { display: flex; flex-direction: column; gap: 3px; }
.component-row strong { font-size: 12px; }
.component-row small { color: #728198; font-size: 9px; }
.component-row > span { align-self: start; padding: 3px 7px; border-radius: 999px; background: #e9f0ff; color: #2254b7; font-size: 8px; font-weight: 800; text-transform: uppercase; }
.component-row p { grid-column: 1 / -1; margin: 2px 0 0; color: #60708a; font-size: 10px; }
.risk-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.risk-comparison > div { padding: 15px; border: 1px solid #dfe6ef; border-radius: 9px; background: #fbfcfe; }
.risk-comparison > div:last-child { border-color: #cfe1d5; background: #f6fbf8; }
.risk-comparison .muted { border-color: #e1e6ed !important; background: #f8fafc !important; opacity: .75; }
.risk-comparison strong { font-size: 15px; }
.risk-comparison p { margin: 7px 0; color: #4f6078; font-size: 10px; }
.risk-comparison small { color: #748298; font-size: 9px; }
@media (max-width: 800px) {
  .page-heading { align-items: flex-start; flex-direction: column; }
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .toolbar { grid-template-columns: 1fr; }
  .residuo-card { grid-template-columns: 1fr; }
  .card-side { align-items: flex-start; text-align: left; }
  .risk-comparison { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .summary-grid, dl { grid-template-columns: 1fr; }
}
</style>
