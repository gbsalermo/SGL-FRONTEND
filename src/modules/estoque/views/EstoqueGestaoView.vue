<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { estoqueService } from '@/modules/estoque/services/estoqueService'
import type { EstoqueCentralResponse, LoteResponse } from '@/modules/estoque/types/estoque'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()

const estoques = ref<EstoqueCentralResponse[]>([])
const lotesVencidos = ref<LoteResponse[]>([])
const carregando = ref(true)
const erro = ref('')
const busca = ref('')
const buscaEmFoco = ref(false)
const filtrosAbertos = ref(false)
const situacao = ref<'TODOS' | 'BAIXO' | 'NORMAL' | 'ZERADO' | 'VENCIDO'>('TODOS')
const ordenarPor = ref<'PRODUTO' | 'QUANTIDADE' | 'MINIMO' | 'LOCALIZACAO'>('PRODUTO')
const direcao = ref<'ASC' | 'DESC'>('ASC')

const unidadeId = computed(() => session.usuario?.unidadeId)
const ordemQuantitativa = computed(() => ordenarPor.value === 'QUANTIDADE' || ordenarPor.value === 'MINIMO')
const rotuloOrdem = computed(() => ordemQuantitativa.value ? 'Ordem por quantidade' : 'Ordem alfabética')
const filtroAtivo = computed(() => buscaEmFoco.value || filtrosAbertos.value)

function estoqueBaixo(item: EstoqueCentralResponse) {
  return item.quantidadeAtual < item.quantidadeMinima
}

function estoqueZerado(item: EstoqueCentralResponse) {
  return item.quantidadeAtual <= 0
}

const produtosComLoteVencido = computed(() => new Set(
  lotesVencidos.value
    .filter((lote) => lote.ativo && lote.quantidadeDisponivel > 0 && lote.unidadeId === unidadeId.value)
    .map((lote) => lote.produtoId),
))

function possuiLoteVencido(item: EstoqueCentralResponse) {
  return produtosComLoteVencido.value.has(item.produtoId)
}

const resumo = computed(() => ({
  produtos: estoques.value.filter((item) => item.ativo).length,
  baixo: estoques.value.filter((item) => item.ativo && estoqueBaixo(item)).length,
  zerados: estoques.value.filter((item) => item.ativo && estoqueZerado(item)).length,
  vencidos: produtosComLoteVencido.value.size,
}))

const estoquesFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  const filtrados = estoques.value.filter((item) => {
    if (!item.ativo) return false
    if (situacao.value === 'BAIXO' && !estoqueBaixo(item)) return false
    if (situacao.value === 'NORMAL' && (estoqueBaixo(item) || estoqueZerado(item) || possuiLoteVencido(item))) return false
    if (situacao.value === 'ZERADO' && !estoqueZerado(item)) return false
    if (situacao.value === 'VENCIDO' && !possuiLoteVencido(item)) return false
    if (!termo) return true

    return [item.produtoNome, item.produtoCodigoReferencia, item.produtoUnidadeArmazenamento, item.produtoLocalizacaoFisica, item.unidadeNome, item.unidadeSigla]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(termo)
  })

  return [...filtrados].sort((a, b) => {
    let comparacao = 0
    if (ordenarPor.value === 'QUANTIDADE') comparacao = a.quantidadeAtual - b.quantidadeAtual
    else if (ordenarPor.value === 'MINIMO') comparacao = a.quantidadeMinima - b.quantidadeMinima
    else if (ordenarPor.value === 'LOCALIZACAO') comparacao = (a.produtoLocalizacaoFisica ?? '').localeCompare(b.produtoLocalizacaoFisica ?? '', 'pt-BR', { sensitivity: 'base' })
    else comparacao = a.produtoNome.localeCompare(b.produtoNome, 'pt-BR', { sensitivity: 'base' })
    return direcao.value === 'ASC' ? comparacao : -comparacao
  })
})

function limparFiltros() {
  busca.value = ''
  situacao.value = 'TODOS'
  ordenarPor.value = 'PRODUTO'
  direcao.value = 'ASC'
}

async function carregar() {
  if (!unidadeId.value) {
    erro.value = 'O usuário atual não possui unidade vinculada.'
    carregando.value = false
    return
  }

  carregando.value = true
  erro.value = ''
  try {
    const [estoquesData, vencidosData] = await Promise.all([
      estoqueService.listarPorUnidade(unidadeId.value),
      estoqueService.listarLotesVencidos(),
    ])
    estoques.value = estoquesData
    lotesVencidos.value = vencidosData
  } catch {
    erro.value = 'Não foi possível carregar o estoque da unidade.'
  } finally {
    carregando.value = false
  }
}

