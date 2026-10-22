<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { projetosService } from '@/modules/projetos/services/projetosService'
import type { LaboratorioCadastro, ProjetoCadastro, UsuarioPermissao } from '@/modules/admin/types/cadastros'
import { vinculosOperacionaisService, type VinculoOperacional, type ResumoVinculosUsuario } from '@/modules/admin/services/vinculosOperacionaisService'

const props = defineProps<{
  usuarios: UsuarioPermissao[]
  laboratorios: LaboratorioCadastro[]
  projetos: ProjetoCadastro[]
}>()
const emit = defineEmits<{ (e: 'atualizar'): void }>()
type Nivel = 'LABORATORIO' | 'PROJETO' | 'SCI' | 'ATIVIDADE'
type FiltroStatus = 'TODOS' | 'PENDENTE' | 'VINCULADO' | 'INATIVO'
type FiltroPerfil = 'TODOS' | 'TECNICO' | 'ANALISTA' | 'PESQUISADOR' | 'ADMINISTRADOR' | 'GESTOR'

const resumo = ref<ResumoVinculosUsuario[]>([])
const basesAtualizadas = ref<Record<string, string | null>>({})
const busca = ref('')
const filtroStatus = ref<FiltroStatus>('TODOS')
const filtroPerfil = ref<FiltroPerfil>('TODOS')
const selecionadoId = ref('')
const usuario = computed(() => props.usuarios.find(u => u.id === selecionadoId.value))
const drawerAberto = ref(false)
const vinculos = ref<VinculoOperacional[]>([])
const carregandoDetalhe = ref(false)
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')
const carregandoResumo = ref(false)
const modalEdicao = ref(false)
const modalEditarVinculo = ref<VinculoOperacional | null>(null)
const edicaoDataFim = ref('')
const edicaoObservacao = ref('')
const modalEncerramento = ref<VinculoOperacional | null>(null)
const laboratorioBaseId = ref('')
const laboratorioId = ref('')
const projetoId = ref('')
const sciId = ref('')
const atividadeId = ref('')
const nivel = ref<Nivel>('LABORATORIO')
const scis = ref<Array<{ id: string; nome: string }>>([])
const atividades = ref<Array<{ id: string; nome: string; sciId: string }>>([])
const dataInicio = ref(new Date().toLocaleDateString('en-CA'))
const observacao = ref('')
const tab = ref<'ATIVOS' | 'HISTORICO'>('ATIVOS')

