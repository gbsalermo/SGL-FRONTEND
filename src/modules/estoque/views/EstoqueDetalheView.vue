<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { estoqueService } from '@/modules/estoque/services/estoqueService'
import type {
  AtualizarLoteRequest,
  EntradaLoteRequest,
  EstoqueCentralResponse,
  LoteResponse,
} from '@/modules/estoque/types/estoque'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const session = useSessionStore()

const estoque = ref<EstoqueCentralResponse | null>(null)
const lotes = ref<LoteResponse[]>([])
const carregando = ref(true)
const erro = ref('')

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

const formularioEntrada = ref<EntradaLoteRequest>({
  numeroLote: '',
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
  apresentacao: '',
  fracionavel: true,
  observacao: null,
  dataValidade: null,
  ativo: true,
})

const estoqueId = computed(() => String(route.params.id ?? ''))
const usuarioId = computed(() => session.usuario?.id ?? '')
const lotesAtivos = computed(() => lotes.value.filter((lote) => lote.ativo))
const vencidos = computed(() => lotesAtivos.value.filter(loteVencido).length)
const proximos = computed(() => lotesAtivos.value.filter(loteProximoVencimento).length)
const unidadeProduto = computed(() => estoque.value?.produtoUnidadeMedida || lotesAtivos.value[0]?.unidadeBase || 'UNIDADE')

function unidadeTexto(unidade?: string | null, quantidade = 1) {
  const plural = Math.abs(quantidade) !== 1
  const mapa: Record<string, [string, string]> = {
    ML: ['mL', 'mL'],
    L: ['L', 'L'],
    MG: ['mg', 'mg'],
    G: ['g', 'g'],
    KG: ['kg', 'kg'],
    UNIDADE: ['unidade', 'unidades'],
    CAIXA: ['caixa', 'caixas'],
    FRASCO: ['frasco', 'frascos'],
    AMPOLA: ['ampola', 'ampolas'],
    PAR: ['par', 'pares'],
    METRO: ['metro', 'metros'],
    REACAO: ['reação', 'reações'],
    OUTRO: ['unidade', 'unidades'],
  }

  const chave = String(unidade || 'UNIDADE').toUpperCase()
  const rotulo = mapa[chave] || [chave.toLowerCase().replaceAll('_', ' '), `${chave.toLowerCase().replaceAll('_', ' ')}s`]
  return plural ? rotulo[1] : rotulo[0]
}

function pluralApresentacao(apresentacao: string | null, quantidade: number) {
  const texto = (apresentacao || 'unidade').trim()
  if (quantidade === 1) return texto

  const conhecidos: Record<string, string> = {
    kit: 'kits',
    frasco: 'frascos',
    caixa: 'caixas',
    bombona: 'bombonas',
    pacote: 'pacotes',
    ampola: 'ampolas',
    barril: 'barris',
    'unidade avulsa': 'unidades avulsas',
  }

  const chave = texto.toLowerCase()
  if (conhecidos[chave]) return conhecidos[chave]
  if (chave.endsWith('s')) return texto
  return `${texto}s`
}

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
  const hoje = Date.now()
  const validade = new Date(`${lote.dataValidade}T23:59:59`).getTime()
  const dias = (validade - hoje) / 86_400_000
  return dias <= 30
}

function loteLegado(lote: LoteResponse) {
  return !lote.quantidadeApresentacoes || !lote.conteudoPorApresentacao || lote.apresentacao?.toUpperCase() === 'LEGADO'
}

function resumoRecebido(lote: LoteResponse) {
  if (loteLegado(lote)) {
    return `${lote.quantidadeInicial} ${unidadeTexto(lote.unidadeBase, lote.quantidadeInicial)} em registro antigo`
  }

  const quantidade = lote.quantidadeApresentacoes || 0
  const conteudo = lote.conteudoPorApresentacao || 1
  return `${quantidade} ${pluralApresentacao(lote.apresentacao, quantidade)} de ${conteudo} ${unidadeTexto(lote.unidadeBase, conteudo)}`
}

