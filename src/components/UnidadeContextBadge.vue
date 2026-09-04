<script setup lang="ts">
import { computed } from 'vue'

import { useSessionStore } from '@/stores/session'

const session = useSessionStore()

const visivel = computed(() => {
  const perfil = session.usuario?.perfil
  return perfil === 'ADMINISTRADOR' || perfil === 'GESTOR'
})

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
    {{ unidade }}
  </div>
</template>

<style scoped>
.sgl-unidade-context {
  position: fixed;
  top: 0;
  left: 344px;
  right: 190px;
  z-index: 25;
  height: 72px;
  display: flex;
  align-items: center;
  overflow: hidden;
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  transition: left 300ms ease;
}

:global(.v-application:has(.gestao-shell--collapsed)) .sgl-unidade-context {
  left: 152px;
}

@media (max-width: 900px) {
  .sgl-unidade-context {
    display: none;
  }
}

@media print {
  .sgl-unidade-context {
    display: none !important;
  }
}
</style>