const usuariosGerenciaveis = computed(() => props.usuarios.filter(u => u.perfil !== 'ESTAGIARIO'))
function baseAtual(u: UsuarioPermissao) {
  return Object.prototype.hasOwnProperty.call(basesAtualizadas.value, u.id)
    ? basesAtualizadas.value[u.id] : u.laboratorioId
}
function resumoDoUsuario(id: string) { return resumo.value.find(x => x.usuarioId === id) }
function status(u: UsuarioPermissao): 'PENDENTE' | 'VINCULADO' | 'INATIVO' {
  if (!u.ativo) return 'INATIVO'
  return baseAtual(u) || (resumoDoUsuario(u.id)?.vinculosVigentes ?? 0) > 0 ? 'VINCULADO' : 'PENDENTE'
}
function statusRotulo(u: UsuarioPermissao) {
  return status(u) === 'PENDENTE' ? 'Pendente de vinculação'
    : status(u) === 'INATIVO' ? 'Inativo' : 'Vinculado'
}
function perfilRotulo(p: string) {
  return ({ TECNICO: 'Técnico', ANALISTA: 'Analista', PESQUISADOR: 'Pesquisador',
    GESTOR: 'Gestor', ADMINISTRADOR: 'Administrador' } as Record<string,string>)[p] || p
}
function labNome(id: string | null | undefined) {
  return props.laboratorios.find(l => l.id === id)?.nome || 'Não atribuído'
}
function vigente(v: VinculoOperacional) {
  const agora = new Date().toLocaleDateString('en-CA')
  return !v.encerrado && v.dataInicio <= agora && (!v.dataFim || v.dataFim >= agora)
}
function contextoTitulo(v: VinculoOperacional) {
  return v.atividadeNome || v.sciNome || v.projetoNome || v.laboratorioNome
}
function contextoNivel(v: VinculoOperacional) {
  return v.atividadeId ? 'Atividade' : v.sciId ? 'SCI' : v.projetoId ? 'Projeto' : 'Laboratório'
}
function dataFormatada(v: string | null) {
  if (!v) return 'Sem previsão'
  const [a,m,d] = v.split('-')
  return d + '/' + m + '/' + a
}
const listaFiltrada = computed(() => usuariosGerenciaveis.value
  .filter(u => {
    const q = busca.value.toLocaleLowerCase('pt-BR').trim()
    const texto = [u.nome, u.email, perfilRotulo(u.perfil), u.unidadeNome || '', labNome(baseAtual(u)),
      ...(resumoDoUsuario(u.id)?.laboratoriosAdicionais ?? [])].join(' ').toLocaleLowerCase('pt-BR')
    return (!q || texto.includes(q))
      && (filtroStatus.value === 'TODOS' || status(u) === filtroStatus.value)
      && (filtroPerfil.value === 'TODOS' || u.perfil === filtroPerfil.value)
  }).sort((a,b) => {
    if (status(a) === 'PENDENTE' && status(b) !== 'PENDENTE') return -1
    if (status(a) !== 'PENDENTE' && status(b) === 'PENDENTE') return 1
    return a.nome.localeCompare(b.nome, 'pt-BR')
  }))
const pendentes = computed(() => usuariosGerenciaveis.value.filter(u => status(u) === 'PENDENTE').length)
const vinculados = computed(() => usuariosGerenciaveis.value.filter(u => status(u) === 'VINCULADO').length)
const inativos = computed(() => usuariosGerenciaveis.value.filter(u => status(u) === 'INATIVO').length)
const laboratoriosValidos = computed(() => props.laboratorios.filter(l => l.ativo && l.unidadeId === usuario.value?.unidadeId))
const projetosValidos = computed(() => props.projetos.filter(p => p.ativo && p.laboratorioId === laboratorioId.value))
const atividadesValidas = computed(() => atividades.value.filter(a => !sciId.value || a.sciId === sciId.value))
const ativos = computed(() => vinculos.value.filter(vigente))
const historico = computed(() => vinculos.value.filter(v => !vigente(v)))
const laboratoriosAssociados = computed(() => {
  const ids = new Set<string>()
  if (usuario.value && baseAtual(usuario.value)) ids.add(baseAtual(usuario.value)!)
  for (const v of ativos.value) ids.add(v.laboratorioId)
  return [...ids].map(id => ({ id, nome: labNome(id), base: id === (usuario.value ? baseAtual(usuario.value) : null) }))
})
const baseRedundante = computed(() => nivel.value === 'LABORATORIO'
  && !!laboratorioId.value && !!usuario.value
  && baseAtual(usuario.value) === laboratorioId.value)
const vinculoGenericoNaBase = computed(() => usuario.value ? ativos.value.some(v =>
  v.laboratorioId === baseAtual(usuario.value) && !v.projetoId && !v.sciId && !v.atividadeId
) : false)
const baseEmVinculoGenerico = computed(() => !!laboratorioBaseId.value && ativos.value.some(v =>
  v.laboratorioId === laboratorioBaseId.value && !v.projetoId && !v.sciId && !v.atividadeId
))
const podeSalvar = computed(() => !baseRedundante.value && !!usuario.value?.ativo && !!laboratorioId.value
  && (nivel.value === 'LABORATORIO' || !!projetoId.value)
  && (nivel.value !== 'SCI' && nivel.value !== 'ATIVIDADE' || !!sciId.value)
  && (nivel.value !== 'ATIVIDADE' || !!atividadeId.value)
  && !!dataInicio.value)

