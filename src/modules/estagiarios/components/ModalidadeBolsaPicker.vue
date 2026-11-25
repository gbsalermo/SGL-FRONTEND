<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

import { estagiarioService } from '@/modules/estagiarios/services/estagiarioService'
import type { ModalidadeBolsaResponse, TipoBolsaEstagiario } from '@/modules/estagiarios/types/estagiario'

const props = defineProps<{
  tipoBase: TipoBolsaEstagiario | ''
  modelValue: string | null
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', valor: string | null): void
}>()

const opcoes = ref<ModalidadeBolsaResponse[]>([])
const carregando = ref(false)
const cadastrando = ref(false)
const mostrandoCadastro = ref(false)
const novoNome = ref('')
const erro = ref('')
const sucesso = ref('')

const disponiveis = computed(() => opcoes.value.filter((item) => item.tipoBase === props.tipoBase))

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || 'Não foi possível registrar a modalidade.'
  }
  return error instanceof Error ? error.message : 'Não foi possível registrar a modalidade.'
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    opcoes.value = await estagiarioService.listarModalidadesBolsaAtivas()
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregando.value = false
  }
}

// Trocar a classificação base invalida a modalidade selecionada anteriormente.
// Não altera o valor inicial recebido pelo formulário ao montar o componente.
watch(() => props.tipoBase, (_novo, antigo) => {
  if (antigo !== undefined) emit('update:modelValue', null)
  erro.value = ''
  sucesso.value = ''
})

onMounted(() => { void carregar() })

async function criar() {
  const nome = novoNome.value.trim()
  if (!props.tipoBase || !nome || cadastrando.value) {
    erro.value = 'Informe o tipo de bolsa e o nome da modalidade.'
    return
  }

  cadastrando.value = true
  erro.value = ''
  sucesso.value = ''
  try {
    const criada = await estagiarioService.criarModalidadeBolsa({
      nome,
      tipoBase: props.tipoBase,
    })
    opcoes.value = [...opcoes.value, criada].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    emit('update:modelValue', criada.id)
    novoNome.value = ''
    mostrandoCadastro.value = false
    sucesso.value = 'Modalidade cadastrada na Unidade e selecionada.'
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    cadastrando.value = false
  }
}
</script>

<template>
  <div class="modalidade-picker" data-test="modalidade-bolsa">
    <label class="modalidade-field">
      <span>Modalidade específica (opcional)</span>
      <select
        :value="modelValue ?? ''"
        :disabled="!tipoBase || carregando"
        data-test="selecionar-modalidade"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value || null)"
      >
        <option value="">Sem modalidade específica</option>
        <option v-for="item in disponiveis" :key="item.id" :value="item.id">{{ item.nome }}</option>
      </select>
    </label>

    <button
      type="button"
      class="modalidade-link"
      :disabled="!tipoBase || cadastrando"
      @click="mostrandoCadastro = !mostrandoCadastro; erro = ''; sucesso = ''"
    >
      {{ mostrandoCadastro ? 'Cancelar cadastro' : '+ Cadastrar nova modalidade na Unidade' }}
    </button>

    <div v-if="mostrandoCadastro" class="modalidade-create">
      <label class="modalidade-field">
        <span>Nome da nova modalidade</span>
        <input
          v-model="novoNome"
          type="text"
          maxlength="150"
          placeholder="Ex.: Bolsa PIBIC, FAPESB ou convênio"
          data-test="nome-nova-modalidade"
        />
      </label>
      <button
        type="button"
        class="modalidade-save"
        :disabled="cadastrando || !novoNome.trim()"
        data-test="criar-modalidade"
        @click="criar"
      >
        {{ cadastrando ? 'Cadastrando...' : 'Adicionar ao catálogo' }}
      </button>
    </div>
    <small v-if="erro" class="modalidade-error" role="alert">{{ erro }}</small>
    <small v-if="sucesso" class="modalidade-success">{{ sucesso }}</small>
    <small v-if="!mostrandoCadastro" class="modalidade-hint">
      Opções cadastradas podem ser reutilizadas por outros estagiários da Unidade.
    </small>
  </div>
</template>

<style scoped>
.modalidade-picker { display: grid; gap: 7px; min-width: 0; }
.modalidade-field { display: grid; gap: 5px; font-size: 13px; }
.modalidade-field select,
.modalidade-field input {
  width: 100%; min-height: 38px; padding: 8px 10px; border: 1px solid #cbd5e1;
  border-radius: 8px; background: #fff; color: #243247; font: inherit;
}
.modalidade-field select:disabled { opacity: .65; }
.modalidade-link {
  justify-self: start; border: 0; padding: 3px 0; background: none;
  color: #27508a; font: inherit; font-size: 12px; font-weight: 650; cursor: pointer;
}
.modalidade-link:disabled { opacity: .55; cursor: not-allowed; }
.modalidade-create { display: grid; gap: 8px; padding: 11px; background: #f6f8fb; border-radius: 8px; }
.modalidade-save {
  justify-self: start; min-height: 36px; padding: 7px 13px; background: #27508a;
  border: 1px solid #27508a; color: #fff; border-radius: 7px; font: inherit;
  font-size: 12px; font-weight: 700; cursor: pointer;
}
.modalidade-save:disabled { opacity: .55; cursor: not-allowed; }
.modalidade-error { color: #b42318; }
.modalidade-success { color: #157149; }
.modalidade-hint { color: #5b6776; font-size: 11px; }
</style>
