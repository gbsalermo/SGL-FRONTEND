<script setup lang="ts">
type InputType = 'text' | 'search' | 'email' | 'number' | 'date' | 'password'

const model = defineModel<string | number | null>()

withDefaults(defineProps<{
  label?: string
  placeholder?: string
  type?: InputType
  disabled?: boolean
  clearable?: boolean
}>(), {
  label: '',
  placeholder: '',
  type: 'text',
  disabled: false,
  clearable: false,
})
</script>

<template>
  <v-text-field
    v-model="model"
    class="sgl-text-field"
    :label="label || undefined"
    :placeholder="placeholder || undefined"
    :type="type"
    :disabled="disabled"
    :clearable="clearable"
    variant="outlined"
    density="compact"
    hide-details="auto"
  />
</template>

<style scoped>
.sgl-text-field :deep(.v-field) {
  min-height: var(--sgl-control-height);
  border-radius: var(--sgl-radius-control);
  background: var(--sgl-surface);
  color: var(--sgl-text);
  font-size: var(--sgl-font-body);
}

.sgl-text-field :deep(.v-field__outline) {
  color: var(--sgl-border-strong);
}

.sgl-text-field :deep(.v-field--focused .v-field__outline) {
  color: var(--sgl-primary);
}
</style>