function mensagem(e: unknown, fallback = 'Não foi possível concluir a operação.') {
  if (axios.isAxiosError(e)) {
    const descricao = (e.response?.data as { message?: string } | undefined)?.message
    return descricao || (e.response?.status === 400
      ? 'O cadastro foi recusado. Verifique se já existe um vínculo vigente ou se o contexto informado é válido.'
      : fallback)
  }
  return e instanceof Error ? e.message : fallback
}
async function carregarResumo() {
  carregandoResumo.value = true
  try { resumo.value = await vinculosOperacionaisService.resumo() }
  catch(e) { erro.value = mensagem(e, 'Não foi possível carregar o resumo dos vínculos.') }
  finally { carregandoResumo.value = false }
}
async function carregarVinculos() {
  if (!selecionadoId.value) return
  carregandoDetalhe.value = true
  try { vinculos.value = await vinculosOperacionaisService.listar(selecionadoId.value) }
  catch(e) { erro.value = mensagem(e, 'Não foi possível carregar os vínculos do usuário.') }
  finally { carregandoDetalhe.value = false }
}
async function abrirUsuario(id: string) {
  selecionadoId.value = id
  drawerAberto.value = true
  tab.value = 'ATIVOS'
  modalEdicao.value = false
  erro.value = ''
  sucesso.value = ''
  laboratorioBaseId.value = usuario.value ? baseAtual(usuario.value) || '' : ''
  await carregarVinculos()
}
function fecharUsuario() {
  if (salvando.value) return
  drawerAberto.value = false
  modalEdicao.value = false
  modalEncerramento.value = null
}
function resetFormulario() {
  nivel.value = 'LABORATORIO'
  laboratorioId.value = ''
  projetoId.value = ''
  sciId.value = ''
  atividadeId.value = ''
  scis.value = []
  atividades.value = []
  observacao.value = ''
  dataInicio.value = new Date().toLocaleDateString('en-CA')
}
function abrirNovoVinculo() {
  resetFormulario()
  erro.value = ''
  sucesso.value = ''
  modalEdicao.value = true
}
function selecionarLaboratorio() {
  projetoId.value = ''
  sciId.value = ''
  atividadeId.value = ''
  scis.value = []
  atividades.value = []
}
async function selecionarProjeto() {
  sciId.value = ''
  atividadeId.value = ''
  scis.value = []
  atividades.value = []
  if (!projetoId.value) return
  try {
    const [s,a] = await Promise.all([
      projetosService.listarScisPorProjeto(projetoId.value),
      projetosService.listarAtividadesPorProjeto(projetoId.value),
    ])
    scis.value = s.map(v => ({ id: v.id, nome: v.nome }))
    atividades.value = a.map(v => ({ id: v.id, nome: v.nome, sciId: v.sciId }))
  } catch(e) { erro.value = mensagem(e, 'Não foi possível carregar o Projeto selecionado.') }
}
function selecionarSci() { atividadeId.value = '' }
async function salvarBase() {
  if (!usuario.value?.ativo || !usuario.value) return
  erro.value = ''
  sucesso.value = ''
  if (baseAtual(usuario.value) === (laboratorioBaseId.value || null)) {
    sucesso.value = 'Nenhuma alteração no laboratório-base.'
    return
  }
  if (baseEmVinculoGenerico.value && laboratorioBaseId.value !== baseAtual(usuario.value)) {
    erro.value = 'Este laboratório já tem um vínculo adicional vigente. Encerre o vínculo genérico antes de torná-lo laboratório-base.'
    return
  }
  salvando.value = true
  try {
    await vinculosOperacionaisService.atualizarBase(usuario.value.id, laboratorioBaseId.value || null)
    basesAtualizadas.value[usuario.value.id] = laboratorioBaseId.value || null
    sucesso.value = 'Laboratório-base atualizado. O usuário deve atualizar sua sessão DEV para refletir o novo contexto.'
    emit('atualizar')
  } catch(e) { erro.value = mensagem(e, 'Não foi possível salvar o laboratório-base.') }
  finally { salvando.value = false }
}
async function salvarVinculo() {
  if (!usuario.value || !podeSalvar.value) return
  erro.value = ''
  sucesso.value = ''
  if (baseRedundante.value) {
    erro.value = 'Este já é o laboratório-base do usuário. Você pode vincular um Projeto, SCI ou Atividade nesse laboratório.'
    return
  }
  if (nivel.value === 'LABORATORIO' && ativos.value.some(v => !v.projetoId && !v.sciId
      && !v.atividadeId && v.laboratorioId === laboratorioId.value)) {
    erro.value = 'Este usuário já possui um vínculo vigente com o laboratório selecionado.'
    return
  }
  salvando.value = true
  try {
    await vinculosOperacionaisService.criar({
      usuarioId: usuario.value.id, laboratorioId: laboratorioId.value,
      projetoId: nivel.value === 'LABORATORIO' ? null : projetoId.value,
      sciId: nivel.value === 'SCI' || nivel.value === 'ATIVIDADE' ? sciId.value : null,
      atividadeId: nivel.value === 'ATIVIDADE' ? atividadeId.value : null,
      dataInicio: dataInicio.value, dataFim: null, observacao: observacao.value.trim() || null,
    })
    await Promise.all([carregarVinculos(), carregarResumo()])
    modalEdicao.value = false
    sucesso.value = 'Vínculo registrado. O histórico e os demais laboratórios foram preservados.'
  } catch(e) { erro.value = mensagem(e, 'Não foi possível cadastrar o vínculo.') }
  finally { salvando.value = false }
}
function abrirEdicaoVinculo(v: VinculoOperacional) {
  if (!vigente(v)) return
  modalEditarVinculo.value = v
  edicaoDataFim.value = v.dataFim || ''
  edicaoObservacao.value = v.observacao || ''
  erro.value = ''
}
async function salvarEdicaoVinculo() {
  if (!modalEditarVinculo.value || salvando.value) return
  erro.value = ''
  sucesso.value = ''
  salvando.value = true
  try {
    await vinculosOperacionaisService.editar(modalEditarVinculo.value.id, {
      dataFim: edicaoDataFim.value || null, observacao: edicaoObservacao.value.trim() || null,
    })
    modalEditarVinculo.value = null
    await Promise.all([carregarVinculos(), carregarResumo()])
    sucesso.value = 'Dados do vínculo atualizados. O contexto e o histórico foram preservados.'
  } catch(e) { erro.value = mensagem(e, 'Não foi possível atualizar o vínculo.') }
  finally { salvando.value = false }
}
function solicitarEncerramento(v: VinculoOperacional) {
  if (!vigente(v)) return
  erro.value = ''
  sucesso.value = ''
  modalEncerramento.value = v
}
async function confirmarEncerramento() {
  if (!modalEncerramento.value || salvando.value) return
  erro.value = ''
  sucesso.value = ''
  salvando.value = true
  try {
    await vinculosOperacionaisService.encerrar(modalEncerramento.value.id)
    modalEncerramento.value = null
    await Promise.all([carregarVinculos(), carregarResumo()])
    sucesso.value = 'Vínculo encerrado. Ele permanece registrado no histórico e não concede mais acesso.'
  } catch(e) { erro.value = mensagem(e, 'Não foi possível encerrar o vínculo.') }
  finally { salvando.value = false }
}
watch(() => props.usuarios, () => {
  if (usuario.value && !Object.prototype.hasOwnProperty.call(basesAtualizadas.value, usuario.value.id)) {
    laboratorioBaseId.value = usuario.value.laboratorioId || ''
  }
})
onMounted(() => { void carregarResumo() })
</script>