function abrirDetalhe(item: EstoqueCentralResponse) {
  router.push(`/estoque/${item.id}`)
}

onMounted(carregar)
</script>

<template>
  <section class="estoque-page">
    <div class="breadcrumb">Operação / Estoque</div>

    <header class="page-header">
      <div>
        <h1>Estoque</h1>
        <p>Acompanhe quantidades em unidades, níveis mínimos, localização e situação dos lotes.</p>
      </div>
      <button class="secondary-action" type="button" @click="carregar">Atualizar</button>
    </header>

    <div class="summary-grid">
      <article><span>Produtos em estoque</span><strong>{{ resumo.produtos }}</strong><small>Registros ativos</small></article>
      <article :class="{ warning: resumo.baixo > 0 }"><span>Estoque baixo</span><strong>{{ resumo.baixo }}</strong><small>Abaixo do mínimo em unidades</small></article>
      <article :class="{ danger: resumo.zerados > 0 }"><span>Zerados</span><strong>{{ resumo.zerados }}</strong><small>Sem unidades disponíveis</small></article>
      <article :class="{ danger: resumo.vencidos > 0 }"><span>Produtos com lote vencido</span><strong>{{ resumo.vencidos }}</strong><small>Somente vencidos que ainda possuem saldo</small></article>
    </div>

    <section class="filter-card">
      <div class="filter-top">
        <label class="search-field">
          <span>Buscar</span>
          <input v-model="busca" type="search" placeholder="Produto, código, embalagem ou localização..." @focus="buscaEmFoco = true" @blur="buscaEmFoco = false" />
        </label>
        <button class="filter-toggle" :class="{ active: filtroAtivo }" type="button" :aria-expanded="filtrosAbertos" title="Filtros avançados" @click="filtrosAbertos = !filtrosAbertos">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l-6.5 7.2v5.1L10.5 19v-6.8L4 5Z" /></svg>
        </button>
      </div>

      <div v-if="filtrosAbertos" class="filter-grid">
        <label><span>Situação</span><select v-model="situacao"><option value="TODOS">Todos</option><option value="BAIXO">Estoque baixo</option><option value="ZERADO">Zerados</option><option value="VENCIDO">Com lote vencido</option><option value="NORMAL">Normal</option></select></label>
        <label><span>Organizar por</span><select v-model="ordenarPor"><option value="PRODUTO">Produto</option><option value="LOCALIZACAO">Localização</option><option value="QUANTIDADE">Quantidade atual</option><option value="MINIMO">Quantidade mínima</option></select></label>
        <label><span>{{ rotuloOrdem }}</span><select v-model="direcao"><option v-if="ordemQuantitativa" value="ASC">Menor → maior</option><option v-if="ordemQuantitativa" value="DESC">Maior → menor</option><option v-if="!ordemQuantitativa" value="ASC">A → Z</option><option v-if="!ordemQuantitativa" value="DESC">Z → A</option></select></label>
      </div>

      <div class="filter-footer"><span>{{ estoquesFiltrados.length }} registro(s) encontrado(s)</span><button type="button" @click="limparFiltros">Limpar filtros</button></div>
    </section>

    <div v-if="carregando" class="state-box">Carregando estoque...</div>
    <div v-else-if="erro" class="state-box state-box--error">{{ erro }}</div>
    <div v-else-if="estoquesFiltrados.length === 0" class="state-box">Nenhum item encontrado para os filtros atuais.</div>

    <div v-else class="table-wrap">
      <table>
        <thead><tr><th>Produto</th><th>Embalagem padrão</th><th>Localização</th><th>Quantidade atual</th><th>Mínimo</th><th>Situação</th><th></th></tr></thead>
        <tbody>
          <tr v-for="item in estoquesFiltrados" :key="item.id" @click="abrirDetalhe(item)">
            <td><strong>{{ item.produtoNome }}</strong><small v-if="item.produtoCodigoReferencia">{{ item.produtoCodigoReferencia }}</small></td>
            <td><strong>{{ item.produtoUnidadeArmazenamento || 'Não informada' }}</strong><small>Saldo geral contado em unidades</small></td>
            <td>{{ item.produtoLocalizacaoFisica || 'Não informada' }}</td>
            <td><strong class="quantity">{{ item.quantidadeAtual }}</strong> unidades</td>
            <td>{{ item.quantidadeMinima }} unidades</td>
            <td>
              <span v-if="estoqueZerado(item)" class="chip danger-chip">ZERADO</span>
              <span v-else-if="possuiLoteVencido(item)" class="chip danger-chip">LOTE VENCIDO</span>
              <span v-else-if="estoqueBaixo(item)" class="chip warning-chip">ESTOQUE BAIXO</span>
              <span v-else class="chip ok-chip">NORMAL</span>
            </td>
            <td><button class="detail-button" type="button" @click.stop="abrirDetalhe(item)">›</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.estoque-page { max-width: 1540px; margin: 0 auto; }
