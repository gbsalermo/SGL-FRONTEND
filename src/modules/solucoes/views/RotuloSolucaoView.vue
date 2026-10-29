<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { solucaoService } from '@/modules/solucoes/services/solucaoService'
import { exibirQuantidade, type MovimentacaoSolucao, type PedidoSolucao } from '@/modules/solucoes/types/solucao'
import '@/modules/rotulos/styles/rotulosOperacionais.css'
import ZebraExportPanel from '@/modules/rotulos/zebra/ZebraExportPanel.vue'
import type { DocumentoZpl } from '@/modules/rotulos/zebra/zpl'

const route = useRoute()
const router = useRouter()
const pedido = ref<PedidoSolucao | null>(null)
const movimentos = ref<MovimentacaoSolucao[]>([])
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

const habilitado = computed(() => pedido.value?.status === 'EM_PREPARACAO' || pedido.value?.status === 'ENTREGUE')
const frameStyle = computed(() => ({ width: String(larguraMm.value) + 'mm' }))
const labelStyle = computed(() => ({ zoom: larguraMm.value / 180 }))
const saidasAprovacao = computed(() => movimentos.value
  .filter(m => m.tipoMovimentacao === 'SAIDA')
  .sort((a, b) => a.dataMovimentacao.localeCompare(b.dataMovimentacao)))
const responsavelAprovacao = computed(() => {
  const nomes = [...new Set(saidasAprovacao.value.map(m => m.usuarioNome).filter(Boolean))]
  if (nomes.length === 1) return nomes[0]
  if (nomes.length > 1) return 'Aprovação com responsáveis divergentes nos registros'
  return 'Não identificado nas movimentações'
})
const primeiraMovimentacao = computed(() => saidasAprovacao.value[0]?.dataMovimentacao ?? null)

const documentoZebra = computed<DocumentoZpl | null>(() => {
  const p = pedido.value
  if (!p || !habilitado.value) return null
  return {
    titulo: 'SOLUCAO - ' + (p.status === 'EM_PREPARACAO' ? 'EM PREPARACAO' : 'ENTREGUE'),
    identificador: p.id,
    subtitulo: p.nomeSolucao || 'Solucao sem nome',
    secoes: [
      { titulo: 'Origem', campos: [
        { rotulo: 'Unidade', valor: (p.unidadeSigla || '') + ' - ' + (p.unidadeNome || '') },
        { rotulo: 'Laboratorio', valor: p.laboratorioOrigemNome || p.laboratorioNome },
        { rotulo: 'Projeto', valor: p.projetoOrigemNome || p.projetoNome },
        { rotulo: 'SCI', valor: p.sciOrigemNome },
        { rotulo: 'Atividade', valor: p.atividadeOrigemNome },
      ] },
      { titulo: 'Aprovacao', campos: [
        { rotulo: 'Solicitante', valor: p.usuarioNome },
        { rotulo: 'Preparacao aprovada por', valor: responsavelAprovacao.value },
        { rotulo: 'Registro de aprovacao', valor: formatarDataHora(primeiraMovimentacao.value) },
        { rotulo: 'Situacao', valor: p.status },
      ] },
      { titulo: 'Componentes informados', campos: p.itens.map(item => ({
        rotulo: item.produtoNome,
        valor: exibirQuantidade(item.quantidadeAprovada ?? item.quantidadeSolicitada) + ' ' + unidadeLegivel(item.unidadeMedidaSolicitada),
      })) },
      { titulo: 'Instrucoes e observacoes', campos: [
        { rotulo: 'Instrucoes', valor: p.instrucoesPreparoSolucao },
        { rotulo: 'Observacoes', valor: p.observacao },
      ] },
    ],
    avisoFinal: 'IDENTIFICA O PEDIDO; NAO COMPROVA O PREPARO FISICO, VOLUME FINAL, CONCENTRACAO OU VALIDADE.',
  }
})


function formatarData(data: string | null | undefined) {
  if (!data) return 'Não informada'
  const valor = new Date(data)
  return Number.isNaN(valor.getTime()) ? 'Não informada' : valor.toLocaleDateString('pt-BR')
}
function formatarDataHora(data: string | null | undefined) {
  if (!data) return 'Não registrada'
  const valor = new Date(data)
  return Number.isNaN(valor.getTime()) ? 'Não registrada' : valor.toLocaleString('pt-BR')
}
function unidadeLegivel(valor: string | null | undefined) {
  const rotulos: Record<string,string> = { ML: 'mL', L: 'L', MG: 'mg', G: 'g', KG: 'kg', METRO: 'm', UNIDADE: 'un.', REACAO: 'reações' }
  return valor ? (rotulos[valor] ?? valor) : 'unidade não informada'
}
async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const id = String(route.params.id ?? '')
    const registro = await solucaoService.buscarPedido(id)
    if (registro.tipo !== 'SOLUCAO') throw new Error('O registro informado não é um pedido de Solução.')
    pedido.value = registro
    // A saída de estoque ocorre no ato da aprovação e registra o aprovador.
    if (registro.status === 'EM_PREPARACAO' || registro.status === 'ENTREGUE') {
      movimentos.value = await solucaoService.listarMovimentacoes(id)
    }
  } catch (e) {
    erro.value = e instanceof Error ? e.message : 'Não foi possível consultar a Solução.'
  } finally {
    carregando.value = false
  }
}
function imprimir() {
  if (!habilitado.value || carregando.value || erro.value) return
  normalizar()
  window.print()
}
onMounted(carregar)
</script>

