<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

import type { PerfilUsuario } from '@/modules/auth/types/session'
import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import type {
  ApiErrorAdmin,
  LaboratorioCadastro,
  LaboratorioRequest,
  NivelRiscoCadastro,
  OrgaoFiscalizadorCadastro,
  ProdutoCadastro,
  ProdutoRequest,
  ProjetoCadastro,
  ProjetoRequest,
  TipoPerecivelCadastro,
  TipoRiscoCadastro,
  UnidadeCadastro,
  UnidadeMedidaCadastro,
  UsuarioPermissao,
} from '@/modules/admin/types/cadastros'
import { useSessionStore } from '@/stores/session'

type AbaCadastro = 'laboratorios' | 'projetos' | 'produtos' | 'permissoes'
type ModalCadastro = 'laboratorio' | 'projeto' | 'produto' | null

interface LaboratorioForm {
  unidadeId: string
  nome: string
  descricao: string
  responsavelId: string
  ativo: boolean
}

interface ProjetoForm {
  laboratorioId: string
  nome: string
  descricao: string
  dataInicio: string
  dataFim: string
  responsavel: string
  ativo: boolean
}

interface ProdutoForm {
  nome: string
  descricao: string
  codigoReferencia: string
  unidadeMedida: UnidadeMedidaCadastro
  localizacaoFisica: string
  risco: NivelRiscoCadastro
  tipoRisco: TipoRiscoCadastro
  descricaoRisco: string
  perecivel: boolean
  tipoPerecivel: TipoPerecivelCadastro
  condicoesArmazenamento: string
  unidadeArmazenamento: string
  fiscalizado: boolean
  orgaosFiscalizadores: OrgaoFiscalizadorCadastro[]
  observacaoFiscalizacao: string
  ativo: boolean
}

const session = useSessionStore()
const aba = ref<AbaCadastro>('laboratorios')
const unidades = ref<UnidadeCadastro[]>([])
const laboratorios = ref<LaboratorioCadastro[]>([])
const projetos = ref<ProjetoCadastro[]>([])
const produtos = ref<ProdutoCadastro[]>([])
const usuarios = ref<UsuarioPermissao[]>([])
const carregando = ref(false)
const salvando = ref(false)
const alterandoStatus = ref<string | null>(null)
const salvandoPerfil = ref<string | null>(null)
const erro = ref('')
const sucesso = ref('')
const busca = ref('')
const mostrarInativos = ref(false)

const modal = ref<ModalCadastro>(null)
const idEdicao = ref<string | null>(null)
const erroModal = ref('')

const laboratorioForm = ref<LaboratorioForm>(novoLaboratorio())
const projetoForm = ref<ProjetoForm>(novoProjeto())
const produtoForm = ref<ProdutoForm>(novoProduto())
const perfisEdicao = ref<Record<string, PerfilUsuario>>({})

const perfis: Array<{ valor: PerfilUsuario; rotulo: string }> = [
  { valor: 'ADMINISTRADOR', rotulo: 'Administrador' },
  { valor: 'GESTOR', rotulo: 'Gestor' },
  { valor: 'TECNICO', rotulo: 'Técnico' },
  { valor: 'ANALISTA', rotulo: 'Analista' },
  { valor: 'PESQUISADOR', rotulo: 'Pesquisador' },
  { valor: 'ESTAGIARIO', rotulo: 'Estagiário' },
]

const unidadesMedida: UnidadeMedidaCadastro[] = [
  'ML', 'L', 'MG', 'G', 'KG', 'UNIDADE', 'REACAO', 'CAIXA', 'FRASCO', 'AMPOLA', 'PAR', 'METRO', 'OUTRO',
]
const niveisRisco: NivelRiscoCadastro[] = ['NENHUM', 'BAIXO', 'MEDIO', 'ALTO']
const tiposRisco: TipoRiscoCadastro[] = [
  'NENHUM', 'INFLAMAVEL', 'RADIOATIVO', 'TOXICO', 'CORROSIVO', 'BIOLOGICO', 'IRRITANTE',
  'PERIGO_SAUDE', 'OXIDANTE', 'EXPLOSIVO', 'GAS_PRESSURIZADO', 'PERIGO_AMBIENTAL',
]
const tiposPerecivel: TipoPerecivelCadastro[] = ['NENHUM', 'QUIMICO', 'MICROBIANO', 'VEGETAL', 'ANIMAL']
const orgaosFiscalizadores: OrgaoFiscalizadorCadastro[] = [
  'POLICIA_FEDERAL', 'VIGILANCIA_SANITARIA', 'ANVISA', 'EXERCITO', 'OUTRO',
]

const abas: Array<{ id: AbaCadastro; titulo: string; descricao: string }> = [
  { id: 'laboratorios', titulo: 'Laboratórios', descricao: 'Estrutura, unidade e responsável' },
  { id: 'projetos', titulo: 'Projetos', descricao: 'Projetos vinculados aos laboratórios' },
  { id: 'produtos', titulo: 'Produtos', descricao: 'Catálogo-base de materiais do SGL' },
  { id: 'permissoes', titulo: 'Permissões', descricao: 'Perfis de acesso dos usuários existentes' },
]

const termoBusca = computed(() => busca.value.trim().toLocaleLowerCase('pt-BR'))

const laboratoriosFiltrados = computed(() => laboratorios.value.filter((item) => {
  const unidade = unidadeNome(item.unidadeId)
  const bateBusca = !termoBusca.value || [item.nome, item.descricao ?? '', item.responsavelNome ?? '', unidade]
    .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termoBusca.value))
  return bateBusca && (mostrarInativos.value || item.ativo)
}))

