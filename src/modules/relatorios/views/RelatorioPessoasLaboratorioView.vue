<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import type { PerfilUsuario } from '@/modules/auth/types/session'
import { relatorioService } from '@/modules/relatorios/services/relatorioService'
import type {
  RelatorioPessoasLaboratorioFiltros,
  RelatorioPessoasLaboratorioResponse,
} from '@/modules/relatorios/types/pessoasLaboratorioRelatorio'
import { http } from '@/services/http'

interface LaboratorioResumo {
  id: string
  nome: string
  unidadeId: string | null
  ativo: boolean
}

type SituacaoFiltro = 'ATIVOS' | 'INATIVOS' | 'TODOS'

const router = useRouter()
const laboratorios = ref<LaboratorioResumo[]>([])
const laboratorioId = ref('')
const perfil = ref<'' | PerfilUsuario>('')
const situacao = ref<SituacaoFiltro>('ATIVOS')
const resultado = ref<RelatorioPessoasLaboratorioResponse | null>(null)
const carregando = ref(false)
const exportando = ref<'PDF' | 'XLSX' | null>(null)
const erro = ref('')

const perfis: PerfilUsuario[] = ['GESTOR', 'PESQUISADOR', 'TECNICO', 'ANALISTA', 'ESTAGIARIO', 'ADMINISTRADOR']

function filtros(): RelatorioPessoasLaboratorioFiltros | null {
  if (!laboratorioId.value) return null
  return {
    laboratorioId: laboratorioId.value,
    perfil: perfil.value || undefined,
    ativo: situacao.value === 'TODOS' ? undefined : situacao.value === 'ATIVOS',
  }
}

async function visualizar() {
  erro.value = ''
  const params = filtros()
  if (!params) {
    erro.value = 'Selecione um laboratório para visualizar as pessoas vinculadas.'
    return
  }

  carregando.value = true
  try {
    resultado.value = await relatorioService.listarPessoasLaboratorio(params)
  } catch (error) {
    console.error(error)
    erro.value = 'Não foi possível carregar as pessoas vinculadas ao laboratório.'
  } finally {
    carregando.value = false
  }
}

function limpar() {
  laboratorioId.value = ''
  perfil.value = ''
  situacao.value = 'ATIVOS'
  resultado.value = null
  erro.value = ''
}

