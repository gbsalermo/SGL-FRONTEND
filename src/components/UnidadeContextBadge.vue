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
  <Teleport v-if="visivel" to=".gestao-topbar">
    <div class="sgl-unidade-context" aria-label="Unidade atual do sistema">
      {{ unidade }}
    </div>
  </Teleport>
</template>

<style scoped>
.sgl-unidade-context {
  order: -90;
  min-width: 0;
  display: flex;
  align-items: center;
  align-self: stretch;
  margin-left: 12px;
  margin-right: auto;
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

@media (max-width: 900px) {
  .sgl-unidade-context {
    margin-left: 8px;
    font-size: 14px;
    max-width: 45vw;
  }
}

@media print {
  .sgl-unidade-context {
    display: none !important;
  }
}
</style>
