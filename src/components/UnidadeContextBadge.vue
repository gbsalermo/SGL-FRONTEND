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
  <Teleport v-if="visivel" to=".gestao-tools">
    <div class="sgl-unidade-context" aria-label="Unidade atual do sistema">
      {{ unidade }}
    </div>
  </Teleport>
</template>

<style scoped>
.sgl-unidade-context {
  width: 100%;
  margin-top: 10px;
  padding: 8px 4px 2px;
  overflow: hidden;
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.gestao-shell--collapsed) .sgl-unidade-context {
  display: none;
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
