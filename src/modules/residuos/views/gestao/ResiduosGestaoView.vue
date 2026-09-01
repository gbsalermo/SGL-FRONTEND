<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

import { residuoService } from '@/modules/residuos/services/residuoService'
import type {
  AnalisarResiduoRequest,
  ApiErrorResponse,
  NivelRiscoResiduo,
  ResiduoResponse,
  StatusResiduo,
  TipoRiscoResiduo,
} from '@/modules/residuos/types/residuo'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()

const residuos = ref<ResiduoResponse[]>([])
const carregando = ref(false)
const enviando = ref(false)
const erro = ref('')
const sucesso = ref('')
const busca = ref('')
const aba = ref<StatusResiduo | 'TODOS'>('TODOS')
const selecionado = ref<ResiduoResponse | null>(null)
const recebimentoAberto = ref(false)
const analiseAberta = ref(false)
const observacaoRecebimento = ref('')

const nivelRiscoConfirmado = ref<NivelRiscoResiduo>('BAIXO')
const riscosConfirmados = ref<TipoRiscoResiduo[]>([])
const localArmazenamentoTemporario = ref('')
const destinoFinalPrevisto = ref('')
const dataPrevistaDespacho = ref('')
const observacaoGestor = ref('')

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

const abas: Array<{ valor: StatusResiduo | 'TODOS'; rotulo: string }> = [
  { valor: 'TODOS', rotulo: 'Todos' },
  { valor: 'INFORMADO', rotulo: 'A receber' },
  { valor: 'EM_ANALISE', rotulo: 'Em análise' },
  { valor: 'LIBERADO_PARA_ARMAZENAMENTO', rotulo: 'Liberados' },
  { valor: 'ARMAZENADO_TEMPORARIAMENTE', rotulo: 'Armazenados' },
  { valor: 'DESPACHADO', rotulo: 'Despachados' },
]

const residuosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return residuos.value.filter((residuo) => {
    const statusOk = aba.value === 'TODOS' || residuo.status === aba.value
    const buscaOk = !termo || [
      residuo.descricao,
      residuo.usuarioGeradorNome,
      residuo.laboratorioNome,
      residuo.projetoNome ?? '',
      residuo.codigoRastreio ?? '',
    ].some((valor) => valor.toLowerCase().includes(termo))
    return statusOk && buscaOk
  })
})

const minDataDespacho = computed(() => new Date().toISOString().slice(0, 10))

function quantidadeStatus(status: StatusResiduo) {
  return residuos.value.filter((residuo) => residuo.status === status).length
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
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor))
}

