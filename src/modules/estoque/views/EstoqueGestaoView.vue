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
const filtrosAbertos = ref(false)
const situacao = ref<'TODOS' | 'BAIXO' | 'NORMAL' | 'ZERADO' | 'VENCIDO'>('TODOS')
const ordenarPor = ref<'PRODUTO' | 'QUANTIDADE' | 'MINIMO' | 'LOCALIZACAO'>('PRODUTO')
const direcao = ref<'ASC' | 'DESC'>('ASC')

const unidadeId = computed(() => session.usuario?.unidadeId)

function estoqueBaixo(item: EstoqueCentralResponse) {
  return item.quantidadeAtual < item.quantidadeMinima
}

function estoqueZerado(item: EstoqueCentralResponse) {
  return item.quantidadeAtual <= 0
}

const produtosComLoteVencido = computed(() => new Set(
  lotesVencidos.value
    .filter((lote) => lote.ativo && lote.unidadeId === unidadeId.value)
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
    if (situacao.value === 'NORMAL' && (estoqueBaixo(item) || estoqueZerado(item))) return false
    if (situacao.value === 'ZERADO' && !estoqueZerado(item)) return false
    if (situacao.value === 'VENCIDO' && !possuiLoteVencido(item)) return false

    if (!termo) return true

    return [
      item.produtoNome,
      item.produtoCodigoReferencia,
      item.produtoUnidadeArmazenamento,
      item.produtoLocalizacaoFisica,
      item.unidadeNome,
      item.unidadeSigla,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(termo)
  })

  return [...filtrados].sort((a, b) => {
    let comparacao = 0

    if (ordenarPor.value === 'QUANTIDADE') comparacao = a.quantidadeAtual - b.quantidadeAtual
    else if (ordenarPor.value === 'MINIMO') comparacao = a.quantidadeMinima - b.quantidadeMinima
    else if (ordenarPor.value === 'LOCALIZACAO') {
      comparacao = (a.produtoLocalizacaoFisica ?? '').localeCompare(b.produtoLocalizacaoFisica ?? '', 'pt-BR', { sensitivity: 'base' })
    } else comparacao = a.produtoNome.localeCompare(b.produtoNome, 'pt-BR', { sensitivity: 'base' })

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
    <div class="estoque-page__breadcrumb">Operação / Estoque</div>

    <header class="estoque-page__header">
      <div>
        <h1>Estoque</h1>
        <p>Acompanhe saldos, níveis mínimos, localização e situação dos lotes da sua unidade.</p>
      </div>
      <button class="secondary-action" type="button" @click="carregar">Atualizar</button>
    </header>

    <div class="estoque-summary">
      <article>
        <span>Produtos em estoque</span>
        <strong>{{ resumo.produtos }}</strong>
        <small>Registros ativos</small>
      </article>
      <article :class="{ 'estoque-summary--warning': resumo.baixo > 0 }">
        <span>Estoque baixo</span>
        <strong>{{ resumo.baixo }}</strong>
        <small>Abaixo do mínimo</small>
      </article>
      <article :class="{ 'estoque-summary--danger': resumo.zerados > 0 }">
        <span>Zerados</span>
        <strong>{{ resumo.zerados }}</strong>
        <small>Sem saldo disponível</small>
      </article>
      <article :class="{ 'estoque-summary--danger': resumo.vencidos > 0 }">
        <span>Produtos com lote vencido</span>
        <strong>{{ resumo.vencidos }}</strong>
        <small>Produtos distintos que exigem atenção</small>
      </article>
    </div>

    <section class="estoque-filter-card">
      <div class="estoque-filter-top">
        <label class="estoque-search">
          <span>Buscar</span>
          <input v-model="busca" type="search" placeholder="Produto, código, apresentação ou localização..." />
        </label>

        <button class="filter-toggle" type="button" :aria-expanded="filtrosAbertos" @click="filtrosAbertos = !filtrosAbertos">
          <span>Filtros</span>
          <strong>{{ filtrosAbertos ? '⌃' : '⌄' }}</strong>
        </button>
      </div>

      <div v-if="filtrosAbertos" class="estoque-filter-grid">
        <label>
          <span>Situação</span>
          <select v-model="situacao">
            <option value="TODOS">Todos</option>
            <option value="BAIXO">Estoque baixo</option>
            <option value="ZERADO">Zerados</option>
            <option value="VENCIDO">Com lote vencido</option>
            <option value="NORMAL">Normal</option>
          </select>
        </label>

        <label>
          <span>Organizar por</span>
          <select v-model="ordenarPor">
            <option value="PRODUTO">Produto</option>
            <option value="LOCALIZACAO">Localização</option>
            <option value="QUANTIDADE">Quantidade atual</option>
            <option value="MINIMO">Quantidade mínima</option>
          </select>
        </label>

        <label>
          <span>Ordem</span>
          <select v-model="direcao">
            <option value="ASC">Crescente</option>
            <option value="DESC">Decrescente</option>
          </select>
        </label>
      </div>

      <div class="estoque-filter-footer">
        <span>{{ estoquesFiltrados.length }} registro(s) encontrado(s)</span>
        <button type="button" @click="limparFiltros">Limpar filtros</button>
      </div>
    </section>

    <div v-if="carregando" class="estoque-state">Carregando estoque...</div>
    <div v-else-if="erro" class="estoque-state estoque-state--error">{{ erro }}</div>
    <div v-else-if="estoquesFiltrados.length === 0" class="estoque-state">Nenhum item encontrado para os filtros atuais.</div>

    <div v-else class="estoque-table-wrap">
      <table class="estoque-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Apresentação</th>
            <th>Localização</th>
            <th>Quantidade atual</th>
            <th>Mínimo</th>
            <th>Situação</th>
            <th aria-label="Abrir detalhe"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in estoquesFiltrados" :key="item.id" @click="abrirDetalhe(item)">
            <td>
              <strong>{{ item.produtoNome }}</strong>
              <small v-if="item.produtoCodigoReferencia">{{ item.produtoCodigoReferencia }}</small>
            </td>
            <td>{{ item.produtoUnidadeArmazenamento || 'Não informada' }}</td>
            <td>
              <span class="location-copy">{{ item.produtoLocalizacaoFisica || 'Não informada' }}</span>
            </td>
            <td><strong class="quantidade-atual">{{ item.quantidadeAtual }}</strong></td>
            <td>{{ item.quantidadeMinima }}</td>
            <td>
              <span v-if="estoqueZerado(item)" class="stock-chip stock-chip--danger">ZERADO</span>
              <span v-else-if="possuiLoteVencido(item)" class="stock-chip stock-chip--danger">LOTE VENCIDO</span>
              <span v-else-if="estoqueBaixo(item)" class="stock-chip stock-chip--warning">ESTOQUE BAIXO</span>
              <span v-else class="stock-chip stock-chip--ok">NORMAL</span>
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
.estoque-page__breadcrumb { margin-bottom: 10px; color: #64748b; font-size: 12px; }
.estoque-page__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.estoque-page__header h1 { margin: 0; color: #1a1a2e; font-size: 30px; }
.estoque-page__header p { margin: 7px 0 0; color: #64748b; font-size: 14px; }
.secondary-action { min-height: 42px; padding: 0 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #334155; font-size: 13px; font-weight: 700; cursor: pointer; }

.estoque-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 22px 0 18px; }
.estoque-summary article { padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.estoque-summary span { display: block; color: #64748b; font-size: 12px; font-weight: 700; }
.estoque-summary strong { display: block; margin-top: 8px; color: #0d2b5e; font-size: 26px; }
.estoque-summary small { display: block; margin-top: 3px; color: #94a3b8; font-size: 11px; line-height: 1.35; }
.estoque-summary--warning { border-color: #fde68a !important; background: #fffdf5 !important; }
.estoque-summary--warning strong { color: #946200; }
.estoque-summary--danger { border-color: #fecaca !important; background: #fffafa !important; }
.estoque-summary--danger strong { color: #b42318; }

.estoque-filter-card { margin-bottom: 16px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 11px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.estoque-filter-top { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 12px; }
.estoque-search, .estoque-filter-grid label { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.estoque-search > span, .estoque-filter-grid label > span { color: #475569; font-size: 11px; font-weight: 700; }
.estoque-search input, .estoque-filter-grid select { width: 100%; min-height: 40px; padding: 0 11px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1a1a2e; outline: none; }
.filter-toggle { min-width: 108px; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 0 13px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #334155; font-size: 12px; font-weight: 700; cursor: pointer; }
.estoque-filter-grid { display: grid; grid-template-columns: repeat(3, minmax(160px, 1fr)); gap: 12px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #eef2f7; }
.estoque-filter-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef2f7; color: #64748b; font-size: 11px; }
.estoque-filter-footer button { border: 0; background: transparent; color: #1a4da1; font-weight: 700; cursor: pointer; }

.estoque-table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 5px 18px rgb(15 23 42 / 4%); }
.estoque-table { width: 100%; border-collapse: collapse; min-width: 1080px; }
.estoque-table th { padding: 12px 13px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 800; letter-spacing: .04em; text-align: left; text-transform: uppercase; }
.estoque-table td { padding: 13px; border-bottom: 1px solid #eef2f7; color: #334155; font-size: 12px; vertical-align: middle; }
.estoque-table tbody tr { cursor: pointer; }
.estoque-table tbody tr:hover { background: #fbfdff; }
.estoque-table td strong { color: #1e293b; font-size: 12px; }
.estoque-table td small { display: block; margin-top: 3px; color: #94a3b8; font-size: 10px; }
.location-copy { color: #334155; font-weight: 650; }
.quantidade-atual { color: #0d2b5e !important; font-size: 15px !important; }
.stock-chip { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; font-size: 9px; font-weight: 800; }
.stock-chip--ok { background: #e7f7ed; color: #007a3d; }
.stock-chip--warning { background: #fff7d6; color: #946200; }
.stock-chip--danger { background: #fee2e2; color: #b42318; }
.detail-button { width: 30px; height: 30px; border: 0; border-radius: 7px; background: #f1f5f9; color: #0d2b5e; font-size: 18px; cursor: pointer; }
.estoque-state { padding: 34px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff; color: #64748b; text-align: center; }
.estoque-state--error { border-color: #fecaca; color: #b42318; background: #fffafa; }

@media (max-width: 900px) {
  .estoque-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .estoque-page__header { flex-direction: column; }
  .estoque-summary, .estoque-filter-top, .estoque-filter-grid { grid-template-columns: 1fr; }
  .filter-toggle { width: 100%; }
}
</style>
