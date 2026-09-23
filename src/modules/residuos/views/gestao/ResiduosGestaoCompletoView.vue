<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { residuoService } from '@/modules/residuos/services/residuoService'
import type {
  AnalisarResiduoRequest,
  ApiErrorResponse,
  ClasseResiduoResponse,
  HistoricoResiduoResponse,
  LocalArmazenamentoResiduoResponse,
  MedidaSegurancaResiduo,
  NivelRiscoResiduo,
  ResiduoResponse,
  StatusResiduo,
  TipoRiscoResiduo,
} from '@/modules/residuos/types/residuo'
import { useSessionStore } from '@/stores/session'

type FiltroResiduo = StatusResiduo | 'TODOS'
type ModoLocalAnalise = 'CATALOGO' | 'MANUAL'
type ModoLocalConfirmacao = 'MANTER' | 'CATALOGO' | 'MANUAL'

const session = useSessionStore()
const router = useRouter()
const route = useRoute()

const residuos = ref<ResiduoResponse[]>([])
const classesResiduo = ref<ClasseResiduoResponse[]>([])
const locaisArmazenamento = ref<LocalArmazenamentoResiduoResponse[]>([])
const carregando = ref(false)
const enviando = ref(false)
const erro = ref('')
const erroAnalise = ref('')
const sucesso = ref('')
const busca = ref('')
const aba = ref<FiltroResiduo>('TODOS')
const selecionado = ref<ResiduoResponse | null>(null)
const historico = ref<HistoricoResiduoResponse[]>([])
const carregandoHistorico = ref(false)

const recebimentoAberto = ref(false)
const analiseAberta = ref(false)
const armazenamentoAberto = ref(false)
const despachoAberto = ref(false)

const observacaoRecebimento = ref('')
const nivelRiscoConfirmado = ref<NivelRiscoResiduo>('BAIXO')
const riscosConfirmados = ref<TipoRiscoResiduo[]>([])
const modoLocalAnalise = ref<ModoLocalAnalise>('CATALOGO')
const localArmazenamentoResiduoId = ref('')
const complementoLocalArmazenamento = ref('')
const localArmazenamentoTemporario = ref('')
const destinoFinalPrevisto = ref('')
const dataPrevistaDespacho = ref('')
const observacaoGestor = ref('')
const classesConfirmadasIds = ref<string[]>([])
const medidasSegurancaConfirmadas = ref<MedidaSegurancaResiduo[]>([])
const observacaoSegurancaConfirmada = ref('')
const modoLocalConfirmacao = ref<ModoLocalConfirmacao>('MANTER')
const localArmazenamentoConfirmacaoId = ref('')
const complementoLocalConfirmacao = ref('')
const localArmazenamentoConfirmacao = ref('')
const destinoFinalConfirmado = ref('')
const observacaoDespacho = ref('')

const medidasSeguranca: Array<{ valor: MedidaSegurancaResiduo; rotulo: string }> = [
  { valor: 'LUVAS', rotulo: 'Luvas' },
  { valor: 'OCULOS_PROTECAO', rotulo: 'Óculos de proteção' },
  { valor: 'PROTECAO_RESPIRATORIA', rotulo: 'Proteção respiratória' },
  { valor: 'JALECO_AVENTAL', rotulo: 'Jaleco / avental' },
  { valor: 'OUTRO', rotulo: 'Outro' },
]

const tiposRisco: Array<{ valor: TipoRiscoResiduo; rotulo: string }> = [
  { valor: 'NENHUM', rotulo: 'Nenhum' },
  { valor: 'INFLAMAVEL', rotulo: 'Inflamável' },
  { valor: 'RADIOATIVO', rotulo: 'Radioativo' },
  { valor: 'TOXICO', rotulo: 'Tóxico' },
  { valor: 'CORROSIVO', rotulo: 'Corrosivo' },
  { valor: 'BIOLOGICO', rotulo: 'Biológico' },
  { valor: 'IRRITANTE', rotulo: 'Irritante' },
  { valor: 'PERIGO_SAUDE', rotulo: 'Perigo à saúde' },
  { valor: 'OXIDANTE', rotulo: 'Oxidante' },
  { valor: 'EXPLOSIVO', rotulo: 'Explosivo' },
  { valor: 'GAS_PRESSURIZADO', rotulo: 'Gás pressurizado' },
  { valor: 'PERIGO_AMBIENTAL', rotulo: 'Perigo ambiental' },
]

const abas: Array<{ valor: FiltroResiduo; rotulo: string }> = [
  { valor: 'TODOS', rotulo: 'Todos' },
  { valor: 'INFORMADO', rotulo: 'A receber' },
  { valor: 'EM_ANALISE', rotulo: 'Em análise' },
  { valor: 'LIBERADO_PARA_ARMAZENAMENTO', rotulo: 'Liberados' },
  { valor: 'ARMAZENADO_TEMPORARIAMENTE', rotulo: 'Armazenados' },
  { valor: 'DESPACHADO', rotulo: 'Despachados' },
]

const residuoAlvo = computed(() => typeof route.query.residuo === 'string' ? route.query.residuo : '')

const residuosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')
  return residuos.value.filter((residuo) => {
    const statusOk = aba.value === 'TODOS' || residuo.status === aba.value
    const buscaOk = !termo || [
      residuo.descricao,
      residuo.usuarioGeradorNome,
      residuo.laboratorioNome,
      residuo.projetoNome ?? '',
      residuo.codigoRastreio ?? '',
    ].some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
    return statusOk && buscaOk
  })
})

const minDataDespacho = computed(() => new Date().toISOString().slice(0, 10))
const podeVisualizarRotulo = computed(() => Boolean(selecionado.value))
const eventoLiberacao = computed(() =>
  [...historico.value]
    .reverse()
    .find((evento) => evento.acao === 'RISCO_CONFERIDO_E_RESIDUO_LIBERADO') ?? null,
)

function rotuloAcaoRotulo(status: StatusResiduo) {
  return ['INFORMADO', 'EM_ANALISE'].includes(status)
    ? 'Visualizar prévia do rótulo'
    : 'Visualizar rótulo'
}

function quantidadeStatus(status: StatusResiduo) {
  return residuos.value.filter((residuo) => residuo.status === status).length
}

function quantidadeFiltro(filtro: FiltroResiduo) {
  if (filtro === 'TODOS') return residuos.value.length
  return quantidadeStatus(filtro)
}

