<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

import type { UsuarioSessao } from '@/modules/auth/types/session'
import { estagiarioService } from '@/modules/estagiarios/services/estagiarioService'
import type {
  ApiErrorResponse,
  EstagiarioRequest,
  EstagiarioResponse,
  TipoBolsaEstagiario,
} from '@/modules/estagiarios/types/estagiario'
import { http } from '@/services/http'

type FiltroStatus = 'TODOS' | 'ATIVOS' | 'ENCERRADOS'
type ModoFormulario = 'CRIAR' | 'EDITAR'

interface LaboratorioOpcao {
  id: string
  unidadeId: string | null
  nome: string
  ativo: boolean
}

interface FormularioEstagiario {
  usuarioId: string
  laboratorioId: string
  dataInicioEstagio: string
  dataFimEstagio: string
  tipoBolsa: TipoBolsaEstagiario
  observacao: string
}

const estagiarios = ref<EstagiarioResponse[]>([])
const usuarios = ref<UsuarioSessao[]>([])
const laboratoriosCadastro = ref<LaboratorioOpcao[]>([])
const carregando = ref(false)
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')
const busca = ref('')
const filtroStatus = ref<FiltroStatus>('TODOS')
const laboratorioId = ref('TODOS')
const tipoBolsa = ref<TipoBolsaEstagiario | 'TODOS'>('TODOS')
const selecionado = ref<EstagiarioResponse | null>(null)
const formularioAberto = ref(false)
const modoFormulario = ref<ModoFormulario>('CRIAR')
const idEmEdicao = ref<string | null>(null)
const erroFormulario = ref('')
const formulario = ref<FormularioEstagiario>(novoFormulario())

