<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { estoqueService } from '@/modules/estoque/services/estoqueService'
import type { EstoqueCentralResponse, LoteResponse } from '@/modules/estoque/types/estoque'

const route = useRoute()

const estoque = ref<EstoqueCentralResponse | null>(null)
const lotes = ref<LoteResponse[]>([])
const carregando = ref(true)
const erro = ref('')

const estoqueId = computed(() => String(route.params.id ?? ''))

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
          <span>Apresentação</span>
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

      <section class="lot-card">
        <div class="lot-card__heading">
          <div>
            <h2>Lotes</h2>
            <p>Acompanhe identificação do fornecedor, quantidade disponível, entrada e validade de cada lote.</p>
          </div>
        </div>

        <div v-if="lotesAtivos.length === 0" class="state-box">Nenhum lote ativo encontrado para este produto.</div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lote fornecedor</th>
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
.lot-card { padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.lot-card__heading h2 { margin: 0; color: #0d2b5e; font-size: 16px; }
.lot-card__heading p { margin: 5px 0 14px; color: #64748b; font-size: 12px; }
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
@media (max-width: 900px) { .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .product-context { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .summary-grid { grid-template-columns: 1fr; } }
</style>
