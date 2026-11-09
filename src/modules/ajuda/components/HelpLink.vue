<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ taskId: string | null }>()

// Plain anchor (not router-link): it opens a new tab so the user keeps what they were filling in.
const href = computed(() => (props.taskId ? `/ajuda/${props.taskId}` : '/ajuda'))
</script>

<template>
  <a class="help-link" :href="href" target="_blank" rel="noopener noreferrer" title="Ajuda desta tela">
    <span class="help-link__icon" aria-hidden="true">?</span>
    <span>Ajuda</span>
  </a>
</template>

<style scoped>
/* currentColor lets the pill fit both the dark top bars and light pages. */
.help-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  border-radius: 999px;
  color: inherit;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.help-link:hover { background: color-mix(in srgb, currentColor 10%, transparent); }

.help-link__icon {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--sgl-primary, #2d6bc4);
  color: #fff;
  font-size: 11px;
  line-height: 1;
}
</style>
