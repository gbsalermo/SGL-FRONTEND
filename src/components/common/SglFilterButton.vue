<script setup lang="ts">
withDefaults(defineProps<{
  active?: boolean
  count?: number
  disabled?: boolean
  ariaLabel?: string
}>(), {
  active: false,
  count: 0,
  disabled: false,
  ariaLabel: 'Abrir filtros',
})
</script>

<template>
  <v-btn
    class="sgl-filter-button"
    :class="{ 'is-active': active }"
    :disabled="disabled"
    :aria-pressed="active"
    :aria-label="ariaLabel"
    type="button"
    elevation="0"
  >
    <svg
      class="sgl-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M4 5h16l-6.5 7.2v5.1L10.5 19v-6.8L4 5Z" />
    </svg>
    <span>Filtros</span>
    <span v-if="count > 0" class="sgl-filter-count" aria-hidden="true">{{ count }}</span>
  </v-btn>
</template>

<style scoped>
.sgl-filter-button.v-btn {
  text-transform: none;
  letter-spacing: normal;
  box-shadow: none;
}

.sgl-filter-button :deep(.v-btn__content) {
  gap: var(--sgl-space-2);
}
</style>