const tiposBolsa: Array<{ valor: TipoBolsaEstagiario; rotulo: string; detalhe?: string }> = [
  { valor: 'BOLSA_CNPQ', rotulo: 'Bolsa CNPq' },
  { valor: 'BOLSA_CAPES', rotulo: 'Bolsa CAPES' },
  { valor: 'BOLSA_INSTITUCIONAL', rotulo: 'Bolsa institucional' },
  { valor: 'VOLUNTARIO', rotulo: 'Voluntário' },
  { valor: 'CONTRATUAL', rotulo: 'Contratual', detalhe: 'Estágio empregatício, sem vínculo com bolsa ou voluntariado' },
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

const usuariosDisponiveisCadastro = computed(() => {
  const vinculados = new Set(estagiarios.value.map((item) => item.usuarioId))
  return usuarios.value
    .filter((usuario) => usuario.ativo && usuario.perfil === 'ESTAGIARIO' && !vinculados.has(usuario.id))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
})

const usuarioFormulario = computed(() => usuarios.value.find((usuario) => usuario.id === formulario.value.usuarioId) ?? null)

const laboratoriosFormulario = computed(() => {
  const unidadeId = usuarioFormulario.value?.unidadeId
  if (!unidadeId) return []
  return laboratoriosCadastro.value
    .filter((laboratorio) => laboratorio.ativo && laboratorio.unidadeId === unidadeId)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
})

function novoFormulario(): FormularioEstagiario {
  return {
    usuarioId: '',
    laboratorioId: '',
    dataInicioEstagio: '',
    dataFimEstagio: '',
    tipoBolsa: 'BOLSA_INSTITUCIONAL',
    observacao: '',
  }
}

function inicioDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

function dataLocal(valor: string) {
  const [ano, mes, dia] = valor.split('-').map(Number)
  return new Date(ano, (mes ?? 1) - 1, dia ?? 1)
}

function mensagemErro(error: unknown, padrao = 'Não foi possível concluir a operação.') {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? padrao
  }
  return error instanceof Error ? error.message : padrao
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

function abrirCadastro() {
  selecionado.value = null
  modoFormulario.value = 'CRIAR'
  idEmEdicao.value = null
  formulario.value = novoFormulario()
  erroFormulario.value = ''
  formularioAberto.value = true
}

function abrirEdicao(estagiario: EstagiarioResponse) {
  selecionado.value = null
  modoFormulario.value = 'EDITAR'
  idEmEdicao.value = estagiario.id
  formulario.value = {
    usuarioId: estagiario.usuarioId,
    laboratorioId: estagiario.laboratorioId ?? '',
    dataInicioEstagio: estagiario.dataInicioEstagio,
    dataFimEstagio: estagiario.dataFimEstagio ?? '',
    tipoBolsa: estagiario.tipoBolsa,
    observacao: estagiario.observacao ?? '',
  }
  erroFormulario.value = ''
  formularioAberto.value = true
}

function fecharFormulario() {
  if (salvando.value) return
  formularioAberto.value = false
  erroFormulario.value = ''
  idEmEdicao.value = null
  formulario.value = novoFormulario()
}

function sincronizarLaboratorio() {
  if (!laboratoriosFormulario.value.some((laboratorio) => laboratorio.id === formulario.value.laboratorioId)) {
    formulario.value.laboratorioId = ''
  }
}

function validarFormulario() {
  if (!formulario.value.usuarioId) return 'Selecione o usuário estagiário.'
  if (!formulario.value.laboratorioId) return 'Selecione o laboratório.'
  if (!formulario.value.dataInicioEstagio) return 'Informe a data de início.'
  if (!formulario.value.tipoBolsa) return 'Selecione o tipo de vínculo.'
  if (formulario.value.dataFimEstagio && formulario.value.dataFimEstagio < formulario.value.dataInicioEstagio) {
    return 'A data de fim não pode ser anterior à data de início.'
  }
  return ''
}

async function salvarFormulario() {
  const validacao = validarFormulario()
  if (validacao) {
    erroFormulario.value = validacao
    return
  }

  const registroAtual = idEmEdicao.value
    ? estagiarios.value.find((item) => item.id === idEmEdicao.value)
    : null

  const payload: EstagiarioRequest = {
    usuarioId: formulario.value.usuarioId,
    laboratorioId: formulario.value.laboratorioId,
    dataInicioEstagio: formulario.value.dataInicioEstagio,
    dataFimEstagio: formulario.value.dataFimEstagio || null,
    tipoBolsa: formulario.value.tipoBolsa,
    observacao: formulario.value.observacao.trim() || null,
    ativo: modoFormulario.value === 'EDITAR' ? (registroAtual?.ativo ?? true) : true,
  }

  salvando.value = true
  erroFormulario.value = ''
  try {
    if (modoFormulario.value === 'CRIAR') {
      await estagiarioService.criar(payload)
      sucesso.value = 'Estagiário cadastrado com sucesso.'
    } else if (idEmEdicao.value) {
      await estagiarioService.atualizar(idEmEdicao.value, payload)
      sucesso.value = 'Dados do estágio atualizados com sucesso.'
    }
    fecharFormularioForcado()
    await carregar()
  } catch (error) {
    erroFormulario.value = mensagemErro(error)
  } finally {
    salvando.value = false
  }
}

function fecharFormularioForcado() {
  formularioAberto.value = false
  erroFormulario.value = ''
  idEmEdicao.value = null
  formulario.value = novoFormulario()
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const [listaEstagiarios, usuariosResponse, laboratoriosResponse] = await Promise.all([
      estagiarioService.listarTodos(),
      http.get<UsuarioSessao[]>('/v1/usuarios'),
      http.get<LaboratorioOpcao[]>('/v1/laboratorios'),
    ])
    estagiarios.value = listaEstagiarios
    usuarios.value = usuariosResponse.data
    laboratoriosCadastro.value = laboratoriosResponse.data
    if (selecionado.value) {
      selecionado.value = estagiarios.value.find((item) => item.id === selecionado.value?.id) ?? null
    }
  } catch (error) {
    erro.value = mensagemErro(error, 'Não foi possível carregar os dados de estagiários.')
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
        <p>Consulta e manutenção simples dos vínculos de estágio cadastrados no SGL.</p>
      </div>
      <div class="heading-actions">
        <button class="secondary-action" type="button" :disabled="carregando" @click="carregar">
          {{ carregando ? 'Atualizando...' : 'Atualizar' }}
        </button>
        <button class="primary-action" type="button" @click="abrirCadastro">Novo estágio</button>
      </div>
    </header>

    <section class="metrics-grid">
      <article><span>Ativos</span><strong>{{ ativos.length }}</strong><small>vínculos em andamento</small></article>
      <article><span>Encerrados</span><strong>{{ encerrados.length }}</strong><small>histórico preservado</small></article>
      <article :class="{ warning: encerramEmBreve > 0 }"><span>Encerram em até 30 dias</span><strong>{{ encerramEmBreve }}</strong><small>exigem acompanhamento</small></article>
      <article><span>Sem data final</span><strong>{{ semDataFim }}</strong><small>ativos sem previsão de término</small></article>
    </section>

    <div v-if="sucesso" class="feedback feedback--success">{{ sucesso }}</div>
    <div v-if="erro" class="feedback feedback--error">{{ erro }}</div>

    <section class="workspace-card">
      <div class="filters-grid">
        <label class="field field--search">
          <span>Busca</span>
          <input v-model="busca" type="search" placeholder="Nome, laboratório, vínculo ou observação..." />
        </label>
        <label class="field"><span>Status</span><select v-model="filtroStatus"><option value="TODOS">Todos</option><option value="ATIVOS">Ativos</option><option value="ENCERRADOS">Encerrados</option></select></label>
        <label class="field"><span>Laboratório</span><select v-model="laboratorioId"><option value="TODOS">Todos</option><option v-for="laboratorio in laboratorios" :key="laboratorio.id" :value="laboratorio.id">{{ laboratorio.nome }}</option></select></label>
        <label class="field"><span>Tipo de vínculo</span><select v-model="tipoBolsa"><option value="TODOS">Todos</option><option v-for="tipo in tiposBolsa" :key="tipo.valor" :value="tipo.valor">{{ tipo.rotulo }}</option></select></label>
      </div>

      <div class="filter-summary">
        <div><strong>{{ estagiariosFiltrados.length }}</strong><span>registro(s)</span></div>
        <button v-if="busca || filtroStatus !== 'TODOS' || laboratorioId !== 'TODOS' || tipoBolsa !== 'TODOS'" type="button" @click="limparFiltros">Limpar filtros</button>
      </div>

      <div v-if="carregando" class="state-box">Carregando estagiários...</div>
      <div v-else-if="estagiarios.length === 0" class="state-box">Nenhum estagiário cadastrado.</div>
      <div v-else-if="estagiariosFiltrados.length === 0" class="state-box">Nenhum registro encontrado.</div>

      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>Status</th><th>Estagiário</th><th>Laboratório</th><th>Vínculo</th><th>Período</th><th></th></tr></thead>
          <tbody>
            <tr v-for="estagiario in estagiariosFiltrados" :key="estagiario.id" @click="abrirDetalhes(estagiario)">
              <td><span class="status-pill" :class="estagiario.ativo ? 'status-pill--active' : 'status-pill--closed'">{{ estagiario.ativo ? 'ATIVO' : 'ENCERRADO' }}</span></td>
              <td><strong>{{ estagiario.usuarioNome }}</strong><small>{{ situacaoPeriodo(estagiario) }}</small></td>
              <td>{{ estagiario.laboratorioNome ?? 'Sem laboratório' }}</td>
              <td>{{ rotuloBolsa(estagiario.tipoBolsa) }}</td>
              <td><strong>{{ formatarData(estagiario.dataInicioEstagio) }}</strong><small>{{ estagiario.dataFimEstagio ? `até ${formatarData(estagiario.dataFimEstagio)}` : 'sem data final' }}</small></td>
              <td class="actions-column" @click.stop><button class="detail-action" type="button" @click="abrirEdicao(estagiario)">Editar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="selecionado" class="drawer-backdrop" @click.self="fecharDetalhes">
      <aside class="detail-drawer" role="dialog" aria-modal="true" aria-label="Detalhes do estagiário">
        <header>
          <div><span class="status-pill" :class="selecionado.ativo ? 'status-pill--active' : 'status-pill--closed'">{{ selecionado.ativo ? 'ATIVO' : 'ENCERRADO' }}</span><h2>{{ selecionado.usuarioNome }}</h2><p>{{ selecionado.laboratorioNome ?? 'Sem laboratório vinculado' }}</p></div>
          <button type="button" aria-label="Fechar detalhes" @click="fecharDetalhes">×</button>
        </header>
        <div class="detail-content">
          <section class="detail-grid">
            <article><span>Tipo de vínculo</span><strong>{{ rotuloBolsa(selecionado.tipoBolsa) }}</strong></article>
            <article><span>Situação</span><strong>{{ situacaoPeriodo(selecionado) }}</strong></article>
            <article><span>Início</span><strong>{{ formatarData(selecionado.dataInicioEstagio) }}</strong></article>
            <article><span>Fim</span><strong>{{ formatarData(selecionado.dataFimEstagio) }}</strong></article>
          </section>
          <section class="period-card"><span>PERÍODO DO ESTÁGIO</span><strong>{{ periodo(selecionado) }}</strong><p>{{ situacaoPeriodo(selecionado) }}</p></section>
          <section><h3>Vínculo</h3><div class="link-card"><div><span>Laboratório</span><strong>{{ selecionado.laboratorioNome ?? 'Não informado' }}</strong></div><div><span>Usuário</span><code>{{ selecionado.usuarioId }}</code></div></div></section>
          <section><h3>Observação</h3><p class="observation">{{ selecionado.observacao || 'Nenhuma observação registrada.' }}</p></section>
          <button class="primary-action detail-edit" type="button" @click="abrirEdicao(selecionado)">Editar vínculo</button>
        </div>
      </aside>
    </div>

    <div v-if="formularioAberto" class="modal-backdrop" @click.self="fecharFormulario">
      <section class="form-modal" role="dialog" aria-modal="true" :aria-label="modoFormulario === 'CRIAR' ? 'Cadastrar estágio' : 'Editar estágio'">
        <header>
          <div><span>{{ modoFormulario === 'CRIAR' ? 'NOVO VÍNCULO' : 'EDIÇÃO' }}</span><h2>{{ modoFormulario === 'CRIAR' ? 'Cadastrar estágio' : 'Editar estágio' }}</h2></div>
          <button type="button" aria-label="Fechar" @click="fecharFormulario">×</button>
        </header>

        <form class="form-content" @submit.prevent="salvarFormulario">
          <div v-if="erroFormulario" class="feedback feedback--error">{{ erroFormulario }}</div>

          <label class="field field--full">
            <span>Usuário estagiário</span>
            <select v-model="formulario.usuarioId" :disabled="modoFormulario === 'EDITAR'" required @change="sincronizarLaboratorio">
              <option value="">Selecione...</option>
              <option v-for="usuario in usuariosDisponiveisCadastro" :key="usuario.id" :value="usuario.id">{{ usuario.nome }} — {{ usuario.email }}</option>
              <option v-if="modoFormulario === 'EDITAR' && usuarioFormulario" :value="usuarioFormulario.id">{{ usuarioFormulario.nome }} — {{ usuarioFormulario.email }}</option>
            </select>
            <small v-if="modoFormulario === 'CRIAR'">Somente usuários ativos com perfil ESTAGIARIO e sem vínculo existente.</small>
          </label>

          <label class="field field--full">
            <span>Laboratório</span>
            <select v-model="formulario.laboratorioId" required :disabled="!formulario.usuarioId">
              <option value="">Selecione...</option>
              <option v-for="laboratorio in laboratoriosFormulario" :key="laboratorio.id" :value="laboratorio.id">{{ laboratorio.nome }}</option>
            </select>
            <small>São exibidos somente laboratórios ativos da mesma unidade do usuário.</small>
          </label>

          <div class="form-grid">
            <label class="field"><span>Início</span><input v-model="formulario.dataInicioEstagio" type="date" required /></label>
            <label class="field"><span>Fim previsto</span><input v-model="formulario.dataFimEstagio" type="date" /></label>
          </div>

          <label class="field field--full">
            <span>Tipo de vínculo</span>
            <select v-model="formulario.tipoBolsa" required>
              <option v-for="tipo in tiposBolsa" :key="tipo.valor" :value="tipo.valor">{{ tipo.rotulo }}</option>
            </select>
            <small v-if="formulario.tipoBolsa === 'CONTRATUAL'">Estágio empregatício sem conexão com bolsa ou voluntariado.</small>
          </label>

          <label class="field field--full"><span>Observação</span><textarea v-model="formulario.observacao" rows="4" placeholder="Informações adicionais do vínculo..." /></label>

          <footer class="form-actions">
            <button class="secondary-action" type="button" :disabled="salvando" @click="fecharFormulario">Cancelar</button>
            <button class="primary-action" type="submit" :disabled="salvando">{{ salvando ? 'Salvando...' : (modoFormulario === 'CRIAR' ? 'Cadastrar' : 'Salvar alterações') }}</button>
          </footer>
        </form>
      </section>
    </div>
  </section>
</template>

<style scoped>
.intern-page { max-width: 1500px; margin: 0 auto; color: #17243a; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
.heading-actions { display: flex; gap: 9px; }
.breadcrumb { margin: 0 0 8px; color: #2456c4; font-size: 10px; font-weight: 900; letter-spacing: .08em; }
.page-heading h1 { margin: 0; color: #0a1c3b; font-size: 31px; line-height: 1.1; }
.page-heading p:not(.breadcrumb) { max-width: 780px; margin: 8px 0 0; color: #66758a; font-size: 13px; }
.secondary-action, .detail-action, .primary-action { min-height: 40px; padding: 0 14px; border-radius: 7px; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.secondary-action, .detail-action { border: 1px solid #cfd9e7; background: #fff; color: #24405f; }
.primary-action { border: 1px solid #2456c4; background: #2456c4; color: #fff; }
.secondary-action:hover, .detail-action:hover { border-color: #9eb3d2; background: #f8fbff; }
.primary-action:hover { background: #1d4cac; }
.secondary-action:disabled, .primary-action:disabled { opacity: .55; cursor: default; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.metrics-grid article { min-height: 116px; padding: 18px; border: 1px solid #dce4ef; border-radius: 10px; background: #fff; box-shadow: 0 6px 18px rgb(25 48 82 / 4%); }
.metrics-grid article.warning { border-color: #ecd6a3; background: #fffbf1; }
.metrics-grid span { display: block; color: #68778b; font-size: 10px; font-weight: 850; letter-spacing: .04em; text-transform: uppercase; }
.metrics-grid strong { display: block; margin-top: 10px; color: #0d2852; font-size: 28px; line-height: 1; }
.metrics-grid small { display: block; margin-top: 7px; color: #8390a2; font-size: 10px; }
.feedback { margin-bottom: 16px; padding: 13px 15px; border-radius: 8px; font-size: 12px; }
.feedback--error { border: 1px solid #efc7c7; background: #fff4f4; color: #9f2e2e; }
.feedback--success { border: 1px solid #bfe3ca; background: #f2fbf5; color: #267748; }
.workspace-card { overflow: hidden; border: 1px solid #dbe3ee; border-radius: 11px; background: #fff; box-shadow: 0 8px 24px rgb(25 48 82 / 5%); }
.filters-grid { display: grid; grid-template-columns: minmax(300px, 1.6fr) repeat(3, minmax(170px, .7fr)); gap: 12px; padding: 18px; border-bottom: 1px solid #e6ebf2; background: #fbfcfe; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field > span { color: #66758a; font-size: 9px; font-weight: 850; letter-spacing: .05em; text-transform: uppercase; }
.field input, .field select, .field textarea { width: 100%; padding: 0 12px; border: 1px solid #d4dde9; border-radius: 7px; background: #fff; color: #23354e; font: inherit; font-size: 12px; outline: none; box-sizing: border-box; }
.field input, .field select { height: 42px; }
.field textarea { padding-block: 10px; resize: vertical; }
.field small { color: #8290a4; font-size: 9px; line-height: 1.4; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: #6589c8; box-shadow: 0 0 0 3px rgb(50 99 180 / 8%); }
.field select:disabled { background: #f3f5f8; color: #7b8797; }
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
.actions-column { width: 90px; text-align: right; }
.status-pill { display: inline-flex; min-height: 24px; align-items: center; justify-content: center; padding: 0 9px; border-radius: 999px; font-size: 8px; font-weight: 900; letter-spacing: .05em; }
.status-pill--active { background: #e9f7ef; color: #267748; }
.status-pill--closed { background: #eef1f5; color: #657287; }
.drawer-backdrop, .modal-backdrop { position: fixed; inset: 0; z-index: 70; display: flex; background: rgb(13 25 45 / 42%); backdrop-filter: blur(1.5px); }
.drawer-backdrop { justify-content: flex-end; }
.detail-drawer { width: min(720px, 94vw); height: 100vh; overflow-y: auto; background: #fff; box-shadow: -16px 0 42px rgb(11 27 54 / 18%); }
.detail-drawer > header, .form-modal > header { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 22px 24px; border-bottom: 1px solid #e2e8f0; background: #fff; }
.detail-drawer > header { position: sticky; top: 0; z-index: 2; }
.detail-drawer header h2, .form-modal header h2 { margin: 8px 0 3px; color: #142845; font-size: 23px; }
.detail-drawer header p { margin: 0; color: #758397; font-size: 11px; }
.detail-drawer header > button, .form-modal header > button { width: 38px; height: 38px; border: 0; border-radius: 50%; background: #f1f4f8; color: #526178; font-size: 22px; cursor: pointer; }
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
.detail-edit { justify-self: end; }
.modal-backdrop { align-items: center; justify-content: center; padding: 24px; }
.form-modal { width: min(650px, 96vw); max-height: 92vh; overflow-y: auto; border-radius: 12px; background: #fff; box-shadow: 0 24px 70px rgb(8 25 52 / 25%); }
.form-modal header span { color: #2456c4; font-size: 9px; font-weight: 900; letter-spacing: .08em; }
.form-content { display: grid; gap: 17px; padding: 22px 24px 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-actions { display: flex; justify-content: flex-end; gap: 9px; padding-top: 4px; }
@media (max-width: 1100px) { .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .filters-grid { grid-template-columns: 1fr 1fr; } .field--search { grid-column: 1 / -1; } }
@media (max-width: 680px) { .page-heading { align-items: stretch; flex-direction: column; } .heading-actions { justify-content: flex-end; } .metrics-grid, .filters-grid, .detail-grid, .link-card, .form-grid { grid-template-columns: 1fr; } .field--search { grid-column: auto; } .link-card > div + div { border-left: 0; border-top: 1px solid #e2e8f0; padding: 12px 0 0; } }
</style>
