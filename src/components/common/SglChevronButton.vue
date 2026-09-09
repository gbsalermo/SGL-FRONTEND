<script setup lang="ts">
import SglIconButton from './SglIconButton.vue'

type ChevronDirection = 'up' | 'down' | 'left' | 'right'

withDefaults(defineProps<{
  direction?: ChevronDirection
  ariaLabel: string
  title?: string
  disabled?: boolean
}>(), {
  direction: 'right',
  title: '',
  disabled: false,
})
</script>

<template>
  <SglIconButton
    :ariaLabel="ariaLabel"
    :title="title || ariaLabel"
    :disabled="disabled"
  >
    <svg
      class="sgl-chevron"
      :class="`sgl-chevron--${direction}`"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m8 10 4 4 4-4" />
    </svg>
  </SglIconButton>
</template>

<style scoped>
.sgl-chevron {
  transform-origin: center;
}

.sgl-chevron--down { transform: rotate(0deg); }
.sgl-chevron--up { transform: rotate(180deg); }
.sgl-chevron--right { transform: rotate(-90deg); }
.sgl-chevron--left { transform: rotate(90deg); }
</style>