function aplicarFiltroDaRota() {
  const status = Array.isArray(route.query.status) ? route.query.status[0] : route.query.status
  const statusValidos: StatusResiduo[] = [
    'INFORMADO',
    'EM_ANALISE',
    'LIBERADO_PARA_ARMAZENAMENTO',
    'ARMAZENADO_TEMPORARIAMENTE',
    'DESPACHADO',
  ]
  if (status && statusValidos.includes(status as StatusResiduo)) {
    aba.value = status as StatusResiduo
    return
  }

  aba.value = 'TODOS'
}

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? 'Não foi possível concluir a operação.'
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.'
}

function statusRotulo(status: StatusResiduo) {
  const mapa: Record<StatusResiduo, string> = {
    INFORMADO: 'A receber',
    EM_ANALISE: 'Em análise',
    LIBERADO_PARA_ARMAZENAMENTO: 'Liberado',
    ARMAZENADO_TEMPORARIAMENTE: 'Armazenado',
    DESPACHADO: 'Despachado',
  }
  return mapa[status]
}

function formatarEnum(valor: string | null) {
  if (!valor) return '—'
  return valor.toLowerCase().replaceAll('_', ' ').replace(/^./, (letra) => letra.toUpperCase())
}

function formatarData(valor: string | null) {
  if (!valor) return '—'
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return valor
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(data)
}

function acaoHistorico(acao: string) {
  const mapa: Record<string, string> = {
    RESIDUO_INFORMADO: 'Resíduo informado pelo laboratório',
    RECEBIDO_PELA_GESTAO: 'Recebido pela Gestão',
    RISCO_CONFERIDO_E_RESIDUO_LIBERADO: 'Classificação concluída e resíduo liberado',
    ARMAZENAMENTO_TEMPORARIO_CONFIRMADO: 'Armazenamento temporário confirmado',
    ARMAZENAMENTO_TEMPORARIO_CORRIGIDO: 'Local de armazenamento corrigido na confirmação física',
    DESPACHO_CONFIRMADO: 'Despacho e destinação confirmados',
  }
  return mapa[acao] ?? formatarEnum(acao)
}

function atualizarResiduo(atualizado: ResiduoResponse) {
  const index = residuos.value.findIndex((item) => item.id === atualizado.id)
  if (index >= 0) residuos.value[index] = atualizado
}

function limparSelecaoOperacional() {
  selecionado.value = null
  historico.value = []
}

function fecharRecebimento() {
  if (enviando.value) return
  recebimentoAberto.value = false
  limparSelecaoOperacional()
}

function fecharAnalise() {
  if (enviando.value) return
  analiseAberta.value = false
  erroAnalise.value = ''
  limparSelecaoOperacional()
}

function fecharArmazenamento() {
  if (enviando.value) return
  armazenamentoAberto.value = false
  limparSelecaoOperacional()
}

function fecharDespacho() {
  if (enviando.value) return
  despachoAberto.value = false
  limparSelecaoOperacional()
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const [residuosCarregados, classesCarregadas, locaisCarregados] = await Promise.all([
      residuoService.listarTodos(),
      residuoService.listarClassesAtivas(),
      residuoService.listarLocaisArmazenamentoAtivos(),
    ])
    residuos.value = residuosCarregados
    classesResiduo.value = classesCarregadas
    locaisArmazenamento.value = locaisCarregados
    if (selecionado.value) {
      selecionado.value = residuos.value.find((item) => item.id === selecionado.value?.id) ?? null
    }
    await abrirResiduoDaRota()
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregando.value = false
  }
}

async function carregarHistorico(id: string) {
  carregandoHistorico.value = true
  try {
    historico.value = await residuoService.buscarHistorico(id)
  } catch {
    historico.value = []
  } finally {
    carregandoHistorico.value = false
  }
}

async function abrirDetalhes(residuo: ResiduoResponse) {
  selecionado.value = residuo
  historico.value = []
  await carregarHistorico(residuo.id)
}

