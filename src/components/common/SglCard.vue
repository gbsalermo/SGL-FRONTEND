<script setup lang="ts">
type SglCardVariant = 'content' | 'interactive' | 'kpi'

withDefaults(defineProps<{
  variant?: SglCardVariant
}>(), {
  variant: 'content',
})
</script>

<template>
  <v-card
    class="sgl-card"
    :class="{
      'sgl-card--interactive': variant === 'interactive',
      'sgl-card--kpi': variant === 'kpi',
    }"
    variant="outlined"
    elevation="0"
  >
    <slot />
  </v-card>
</template>

<style scoped>
.sgl-card.v-card {
  border-color: var(--sgl-border);
  border-radius: var(--sgl-radius-surface);
  box-shadow: none;
}
</style>
