<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { estoqueService } from '@/modules/estoque/services/estoqueService'
import type {
  AtualizarLoteRequest,
  EntradaLoteRequest,
  EstoqueCentralResponse,
  LoteResponse,
  TipoEmbalagem,
} from '@/modules/estoque/types/estoque'
import { useSessionStore } from '@/stores/session'

type SituacaoLoteFiltro = 'TODOS' | 'VALIDO' | 'PROXIMO' | 'VENCIDO' | 'DESCARTADO'
type SituacaoLoteVisual = Exclude<SituacaoLoteFiltro, 'TODOS'>

const route = useRoute()
const session = useSessionStore()

const estoque = ref<EstoqueCentralResponse | null>(null)
const lotes = ref<LoteResponse[]>([])
const carregando = ref(true)
const erro = ref('')
const visualizacaoQuantidade = ref('UNITARIA')
const buscaLote = ref('')
const situacaoLote = ref<SituacaoLoteFiltro>('TODOS')

const modalEntradaAberto = ref(false)
const salvandoEntrada = ref(false)
const erroEntrada = ref('')
const sucessoEntrada = ref('')

const modalLoteAberto = ref(false)
const loteSelecionado = ref<LoteResponse | null>(null)
const editandoLote = ref(false)
const salvandoLote = ref(false)
const erroLote = ref('')
const sucessoLote = ref('')

const modalDescarteAberto = ref(false)
const salvandoDescarte = ref(false)
const erroDescarte = ref('')
const sucessoDescarte = ref('')
const formularioDescarte = ref({ quantidade: 0, justificativa: '' })

const tiposEmbalagem: Array<{ value: TipoEmbalagem; label: string }> = [
  { value: 'UNITARIO', label: 'Unitário' },
  { value: 'KIT', label: 'Kit' },
  { value: 'CAIXA', label: 'Caixa' },
  { value: 'GARRAFA', label: 'Garrafa' },
  { value: 'GALAO', label: 'Galão' },
]

const formularioEntrada = ref<EntradaLoteRequest>({
  numeroLote: '',
  tipoEmbalagem: 'UNITARIO',
  apresentacao: '',
  quantidade: 1,
  conteudoPorApresentacao: 1,
  fracionavel: true,
  dataValidade: null,
  origem: 'COMPRA',
  observacao: null,
})

const formularioLote = ref<AtualizarLoteRequest>({
  numeroLote: '',
  tipoEmbalagem: 'UNITARIO',
  apresentacao: '',
  fracionavel: true,
  observacao: null,
  dataValidade: null,
  ativo: true,
})

const estoqueId = computed(() => String(route.params.id ?? ''))
const usuarioId = computed(() => session.usuario?.id ?? '')
const lotesAtivos = computed(() => lotes.value.filter((lote) => lote.ativo))
const proximos = computed(() => lotesAtivos.value.filter(loteProximoVencimento).length)
const lotesVencidosComSaldo = computed(() => lotesAtivos.value.filter((lote) => loteVencido(lote) && lote.quantidadeDisponivel > 0))
const vencidos = computed(() => lotesVencidosComSaldo.value.length)
const quantidadeVencida = computed(() => lotesVencidosComSaldo.value.reduce((total, lote) => total + lote.quantidadeDisponivel, 0))

function rotuloTipoEmbalagem(tipo?: TipoEmbalagem | null, quantidade = 1) {
  const singular: Record<TipoEmbalagem, string> = {
    UNITARIO: 'unit.',
    KIT: 'kit',
    CAIXA: 'caixa',
    GARRAFA: 'garrafa',
    GALAO: 'galão',
  }
  const plural: Record<TipoEmbalagem, string> = {
    UNITARIO: 'unit.',
    KIT: 'kits',
    CAIXA: 'caixas',
    GARRAFA: 'garrafas',
    GALAO: 'galões',
  }
  const chave = tipo || 'UNITARIO'
  return quantidade === 1 ? singular[chave] : plural[chave]
}

function chaveEmbalagem(lote: LoteResponse) {
  const tipo = lote.tipoEmbalagem || 'UNITARIO'
  const multiplicador = Number(lote.conteudoPorApresentacao) || 1
  return `${tipo}::${multiplicador}`
}

const opcoesEmbalagem = computed(() => {
  const mapa = new Map<string, { chave: string; tipo: TipoEmbalagem; multiplicador: number }>()
  lotesAtivos.value.forEach((lote) => {
    const tipo = lote.tipoEmbalagem || 'UNITARIO'
    const multiplicador = Number(lote.conteudoPorApresentacao) || 1
    const chave = chaveEmbalagem(lote)
    if (!mapa.has(chave)) mapa.set(chave, { chave, tipo, multiplicador })
  })
  return [...mapa.values()].sort((a, b) => a.tipo.localeCompare(b.tipo, 'pt-BR'))
})

const embalagemSelecionada = computed(() => opcoesEmbalagem.value.find((opcao) => opcao.chave === visualizacaoQuantidade.value) ?? null)

const quantidadeExibida = computed(() => {
  if (!estoque.value) return 0
  if (visualizacaoQuantidade.value === 'UNITARIA') return estoque.value.quantidadeAtual

  return lotesAtivos.value
    .filter((lote) => chaveEmbalagem(lote) === visualizacaoQuantidade.value)
    .reduce((total, lote) => {
      const multiplicador = Number(lote.conteudoPorApresentacao) || 1
      return total + Math.floor(lote.quantidadeDisponivel / multiplicador)
    }, 0)
})