function atualizarResiduo(atualizado: ResiduoResponse) {
  const index = residuos.value.findIndex((item) => item.id === atualizado.id)
  if (index >= 0) residuos.value[index] = atualizado
  selecionado.value = atualizado
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
    sucesso.value = `Análise concluída. ${atualizado.codigoRastreio ?? 'O resíduo foi liberado para armazenamento.'}`
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    enviando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <section class="residuos-gestao-page">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">OPERAÇÃO / RESÍDUOS</p>
        <h1>Central de resíduos</h1>
        <p>Receba os recipientes informados pelos laboratórios e realize a classificação técnica.</p>
      </div>
      <button class="secondary-action" type="button" :disabled="carregando" @click="carregar">Atualizar dados</button>
    </header>

    <div class="metrics-grid">
      <article><span>A receber</span><strong>{{ quantidadeStatus('INFORMADO') }}</strong><small>aguardando conferência física</small></article>
      <article><span>Em análise</span><strong>{{ quantidadeStatus('EM_ANALISE') }}</strong><small>recebidos pela Gestão</small></article>
      <article><span>Liberados</span><strong>{{ quantidadeStatus('LIBERADO_PARA_ARMAZENAMENTO') }}</strong><small>classificação concluída</small></article>
      <article><span>Armazenados</span><strong>{{ quantidadeStatus('ARMAZENADO_TEMPORARIAMENTE') }}</strong><small>armazenamento temporário</small></article>
    </div>

    <div v-if="sucesso" class="feedback feedback--success">{{ sucesso }}</div>
    <div v-if="erro" class="feedback feedback--error">{{ erro }}</div>

    <section class="workspace-card">
      <div class="status-tabs" role="tablist" aria-label="Filtrar resíduos por status">
        <button v-for="item in abas" :key="item.valor" type="button" :class="{ active: aba === item.valor }" @click="aba = item.valor">
          {{ item.rotulo }}
          <small v-if="item.valor !== 'TODOS'">{{ quantidadeStatus(item.valor as StatusResiduo) }}</small>
          <small v-else>{{ residuos.length }}</small>
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
              <th>Risco informado</th>
              <th>Informado em</th>
              <th class="actions-column">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="residuo in residuosFiltrados" :key="residuo.id" @click="selecionado = residuo">
              <td><span class="status-pill" :data-status="residuo.status">{{ statusRotulo(residuo.status) }}</span></td>
              <td>
                <strong>{{ residuo.descricao }}</strong>
                <small>{{ residuo.quantidade }} {{ residuo.unidadeMedida }} · {{ residuo.componentes.length }} componente(s)</small>
                <small v-if="residuo.codigoRastreio">{{ residuo.codigoRastreio }}</small>
              </td>
              <td>
                <strong>{{ residuo.laboratorioNome }}</strong>
                <small>{{ residuo.usuarioGeradorNome }}</small>
              </td>
              <td>
                <strong>{{ formatarEnum(residuo.nivelRiscoInformado) }}</strong>
                <small>{{ residuo.riscosInformados.map(formatarEnum).join(' · ') }}</small>
              </td>
              <td>{{ formatarData(residuo.dataInformacao) }}</td>
              <td class="actions-column" @click.stop>
                <button v-if="residuo.status === 'INFORMADO'" class="primary-action" type="button" @click="abrirRecebimento(residuo)">Receber</button>
                <button v-else-if="residuo.status === 'EM_ANALISE'" class="analysis-action" type="button" @click="abrirAnalise(residuo)">Analisar</button>
                <button v-else class="details-action" type="button" @click="selecionado = residuo">Detalhes</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="selecionado && !recebimentoAberto && !analiseAberta" class="drawer-backdrop" @click.self="selecionado = null">
      <aside class="detail-drawer">
        <header>
          <div>
            <span class="status-pill" :data-status="selecionado.status">{{ statusRotulo(selecionado.status) }}</span>
            <h2>{{ selecionado.descricao }}</h2>
            <p>{{ selecionado.codigoRastreio ?? selecionado.id }}</p>
          </div>
          <button type="button" aria-label="Fechar" @click="selecionado = null">×</button>
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
              <small>{{ selecionado.observacaoGestor ?? 'A classificação técnica será registrada sem substituir a declaração original.' }}</small>
            </div>
          </section>

          <section v-if="selecionado.status === 'LIBERADO_PARA_ARMAZENAMENTO'" class="next-stage-note">
            <strong>Análise concluída</strong>
            <p>O resíduo já possui classificação confirmada e código de rastreio. Rótulo/QR e armazenamento serão tratados na próxima etapa do módulo.</p>
          </section>

          <div class="drawer-actions">
            <button v-if="selecionado.status === 'INFORMADO'" class="primary-action" type="button" @click="abrirRecebimento(selecionado)">Registrar recebimento</button>
            <button v-if="selecionado.status === 'EM_ANALISE'" class="analysis-action" type="button" @click="abrirAnalise(selecionado)">Analisar e classificar</button>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="recebimentoAberto && selecionado" class="modal-backdrop" @click.self="recebimentoAberto = false">
      <section class="modal-card" role="dialog" aria-modal="true" aria-label="Receber resíduo">
        <header>
          <div><span>RECEBIMENTO</span><h2>Confirmar chegada à Gestão</h2></div>
          <button type="button" aria-label="Fechar" @click="recebimentoAberto = false">×</button>
        </header>
        <div class="modal-content">
          <div class="selected-summary">
            <strong>{{ selecionado.descricao }}</strong>
            <span>{{ selecionado.laboratorioNome }} · {{ selecionado.usuarioGeradorNome }}</span>
          </div>
          <label class="field">
            <span>Observação do recebimento <small>(opcional)</small></span>
            <textarea v-model="observacaoRecebimento" rows="4" placeholder="Ex.: recipiente recebido lacrado e encaminhado para conferência..." />
          </label>
          <p class="guidance">Esta ação altera o status de <b>Informado</b> para <b>Em análise</b>. A classificação de risco ainda não será alterada.</p>
        </div>
        <footer>
          <button class="secondary-action" type="button" @click="recebimentoAberto = false">Cancelar</button>
          <button class="primary-action" type="button" :disabled="enviando" @click="confirmarRecebimento">{{ enviando ? 'Registrando...' : 'Confirmar recebimento' }}</button>
        </footer>
      </section>
    </div>

    <div v-if="analiseAberta && selecionado" class="modal-backdrop" @click.self="analiseAberta = false">
      <section class="modal-card modal-card--large" role="dialog" aria-modal="true" aria-label="Analisar e classificar resíduo">
        <header>
          <div><span>ANÁLISE TÉCNICA</span><h2>Classificar e liberar resíduo</h2></div>
          <button type="button" aria-label="Fechar" @click="analiseAberta = false">×</button>
        </header>

        <div class="modal-content analysis-content">
          <div class="declaration-reference">
            <div>
              <span>Informado pelo laboratório</span>
              <strong>Risco {{ formatarEnum(selecionado.nivelRiscoInformado) }}</strong>
              <p>{{ selecionado.riscosInformados.map(formatarEnum).join(' · ') }}</p>
            </div>
            <p>Essa declaração é histórica e não será sobrescrita. Abaixo você registra a classificação técnica da Gestão.</p>
          </div>

          <div class="analysis-grid">
            <label class="field">
              <span>Nível de risco confirmado</span>
              <select v-model="nivelRiscoConfirmado">
                <option value="NENHUM">Nenhum</option>
                <option value="BAIXO">Baixo</option>
                <option value="MEDIO">Médio</option>
                <option value="ALTO">Alto</option>
              </select>
            </label>

            <label class="field">
              <span>Data prevista de despacho <small>(opcional)</small></span>
              <input v-model="dataPrevistaDespacho" type="date" :min="minDataDespacho" />
            </label>
          </div>

          <fieldset class="risk-fieldset">
            <legend>Riscos confirmados</legend>
            <button v-for="risco in tiposRisco" :key="risco.valor" type="button" :class="{ selected: riscosConfirmados.includes(risco.valor) }" @click="alternarRisco(risco.valor)">
              <span class="checkmark">{{ riscosConfirmados.includes(risco.valor) ? '✓' : '' }}</span>
              {{ risco.rotulo }}
            </button>
          </fieldset>

          <div class="analysis-grid">
            <label class="field">
              <span>Local de armazenamento temporário</span>
              <input v-model="localArmazenamentoTemporario" placeholder="Ex.: Abrigo de resíduos - setor químico A" />
            </label>
            <label class="field">
              <span>Destino final previsto</span>
              <input v-model="destinoFinalPrevisto" placeholder="Ex.: Empresa licenciada para tratamento químico" />
            </label>
          </div>

          <label class="field">
            <span>Observação técnica <small>(opcional)</small></span>
            <textarea v-model="observacaoGestor" rows="4" placeholder="Registre correções, justificativas da classificação ou orientações operacionais..." />
          </label>

          <p class="guidance guidance--warning">Ao confirmar, o backend muda o status para <b>Liberado para armazenamento</b> e gera o código de rastreio. A impressão do rótulo/QR não faz parte deste bloco.</p>
        </div>

        <footer>
          <button class="secondary-action" type="button" @click="analiseAberta = false">Cancelar</button>
          <button class="analysis-action" type="button" :disabled="enviando" @click="confirmarAnalise">{{ enviando ? 'Salvando análise...' : 'Confirmar classificação' }}</button>
        </footer>
      </section>
    </div>
  </section>
</template>

<style scoped>
.residuos-gestao-page { max-width: 1440px; margin: 0 auto; color: #16243b; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
.breadcrumb { margin: 0 0 10px; color: #2456c4; font-size: 10px; font-weight: 850; letter-spacing: .08em; }
.page-heading h1 { margin: 0; color: #091a36; font-size: clamp(28px, 3vw, 38px); letter-spacing: -.035em; }
.page-heading > div > p:last-child { margin: 10px 0 0; color: #65758d; font-size: 12px; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.metrics-grid article { padding: 16px 17px; border: 1px solid #dde5ef; border-radius: 10px; background: #fff; box-shadow: 0 7px 24px rgb(12 38 78 / 4%); }
.metrics-grid span { color: #6f7e94; font-size: 9px; font-weight: 850; text-transform: uppercase; }
.metrics-grid strong { display: block; margin-top: 5px; color: #0e2242; font-size: 25px; }
.metrics-grid small { color: #8995a7; font-size: 9px; }
.feedback { margin-bottom: 14px; padding: 12px 15px; border-radius: 8px; font-size: 11px; font-weight: 700; }
.feedback--success { border: 1px solid #bfe0ca; background: #f2fbf5; color: #176a37; }
.feedback--error { border: 1px solid #f2c4c4; background: #fff5f5; color: #a32828; }
.workspace-card { overflow: hidden; border: 1px solid #dde5ef; border-radius: 11px; background: #fff; box-shadow: 0 12px 36px rgb(11 35 73 / 5%); }
.status-tabs { display: flex; overflow-x: auto; padding: 0 16px; border-bottom: 1px solid #e4eaf2; }
.status-tabs button { min-height: 54px; display: flex; align-items: center; gap: 7px; padding: 0 14px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: #62728a; font: inherit; font-size: 11px; font-weight: 750; white-space: nowrap; cursor: pointer; }
.status-tabs button.active { border-bottom-color: #2456c4; color: #17479f; }
.status-tabs small { min-width: 20px; height: 20px; display: grid; place-items: center; border-radius: 999px; background: #edf1f6; color: #637189; font-size: 8px; }
.status-tabs button.active small { background: #e6edff; color: #2456c4; }
.toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; padding: 14px 18px; background: #fbfcfe; }
.toolbar label { width: min(100%, 520px); display: flex; flex-direction: column; gap: 5px; }
.toolbar label span { color: #68778d; font-size: 9px; font-weight: 800; text-transform: uppercase; }
.toolbar input { min-height: 39px; padding: 0 11px; border: 1px solid #ced8e5; border-radius: 7px; background: #fff; font: inherit; font-size: 11px; outline: 0; }
.toolbar input:focus { border-color: #2456c4; box-shadow: 0 0 0 3px rgb(36 86 196 / 7%); }
.toolbar-note { padding-bottom: 10px; color: #8591a2; font-size: 9px; }
.state-box { margin: 18px; padding: 30px; border-radius: 8px; background: #f7f9fc; color: #68768c; font-size: 11px; text-align: center; }
.table-wrap { overflow-x: auto; }
table { width: 100%; min-width: 980px; border-collapse: collapse; }
th { padding: 11px 14px; border-top: 1px solid #e8edf3; border-bottom: 1px solid #dfe6ee; background: #f7f9fc; color: #6f7e93; font-size: 8px; font-weight: 900; text-align: left; text-transform: uppercase; letter-spacing: .06em; }
td { padding: 14px; border-bottom: 1px solid #edf0f4; color: #43536b; font-size: 10px; vertical-align: middle; }
tbody tr { cursor: pointer; transition: background 140ms ease; }
tbody tr:hover { background: #fafcff; }
td strong, td small { display: block; }
td strong { color: #24354e; font-size: 10px; }
td small { margin-top: 4px; color: #7c899b; font-size: 8px; line-height: 1.35; }
.actions-column { width: 110px; text-align: right; }
.status-pill { display: inline-flex; align-items: center; min-height: 23px; padding: 0 8px; border-radius: 999px; background: #eef2f7; color: #52647d; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .04em; }
.status-pill[data-status='INFORMADO'] { background: #edf2ff; color: #2451ad; }
.status-pill[data-status='EM_ANALISE'] { background: #fff5d5; color: #866000; }
.status-pill[data-status='LIBERADO_PARA_ARMAZENAMENTO'] { background: #e6f7ec; color: #14733a; }
.status-pill[data-status='ARMAZENADO_TEMPORARIAMENTE'] { background: #e8f7f8; color: #106b73; }
.status-pill[data-status='DESPACHADO'] { background: #eef1f5; color: #4b596d; }
.primary-action, .analysis-action, .secondary-action, .details-action { min-height: 38px; padding: 0 13px; border-radius: 7px; font: inherit; font-size: 9px; font-weight: 850; cursor: pointer; }
.primary-action { border: 0; background: #2456c4; color: #fff; }
.analysis-action { border: 0; background: #187145; color: #fff; }
.secondary-action, .details-action { border: 1px solid #cfd8e5; background: #fff; color: #35465f; }
.primary-action:disabled, .analysis-action:disabled, .secondary-action:disabled { opacity: .55; cursor: default; }
.drawer-backdrop, .modal-backdrop { position: fixed; inset: 0; z-index: 90; background: rgb(4 16 38 / 46%); backdrop-filter: blur(1px); }
.detail-drawer { position: absolute; inset: 0 0 0 auto; width: min(100%, 650px); height: 100%; overflow-y: auto; background: #fff; box-shadow: -18px 0 55px rgb(5 22 53 / 22%); }
.detail-drawer > header, .modal-card > header, .modal-card > footer { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 20px 23px; }
.detail-drawer > header, .modal-card > header { border-bottom: 1px solid #e3e9f1; }
.detail-drawer h2, .modal-card h2 { margin: 8px 0 3px; color: #10233f; font-size: 20px; }
.detail-drawer header p { margin: 0; color: #7f8b9d; font-size: 9px; }
.detail-drawer header button, .modal-card header button { width: 35px; height: 35px; flex: 0 0 auto; border: 0; border-radius: 50%; background: #f2f5f8; color: #34445c; font-size: 21px; cursor: pointer; }
.detail-content { padding: 22px 23px 34px; }
.detail-content section + section { margin-top: 22px; }
.origin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.origin-grid article { padding: 11px; border-radius: 7px; background: #f7f9fc; }
.origin-grid span, .risk-section span, .declaration-reference span { display: block; color: #7e8b9d; font-size: 8px; font-weight: 850; text-transform: uppercase; }
.origin-grid strong { display: block; margin-top: 4px; color: #263750; font-size: 10px; }
.detail-content h3 { margin: 0 0 9px; color: #34455e; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
.body-copy { margin: 0; color: #566880; font-size: 10px; line-height: 1.6; }
.components-list article { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 5px 10px; padding: 11px 12px; border: 1px solid #e2e8f0; border-radius: 8px; }
.components-list article + article { margin-top: 7px; }
.components-list div { display: flex; flex-direction: column; gap: 2px; }
.components-list strong { font-size: 10px; }
.components-list small { color: #77869a; font-size: 8px; }
.components-list article > span { padding: 3px 6px; border-radius: 999px; background: #e9f0ff; color: #2456b8; font-size: 7px; font-weight: 850; text-transform: uppercase; }
.components-list p { grid-column: 1 / -1; margin: 2px 0 0; color: #65758b; font-size: 8px; }
.risk-section { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.risk-section > div { padding: 14px; border: 1px solid #dde5ef; border-radius: 8px; background: #fbfcfe; }
.risk-section > div:last-child { border-color: #cce3d4; background: #f5fbf7; }
.risk-section .pending { border-color: #e1e6ed; background: #f8fafc; }
.risk-section h3 { margin: 6px 0 5px; color: #1f314b; font-size: 13px; text-transform: none; }
.risk-section p { margin: 0 0 7px; color: #53647c; font-size: 9px; }
.risk-section small { color: #7a8799; font-size: 8px; line-height: 1.45; }
.next-stage-note { padding: 13px 14px; border: 1px solid #bfe0ca; border-radius: 8px; background: #f3faf5; }
.next-stage-note strong { color: #176b39; font-size: 10px; }
.next-stage-note p { margin: 5px 0 0; color: #567063; font-size: 9px; line-height: 1.5; }
.drawer-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 18px; border-top: 1px solid #e8edf3; }
.modal-backdrop { z-index: 100; display: grid; place-items: center; padding: 18px; }
.modal-card { width: min(100%, 560px); max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; border-radius: 12px; background: #fff; box-shadow: 0 28px 80px rgb(5 20 49 / 30%); }
.modal-card--large { width: min(100%, 850px); }
.modal-card > header span { color: #2456c4; font-size: 8px; font-weight: 900; letter-spacing: .07em; }
.modal-card > footer { justify-content: flex-end; border-top: 1px solid #e3e9f1; }
.modal-content { overflow-y: auto; padding: 22px 23px; }
.selected-summary { display: flex; flex-direction: column; gap: 4px; margin-bottom: 18px; padding: 13px; border-radius: 8px; background: #f6f8fb; }
.selected-summary strong { font-size: 11px; }
.selected-summary span { color: #718096; font-size: 9px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field > span, .risk-fieldset legend { color: #42536b; font-size: 9px; font-weight: 850; }
.field small { color: #8692a4; font-weight: 600; }
.field input, .field select, .field textarea { width: 100%; border: 1px solid #ccd6e3; border-radius: 7px; background: #fff; color: #1f3049; font: inherit; font-size: 10px; outline: 0; }
.field input, .field select { min-height: 41px; padding: 0 10px; }
.field textarea { resize: vertical; padding: 10px; line-height: 1.5; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: #2456c4; box-shadow: 0 0 0 3px rgb(36 86 196 / 7%); }
.guidance { margin: 14px 0 0; padding: 11px 12px; border-radius: 7px; background: #f4f7fb; color: #61718a; font-size: 9px; line-height: 1.5; }
.guidance--warning { border: 1px solid #eadba5; background: #fffaf0; color: #75611e; }
.declaration-reference { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 15px; border: 1px solid #dbe4f2; border-radius: 9px; background: #f7f9fd; }
.declaration-reference strong { display: block; margin-top: 4px; color: #1f3150; font-size: 12px; }
.declaration-reference div p { margin: 4px 0 0; color: #64748b; font-size: 9px; }
.declaration-reference > p { max-width: 330px; margin: 0; color: #68778e; font-size: 9px; line-height: 1.5; }
.analysis-content { display: flex; flex-direction: column; gap: 18px; }
.analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.risk-fieldset { display: flex; flex-wrap: wrap; gap: 7px; margin: 0; padding: 12px; border: 1px solid #dbe3ed; border-radius: 8px; }
.risk-fieldset legend { padding: 0 5px; }
.risk-fieldset button { min-height: 31px; display: flex; align-items: center; gap: 6px; padding: 0 9px; border: 1px solid #d2dbe6; border-radius: 999px; background: #fff; color: #586980; font: inherit; font-size: 8px; font-weight: 750; cursor: pointer; }
.risk-fieldset button.selected { border-color: #8db0ef; background: #edf3ff; color: #214fa9; }
.checkmark { width: 14px; height: 14px; display: grid; place-items: center; border: 1px solid currentColor; border-radius: 50%; font-size: 8px; }
@media (max-width: 900px) {
  .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .risk-section, .analysis-grid { grid-template-columns: 1fr; }
  .declaration-reference { align-items: flex-start; flex-direction: column; }
}
@media (max-width: 600px) {
  .page-heading { align-items: flex-start; flex-direction: column; }
  .metrics-grid, .origin-grid { grid-template-columns: 1fr; }
  .toolbar { align-items: stretch; flex-direction: column; }
  .toolbar label { width: 100%; }
  .risk-section { grid-template-columns: 1fr; }
  .modal-backdrop { padding: 0; }
  .modal-card { width: 100%; max-height: 100vh; border-radius: 0; }
}
</style>
