<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ResiduoRotuloModelo from '@/modules/residuos/components/rotulo/ResiduoRotuloModelo.vue'
import { residuoService } from '@/modules/residuos/services/residuoService'
import type { ApiErrorResponse, RotuloResiduoResponse } from '@/modules/residuos/types/residuo'

const route = useRoute()
const router = useRouter()
const dados = ref<RotuloResiduoResponse | null>(null)
const carregando = ref(true)
const erro = ref('')
const larguraRotuloMm = ref(180)

const ALTURA_BASE_MM = 108
const LARGURA_BASE_MM = 180
const LARGURA_MINIMA_MM = 70
const LARGURA_MAXIMA_MM = 190

const tamanhos = [
  { nome: 'Pequeno', largura: 90 },
  { nome: 'Médio', largura: 135 },
  { nome: 'Grande', largura: 180 },
  { nome: 'Máx. A4', largura: 190 },
]

const alturaRotuloMm = computed(() =>
  Math.round((larguraRotuloMm.value / LARGURA_BASE_MM) * ALTURA_BASE_MM * 10) / 10,
)

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? 'Não foi possível carregar o rótulo.'
  }
  return error instanceof Error ? error.message : 'Não foi possível carregar o rótulo.'
}

async function carregar() {
  const id = String(route.params.id ?? '')
  if (!id) {
    erro.value = 'Resíduo não informado.'
    carregando.value = false
    return
  }

  carregando.value = true
  erro.value = ''
  try {
    dados.value = await residuoService.buscarDadosRotulo(id)
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregando.value = false
  }
}

function aplicarTamanho(largura: number) {
  larguraRotuloMm.value = largura
}

function normalizarLargura() {
  if (!Number.isFinite(larguraRotuloMm.value)) {
    larguraRotuloMm.value = LARGURA_BASE_MM
    return
  }
  larguraRotuloMm.value = Math.min(
    LARGURA_MAXIMA_MM,
    Math.max(LARGURA_MINIMA_MM, Math.round(larguraRotuloMm.value)),
  )
}

function imprimir() {
  normalizarLargura()
  window.print()
}

function voltar() {
  router.push('/residuos')
}

onMounted(carregar)
</script>

<template>
  <main class="rotulo-page">
    <div class="rotulo-toolbar no-print">
      <button type="button" class="btn btn--ghost" @click="voltar">← Voltar para resíduos</button>
      <div>
        <strong>Pré-visualização do rótulo</strong>
        <span>Confira os dados e os pictogramas antes da impressão.</span>
      </div>
      <button type="button" class="btn btn--print" :disabled="!dados" @click="imprimir">Imprimir rótulo</button>
    </div>

    <section class="size-control no-print" aria-label="Controle do tamanho do rótulo">
      <div class="size-control__intro">
        <strong>Tamanho do rótulo</strong>
        <span>A folha permanece A4. Apenas o conteúdo impresso muda de tamanho.</span>
      </div>

      <div class="size-presets">
        <button
          v-for="tamanho in tamanhos"
          :key="tamanho.nome"
          type="button"
          :class="{ active: larguraRotuloMm === tamanho.largura }"
          @click="aplicarTamanho(tamanho.largura)"
        >
          <strong>{{ tamanho.nome }}</strong>
          <small>{{ tamanho.largura }} × {{ Math.round((tamanho.largura / LARGURA_BASE_MM) * ALTURA_BASE_MM) }} mm</small>
        </button>
      </div>

      <div class="custom-size">
        <label>
          <span>Largura personalizada</span>
          <input
            v-model.number="larguraRotuloMm"
            type="range"
            :min="LARGURA_MINIMA_MM"
            :max="LARGURA_MAXIMA_MM"
            step="5"
          />
        </label>

        <label class="width-input">
          <span>Largura</span>
          <div>
            <input
              v-model.number="larguraRotuloMm"
              type="number"
              :min="LARGURA_MINIMA_MM"
              :max="LARGURA_MAXIMA_MM"
              step="1"
              @change="normalizarLargura"
            />
            <b>mm</b>
          </div>
        </label>

        <div class="current-size">
          <span>Tamanho final</span>
          <strong>{{ larguraRotuloMm }} × {{ alturaRotuloMm }} mm</strong>
        </div>
      </div>
    </section>

    <section v-if="carregando" class="rotulo-state">Carregando rótulo...</section>
    <section v-else-if="erro" class="rotulo-state rotulo-state--error">
      <strong>Não foi possível abrir o rótulo.</strong>
      <p>{{ erro }}</p>
      <button type="button" class="btn btn--ghost" @click="voltar">Voltar</button>
    </section>

    <div v-else-if="dados" class="rotulo-canvas">
      <ResiduoRotuloModelo :dados="dados" :largura-mm="larguraRotuloMm" />
    </div>
  </main>
