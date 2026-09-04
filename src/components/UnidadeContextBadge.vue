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
  top: 0;
  left: 78px;
  z-index: 45;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: min(560px, calc(100vw - 300px));
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  line-height: 1;
  pointer-events: none;
}

.sgl-unidade-context span {
  color: rgba(255, 255, 255, .78);
  font-weight: 500;
}

.sgl-unidade-context strong {
  overflow: hidden;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 800px) {
  .sgl-unidade-context {
    left: 68px;
    max-width: calc(100vw - 210px);
    font-size: 13px;
  }

  .sgl-unidade-context strong {
    font-size: 13px;
  }
}

@media (max-width: 560px) {
  .sgl-unidade-context span {
    display: none;
  }
}

@media print {
  .sgl-unidade-context {
    display: none !important;
  }
}
</style>
