<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { estoqueService } from '@/modules/estoque/services/estoqueService'
import type { LoteResponse } from '@/modules/estoque/types/estoque'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()

const lotes = ref<LoteResponse[]>([])
const carregando = ref(true)
const erro = ref('')
const aviso = ref('')
const busca = ref('')

const unidadeId = computed(() => session.usuario?.unidadeId ?? null)
const hoje = computed(() => inicioDoDia(new Date()))

function inicioDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

function diasAteValidade(lote: LoteResponse) {
  if (!lote.ativo || !lote.dataValidade) return Number.POSITIVE_INFINITY
  const validade = inicioDoDia(new Date(`${lote.dataValidade}T00:00:00`))
  return Math.ceil((validade.getTime() - hoje.value.getTime()) / 86_400_000)
}

const lotesVencendo = computed(() =>
  lotes.value
    .filter((lote) => {
      const dias = diasAteValidade(lote)
      return lote.ativo && lote.unidadeId === unidadeId.value && dias >= 0 && dias <= 30
    })
    .sort((a, b) => diasAteValidade(a) - diasAteValidade(b) || a.produtoNome.localeCompare(b.produtoNome, 'pt-BR')),
)

const lotesFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return lotesVencendo.value

  return lotesVencendo.value.filter((lote) =>
    [lote.codigoInterno, lote.numeroLote, lote.produtoNome, lote.apresentacao, lote.unidadeNome]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(termo),
  )
})

const vencendo7Dias = computed(() =>
  lotesVencendo.value.filter((lote) => diasAteValidade(lote) <= 7).length,
)

const vencendoHoje = computed(() =>
  lotesVencendo.value.filter((lote) => diasAteValidade(lote) === 0).length,
)

