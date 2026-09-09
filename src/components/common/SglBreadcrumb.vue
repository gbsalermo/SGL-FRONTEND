<script setup lang="ts">
type SglBreadcrumbItem = {
  label: string
  to?: string
}

defineProps<{
  items: SglBreadcrumbItem[]
}>()
</script>

<template>
  <nav class="sgl-breadcrumb" aria-label="Breadcrumb">
    <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
      <router-link v-if="item.to" :to="item.to">{{ item.label }}</router-link>
      <span v-else aria-current="page">{{ item.label }}</span>
      <span v-if="index < items.length - 1" class="sgl-breadcrumb__separator" aria-hidden="true">/</span>
    </template>
  </nav>
</template>

<style scoped>
.sgl-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sgl-space-1);
  margin: 0;
  color: var(--sgl-text-muted);
  font-size: var(--sgl-font-helper);
  line-height: var(--sgl-line-height-body);
}

.sgl-breadcrumb a {
  color: var(--sgl-primary);
  text-decoration: none;
}

.sgl-breadcrumb a:hover {
  text-decoration: underline;
}

.sgl-breadcrumb__separator {
  color: var(--sgl-text-muted);
}
</style>