<template>
  <main class="op-print-page">
    <header class="op-print-toolbar">
      <button type="button" @click="router.push('/solucoes')">← Voltar</button>
      <div>
        <strong>Rótulo de Solução</strong>
        <span>Composição e contexto do pedido, sem presumir concentração final, validade ou volume preparado.</span>
      </div>
      <button type="button" class="op-print-primary" :disabled="!habilitado || carregando || !!erro" @click="imprimir">Imprimir rótulo</button>
    </header>
    <div v-if="pedido && !habilitado" class="op-print-notice">Prévia apenas: impressão liberada após a aprovação, quando o pedido estiver em preparação.</div>
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
    <ZebraExportPanel :documento="documentoZebra" :bloqueado="!habilitado || carregando || !!erro" />
    <p v-if="carregando" class="op-print-notice">Carregando o pedido e a rastreabilidade...</p>
    <p v-else-if="erro" class="op-print-error">{{ erro }}</p>
    <div v-else-if="pedido" class="op-print-canvas" :class="{ 'op-print-blocked': !habilitado }">
      <div class="op-print-frame" :style="frameStyle">
        <article class="op-label" :style="labelStyle" aria-label="Rótulo de solução">
          <header class="op-label-header">
            <img src="/assets/residuos/marcas/sgl-logo.png.png" alt="SGL" />
            <div>
              <span class="op-label-marker op-label-marker--green">{{ habilitado ? (pedido.status === 'ENTREGUE' ? 'SOLUÇÃO ENTREGUE' : 'SOLUÇÃO EM PREPARAÇÃO') : 'SOLUÇÃO — PRÉVIA' }}</span>
              <h1>{{ pedido.nomeSolucao || 'Solução sem nome informado' }}</h1>
              <p>Pedido SGL: {{ pedido.id }}</p>
            </div>
            <img src="/assets/residuos/marcas/embrapa.png" alt="Embrapa" />
          </header>
          <div class="op-label-body">
            <div class="op-label-grid">
              <div class="op-label-field"><b>Unidade</b><span>{{ pedido.unidadeSigla }} — {{ pedido.unidadeNome }}</span></div>
              <div class="op-label-field"><b>Laboratório</b><span>{{ pedido.laboratorioOrigemNome || pedido.laboratorioNome }}</span></div>
              <div v-if="pedido.projetoOrigemNome || pedido.projetoNome" class="op-label-field"><b>Projeto</b><span>{{ pedido.projetoOrigemNome || pedido.projetoNome }}</span></div>
              <div v-if="pedido.sciOrigemNome" class="op-label-field"><b>SCI</b><span>{{ pedido.sciOrigemNome }}</span></div>
              <div v-if="pedido.atividadeOrigemNome" class="op-label-field"><b>Atividade</b><span>{{ pedido.atividadeOrigemNome }}</span></div>
              <div class="op-label-field"><b>Solicitado por</b><span>{{ pedido.usuarioNome }}</span></div>
            </div>
            <div class="op-label-highlight op-label-highlight--green">
              <div class="op-label-grid">
                <div class="op-label-field"><b>Preparação aprovada por</b><span class="op-label-strong">{{ habilitado ? responsavelAprovacao : 'Aguardando aprovação' }}</span></div>
                <div class="op-label-field"><b>Movimentação de aprovação</b><span>{{ habilitado ? formatarDataHora(primeiraMovimentacao) : 'Ainda não realizada' }}</span></div>
                <div class="op-label-field"><b>Situação</b><span>{{ pedido.status === 'EM_PREPARACAO' ? 'Em preparação' : pedido.status === 'ENTREGUE' ? 'Entregue' : pedido.status.replaceAll('_', ' ') }}</span></div>
                <div class="op-label-field"><b>Data da solicitação</b><span>{{ formatarData(pedido.dataSolicitacao) }}</span></div>
              </div>
            </div>
            <section>
              <h2 class="op-label-title">COMPOSIÇÃO REGISTRADA</h2>
              <ul class="op-label-items">
                <li v-for="item in pedido.itens" :key="item.id">
                  <b>{{ item.produtoNome }}</b>
                  {{ exibirQuantidade(item.quantidadeAprovada ?? item.quantidadeSolicitada) }} {{ unidadeLegivel(item.unidadeMedidaSolicitada) }}
                </li>
              </ul>
            </section>
            <div v-if="pedido.instrucoesPreparoSolucao" class="op-label-field">
              <b>Instruções cadastradas</b><p>{{ pedido.instrucoesPreparoSolucao }}</p>
            </div>
            <div v-if="pedido.observacao" class="op-label-field"><b>Observações registradas</b><p>{{ pedido.observacao }}</p></div>
            <p class="op-label-caption">Este rótulo identifica o pedido de Solução. Não comprova, por si só, o preparo físico, volume final, concentração ou validade.</p>
          </div>
          <footer class="op-label-footer">
            <img src="/assets/residuos/marcas/embrapa.png" alt="Embrapa" />
            <div><b>SGL — Sistema de Gestão de Laboratórios</b><span>Registro operacional de Solução · {{ pedido.id.slice(0, 8).toUpperCase() }}</span></div>
            <img src="/assets/residuos/marcas/sgl-logo.png.png" alt="SGL" />
          </footer>
        </article>
      </div>
    </div>
  </main>
</template>

<style scoped>
@media print{
  .op-print-blocked{display:none!important}
  .op-print-blocked::after{content:none}
}
</style>
