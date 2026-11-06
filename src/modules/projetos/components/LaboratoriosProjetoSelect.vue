<script setup lang="ts">
import { computed } from 'vue'
import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'

const props = defineProps<{
  modelValue: string[]
  /** Laboratórios ativos da Unidade. */
  opcoes: LaboratorioResumo[]
  /** Laboratórios já vinculados ao projeto; os fora de `opcoes` estão inativos e podem permanecer. */
  vinculados: LaboratorioResumo[]
}>()

const emit = defineEmits<{ 'update:modelValue': [ids: string[]] }>()

interface Item extends LaboratorioResumo { inativo: boolean }

// A API só aceita incluir laboratório ativo, mas deixa manter um já vinculado que foi inativado.
const itens = computed<Item[]>(() => {
  const ativos = new Set(props.opcoes.map((lab) => lab.id))
  const inativos = props.vinculados.filter((lab) => !ativos.has(lab.id))
  return [
    ...props.opcoes.map((lab) => ({ ...lab, inativo: false })),
    ...inativos.map((lab) => ({ ...lab, inativo: true })),
  ].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
})

function alternar(id: string, marcado: boolean) {
  const restantes = props.modelValue.filter((atual) => atual !== id)
  emit('update:modelValue', marcado ? [...restantes, id] : restantes)
}
</script>

<template>
  <fieldset class="labs-select">
    <legend>Laboratórios *</legend>
    <label v-for="lab in itens" :key="lab.id" class="labs-select__item">
      <input
        type="checkbox"
        :checked="modelValue.includes(lab.id)"
        @change="alternar(lab.id, ($event.target as HTMLInputElement).checked)"
      />
      <span>{{ lab.nome }}{{ lab.inativo ? ' (inativo)' : '' }}</span>
    </label>
    <small v-if="modelValue.length === 0" class="labs-select__erro" role="alert">Selecione ao menos um laboratório.</small>
  </fieldset>
</template>

<style scoped>
.labs-select { display: grid; gap: 6px; margin: 0; padding: 8px 10px; border: 1px solid #ccd6e2; border-radius: 6px; min-width: 0; }
.labs-select legend { padding: 0 4px; color: #405169; font-size: 9px; font-weight: 800; }
.labs-select__item { display: flex; align-items: center; gap: 6px; color: #26364e; font-size: 10.5px; }
.labs-select__erro { color: #b42318; font-size: 10px; }
</style>
