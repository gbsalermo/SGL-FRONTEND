<script setup lang="ts">
type NativeButtonType = 'button' | 'submit' | 'reset'

withDefaults(defineProps<{
  ariaLabel: string
  title?: string
  type?: NativeButtonType
  disabled?: boolean
}>(), {
  title: '',
  type: 'button',
  disabled: false,
})
</script>

<template>
  <v-btn
    class="sgl-icon-button"
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :title="title || ariaLabel"
    icon
    elevation="0"
  >
    <slot />
  </v-btn>
</template>

<style scoped>
.sgl-icon-button.v-btn {
  border-radius: var(--sgl-radius-control);
  box-shadow: none;
}
</style>
