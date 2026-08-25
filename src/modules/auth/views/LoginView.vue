<script setup lang="ts">
import LoginAccessForm from '../components/LoginAccessForm.vue'
import LoginBrandPanel from '../components/LoginBrandPanel.vue'
</script>

<template>
  <main class="login-page">
    <LoginBrandPanel />
    <LoginAccessForm />
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  background: var(--sgl-surface, #ffffff);
  color: var(--sgl-text, #1a1a2e);
}

@media (max-width: 1100px) {
  .login-page {
    grid-template-columns: 46% 54%;
  }
}

@media (max-width: 840px) {
  .login-page {
    grid-template-columns: 1fr;
  }
}
</style>
