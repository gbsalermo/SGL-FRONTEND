<script setup lang="ts">
type SglButtonVariant = 'primary' | 'secondary' | 'danger'
type NativeButtonType = 'button' | 'submit' | 'reset'

withDefaults(defineProps<{
  variant?: SglButtonVariant
  type?: NativeButtonType
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
  loading: false,
})
</script>

<template>
  <v-btn
    class="sgl-button"
    :class="`sgl-button--${variant}`"
    :type="type"
    :disabled="disabled"
    :loading="loading"
    elevation="0"
  >
    <slot name="prepend" />
    <slot />
  </v-btn>
</template>

<style scoped>
.sgl-button.v-btn {
  min-width: 0;
  text-transform: none;
  letter-spacing: normal;
  box-shadow: none;
}

.sgl-button :deep(.v-btn__content) {
  gap: var(--sgl-space-2);
}
</style>