function resumoDisponivel(lote: LoteResponse) {
  if (lote.quantidadeDisponivel <= 0) return 'Sem quantidade disponível'
  if (loteLegado(lote)) {
    return `${lote.quantidadeDisponivel} ${unidadeTexto(lote.unidadeBase, lote.quantidadeDisponivel)} em registro antigo`
  }

  const fator = lote.conteudoPorApresentacao || 1
  const completas = Math.floor(lote.quantidadeDisponivel / fator)
  const restante = lote.quantidadeDisponivel % fator
  const partes: string[] = []

  if (completas > 0) {
    partes.push(`${completas} ${pluralApresentacao(lote.apresentacao, completas)} de ${fator} ${unidadeTexto(lote.unidadeBase, fator)}`)
  }

  if (restante > 0) {
    const unidade = String(lote.unidadeBase || '').toUpperCase()
    if (unidade === 'UNIDADE' || unidade === 'REACAO') {
      partes.push(`${restante} ${unidadeTexto(lote.unidadeBase, restante)} avulsas`)
    } else {
      partes.push(`${restante} ${unidadeTexto(lote.unidadeBase, restante)} em embalagem aberta`)
    }
  }

  return partes.join(' + ') || `${lote.quantidadeDisponivel} ${unidadeTexto(lote.unidadeBase, lote.quantidadeDisponivel)}`
}

const resumoArmazenamento = computed(() => {
  const comSaldo = lotesAtivos.value.filter((lote) => lote.quantidadeDisponivel > 0)
  if (comSaldo.length === 0) return 'Nenhum material disponível'

  const resumos = comSaldo.map(resumoDisponivel)
  if (resumos.length <= 2) return resumos.join(' + ')
  return `${resumos.slice(0, 2).join(' + ')} + ${resumos.length - 2} lote(s)`
})

function mensagemErro(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
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
  } catch {
    erro.value = 'Não foi possível carregar os detalhes deste estoque.'
  } finally {
    carregando.value = false
  }
}

