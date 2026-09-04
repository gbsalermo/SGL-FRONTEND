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

const secao = computed(() => {
  const path = route.path
  if (path.startsWith('/pedidos')) return 'Pedidos'
  if (path.startsWith('/estoque')) return 'Estoque / Lotes'
  if (path.startsWith('/movimentacoes')) return 'Movimentações'
  if (path.startsWith('/residuos')) return 'Resíduos'
  if (path.startsWith('/projetos')) return 'Projetos'
  if (path.startsWith('/administracao')) return 'Administração'
  if (path.startsWith('/relatorios')) return 'Relatórios'
  if (path.startsWith('/dashboard') || path.startsWith('/inicio')) return 'Dashboard'
  return 'Unidade atual'
})
</script>

<template>
  <div v-if="visivel" class="sgl-unidade-context" aria-label="Unidade atual do sistema">
    <span>{{ secao }}</span>
    <strong>{{ unidade }}</strong>
  </div>
</template>

<style scoped>
.sgl-unidade-context {
  position: fixed;
  top: 86px;
  right: 24px;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  max-width: min(460px, calc(100vw - 32px));
  padding: 8px 12px;
  border: 1px solid rgba(79, 113, 160, .24);
  border-radius: 999px;
  background: rgba(255, 255, 255, .94);
  box-shadow: 0 6px 18px rgba(15, 23, 42, .08);
  backdrop-filter: blur(8px);
  color: #334155;
  pointer-events: none;
}

.sgl-unidade-context span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.sgl-unidade-context strong {
  overflow: hidden;
  color: #173d75;
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(body.sgl-dark-active) .sgl-unidade-context {
  border-color: #2b3e59;
  background: rgba(17, 29, 48, .94);
  box-shadow: 0 8px 22px rgba(0, 0, 0, .22);
}

:global(body.sgl-dark-active) .sgl-unidade-context span { color: #93a6bf; }
:global(body.sgl-dark-active) .sgl-unidade-context strong { color: #dce8ff; }

@media (max-width: 800px) {
  .sgl-unidade-context {
    top: auto;
    right: 12px;
    bottom: 12px;
    left: 12px;
    justify-content: center;
  }
}

@media print {
  .sgl-unidade-context { display: none !important; }
}
</style>
