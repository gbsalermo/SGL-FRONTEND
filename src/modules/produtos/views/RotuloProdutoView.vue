<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ProdutoRotuloModelo from '@/modules/produtos/components/rotulo/ProdutoRotuloModelo.vue'
import { produtoService } from '@/modules/produtos/services/produtoService'
import type { ProdutoRotuloResponse } from '@/modules/produtos/types/produtoRotulo'

const route = useRoute()
const router = useRouter()
const dados = ref<ProdutoRotuloResponse | null>(null)
const carregando = ref(true)
const erro = ref('')
const larguraRotuloMm = ref(180)
const BASE_LARGURA = 180
const BASE_ALTURA = 125
const MIN = 70
const MAX = 190
const tamanhos = [90, 135, 180, 190]
const alturaRotuloMm = computed(() => Math.round(larguraRotuloMm.value / BASE_LARGURA * BASE_ALTURA * 10) / 10)

async function carregar() {
  const id = String(route.params.id ?? '')
  try {
    dados.value = await produtoService.buscarPorId(id)
  } catch (error) {
    erro.value = error instanceof Error ? error.message : 'Não foi possível carregar o produto.'
  } finally {
    carregando.value = false
  }
}

function normalizar() {
  larguraRotuloMm.value = Math.min(MAX, Math.max(MIN, Math.round(Number(larguraRotuloMm.value) || BASE_LARGURA)))
}

function imprimir() { normalizar(); window.print() }
function voltar() { router.back() }
onMounted(carregar)
</script>

<template>
  <main class="print-page">
    <header class="toolbar no-print">
      <button type="button" @click="voltar">← Voltar</button>
      <div><strong>Rótulo de produto</strong><span>O rótulo usa os dados atuais do catálogo, incluindo controle e fiscalização.</span></div>
      <button class="primary" type="button" :disabled="!dados" @click="imprimir">Imprimir rótulo</button>
    </header>

    <section class="controls no-print">
      <div class="presets">
        <button v-for="largura in tamanhos" :key="largura" type="button" :class="{ active: larguraRotuloMm === largura }" @click="larguraRotuloMm = largura">
          <strong>{{ largura === 90 ? 'Pequeno' : largura === 135 ? 'Médio' : largura === 180 ? 'Grande' : 'Máx. A4' }}</strong>
          <span>{{ largura }} × {{ Math.round(largura / BASE_LARGURA * BASE_ALTURA) }} mm</span>
        </button>
      </div>
      <div class="custom">
        <label><span>Largura personalizada</span><input v-model.number="larguraRotuloMm" type="range" :min="MIN" :max="MAX" step="5" /></label>
        <label class="number"><span>Largura</span><div><input v-model.number="larguraRotuloMm" type="number" :min="MIN" :max="MAX" @change="normalizar" /><b>mm</b></div></label>
        <div class="result"><span>Tamanho final</span><strong>{{ larguraRotuloMm }} × {{ alturaRotuloMm }} mm</strong></div>
      </div>
    </section>

    <section v-if="carregando" class="state">Carregando produto...</section>
    <section v-else-if="erro" class="state error">{{ erro }}</section>
    <div v-else-if="dados" class="canvas"><ProdutoRotuloModelo :dados="dados" :largura-mm="larguraRotuloMm" /></div>
  </main>
</template>

<style scoped>
.print-page { min-height: 100vh; padding: 24px; background: #edf1f6; color: #15243b; }
.toolbar, .controls { width: min(100%, 1120px); margin: 0 auto 14px; padding: 16px 18px; border: 1px solid #d9e1eb; border-radius: 11px; background: #fff; box-shadow: 0 10px 30px rgb(13 43 94 / 7%); }
.toolbar { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 18px; }
.toolbar > div { display: flex; flex-direction: column; gap: 3px; }
.toolbar span { color: #718096; font-size: 12px; }
.toolbar button, .presets button { min-height: 40px; padding: 0 14px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #34445c; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.toolbar .primary { border: 0; background: #174da3; color: #fff; }
.controls { display: grid; gap: 14px; margin-bottom: 22px; }
.presets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.presets button { min-height: 54px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px; }
.presets button.active { border-color: #2456c4; background: #eef4ff; color: #173f91; }
.presets span { color: #78869a; font-size: 9px; }
.custom { display: grid; grid-template-columns: 1fr 150px 190px; gap: 14px; align-items: end; padding-top: 13px; border-top: 1px solid #e5eaf1; }
.custom label, .result { display: flex; flex-direction: column; gap: 6px; }
.custom label > span, .result span { color: #64748b; font-size: 9px; font-weight: 800; text-transform: uppercase; }
.custom input[type='range'] { width: 100%; accent-color: #2456c4; }
.number div { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 7px; overflow: hidden; }
.number input { width: 100%; min-height: 38px; padding: 0 9px; border: 0; outline: 0; }
.number b { padding-right: 10px; font-size: 11px; }
.result strong { min-height: 40px; display: flex; align-items: center; font-size: 13px; }
.canvas { width: min-content; max-width: 100%; margin: 0 auto; padding: 16px; background: #fff; box-shadow: 0 20px 60px rgb(6 24 56 / 14%); }
.state { width: min(100%, 720px); margin: 60px auto; padding: 30px; border-radius: 10px; background: #fff; text-align: center; }
.error { color: #a62121; }
@media (max-width: 760px) { .toolbar, .custom { grid-template-columns: 1fr; } .presets { grid-template-columns: 1fr 1fr; } .canvas { width: 100%; overflow-x: auto; } }
@media print {
  @page { size: A4 portrait; margin: 10mm; }
  .print-page { min-height: 0; padding: 0; background: #fff; }
  .no-print { display: none !important; }
  .canvas { width: auto; max-width: none; margin: 0; padding: 0; box-shadow: none; }
}
</style>