async function exportar(formato: 'PDF' | 'XLSX') {
  const params = filtros()
  if (!params) {
    erro.value = 'Selecione um laboratório antes de exportar.'
    return
  }

  exportando.value = formato
  erro.value = ''
  try {
    const arquivo = await relatorioService.exportar('pessoas-laboratorio', formato, params)
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

function rotuloPerfil(valor: PerfilUsuario) {
  const mapa: Record<PerfilUsuario, string> = {
    ADMINISTRADOR: 'Administrador',
    GESTOR: 'Gestor',
    TECNICO: 'Técnico',
    ANALISTA: 'Analista',
    PESQUISADOR: 'Pesquisador',
    ESTAGIARIO: 'Estagiário',
  }
  return mapa[valor]
}

function rotuloVinculo(valor: string | null) {
  if (!valor) return '—'
  const mapa: Record<string, string> = {
    BOLSA_CNPQ: 'Bolsa CNPq',
    BOLSA_CAPES: 'Bolsa CAPES',
    BOLSA_INSTITUCIONAL: 'Bolsa institucional',
    VOLUNTARIO: 'Voluntário',
    CONTRATUAL: 'Contratual',
  }
  return mapa[valor] ?? valor
}

function formatarData(valor: string | null) {
  if (!valor) return '—'
  const [ano, mes, dia] = valor.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(ano, (mes ?? 1) - 1, dia ?? 1))
}

function formatarDataHora(valor: string) {
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return valor
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(data)
}

onMounted(async () => {
  try {
    const { data } = await http.get<LaboratorioResumo[]>('/v1/laboratorios')
    laboratorios.value = data
      .filter((laboratorio) => laboratorio.ativo)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  } catch {
    laboratorios.value = []
  }
})
</script>

<template>
  <section class="people-report-page">
    <header class="page-header">
      <div>
        <p>RELATÓRIOS / PESSOAS</p>
        <h1>Pessoas por laboratório</h1>
        <span>Responsável e usuários vinculados ao laboratório, separados por perfil e situação.</span>
      </div>
      <button class="btn btn--ghost" type="button" @click="router.push('/relatorios')">← Voltar aos relatórios</button>
    </header>

    <section class="filter-card">
      <div class="filters">
        <label class="field--lab">
          <span>Laboratório</span>
          <select v-model="laboratorioId">
            <option value="">Selecione...</option>
            <option v-for="laboratorio in laboratorios" :key="laboratorio.id" :value="laboratorio.id">
              {{ laboratorio.nome }}
            </option>
          </select>
        </label>
        <label>
          <span>Perfil</span>
          <select v-model="perfil">
            <option value="">Todos os perfis</option>
            <option v-for="item in perfis" :key="item" :value="item">{{ rotuloPerfil(item) }}</option>
          </select>
        </label>
        <label>
          <span>Situação</span>
          <select v-model="situacao">
            <option value="ATIVOS">Ativos</option>
            <option value="INATIVOS">Inativos</option>
            <option value="TODOS">Todos</option>
          </select>
        </label>
      </div>
      <div class="filter-actions">
        <button class="btn btn--ghost" type="button" @click="limpar">Limpar</button>
        <button class="btn btn--primary" type="button" :disabled="carregando" @click="visualizar">
          {{ carregando ? 'Carregando...' : 'Visualizar relatório' }}
        </button>
      </div>
    </section>

    <div v-if="erro" class="feedback">{{ erro }}</div>

    <template v-if="resultado">
      <section class="lab-summary">
        <div class="lab-main">
          <span>LABORATÓRIO</span>
          <strong>{{ resultado.laboratorioNome }}</strong>
          <small>{{ resultado.unidadeNome ?? 'Unidade não informada' }}</small>
        </div>
        <div class="responsible">
          <span>RESPONSÁVEL</span>
          <strong>{{ resultado.responsavelNome ?? 'Sem responsável cadastrado' }}</strong>
          <small>{{ resultado.responsavelEmail ?? '—' }}</small>
        </div>
      </section>

      <section class="metrics-grid">
        <article><span>Pessoas</span><strong>{{ resultado.totalPessoas }}</strong></article>
        <article><span>Ativas</span><strong>{{ resultado.ativos }}</strong></article>
        <article><span>Inativas</span><strong>{{ resultado.inativos }}</strong></article>
        <article class="profiles-card">
          <span>Perfis encontrados</span>
          <div>
            <b v-for="(quantidade, chave) in resultado.porPerfil" :key="chave">
              {{ rotuloPerfil(chave as PerfilUsuario) }}: {{ quantidade }}
            </b>
            <em v-if="Object.keys(resultado.porPerfil).length === 0">Nenhum</em>
          </div>
        </article>
      </section>

      <section class="result-card">
        <header>
          <div>
            <strong>Vínculos do laboratório</strong>
            <span>Gerado em {{ formatarDataHora(resultado.geradoEm) }}</span>
          </div>
          <div class="export-actions">
            <button class="btn btn--pdf" type="button" :disabled="Boolean(exportando)" @click="exportar('PDF')">
              {{ exportando === 'PDF' ? 'Gerando...' : 'Exportar PDF' }}
            </button>
            <button class="btn btn--xlsx" type="button" :disabled="Boolean(exportando)" @click="exportar('XLSX')">
              {{ exportando === 'XLSX' ? 'Gerando...' : 'Exportar XLSX' }}
            </button>
          </div>
        </header>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Papel</th><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Situação</th><th>Vínculo de estágio</th><th>Período</th></tr>
            </thead>
            <tbody>
              <tr v-for="pessoa in resultado.pessoas" :key="pessoa.usuarioId">
                <td>
                  <span v-if="pessoa.responsavelLaboratorio" class="role role--responsible">Responsável</span>
                  <span v-else class="role">Vinculado</span>
                </td>
                <td><strong>{{ pessoa.nome }}</strong></td>
                <td>{{ pessoa.email }}</td>
                <td>{{ rotuloPerfil(pessoa.perfil) }}</td>
                <td><span class="status" :class="pessoa.ativo ? 'status--active' : 'status--inactive'">{{ pessoa.ativo ? 'Ativo' : 'Inativo' }}</span></td>
                <td>{{ rotuloVinculo(pessoa.tipoVinculoEstagio) }}</td>
                <td>
                  <template v-if="pessoa.dataInicioEstagio">
                    {{ formatarData(pessoa.dataInicioEstagio) }} → {{ formatarData(pessoa.dataFimEstagio) }}
                  </template>
                  <template v-else>—</template>
                </td>
              </tr>
              <tr v-if="resultado.pessoas.length === 0">
                <td colspan="7" class="empty">Nenhuma pessoa encontrada para os filtros selecionados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <section v-else class="empty-state">
      Escolha um laboratório e clique em <strong>Visualizar relatório</strong>.
    </section>
  </section>
</template>

<style scoped>
.people-report-page { max-width: 1500px; margin: 0 auto; color: #18263c; }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
.page-header p { margin: 0 0 9px; color: #2456c4; font-size: 10px; font-weight: 900; letter-spacing: .08em; }
.page-header h1 { margin: 0; color: #0b1d39; font-size: 34px; letter-spacing: -.03em; }
.page-header span { display: block; margin-top: 8px; color: #6c7a8f; font-size: 12px; }
.filter-card, .result-card, .lab-summary { border: 1px solid #dce4ee; border-radius: 11px; background: #fff; box-shadow: 0 10px 30px rgb(13 43 94 / 5%); }
.filter-card { padding: 18px; }
.filters { display: grid; grid-template-columns: minmax(300px, 1.5fr) minmax(180px, .7fr) minmax(180px, .7fr); gap: 12px; }
.filters label { display: flex; flex-direction: column; gap: 6px; }
.filters label span { color: #53647c; font-size: 10px; font-weight: 800; }
.filters select { min-height: 42px; padding: 0 10px; border: 1px solid #ccd6e3; border-radius: 7px; background: #fff; color: #24354d; font: inherit; font-size: 11px; }
.filter-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 15px; }
.btn { min-height: 40px; padding: 0 14px; border-radius: 7px; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.btn--ghost { border: 1px solid #cfd8e5; background: #fff; color: #35465f; }
.btn--primary { border: 0; background: #2456c4; color: #fff; }
.btn--pdf { border: 0; background: #9f2d2d; color: #fff; }
.btn--xlsx { border: 0; background: #167148; color: #fff; }
.btn:disabled { opacity: .55; cursor: default; }
.feedback { margin: 14px 0; padding: 12px 14px; border: 1px solid #efcaca; border-radius: 8px; background: #fff6f6; color: #a12b2b; font-size: 11px; font-weight: 700; }
.lab-summary { display: grid; grid-template-columns: 1.3fr 1fr; margin-top: 16px; overflow: hidden; }
.lab-summary > div { padding: 16px 18px; }
.lab-summary > div + div { border-left: 1px solid #e1e7ef; background: #f8fbff; }
.lab-summary span, .metrics-grid span { display: block; color: #718096; font-size: 9px; font-weight: 900; letter-spacing: .05em; text-transform: uppercase; }
.lab-summary strong { display: block; margin-top: 5px; color: #18345f; font-size: 15px; }
.lab-summary small { display: block; margin-top: 3px; color: #718096; font-size: 10px; }
.metrics-grid { display: grid; grid-template-columns: 150px 150px 150px minmax(320px, 1fr); gap: 10px; margin: 12px 0; }
.metrics-grid article { padding: 14px; border: 1px solid #dde5ef; border-radius: 9px; background: #fff; }
.metrics-grid strong { display: block; margin-top: 4px; color: #12305c; font-size: 23px; }
.profiles-card div { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 7px; }
.profiles-card b { padding: 4px 7px; border-radius: 999px; background: #edf3ff; color: #315990; font-size: 8px; }
.profiles-card em { color: #8794a5; font-size: 9px; font-style: normal; }
.result-card { overflow: hidden; }
.result-card > header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 18px; border-bottom: 1px solid #e2e8f0; }
.result-card > header > div:first-child { display: flex; flex-direction: column; gap: 3px; }
.result-card > header strong { font-size: 14px; }
.result-card > header span { color: #7a8799; font-size: 9px; }
.export-actions { display: flex; gap: 8px; }
.table-wrap { overflow: auto; }
table { width: 100%; min-width: 980px; border-collapse: collapse; }
th { padding: 11px 12px; background: #f5f7fa; color: #68778c; font-size: 9px; text-align: left; text-transform: uppercase; }
td { padding: 13px 12px; border-top: 1px solid #edf0f4; color: #46566d; font-size: 10px; vertical-align: middle; }
td strong { color: #273950; }
.role, .status { display: inline-flex; padding: 5px 8px; border-radius: 999px; font-size: 8px; font-weight: 900; }
.role { background: #eef2f7; color: #58697d; }
.role--responsible { background: #e8efff; color: #234f9b; }
.status--active { background: #e8f7ee; color: #1f7141; }
.status--inactive { background: #eef1f5; color: #6b7788; }
.empty, .empty-state { padding: 34px; color: #718096; text-align: center; }
.empty-state { margin-top: 16px; border: 1px dashed #ccd6e3; border-radius: 10px; background: #fbfcfe; }
@media (max-width: 900px) { .page-header { align-items: stretch; flex-direction: column; } .filters { grid-template-columns: 1fr; } .lab-summary { grid-template-columns: 1fr; } .lab-summary > div + div { border-left: 0; border-top: 1px solid #e1e7ef; } .metrics-grid { grid-template-columns: repeat(3, 1fr); } .profiles-card { grid-column: 1 / -1; } }
@media (max-width: 620px) { .metrics-grid { grid-template-columns: 1fr; } .profiles-card { grid-column: auto; } .result-card > header { align-items: stretch; flex-direction: column; } .export-actions { width: 100%; } .export-actions .btn { flex: 1; } }
</style>
