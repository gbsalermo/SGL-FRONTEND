<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'

interface UnidadeOpcao {
  id: string
  sigla: string
  nome: string
}

const props = withDefaults(defineProps<{
  // Screens load their data on mount, so a full reload is the simplest way to re-scope all of them.
  recarregar?: () => void
}>(), {
  recarregar: () => window.location.reload(),
})

const session = useSessionStore()
const unidades = ref<UnidadeOpcao[]>([])
const erro = ref(false)

const selecionada = computed(() => session.unidadeOperacaoId ?? session.usuario?.unidadeId ?? '')

onMounted(async () => {
  if (!session.administradorGeral) return
  try {
    const { data } = await http.get<UnidadeOpcao[]>('/v1/unidades')
    unidades.value = [...data].sort((a, b) => a.sigla.localeCompare(b.sigla, 'pt-BR'))
  } catch {
    erro.value = true
  }
})

function trocar(event: Event) {
  const id = (event.target as HTMLSelectElement).value
  if (id === selecionada.value) return
  const unidade = unidades.value.find((u) => u.id === id)
  // Back to the user's own Unidade means no override at all: the backend derives it from the session.
  if (id === session.usuario?.unidadeId) session.selecionarUnidade(null)
  else session.selecionarUnidade(id, unidade?.sigla ?? null)
  props.recarregar()
}
</script>

<template>
  <label v-if="session.administradorGeral && !erro" class="unidade-selector">
    <span class="unidade-selector__rotulo">Unidade</span>
    <select :value="selecionada" aria-label="Unidade em operação" @change="trocar">
      <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.sigla }} — {{ u.nome }}</option>
    </select>
  </label>
</template>

<style scoped>
.unidade-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c9d6ec;
  font-size: 12px;
  font-weight: 650;
}

.unidade-selector select {
  max-width: 260px;
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 6px;
  background: rgb(255 255 255 / 6%);
  color: #fff;
  font: inherit;
}

.unidade-selector select option {
  color: #1a1a2e;
}

.unidade-selector select:focus-visible {
  outline: 2px solid #8fb4ff;
  outline-offset: 2px;
}

@media (max-width: 720px) {
  .unidade-selector__rotulo {
    display: none;
  }

  .unidade-selector select {
    max-width: 140px;
  }
}
</style>
