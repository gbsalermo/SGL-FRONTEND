<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { residuoService } from '@/modules/residuos/services/residuoService'
import type {
  AnalisarResiduoRequest,
  ApiErrorResponse,
  HistoricoResiduoResponse,
  NivelRiscoResiduo,
  ResiduoResponse,
  StatusResiduo,
  TipoRiscoResiduo,
} from '@/modules/residuos/types/residuo'
import { useSessionStore } from '@/stores/session'

type FiltroResiduo = StatusResiduo | 'TODOS' | 'PENDENTES_ANALISE'

const session = useSessionStore()
const router = useRouter()
const route = useRoute()

const residuos = ref<ResiduoResponse[]>([])
const carregando = ref(false)
const enviando = ref(false)
const erro = ref('')
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
const localArmazenamentoTemporario = ref('')
const destinoFinalPrevisto = ref('')
const dataPrevistaDespacho = ref('')
const observacaoGestor = ref('')
const localArmazenamentoConfirmacao = ref('')
const destinoFinalConfirmado = ref('')
const observacaoDespacho = ref('')

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
  { valor: 'PENDENTES_ANALISE', rotulo: 'Pendentes de análise' },
  { valor: 'INFORMADO', rotulo: 'A receber' },
  { valor: 'EM_ANALISE', rotulo: 'Em análise' },
  { valor: 'LIBERADO_PARA_ARMAZENAMENTO', rotulo: 'Liberados' },
  { valor: 'ARMAZENADO_TEMPORARIAMENTE', rotulo: 'Armazenados' },
  { valor: 'DESPACHADO', rotulo: 'Despachados' },
]

const residuosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')
  return residuos.value.filter((residuo) => {
    const statusOk = aba.value === 'TODOS'
      || (aba.value === 'PENDENTES_ANALISE' && ['INFORMADO', 'EM_ANALISE'].includes(residuo.status))
      || residuo.status === aba.value
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
const podeRotular = computed(() => Boolean(
  selecionado.value && !['INFORMADO', 'EM_ANALISE'].includes(selecionado.value.status),
))

function quantidadeStatus(status: StatusResiduo) {
  return residuos.value.filter((residuo) => residuo.status === status).length
}

function quantidadeFiltro(filtro: FiltroResiduo) {
  if (filtro === 'TODOS') return residuos.value.length
  if (filtro === 'PENDENTES_ANALISE') {
    return residuos.value.filter((residuo) => ['INFORMADO', 'EM_ANALISE'].includes(residuo.status)).length
  }
  return quantidadeStatus(filtro)
}

function aplicarFiltroDaRota() {
  const filtro = Array.isArray(route.query.filtro) ? route.query.filtro[0] : route.query.filtro
  if (filtro === 'pendentes-analise') {
    aba.value = 'PENDENTES_ANALISE'
    return
  }

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
    residuos.value = await residuoService.listarTodos()
    if (selecionado.value) {
      selecionado.value = residuos.value.find((item) => item.id === selecionado.value?.id) ?? null
    }
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
  localArmazenamentoTemporario.value = residuo.localArmazenamentoTemporario ?? ''
  destinoFinalPrevisto.value = residuo.destinoFinalPrevisto ?? ''
  dataPrevistaDespacho.value = residuo.dataPrevistaDespacho ?? ''
  observacaoGestor.value = residuo.observacaoGestor ?? ''
  erro.value = ''
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
  if (!localArmazenamentoTemporario.value.trim()) throw new Error('Informe o local de armazenamento temporário.')
  if (!destinoFinalPrevisto.value.trim()) throw new Error('Informe o destino final previsto.')
  if (riscosConfirmados.value.length === 0) throw new Error('Confirme pelo menos uma classificação de risco.')
}

async function confirmarAnalise() {
  if (!selecionado.value || !session.usuario?.id) return
  erro.value = ''
  sucesso.value = ''
  try {
    validarAnalise()
    const payload: AnalisarResiduoRequest = {
      usuarioGestorId: session.usuario.id,
      nivelRiscoConfirmado: nivelRiscoConfirmado.value,
      riscosConfirmados: riscosConfirmados.value,
      localArmazenamentoTemporario: localArmazenamentoTemporario.value.trim(),
      destinoFinalPrevisto: destinoFinalPrevisto.value.trim(),
      dataPrevistaDespacho: dataPrevistaDespacho.value || null,
      observacaoGestor: observacaoGestor.value.trim() || null,
    }
    enviando.value = true
    const atualizado = await residuoService.analisarELiberar(selecionado.value.id, payload)
    atualizarResiduo(atualizado)
    analiseAberta.value = false
    limparSelecaoOperacional()
    sucesso.value = `Análise concluída. Código ${atualizado.codigoRastreio ?? 'gerado'} disponível para o rótulo.`
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    enviando.value = false
  }
}

function abrirArmazenamento(residuo: ResiduoResponse) {
  selecionado.value = residuo
  localArmazenamentoConfirmacao.value = residuo.localArmazenamentoTemporario ?? ''
  erro.value = ''
  sucesso.value = ''
  armazenamentoAberto.value = true
}

async function confirmarArmazenamento() {
  if (!selecionado.value || !session.usuario?.id) return
  enviando.value = true
  erro.value = ''
  sucesso.value = ''
  try {
    const atualizado = await residuoService.armazenar(selecionado.value.id, {
      usuarioGestorId: session.usuario.id,
      localArmazenamentoTemporario: localArmazenamentoConfirmacao.value.trim() || null,
    })
    atualizarResiduo(atualizado)
    armazenamentoAberto.value = false
    limparSelecaoOperacional()
    sucesso.value = 'Armazenamento temporário confirmado.'
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
  () => [route.query.filtro, route.query.status],
  aplicarFiltroDaRota,
  { immediate: true },
)

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
      <article><span>Em análise</span><strong>{{ quantidadeStatus('EM_ANALISE') }}</strong><small>classificação técnica</small></article>
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
            <tr v-for="residuo in residuosFiltrados" :key="residuo.id" @click="abrirDetalhes(residuo)">
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
            <h3>Composição informada</h3>
            <div class="components-list">
              <article v-for="componente in selecionado.componentes" :key="componente.id">
                <div>
                  <strong>{{ componente.nomeComponente }}</strong>
                  <small>{{ componente.produtoNomeCatalogo ? `Catálogo · ${componente.produtoNomeCatalogo}` : 'Componente livre' }}</small>
                </div>
                <span v-if="componente.principal">Principal</span>
                <p>{{ componente.concentracaoOuQuantidade ?? 'Quantidade/concentração não informada' }}</p>
              </article>
            </div>
          </section>

          <section class="risk-section">
            <div>
              <span>DECLARAÇÃO ORIGINAL</span>
              <h3>Risco {{ formatarEnum(selecionado.nivelRiscoInformado) }}</h3>
              <p>{{ selecionado.riscosInformados.map(formatarEnum).join(' · ') || 'Nenhum risco específico' }}</p>
              <small>{{ selecionado.observacaoGerador ?? 'Sem observação do gerador.' }}</small>
            </div>
            <div :class="{ pending: !selecionado.nivelRiscoConfirmado }">
              <span>CLASSIFICAÇÃO DA GESTÃO</span>
              <h3>{{ selecionado.nivelRiscoConfirmado ? `Risco ${formatarEnum(selecionado.nivelRiscoConfirmado)}` : 'Aguardando análise' }}</h3>
              <p>{{ selecionado.riscosConfirmados.length ? selecionado.riscosConfirmados.map(formatarEnum).join(' · ') : 'Nenhum risco confirmado ainda.' }}</p>
              <small>{{ selecionado.observacaoGestor ?? 'A classificação técnica preserva a declaração original.' }}</small>
            </div>
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
            <button v-if="podeRotular" class="label-action" type="button" @click="abrirRotulo(selecionado)">Visualizar rótulo</button>
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
          <div class="declaration-reference">
            <div><span>Informado pelo laboratório</span><strong>Risco {{ formatarEnum(selecionado.nivelRiscoInformado) }}</strong><p>{{ selecionado.riscosInformados.map(formatarEnum).join(' · ') }}</p></div>
            <p>A declaração original é histórica e não será sobrescrita.</p>
          </div>
          <div class="analysis-grid">
            <label class="field"><span>Nível de risco confirmado</span><select v-model="nivelRiscoConfirmado"><option value="NENHUM">Nenhum</option><option value="BAIXO">Baixo</option><option value="MEDIO">Médio</option><option value="ALTO">Alto</option></select></label>
            <label class="field"><span>Data prevista de despacho <small>(opcional)</small></span><input v-model="dataPrevistaDespacho" type="date" :min="minDataDespacho" /></label>
          </div>
          <fieldset class="risk-fieldset"><legend>Riscos confirmados</legend><button v-for="risco in tiposRisco" :key="risco.valor" type="button" :class="{ selected: riscosConfirmados.includes(risco.valor) }" @click="alternarRisco(risco.valor)"><span class="checkmark">{{ riscosConfirmados.includes(risco.valor) ? '✓' : '' }}</span>{{ risco.rotulo }}</button></fieldset>
          <div class="analysis-grid">
            <label class="field"><span>Local de armazenamento temporário</span><input v-model="localArmazenamentoTemporario" /></label>
            <label class="field"><span>Destino final previsto</span><input v-model="destinoFinalPrevisto" /></label>
          </div>
          <label class="field"><span>Observação técnica <small>(opcional)</small></span><textarea v-model="observacaoGestor" rows="4" /></label>
          <p class="guidance guidance--warning">Ao confirmar, o resíduo é liberado para armazenamento e o código de rastreio do rótulo é gerado.</p>
        </div>
        <footer><button class="secondary-action" type="button" @click="fecharAnalise">Cancelar</button><button class="analysis-action" type="button" :disabled="enviando" @click="confirmarAnalise">{{ enviando ? 'Salvando...' : 'Confirmar classificação' }}</button></footer>
      </section>
    </div>

    <div v-if="armazenamentoAberto && selecionado" class="modal-backdrop" @click.self="fecharArmazenamento">
      <section class="modal-card" role="dialog" aria-modal="true" aria-label="Confirmar armazenamento temporário">
        <header><div><span>ARMAZENAMENTO</span><h2>Confirmar armazenamento temporário</h2></div><button type="button" @click="fecharArmazenamento">×</button></header>
        <div class="modal-content">
          <div class="selected-summary"><strong>{{ selecionado.codigoRastreio }}</strong><span>{{ selecionado.descricao }}</span></div>
          <label class="field"><span>Local de armazenamento</span><input v-model="localArmazenamentoConfirmacao" placeholder="Local físico do recipiente" /></label>
          <p class="guidance">Confirme o local físico onde o recipiente rotulado foi armazenado. É possível corrigir o local definido na análise.</p>
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
.storage-action, .dispatch-action, .label-action { min-height: 40px; padding: 0 14px; border: 0; border-radius: 7px; color: #fff; font: inherit; font-size: 11px; font-weight: 850; cursor: pointer; }
.storage-action { background: #0f766e; }
.dispatch-action { background: #6b4fa1; }
.label-action { background: #173d7a; }
.storage-action:disabled, .dispatch-action:disabled { opacity: .55; cursor: default; }
.tracking-card { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 16px; border: 1px solid #d9e3f0; border-radius: 9px; background: #f8fbff; }
.tracking-card span { display: block; color: #738198; font-size: 9px; font-weight: 800; text-transform: uppercase; }
.tracking-card strong { display: block; margin-top: 5px; color: #17345e; font-size: 12px; line-height: 1.35; }
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
@media (max-width: 1180px) { .metrics-grid--five { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 760px) { .metrics-grid--five, .tracking-card { grid-template-columns: 1fr; } .timeline-card > div { flex-direction: column; gap: 4px; } }
</style>