const projetosFiltrados = computed(() => projetos.value.filter((item) => {
  const bateBusca = !termoBusca.value || [item.nome, item.descricao ?? '', item.laboratorioNome, item.responsavel ?? '']
    .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termoBusca.value))
  return bateBusca && (mostrarInativos.value || item.ativo)
}))

const produtosFiltrados = computed(() => produtos.value.filter((item) => {
  const bateBusca = !termoBusca.value || [item.nome, item.codigoReferencia, item.descricao ?? '', item.localizacaoFisica ?? '']
    .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termoBusca.value))
  return bateBusca && (mostrarInativos.value || item.ativo)
}))

const usuariosFiltrados = computed(() => usuarios.value.filter((item) => {
  if (!termoBusca.value) return true
  return [item.nome, item.email, item.unidadeNome ?? '', item.laboratorioNome ?? '', rotuloPerfil(item.perfil)]
    .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termoBusca.value))
}))

const responsaveisLaboratorio = computed(() => {
  if (!laboratorioForm.value.unidadeId) return []
  return usuarios.value
    .filter((usuario) => usuario.ativo && usuario.unidadeId === laboratorioForm.value.unidadeId)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
})

const resumo = computed(() => ({
  laboratorios: laboratorios.value.filter((item) => item.ativo).length,
  projetos: projetos.value.filter((item) => item.ativo).length,
  produtos: produtos.value.filter((item) => item.ativo).length,
  usuarios: usuarios.value.filter((item) => item.ativo).length,
}))

function novoLaboratorio(): LaboratorioForm {
  return { unidadeId: '', nome: '', descricao: '', responsavelId: '', ativo: true }
}

function novoProjeto(): ProjetoForm {
  return { laboratorioId: '', nome: '', descricao: '', dataInicio: '', dataFim: '', responsavel: '', ativo: true }
}

function novoProduto(): ProdutoForm {
  return {
    nome: '', descricao: '', codigoReferencia: '', unidadeMedida: 'UNIDADE', localizacaoFisica: '',
    risco: 'NENHUM', tipoRisco: 'NENHUM', descricaoRisco: '', perecivel: false,
    tipoPerecivel: 'NENHUM', condicoesArmazenamento: '', unidadeArmazenamento: '',
    fiscalizado: false, orgaosFiscalizadores: [], observacaoFiscalizacao: '', ativo: true,
  }
}

function mensagemErro(error: unknown, fallback = 'Não foi possível concluir a operação.') {
  if (axios.isAxiosError<ApiErrorAdmin>(error)) return error.response?.data?.message ?? fallback
  return error instanceof Error ? error.message : fallback
}

function unidadeNome(id: string | null) {
  if (!id) return '—'
  const unidade = unidades.value.find((item) => item.id === id)
  if (!unidade) return '—'
  return unidade.sigla ? `${unidade.sigla} — ${unidade.nome}` : unidade.nome
}

function rotuloEnum(valor: string | null) {
  if (!valor) return '—'
  const especiais: Record<string, string> = {
    ML: 'mL', L: 'L', MG: 'mg', G: 'g', KG: 'kg', ANVISA: 'ANVISA',
    BOLSA_CNPQ: 'Bolsa CNPq', POLICIA_FEDERAL: 'Polícia Federal',
    VIGILANCIA_SANITARIA: 'Vigilância Sanitária', GAS_PRESSURIZADO: 'Gás pressurizado',
    PERIGO_SAUDE: 'Perigo à saúde',
  }
  if (especiais[valor]) return especiais[valor]
  return valor.toLocaleLowerCase('pt-BR').replaceAll('_', ' ').replace(/(^|\s)\S/g, (letra) => letra.toLocaleUpperCase('pt-BR'))
}

function rotuloPerfil(perfil: PerfilUsuario) {
  return perfis.find((item) => item.valor === perfil)?.rotulo ?? perfil
}

function formatarData(valor: string | null) {
  if (!valor) return '—'
  const [ano, mes, dia] = valor.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(ano, (mes ?? 1) - 1, dia ?? 1))
}

function selecionarAba(novaAba: AbaCadastro) {
  aba.value = novaAba
  busca.value = ''
  mostrarInativos.value = false
  erro.value = ''
  sucesso.value = ''
}

function abrirNovo() {
  idEdicao.value = null
  erroModal.value = ''
  if (aba.value === 'laboratorios') {
    laboratorioForm.value = novoLaboratorio()
    modal.value = 'laboratorio'
  } else if (aba.value === 'projetos') {
    projetoForm.value = novoProjeto()
    modal.value = 'projeto'
  } else if (aba.value === 'produtos') {
    produtoForm.value = novoProduto()
    modal.value = 'produto'
  }
}

function editarLaboratorio(item: LaboratorioCadastro) {
  idEdicao.value = item.id
  laboratorioForm.value = {
    unidadeId: item.unidadeId,
    nome: item.nome,
    descricao: item.descricao ?? '',
    responsavelId: item.responsavelId ?? '',
    ativo: item.ativo,
  }
  erroModal.value = ''
  modal.value = 'laboratorio'
}

function editarProjeto(item: ProjetoCadastro) {
  idEdicao.value = item.id
  projetoForm.value = {
    laboratorioId: item.laboratorioId,
    nome: item.nome,
    descricao: item.descricao ?? '',
    dataInicio: item.dataInicio ?? '',
    dataFim: item.dataFim ?? '',
    responsavel: item.responsavel ?? '',
    ativo: item.ativo,
  }
  erroModal.value = ''
  modal.value = 'projeto'
}

