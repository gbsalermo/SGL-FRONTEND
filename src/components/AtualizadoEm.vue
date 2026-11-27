<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ at: Date | null; busy: boolean }>()
const emit = defineEmits<{ refresh: [] }>()

const horario = computed(() =>
  props.at ? props.at.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
)
</script>

<template>
  <div class="atualizado-em" role="status">
    <span v-if="horario" class="atualizado-em__text">Atualizado às {{ horario }}</span>
    <button
      class="atualizado-em__button"
      :class="{ 'atualizado-em__button--spinning': busy }"
      type="button"
      aria-label="Atualizar agora"
      title="Atualizar agora"
      :disabled="busy"
      @click="emit('refresh')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>
    </button>
  </div>
</template>

<style scoped>
.atualizado-em { display: inline-flex; align-items: center; gap: 6px; flex: 0 0 auto; }
.atualizado-em__text { color: var(--sgl-text-muted); font-size: 12px; white-space: nowrap; }
.atualizado-em__button {
  width: 32px; height: 32px; display: grid; place-items: center; padding: 0;
  border: 1px solid var(--sgl-border, #d6deea); border-radius: var(--sgl-radius-control, 7px);
  background: transparent; color: var(--sgl-primary); cursor: pointer;
}
.atualizado-em__button:hover:not(:disabled) { background: rgb(13 43 94 / 6%); }
.atualizado-em__button:disabled { cursor: wait; opacity: .7; }
.atualizado-em__button svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.atualizado-em__button--spinning svg { animation: atualizado-em-spin 900ms linear infinite; }
@keyframes atualizado-em-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .atualizado-em__button--spinning svg { animation: none; } }
</style>
