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
  /*
   * O login possui identidade visual própria e é sempre claro no painel de acesso.
   * Esses tokens locais impedem qualquer preferência dark persistida de vazar para cá.
   */
  --sgl-primary: #1a4da1;
  --sgl-primary-dark: #0d2b5e;
  --sgl-primary-light: #2d6bc4;
  --sgl-background: #f5f7fa;
  --sgl-surface: #ffffff;
  --sgl-surface-elevated: #ffffff;
  --sgl-text: #1a1a2e;
  --sgl-text-muted: #64748b;
  --sgl-border: #e2e8f0;

  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  background: #ffffff;
  color: #1a1a2e;
  color-scheme: light;
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