function editarProduto(item: ProdutoCadastro) {
  idEdicao.value = item.id
  produtoForm.value = {
    nome: item.nome,
    descricao: item.descricao ?? '',
    codigoReferencia: item.codigoReferencia,
    unidadeMedida: item.unidadeMedida,
    localizacaoFisica: item.localizacaoFisica ?? '',
    risco: item.risco,
    tipoRisco: item.tipoRisco ?? 'NENHUM',
    descricaoRisco: item.descricaoRisco ?? '',
    perecivel: item.perecivel,
    tipoPerecivel: item.tipoPerecivel ?? 'NENHUM',
    condicoesArmazenamento: item.condicoesArmazenamento ?? '',
    unidadeArmazenamento: item.unidadeArmazenamento ?? '',
    fiscalizado: item.fiscalizado,
    orgaosFiscalizadores: [...item.orgaosFiscalizadores],
    observacaoFiscalizacao: item.observacaoFiscalizacao ?? '',
    ativo: item.ativo,
  }
  erroModal.value = ''
  modal.value = 'produto'
}

function fecharModal() {
  if (salvando.value) return
  modal.value = null
  idEdicao.value = null
  erroModal.value = ''
}

function sincronizarResponsavel() {
  if (!responsaveisLaboratorio.value.some((usuario) => usuario.id === laboratorioForm.value.responsavelId)) {
    laboratorioForm.value.responsavelId = ''
  }
}

function sincronizarProduto() {
  if (produtoForm.value.risco === 'NENHUM') {
    produtoForm.value.tipoRisco = 'NENHUM'
    produtoForm.value.descricaoRisco = ''
  }
  if (!produtoForm.value.perecivel) produtoForm.value.tipoPerecivel = 'NENHUM'
  if (!produtoForm.value.fiscalizado) {
    produtoForm.value.orgaosFiscalizadores = []
    produtoForm.value.observacaoFiscalizacao = ''
  }
}

function alternarOrgao(orgao: OrgaoFiscalizadorCadastro, marcado: boolean) {
  const atual = new Set(produtoForm.value.orgaosFiscalizadores)
  if (marcado) atual.add(orgao)
  else atual.delete(orgao)
  produtoForm.value.orgaosFiscalizadores = [...atual]
}

async function salvarLaboratorio() {
  if (!laboratorioForm.value.unidadeId || !laboratorioForm.value.nome.trim()) {
    erroModal.value = 'Informe a unidade e o nome do laboratório.'
    return
  }
  const payload: LaboratorioRequest = {
    unidadeId: laboratorioForm.value.unidadeId,
    nome: laboratorioForm.value.nome.trim(),
    descricao: laboratorioForm.value.descricao.trim() || null,
    responsavelId: laboratorioForm.value.responsavelId || null,
    ativo: laboratorioForm.value.ativo,
  }
  salvando.value = true
  try {
    if (idEdicao.value) await cadastrosAdminService.atualizarLaboratorio(idEdicao.value, payload)
    else await cadastrosAdminService.criarLaboratorio(payload)
    sucesso.value = idEdicao.value ? 'Laboratório atualizado.' : 'Laboratório cadastrado.'
    fecharModalForcado()
    await carregar()
  } catch (error) {
    erroModal.value = mensagemErro(error)
  } finally {
    salvando.value = false
  }
}

async function salvarProjeto() {
  if (!projetoForm.value.laboratorioId || !projetoForm.value.nome.trim()) {
    erroModal.value = 'Informe o laboratório e o nome do projeto.'
    return
  }
  if (projetoForm.value.dataInicio && projetoForm.value.dataFim && projetoForm.value.dataFim < projetoForm.value.dataInicio) {
    erroModal.value = 'A data final não pode ser anterior à data inicial.'
    return
  }
  const payload: ProjetoRequest = {
    laboratorioId: projetoForm.value.laboratorioId,
    nome: projetoForm.value.nome.trim(),
    descricao: projetoForm.value.descricao.trim() || null,
    dataInicio: projetoForm.value.dataInicio || null,
    dataFim: projetoForm.value.dataFim || null,
    responsavel: projetoForm.value.responsavel.trim() || null,
    ativo: projetoForm.value.ativo,
  }
  salvando.value = true
  try {
    if (idEdicao.value) await cadastrosAdminService.atualizarProjeto(idEdicao.value, payload)
    else await cadastrosAdminService.criarProjeto(payload)
    sucesso.value = idEdicao.value ? 'Projeto atualizado.' : 'Projeto cadastrado.'
    fecharModalForcado()
    await carregar()
  } catch (error) {
    erroModal.value = mensagemErro(error)
  } finally {
    salvando.value = false
  }
}

async function salvarProduto() {
  sincronizarProduto()
  if (!produtoForm.value.nome.trim() || !produtoForm.value.codigoReferencia.trim()) {
    erroModal.value = 'Informe nome e código de referência do produto.'
    return
  }
  if (produtoForm.value.fiscalizado && produtoForm.value.orgaosFiscalizadores.length === 0) {
    erroModal.value = 'Selecione ao menos um órgão fiscalizador.'
    return
  }
  const payload: ProdutoRequest = {
    nome: produtoForm.value.nome.trim(),
    descricao: produtoForm.value.descricao.trim() || null,
    codigoReferencia: produtoForm.value.codigoReferencia.trim(),
    unidadeMedida: produtoForm.value.unidadeMedida,
    localizacaoFisica: produtoForm.value.localizacaoFisica.trim() || null,
    risco: produtoForm.value.risco,
    tipoRisco: produtoForm.value.tipoRisco,
    descricaoRisco: produtoForm.value.descricaoRisco.trim() || null,
    perecivel: produtoForm.value.perecivel,
    tipoPerecivel: produtoForm.value.tipoPerecivel,
    condicoesArmazenamento: produtoForm.value.condicoesArmazenamento.trim() || null,
    unidadeArmazenamento: produtoForm.value.unidadeArmazenamento.trim() || null,
    fiscalizado: produtoForm.value.fiscalizado,
    orgaosFiscalizadores: [...produtoForm.value.orgaosFiscalizadores],
    observacaoFiscalizacao: produtoForm.value.observacaoFiscalizacao.trim() || null,
    ativo: produtoForm.value.ativo,
  }
  salvando.value = true
  try {
    if (idEdicao.value) await cadastrosAdminService.atualizarProduto(idEdicao.value, payload)
    else await cadastrosAdminService.criarProduto(payload)
    sucesso.value = idEdicao.value ? 'Produto atualizado.' : 'Produto cadastrado.'
    fecharModalForcado()
    await carregar()
  } catch (error) {
    erroModal.value = mensagemErro(error)
  } finally {
    salvando.value = false
  }
}

