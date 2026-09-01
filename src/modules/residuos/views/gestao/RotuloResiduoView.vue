<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ResiduoRotuloModelo from '@/modules/residuos/components/rotulo/ResiduoRotuloModelo.vue'
import { residuoService } from '@/modules/residuos/services/residuoService'
import type { ApiErrorResponse, RotuloResiduoResponse } from '@/modules/residuos/types/residuo'

const route = useRoute()
const router = useRouter()
const dados = ref<RotuloResiduoResponse | null>(null)
const carregando = ref(true)
const erro = ref('')

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

function imprimir() {
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

    <section v-if="carregando" class="rotulo-state">Carregando rótulo...</section>
    <section v-else-if="erro" class="rotulo-state rotulo-state--error">
      <strong>Não foi possível abrir o rótulo.</strong>
      <p>{{ erro }}</p>
      <button type="button" class="btn btn--ghost" @click="voltar">Voltar</button>
    </section>

    <div v-else-if="dados" class="rotulo-canvas">
      <ResiduoRotuloModelo :dados="dados" />
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

.rotulo-toolbar {
  width: min(100%, 1120px);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  margin: 0 auto 24px;
  padding: 16px 18px;
  border: 1px solid #d9e1eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 30px rgb(13 43 94 / 7%);
}

.rotulo-toolbar > div { display: flex; flex-direction: column; gap: 3px; }
.rotulo-toolbar strong { font-size: 16px; }
.rotulo-toolbar span { color: #718096; font-size: 12px; }

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
  width: min-content;
  max-width: 100%;
  margin: 0 auto;
  padding: 18px;
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
  .rotulo-canvas { width: 100%; padding: 8px; overflow-x: auto; }
}

@media print {
  .rotulo-page { min-height: 0; padding: 0; background: #fff; }
  .no-print { display: none !important; }
  .rotulo-canvas { width: auto; max-width: none; margin: 0; padding: 0; box-shadow: none; }
}
</style>
