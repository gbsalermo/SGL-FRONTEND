<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const animationHost = ref<HTMLElement | null>(null)

onMounted(() => {
  const scriptId = 'dotlottie-player-script'

  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script')
    script.id = scriptId
    script.type = 'module'
    script.src = 'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs'
    document.head.appendChild(script)
  }

  if (!animationHost.value) return

  const player = document.createElement('dotlottie-player')
  player.setAttribute('src', '/animations/folder-not-found.lottie')
  player.setAttribute('background', 'transparent')
  player.setAttribute('speed', '1')
  player.setAttribute('loop', '')
  player.setAttribute('autoplay', '')
  player.setAttribute('aria-label', 'Animação de página não encontrada')
  player.style.width = '100%'
  player.style.height = '100%'

  animationHost.value.appendChild(player)
})

function voltarAoInicio() {
  router.push('/')
}
</script>

<template>
  <main class="not-found-page">
    <section class="not-found-content" aria-labelledby="not-found-title">
      <div ref="animationHost" class="not-found-animation" aria-hidden="true" />

      <div class="not-found-copy">
        <p class="not-found-code">ERRO 404</p>
        <h1 id="not-found-title">Página não encontrada</h1>
        <p class="not-found-description">
          O endereço que você tentou acessar não existe ou não está mais disponível.
        </p>

        <v-btn color="primary" size="large" elevation="0" @click="voltarAoInicio">
          Voltar ao início
        </v-btn>
      </div>
    </section>
  </main>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: clamp(24px, 5vw, 56px);
  background: var(--sgl-background);
  color: var(--sgl-text);
}

.not-found-content {
  width: min(100%, 760px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.not-found-animation {
  width: min(100%, 520px);
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  margin-bottom: -20px;
}

.not-found-copy {
  max-width: 560px;
}

.not-found-code {
  margin: 0 0 6px;
  color: var(--sgl-primary);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

h1 {
  margin: 0;
  font-size: clamp(1.9rem, 5vw, 2.8rem);
  line-height: 1.1;
}

.not-found-description {
  margin: 14px auto 24px;
  color: var(--sgl-text-muted);
  font-size: 1rem;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .not-found-page {
    padding: 20px;
  }

  .not-found-animation {
    width: min(100%, 380px);
    margin-bottom: -8px;
  }
}
</style>