.breadcrumb { margin-bottom: 10px; color: #64748b; font-size: 12px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.page-header h1 { margin: 0; color: #1a1a2e; font-size: 30px; }
.page-header p { margin: 7px 0 0; color: #64748b; font-size: 14px; }
.secondary-action { min-height: 42px; padding: 0 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #334155; font-size: 13px; font-weight: 700; cursor: pointer; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 22px 0 18px; }
.summary-grid article { padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.summary-grid span { display: block; color: #64748b; font-size: 12px; font-weight: 700; }
.summary-grid strong { display: block; margin-top: 8px; color: #0d2b5e; font-size: 26px; }
.summary-grid small { display: block; margin-top: 3px; color: #94a3b8; font-size: 11px; }
.warning { border-color: #fde68a !important; background: #fffdf5 !important; }
.warning strong { color: #946200; }
.danger { border-color: #fecaca !important; background: #fffafa !important; }
.danger strong { color: #b42318; }
.filter-card { margin-bottom: 16px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 11px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.filter-top { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 12px; }
.search-field, .filter-grid label { display: flex; min-width: 0; flex-direction: column; gap: 6px; }
.search-field span, .filter-grid span { color: #475569; font-size: 11px; font-weight: 700; }
.search-field input, .filter-grid select { width: 100%; min-height: 40px; padding: 0 11px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1a1a2e; outline: none; box-sizing: border-box; }
.filter-toggle { width: 36px; height: 36px; display: inline-grid; place-items: center; align-self: end; margin-bottom: 2px; padding: 0; border: 2px solid #1a1a2e; border-radius: 50%; background: #fff; color: #1a1a2e; cursor: pointer; }
.filter-toggle svg { width: 19px; height: 19px; fill: currentColor; }
.filter-toggle.active { border-color: #1a4da1; background: #1a4da1; color: #fff; }
.filter-grid { display: grid; grid-template-columns: repeat(3, minmax(160px, 1fr)); gap: 12px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #eef2f7; }
.filter-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef2f7; color: #64748b; font-size: 11px; }
.filter-footer button { border: 0; background: transparent; color: #1a4da1; font-weight: 700; cursor: pointer; }
.table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
table { width: 100%; min-width: 1080px; border-collapse: collapse; }
th { padding: 12px 13px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 800; text-align: left; text-transform: uppercase; }
td { padding: 13px; border-bottom: 1px solid #eef2f7; color: #334155; font-size: 12px; vertical-align: middle; }
tbody tr { cursor: pointer; }
tbody tr:hover { background: #fbfdff; }
td strong { color: #1e293b; }
td small { display: block; margin-top: 3px; color: #94a3b8; font-size: 10px; }
.quantity { color: #0d2b5e; font-size: 15px; }
.chip { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; font-size: 9px; font-weight: 800; }
.ok-chip { background: #e7f7ed; color: #007a3d; }
.warning-chip { background: #fff7d6; color: #946200; }
.danger-chip { background: #fee2e2; color: #b42318; }
.detail-button { width: 30px; height: 30px; border: 0; border-radius: 7px; background: #f1f5f9; color: #0d2b5e; font-size: 18px; cursor: pointer; }
.state-box { padding: 34px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff; color: #64748b; text-align: center; }
.state-box--error { border-color: #fecaca; color: #b42318; background: #fffafa; }
@media (max-width: 900px) { .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .page-header { flex-direction: column; } .summary-grid, .filter-top, .filter-grid { grid-template-columns: 1fr; } .filter-toggle { justify-self: end; } }
</style>
