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
    ? `${usuario.unidadeSigla} - ${usuario.unidadeNome}`
    : usuario.unidadeNome
})
</script>

<template>
  <div v-if="visivel" class="sgl-unidade-context" aria-label="Unidade atual do sistema">
    <strong>{{ unidade }}</strong>
  </div>
</template>

<style scoped>
.sgl-unidade-context {
  position: fixed;
  top: 0;
  left: 82px;
  z-index: 45;
  height: 60px;
  display: flex;
  align-items: center;
  max-width: min(620px, calc(100vw - 320px));
  padding-top: 1px;
  color: #fff;
  font-family: inherit;
  line-height: 1;
  pointer-events: none;
}

.sgl-unidade-context strong {
  overflow: hidden;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 800px) {
  .sgl-unidade-context {
    left: 72px;
    max-width: calc(100vw - 220px);
  }

  .sgl-unidade-context strong {
    font-size: 14px;
  }
}

@media print {
  .sgl-unidade-context {
    display: none !important;
  }
}
</style>
