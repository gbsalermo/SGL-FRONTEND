<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { estoqueService } from '@/modules/estoque/services/estoqueService'
import type { EntradaLoteRequest, EstoqueCentralResponse, LoteResponse } from '@/modules/estoque/types/estoque'
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

const formularioEntrada = ref<EntradaLoteRequest>({
  numeroLote: '',
  quantidade: 1,
  dataValidade: null,
  origem: 'COMPRA',
  observacao: null,
})

const estoqueId = computed(() => String(route.params.id ?? ''))
const usuarioId = computed(() => session.usuario?.id ?? '')

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

const lotesAtivos = computed(() => lotes.value.filter((lote) => lote.ativo))
const totalDisponivel = computed(() => lotesAtivos.value.reduce((total, lote) => total + lote.quantidadeDisponivel, 0))
const vencidos = computed(() => lotesAtivos.value.filter(loteVencido).length)
const proximos = computed(() => lotesAtivos.value.filter(loteProximoVencimento).length)

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
    quantidade: 1,
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

function mensagemErro(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return 'Não foi possível registrar a entrada do lote.'
}

async function registrarEntrada() {
  if (!usuarioId.value) {
    erroEntrada.value = 'A sessão atual não possui usuário válido para registrar a movimentação.'
    return
  }

  const codigo = formularioEntrada.value.numeroLote.trim()
  if (!codigo) {
    erroEntrada.value = 'Informe o código do lote.'
    return
  }

  if (!Number.isInteger(Number(formularioEntrada.value.quantidade)) || Number(formularioEntrada.value.quantidade) <= 0) {
    erroEntrada.value = 'A quantidade deve ser um número inteiro maior que zero.'
    return
  }

  salvandoEntrada.value = true
  erroEntrada.value = ''

  try {
    await estoqueService.registrarEntradaLote(estoqueId.value, usuarioId.value, {
      numeroLote: codigo,
      quantidade: Number(formularioEntrada.value.quantidade),
      dataValidade: formularioEntrada.value.dataValidade || null,
      origem: formularioEntrada.value.origem,
      observacao: formularioEntrada.value.observacao?.trim() || null,
    })

    modalEntradaAberto.value = false
    sucessoEntrada.value = `Entrada do lote ${codigo} registrada com sucesso.`
    await carregar()
  } catch (error) {
    erroEntrada.value = mensagemErro(error)
  } finally {
    salvandoEntrada.value = false
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

      <section class="product-context" aria-label="Identificação e localização do produto">
        <div>
          <span>Unidade</span>
          <strong>{{ estoque.produtoUnidadeArmazenamento || 'Não informada' }}</strong>
        </div>
        <div>
          <span>Localização</span>
          <strong>{{ estoque.produtoLocalizacaoFisica || 'Não informada' }}</strong>
        </div>
        <div>
          <span>Estoque mínimo</span>
          <strong>{{ estoque.quantidadeMinima }}</strong>
        </div>
      </section>

      <div class="summary-grid">
        <article>
          <span>Saldo atual</span>
          <strong>{{ estoque.quantidadeAtual }}</strong>
          <small>Quantidade no estoque central</small>
        </article>
        <article>
          <span>Disponível nos lotes</span>
          <strong>{{ totalDisponivel }}</strong>
          <small>Somatório dos lotes ativos</small>
        </article>
        <article :class="{ warning: proximos > 0 }">
          <span>Próximos do vencimento</span>
          <strong>{{ proximos }}</strong>
          <small>Até 30 dias</small>
        </article>
        <article :class="{ danger: vencidos > 0 }">
          <span>Lotes vencidos</span>
          <strong>{{ vencidos }}</strong>
          <small>Exigem atenção</small>
        </article>
      </div>

      <div v-if="sucessoEntrada" class="success-box">{{ sucessoEntrada }}</div>

      <section class="lot-card">
        <div class="lot-card__heading">
          <div>
            <h2>Lotes</h2>
            <p>Acompanhe código, quantidade disponível, entrada e validade de cada lote.</p>
          </div>
          <button class="primary-action" type="button" @click="abrirEntrada">+ Nova entrada de lote</button>
        </div>

        <div v-if="lotesAtivos.length === 0" class="state-box">Nenhum lote ativo encontrado para este produto.</div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código do lote</th>
                <th>Entrada</th>
                <th>Validade</th>
                <th>Quantidade inicial</th>
                <th>Disponível</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lote in lotesAtivos" :key="lote.id">
                <td><strong>{{ lote.numeroLote }}</strong></td>
                <td>{{ dataFormatada(lote.dataEntrada) }}</td>
                <td>{{ dataFormatada(lote.dataValidade) }}</td>
                <td>{{ lote.quantidadeInicial }}</td>
                <td><strong>{{ lote.quantidadeDisponivel }}</strong></td>
                <td>
                  <span v-if="loteVencido(lote)" class="lot-chip lot-chip--danger">VENCIDO</span>
                  <span v-else-if="loteProximoVencimento(lote)" class="lot-chip lot-chip--warning">PRÓXIMO DO VENCIMENTO</span>
                  <span v-else class="lot-chip lot-chip--ok">VÁLIDO</span>
                </td>
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
            <p v-if="estoque">{{ estoque.produtoNome }} · {{ estoque.produtoUnidadeArmazenamento }}</p>
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
              <span>Quantidade recebida *</span>
              <input v-model.number="formularioEntrada.quantidade" type="number" min="1" step="1" />
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

          <label class="entry-observation">
            <span>Observação</span>
            <textarea v-model="formularioEntrada.observacao" rows="3" maxlength="500" placeholder="Ex.: Material recebido conforme nota fiscal."></textarea>
          </label>

          <div class="entry-preview">
            <strong>Após confirmar</strong>
            <span>O lote será criado, o saldo do estoque será atualizado e a movimentação de entrada ficará registrada.</span>
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
  </section>
</template>

<style scoped>
.estoque-detalhe { max-width: 1540px; margin: 0 auto; }
.breadcrumb { margin-bottom: 10px; color: #64748b; font-size: 12px; }
.page-header h1 { margin: 0; color: #1a1a2e; font-size: 30px; }
.page-header p { margin: 7px 0 0; color: #64748b; font-size: 14px; }
.product-context { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 18px; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.product-context div { min-width: 0; }
.product-context span { display: block; margin-bottom: 4px; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.product-context strong { color: #1e293b; font-size: 12px; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 18px 0; }
.summary-grid article { padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.summary-grid span { display: block; color: #64748b; font-size: 12px; font-weight: 700; }
.summary-grid strong { display: block; margin-top: 8px; color: #0d2b5e; font-size: 26px; }
.summary-grid small { display: block; margin-top: 3px; color: #94a3b8; font-size: 11px; }
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
table { width: 100%; min-width: 850px; border-collapse: collapse; }
th { padding: 11px 12px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 800; text-align: left; text-transform: uppercase; }
td { padding: 12px; border-bottom: 1px solid #eef2f7; color: #334155; font-size: 12px; }
.lot-chip { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; font-size: 9px; font-weight: 800; }
.lot-chip--ok { background: #e7f7ed; color: #007a3d; }
.lot-chip--warning { background: #fff7d6; color: #946200; }
.lot-chip--danger { background: #fee2e2; color: #b42318; }
.state-box { padding: 34px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff; color: #64748b; text-align: center; }
.state-box--error { border-color: #fecaca; color: #b42318; background: #fffafa; }
.modal-backdrop { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 24px; background: rgb(9 22 48 / 58%); backdrop-filter: blur(2px); }
.modal-card { width: min(720px, 100%); max-height: calc(100vh - 48px); overflow-y: auto; border: 1px solid #dbe4f0; border-radius: 13px; background: #fff; box-shadow: 0 24px 70px rgb(9 22 48 / 28%); }
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
.entry-preview { display: flex; flex-direction: column; gap: 3px; margin-top: 14px; padding: 11px 13px; border: 1px solid #dbe7f8; border-radius: 8px; background: #f7faff; color: #475569; font-size: 11px; }
.entry-preview strong { color: #0d2b5e; }
.form-error { margin-top: 12px; padding: 10px 12px; border: 1px solid #fecaca; border-radius: 7px; background: #fff5f5; color: #b42318; font-size: 11px; font-weight: 700; }
.modal-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 18px; padding-top: 15px; border-top: 1px solid #eef2f7; }
@media (max-width: 900px) { .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .product-context { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .summary-grid, .entry-grid { grid-template-columns: 1fr; } .lot-card__heading { flex-direction: column; } .primary-action { width: 100%; } .modal-actions { flex-direction: column-reverse; } }
</style>