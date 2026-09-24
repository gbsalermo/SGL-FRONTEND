<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const alvoCadastrosDisponivel = ref(false)
let observer: MutationObserver | null = null

function atualizarAlvos() {
  alvoCadastrosDisponivel.value = route.path === '/administracao/cadastros'
    && Boolean(document.querySelector('.tabs-card'))

}

watch(() => route.path, async () => {
  await nextTick()
  atualizarAlvos()
})

onMounted(async () => {
  await nextTick()
  atualizarAlvos()
  observer = new MutationObserver(atualizarAlvos)
  observer.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <Teleport v-if="alvoCadastrosDisponivel" to=".tabs-card">
    <button
      class="residuo-modelo-admin-tab residuo-modelo-admin-tab--active"
      type="button"
      title="Administrar modelos de resíduos"
      @click="router.push('/administracao/cadastros/modelos-residuo')"
    >
      <span class="residuo-modelo-admin-tab__topline">
        <strong>Resíduos</strong>
      </span>
      <span class="residuo-modelo-admin-tab__description">
        Modelos completos com origem, recipiente, riscos, composição e observações.
      </span>
    </button>
  </Teleport>

</template>

<style>
.residuo-modelo-admin-tab {
  width: 100%;
  min-height: 66px;
  display: grid;
  gap: 3px;
  padding: 11px 12px;
  border: 1px solid #e0e6ef;
  border-radius: 7px;
  background: #fff;
  color: #2b3d59;
  font: inherit;
  text-align: left;
}

.residuo-modelo-admin-tab--active {
  cursor: pointer;
  transition: border-color .16s ease, background .16s ease;
}

.residuo-modelo-admin-tab--active:hover {
  border-color: #4b7fe4;
  background: #f4f8ff;
}

.residuo-modelo-admin-tab__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.residuo-modelo-admin-tab__topline strong {
  color: #41516a;
  font-size: 12px;
}

.residuo-modelo-admin-tab__description {
  color: #7a879a;
  font-size: 9px;
  line-height: 1.35;
}

</style>