async function abrirResiduoDaRota() {
  if (!residuoAlvo.value || residuos.value.length === 0) return
  const residuo = residuos.value.find((item) => item.id === residuoAlvo.value)
  if (!residuo) return
  await abrirDetalhes(residuo)
  requestAnimationFrame(() => {
    document.getElementById(`residuo-${residuo.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function fecharDetalhes() {
  limparSelecaoOperacional()
}

function abrirRecebimento(residuo: ResiduoResponse) {
  selecionado.value = residuo
  observacaoRecebimento.value = ''
  erro.value = ''
  sucesso.value = ''
  recebimentoAberto.value = true
}

async function confirmarRecebimento() {
  if (!selecionado.value || !session.usuario?.id) return
  enviando.value = true
  erro.value = ''
  sucesso.value = ''
  try {
    const atualizado = await residuoService.receber(selecionado.value.id, {
      usuarioGestorId: session.usuario.id,
      observacao: observacaoRecebimento.value.trim() || null,
    })
    atualizarResiduo(atualizado)
    recebimentoAberto.value = false
    limparSelecaoOperacional()
    sucesso.value = 'Recebimento registrado. O resíduo agora está em análise.'
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    enviando.value = false
  }
}

function abrirAnalise(residuo: ResiduoResponse) {
  selecionado.value = residuo
  nivelRiscoConfirmado.value = residuo.nivelRiscoConfirmado ?? residuo.nivelRiscoInformado
  riscosConfirmados.value = residuo.riscosConfirmados.length ? [...residuo.riscosConfirmados] : [...residuo.riscosInformados]

  if (residuo.localArmazenamentoResiduoId) {
    modoLocalAnalise.value = 'CATALOGO'
    localArmazenamentoResiduoId.value = residuo.localArmazenamentoResiduoId
    complementoLocalArmazenamento.value = residuo.complementoLocalArmazenamento ?? ''
    localArmazenamentoTemporario.value = ''
  } else if (residuo.localArmazenamentoTemporario) {
    modoLocalAnalise.value = 'MANUAL'
    localArmazenamentoResiduoId.value = ''
    complementoLocalArmazenamento.value = ''
    localArmazenamentoTemporario.value = residuo.localArmazenamentoTemporario
  } else {
    modoLocalAnalise.value = locaisArmazenamento.value.length ? 'CATALOGO' : 'MANUAL'
    localArmazenamentoResiduoId.value = ''
    complementoLocalArmazenamento.value = ''
    localArmazenamentoTemporario.value = ''
  }

  destinoFinalPrevisto.value = residuo.destinoFinalPrevisto ?? ''
  dataPrevistaDespacho.value = residuo.dataPrevistaDespacho ?? ''
  observacaoGestor.value = residuo.observacaoGestor ?? ''
  const classesAtivas = new Set(classesResiduo.value.map((classe) => classe.id))
  classesConfirmadasIds.value = (residuo.classesConfirmadas.length ? residuo.classesConfirmadas : residuo.classesInformadas)
    .map((classe) => classe.classeId)
    .filter((id) => classesAtivas.has(id))
  medidasSegurancaConfirmadas.value = residuo.medidasSegurancaConfirmadas.length
    ? [...residuo.medidasSegurancaConfirmadas]
    : [...residuo.medidasSegurancaInformadas]
  observacaoSegurancaConfirmada.value = residuo.observacaoSegurancaConfirmada
    ?? residuo.observacaoSegurancaInformada
    ?? ''
  erro.value = ''
  erroAnalise.value = ''
  sucesso.value = ''
  analiseAberta.value = true
}

function alternarRisco(risco: TipoRiscoResiduo) {
  const existe = riscosConfirmados.value.includes(risco)
  riscosConfirmados.value = existe
    ? riscosConfirmados.value.filter((item) => item !== risco)
    : [...riscosConfirmados.value, risco]

  if (risco === 'NENHUM' && !existe) riscosConfirmados.value = ['NENHUM']
  if (risco !== 'NENHUM' && !existe) riscosConfirmados.value = riscosConfirmados.value.filter((item) => item !== 'NENHUM')
}

function validarAnalise() {
  if (!session.usuario?.id) throw new Error('Sessão sem usuário gestor válido.')
  if (classesConfirmadasIds.value.length === 0) throw new Error('Confirme pelo menos uma classe de resíduo.')
  if (medidasSegurancaConfirmadas.value.includes('OUTRO') && !observacaoSegurancaConfirmada.value.trim()) {
    throw new Error('Descreva a medida de segurança marcada como Outro.')
  }
  if (modoLocalAnalise.value === 'CATALOGO' && !localArmazenamentoResiduoId.value) {
    throw new Error('Selecione um local de armazenamento cadastrado.')
  }
  if (modoLocalAnalise.value === 'MANUAL' && !localArmazenamentoTemporario.value.trim()) {
    throw new Error('Informe o local de armazenamento temporário.')
  }
  if (!destinoFinalPrevisto.value.trim()) throw new Error('Informe o destino final previsto.')
  if (riscosConfirmados.value.length === 0) throw new Error('Confirme pelo menos uma classificação de risco.')
}

async function confirmarAnalise() {
  if (!selecionado.value || !session.usuario?.id) return
  erro.value = ''
  erroAnalise.value = ''
  sucesso.value = ''
  try {
    validarAnalise()
    const payload: AnalisarResiduoRequest = {
      usuarioGestorId: session.usuario.id,
      nivelRiscoConfirmado: nivelRiscoConfirmado.value,
      riscosConfirmados: riscosConfirmados.value,
      classesConfirmadasIds: [...classesConfirmadasIds.value],
      medidasSegurancaConfirmadas: [...medidasSegurancaConfirmadas.value],
      observacaoSegurancaConfirmada: observacaoSegurancaConfirmada.value.trim() || null,
      localArmazenamentoResiduoId: modoLocalAnalise.value === 'CATALOGO'
        ? localArmazenamentoResiduoId.value || null
        : null,
      complementoLocalArmazenamento: modoLocalAnalise.value === 'CATALOGO'
        ? complementoLocalArmazenamento.value.trim() || null
        : null,
      localArmazenamentoTemporario: modoLocalAnalise.value === 'MANUAL'
        ? localArmazenamentoTemporario.value.trim() || null
        : null,
      destinoFinalPrevisto: destinoFinalPrevisto.value.trim(),
      dataPrevistaDespacho: dataPrevistaDespacho.value || null,
      observacaoGestor: observacaoGestor.value.trim() || null,
    }
    enviando.value = true
    const atualizado = await residuoService.analisarELiberar(selecionado.value.id, payload)
    atualizarResiduo(atualizado)
    analiseAberta.value = false
    limparSelecaoOperacional()
    sucesso.value = 'Análise concluída. Impressão do rótulo liberada.'
  } catch (error) {
    erroAnalise.value = mensagemErro(error)
  } finally {
    enviando.value = false
  }
}

function abrirArmazenamento(residuo: ResiduoResponse) {
  selecionado.value = residuo
  modoLocalConfirmacao.value = 'MANTER'
  localArmazenamentoConfirmacaoId.value = ''
  complementoLocalConfirmacao.value = ''
  localArmazenamentoConfirmacao.value = ''
  erro.value = ''
  sucesso.value = ''
  armazenamentoAberto.value = true
}

async function confirmarArmazenamento() {
  if (!selecionado.value || !session.usuario?.id) return

  if (modoLocalConfirmacao.value === 'CATALOGO' && !localArmazenamentoConfirmacaoId.value) {
    erro.value = 'Selecione o novo local cadastrado.'
    return
  }

  if (modoLocalConfirmacao.value === 'MANUAL' && !localArmazenamentoConfirmacao.value.trim()) {
    erro.value = 'Informe o novo local físico.'
    return
  }

  enviando.value = true
  erro.value = ''
  sucesso.value = ''
  try {
    const atualizado = await residuoService.armazenar(selecionado.value.id, {
      usuarioGestorId: session.usuario.id,
      localArmazenamentoResiduoId: modoLocalConfirmacao.value === 'CATALOGO'
        ? localArmazenamentoConfirmacaoId.value || null
        : null,
      complementoLocalArmazenamento: modoLocalConfirmacao.value === 'CATALOGO'
        ? complementoLocalConfirmacao.value.trim() || null
        : null,
      localArmazenamentoTemporario: modoLocalConfirmacao.value === 'MANUAL'
        ? localArmazenamentoConfirmacao.value.trim() || null
        : null,
    })
    atualizarResiduo(atualizado)
    armazenamentoAberto.value = false
    limparSelecaoOperacional()
    sucesso.value = modoLocalConfirmacao.value === 'MANTER'
      ? 'Armazenamento temporário confirmado.'
      : 'Armazenamento confirmado com correção do local físico.'
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    enviando.value = false
  }
}

function abrirDespacho(residuo: ResiduoResponse) {
  selecionado.value = residuo
  destinoFinalConfirmado.value = residuo.destinoFinalConfirmado ?? residuo.destinoFinalPrevisto ?? ''
  observacaoDespacho.value = ''
  erro.value = ''
  sucesso.value = ''
  despachoAberto.value = true
}

async function confirmarDespacho() {
  if (!selecionado.value || !session.usuario?.id) return
  if (!destinoFinalConfirmado.value.trim()) {
    erro.value = 'Informe o destino final confirmado.'
    return
  }

  enviando.value = true
  erro.value = ''
  sucesso.value = ''
  try {
    const atualizado = await residuoService.despachar(selecionado.value.id, {
      usuarioGestorId: session.usuario.id,
      destinoFinalConfirmado: destinoFinalConfirmado.value.trim(),
      observacao: observacaoDespacho.value.trim() || null,
    })
    atualizarResiduo(atualizado)
    despachoAberto.value = false
    limparSelecaoOperacional()
    sucesso.value = 'Despacho confirmado. O ciclo operacional do resíduo foi encerrado.'
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    enviando.value = false
  }
}

function abrirRotulo(residuo: ResiduoResponse) {
  router.push(`/residuos/${residuo.id}/rotulo`)
}

watch(
  () => route.query.status,
  aplicarFiltroDaRota,
  { immediate: true },
)

watch(() => route.query.residuo, () => {
  if (!carregando.value) void abrirResiduoDaRota()
})

onMounted(carregar)
</script>

<template>
  <section class="residuos-gestao-page residuos-completo">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">OPERAÇÃO / RESÍDUOS</p>
        <h1>Central de resíduos</h1>
        <p>Receba, classifique, rotule, armazene e acompanhe a destinação dos resíduos laboratoriais.</p>
      </div>
      <button class="secondary-action" type="button" :disabled="carregando" @click="carregar">Atualizar dados</button>
    </header>

    <div class="metrics-grid metrics-grid--five">
      <article><span>A receber</span><strong>{{ quantidadeStatus('INFORMADO') }}</strong><small>aguardando conferência física</small></article>
      <article><span>Em análise</span><strong>{{ quantidadeStatus('EM_ANALISE') }}</strong><small>prévia disponível · impressão bloqueada</small></article>
      <article><span>Liberados</span><strong>{{ quantidadeStatus('LIBERADO_PARA_ARMAZENAMENTO') }}</strong><small>rótulo disponível</small></article>
      <article><span>Armazenados</span><strong>{{ quantidadeStatus('ARMAZENADO_TEMPORARIAMENTE') }}</strong><small>aguardando destinação</small></article>
      <article><span>Despachados</span><strong>{{ quantidadeStatus('DESPACHADO') }}</strong><small>ciclo concluído</small></article>
    </div>

    <div v-if="sucesso" class="feedback feedback--success">{{ sucesso }}</div>
    <div v-if="erro" class="feedback feedback--error">{{ erro }}</div>

    <section class="workspace-card">
      <div class="status-tabs" role="tablist" aria-label="Filtrar resíduos por status">
        <button v-for="item in abas" :key="item.valor" type="button" :class="{ active: aba === item.valor }" @click="aba = item.valor">
          {{ item.rotulo }}
          <small>{{ quantidadeFiltro(item.valor) }}</small>
        </button>
      </div>

      <div class="toolbar">
        <label>
          <span>Busca</span>
          <input v-model="busca" type="search" placeholder="Descrição, gerador, laboratório, projeto ou código..." />
        </label>
        <div class="toolbar-note">{{ residuosFiltrados.length }} registro(s) exibido(s)</div>
      </div>

      <div v-if="carregando" class="state-box">Carregando resíduos...</div>
      <div v-else-if="residuosFiltrados.length === 0" class="state-box">Nenhum resíduo encontrado neste recorte.</div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Resíduo</th>
              <th>Origem</th>
              <th>Risco</th>
              <th>Informado em</th>
              <th class="actions-column">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="residuo in residuosFiltrados" :id="`residuo-${residuo.id}`" :key="residuo.id" :class="{ 'residuo-alvo': residuoAlvo === residuo.id }" @click="abrirDetalhes(residuo)">
              <td><span class="status-pill" :data-status="residuo.status">{{ statusRotulo(residuo.status) }}</span></td>
              <td>
                <strong>{{ residuo.descricao }}</strong>
                <small>{{ residuo.quantidade }} {{ residuo.unidadeMedida }} · {{ residuo.componentes.length }} componente(s)</small>
                <small v-if="residuo.codigoRastreio">{{ residuo.codigoRastreio }}</small>
              </td>
              <td><strong>{{ residuo.laboratorioNome }}</strong><small>{{ residuo.usuarioGeradorNome }}</small></td>
              <td>
                <strong>{{ formatarEnum(residuo.nivelRiscoConfirmado ?? residuo.nivelRiscoInformado) }}</strong>
                <small>{{ (residuo.riscosConfirmados.length ? residuo.riscosConfirmados : residuo.riscosInformados).map(formatarEnum).join(' · ') }}</small>
              </td>
              <td>{{ formatarData(residuo.dataInformacao) }}</td>
              <td class="actions-column" @click.stop>
                <button v-if="residuo.status === 'INFORMADO'" class="primary-action" type="button" @click="abrirRecebimento(residuo)">Receber</button>
                <button v-else-if="residuo.status === 'EM_ANALISE'" class="analysis-action" type="button" @click="abrirAnalise(residuo)">Analisar</button>
                <button v-else-if="residuo.status === 'LIBERADO_PARA_ARMAZENAMENTO'" class="storage-action" type="button" @click="abrirArmazenamento(residuo)">Armazenar</button>
                <button v-else-if="residuo.status === 'ARMAZENADO_TEMPORARIAMENTE'" class="dispatch-action" type="button" @click="abrirDespacho(residuo)">Despachar</button>
                <button v-else class="details-action" type="button" @click="abrirDetalhes(residuo)">Detalhes</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="selecionado && !recebimentoAberto && !analiseAberta && !armazenamentoAberto && !despachoAberto" class="drawer-backdrop" @click.self="fecharDetalhes">
      <aside class="detail-drawer">
        <header>
          <div>
            <span class="status-pill" :data-status="selecionado.status">{{ statusRotulo(selecionado.status) }}</span>
            <h2>{{ selecionado.descricao }}</h2>
            <p>{{ selecionado.codigoRastreio ?? selecionado.id }}</p>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharDetalhes">×</button>
        </header>

        <div class="detail-content">
          <section class="origin-grid">
            <article><span>Gerador</span><strong>{{ selecionado.usuarioGeradorNome }}</strong></article>
            <article><span>Laboratório</span><strong>{{ selecionado.laboratorioNome }}</strong></article>
            <article><span>Projeto</span><strong>{{ selecionado.projetoNome ?? 'Sem projeto' }}</strong></article>
            <article><span>Recipiente</span><strong>{{ selecionado.recipiente }}</strong></article>
          </section>

          <section>
            <h3>Processo de origem</h3>
            <p class="body-copy">{{ selecionado.processoOrigem }}</p>
          </section>

          <section>
            <h3>Caracterização</h3>
            <dl class="details-list">
              <div><dt>Estado físico</dt><dd>{{ selecionado.estadoFisico ? formatarEnum(selecionado.estadoFisico) : 'Não informado em registro histórico' }}</dd></div>
              <div><dt>Tratamento realizado</dt><dd>{{ selecionado.tratamentoRealizado === null ? 'Não informado em registro histórico' : selecionado.tratamentoRealizado ? 'Sim' : 'Não' }}</dd></div>
              <div v-if="selecionado.tratamentoRealizado"><dt>Descrição do tratamento</dt><dd>{{ selecionado.descricaoTratamento }}</dd></div>
            </dl>
          </section>

          <section>
            <h3>Composição informada</h3>
            <div class="components-list">
              <article v-for="componente in selecionado.componentes" :key="componente.id" class="component-item">
                <div class="component-item__header">
                  <div class="component-item__identity">
                    <strong>{{ componente.nomeComponente }}</strong>
                    <small>{{ componente.produtoNomeCatalogo ? `Catálogo · ${componente.produtoNomeCatalogo}` : 'Componente livre' }}</small>
                  </div>
                  <span v-if="componente.principal" class="component-principal">Principal</span>
                </div>
                <p>{{ componente.concentracaoOuQuantidade ?? 'Quantidade/concentração não informada' }}</p>
              </article>
            </div>
          </section>

          <section class="comparison-section">
            <article class="comparison-card comparison-card--original">
              <header><span>INFORMADO PELO LABORATÓRIO</span><strong>{{ selecionado.usuarioGeradorNome }}</strong></header>
              <dl>
                <div><dt>Classes</dt><dd><b>{{ selecionado.classesInformadas.map((classe) => classe.codigo).join(' · ') || 'Sem classe histórica' }}</b><small>{{ selecionado.classesInformadas.map((classe) => classe.descricao).join(' · ') || 'Nenhuma classe registrada.' }}</small></dd></div>
                <div><dt>Risco</dt><dd><b>Risco {{ formatarEnum(selecionado.nivelRiscoInformado) }}</b><small>{{ selecionado.riscosInformados.map(formatarEnum).join(' · ') || 'Nenhum risco específico' }}</small></dd></div>
                <div><dt>Segurança / EPI</dt><dd>{{ selecionado.medidasSegurancaInformadas.length ? selecionado.medidasSegurancaInformadas.map(formatarEnum).join(' · ') : 'Nenhuma medida específica' }}</dd></div>
                <div><dt>Observação</dt><dd>{{ selecionado.observacaoGerador ?? 'Sem observação do gerador.' }}</dd></div>
              </dl>
            </article>

            <article class="comparison-card comparison-card--approved" :class="{ pending: !selecionado.nivelRiscoConfirmado }">
              <header><span>APROVADO PELA GESTÃO</span><strong>{{ selecionado.nivelRiscoConfirmado ? 'Classificação liberada' : 'Aguardando análise' }}</strong></header>
              <dl>
                <div><dt>Classes</dt><dd><b>{{ selecionado.classesConfirmadas.map((classe) => classe.codigo).join(' · ') || 'Aguardando confirmação' }}</b><small>{{ selecionado.classesConfirmadas.map((classe) => classe.descricao).join(' · ') || 'Ainda não confirmadas.' }}</small></dd></div>
                <div><dt>Risco</dt><dd><b>{{ selecionado.nivelRiscoConfirmado ? `Risco ${formatarEnum(selecionado.nivelRiscoConfirmado)}` : 'Aguardando análise' }}</b><small>{{ selecionado.riscosConfirmados.length ? selecionado.riscosConfirmados.map(formatarEnum).join(' · ') : 'Nenhum risco confirmado ainda.' }}</small></dd></div>
                <div><dt>Segurança / EPI</dt><dd>{{ selecionado.medidasSegurancaConfirmadas.length ? selecionado.medidasSegurancaConfirmadas.map(formatarEnum).join(' · ') : 'Ainda não confirmada.' }}</dd></div>
                <div><dt>Observação técnica</dt><dd>{{ selecionado.observacaoGestor ?? 'Sem observação técnica.' }}</dd></div>
              </dl>
              <footer v-if="eventoLiberacao" class="approval-meta">
                <span>Liberado por</span>
                <strong>{{ eventoLiberacao.usuarioNome ?? 'Gestor não identificado' }}</strong>
                <small>{{ formatarData(eventoLiberacao.dataHora) }}</small>
              </footer>
            </article>
          </section>

          <section v-if="selecionado.codigoRastreio" class="tracking-card">
            <div><span>Código de rastreio</span><strong>{{ selecionado.codigoRastreio }}</strong></div>
            <div><span>Armazenamento</span><strong>{{ selecionado.localArmazenamentoTemporario ?? 'A definir' }}</strong></div>
            <div><span>Destino</span><strong>{{ selecionado.destinoFinalConfirmado ?? selecionado.destinoFinalPrevisto ?? 'A definir' }}</strong></div>
          </section>

          <section class="history-section">
            <div class="history-heading">
              <div><span>RASTREABILIDADE</span><h3>Histórico do resíduo</h3></div>
              <small>{{ historico.length }} evento(s)</small>
            </div>
            <div v-if="carregandoHistorico" class="history-state">Carregando histórico...</div>
            <div v-else-if="historico.length === 0" class="history-state">Nenhum evento registrado.</div>
            <ol v-else class="timeline">
              <li v-for="evento in historico" :key="evento.id">
                <span class="timeline-dot" />
                <div class="timeline-card">
                  <div><strong>{{ acaoHistorico(evento.acao) }}</strong><time>{{ formatarData(evento.dataHora) }}</time></div>
                  <p>{{ statusRotulo(evento.status) }} · {{ evento.usuarioNome ?? 'Sistema' }}</p>
                  <small v-if="evento.observacao">{{ evento.observacao }}</small>
                </div>
              </li>
            </ol>
          </section>

          <div class="drawer-actions drawer-actions--wrap">
            <button v-if="podeVisualizarRotulo" class="label-action" type="button" @click="abrirRotulo(selecionado)">{{ rotuloAcaoRotulo(selecionado.status) }}</button>
            <button v-if="selecionado.status === 'INFORMADO'" class="primary-action" type="button" @click="abrirRecebimento(selecionado)">Registrar recebimento</button>
            <button v-if="selecionado.status === 'EM_ANALISE'" class="analysis-action" type="button" @click="abrirAnalise(selecionado)">Analisar e classificar</button>
            <button v-if="selecionado.status === 'LIBERADO_PARA_ARMAZENAMENTO'" class="storage-action" type="button" @click="abrirArmazenamento(selecionado)">Confirmar armazenamento</button>
            <button v-if="selecionado.status === 'ARMAZENADO_TEMPORARIAMENTE'" class="dispatch-action" type="button" @click="abrirDespacho(selecionado)">Confirmar despacho</button>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="recebimentoAberto && selecionado" class="modal-backdrop" @click.self="fecharRecebimento">
      <section class="modal-card" role="dialog" aria-modal="true" aria-label="Receber resíduo">
        <header><div><span>RECEBIMENTO</span><h2>Confirmar chegada à Gestão</h2></div><button type="button" @click="fecharRecebimento">×</button></header>
        <div class="modal-content">
          <div class="selected-summary"><strong>{{ selecionado.descricao }}</strong><span>{{ selecionado.laboratorioNome }} · {{ selecionado.usuarioGeradorNome }}</span></div>
          <label class="field"><span>Observação do recebimento <small>(opcional)</small></span><textarea v-model="observacaoRecebimento" rows="4" /></label>
          <p class="guidance">Esta ação altera o status para <b>Em análise</b>. A classificação de risco permanece como originalmente informada até a análise técnica.</p>
        </div>
        <footer><button class="secondary-action" type="button" @click="fecharRecebimento">Cancelar</button><button class="primary-action" type="button" :disabled="enviando" @click="confirmarRecebimento">{{ enviando ? 'Registrando...' : 'Confirmar recebimento' }}</button></footer>
      </section>
    </div>

    <div v-if="analiseAberta && selecionado" class="modal-backdrop" @click.self="fecharAnalise">
      <section class="modal-card modal-card--large" role="dialog" aria-modal="true" aria-label="Analisar e classificar resíduo">
        <header><div><span>ANÁLISE TÉCNICA</span><h2>Classificar e liberar resíduo</h2></div><button type="button" @click="fecharAnalise">×</button></header>
        <div class="modal-content analysis-content">
          <div v-if="erroAnalise" class="feedback feedback--error modal-operation-error">{{ erroAnalise }}</div>
          <div class="declaration-reference">
            <div>
              <span>Informado pelo laboratório</span>
              <strong>Risco {{ formatarEnum(selecionado.nivelRiscoInformado) }}</strong>
              <p>{{ selecionado.riscosInformados.map(formatarEnum).join(' · ') }}</p>
              <p>Classes: {{ selecionado.classesInformadas.map((classe) => classe.codigo).join(' · ') }}</p>
              <p>Segurança: {{ selecionado.medidasSegurancaInformadas.length ? selecionado.medidasSegurancaInformadas.map(formatarEnum).join(' · ') : 'Nenhuma medida específica' }}</p>
            </div>
            <p>A declaração original é histórica e não será sobrescrita.</p>
          </div>
          <div class="analysis-grid">
            <label class="field"><span>Nível de risco confirmado</span><select v-model="nivelRiscoConfirmado"><option value="NENHUM">Nenhum</option><option value="BAIXO">Baixo</option><option value="MEDIO">Médio</option><option value="ALTO">Alto</option></select></label>
            <label class="field"><span>Data prevista de despacho <small>(opcional)</small></span><input v-model="dataPrevistaDespacho" type="date" :min="minDataDespacho" /></label>
          </div>
          <fieldset class="risk-fieldset"><legend>Riscos confirmados</legend><button v-for="risco in tiposRisco" :key="risco.valor" type="button" :class="{ selected: riscosConfirmados.includes(risco.valor) }" @click="alternarRisco(risco.valor)"><span class="checkmark">{{ riscosConfirmados.includes(risco.valor) ? '✓' : '' }}</span>{{ risco.rotulo }}</button></fieldset>

          <fieldset class="risk-fieldset"><legend>Classes confirmadas</legend><button v-for="classe in classesResiduo" :key="classe.id" type="button" :class="{ selected: classesConfirmadasIds.includes(classe.id) }" @click="classesConfirmadasIds = classesConfirmadasIds.includes(classe.id) ? classesConfirmadasIds.filter((id) => id !== classe.id) : [...classesConfirmadasIds, classe.id]"><span class="checkmark">{{ classesConfirmadasIds.includes(classe.id) ? '✓' : '' }}</span>{{ classe.codigo }} — {{ classe.descricao }}</button></fieldset>

          <fieldset class="risk-fieldset"><legend>Segurança / EPI confirmados</legend><button v-for="medida in medidasSeguranca" :key="medida.valor" type="button" :class="{ selected: medidasSegurancaConfirmadas.includes(medida.valor) }" @click="medidasSegurancaConfirmadas = medidasSegurancaConfirmadas.includes(medida.valor) ? medidasSegurancaConfirmadas.filter((item) => item !== medida.valor) : [...medidasSegurancaConfirmadas, medida.valor]"><span class="checkmark">{{ medidasSegurancaConfirmadas.includes(medida.valor) ? '✓' : '' }}</span>{{ medida.rotulo }}</button></fieldset>
          <label class="field"><span>Orientação complementar de segurança <small>(obrigatória para Outro)</small></span><textarea v-model="observacaoSegurancaConfirmada" rows="3" /></label>

          <section class="storage-choice">
            <span class="storage-choice__label">Local de armazenamento temporário</span>
            <div class="storage-choice__modes">
              <label><input v-model="modoLocalAnalise" type="radio" value="CATALOGO" /><span>Local cadastrado</span></label>
              <label><input v-model="modoLocalAnalise" type="radio" value="MANUAL" /><span>Informar manualmente</span></label>
            </div>

            <div v-if="modoLocalAnalise === 'CATALOGO'" class="analysis-grid">
              <label class="field">
                <span>Local cadastrado</span>
                <select v-model="localArmazenamentoResiduoId">
                  <option value="">Selecione...</option>
                  <option v-for="local in locaisArmazenamento" :key="local.id" :value="local.id">{{ local.nome }}</option>
                </select>
                <small v-if="locaisArmazenamento.length === 0">Nenhum local ativo cadastrado. Use a opção manual.</small>
              </label>
              <label class="field">
                <span>Complemento <small>(opcional)</small></span>
                <input v-model="complementoLocalArmazenamento" maxlength="150" placeholder="Ex.: Prateleira B2" />
              </label>
            </div>

            <label v-else class="field">
              <span>Local manual</span>
              <input v-model="localArmazenamentoTemporario" maxlength="255" placeholder="Descreva o local físico" />
            </label>
          </section>

          <label class="field"><span>Destino final previsto</span><input v-model="destinoFinalPrevisto" /></label>
          <label class="field"><span>Observação técnica <small>(opcional)</small></span><textarea v-model="observacaoGestor" rows="4" /></label>
          <p class="guidance guidance--warning">Ao confirmar, o resíduo é liberado para armazenamento e a impressão do rótulo é autorizada. O código SGL já foi gerado no registro inicial.</p>
        </div>
        <footer><button class="secondary-action" type="button" @click="fecharAnalise">Cancelar</button><button class="analysis-action" type="button" :disabled="enviando" @click="confirmarAnalise">{{ enviando ? 'Salvando...' : 'Confirmar classificação' }}</button></footer>
      </section>
    </div>

    <div v-if="armazenamentoAberto && selecionado" class="modal-backdrop" @click.self="fecharArmazenamento">
      <section class="modal-card" role="dialog" aria-modal="true" aria-label="Confirmar armazenamento temporário">
        <header><div><span>ARMAZENAMENTO</span><h2>Confirmar armazenamento temporário</h2></div><button type="button" @click="fecharArmazenamento">×</button></header>
        <div class="modal-content">
          <div class="selected-summary"><strong>{{ selecionado.codigoRastreio }}</strong><span>{{ selecionado.descricao }}</span></div>

          <div class="planned-location">
            <span>Local planejado</span>
            <strong>{{ selecionado.localArmazenamentoTemporario ?? 'Não definido' }}</strong>
          </div>

          <section class="storage-choice">
            <span class="storage-choice__label">Confirmação do local físico</span>
            <div class="storage-choice__modes storage-choice__modes--vertical">
              <label><input v-model="modoLocalConfirmacao" type="radio" value="MANTER" /><span>Manter o local planejado</span></label>
              <label><input v-model="modoLocalConfirmacao" type="radio" value="CATALOGO" /><span>Corrigir para outro local cadastrado</span></label>
              <label><input v-model="modoLocalConfirmacao" type="radio" value="MANUAL" /><span>Corrigir manualmente</span></label>
            </div>

            <div v-if="modoLocalConfirmacao === 'CATALOGO'" class="analysis-grid">
              <label class="field">
                <span>Novo local cadastrado</span>
                <select v-model="localArmazenamentoConfirmacaoId">
                  <option value="">Selecione...</option>
                  <option v-for="local in locaisArmazenamento" :key="local.id" :value="local.id">{{ local.nome }}</option>
                </select>
                <small v-if="locaisArmazenamento.length === 0">Nenhum local ativo cadastrado.</small>
              </label>
              <label class="field">
                <span>Complemento <small>(opcional)</small></span>
                <input v-model="complementoLocalConfirmacao" maxlength="150" placeholder="Ex.: Estante A1" />
              </label>
            </div>

            <label v-else-if="modoLocalConfirmacao === 'MANUAL'" class="field">
              <span>Novo local físico</span>
              <input v-model="localArmazenamentoConfirmacao" maxlength="255" placeholder="Descreva o local físico real" />
            </label>
          </section>

          <p class="guidance">Se o recipiente foi armazenado onde estava previsto, apenas mantenha o local planejado. Correções ficam registradas no histórico.</p>
        </div>
        <footer><button class="secondary-action" type="button" @click="fecharArmazenamento">Cancelar</button><button class="storage-action" type="button" :disabled="enviando" @click="confirmarArmazenamento">{{ enviando ? 'Confirmando...' : 'Confirmar armazenamento' }}</button></footer>
      </section>
    </div>

    <div v-if="despachoAberto && selecionado" class="modal-backdrop" @click.self="fecharDespacho">
      <section class="modal-card" role="dialog" aria-modal="true" aria-label="Confirmar despacho">
        <header><div><span>DESPACHO</span><h2>Confirmar destinação do resíduo</h2></div><button type="button" @click="fecharDespacho">×</button></header>
        <div class="modal-content">
          <div class="selected-summary"><strong>{{ selecionado.codigoRastreio }}</strong><span>{{ selecionado.descricao }}</span></div>
          <label class="field"><span>Destino final confirmado</span><input v-model="destinoFinalConfirmado" placeholder="Empresa, unidade ou destino responsável" /></label>
          <label class="field field--spaced"><span>Observação <small>(opcional)</small></span><textarea v-model="observacaoDespacho" rows="4" /></label>
          <p class="guidance guidance--warning">O despacho encerra o ciclo operacional do resíduo no SGL e fica registrado no histórico.</p>
        </div>
        <footer><button class="secondary-action" type="button" @click="fecharDespacho">Cancelar</button><button class="dispatch-action" type="button" :disabled="enviando" @click="confirmarDespacho">{{ enviando ? 'Confirmando...' : 'Confirmar despacho' }}</button></footer>
      </section>
    </div>
  </section>
</template>

<style scoped>
.residuos-completo { max-width: 1500px; margin: 0 auto; color: #16243b; }
.metrics-grid--five { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.residuo-alvo { background: #fbf8ff !important; box-shadow: inset 4px 0 0 #7446df; animation: destaque-residuo 900ms ease-out; }
@keyframes destaque-residuo { from { background: #eee5ff; } to { background: #fbf8ff; } }
.storage-action, .dispatch-action, .label-action { min-height: 40px; padding: 0 14px; border: 0; border-radius: 7px; color: #fff; font: inherit; font-size: 11px; font-weight: 850; cursor: pointer; }
.storage-action { background: #0f766e; }
.dispatch-action { background: #6b4fa1; }
.label-action { background: #173d7a; }
.storage-action:disabled, .dispatch-action:disabled { opacity: .55; cursor: default; }
.component-item { display: grid; gap: 8px !important; }
.component-item__header { min-width: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.component-item__identity { min-width: 0; flex: 1; }
.component-item__identity strong, .component-item__identity small { display: block; }
.component-item__identity strong { overflow-wrap: anywhere; }
.component-principal { flex: 0 0 auto; display: inline-flex; align-items: center; min-height: 26px; padding: 3px 9px; border: 1px solid var(--sgl-primary); border-radius: 999px; background: var(--sgl-surface-soft); color: var(--sgl-primary); font-size: var(--sgl-font-helper); font-weight: 800; letter-spacing: .02em; text-transform: uppercase; }
.component-item > p { margin: 0; }
.modal-operation-error { margin: 0; }
.details-list { display: grid; gap: 8px; margin: 0; }
.details-list div { display: grid; grid-template-columns: 150px 1fr; gap: 12px; }
.details-list dt { color: #7a879a; font-size: var(--sgl-font-helper); font-weight: 800; text-transform: uppercase; }
.details-list dd { margin: 0; color: #33465f; font-size: var(--sgl-font-label); }
.comparison-section { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.comparison-card { min-width: 0; display: flex; flex-direction: column; gap: 14px; padding: 16px; border: 1px solid #d9e3f0; border-radius: 10px; background: #f8fbff; }
.comparison-card--approved { border-color: #c7dfcf; background: #f5fbf7; }
.comparison-card.pending { border-color: #d9e3f0; background: #f8fafc; opacity: .82; }
.comparison-card > header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.comparison-card > header span { color: #738198; font-size: var(--sgl-font-helper); font-weight: 800; letter-spacing: .03em; }
.comparison-card > header strong { color: #263b5b; font-size: var(--sgl-font-label); text-align: right; }
.comparison-card dl { display: grid; gap: 10px; margin: 0; }
.comparison-card dl > div { display: grid; grid-template-columns: 105px 1fr; gap: 12px; padding-top: 10px; border-top: 1px solid rgb(164 180 202 / 25%); }
.comparison-card dt { color: #7a879a; font-size: var(--sgl-font-helper); font-weight: 800; text-transform: uppercase; }
.comparison-card dd { margin: 0; color: #33465f; font-size: var(--sgl-font-label); line-height: var(--sgl-line-height-body); }
.comparison-card dd b, .comparison-card dd small { display: block; }
.comparison-card dd small { margin-top: 3px; color: #6f7e92; font-size: var(--sgl-font-helper); }
.approval-meta { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px; margin-top: auto; padding-top: 12px; border-top: 1px solid #cfe0d4; }
.approval-meta span { color: #738198; font-size: var(--sgl-font-helper); font-weight: 800; text-transform: uppercase; }
.approval-meta strong { color: #20583a; font-size: var(--sgl-font-label); }
.approval-meta small { color: #718096; font-size: var(--sgl-font-helper); }
.tracking-card { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 16px; border: 1px solid #d9e3f0; border-radius: 9px; background: #f8fbff; }
.tracking-card span { display: block; color: #738198; font-size: var(--sgl-font-helper); font-weight: 800; text-transform: uppercase; }
.tracking-card strong { display: block; margin-top: 5px; color: #17345e; font-size: var(--sgl-font-body); line-height: var(--sgl-line-height-body); }
.history-section { padding-top: 2px; }
.history-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.history-heading span { color: #2456c4; font-size: 9px; font-weight: 900; letter-spacing: .06em; }
.history-heading h3 { margin: 3px 0 0; font-size: 15px; text-transform: none; }
.history-heading small { color: #7b889b; font-size: 10px; }
.history-state { margin-top: 12px; padding: 16px; border-radius: 8px; background: #f7f9fc; color: #718096; font-size: 11px; text-align: center; }
.timeline { margin: 16px 0 0; padding: 0; list-style: none; }
.timeline li { position: relative; display: grid; grid-template-columns: 18px 1fr; gap: 8px; padding-bottom: 16px; }
.timeline li:not(:last-child)::before { content: ''; position: absolute; left: 7px; top: 12px; bottom: -4px; width: 2px; background: #dbe4ef; }
.timeline-dot { position: relative; z-index: 1; width: 16px; height: 16px; margin-top: 3px; border: 4px solid #e7eef8; border-radius: 50%; background: #2456c4; }
.timeline-card { padding: 12px 14px; border: 1px solid #e0e6ef; border-radius: 8px; background: #fff; }
.timeline-card > div { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.timeline-card strong { color: #24354e; font-size: 11px; }
.timeline-card time { color: #8290a2; font-size: 9px; white-space: nowrap; }
.timeline-card p { margin: 5px 0 0; color: #64748b; font-size: 10px; }
.timeline-card small { display: block; margin-top: 7px; color: #7c899b; font-size: 9px; line-height: 1.45; }
.drawer-actions--wrap { flex-wrap: wrap; }
.field--spaced { margin-top: 15px; }
.storage-choice { display: grid; gap: 10px; padding: 12px; border: 1px solid #dce4ee; border-radius: 8px; background: #fbfcfe; }
.storage-choice__label { color: #405169; font-size: var(--sgl-font-label); font-weight: 700; text-transform: none; }
.storage-choice__modes { display: flex; flex-wrap: wrap; gap: 8px 14px; }
.storage-choice__modes--vertical { align-items: flex-start; flex-direction: column; }
.storage-choice__modes label { display: inline-flex; align-items: center; gap: 6px; color: #526178; font-size: var(--sgl-font-label); cursor: pointer; }
.storage-choice__modes input { margin: 0; }
.planned-location { display: grid; gap: 4px; padding: 11px 12px; border: 1px solid #cfe0d4; border-radius: 8px; background: #f5fbf7; }
.planned-location span { color: #648070; font-size: var(--sgl-font-label); font-weight: 700; text-transform: none; }
.planned-location strong { color: #20583a; font-size: var(--sgl-font-body); line-height: var(--sgl-line-height-body); }
@media (max-width: 1180px) { .metrics-grid--five { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 760px) { .metrics-grid--five, .tracking-card, .comparison-section { grid-template-columns: 1fr; } .timeline-card > div { flex-direction: column; gap: 4px; } .approval-meta { grid-template-columns: 1fr; } }
</style>