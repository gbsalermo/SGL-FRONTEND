<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { relatorioService } from '@/modules/relatorios/services/relatorioService'
import type {
  RelatorioResiduosFiltros,
  RelatorioResiduosResponse,
} from '@/modules/relatorios/types/residuoRelatorio'
import type { NivelRiscoResiduo, StatusResiduo } from '@/modules/residuos/types/residuo'
import { http } from '@/services/http'

interface LaboratorioResumo { id: string; nome: string }

const router = useRouter()
const resultado = ref<RelatorioResiduosResponse | null>(null)
const laboratorios = ref<LaboratorioResumo[]>([])
const carregando = ref(false)
const exportando = ref<'PDF' | 'XLSX' | null>(null)
const erro = ref('')

const status = ref<'' | StatusResiduo>('')
const laboratorioId = ref('')
const nivelRisco = ref<'' | NivelRiscoResiduo>('')
const dataInicio = ref('')
const dataFim = ref('')

function filtros(): RelatorioResiduosFiltros {
  return {
    status: status.value || undefined,
    laboratorioId: laboratorioId.value || undefined,
    nivelRisco: nivelRisco.value || undefined,
    dataInicio: dataInicio.value || undefined,
    dataFim: dataFim.value || undefined,
  }
}

function validarPeriodo() {
  if (dataInicio.value && dataFim.value && dataInicio.value > dataFim.value) {
    erro.value = 'A data inicial não pode ser posterior à data final.'
    return false
  }
  return true
}

async function visualizar() {
  erro.value = ''
  if (!validarPeriodo()) return
  carregando.value = true
  try {
    resultado.value = await relatorioService.listarResiduos(filtros())
  } catch (error) {
    console.error(error)
    erro.value = 'Não foi possível carregar o relatório de resíduos.'
  } finally {
    carregando.value = false
  }
}

function limpar() {
  status.value = ''
  laboratorioId.value = ''
  nivelRisco.value = ''
  dataInicio.value = ''
  dataFim.value = ''
  resultado.value = null
  erro.value = ''
}

