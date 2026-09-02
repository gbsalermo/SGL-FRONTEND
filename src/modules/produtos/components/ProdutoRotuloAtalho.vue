<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { estoqueService } from '@/modules/estoque/services/estoqueService'

const route = useRoute()
const router = useRouter()
const produtoId = ref('')
const produtoNome = ref('')
const carregando = ref(false)

async function sincronizar() {
  produtoId.value = ''
  produtoNome.value = ''
  if (route.name !== 'gestao-estoque-detalhe') return

  const estoqueId = String(route.params.id ?? '')
  if (!estoqueId) return

  carregando.value = true
  try {
    const estoque = await estoqueService.buscarPorId(estoqueId)
    produtoId.value = estoque.produtoId
    produtoNome.value = estoque.produtoNome
  } catch {
    produtoId.value = ''
  } finally {
    carregando.value = false
  }
}

function abrirRotulo() {
  if (produtoId.value) router.push(`/produtos/${produtoId.value}/rotulo`)
}

watch(() => route.fullPath, sincronizar, { immediate: true })
</script>

<template>
  <button
    v-if="route.name === 'gestao-estoque-detalhe' && (produtoId || carregando)"
    class="produto-label-shortcut"
    type="button"
    :disabled="carregando || !produtoId"
    :title="produtoNome ? `Gerar rótulo para ${produtoNome}` : 'Carregando produto'"
    @click="abrirRotulo"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h10l6 6-9 9-7-7zM8 9h.01" /></svg>
    <span>{{ carregando ? 'Carregando...' : 'Rotular produto' }}</span>
  </button>
</template>

<style scoped>
.produto-label-shortcut {
  position: fixed;
  right: 30px;
  bottom: 28px;
  z-index: 45;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 0 16px;
  border: 1px solid #173d7a;
  border-radius: 999px;
  background: #173d7a;
  color: #fff;
  box-shadow: 0 10px 30px rgb(12 43 91 / 22%);
  font: inherit;
  font-size: 11px;
  font-weight: 850;
  cursor: pointer;
}
.produto-label-shortcut:hover { background: #0f315f; }
.produto-label-shortcut:disabled { opacity: .55; cursor: default; }
.produto-label-shortcut svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
@media (max-width: 700px) { .produto-label-shortcut { right: 16px; bottom: 16px; } }
@media print { .produto-label-shortcut { display: none !important; } }
</style>