<template>
  <section class="people-management">
    <section class="people-metrics" aria-label="Resumo operacional">
      <article class="people-metric people-metric--ok"><span>Vinculados</span><strong>{{ vinculados }}</strong><small>com contexto operacional</small></article>
      <article class="people-metric people-metric--pending"><span>Pendentes de vinculação</span><strong>{{ pendentes }}</strong><small>sem laboratório-base ou vínculo vigente</small></article>
      <article class="people-metric"><span>Usuários efetivos</span><strong>{{ usuariosGerenciaveis.length }}</strong><small>técnicos, analistas, pesquisadores e gestores</small></article>
      <article class="people-metric"><span>Inativos</span><strong>{{ inativos }}</strong><small>sem operação no sistema</small></article>
    </section>

    <div v-if="erro && !drawerAberto" class="people-feedback people-feedback--error" role="alert">{{ erro }}</div>
    <section class="people-workspace">
      <div class="people-filter-grid">
        <label class="people-field people-field--search"><span>Buscar usuário</span><input v-model="busca" type="search" placeholder="Nome, e-mail, perfil ou laboratório" /></label>
        <label class="people-field"><span>Situação</span>
          <select v-model="filtroStatus">
            <option value="TODOS">Todas as situações</option><option value="PENDENTE">Pendente de vinculação</option>
            <option value="VINCULADO">Vinculado</option><option value="INATIVO">Inativo</option>
          </select>
        </label>
        <label class="people-field"><span>Perfil</span>
          <select v-model="filtroPerfil">
            <option value="TODOS">Todos os perfis</option><option value="TECNICO">Técnico</option>
            <option value="ANALISTA">Analista</option><option value="PESQUISADOR">Pesquisador</option>
            <option value="GESTOR">Gestor</option><option value="ADMINISTRADOR">Administrador</option>
          </select>
        </label>
      </div>
      <div class="people-results"><span><strong>{{ listaFiltrada.length }}</strong> usuário(s) encontrados</span><button type="button" class="people-link" @click="busca=''; filtroStatus='TODOS'; filtroPerfil='TODOS'">Limpar filtros</button></div>
      <div v-if="carregandoResumo" class="people-empty">Atualizando vínculos...</div>
      <div v-else-if="listaFiltrada.length === 0" class="people-empty">Nenhum usuário encontrado para os filtros informados.</div>
      <div v-else class="people-table-wrap">
        <table class="people-table">
          <thead><tr><th>Situação</th><th>Usuário</th><th>Perfil</th><th>Laboratório-base</th><th>Vínculos adicionais</th><th>Ação</th></tr></thead>
          <tbody>
            <tr v-for="item in listaFiltrada" :key="item.id">
              <td><span class="people-pill" :class="'people-pill--' + status(item).toLowerCase()"><span class="people-dot" />{{ statusRotulo(item) }}</span></td>
              <td><strong>{{ item.nome }}</strong><small>{{ item.email }}</small></td>
              <td>{{ perfilRotulo(item.perfil) }}</td>
              <td>{{ labNome(baseAtual(item)) }}</td>
              <td><strong>{{ resumoDoUsuario(item.id)?.vinculosVigentes ?? 0 }}</strong><small>{{ (resumoDoUsuario(item.id)?.laboratoriosAdicionais || []).slice(0,2).join(', ') || 'Nenhum adicional vigente' }}</small></td>
              <td><button type="button" class="people-outline" @click="abrirUsuario(item.id)">Gerenciar <span aria-hidden="true">→</span></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="drawerAberto && usuario" class="people-backdrop" @click.self="fecharUsuario">
      <aside class="people-drawer" role="dialog" aria-modal="true" :aria-label="'Vínculos de ' + usuario.nome">
        <header class="people-drawer-header">
          <div><span class="people-eyebrow">CADASTROS / VÍNCULOS DO USUÁRIO</span><h2>{{ usuario.nome }}</h2>
            <p>{{ perfilRotulo(usuario.perfil) }} · {{ usuario.email }}</p>
            <span class="people-pill" :class="'people-pill--' + status(usuario).toLowerCase()"><span class="people-dot" />{{ statusRotulo(usuario) }}</span>
          </div>
          <button class="people-close" type="button" aria-label="Fechar detalhes" @click="fecharUsuario">×</button>
        </header>
        <div class="people-drawer-content">
          <div v-if="erro" class="people-feedback people-feedback--error" role="alert">{{ erro }}</div>
          <div v-if="sucesso" class="people-feedback people-feedback--success" role="status">{{ sucesso }}</div>
          <div v-if="status(usuario) === 'PENDENTE'" class="people-pending-message">
            <strong>Este usuário precisa de vinculação.</strong>
            <p>Atribua um laboratório-base ou um vínculo operacional para disponibilizar contextos de trabalho. Este status não confirma a data de primeiro acesso.</p>
          </div>
          <section class="people-section">
            <div class="people-section-head"><div><span class="people-section-number">01</span><h3>Laboratório-base</h3></div></div>
            <p>Referência principal do usuário. Vínculos adicionais não a substituem.</p>
            <div class="people-inline-form">
              <label class="people-field"><span>Laboratório-base atual</span>
                <select v-model="laboratorioBaseId" :disabled="!usuario.ativo || salvando">
                  <option value="">Sem laboratório-base</option>
                  <option v-for="l in laboratoriosValidos" :key="l.id" :value="l.id">{{ l.nome }}</option>
                </select>
              </label>
              <button type="button" class="people-primary" :disabled="!usuario.ativo || salvando || laboratorioBaseId === (baseAtual(usuario) || '')" @click="salvarBase">{{ salvando ? 'Salvando...' : 'Salvar base' }}</button>
            </div>
          </section>
          <section class="people-section">
            <div class="people-section-head"><div><span class="people-section-number">02</span><h3>Laboratórios autorizados</h3></div></div>
            <p>Laboratório-base e laboratórios alcançados por vínculos vigentes.</p>
            <div v-if="laboratoriosAssociados.length" class="people-lab-grid">
              <div v-for="l in laboratoriosAssociados" :key="l.id" class="people-lab-card"><strong>{{ l.nome }}</strong><span>{{ l.base ? 'LABORATÓRIO-BASE' : 'VÍNCULO ADICIONAL' }}</span></div>
            </div>
            <div v-else class="people-empty-inline">Nenhum laboratório associado.</div>
          </section>
          <section class="people-section">
            <div class="people-section-head"><div><span class="people-section-number">03</span><h3>Participações e vínculos</h3></div>
              <button class="people-primary" type="button" :disabled="!usuario.ativo || salvando" @click="abrirNovoVinculo">+ Adicionar vínculo</button>
            </div>
            <div v-if="vinculoGenericoNaBase" class="people-pending-message">
              <strong>Vínculo genérico redundante identificado.</strong>
              <p>O laboratório-base já autoriza este laboratório. O vínculo genérico pré-existente pode ser encerrado para evitar duplicidade, sem retirar o acesso pelo laboratório-base. Vínculos com Projeto, SCI ou Atividade devem ser mantidos.</p>
            </div>
            <div class="people-tabs"><button type="button" :class="{active:tab==='ATIVOS'}" @click="tab='ATIVOS'">Vigentes ({{ ativos.length }})</button><button type="button" :class="{active:tab==='HISTORICO'}" @click="tab='HISTORICO'">Histórico ({{ historico.length }})</button></div>
            <div v-if="carregandoDetalhe" class="people-empty-inline">Carregando vínculos...</div>
            <div v-else-if="(tab==='ATIVOS'?ativos:historico).length === 0" class="people-empty-inline">{{ tab==='ATIVOS' ? 'Nenhum vínculo adicional vigente.' : 'Ainda não há registros encerrados.' }}</div>
            <div v-for="v in (tab==='ATIVOS'?ativos:historico)" :key="v.id" class="people-link-card">
              <div class="people-link-top"><span class="people-context-type">{{ contextoNivel(v) }}</span><span class="people-pill" :class="vigente(v)?'people-pill--vinculado':'people-pill--inativo'">{{ vigente(v)?'Vigente':'Encerrado / fora de vigência' }}</span></div>
              <strong>{{ contextoTitulo(v) }}</strong><small>{{ v.laboratorioNome }}{{ v.projetoNome ? ' → ' + v.projetoNome : '' }}{{ v.sciNome ? ' → ' + v.sciNome : '' }}</small>
              <div class="people-link-meta"><span>Início: {{ dataFormatada(v.dataInicio) }}</span><span>Fim: {{ v.encerrado ? dataFormatada(v.dataFim) : v.dataFim ? dataFormatada(v.dataFim) : 'Indeterminado' }}</span></div>
              <p v-if="v.observacao">{{ v.observacao }}</p>
              <div v-if="vigente(v)" class="people-link-actions"><button type="button" class="people-outline" :disabled="salvando" @click="abrirEdicaoVinculo(v)">Editar vínculo</button><button type="button" class="people-danger-outline" :disabled="salvando" @click="solicitarEncerramento(v)">Encerrar vínculo</button></div>
            </div>
          </section>
          <div class="people-footnote">Homologação DEV/DEMO. As permissões institucionais reais serão integradas posteriormente.</div>
        </div>
      </aside>
    </div>

    <div v-if="modalEdicao && usuario" class="people-modal-backdrop" @click.self="modalEdicao=false">
      <section class="people-modal" role="dialog" aria-modal="true" aria-label="Adicionar vínculo operacional">
        <header><div><span class="people-eyebrow">NOVO VÍNCULO OPERACIONAL</span><h2>Associar {{ usuario.nome }}</h2><p>Escolha o contexto mais específico. Os níveis superiores serão derivados automaticamente.</p></div><button class="people-close" type="button" @click="modalEdicao=false">×</button></header>
        <div class="people-modal-body">
          <div v-if="erro" class="people-feedback people-feedback--error">{{ erro }}</div>
          <label class="people-field"><span>Tipo de vínculo</span><select v-model="nivel" @change="selecionarLaboratorio"><option value="LABORATORIO">Laboratório</option><option value="PROJETO">Projeto</option><option value="SCI">SCI</option><option value="ATIVIDADE">Atividade</option></select></label>
          <label class="people-field"><span>Laboratório</span><select v-model="laboratorioId" @change="selecionarLaboratorio"><option value="">Selecione o laboratório</option><option v-for="l in laboratoriosValidos" :key="l.id" :value="l.id" :disabled="nivel === 'LABORATORIO' && l.id === (usuario ? baseAtual(usuario) : null)">{{ l.nome }}{{ nivel === 'LABORATORIO' && usuario && l.id === baseAtual(usuario) ? ' (já é laboratório-base)' : '' }}</option></select></label>
          <p v-if="baseRedundante" class="people-feedback people-feedback--error">Este laboratório já é a base do usuário. Para ele, cadastre apenas vínculo com Projeto, SCI ou Atividade.</p>
          <label v-if="nivel!=='LABORATORIO'" class="people-field"><span>Projeto</span><select v-model="projetoId" :disabled="!laboratorioId" @change="selecionarProjeto"><option value="">Selecione o projeto</option><option v-for="p in projetosValidos" :key="p.id" :value="p.id">{{ p.nome }}</option></select></label>
          <label v-if="nivel==='SCI'||nivel==='ATIVIDADE'" class="people-field"><span>SCI</span><select v-model="sciId" :disabled="!projetoId" @change="selecionarSci"><option value="">Selecione o SCI</option><option v-for="s in scis" :key="s.id" :value="s.id">{{ s.nome }}</option></select></label>
          <label v-if="nivel==='ATIVIDADE'" class="people-field"><span>Atividade</span><select v-model="atividadeId" :disabled="!sciId"><option value="">Selecione a atividade</option><option v-for="a in atividadesValidas" :key="a.id" :value="a.id">{{ a.nome }}</option></select></label>
          <label class="people-field"><span>Data de início</span><input v-model="dataInicio" type="date" /></label>
          <label class="people-field"><span>Observação (opcional)</span><textarea v-model="observacao" rows="2" placeholder="Justificativa, referência ou informação útil para o histórico" /></label>
        </div>
        <footer><button class="people-outline" type="button" :disabled="salvando" @click="modalEdicao=false">Cancelar</button><button class="people-primary" type="button" :disabled="!podeSalvar || salvando" @click="salvarVinculo">{{ salvando?'Salvando...':'Confirmar vínculo' }}</button></footer>
      </section>
    </div>

    <div v-if="modalEditarVinculo" class="people-modal-backdrop" @click.self="modalEditarVinculo=null">
      <section class="people-modal people-modal--confirm" role="dialog" aria-modal="true" aria-label="Editar vínculo">
        <header><div><span class="people-eyebrow">ATUALIZAÇÃO DO VÍNCULO</span><h2>Editar informações</h2><p>{{ contextoTitulo(modalEditarVinculo) }} · {{ modalEditarVinculo.laboratorioNome }}</p></div><button type="button" class="people-close" @click="modalEditarVinculo=null">×</button></header>
        <div class="people-modal-body">
          <p>O vínculo foi iniciado em {{ dataFormatada(modalEditarVinculo.dataInicio) }}. Para trocar o Laboratório, Projeto, SCI ou Atividade, encerre este vínculo e cadastre outro.</p>
          <label class="people-field"><span>Fim previsto (opcional)</span><input v-model="edicaoDataFim" type="date" :min="modalEditarVinculo.dataInicio" /></label>
          <label class="people-field"><span>Observação</span><textarea v-model="edicaoObservacao" rows="3" /></label>
          <div v-if="erro" role="alert" class="people-feedback people-feedback--error">{{ erro }}</div>
        </div>
        <footer><button type="button" class="people-outline" :disabled="salvando" @click="modalEditarVinculo=null">Cancelar</button><button type="button" class="people-primary" :disabled="salvando" @click="salvarEdicaoVinculo">{{ salvando?'Salvando...':'Salvar alterações' }}</button></footer>
      </section>
    </div>
    <div v-if="modalEncerramento" class="people-modal-backdrop" @click.self="modalEncerramento=null">
      <section class="people-modal people-modal--confirm" role="alertdialog" aria-modal="true" aria-label="Confirmar encerramento do vínculo">
        <header><div><span class="people-eyebrow">CONFIRMAR ENCERRAMENTO</span><h2>Encerrar este vínculo?</h2></div></header>
        <div class="people-modal-body">
          <strong>{{ contextoTitulo(modalEncerramento) }}</strong>
          <p>O vínculo será encerrado imediatamente e permanecerá no histórico. Outros vínculos e o laboratório-base do usuário não serão alterados.</p>
          <p>Esta ação não pode ser desfeita. Se necessário, será possível cadastrar um novo vínculo posteriormente.</p>
          <div v-if="erro" class="people-feedback people-feedback--error">{{ erro }}</div>
        </div>
        <footer><button class="people-outline" type="button" :disabled="salvando" @click="modalEncerramento=null">Voltar</button><button class="people-danger" type="button" :disabled="salvando" @click="confirmarEncerramento">{{ salvando?'Encerrando...':'Sim, encerrar vínculo' }}</button></footer>
      </section>
    </div>
  </section>
</template>