function fecharModalForcado() {
  modal.value = null
  idEdicao.value = null
  erroModal.value = ''
}

async function alternarLaboratorio(item: LaboratorioCadastro) {
  alterandoStatus.value = item.id
  erro.value = ''
  try {
    await cadastrosAdminService.atualizarLaboratorio(item.id, {
      unidadeId: item.unidadeId,
      nome: item.nome,
      descricao: item.descricao,
      responsavelId: item.responsavelId,
      ativo: !item.ativo,
    })
    sucesso.value = `Laboratório ${item.ativo ? 'inativado' : 'reativado'}.`
    await carregar()
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    alterandoStatus.value = null
  }
}

async function alternarProjeto(item: ProjetoCadastro) {
  alterandoStatus.value = item.id
  erro.value = ''
  try {
    await cadastrosAdminService.atualizarProjeto(item.id, {
      laboratorioId: item.laboratorioId,
      nome: item.nome,
      descricao: item.descricao,
      dataInicio: item.dataInicio,
      dataFim: item.dataFim,
      responsavel: item.responsavel,
      ativo: !item.ativo,
    })
    sucesso.value = `Projeto ${item.ativo ? 'inativado' : 'reativado'}.`
    await carregar()
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    alterandoStatus.value = null
  }
}

async function alternarProduto(item: ProdutoCadastro) {
  alterandoStatus.value = item.id
  erro.value = ''
  try {
    await cadastrosAdminService.atualizarProduto(item.id, {
      nome: item.nome,
      descricao: item.descricao,
      codigoReferencia: item.codigoReferencia,
      unidadeMedida: item.unidadeMedida,
      localizacaoFisica: item.localizacaoFisica,
      risco: item.risco,
      tipoRisco: item.tipoRisco,
      descricaoRisco: item.descricaoRisco,
      perecivel: item.perecivel,
      tipoPerecivel: item.tipoPerecivel,
      condicoesArmazenamento: item.condicoesArmazenamento,
      unidadeArmazenamento: item.unidadeArmazenamento,
      fiscalizado: item.fiscalizado,
      orgaosFiscalizadores: [...item.orgaosFiscalizadores],
      observacaoFiscalizacao: item.observacaoFiscalizacao,
      ativo: !item.ativo,
    })
    sucesso.value = `Produto ${item.ativo ? 'inativado' : 'reativado'}.`
    await carregar()
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    alterandoStatus.value = null
  }
}