function formatarData(data: string | null) {
  if (!data) return 'Sem data'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${data}T00:00:00`))
}

function formatarNumero(valor: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(valor)
}

function prazoLote(lote: LoteResponse) {
  const dias = diasAteValidade(lote)
  if (dias === 0) return 'Vence hoje'
  if (dias === 1) return 'Vence amanhã'
  return `Vence em ${dias} dias`
}

function classePrazo(lote: LoteResponse) {
  const dias = diasAteValidade(lote)
  if (dias <= 2) return 'prazo-chip--critico'
  if (dias <= 7) return 'prazo-chip--atencao'
  return 'prazo-chip--proximo'
}

function abrirLote(lote: LoteResponse) {
  router.push(`/estoque/${lote.estoqueCentralId}?lote=${encodeURIComponent(lote.id)}&situacao=PROXIMO`)
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  aviso.value = ''

  if (!unidadeId.value) {
    erro.value = 'O usuário atual não possui unidade vinculada.'
    carregando.value = false
    return
  }

  try {
    const estoques = (await estoqueService.listarPorUnidade(unidadeId.value)).filter((estoque) => estoque.ativo)
    const resultados = await Promise.allSettled(
      estoques.map((estoque) => estoqueService.listarLotesPorEstoque(estoque.id)),
    )

    lotes.value = resultados
      .filter((resultado): resultado is PromiseFulfilledResult<LoteResponse[]> => resultado.status === 'fulfilled')
      .flatMap((resultado) => resultado.value)

    const falhas = resultados.filter((resultado) => resultado.status === 'rejected').length
    if (falhas > 0) {
      aviso.value = `${falhas} estoque(s) não puderam ter os lotes carregados. Os demais continuam exibidos.`
    }
  } catch (error) {
    console.error(error)
    erro.value = 'Não foi possível carregar os lotes próximos do vencimento.'
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <section class="lotes-vencendo-page">
    <div class="breadcrumb">Operação / Estoque / Lotes vencendo</div>

    <header class="page-header">
      <div>
        <span class="page-eyebrow">CONTROLE DE VALIDADE</span>
        <h1>Lotes vencendo em 30 dias</h1>
        <p>Visualize diretamente os lotes que exigem acompanhamento de validade.</p>
      </div>
      <div class="header-actions">
        <button class="secondary-action" type="button" @click="router.push('/estoque')">Voltar ao estoque</button>
        <button class="primary-action" type="button" :disabled="carregando" @click="carregar">
          {{ carregando ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>
    </header>

    <div class="summary-grid">
      <article class="summary-card summary-card--amber">
        <span>Lotes em até 30 dias</span>
        <strong>{{ lotesVencendo.length }}</strong>
        <small>Ordenados pela validade mais próxima</small>
      </article>
      <article class="summary-card summary-card--orange">
        <span>Em até 7 dias</span>
        <strong>{{ vencendo7Dias }}</strong>
        <small>Precisam de atenção prioritária</small>
      </article>
      <article class="summary-card" :class="{ 'summary-card--red': vencendoHoje > 0 }">
        <span>Vencem hoje</span>
        <strong>{{ vencendoHoje }}</strong>
        <small>{{ vencendoHoje > 0 ? 'Ação recomendada ainda hoje' : 'Nenhum lote vence hoje' }}</small>
      </article>
    </div>

    <div v-if="aviso" class="warning-box">{{ aviso }}</div>

    <section class="filter-card">
      <label>
        <span>Buscar lote</span>
        <input v-model="busca" type="search" placeholder="Código SGL, lote do fornecedor, produto ou laboratório..." />
      </label>
      <div class="filter-result">
        <strong>{{ lotesFiltrados.length }}</strong>
        <span>lote(s) encontrado(s)</span>
        <button v-if="busca" type="button" @click="busca = ''">Limpar busca</button>
      </div>
    </section>

    <div v-if="carregando" class="state-box">Carregando lotes...</div>
    <div v-else-if="erro" class="state-box state-box--error">{{ erro }}</div>
    <div v-else-if="lotesFiltrados.length === 0" class="state-box">Nenhum lote com vencimento nos próximos 30 dias.</div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Lote</th>
            <th>Produto</th>
            <th>Disponível</th>
            <th>Validade</th>
            <th>Prazo</th>
            <th>Unidade recebida</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lote in lotesFiltrados" :key="lote.id" @click="abrirLote(lote)">
            <td>
              <strong>{{ lote.codigoInterno }}</strong>
              <small>Fornecedor: {{ lote.numeroLote }}</small>
            </td>
            <td>
              <strong>{{ lote.produtoNome }}</strong>
              <small>{{ lote.unidadeNome }}</small>
            </td>
            <td><strong class="quantity">{{ formatarNumero(lote.quantidadeDisponivel) }}</strong> {{ lote.unidadeBase }}</td>
            <td><strong>{{ formatarData(lote.dataValidade) }}</strong></td>
            <td><span class="prazo-chip" :class="classePrazo(lote)">{{ prazoLote(lote) }}</span></td>
            <td>
              <strong>{{ lote.apresentacao || lote.tipoEmbalagem }}</strong>
              <small v-if="lote.conteudoPorApresentacao">{{ lote.conteudoPorApresentacao }} {{ lote.unidadeBase }} por embalagem</small>
            </td>
            <td><button class="detail-button" type="button" @click.stop="abrirLote(lote)">›</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.lotes-vencendo-page { width: 100%; max-width: 1540px; margin: 0 auto; color: #1a1a2e; }
.breadcrumb { margin-bottom: 10px; color: #64748b; font-size: 12px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.page-eyebrow { display: block; margin-bottom: 5px; color: #1a4da1; font-size: 10px; font-weight: 900; letter-spacing: .1em; }
.page-header h1 { margin: 0; color: #111a2f; font-size: 30px; }
.page-header p { margin: 7px 0 0; color: #64748b; font-size: 14px; }
.header-actions { display: flex; gap: 8px; }
.primary-action, .secondary-action { min-height: 42px; padding: 0 15px; border-radius: 8px; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }
.primary-action { border: 1px solid #1a4da1; background: #1a4da1; color: #fff; }
.secondary-action { border: 1px solid #cbd5e1; background: #fff; color: #334155; }
.primary-action:disabled { opacity: .55; cursor: wait; }
.summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 22px 0 16px; }
.summary-card { padding: 17px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.summary-card span { display: block; color: #64748b; font-size: 12px; font-weight: 800; }
.summary-card strong { display: block; margin-top: 7px; color: #0d2b5e; font-size: 28px; line-height: 1; }
.summary-card small { display: block; margin-top: 7px; color: #8793a5; font-size: 11px; }
.summary-card--amber { border-color: #f3dcae; background: #fffdf8; }
.summary-card--amber strong { color: #b97408; }
.summary-card--orange { border-color: #f5cf9f; background: #fffaf3; }
.summary-card--orange strong { color: #d8740c; }
.summary-card--red { border-color: #fecaca; background: #fff8f8; }
.summary-card--red strong { color: #c92c2c; }
.warning-box { margin-bottom: 14px; padding: 11px 13px; border: 1px solid #f4d390; border-radius: 8px; background: #fffbeb; color: #8b5b08; font-size: 12px; }
.filter-card { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 14px; margin-bottom: 16px; padding: 14px 15px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
.filter-card label { display: flex; min-width: 0; flex-direction: column; gap: 6px; }
.filter-card label span { color: #475569; font-size: 11px; font-weight: 800; }
.filter-card input { width: 100%; min-height: 40px; padding: 0 11px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1e293b; box-sizing: border-box; outline: none; }
.filter-card input:focus { border-color: #6b91c9; box-shadow: 0 0 0 3px rgb(45 107 196 / 9%); }
.filter-result { min-height: 40px; display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 11px; white-space: nowrap; }
.filter-result strong { color: #0d2b5e; font-size: 17px; }
.filter-result button { margin-left: 6px; border: 0; background: transparent; color: #1a4da1; font-weight: 800; cursor: pointer; }
.table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
table { width: 100%; min-width: 1120px; border-collapse: collapse; }
th { padding: 12px 13px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 900; text-align: left; text-transform: uppercase; }
td { padding: 14px 13px; border-bottom: 1px solid #eef2f7; color: #334155; font-size: 12px; vertical-align: middle; }
tbody tr { cursor: pointer; transition: background 150ms ease; }
tbody tr:hover { background: #fffaf1; }
td strong { color: #1e293b; }
td small { display: block; margin-top: 4px; color: #8b98a9; font-size: 10px; }
.quantity { color: #0d2b5e; font-size: 15px; }
.prazo-chip { display: inline-flex; align-items: center; min-height: 27px; padding: 0 9px; border-radius: 999px; font-size: 10px; font-weight: 900; white-space: nowrap; }
.prazo-chip--critico { background: #fee2e2; color: #b42318; }
.prazo-chip--atencao { background: #fff1dc; color: #b85c00; }
.prazo-chip--proximo { background: #fff7d6; color: #8a6500; }
.detail-button { width: 32px; height: 32px; border: 0; border-radius: 7px; background: #f1f5f9; color: #0d2b5e; font-size: 20px; cursor: pointer; }
.state-box { padding: 36px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff; color: #64748b; text-align: center; }
.state-box--error { border-color: #fecaca; background: #fffafa; color: #b42318; }
@media (max-width: 900px) { .summary-grid { grid-template-columns: 1fr; } .page-header { flex-direction: column; } }
@media (max-width: 640px) { .header-actions { width: 100%; flex-direction: column; } .header-actions button { width: 100%; } .filter-card { grid-template-columns: 1fr; } .filter-result { flex-wrap: wrap; white-space: normal; } }
</style>