function abrirEntrada() {
  erroEntrada.value = ''
  sucessoEntrada.value = ''
  formularioEntrada.value = {
    numeroLote: '',
    apresentacao: estoque.value?.produtoUnidadeArmazenamento || '',
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
  if (salvandoEntrada.value) return
  modalEntradaAberto.value = false
}

async function registrarEntrada() {
  if (!usuarioId.value) {
    erroEntrada.value = 'A sessão atual não possui usuário válido para registrar a movimentação.'
    return
  }

  const codigo = formularioEntrada.value.numeroLote.trim()
  const apresentacao = formularioEntrada.value.apresentacao?.trim() || ''

  if (!codigo) {
    erroEntrada.value = 'Informe o código do lote.'
    return
  }
  if (!apresentacao) {
    erroEntrada.value = 'Informe como o material chegou.'
    return
  }
  if (!Number.isInteger(Number(formularioEntrada.value.quantidade)) || Number(formularioEntrada.value.quantidade) <= 0) {
    erroEntrada.value = 'Informe quantos volumes foram recebidos.'
    return
  }
  if (!Number.isInteger(Number(formularioEntrada.value.conteudoPorApresentacao)) || Number(formularioEntrada.value.conteudoPorApresentacao) <= 0) {
    erroEntrada.value = 'Informe quanto vem em cada volume.'
    return
  }

  salvandoEntrada.value = true
  erroEntrada.value = ''

  try {
    await estoqueService.registrarEntradaLote(estoqueId.value, usuarioId.value, {
      numeroLote: codigo,
      apresentacao,
      quantidade: Number(formularioEntrada.value.quantidade),
      conteudoPorApresentacao: Number(formularioEntrada.value.conteudoPorApresentacao),
      fracionavel: formularioEntrada.value.fracionavel,
      dataValidade: formularioEntrada.value.dataValidade || null,
      origem: formularioEntrada.value.origem,
      observacao: formularioEntrada.value.observacao?.trim() || null,
    })

    modalEntradaAberto.value = false
    sucessoEntrada.value = `Entrada do lote ${codigo} registrada com sucesso.`
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
  const lote = loteSelecionado.value
  formularioLote.value = {
    numeroLote: lote.numeroLote,
    apresentacao: lote.apresentacao || '',
    fracionavel: lote.fracionavel !== false,
    observacao: lote.observacao,
    dataValidade: lote.dataValidade,
    ativo: lote.ativo,
  }
  erroLote.value = ''
  sucessoLote.value = ''
  editandoLote.value = true
}

async function salvarLote() {
  if (!loteSelecionado.value) return
  const codigo = formularioLote.value.numeroLote.trim()
  if (!codigo) {
    erroLote.value = 'Informe o código do lote.'
    return
  }

  salvandoLote.value = true
  erroLote.value = ''

  try {
    const atualizado = await estoqueService.atualizarLote(loteSelecionado.value.id, {
      ...formularioLote.value,
      numeroLote: codigo,
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

onMounted(carregar)
</script>

<template>
  <section class="estoque-detalhe">
    <div v-if="carregando" class="state-box">Carregando detalhes...</div>
    <div v-else-if="erro" class="state-box state-box--error">{{ erro }}</div>

    <template v-else-if="estoque">
      <div class="breadcrumb">Operação / Estoque / Detalhe</div>
      <header class="page-header">
        <div>
          <h1>{{ estoque.produtoNome }}</h1>
          <p>{{ estoque.produtoCodigoReferencia || 'Sem código de referência' }} · {{ estoque.unidadeNome }}</p>
        </div>
      </header>

      <section class="product-context" aria-label="Informações do produto">
        <div>
          <span>Estoque contado em</span>
          <strong>{{ unidadeTexto(unidadeProduto, 2) }}</strong>
        </div>
        <div>
          <span>Embalagem mais comum</span>
          <strong>{{ estoque.produtoUnidadeArmazenamento || 'Não informada' }}</strong>
        </div>
        <div>
          <span>Localização</span>
          <strong>{{ estoque.produtoLocalizacaoFisica || 'Não informada' }}</strong>
        </div>
        <div>
          <span>Avisar quando restarem</span>
          <strong>{{ estoque.quantidadeMinima }} {{ unidadeTexto(unidadeProduto, estoque.quantidadeMinima) }}</strong>
        </div>
      </section>

      <div class="summary-grid">
        <article>
          <span>Quantidade disponível</span>
          <strong>{{ estoque.quantidadeAtual }} {{ unidadeTexto(unidadeProduto, estoque.quantidadeAtual) }}</strong>
          <small>Total disponível para uso</small>
        </article>
        <article class="summary-storage">
          <span>Como está armazenado</span>
          <strong>{{ resumoArmazenamento }}</strong>
          <small>Embalagens completas e material avulso/aberto</small>
        </article>
        <article :class="{ warning: proximos > 0 }">
          <span>Vencem em até 30 dias</span>
          <strong>{{ proximos }}</strong>
          <small>{{ proximos === 1 ? 'lote próximo do vencimento' : 'lotes próximos do vencimento' }}</small>
        </article>
        <article :class="{ danger: vencidos > 0 }">
          <span>Lotes vencidos</span>
          <strong>{{ vencidos }}</strong>
          <small>{{ vencidos > 0 ? 'Exigem atenção' : 'Nenhum vencido' }}</small>
        </article>
      </div>

      <div v-if="sucessoEntrada" class="success-box">{{ sucessoEntrada }}</div>

      <section class="lot-card">
        <div class="lot-card__heading">
          <div>
            <h2>Lotes</h2>
            <p>Veja de forma simples o que há em cada lote. Clique em um lote para consultar ou editar seus detalhes.</p>
          </div>
          <button class="primary-action" type="button" @click="abrirEntrada">+ Nova entrada de lote</button>
        </div>

        <div v-if="lotesAtivos.length === 0" class="state-box">Nenhum lote ativo encontrado para este produto.</div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lote</th>
                <th>O que foi recebido</th>
                <th>Disponível agora</th>
                <th>Entrada</th>
                <th>Validade</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lote in lotesAtivos" :key="lote.id" class="lot-row" @click="abrirLote(lote)">
                <td><strong>{{ lote.numeroLote }}</strong></td>
                <td>
                  <span>{{ resumoRecebido(lote) }}</span>
                  <small v-if="loteLegado(lote)">Entrada feita antes do novo controle de embalagens.</small>
                </td>
                <td><strong>{{ resumoDisponivel(lote) }}</strong></td>
                <td>{{ dataFormatada(lote.dataEntrada) }}</td>
                <td>{{ dataFormatada(lote.dataValidade) }}</td>
                <td>
                  <span v-if="loteVencido(lote)" class="lot-chip lot-chip--danger">VENCIDO</span>
                  <span v-else-if="loteProximoVencimento(lote)" class="lot-chip lot-chip--warning">PRÓXIMO DO VENCIMENTO</span>
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
            <p v-if="estoque">{{ estoque.produtoNome }}</p>
          </div>
          <button type="button" class="modal-close" aria-label="Fechar" @click="fecharEntrada">×</button>
        </header>

        <form class="entry-form" @submit.prevent="registrarEntrada">
          <div class="entry-grid">
            <label>
              <span>Código do lote *</span>
              <input v-model="formularioEntrada.numeroLote" type="text" maxlength="120" placeholder="Ex.: LOT-2026-001" autofocus />
            </label>

            <label>
              <span>Como o material chegou? *</span>
              <input v-model="formularioEntrada.apresentacao" type="text" maxlength="120" placeholder="Ex.: kit, frasco, caixa, barril, unidade avulsa" />
            </label>

            <label>
              <span>Quantos chegaram? *</span>
              <input v-model.number="formularioEntrada.quantidade" type="number" min="1" step="1" />
              <small>Ex.: 2 kits, 4 frascos ou 10 unidades avulsas.</small>
            </label>

            <label>
              <span>Quanto vem em cada um? *</span>
              <div class="input-with-unit">
                <input v-model.number="formularioEntrada.conteudoPorApresentacao" type="number" min="1" step="1" />
                <b>{{ unidadeTexto(unidadeProduto, formularioEntrada.conteudoPorApresentacao || 2) }}</b>
              </div>
              <small>Ex.: 50 reações em cada kit ou 1000 mL em cada frasco.</small>
            </label>

            <label>
              <span>Data de validade</span>
              <input v-model="formularioEntrada.dataValidade" type="date" />
              <small>Deixe em branco quando não se aplicar.</small>
            </label>

            <label>
              <span>Origem da entrada *</span>
              <select v-model="formularioEntrada.origem">
                <option value="COMPRA">Compra</option>
                <option value="DEVOLUCAO">Devolução</option>
                <option value="AJUSTE">Ajuste</option>
                <option value="INVENTARIO">Inventário</option>
              </select>
            </label>
          </div>

          <label class="fraction-option">
            <input v-model="formularioEntrada.fracionavel" type="checkbox" />
            <span>
              <strong>Pode retirar apenas uma parte?</strong>
              <small>Ex.: abrir um frasco para retirar 100 mL. Desmarque se o kit/embalagem tiver que sair sempre completo.</small>
            </span>
          </label>

          <label class="entry-observation">
            <span>Observação</span>
            <textarea v-model="formularioEntrada.observacao" rows="3" maxlength="500" placeholder="Ex.: Material recebido lacrado e conferido."></textarea>
          </label>

          <div class="entry-preview">
            <strong>Você está registrando</strong>
            <span>
              {{ formularioEntrada.quantidade || 0 }} {{ pluralApresentacao(formularioEntrada.apresentacao, Number(formularioEntrada.quantidade) || 0) }},
              com {{ formularioEntrada.conteudoPorApresentacao || 0 }} {{ unidadeTexto(unidadeProduto, formularioEntrada.conteudoPorApresentacao || 0) }} em cada um.
            </span>
            <small>O sistema fará os cálculos de estoque automaticamente.</small>
          </div>

          <div v-if="erroEntrada" class="form-error">{{ erroEntrada }}</div>

          <footer class="modal-actions">
            <button type="button" class="secondary-action" :disabled="salvandoEntrada" @click="fecharEntrada">Cancelar</button>
            <button type="submit" class="primary-action" :disabled="salvandoEntrada">
              {{ salvandoEntrada ? 'Registrando...' : 'Confirmar entrada' }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div v-if="modalLoteAberto && loteSelecionado" class="modal-backdrop" @click.self="fecharLote">
      <section class="modal-card lot-modal" role="dialog" aria-modal="true" aria-labelledby="lote-detail-title">
        <header class="modal-card__header">
          <div>
            <span>Detalhes do lote</span>
            <h2 id="lote-detail-title">{{ loteSelecionado.numeroLote }}</h2>
            <p>{{ estoque?.produtoNome }}</p>
          </div>
          <button type="button" class="modal-close" aria-label="Fechar" @click="fecharLote">×</button>
        </header>

        <div v-if="!editandoLote" class="lot-detail-body">
          <div v-if="sucessoLote" class="success-box">{{ sucessoLote }}</div>

          <div class="lot-detail-highlight">
            <div>
              <span>Recebido</span>
              <strong>{{ resumoRecebido(loteSelecionado) }}</strong>
            </div>
            <div>
              <span>Disponível agora</span>
              <strong>{{ resumoDisponivel(loteSelecionado) }}</strong>
            </div>
          </div>

          <div class="lot-detail-grid">
            <div>
              <span>Como chegou</span>
              <strong>{{ loteSelecionado.apresentacao || 'Registro antigo' }}</strong>
            </div>
            <div>
              <span>Entrada</span>
              <strong>{{ dataFormatada(loteSelecionado.dataEntrada) }}</strong>
            </div>
            <div>
              <span>Validade</span>
              <strong>{{ dataFormatada(loteSelecionado.dataValidade) }}</strong>
            </div>
            <div>
              <span>Pode retirar uma parte?</span>
              <strong>{{ loteSelecionado.fracionavel === false ? 'Não, somente embalagem completa' : 'Sim' }}</strong>
            </div>
            <div class="lot-detail-wide">
              <span>Observação</span>
              <strong>{{ loteSelecionado.observacao || 'Nenhuma observação registrada.' }}</strong>
            </div>
          </div>

          <div v-if="loteLegado(loteSelecionado)" class="legacy-note">
            Este lote foi criado antes do controle detalhado de embalagens. Por isso o sistema não consegue afirmar quantos kits, frascos ou volumes físicos existiam originalmente.
          </div>

          <footer class="modal-actions lot-detail-actions">
            <button type="button" class="secondary-action" @click="fecharLote">Fechar</button>
            <button type="button" class="primary-action" @click="iniciarEdicaoLote">Editar lote</button>
          </footer>
        </div>

        <form v-else class="entry-form" @submit.prevent="salvarLote">
          <div class="entry-grid">
            <label>
              <span>Código do lote *</span>
              <input v-model="formularioLote.numeroLote" type="text" maxlength="120" />
            </label>
            <label>
              <span>Como chegou</span>
              <input v-model="formularioLote.apresentacao" type="text" maxlength="120" placeholder="Ex.: kit, frasco, caixa" />
            </label>
            <label>
              <span>Data de validade</span>
              <input v-model="formularioLote.dataValidade" type="date" />
            </label>
          </div>

          <label class="fraction-option">
            <input v-model="formularioLote.fracionavel" type="checkbox" />
            <span>
              <strong>Pode retirar apenas uma parte?</strong>
              <small>Se já houver uma embalagem parcialmente utilizada, o sistema poderá impedir a troca para “não”.</small>
            </span>
          </label>

          <label class="entry-observation">
            <span>Observação</span>
            <textarea v-model="formularioLote.observacao" rows="3" maxlength="500"></textarea>
          </label>

          <div class="locked-info">
            <strong>Quantidade e conteúdo por embalagem</strong>
            <span>{{ resumoRecebido(loteSelecionado) }}</span>
            <small>Esses dados ficam bloqueados após a entrada para preservar o histórico do estoque.</small>
          </div>

          <div v-if="erroLote" class="form-error">{{ erroLote }}</div>

          <footer class="modal-actions">
            <button type="button" class="secondary-action" :disabled="salvandoLote" @click="editandoLote = false">Cancelar</button>
            <button type="submit" class="primary-action" :disabled="salvandoLote">
              {{ salvandoLote ? 'Salvando...' : 'Salvar alterações' }}
            </button>
          </footer>
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
.product-context div { min-width: 0; }
.product-context span { display: block; margin-bottom: 4px; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.product-context strong { color: #1e293b; font-size: 12px; }
.summary-grid { display: grid; grid-template-columns: 1fr 1.55fr .8fr .8fr; gap: 14px; margin: 18px 0; }
.summary-grid article { min-width: 0; padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.summary-grid span { display: block; color: #64748b; font-size: 12px; font-weight: 700; }
.summary-grid strong { display: block; margin-top: 8px; color: #0d2b5e; font-size: 24px; line-height: 1.15; }
.summary-grid small { display: block; margin-top: 5px; color: #94a3b8; font-size: 11px; }
.summary-storage strong { font-size: 15px; line-height: 1.4; }
.summary-grid .warning { border-color: #fde68a; background: #fffdf5; }
.summary-grid .warning strong { color: #946200; }
.summary-grid .danger { border-color: #fecaca; background: #fffafa; }
.summary-grid .danger strong { color: #b42318; }
.success-box { margin-bottom: 14px; padding: 11px 13px; border: 1px solid #bbefcb; border-radius: 8px; background: #f2fbf5; color: #087443; font-size: 12px; font-weight: 700; }
.lot-card { padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.lot-card__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
.lot-card__heading h2 { margin: 0; color: #0d2b5e; font-size: 16px; }
.lot-card__heading p { margin: 5px 0 14px; color: #64748b; font-size: 12px; }
.primary-action, .secondary-action { min-height: 38px; padding: 0 14px; border-radius: 7px; font-size: 12px; font-weight: 800; cursor: pointer; }
.primary-action { border: 1px solid #1a4da1; background: #1a4da1; color: #fff; box-shadow: 0 4px 12px rgb(26 77 161 / 16%); }
.secondary-action { border: 1px solid #cbd5e1; background: #fff; color: #334155; }
.primary-action:disabled, .secondary-action:disabled { opacity: .55; cursor: not-allowed; }
.table-wrap { overflow-x: auto; }
table { width: 100%; min-width: 1120px; border-collapse: collapse; }
th { padding: 11px 12px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 800; text-align: left; text-transform: uppercase; }
td { padding: 12px; border-bottom: 1px solid #eef2f7; color: #334155; font-size: 12px; vertical-align: middle; }
td small { display: block; margin-top: 4px; color: #94a3b8; font-size: 10px; }
.lot-row { cursor: pointer; transition: background-color 150ms ease; }
.lot-row:hover { background: #fbfdff; }
.detail-button { min-height: 30px; padding: 0 10px; border: 1px solid #dbe4f0; border-radius: 6px; background: #f8fafc; color: #1a4da1; font-size: 10px; font-weight: 800; cursor: pointer; white-space: nowrap; }
.lot-chip { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; font-size: 9px; font-weight: 800; }
.lot-chip--ok { background: #e7f7ed; color: #007a3d; }
.lot-chip--warning { background: #fff7d6; color: #946200; }
.lot-chip--danger { background: #fee2e2; color: #b42318; }
.state-box { padding: 34px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff; color: #64748b; text-align: center; }
.state-box--error { border-color: #fecaca; color: #b42318; background: #fffafa; }
.modal-backdrop { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 24px; background: rgb(9 22 48 / 58%); backdrop-filter: blur(2px); }
.modal-card { width: min(760px, 100%); max-height: calc(100vh - 48px); overflow-y: auto; border: 1px solid #dbe4f0; border-radius: 13px; background: #fff; box-shadow: 0 24px 70px rgb(9 22 48 / 28%); }
.lot-modal { width: min(820px, 100%); }
.modal-card__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 22px 16px; border-bottom: 1px solid #eef2f7; }
.modal-card__header span { color: #1a4da1; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.modal-card__header h2 { margin: 4px 0 0; color: #0d2b5e; font-size: 21px; }
.modal-card__header p { margin: 5px 0 0; color: #64748b; font-size: 12px; }
.modal-close { width: 32px; height: 32px; border: 0; border-radius: 50%; background: #f1f5f9; color: #334155; font-size: 22px; line-height: 1; cursor: pointer; }
.entry-form { padding: 18px 22px 22px; }
.entry-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.entry-grid label, .entry-observation { display: flex; flex-direction: column; gap: 6px; }
.entry-grid label > span, .entry-observation > span { color: #475569; font-size: 11px; font-weight: 800; }
.entry-grid input, .entry-grid select, .entry-observation textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1e293b; font: inherit; outline: none; box-sizing: border-box; }
.entry-grid input, .entry-grid select { min-height: 40px; padding: 0 10px; }
.entry-observation { margin-top: 14px; }
.entry-observation textarea { resize: vertical; min-height: 86px; padding: 10px; }
.entry-grid input:focus, .entry-grid select:focus, .entry-observation textarea:focus { border-color: #1a4da1; box-shadow: 0 0 0 2px rgb(26 77 161 / 10%); }
.entry-grid small { color: #94a3b8; font-size: 10px; }
.input-with-unit { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; }
.input-with-unit b { min-width: 68px; color: #475569; font-size: 11px; }
.fraction-option { display: flex; align-items: flex-start; gap: 10px; margin-top: 15px; padding: 12px 13px; border: 1px solid #dbe7f8; border-radius: 8px; background: #f8fbff; cursor: pointer; }
.fraction-option input { margin-top: 2px; }
.fraction-option span { display: flex; flex-direction: column; gap: 3px; }
.fraction-option strong { color: #1e293b; font-size: 11px; }
.fraction-option small { color: #64748b; font-size: 10px; }
.entry-preview, .locked-info { display: flex; flex-direction: column; gap: 4px; margin-top: 14px; padding: 12px 13px; border: 1px solid #dbe7f8; border-radius: 8px; background: #f7faff; color: #475569; font-size: 11px; }
.entry-preview strong, .locked-info strong { color: #0d2b5e; }
.entry-preview small, .locked-info small { color: #64748b; }
.form-error { margin-top: 12px; padding: 10px 12px; border: 1px solid #fecaca; border-radius: 7px; background: #fff5f5; color: #b42318; font-size: 11px; font-weight: 700; }
.modal-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 18px; padding-top: 15px; border-top: 1px solid #eef2f7; }
.lot-detail-body { padding: 18px 22px 22px; }
.lot-detail-highlight { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.lot-detail-highlight div { padding: 14px; border: 1px solid #dbe7f8; border-radius: 9px; background: #f8fbff; }
.lot-detail-highlight span, .lot-detail-grid span { display: block; margin-bottom: 5px; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.lot-detail-highlight strong { color: #0d2b5e; font-size: 14px; line-height: 1.4; }
.lot-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; margin-top: 14px; overflow: hidden; border: 1px solid #e2e8f0; border-radius: 9px; background: #e2e8f0; }
.lot-detail-grid > div { padding: 13px 14px; background: #fff; }
.lot-detail-grid strong { color: #334155; font-size: 12px; line-height: 1.4; }
.lot-detail-wide { grid-column: 1 / -1; }
.legacy-note { margin-top: 14px; padding: 11px 13px; border: 1px solid #fde68a; border-radius: 8px; background: #fffdf5; color: #7c5b00; font-size: 11px; line-height: 1.45; }
.lot-detail-actions { margin-top: 16px; }
@media (max-width: 1150px) { .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 1050px) { .product-context { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .summary-grid, .entry-grid, .product-context, .lot-detail-highlight, .lot-detail-grid { grid-template-columns: 1fr; } .lot-detail-wide { grid-column: auto; } .lot-card__heading { flex-direction: column; } .primary-action { width: 100%; } .modal-actions { flex-direction: column-reverse; } }
</style>