</template>

<style scoped>
.rotulo-page {
  min-height: 100vh;
  padding: 28px;
  background: #edf1f6;
  color: #15243b;
}

.rotulo-toolbar,
.size-control {
  width: min(100%, 1120px);
  margin-inline: auto;
  border: 1px solid #d9e1eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 30px rgb(13 43 94 / 7%);
}

.rotulo-toolbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  margin-bottom: 14px;
  padding: 16px 18px;
}

.rotulo-toolbar > div,
.size-control__intro { display: flex; flex-direction: column; gap: 3px; }
.rotulo-toolbar strong { font-size: 16px; }
.rotulo-toolbar span,
.size-control__intro span { color: #718096; font-size: 12px; }

.size-control {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 18px;
}

.size-control__intro strong { font-size: 14px; }

.size-presets {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.size-presets button {
  min-height: 54px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 3px;
  padding: 9px 12px;
  border: 1px solid #d5dde8;
  border-radius: 8px;
  background: #fff;
  color: #34445c;
  font: inherit;
  cursor: pointer;
}

.size-presets button:hover { border-color: #9db4da; background: #f8faff; }
.size-presets button.active { border-color: #2456c4; background: #eef4ff; color: #173f91; }
.size-presets strong { font-size: 11px; }
.size-presets small { color: #78869a; font-size: 9px; }

.custom-size {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 150px 190px;
  align-items: end;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid #e5eaf1;
}

.custom-size label,
.current-size {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.custom-size label > span,
.current-size span {
  color: #64748b;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.custom-size input[type='range'] {
  width: 100%;
  accent-color: #2456c4;
}

.width-input > div {
  height: 38px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  background: #fff;
}

.width-input input {
  width: 100%;
  height: 100%;
  padding: 0 10px;
  border: 0;
  outline: 0;
  color: #26364e;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
}

.width-input b {
  padding-right: 10px;
  color: #718096;
  font-size: 10px;
}

.current-size {
  min-height: 38px;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 7px;
  background: #f4f7fb;
}

.current-size strong { color: #173f91; font-size: 12px; }

.btn {
  min-height: 42px;
  padding: 0 15px;
  border-radius: 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.btn--ghost { border: 1px solid #cbd5e1; background: #fff; color: #34445c; }
.btn--print { border: 0; background: #174da3; color: #fff; }
.btn:disabled { opacity: .5; cursor: default; }

.rotulo-canvas {
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
  padding: 18px;
  overflow-x: auto;
  background: #fff;
  box-shadow: 0 20px 60px rgb(6 24 56 / 14%);
}

.rotulo-state {
  width: min(100%, 720px);
  margin: 80px auto;
  padding: 36px;
  border-radius: 12px;
  background: #fff;
  text-align: center;
}
.rotulo-state--error { border: 1px solid #efc5c5; }
.rotulo-state p { color: #64748b; }

@media (max-width: 760px) {
  .rotulo-page { padding: 12px; }
  .rotulo-toolbar { grid-template-columns: 1fr; }
  .size-presets { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .custom-size { grid-template-columns: 1fr; }
  .rotulo-canvas { width: 100%; padding: 8px; }
}

@media print {
  .rotulo-page {
    min-height: 0;
    padding: 0;
    background: #fff;
  }

  .no-print { display: none !important; }

  .rotulo-canvas {
    width: 190mm;
    max-width: 190mm;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin: 0;
    padding: 0;
    overflow: visible;
    background: #fff;
    box-shadow: none;
  }
}
</style>

<style>
@page {
  size: A4 portrait;
  margin: 10mm;
}

@media print {
  html,
  body,
  #app {
    width: 100%;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }
}
</style>
