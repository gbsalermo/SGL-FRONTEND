<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useSessionStore } from '@/stores/session'

const route = useRoute()
const session = useSessionStore()

const visivel = computed(() => Boolean(session.usuario && route.path !== '/login'))

const unidade = computed(() => {
  const usuario = session.usuario
  if (!usuario?.unidadeNome) return 'Unidade não identificada'
  return usuario.unidadeSigla
    ? `${usuario.unidadeSigla} — ${usuario.unidadeNome}`
    : usuario.unidadeNome
})
</script>

<template>
  <div v-if="visivel" class="sgl-unidade-context" aria-label="Unidade atual do sistema">
    <span>Unidade:</span>
    <strong>{{ unidade }}</strong>
  </div>
</template>

<style scoped>
.sgl-unidade-context {
  position: fixed;
  top: 222px;
  left: 26px;
  z-index: 31;
  width: 210px;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
  color: #fff;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.35;
  pointer-events: none;
}

.sgl-unidade-context span,
.sgl-unidade-context strong {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.sgl-unidade-context strong {
  overflow-wrap: anywhere;
}

:global(.gestao-shell--collapsed) + .sgl-unidade-context {
  display: none;
}

@media (max-width: 900px) {
  .sgl-unidade-context {
    position: static;
    width: auto;
    margin: 8px 16px;
    padding: 8px 10px;
    border-radius: 6px;
    background: #0b1b3a;
  }
}

@media print {
  .sgl-unidade-context { display: none !important; }
}
</style>
