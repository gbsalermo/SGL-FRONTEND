<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import { listaAcesso, type ComAcesso } from '@/modules/auth/papeis'

const props = defineProps<{ usuario: ComAcesso | null | undefined }>()

const itens = computed(() => listaAcesso(props.usuario))
const temMais = computed(() => itens.value.length > 1)
const aberto = ref(false)
const tooltipId = useId()
const gatilho = ref<HTMLElement | null>(null)
// Fixed positioning lets the balloon escape containers that clip overflow, such as the sidebar card.
const posicao = ref({ top: 0, left: 0 })

function abrir() {
  if (!temMais.value) return
  const rect = gatilho.value?.getBoundingClientRect()
  if (rect) posicao.value = { top: rect.bottom + 6, left: rect.left }
  aberto.value = true
}

function fechar() {
  aberto.value = false
}
</script>

<template>
  <span class="papeis-badge" @mouseenter="abrir" @mouseleave="fechar">
    <button
      v-if="temMais"
      ref="gatilho"
      class="papeis-badge__trigger"
      type="button"
      :aria-describedby="aberto ? tooltipId : undefined"
      @focusin="abrir"
      @focusout="fechar"
      @keydown.esc="fechar"
    >
      {{ itens[0] }} <span class="papeis-badge__more">+{{ itens.length - 1 }}</span>
    </button>
    <template v-else>{{ itens[0] ?? '—' }}</template>
    <span
      v-if="aberto"
      :id="tooltipId"
      class="papeis-badge__tooltip"
      role="tooltip"
      :style="{ top: `${posicao.top}px`, left: `${posicao.left}px` }"
    >
      <ul>
        <li v-for="item in itens" :key="item">{{ item }}</li>
      </ul>
    </span>
  </span>
</template>

<style scoped>
.papeis-badge { display: inline; }
.papeis-badge__trigger {
  padding: 0; border: 0; background: none; color: inherit; font: inherit; cursor: help;
  text-decoration: underline dotted; text-underline-offset: 2px;
}
.papeis-badge__trigger:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; border-radius: 2px; }
.papeis-badge__more { font-weight: 800; }
.papeis-badge__tooltip {
  position: fixed; z-index: 120; max-width: 260px; padding: 8px 10px;
  border: 1px solid var(--sgl-border, #d6deea); border-radius: 8px;
  background: var(--sgl-surface-elevated, #fff); color: var(--sgl-text, #1a1a2e);
  box-shadow: 0 12px 28px rgb(4 13 31 / 22%);
  font-size: 12px; font-weight: 500; line-height: 1.4; text-align: left; white-space: normal;
}
.papeis-badge__tooltip ul { margin: 0; padding: 0 0 0 16px; }
.papeis-badge__tooltip li + li { margin-top: 2px; }
</style>