async function salvarPermissao(usuario: UsuarioPermissao) {
  const novoPerfil = perfisEdicao.value[usuario.id]
  if (!novoPerfil || novoPerfil === usuario.perfil || usuario.id === session.usuario?.id) return

  salvandoPerfil.value = usuario.id
  erro.value = ''
  try {
    await cadastrosAdminService.alterarPerfil(usuario.id, { perfil: novoPerfil })
    sucesso.value = `Permissão de ${usuario.nome} atualizada para ${rotuloPerfil(novoPerfil)}.`
    await carregar()
  } catch (error) {
    perfisEdicao.value[usuario.id] = usuario.perfil
    erro.value = mensagemErro(error)
  } finally {
    salvandoPerfil.value = null
  }
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const [units, labs, projects, products, users] = await Promise.all([
      cadastrosAdminService.listarUnidades(),
      cadastrosAdminService.listarLaboratorios(),
      cadastrosAdminService.listarProjetos(),
      cadastrosAdminService.listarProdutos(),
      cadastrosAdminService.listarUsuarios(),
    ])
    unidades.value = [...units].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    laboratorios.value = [...labs].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    projetos.value = [...projects].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    produtos.value = [...products].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    usuarios.value = [...users].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    perfisEdicao.value = Object.fromEntries(usuarios.value.map((usuario) => [usuario.id, usuario.perfil]))
  } catch (error) {
    erro.value = mensagemErro(error, 'Não foi possível carregar os cadastros administrativos.')
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <section class="admin-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">ADMINISTRAÇÃO / CADASTROS</p>
        <h1>Cadastros do SGL</h1>
        <span>Manutenção dos dados-base usados pelos fluxos do sistema.</span>
      </div>
      <button class="btn btn--ghost" type="button" :disabled="carregando" @click="carregar">
        {{ carregando ? 'Atualizando...' : 'Atualizar dados' }}
      </button>
    </header>

    <section class="summary-grid">
      <article><span>Laboratórios ativos</span><strong>{{ resumo.laboratorios }}</strong></article>
      <article><span>Projetos ativos</span><strong>{{ resumo.projetos }}</strong></article>
      <article><span>Produtos ativos</span><strong>{{ resumo.produtos }}</strong></article>
      <article><span>Usuários ativos</span><strong>{{ resumo.usuarios }}</strong><small>vindos do cadastro institucional</small></article>
    </section>

    <div class="scope-note">
      <strong>Escopo desta área</strong>
      <span>Unidades e usuários são dados institucionais. Aqui não existe cadastro manual de usuário nem de unidade; o Administrador apenas mantém os cadastros operacionais e pode alterar perfis de acesso.</span>
    </div>

    <div v-if="sucesso" class="feedback feedback--success">{{ sucesso }}</div>
    <div v-if="erro" class="feedback feedback--error">{{ erro }}</div>

    <section class="workspace">
      <aside class="tabs-card">
        <h2>Cadastros</h2>
        <button
          v-for="item in abas"
          :key="item.id"
          class="tab-button"
          :class="{ 'tab-button--active': aba === item.id }"
          type="button"
          @click="selecionarAba(item.id)"
        >
          <strong>{{ item.titulo }}</strong>
          <small>{{ item.descricao }}</small>
        </button>
      </aside>

      <div class="content-card">
        <header class="content-header">
          <div>
            <h2>{{ abas.find((item) => item.id === aba)?.titulo }}</h2>
            <p v-if="aba === 'laboratorios'">Cadastre a estrutura dos laboratórios e defina o responsável institucional.</p>
            <p v-else-if="aba === 'projetos'">Mantenha os projetos associados aos laboratórios.</p>
            <p v-else-if="aba === 'produtos'">Mantenha o catálogo de produtos; estoque e lotes continuam em suas áreas operacionais.</p>
            <p v-else>Usuários são criados pelo fluxo institucional. Aqui é alterado somente o perfil de acesso.</p>
          </div>
          <button v-if="aba !== 'permissoes'" class="btn btn--primary" type="button" @click="abrirNovo">
            + Novo {{ aba === 'laboratorios' ? 'laboratório' : aba === 'projetos' ? 'projeto' : 'produto' }}
          </button>
        </header>

        <div class="toolbar">
          <label class="search-field">
            <span>Buscar</span>
            <input v-model="busca" type="search" :placeholder="aba === 'permissoes' ? 'Nome, e-mail, unidade, laboratório ou perfil...' : 'Nome, código, responsável ou descrição...'" />
          </label>
          <label v-if="aba !== 'permissoes'" class="toggle-field">
            <input v-model="mostrarInativos" type="checkbox" />
            <span>Mostrar inativos</span>
          </label>
        </div>

        <div v-if="carregando" class="empty-state">Carregando dados...</div>

        <div v-else-if="aba === 'laboratorios'" class="table-wrap">
          <table>
            <thead><tr><th>Situação</th><th>Laboratório</th><th>Unidade</th><th>Responsável</th><th></th></tr></thead>
            <tbody>
              <tr v-for="item in laboratoriosFiltrados" :key="item.id">
                <td><span class="status" :class="item.ativo ? 'status--active' : 'status--inactive'">{{ item.ativo ? 'Ativo' : 'Inativo' }}</span></td>
                <td><strong>{{ item.nome }}</strong><small>{{ item.descricao || 'Sem descrição' }}</small></td>
                <td>{{ unidadeNome(item.unidadeId) }}</td>
                <td>{{ item.responsavelNome || 'Não definido' }}</td>
                <td class="actions">
                  <button type="button" @click="editarLaboratorio(item)">Editar</button>
                  <button type="button" :disabled="alterandoStatus === item.id" @click="alternarLaboratorio(item)">{{ item.ativo ? 'Inativar' : 'Reativar' }}</button>
                </td>
              </tr>
              <tr v-if="laboratoriosFiltrados.length === 0"><td colspan="5" class="empty-table">Nenhum laboratório encontrado.</td></tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="aba === 'projetos'" class="table-wrap">
          <table>
            <thead><tr><th>Situação</th><th>Projeto</th><th>Laboratório</th><th>Responsável</th><th>Período</th><th></th></tr></thead>
            <tbody>
              <tr v-for="item in projetosFiltrados" :key="item.id">
                <td><span class="status" :class="item.ativo ? 'status--active' : 'status--inactive'">{{ item.ativo ? 'Ativo' : 'Inativo' }}</span></td>
                <td><strong>{{ item.nome }}</strong><small>{{ item.descricao || 'Sem descrição' }}</small></td>
                <td>{{ item.laboratorioNome }}</td>
                <td>{{ item.responsavel || 'Não informado' }}</td>
                <td>{{ formatarData(item.dataInicio) }} → {{ formatarData(item.dataFim) }}</td>
                <td class="actions">
                  <button type="button" @click="editarProjeto(item)">Editar</button>
                  <button type="button" :disabled="alterandoStatus === item.id" @click="alternarProjeto(item)">{{ item.ativo ? 'Inativar' : 'Reativar' }}</button>
                </td>
              </tr>
              <tr v-if="projetosFiltrados.length === 0"><td colspan="6" class="empty-table">Nenhum projeto encontrado.</td></tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="aba === 'produtos'" class="table-wrap">
          <table class="products-table">
            <thead><tr><th>Situação</th><th>Produto</th><th>Unidade</th><th>Risco</th><th>Perecível</th><th>Fiscalização</th><th></th></tr></thead>
            <tbody>
              <tr v-for="item in produtosFiltrados" :key="item.id">
                <td><span class="status" :class="item.ativo ? 'status--active' : 'status--inactive'">{{ item.ativo ? 'Ativo' : 'Inativo' }}</span></td>
                <td><strong>{{ item.nome }}</strong><small>{{ item.codigoReferencia }} · {{ item.localizacaoFisica || 'sem localização' }}</small></td>
                <td>{{ rotuloEnum(item.unidadeMedida) }}</td>
                <td><strong>{{ rotuloEnum(item.risco) }}</strong><small>{{ rotuloEnum(item.tipoRisco) }}</small></td>
                <td>{{ item.perecivel ? rotuloEnum(item.tipoPerecivel) : 'Não' }}</td>
                <td><span v-if="item.fiscalizado" class="controlled">{{ item.orgaosFiscalizadores.map(rotuloEnum).join(', ') }}</span><span v-else>Não</span></td>
                <td class="actions">
                  <button type="button" @click="editarProduto(item)">Editar</button>
                  <button type="button" :disabled="alterandoStatus === item.id" @click="alternarProduto(item)">{{ item.ativo ? 'Inativar' : 'Reativar' }}</button>
                </td>
              </tr>
              <tr v-if="produtosFiltrados.length === 0"><td colspan="7" class="empty-table">Nenhum produto encontrado.</td></tr>
            </tbody>
          </table>
        </div>

        <div v-else class="table-wrap">
          <table class="permissions-table">
            <thead><tr><th>Usuário</th><th>Unidade / laboratório</th><th>Situação</th><th>Perfil atual</th><th>Novo perfil</th><th></th></tr></thead>
            <tbody>
              <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
                <td><strong>{{ usuario.nome }}</strong><small>{{ usuario.email }}</small></td>
                <td><strong>{{ usuario.unidadeNome || 'Sem unidade' }}</strong><small>{{ usuario.laboratorioNome || 'Sem laboratório' }}</small></td>
                <td><span class="status" :class="usuario.ativo ? 'status--active' : 'status--inactive'">{{ usuario.ativo ? 'Ativo' : 'Inativo' }}</span></td>
                <td>{{ rotuloPerfil(usuario.perfil) }}</td>
                <td>
                  <select v-model="perfisEdicao[usuario.id]" :disabled="usuario.id === session.usuario?.id">
                    <option v-for="perfilItem in perfis" :key="perfilItem.valor" :value="perfilItem.valor">{{ perfilItem.rotulo }}</option>
                  </select>
                  <small v-if="usuario.id === session.usuario?.id" class="self-note">Sessão atual — alteração bloqueada nesta tela</small>
                </td>
                <td class="actions">
                  <button
                    type="button"
                    :disabled="usuario.id === session.usuario?.id || perfisEdicao[usuario.id] === usuario.perfil || salvandoPerfil === usuario.id"
                    @click="salvarPermissao(usuario)"
                  >
                    {{ salvandoPerfil === usuario.id ? 'Salvando...' : 'Salvar perfil' }}
                  </button>
                </td>
              </tr>
              <tr v-if="usuariosFiltrados.length === 0"><td colspan="6" class="empty-table">Nenhum usuário encontrado.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div v-if="modal" class="modal-backdrop" @click.self="fecharModal">
      <section class="modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <span>{{ idEdicao ? 'EDIÇÃO' : 'NOVO CADASTRO' }}</span>
            <h2>{{ modal === 'laboratorio' ? 'Laboratório' : modal === 'projeto' ? 'Projeto' : 'Produto' }}</h2>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharModal">×</button>
        </header>

        <div v-if="erroModal" class="feedback feedback--error modal-feedback">{{ erroModal }}</div>

        <form v-if="modal === 'laboratorio'" class="modal-body" @submit.prevent="salvarLaboratorio">
          <div class="form-grid">
            <label class="field"><span>Unidade *</span><select v-model="laboratorioForm.unidadeId" required @change="sincronizarResponsavel"><option value="">Selecione...</option><option v-for="unidade in unidades" :key="unidade.id" :value="unidade.id">{{ unidade.sigla ? `${unidade.sigla} — ${unidade.nome}` : unidade.nome }}</option></select></label>
            <label class="field"><span>Nome *</span><input v-model="laboratorioForm.nome" required /></label>
          </div>
          <label class="field"><span>Responsável</span><select v-model="laboratorioForm.responsavelId" :disabled="!laboratorioForm.unidadeId"><option value="">Sem responsável definido</option><option v-for="usuario in responsaveisLaboratorio" :key="usuario.id" :value="usuario.id">{{ usuario.nome }} — {{ rotuloPerfil(usuario.perfil) }}</option></select><small>Somente usuários ativos da mesma unidade.</small></label>
          <label class="field"><span>Descrição</span><textarea v-model="laboratorioForm.descricao" rows="4" /></label>
          <label class="check-line"><input v-model="laboratorioForm.ativo" type="checkbox" /><span>Laboratório ativo</span></label>
          <footer class="modal-actions"><button class="btn btn--ghost" type="button" :disabled="salvando" @click="fecharModal">Cancelar</button><button class="btn btn--primary" type="submit" :disabled="salvando">{{ salvando ? 'Salvando...' : 'Salvar laboratório' }}</button></footer>
        </form>

        <form v-else-if="modal === 'projeto'" class="modal-body" @submit.prevent="salvarProjeto">
          <div class="form-grid">
            <label class="field"><span>Laboratório *</span><select v-model="projetoForm.laboratorioId" required><option value="">Selecione...</option><option v-for="lab in laboratorios.filter((item) => item.ativo || item.id === projetoForm.laboratorioId)" :key="lab.id" :value="lab.id">{{ lab.nome }}</option></select></label>
            <label class="field"><span>Nome *</span><input v-model="projetoForm.nome" required /></label>
            <label class="field"><span>Data de início</span><input v-model="projetoForm.dataInicio" type="date" /></label>
            <label class="field"><span>Data final</span><input v-model="projetoForm.dataFim" type="date" /></label>
          </div>
          <label class="field"><span>Responsável pelo projeto</span><input v-model="projetoForm.responsavel" placeholder="Nome do responsável" /></label>
          <label class="field"><span>Descrição</span><textarea v-model="projetoForm.descricao" rows="4" /></label>
          <label class="check-line"><input v-model="projetoForm.ativo" type="checkbox" /><span>Projeto ativo</span></label>
          <footer class="modal-actions"><button class="btn btn--ghost" type="button" :disabled="salvando" @click="fecharModal">Cancelar</button><button class="btn btn--primary" type="submit" :disabled="salvando">{{ salvando ? 'Salvando...' : 'Salvar projeto' }}</button></footer>
        </form>

        <form v-else class="modal-body product-form" @submit.prevent="salvarProduto">
          <section class="form-section">
            <h3>Identificação</h3>
            <div class="form-grid">
              <label class="field"><span>Nome *</span><input v-model="produtoForm.nome" required /></label>
              <label class="field"><span>Código de referência *</span><input v-model="produtoForm.codigoReferencia" required /></label>
              <label class="field"><span>Unidade de medida *</span><select v-model="produtoForm.unidadeMedida"><option v-for="item in unidadesMedida" :key="item" :value="item">{{ rotuloEnum(item) }}</option></select></label>
              <label class="field"><span>Localização física</span><input v-model="produtoForm.localizacaoFisica" placeholder="Armário, prateleira..." /></label>
            </div>
            <label class="field"><span>Descrição</span><textarea v-model="produtoForm.descricao" rows="3" /></label>
            <label class="field"><span>Apresentação / unidade de armazenamento</span><input v-model="produtoForm.unidadeArmazenamento" placeholder="Ex.: kit com 50 reações" /></label>
          </section>

          <section class="form-section">
            <h3>Risco e armazenamento</h3>
            <div class="form-grid">
              <label class="field"><span>Nível de risco *</span><select v-model="produtoForm.risco" @change="sincronizarProduto"><option v-for="item in niveisRisco" :key="item" :value="item">{{ rotuloEnum(item) }}</option></select></label>
              <label class="field"><span>Tipo de risco</span><select v-model="produtoForm.tipoRisco" :disabled="produtoForm.risco === 'NENHUM'"><option v-for="item in tiposRisco" :key="item" :value="item">{{ rotuloEnum(item) }}</option></select></label>
            </div>
            <label class="field"><span>Descrição do risco</span><textarea v-model="produtoForm.descricaoRisco" rows="2" :disabled="produtoForm.risco === 'NENHUM'" /></label>
            <label class="field"><span>Condições de armazenamento</span><textarea v-model="produtoForm.condicoesArmazenamento" rows="2" /></label>
          </section>

          <section class="form-section split-section">
            <div>
              <h3>Perecibilidade</h3>
              <label class="check-line"><input v-model="produtoForm.perecivel" type="checkbox" @change="sincronizarProduto" /><span>Produto perecível</span></label>
              <label class="field"><span>Tipo</span><select v-model="produtoForm.tipoPerecivel" :disabled="!produtoForm.perecivel"><option v-for="item in tiposPerecivel" :key="item" :value="item">{{ rotuloEnum(item) }}</option></select></label>
            </div>
            <div>
              <h3>Fiscalização externa</h3>
              <label class="check-line"><input v-model="produtoForm.fiscalizado" type="checkbox" @change="sincronizarProduto" /><span>Produto sujeito a controle externo</span></label>
              <div v-if="produtoForm.fiscalizado" class="checkbox-grid">
                <label v-for="orgao in orgaosFiscalizadores" :key="orgao"><input type="checkbox" :checked="produtoForm.orgaosFiscalizadores.includes(orgao)" @change="alternarOrgao(orgao, ($event.target as HTMLInputElement).checked)" /><span>{{ rotuloEnum(orgao) }}</span></label>
              </div>
              <label v-if="produtoForm.fiscalizado" class="field"><span>Observação de fiscalização</span><textarea v-model="produtoForm.observacaoFiscalizacao" rows="2" /></label>
            </div>
          </section>

          <label class="check-line"><input v-model="produtoForm.ativo" type="checkbox" /><span>Produto ativo no catálogo</span></label>
          <footer class="modal-actions"><button class="btn btn--ghost" type="button" :disabled="salvando" @click="fecharModal">Cancelar</button><button class="btn btn--primary" type="submit" :disabled="salvando">{{ salvando ? 'Salvando...' : 'Salvar produto' }}</button></footer>
        </form>
      </section>
    </div>
  </section>
</template>

<style scoped>
.admin-page { max-width: 1500px; margin: 0 auto; color: #1b2940; }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
.eyebrow { margin: 0 0 7px; color: #2459bd; font-size: 10px; font-weight: 900; letter-spacing: .08em; }
.page-header h1 { margin: 0; color: #0e2140; font-size: 31px; line-height: 1.1; }
.page-header span { display: block; margin-top: 7px; color: #6d7c91; font-size: 12px; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 11px; margin-bottom: 12px; }
.summary-grid article { padding: 15px 17px; border: 1px solid #dde5ef; border-radius: 9px; background: #fff; }
.summary-grid span { display: block; color: #728096; font-size: 9px; font-weight: 850; text-transform: uppercase; }
.summary-grid strong { display: block; margin-top: 5px; color: #17345e; font-size: 24px; }
.summary-grid small { color: #8490a1; font-size: 9px; }
.scope-note { display: flex; gap: 10px; margin-bottom: 16px; padding: 12px 14px; border: 1px solid #cbd9ed; border-radius: 8px; background: #f7faff; color: #526581; font-size: 11px; line-height: 1.45; }
.scope-note strong { flex: 0 0 auto; color: #274b81; }
.feedback { margin-bottom: 14px; padding: 12px 14px; border-radius: 8px; font-size: 11px; font-weight: 700; }
.feedback--success { border: 1px solid #bfe1c9; background: #f3fbf5; color: #237247; }
.feedback--error { border: 1px solid #efc5c5; background: #fff4f4; color: #9c2c2c; }
.workspace { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 16px; align-items: start; }
.tabs-card, .content-card { border: 1px solid #dde4ee; border-radius: 10px; background: #fff; box-shadow: 0 6px 20px rgb(22 45 80 / 5%); }
.tabs-card { display: grid; gap: 7px; padding: 14px; }
.tabs-card h2 { margin: 3px 4px 6px; font-size: 14px; }
.tab-button { min-height: 66px; display: grid; gap: 3px; padding: 11px 12px; border: 1px solid #e0e6ef; border-radius: 7px; background: #fff; color: #2b3d59; text-align: left; cursor: pointer; }
.tab-button strong { font-size: 12px; }
.tab-button small { color: #7a879a; font-size: 9px; line-height: 1.35; }
.tab-button--active { border-color: #4b7fe4; background: #f4f8ff; }
.content-card { min-width: 0; overflow: hidden; }
.content-header { min-height: 78px; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px 18px; border-bottom: 1px solid #e5eaf1; }
.content-header h2 { margin: 0; font-size: 17px; }
.content-header p { margin: 5px 0 0; color: #718097; font-size: 10px; }
.toolbar { display: flex; align-items: flex-end; gap: 14px; padding: 14px 18px; background: #fbfcfe; border-bottom: 1px solid #e9edf3; }
.search-field { flex: 1; display: grid; gap: 5px; }
.search-field span { color: #4c5c73; font-size: 9px; font-weight: 800; }
.search-field input { width: 100%; height: 38px; padding: 0 11px; border: 1px solid #cfd8e4; border-radius: 6px; font: inherit; font-size: 11px; }
.toggle-field, .check-line { display: inline-flex; align-items: center; gap: 7px; color: #526178; font-size: 10px; }
.btn { min-height: 38px; padding: 0 14px; border-radius: 6px; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.btn--primary { border: 1px solid #1d5fc5; background: #245fc4; color: #fff; }
.btn--ghost { border: 1px solid #cfd8e4; background: #fff; color: #34455e; }
.btn:disabled { opacity: .55; cursor: default; }
.table-wrap { overflow: auto; }
table { width: 100%; min-width: 900px; border-collapse: collapse; }
.products-table { min-width: 1120px; }
.permissions-table { min-width: 1050px; }
th { padding: 10px 12px; background: #f5f7fa; color: #67758a; font-size: 9px; font-weight: 850; text-align: left; text-transform: uppercase; }
td { padding: 12px; border-top: 1px solid #edf0f4; color: #48586f; font-size: 10px; vertical-align: middle; }
td strong, td small { display: block; }
td strong { color: #263952; font-size: 10.5px; }
td small { margin-top: 3px; color: #8491a3; font-size: 8.5px; }
.status { display: inline-flex; min-width: 58px; justify-content: center; padding: 4px 7px; border-radius: 999px; font-size: 8px; font-weight: 900; text-transform: uppercase; }
.status--active { background: #e8f7ee; color: #1b7140; }
.status--inactive { background: #eef1f5; color: #697587; }
.controlled { color: #244f98; font-weight: 700; }
.actions { white-space: nowrap; text-align: right; }
.actions button { margin-left: 6px; padding: 6px 8px; border: 1px solid #ced8e5; border-radius: 5px; background: #fff; color: #34506f; font: inherit; font-size: 9px; font-weight: 800; cursor: pointer; }
.actions button:disabled { opacity: .5; cursor: default; }
.permissions-table select { min-width: 155px; height: 34px; padding: 0 8px; border: 1px solid #cfd8e4; border-radius: 5px; background: #fff; font: inherit; font-size: 10px; }
.self-note { margin-top: 4px; color: #8a6b27; }
.empty-table, .empty-state { padding: 28px; color: #78869a; text-align: center; }
.modal-backdrop { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 24px; background: rgb(12 25 45 / 54%); }
.modal { width: min(780px, 96vw); max-height: 92vh; overflow: auto; border-radius: 11px; background: #fff; box-shadow: 0 25px 70px rgb(0 0 0 / 25%); }
.modal > header { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; padding: 15px 18px; border-bottom: 1px solid #e3e8ef; background: #fff; }
.modal > header span { color: #59709a; font-size: 8px; font-weight: 900; letter-spacing: .08em; }
.modal > header h2 { margin: 3px 0 0; font-size: 18px; }
.modal > header button { width: 34px; height: 34px; border: 0; background: transparent; color: #6b788a; font-size: 24px; cursor: pointer; }
.modal-feedback { margin: 12px 16px 0; }
.modal-body { display: grid; gap: 14px; padding: 17px 18px 18px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.field { display: grid; gap: 6px; }
.field span { color: #405169; font-size: 9px; font-weight: 800; }
.field input, .field select, .field textarea { width: 100%; padding: 0 10px; border: 1px solid #ccd6e2; border-radius: 6px; background: #fff; color: #26364e; font: inherit; font-size: 10.5px; }
.field input, .field select { height: 38px; }
.field textarea { padding-top: 9px; resize: vertical; }
.field small { color: #8490a1; font-size: 8.5px; }
.form-section { display: grid; gap: 11px; padding: 13px; border: 1px solid #e1e7ef; border-radius: 8px; background: #fcfdff; }
.form-section h3 { margin: 0; color: #263b5b; font-size: 11px; }
.split-section { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.split-section > div { display: grid; align-content: start; gap: 10px; }
.checkbox-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
.checkbox-grid label { display: flex; align-items: center; gap: 6px; color: #526178; font-size: 9px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 3px; }
@media (max-width: 1000px) { .workspace { grid-template-columns: 220px minmax(0, 1fr); } .summary-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 760px) { .page-header, .content-header, .toolbar { align-items: stretch; flex-direction: column; } .workspace { grid-template-columns: 1fr; } .tabs-card { grid-template-columns: repeat(2, minmax(0, 1fr)); } .tabs-card h2 { grid-column: 1 / -1; } .form-grid, .split-section { grid-template-columns: 1fr; } .scope-note { flex-direction: column; } }
@media (max-width: 520px) { .summary-grid, .tabs-card, .checkbox-grid { grid-template-columns: 1fr; } }
</style>
