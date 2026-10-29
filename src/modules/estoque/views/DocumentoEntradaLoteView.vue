<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { estoqueService } from '@/modules/estoque/services/estoqueService'
import type { EstoqueCentralResponse, LoteResponse, MovimentacaoLoteResponse } from '@/modules/estoque/types/estoque'
import '@/modules/rotulos/styles/rotulosOperacionais.css'

const route = useRoute()
const router = useRouter()
const lote = ref<LoteResponse | null>(null)
const estoque = ref<EstoqueCentralResponse | null>(null)
const movimentos = ref<MovimentacaoLoteResponse[]>([])
const carregando = ref(true)
const erro = ref('')
const larguraMm = ref(180)
const BASE_LARGURA = 180
const BASE_ALTURA = 125
const MIN = 70
const MAX = 190
const tamanhos = [90, 135, 180, 190]
const alturaRotuloMm = computed(() => Math.round(larguraMm.value / BASE_LARGURA * BASE_ALTURA * 10) / 10)
function normalizar() {
  larguraMm.value = Math.min(MAX, Math.max(MIN, Math.round(Number(larguraMm.value) || BASE_LARGURA)))
}
const frameStyle = computed(() => ({ width: String(larguraMm.value) + 'mm' }))
const labelStyle = computed(() => ({ zoom: larguraMm.value / 180 }))
const primeiraEntrada = computed(() => movimentos.value
  .filter(m => m.tipoMovimentacao === 'ENTRADA')
  .sort((a,b) => a.dataMovimentacao.localeCompare(b.dataMovimentacao))[0] ?? null)
function numero(n: number | null | undefined) {
  return typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString('pt-BR', { maximumFractionDigits: 6 }) : 'Não informado'
}
function data(valor: string | null | undefined) {
  if (!valor) return 'Não informada'
  const partes = valor.slice(0,10).split('-')
  return partes.length === 3 ? [partes[2],partes[1],partes[0]].join('/') : valor
}
function rotulo(valor: string | null | undefined) {
  return valor ? valor.toLowerCase().replaceAll('_',' ').replace(/^./, c => c.toUpperCase()) : 'Não informado'
}
function unidade(valor: string | null | undefined) {
  const mapa: Record<string,string> = { ML:'mL', L:'L', MG:'mg', G:'g', KG:'kg', UNIDADE:'un.', REACAO:'reações', METRO:'m' }
  return valor ? (mapa[valor] ?? valor) : 'un.'
}
async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const id = String(route.params.id ?? '')
    const registro = await estoqueService.buscarLotePorId(id)
    // O estoque guarda o nome e código do produto no contexto da Unidade.
    const [detalheEstoque, historico] = await Promise.all([
      estoqueService.buscarPorId(registro.estoqueCentralId),
      estoqueService.listarMovimentacoesPorLote(id),
    ])
    lote.value = registro
    estoque.value = detalheEstoque
    movimentos.value = historico
  } catch(e) {
    erro.value = e instanceof Error ? e.message : 'Não foi possível consultar o lote.'
  } finally {
    carregando.value = false
  }
}
function imprimir() {
  if (!lote.value || !estoque.value || !!erro.value) return
  normalizar()
  window.print()
}
function voltar() {
  router.push(estoque.value ? '/estoque/' + estoque.value.id : '/estoque')
}
onMounted(carregar)
</script>

