<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'

import { estagiarioService } from '@/modules/estagiarios/services/estagiarioService'
import type { BolsaResponse } from '@/modules/estagiarios/types/estagiario'

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', valor: string | null): void
}>()

const opcoes = ref<BolsaResponse[]>([])
const carregando = ref(false)
const cadastrando = ref(false)
const mostrandoCadastro = ref(false)
const novoNome = ref('')
const erro = ref('')
const sucesso = ref('')

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || 'Não foi possível cadastrar a bolsa.'
  }
  return error instanceof Error ? error.message : 'Não foi possível registrar a modalidade.'
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    opcoes.value = await estagiarioService.listarBolsasAtivas()
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregando.value = false
  }
}

onMounted(() => { void carregar() })

async function criar() {
  const nome = novoNome.value.trim()
  if (!nome || cadastrando.value) {
    erro.value = 'Informe o nome da bolsa.'
    return
  }

  cadastrando.value = true
  erro.value = ''
  sucesso.value = ''
  try {
    const criada = await estagiarioService.criarBolsa({
      nome,
    })
    opcoes.value = [...opcoes.value, criada].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    emit('update:modelValue', criada.id)
    novoNome.value = ''
    mostrandoCadastro.value = false
    sucesso.value = 'Bolsa cadastrada na Unidade e selecionada.'
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    cadastrando.value = false
  }
}
</script>

<template>
  <div class="modalidade-picker" data-test="bolsa-catalogo">
    <label class="modalidade-field">
      <span>Bolsa cadastrada na Unidade</span>
      <select
        :value="modelValue ?? ''"
        :disabled="carregando"
        data-test="selecionar-bolsa"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value || null)"
      >
        <option value="">Selecione uma bolsa</option>
        <option v-for="item in opcoes" :key="item.id" :value="item.id">{{ item.nome }}</option>
      </select>
    </label>

    <button
      type="button"
      class="modalidade-link"
      :disabled="cadastrando"
      @click="mostrandoCadastro = !mostrandoCadastro; erro = ''; sucesso = ''"
    >
      {{ mostrandoCadastro ? 'Cancelar cadastro' : '+ Cadastrar nova bolsa na Unidade' }}
    </button>

    <div v-if="mostrandoCadastro" class="modalidade-create">
      <label class="modalidade-field">
        <span>Nome da bolsa</span>
        <input
          v-model="novoNome"
          type="text"
          maxlength="150"
          placeholder="Ex.: Bolsa FAPESB, PIBIC ou apoio institucional"
          data-test="nome-nova-bolsa"
        />
      </label>
      <button
        type="button"
        class="modalidade-save"
        :disabled="cadastrando || !novoNome.trim()"
        data-test="criar-bolsa"
        @click="criar"
      >
        {{ cadastrando ? 'Cadastrando...' : 'Adicionar ao catálogo' }}
      </button>
    </div>
    <small v-if="erro" class="modalidade-error" role="alert">{{ erro }}</small>
    <small v-if="sucesso" class="modalidade-success">{{ sucesso }}</small>
    <small v-if="!mostrandoCadastro" class="modalidade-hint">
      Bolsas cadastradas podem ser reutilizadas em vínculos de outros estagiários da Unidade.
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