const rotuloQuantidadeExibida = computed(() => {
  if (visualizacaoQuantidade.value === 'UNITARIA') return `${quantidadeExibida.value} unit.`
  const opcao = embalagemSelecionada.value
  if (!opcao) return '0 embalagens'
  return `${quantidadeExibida.value} ${rotuloTipoEmbalagem(opcao.tipo, quantidadeExibida.value)}`
})

const legendaQuantidade = computed(() => {
  if (visualizacaoQuantidade.value === 'UNITARIA') return 'Total geral convertido para unidades individuais.'
  const opcao = embalagemSelecionada.value
  if (!opcao) return ''
  return `${opcao.multiplicador} unit. por ${rotuloTipoEmbalagem(opcao.tipo)}. Outras embalagens não entram neste filtro.`
})

function dataFormatada(data: string | null) {
  if (!data) return 'Não informada'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${data}T00:00:00`))
}

function loteVencido(lote: LoteResponse) {
  if (!lote.dataValidade) return false
  return new Date(`${lote.dataValidade}T23:59:59`).getTime() < Date.now()
}

function loteProximoVencimento(lote: LoteResponse) {
  if (!lote.dataValidade || loteVencido(lote)) return false
  const validade = new Date(`${lote.dataValidade}T23:59:59`).getTime()
  return (validade - Date.now()) / 86_400_000 <= 30
}

function situacaoVisualLote(lote: LoteResponse): SituacaoLoteVisual {
  if (loteVencido(lote) && lote.quantidadeDisponivel <= 0) return 'DESCARTADO'
  if (loteVencido(lote)) return 'VENCIDO'
  if (loteProximoVencimento(lote)) return 'PROXIMO'
  return 'VALIDO'
}

const lotesFiltrados = computed(() => {
  const termo = buscaLote.value.trim().toLowerCase()

  return lotesAtivos.value.filter((lote) => {
    const status = situacaoVisualLote(lote)
    if (situacaoLote.value !== 'TODOS' && status !== situacaoLote.value) return false
    if (!termo) return true

    return [
      lote.codigoInterno,
      lote.numeroLote,
      lote.apresentacao,
      lote.tipoEmbalagem,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(termo)
  })
})

function limparFiltrosLote() {
  buscaLote.value = ''
  situacaoLote.value = 'TODOS'
}

function quantidadeFisica(lote: LoteResponse) {
  const recebida = Number(lote.quantidadeApresentacoes)
  if (recebida > 0) return recebida
  if ((lote.tipoEmbalagem || 'UNITARIO') === 'UNITARIO') return lote.quantidadeInicial
  return 0
}

function resumoRecebido(lote: LoteResponse) {
  const quantidade = quantidadeFisica(lote)
  return `${quantidade} ${rotuloTipoEmbalagem(lote.tipoEmbalagem, quantidade)}`
}

function resumoDisponivel(lote: LoteResponse) {
  return `${Math.max(0, lote.quantidadeDisponivel)} unit.`
}

function mensagemErro(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

async function carregar() {
  if (!estoqueId.value) return
  carregando.value = true
  erro.value = ''

  try {
    const [estoqueData, lotesData] = await Promise.all([
      estoqueService.buscarPorId(estoqueId.value),
      estoqueService.listarLotesPorEstoque(estoqueId.value),
    ])
    estoque.value = estoqueData
    lotes.value = lotesData

    if (visualizacaoQuantidade.value !== 'UNITARIA'
      && !opcoesEmbalagem.value.some((opcao) => opcao.chave === visualizacaoQuantidade.value)) {
      visualizacaoQuantidade.value = 'UNITARIA'
    }
  } catch (error) {
    erro.value = mensagemErro(error, 'Não foi possível carregar os detalhes deste estoque.')
  } finally {
    carregando.value = false
  }
}

function abrirEntrada() {
  erroEntrada.value = ''
  sucessoEntrada.value = ''
  sucessoDescarte.value = ''
  formularioEntrada.value = {
    numeroLote: '',
    tipoEmbalagem: 'UNITARIO',
    apresentacao: '',
    quantidade: 1,
    conteudoPorApresentacao: 1,
    fracionavel: true,
    dataValidade: null,
    origem: 'COMPRA',
    observacao: null,
  }
  modalEntradaAberto.value = true
}

function fecharEntrada() {
  if (!salvandoEntrada.value) modalEntradaAberto.value = false
}

async function registrarEntrada() {
  if (!usuarioId.value) return void (erroEntrada.value = 'A sessão atual não possui usuário válido para registrar a movimentação.')

  const loteFornecedor = formularioEntrada.value.numeroLote.trim()
  const especificacao = formularioEntrada.value.apresentacao?.trim() || ''

  if (!loteFornecedor) return void (erroEntrada.value = 'Informe o lote ou referência do fornecedor.')
  if (!especificacao) return void (erroEntrada.value = 'Especifique a embalagem recebida.')
  if (!Number.isInteger(Number(formularioEntrada.value.quantidade)) || Number(formularioEntrada.value.quantidade) <= 0) {
    return void (erroEntrada.value = 'Informe quantas unidades ou embalagens foram recebidas.')
  }
  if (!Number.isInteger(Number(formularioEntrada.value.conteudoPorApresentacao)) || Number(formularioEntrada.value.conteudoPorApresentacao) <= 0) {
    return void (erroEntrada.value = 'Informe um multiplicador válido.')
  }

  salvandoEntrada.value = true
  erroEntrada.value = ''

  try {
    const criado = await estoqueService.registrarEntradaLote(estoqueId.value, usuarioId.value, {
      numeroLote: loteFornecedor,
      tipoEmbalagem: formularioEntrada.value.tipoEmbalagem,
      apresentacao: especificacao,
      quantidade: Number(formularioEntrada.value.quantidade),
      conteudoPorApresentacao: Number(formularioEntrada.value.conteudoPorApresentacao),
      fracionavel: formularioEntrada.value.fracionavel,
      dataValidade: formularioEntrada.value.dataValidade || null,
      origem: formularioEntrada.value.origem,
      observacao: formularioEntrada.value.observacao?.trim() || null,
    })

    modalEntradaAberto.value = false
    sucessoEntrada.value = `Entrada ${criado.codigoInterno} registrada com sucesso.`
    await carregar()
  } catch (error) {
    erroEntrada.value = mensagemErro(error, 'Não foi possível registrar a entrada do lote.')
  } finally {
    salvandoEntrada.value = false
  }
}

function abrirLote(lote: LoteResponse) {
  loteSelecionado.value = lote
  editandoLote.value = false
  erroLote.value = ''
  sucessoLote.value = ''
  modalLoteAberto.value = true
}

function fecharLote() {
  if (salvandoLote.value) return
  modalLoteAberto.value = false
  loteSelecionado.value = null
  editandoLote.value = false
}

function iniciarEdicaoLote() {
  if (!loteSelecionado.value) return
  formularioLote.value = {
    numeroLote: loteSelecionado.value.numeroLote,
    tipoEmbalagem: loteSelecionado.value.tipoEmbalagem || 'UNITARIO',
    apresentacao: loteSelecionado.value.apresentacao || '',
    fracionavel: loteSelecionado.value.fracionavel !== false,
    observacao: loteSelecionado.value.observacao,
    dataValidade: loteSelecionado.value.dataValidade,
    ativo: loteSelecionado.value.ativo,
  }
  erroLote.value = ''
  sucessoLote.value = ''
  editandoLote.value = true
}

async function salvarLote() {
  if (!loteSelecionado.value) return
  const loteFornecedor = formularioLote.value.numeroLote.trim()
  if (!loteFornecedor) return void (erroLote.value = 'Informe o lote ou referência do fornecedor.')

  salvandoLote.value = true
  erroLote.value = ''

  try {
    const atualizado = await estoqueService.atualizarLote(loteSelecionado.value.id, {
      ...formularioLote.value,
      numeroLote: loteFornecedor,
      tipoEmbalagem: loteSelecionado.value.tipoEmbalagem || 'UNITARIO',
      apresentacao: formularioLote.value.apresentacao?.trim() || null,
      observacao: formularioLote.value.observacao?.trim() || null,
    })
    loteSelecionado.value = atualizado
    const indice = lotes.value.findIndex((lote) => lote.id === atualizado.id)
    if (indice >= 0) lotes.value[indice] = atualizado
    editandoLote.value = false
    sucessoLote.value = 'Lote atualizado com sucesso.'
  } catch (error) {
    erroLote.value = mensagemErro(error, 'Não foi possível atualizar o lote.')
  } finally {
    salvandoLote.value = false
  }
}

function abrirDescarte() {
  if (quantidadeVencida.value <= 0) return
  erroDescarte.value = ''
  sucessoDescarte.value = ''
  sucessoEntrada.value = ''
  formularioDescarte.value = { quantidade: quantidadeVencida.value, justificativa: '' }
  modalDescarteAberto.value = true
}

function fecharDescarte() {
  if (!salvandoDescarte.value) modalDescarteAberto.value = false
}

async function registrarDescarte() {
  if (!usuarioId.value) return void (erroDescarte.value = 'A sessão atual não possui usuário válido para registrar o descarte.')

  const quantidade = Number(formularioDescarte.value.quantidade)
  const justificativa = formularioDescarte.value.justificativa.trim()

  if (!Number.isInteger(quantidade) || quantidade <= 0) return void (erroDescarte.value = 'Informe uma quantidade válida para descarte.')
  if (quantidade > quantidadeVencida.value) return void (erroDescarte.value = `Existem ${quantidadeVencida.value} unit. vencidas disponíveis para descarte.`)
  if (!justificativa) return void (erroDescarte.value = 'Informe a justificativa do descarte.')

  salvandoDescarte.value = true
  erroDescarte.value = ''

  try {
    await estoqueService.descartarVencidos(estoqueId.value, usuarioId.value, { quantidade, justificativa })
    modalDescarteAberto.value = false
    sucessoDescarte.value = `Descarte de ${quantidade} unit. registrado com sucesso.`
    await carregar()
  } catch (error) {
    erroDescarte.value = mensagemErro(error, 'Não foi possível registrar o descarte por vencimento.')
  } finally {
    salvandoDescarte.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <section class="estoque-detalhe">
    <div v-if="carregando" class="state-box">Carregando detalhes...</div>
    <div v-else-if="erro" class="state-box state-box--error">{{ erro }}</div>

    <template v-else-if="estoque">
      <div class="breadcrumb">Operação / Estoque / Detalhe</div>
      <header class="page-header">
        <h1>{{ estoque.produtoNome }}</h1>
        <p>{{ estoque.produtoCodigoReferencia || 'Sem código de referência' }} · {{ estoque.unidadeNome }}</p>
      </header>

      <section class="product-context">
        <div><span>Contagem padrão</span><strong>Unidades individuais</strong></div>
        <div><span>Embalagem mais comum</span><strong>{{ estoque.produtoUnidadeArmazenamento || 'Não informada' }}</strong></div>
        <div><span>Localização</span><strong>{{ estoque.produtoLocalizacaoFisica || 'Não informada' }}</strong></div>
        <div><span>Avisar quando restarem</span><strong>{{ estoque.quantidadeMinima }} unit.</strong></div>
      </section>

      <div class="summary-grid">
        <article class="quantity-card">
          <span>Quantidade disponível</span>
          <strong>{{ rotuloQuantidadeExibida }}</strong>
          <small>{{ legendaQuantidade }}</small>
        </article>

        <article class="view-card">
          <label for="quantity-view">Visualizar por embalagem</label>
          <select id="quantity-view" v-model="visualizacaoQuantidade">
            <option value="UNITARIA">Unidades individuais</option>
            <option v-for="opcao in opcoesEmbalagem" :key="opcao.chave" :value="opcao.chave">
              {{ rotuloTipoEmbalagem(opcao.tipo, 2) }} — {{ opcao.multiplicador }} unit. por embalagem
            </option>
          </select>
          <small>O filtro muda apenas a forma de visualizar o mesmo saldo.</small>
        </article>

        <article :class="{ warning: proximos > 0 }">
          <span>Vencem em até 30 dias</span>
          <strong>{{ proximos }}</strong>
          <small>{{ proximos === 1 ? 'lote próximo do vencimento' : 'lotes próximos do vencimento' }}</small>
        </article>

        <article :class="{ danger: vencidos > 0 }">
          <span>Lotes vencidos</span>
          <strong>{{ vencidos }}</strong>
          <small>{{ vencidos > 0 ? `${quantidadeVencida} unit. aguardando descarte` : 'Nenhum vencido com saldo' }}</small>
        </article>
      </div>

      <div v-if="sucessoEntrada" class="success-box">{{ sucessoEntrada }}</div>
      <div v-if="sucessoDescarte" class="success-box">{{ sucessoDescarte }}</div>

      <section class="lot-card">
        <div class="lot-card__heading">
          <div>
            <h2>Lotes</h2>
            <p>O saldo disponível é mostrado em unidades. Embalagem e multiplicador preservam a forma física da entrada.</p>
          </div>
          <div class="lot-actions">
            <button v-if="quantidadeVencida > 0" class="danger-action" type="button" @click="abrirDescarte">Descartar vencidos</button>
            <button class="primary-action" type="button" @click="abrirEntrada">+ Nova entrada de lote</button>
          </div>
        </div>

        <div class="lot-filter-bar">
          <label>
            <span>Buscar lote</span>
            <input v-model="buscaLote" type="search" placeholder="Código SGL, fornecedor ou embalagem..." />
          </label>
          <label>
            <span>Situação</span>
            <select v-model="situacaoLote">
              <option value="TODOS">Todos</option>
              <option value="VALIDO">Válidos</option>
              <option value="PROXIMO">Próximos do vencimento</option>
              <option value="VENCIDO">Vencidos</option>
              <option value="DESCARTADO">Descartados por vencimento</option>
            </select>
          </label>
          <div class="lot-filter-result">
            <strong>{{ lotesFiltrados.length }}</strong>
            <span>lote(s)</span>
            <button v-if="buscaLote || situacaoLote !== 'TODOS'" type="button" @click="limparFiltrosLote">Limpar</button>
          </div>
        </div>

        <div v-if="lotesAtivos.length === 0" class="state-box">Nenhum lote ativo encontrado para este produto.</div>
        <div v-else-if="lotesFiltrados.length === 0" class="state-box">Nenhum lote encontrado para os filtros atuais.</div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código SGL</th>
                <th>Unidade</th>
                <th>Disponível agora</th>
                <th>Entrada</th>
                <th>Validade</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lote in lotesFiltrados" :key="lote.id" class="lot-row" @click="abrirLote(lote)">
                <td>
                  <strong>{{ lote.codigoInterno }}</strong>
                  <small>Fornecedor: {{ lote.numeroLote }}</small>
                </td>
                <td>
                  <strong>{{ resumoRecebido(lote) }}</strong>
                  <small>{{ lote.apresentacao || 'Sem especificação de embalagem' }}</small>
                </td>
                <td><strong>{{ resumoDisponivel(lote) }}</strong></td>
                <td>{{ dataFormatada(lote.dataEntrada) }}</td>
                <td>{{ dataFormatada(lote.dataValidade) }}</td>
                <td>
                  <span v-if="situacaoVisualLote(lote) === 'DESCARTADO'" class="lot-chip lot-chip--discarded">DESCARTADO POR VENCIMENTO</span>
                  <span v-else-if="situacaoVisualLote(lote) === 'VENCIDO'" class="lot-chip lot-chip--danger">VENCIDO</span>
                  <span v-else-if="situacaoVisualLote(lote) === 'PROXIMO'" class="lot-chip lot-chip--warning">PRÓXIMO DO VENCIMENTO</span>
                  <span v-else class="lot-chip lot-chip--ok">VÁLIDO</span>
                </td>
                <td><button class="detail-button" type="button" @click.stop="abrirLote(lote)">Ver detalhes</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <div v-if="modalEntradaAberto" class="modal-backdrop" @click.self="fecharEntrada">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="entrada-lote-title">
        <header class="modal-card__header">
          <div>
            <span>Estoque / Entrada</span>
            <h2 id="entrada-lote-title">Nova entrada de lote</h2>
            <p v-if="estoque">{{ estoque.produtoNome }} · o código SGL será gerado automaticamente</p>
          </div>
          <button type="button" class="modal-close" @click="fecharEntrada">×</button>
        </header>

        <form class="entry-form" @submit.prevent="registrarEntrada">
          <div class="entry-grid">
            <label><span>Lote / referência do fornecedor *</span><input v-model="formularioEntrada.numeroLote" type="text" maxlength="120" placeholder="Ex.: FAB-2026-8841" autofocus /></label>
            <label><span>Tipo de unidade *</span><select v-model="formularioEntrada.tipoEmbalagem"><option v-for="tipo in tiposEmbalagem" :key="tipo.value" :value="tipo.value">{{ tipo.label }}</option></select></label>
            <label><span>Especificar embalagem *</span><input v-model="formularioEntrada.apresentacao" type="text" maxlength="120" placeholder="Ex.: kit com 50 unidades, garrafa de 1 L" /></label>
            <label><span>Quantos chegaram? *</span><input v-model.number="formularioEntrada.quantidade" type="number" min="1" step="1" /></label>
            <label><span>Multiplicador de unidades *</span><div class="input-with-unit"><input v-model.number="formularioEntrada.conteudoPorApresentacao" type="number" min="1" step="1" /><b>unit.</b></div><small>Kit com 50 → 50; unitário → 1.</small></label>
            <label><span>Data de validade</span><input v-model="formularioEntrada.dataValidade" type="date" /></label>
            <label><span>Origem da entrada *</span><select v-model="formularioEntrada.origem"><option value="COMPRA">Compra</option><option value="DEVOLUCAO">Devolução</option><option value="AJUSTE">Ajuste</option><option value="INVENTARIO">Inventário</option></select></label>
          </div>

          <label class="fraction-option">
            <input v-model="formularioEntrada.fracionavel" type="checkbox" />
            <span><strong>Pode retirar unidades separadamente?</strong><small>Desmarque quando a embalagem precisar sair sempre completa. Se liberar depois, essa decisão não poderá ser revertida.</small></span>
          </label>

          <label class="entry-observation"><span>Observação</span><textarea v-model="formularioEntrada.observacao" rows="3" maxlength="500"></textarea></label>

          <div class="entry-preview"><strong>Entrada física</strong><span>{{ formularioEntrada.quantidade || 0 }} {{ rotuloTipoEmbalagem(formularioEntrada.tipoEmbalagem, Number(formularioEntrada.quantidade) || 0) }} · {{ formularioEntrada.apresentacao || 'sem especificação' }}</span><small>O sistema atualiza o saldo em unidades automaticamente.</small></div>

          <div v-if="erroEntrada" class="form-error">{{ erroEntrada }}</div>
          <footer class="modal-actions"><button type="button" class="secondary-action" :disabled="salvandoEntrada" @click="fecharEntrada">Cancelar</button><button type="submit" class="primary-action" :disabled="salvandoEntrada">{{ salvandoEntrada ? 'Registrando...' : 'Confirmar entrada' }}</button></footer>
        </form>
      </section>
    </div>

    <div v-if="modalLoteAberto && loteSelecionado" class="modal-backdrop" @click.self="fecharLote">
      <section class="modal-card lot-modal" role="dialog" aria-modal="true" aria-labelledby="lote-detail-title">
        <header class="modal-card__header"><div><span>Detalhes do lote</span><h2 id="lote-detail-title">{{ loteSelecionado.codigoInterno }}</h2><p>{{ estoque?.produtoNome }}</p></div><button type="button" class="modal-close" @click="fecharLote">×</button></header>

        <div v-if="!editandoLote" class="lot-detail-body">
          <div v-if="sucessoLote" class="success-box">{{ sucessoLote }}</div>
          <div class="lot-detail-highlight"><div><span>Unidade recebida</span><strong>{{ resumoRecebido(loteSelecionado) }}</strong><small>{{ loteSelecionado.apresentacao }}</small></div><div><span>Disponível agora</span><strong>{{ resumoDisponivel(loteSelecionado) }}</strong></div></div>
          <div class="lot-detail-grid">
            <div><span>Código SGL</span><strong>{{ loteSelecionado.codigoInterno }}</strong></div><div><span>Lote do fornecedor</span><strong>{{ loteSelecionado.numeroLote }}</strong></div><div><span>Tipo de unidade</span><strong>{{ rotuloTipoEmbalagem(loteSelecionado.tipoEmbalagem) }}</strong></div><div><span>Especificação</span><strong>{{ loteSelecionado.apresentacao || 'Não informada' }}</strong></div><div><span>Multiplicador</span><strong>{{ loteSelecionado.conteudoPorApresentacao || 1 }} unit. por embalagem</strong></div><div><span>Entrada</span><strong>{{ dataFormatada(loteSelecionado.dataEntrada) }}</strong></div><div><span>Validade</span><strong>{{ dataFormatada(loteSelecionado.dataValidade) }}</strong></div><div><span>Retirada unitária</span><strong>{{ loteSelecionado.fracionavel === false ? 'Não — somente embalagem completa' : 'Sim — liberada definitivamente' }}</strong></div><div class="lot-detail-wide"><span>Observação</span><strong>{{ loteSelecionado.observacao || 'Nenhuma observação registrada.' }}</strong></div>
          </div>
          <footer class="modal-actions"><button type="button" class="secondary-action" @click="fecharLote">Fechar</button><button type="button" class="primary-action" @click="iniciarEdicaoLote">Editar dados do lote</button></footer>
        </div>

        <form v-else class="entry-form" @submit.prevent="salvarLote">
          <div class="immutable-code-box"><span>Código SGL</span><strong>{{ loteSelecionado.codigoInterno }}</strong><small>Gerado automaticamente e imutável.</small></div>
          <div class="entry-grid">
            <label><span>Lote / referência do fornecedor *</span><input v-model="formularioLote.numeroLote" type="text" maxlength="120" /></label>
            <div class="read-only-field"><span>Tipo de unidade</span><strong>{{ rotuloTipoEmbalagem(loteSelecionado.tipoEmbalagem) }}</strong><small>O tipo original da embalagem não pode ser alterado.</small></div>
            <label><span>Especificar embalagem</span><input v-model="formularioLote.apresentacao" type="text" maxlength="120" /></label>
            <label><span>Data de validade</span><input v-model="formularioLote.dataValidade" type="date" /></label>
          </div>

          <label class="fraction-option" :class="{ 'fraction-option--locked': loteSelecionado.fracionavel !== false }"><input v-model="formularioLote.fracionavel" type="checkbox" :disabled="loteSelecionado.fracionavel !== false" /><span><strong>Pode retirar unidades separadamente?</strong><small v-if="loteSelecionado.fracionavel !== false">Retirada unitária já foi liberada e não pode voltar para embalagem obrigatoriamente fechada.</small><small v-else>Você pode liberar retirada unitária. Depois de salvar, essa mudança será definitiva.</small></span></label>
          <label class="entry-observation"><span>Observação</span><textarea v-model="formularioLote.observacao" rows="3" maxlength="500"></textarea></label>
          <div class="locked-info"><strong>Quantidade e multiplicador originais</strong><span>{{ resumoRecebido(loteSelecionado) }} · {{ loteSelecionado.conteudoPorApresentacao || 1 }} unit. por embalagem</span><small>Esses valores ficam bloqueados para preservar o histórico físico do lote.</small></div>
          <div v-if="erroLote" class="form-error">{{ erroLote }}</div>
          <footer class="modal-actions"><button type="button" class="secondary-action" :disabled="salvandoLote" @click="editandoLote = false">Cancelar</button><button type="submit" class="primary-action" :disabled="salvandoLote">{{ salvandoLote ? 'Salvando...' : 'Salvar alterações' }}</button></footer>
        </form>
      </section>
    </div>

    <div v-if="modalDescarteAberto" class="modal-backdrop" @click.self="fecharDescarte">
      <section class="modal-card discard-modal" role="dialog" aria-modal="true" aria-labelledby="descarte-title">
        <header class="modal-card__header"><div><span>Estoque / Descarte</span><h2 id="descarte-title">Descartar material vencido</h2><p>{{ estoque?.produtoNome }}</p></div><button type="button" class="modal-close" @click="fecharDescarte">×</button></header>

        <form class="entry-form" @submit.prevent="registrarDescarte">
          <div class="discard-summary"><div><span>Lotes vencidos com saldo</span><strong>{{ vencidos }}</strong></div><div><span>Total vencido</span><strong>{{ quantidadeVencida }} unit.</strong></div></div>
          <div class="expired-list"><div v-for="lote in lotesVencidosComSaldo" :key="lote.id" class="expired-item"><div><strong>{{ lote.codigoInterno }}</strong><small>{{ lote.apresentacao }} · validade {{ dataFormatada(lote.dataValidade) }}</small></div><div class="expired-item__qty"><strong>{{ lote.quantidadeDisponivel }} unit.</strong><small v-if="lote.fracionavel === false">múltiplos de {{ lote.conteudoPorApresentacao || 1 }} unit.</small><small v-else>pode ser fracionado</small></div></div></div>
          <div class="entry-grid discard-fields"><label><span>Quantidade a descartar *</span><div class="input-with-unit"><input v-model.number="formularioDescarte.quantidade" type="number" min="1" :max="quantidadeVencida" step="1" /><b>unit.</b></div><small>Lotes não fracionáveis só permitem descarte compatível com a embalagem completa.</small></label></div>
          <label class="entry-observation"><span>Justificativa *</span><textarea v-model="formularioDescarte.justificativa" rows="4" maxlength="500" placeholder="Ex.: Material vencido identificado durante conferência mensal."></textarea></label>
          <div class="discard-warning">O sistema baixa primeiro os lotes vencidos mais antigos e registra cada movimentação separadamente. A operação é cancelada inteira se a quantidade exigir fracionar uma embalagem fechada.</div>
          <div v-if="erroDescarte" class="form-error">{{ erroDescarte }}</div>
          <footer class="modal-actions"><button type="button" class="secondary-action" :disabled="salvandoDescarte" @click="fecharDescarte">Cancelar</button><button type="submit" class="danger-action" :disabled="salvandoDescarte">{{ salvandoDescarte ? 'Descartando...' : 'Confirmar descarte' }}</button></footer>
        </form>
      </section>
    </div>
  </section>
</template>

<style scoped>
.estoque-detalhe { max-width: 1540px; margin: 0 auto; }
.breadcrumb { margin-bottom: 10px; color: #64748b; font-size: 12px; }
.page-header h1 { margin: 0; color: #1a1a2e; font-size: 30px; }
.page-header p { margin: 7px 0 0; color: #64748b; font-size: 14px; }
.product-context { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 18px; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.product-context span { display: block; margin-bottom: 4px; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.product-context strong { color: #1e293b; font-size: 12px; }
.summary-grid { display: grid; grid-template-columns: 1.25fr 1.1fr .75fr .75fr; gap: 14px; margin: 18px 0; }
.summary-grid article { min-width: 0; padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.summary-grid span, .view-card label { display: block; color: #64748b; font-size: 12px; font-weight: 700; }
.summary-grid strong { display: block; margin-top: 8px; color: #0d2b5e; font-size: 24px; line-height: 1.15; }
.summary-grid small { display: block; margin-top: 6px; color: #94a3b8; font-size: 11px; line-height: 1.4; }
.view-card select { width: 100%; min-height: 40px; margin-top: 9px; padding: 0 10px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1e293b; font: inherit; }
.summary-grid .warning { border-color: #fde68a; background: #fffdf5; }
.summary-grid .warning strong { color: #946200; }
.summary-grid .danger { border-color: #fecaca; background: #fffafa; }
.summary-grid .danger strong { color: #b42318; }
.success-box { margin-bottom: 14px; padding: 11px 13px; border: 1px solid #bbefcb; border-radius: 8px; background: #f2fbf5; color: #087443; font-size: 12px; font-weight: 700; }
.lot-card { padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.lot-card__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
.lot-card__heading h2 { margin: 0; color: #0d2b5e; font-size: 16px; }
.lot-card__heading p { margin: 5px 0 14px; color: #64748b; font-size: 12px; }
.lot-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.lot-filter-bar { display: grid; grid-template-columns: minmax(260px, 1.5fr) minmax(190px, .7fr) auto; align-items: end; gap: 10px; margin: 2px 0 14px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 9px; background: #f8fafc; }
.lot-filter-bar label { display: flex; min-width: 0; flex-direction: column; gap: 5px; }
.lot-filter-bar label > span { color: #475569; font-size: 10px; font-weight: 800; }
.lot-filter-bar input, .lot-filter-bar select { width: 100%; min-height: 38px; padding: 0 10px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1e293b; box-sizing: border-box; }
.lot-filter-result { display: flex; min-height: 38px; align-items: center; gap: 5px; white-space: nowrap; color: #64748b; font-size: 10px; }
.lot-filter-result strong { color: #0d2b5e; font-size: 15px; }
.lot-filter-result button { margin-left: 5px; border: 0; background: transparent; color: #1a4da1; font-size: 10px; font-weight: 800; cursor: pointer; }
.primary-action, .secondary-action, .danger-action { min-height: 38px; padding: 0 14px; border-radius: 7px; font-size: 12px; font-weight: 800; cursor: pointer; }
.primary-action { border: 1px solid #1a4da1; background: #1a4da1; color: #fff; }
.secondary-action { border: 1px solid #cbd5e1; background: #fff; color: #334155; }
.danger-action { border: 1px solid #b42318; background: #b42318; color: #fff; }
.primary-action:disabled, .secondary-action:disabled, .danger-action:disabled { opacity: .55; cursor: not-allowed; }
.table-wrap { overflow-x: auto; }
table { width: 100%; min-width: 1120px; border-collapse: collapse; }
th { padding: 11px 12px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 800; text-align: left; text-transform: uppercase; }
td { padding: 12px; border-bottom: 1px solid #eef2f7; color: #334155; font-size: 12px; vertical-align: middle; }
td small { display: block; margin-top: 4px; color: #94a3b8; font-size: 10px; }
.lot-row { cursor: pointer; }
.lot-row:hover { background: #fbfdff; }
.detail-button { min-height: 30px; padding: 0 10px; border: 1px solid #dbe4f0; border-radius: 6px; background: #f8fafc; color: #1a4da1; font-size: 10px; font-weight: 800; cursor: pointer; white-space: nowrap; }
.lot-chip { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; font-size: 9px; font-weight: 800; white-space: nowrap; }
.lot-chip--ok { background: #e7f7ed; color: #007a3d; }
.lot-chip--warning { background: #fff7d6; color: #946200; }
.lot-chip--danger { background: #fee2e2; color: #b42318; }
.lot-chip--discarded { background: #e2e8f0; color: #475569; }
.state-box { padding: 34px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff; color: #64748b; text-align: center; }
.state-box--error { border-color: #fecaca; color: #b42318; background: #fffafa; }
.modal-backdrop { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 24px; background: rgb(9 22 48 / 58%); backdrop-filter: blur(2px); }
.modal-card { width: min(760px, 100%); max-height: calc(100vh - 48px); overflow-y: auto; border: 1px solid #dbe4f0; border-radius: 13px; background: #fff; box-shadow: 0 24px 70px rgb(9 22 48 / 28%); }
.lot-modal, .discard-modal { width: min(820px, 100%); }
.modal-card__header { display: flex; justify-content: space-between; gap: 16px; padding: 20px 22px 16px; border-bottom: 1px solid #eef2f7; }
.modal-card__header span { color: #1a4da1; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.modal-card__header h2 { margin: 4px 0 0; color: #0d2b5e; font-size: 21px; }
.modal-card__header p { margin: 5px 0 0; color: #64748b; font-size: 12px; }
.modal-close { width: 32px; height: 32px; border: 0; border-radius: 50%; background: #f1f5f9; color: #334155; font-size: 22px; cursor: pointer; }
.entry-form, .lot-detail-body { padding: 18px 22px 22px; }
.entry-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.entry-grid label, .entry-observation { display: flex; flex-direction: column; gap: 6px; }
.entry-grid label > span, .entry-observation > span, .read-only-field > span { color: #475569; font-size: 11px; font-weight: 800; }
.entry-grid input, .entry-grid select, .entry-observation textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1e293b; font: inherit; box-sizing: border-box; }
.entry-grid input, .entry-grid select { min-height: 40px; padding: 0 10px; }
.entry-observation { margin-top: 14px; }
.entry-observation textarea { min-height: 86px; padding: 10px; resize: vertical; }
.entry-grid small, .read-only-field small { color: #94a3b8; font-size: 10px; }
.read-only-field { display: flex; min-height: 67px; flex-direction: column; gap: 6px; justify-content: center; padding: 0 11px; border: 1px solid #e2e8f0; border-radius: 7px; background: #f8fafc; }
.read-only-field strong { color: #1e293b; font-size: 12px; }
.input-with-unit { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; }
.input-with-unit b { min-width: 50px; color: #475569; font-size: 11px; }
.fraction-option { display: flex; align-items: flex-start; gap: 10px; margin-top: 15px; padding: 12px 13px; border: 1px solid #dbe7f8; border-radius: 8px; background: #f8fbff; cursor: pointer; }
.fraction-option--locked { cursor: default; background: #f8fafc; border-color: #e2e8f0; }
.fraction-option span { display: flex; flex-direction: column; gap: 3px; }
.fraction-option strong { color: #1e293b; font-size: 11px; }
.fraction-option small { color: #64748b; font-size: 10px; }
.entry-preview, .locked-info, .immutable-code-box { display: flex; flex-direction: column; gap: 4px; margin-top: 14px; padding: 12px 13px; border: 1px solid #dbe7f8; border-radius: 8px; background: #f7faff; color: #475569; font-size: 11px; }
.immutable-code-box { margin-top: 0; margin-bottom: 14px; }
.form-error { margin-top: 12px; padding: 10px 12px; border: 1px solid #fecaca; border-radius: 7px; background: #fff5f5; color: #b42318; font-size: 11px; font-weight: 700; }
.modal-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 18px; padding-top: 15px; border-top: 1px solid #eef2f7; }
.lot-detail-highlight { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.lot-detail-highlight div { padding: 14px; border: 1px solid #dbe7f8; border-radius: 9px; background: #f8fbff; }
.lot-detail-highlight span, .lot-detail-grid span { display: block; margin-bottom: 5px; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.lot-detail-highlight strong { color: #0d2b5e; font-size: 14px; }
.lot-detail-highlight small { display: block; margin-top: 4px; color: #64748b; font-size: 10px; }
.lot-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; margin-top: 14px; overflow: hidden; border: 1px solid #e2e8f0; border-radius: 9px; background: #e2e8f0; }
.lot-detail-grid > div { padding: 13px 14px; background: #fff; }
.lot-detail-grid strong { color: #334155; font-size: 12px; }
.lot-detail-wide { grid-column: 1 / -1; }
.discard-summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
.discard-summary div { padding: 13px; border: 1px solid #fecaca; border-radius: 8px; background: #fffafa; }
.discard-summary span { display: block; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.discard-summary strong { display: block; margin-top: 5px; color: #b42318; font-size: 18px; }
.expired-list { overflow: hidden; margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 8px; }
.expired-item { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 11px 12px; border-bottom: 1px solid #eef2f7; }
.expired-item:last-child { border-bottom: 0; }
.expired-item strong { color: #1e293b; font-size: 11px; }
.expired-item small { display: block; margin-top: 3px; color: #64748b; font-size: 10px; }
.expired-item__qty { text-align: right; }
.discard-fields { grid-template-columns: minmax(0, 1fr); }
.discard-warning { margin-top: 14px; padding: 11px 12px; border: 1px solid #fde68a; border-radius: 8px; background: #fffdf5; color: #7c5b00; font-size: 10px; line-height: 1.45; }
@media (max-width: 1150px) { .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .lot-filter-bar { grid-template-columns: 1fr 1fr; } .lot-filter-result { grid-column: 1 / -1; } }
@media (max-width: 900px) { .product-context { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .summary-grid, .entry-grid, .product-context, .lot-detail-highlight, .lot-detail-grid, .discard-summary, .lot-filter-bar { grid-template-columns: 1fr; } .lot-filter-result { grid-column: auto; } .lot-detail-wide { grid-column: auto; } .lot-card__heading { flex-direction: column; } .lot-actions, .primary-action, .danger-action { width: 100%; } .lot-actions { flex-direction: column; } .modal-actions { flex-direction: column-reverse; } .expired-item { align-items: flex-start; flex-direction: column; } .expired-item__qty { text-align: left; } }
</style>