<template>
  <main class="op-print-page">
    <header class="op-print-toolbar">
      <button type="button" @click="voltar">← Voltar</button>
      <div><strong>Documento de entrada de lote</strong><span>Registro interno do SGL baseado nos dados informados e nas movimentações de entrada.</span></div>
      <button type="button" class="op-print-primary" :disabled="!lote || !estoque || carregando || !!erro" @click="imprimir">Imprimir documento</button>
    </header>
    <section class="op-print-controls">
      <div class="op-print-presets">
        <button v-for="largura in tamanhos" :key="largura" type="button" :class="{ chosen: larguraMm === largura }" @click="larguraMm = largura">
          <strong>{{ largura === 90 ? 'Pequeno' : largura === 135 ? 'Médio' : largura === 180 ? 'Grande' : 'Máx. A4' }}</strong>
          <span>{{ largura }} × {{ Math.round(largura / BASE_LARGURA * BASE_ALTURA) }} mm</span>
        </button>
      </div>
      <div class="op-print-custom">
        <label><span>Largura personalizada</span><input v-model.number="larguraMm" type="range" :min="MIN" :max="MAX" step="5" /></label>
        <label class="op-print-number"><span>Largura</span><div><input v-model.number="larguraMm" type="number" :min="MIN" :max="MAX" @change="normalizar" /><b>mm</b></div></label>
        <div class="op-print-result"><span>Dimensões mínimas</span><strong>{{ larguraMm }} × {{ alturaRotuloMm }} mm</strong></div>
      </div>
    </section>
    <p v-if="carregando" class="op-print-notice">Carregando registro da entrada...</p>
    <p v-else-if="erro" class="op-print-error">{{ erro }}</p>
    <div v-else-if="lote && estoque" class="op-print-canvas">
      <div class="op-print-frame" :style="frameStyle">
        <article class="op-label" :style="labelStyle" aria-label="Documento de entrada de lote">
          <header class="op-label-header">
            <img src="/assets/residuos/marcas/sgl-logo.png.png" alt="SGL" />
            <div>
              <span class="op-label-marker">DOCUMENTO DE ENTRADA DE LOTE</span>
              <h1>{{ lote.produtoNome }}</h1>
              <p><b>USO INTERNO — SEM VALOR FISCAL</b></p>
            </div>
            <img src="/assets/residuos/marcas/embrapa.png" alt="Embrapa" />
          </header>
          <div class="op-label-body">
            <section class="op-label-highlight">
              <div class="op-label-grid">
                <div class="op-label-field"><b>Código SGL do lote</b><span class="op-label-strong">{{ lote.codigoInterno }}</span></div>
                <div class="op-label-field"><b>Lote/referência informada</b><span>{{ lote.numeroLote }}</span></div>
                <div class="op-label-field"><b>Código do produto</b><span>{{ estoque.produtoCodigoReferencia || 'Não informado' }}</span></div>
                <div class="op-label-field"><b>Unidade</b><span>{{ estoque.unidadeSigla }} — {{ lote.unidadeNome }}</span></div>
              </div>
            </section>
            <section>
              <h2 class="op-label-title">RECEBIMENTO REGISTRADO</h2>
              <div class="op-label-grid">
                <div class="op-label-field"><b>Apresentação / embalagem</b><span>{{ lote.apresentacao || rotulo(lote.tipoEmbalagem) }}</span></div>
                <div class="op-label-field"><b>Tipo de embalagem</b><span>{{ rotulo(lote.tipoEmbalagem) }}</span></div>
                <div class="op-label-field"><b>Quantidade original de embalagens</b><span>{{ numero(lote.quantidadeApresentacoes) }}</span></div>
                <div class="op-label-field"><b>Conteúdo por embalagem</b><span>{{ numero(lote.conteudoPorApresentacao) }} {{ unidade(lote.unidadeBase) }}</span></div>
                <div class="op-label-field"><b>Total original recebido</b><span class="op-label-strong">{{ numero(lote.quantidadeInicial) }} {{ unidade(lote.unidadeBase) }}</span></div>
                <div class="op-label-field"><b>Permite fracionamento</b><span>{{ lote.fracionavel === false ? 'Não' : lote.fracionavel === true ? 'Sim' : 'Não informado' }}</span></div>
                <div class="op-label-field"><b>Data de entrada</b><span>{{ data(lote.dataEntrada) }}</span></div>
                <div class="op-label-field"><b>Validade</b><span>{{ data(lote.dataValidade) }}</span></div>
                <div class="op-label-field"><b>Origem registrada</b><span>{{ rotulo(primeiraEntrada?.origem) }}</span></div>
                <div class="op-label-field"><b>Registro realizado por</b><span>{{ primeiraEntrada?.usuarioNome || 'Não identificado no histórico' }}</span></div>
                <div v-if="lote.observacao" class="op-label-field op-label-field--full"><b>Observações do lote</b><p>{{ lote.observacao }}</p></div>
                <div v-if="primeiraEntrada?.observacao && primeiraEntrada.observacao !== lote.observacao" class="op-label-field op-label-field--full"><b>Observações da entrada</b><p>{{ primeiraEntrada.observacao }}</p></div>
              </div>
            </section>
            <div class="op-label-warn">Documento informativo para rastreabilidade interna do SGL. Não representa nota fiscal nem substitui documentos fiscais ou de segurança aplicáveis.</div>
          </div>
          <footer class="op-label-footer">
            <img src="/assets/residuos/marcas/embrapa.png" alt="Embrapa" />
            <div><b>Estoque / Entrada de lote</b><span>{{ lote.codigoInterno }} · {{ data(lote.dataEntrada) }}</span></div>
            <img src="/assets/residuos/marcas/sgl-logo.png.png" alt="SGL" />
          </footer>
        </article>
      </div>
    </div>
  </main>
</template>
