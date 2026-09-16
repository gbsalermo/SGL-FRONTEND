<script setup lang="ts">
const model = defineModel<unknown>()

withDefaults(defineProps<{
  items: readonly unknown[]
  label?: string
  placeholder?: string
  itemTitle?: string
  itemValue?: string
  disabled?: boolean
  clearable?: boolean
}>(), {
  label: '',
  placeholder: '',
  itemTitle: 'title',
  itemValue: 'value',
  disabled: false,
  clearable: false,
})
</script>

<template>
  <v-select
    v-model="model"
    class="sgl-select"
    :items="items"
    :label="label || undefined"
    :placeholder="placeholder || undefined"
    :item-title="itemTitle"
    :item-value="itemValue"
    :disabled="disabled"
    :clearable="clearable"
    variant="outlined"
    density="compact"
    hide-details="auto"
  />
</template>

<style scoped>
.sgl-select :deep(.v-field) {
  min-height: var(--sgl-control-height);
  border-radius: var(--sgl-radius-control);
  background: var(--sgl-surface);
  color: var(--sgl-text);
  font-size: var(--sgl-font-body);
}

.sgl-select :deep(.v-field__outline) {
  color: var(--sgl-border-strong);
}

.sgl-select :deep(.v-field--focused .v-field__outline) {
  color: var(--sgl-primary);
}
</style>
