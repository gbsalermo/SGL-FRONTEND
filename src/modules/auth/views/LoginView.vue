<template>
  <main class="bootstrap-ready">
    <section>
      <p class="bootstrap-ready__eyebrow">SGL Frontend</p>
      <h1>Bootstrap técnico ativo</h1>
      <p>A próxima implementação real será a tela de login aprovada no planejamento.</p>
    </section>
  </main>
</template>

<style scoped>
.bootstrap-ready {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--sgl-background, #f5f7fa);
  color: var(--sgl-text, #1a1a2e);
}

.bootstrap-ready section {
  max-width: 560px;
}

.bootstrap-ready__eyebrow {
  color: var(--sgl-primary, #1a4da1);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>