async function exportar(formato: 'PDF' | 'XLSX') {
  erro.value = ''
  if (!validarPeriodo()) return
  exportando.value = formato
  try {
    const arquivo = await relatorioService.exportar('residuos', formato, filtros())
    const url = URL.createObjectURL(arquivo.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = arquivo.nomeArquivo
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    erro.value = `Não foi possível exportar o relatório em ${formato}.`
  } finally {
    exportando.value = null
  }
}

function statusRotulo(valor: StatusResiduo) {
  const mapa: Record<StatusResiduo, string> = {
    INFORMADO: 'A receber', EM_ANALISE: 'Em análise',
    LIBERADO_PARA_ARMAZENAMENTO: 'Liberado',
    ARMAZENADO_TEMPORARIAMENTE: 'Armazenado', DESPACHADO: 'Despachado',
  }
  return mapa[valor]
}

function formatarEnum(valor: string | null) {
  if (!valor) return '—'
  return valor.toLowerCase().replaceAll('_', ' ').replace(/^./, (l) => l.toUpperCase())
}

function formatarData(valor: string | null) {
  if (!valor) return '—'
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return valor
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(data)
}

function destino(item: RelatorioResiduosResponse['itens'][number]) {
  return item.destinoFinalConfirmado ?? item.destinoFinalPrevisto ?? '—'
}

function risco(item: RelatorioResiduosResponse['itens'][number]) {
  return item.nivelRiscoConfirmado ?? item.nivelRiscoInformado
}

onMounted(async () => {
  try {
    const { data } = await http.get<LaboratorioResumo[]>('/v1/laboratorios')
    laboratorios.value = data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  } catch {
    laboratorios.value = []
  }
})
</script>

<template>
  <section class="relatorio-residuos-page">
    <header class="page-header">
      <div>
        <p>RELATÓRIOS / RESÍDUOS</p>
        <h1>Relatório de resíduos</h1>
        <span>Geração, classificação, armazenamento, rastreabilidade e destinação final.</span>
      </div>
      <button class="btn btn--ghost" type="button" @click="router.push('/relatorios')">← Voltar aos relatórios</button>
    </header>

    <section class="filter-card">
      <div class="filters">
        <label><span>Status</span><select v-model="status"><option value="">Todos</option><option value="INFORMADO">A receber</option><option value="EM_ANALISE">Em análise</option><option value="LIBERADO_PARA_ARMAZENAMENTO">Liberados</option><option value="ARMAZENADO_TEMPORARIAMENTE">Armazenados</option><option value="DESPACHADO">Despachados</option></select></label>
        <label><span>Laboratório</span><select v-model="laboratorioId"><option value="">Todos</option><option v-for="lab in laboratorios" :key="lab.id" :value="lab.id">{{ lab.nome }}</option></select></label>
        <label><span>Nível de risco</span><select v-model="nivelRisco"><option value="">Todos</option><option value="NENHUM">Nenhum</option><option value="BAIXO">Baixo</option><option value="MEDIO">Médio</option><option value="ALTO">Alto</option></select></label>
        <label><span>Data inicial</span><input v-model="dataInicio" type="date" /></label>
        <label><span>Data final</span><input v-model="dataFim" type="date" /></label>
      </div>
      <div class="filter-actions">
        <button class="btn btn--ghost" type="button" @click="limpar">Limpar filtros</button>
        <button class="btn btn--primary" type="button" :disabled="carregando" @click="visualizar">{{ carregando ? 'Carregando...' : 'Visualizar relatório' }}</button>
      </div>
    </section>

    <div v-if="erro" class="feedback">{{ erro }}</div>

    <template v-if="resultado">
      <section class="summary-grid">
        <article><span>Total</span><strong>{{ resultado.total }}</strong></article>
        <article><span>A receber</span><strong>{{ resultado.informados }}</strong></article>
        <article><span>Em análise</span><strong>{{ resultado.emAnalise }}</strong></article>
        <article><span>Liberados</span><strong>{{ resultado.liberados }}</strong></article>
        <article><span>Armazenados</span><strong>{{ resultado.armazenados }}</strong></article>
        <article><span>Despachados</span><strong>{{ resultado.despachados }}</strong></article>
        <article><span>Alto risco</span><strong>{{ resultado.altoRisco }}</strong></article>
      </section>

      <section class="result-card">
        <header>
          <div><strong>Rastreabilidade dos resíduos</strong><span>Gerado em {{ formatarData(resultado.geradoEm) }}</span></div>
          <div class="export-actions">
            <button class="btn btn--pdf" type="button" :disabled="Boolean(exportando)" @click="exportar('PDF')">{{ exportando === 'PDF' ? 'Gerando...' : 'Exportar PDF' }}</button>
            <button class="btn btn--xlsx" type="button" :disabled="Boolean(exportando)" @click="exportar('XLSX')">{{ exportando === 'XLSX' ? 'Gerando...' : 'Exportar XLSX' }}</button>
          </div>
        </header>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Código</th><th>Resíduo</th><th>Origem</th><th>Status</th><th>Risco</th><th>Quantidade</th><th>Armazenamento</th><th>Destino</th><th>Informado em</th></tr></thead>
            <tbody>
              <tr v-for="item in resultado.itens" :key="item.id">
                <td><strong>{{ item.codigoRastreio ?? '—' }}</strong></td>
                <td><strong>{{ item.descricao }}</strong><small>{{ item.componentes.length }} componente(s)</small></td>
                <td><strong>{{ item.laboratorioNome }}</strong><small>{{ item.usuarioGeradorNome }}</small></td>
                <td><span class="status" :data-status="item.status">{{ statusRotulo(item.status) }}</span></td>
                <td><strong>{{ formatarEnum(risco(item)) }}</strong><small>{{ (item.riscosConfirmados.length ? item.riscosConfirmados : item.riscosInformados).map(formatarEnum).join(' · ') }}</small></td>
                <td>{{ item.quantidade }} {{ item.unidadeMedida }}</td>
                <td>{{ item.localArmazenamentoTemporario ?? '—' }}</td>
                <td>{{ destino(item) }}</td>
                <td>{{ formatarData(item.dataInformacao) }}</td>
              </tr>
              <tr v-if="resultado.itens.length === 0"><td colspan="9" class="empty">Nenhum resíduo encontrado para os filtros selecionados.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <section v-else class="empty-state">Selecione os filtros e clique em <strong>Visualizar relatório</strong>.</section>
  </section>
</template>

<style scoped>
.relatorio-residuos-page { max-width: 1500px; margin: 0 auto; color: #18263c; }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
.page-header p { margin: 0 0 9px; color: #2456c4; font-size: 10px; font-weight: 900; letter-spacing: .08em; }
.page-header h1 { margin: 0; color: #0b1d39; font-size: 34px; letter-spacing: -.03em; }
.page-header span { display: block; margin-top: 8px; color: #6c7a8f; font-size: 12px; }
.filter-card, .result-card { border: 1px solid #dce4ee; border-radius: 11px; background: #fff; box-shadow: 0 10px 30px rgb(13 43 94 / 5%); }
.filter-card { padding: 18px; }
.filters { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.filters label { display: flex; flex-direction: column; gap: 6px; }
.filters label span { color: #53647c; font-size: 10px; font-weight: 800; }
.filters input, .filters select { min-height: 42px; padding: 0 10px; border: 1px solid #ccd6e3; border-radius: 7px; background: #fff; color: #24354d; font: inherit; font-size: 11px; }
.filter-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 15px; }
.btn { min-height: 40px; padding: 0 14px; border-radius: 7px; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.btn--ghost { border: 1px solid #cfd8e5; background: #fff; color: #35465f; }
.btn--primary { border: 0; background: #2456c4; color: #fff; }
.btn--pdf { border: 0; background: #9f2d2d; color: #fff; }
.btn--xlsx { border: 0; background: #167148; color: #fff; }
.btn:disabled { opacity: .55; cursor: default; }
.feedback { margin: 14px 0; padding: 12px 14px; border: 1px solid #efcaca; border-radius: 8px; background: #fff6f6; color: #a12b2b; font-size: 11px; font-weight: 700; }
.summary-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 10px; margin: 16px 0; }
.summary-grid article { padding: 14px; border: 1px solid #dde5ef; border-radius: 9px; background: #fff; }
.summary-grid span { display: block; color: #748197; font-size: 9px; font-weight: 850; text-transform: uppercase; }
.summary-grid strong { display: block; margin-top: 4px; color: #12305c; font-size: 23px; }
.result-card { overflow: hidden; }
.result-card > header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 18px; border-bottom: 1px solid #e2e8f0; }
.result-card > header > div:first-child { display: flex; flex-direction: column; gap: 3px; }
.result-card > header strong { font-size: 14px; }
.result-card > header span { color: #7a8799; font-size: 9px; }
.export-actions { display: flex; gap: 8px; }
.table-wrap { overflow: auto; }
table { width: 100%; min-width: 1250px; border-collapse: collapse; }
th { padding: 11px 12px; background: #f5f7fa; color: #68778c; font-size: 9px; text-align: left; text-transform: uppercase; }
td { padding: 13px 12px; border-top: 1px solid #edf0f4; color: #46566d; font-size: 10px; vertical-align: top; }
td strong, td small { display: block; }
td strong { color: #273950; font-size: 10px; }
td small { margin-top: 4px; color: #7b8899; font-size: 8px; line-height: 1.35; }
.status { display: inline-flex; padding: 5px 8px; border-radius: 999px; background: #eef2f7; color: #52647d; font-size: 8px; font-weight: 900; text-transform: uppercase; }
.status[data-status='INFORMADO'] { background: #edf2ff; color: #2451ad; }
.status[data-status='EM_ANALISE'] { background: #fff5d5; color: #866000; }
.status[data-status='LIBERADO_PARA_ARMAZENAMENTO'] { background: #e6f7ec; color: #14733a; }
.status[data-status='ARMAZENADO_TEMPORARIAMENTE'] { background: #e8f7f8; color: #106b73; }
.status[data-status='DESPACHADO'] { background: #eef1f5; color: #4b596d; }
.empty, .empty-state { padding: 34px; color: #718096; text-align: center; }
.empty-state { margin-top: 16px; border: 1px dashed #ccd6e3; border-radius: 10px; background: #fafbfd; font-size: 12px; }
@media (max-width: 1100px) { .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } .summary-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 650px) { .page-header { align-items: flex-start; flex-direction: column; } .filters, .summary-grid { grid-template-columns: 1fr; } .filter-actions, .result-card > header, .export-actions { align-items: stretch; flex-direction: column; } }
</style>
