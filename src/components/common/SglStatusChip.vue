<script setup lang="ts">
type SglStatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'error'

withDefaults(defineProps<{
  tone?: SglStatusTone
}>(), {
  tone: 'neutral',
})
</script>

<template>
  <v-chip
    class="sgl-status"
    :class="tone === 'neutral' ? undefined : `sgl-status--${tone}`"
    size="small"
    label
    variant="flat"
  >
    <slot />
  </v-chip>
</template>

<style scoped>
.sgl-status.v-chip {
  border-radius: var(--sgl-radius-pill);
  background: var(--sgl-neutral-soft);
  letter-spacing: normal;
}
</style>
