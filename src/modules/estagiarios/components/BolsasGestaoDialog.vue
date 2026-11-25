<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'

import { estagiarioService } from '@/modules/estagiarios/services/estagiarioService'
import type { BolsaResponse } from '@/modules/estagiarios/types/estagiario'

const emit = defineEmits<{ (event: 'fechar'): void }>()
const itens = ref<BolsaResponse[]>([])
const nomes = ref<Record<string, string>>({})
const carregando = ref(false)
const salvandoId = ref('')
const erro = ref('')
const sucesso = ref('')

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || 'Falha ao atualizar bolsa.'
  }
  return error instanceof Error ? error.message : 'Falha ao atualizar bolsa.'
}


async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    itens.value = await estagiarioService.listarBolsas()
    nomes.value = Object.fromEntries(itens.value.map((item) => [item.id, item.nome]))
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregando.value = false
  }
}

async function atualizar(item: BolsaResponse, ativo = item.ativo) {
  const nome = (nomes.value[item.id] ?? '').trim()
  if (!nome) {
    erro.value = 'Informe um nome para a bolsa.'
    return
  }
  salvandoId.value = item.id
  erro.value = ''
  sucesso.value = ''
  try {
    const atualizada = await estagiarioService.atualizarBolsa(item.id, {
      nome,
      ativo,
    })
    itens.value = itens.value.map((registro) => registro.id === item.id ? atualizada : registro)
    nomes.value[item.id] = atualizada.nome
    sucesso.value = 'Catálogo atualizado. Vínculos históricos permanecem preservados.'
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    salvandoId.value = ''
  }
}

onMounted(() => { void carregar() })
</script>

<template>
  <div class="bolsas-backdrop" @click.self="emit('fechar')">
    <section class="bolsas-card" role="dialog" aria-modal="true" aria-label="Gerenciar bolsas cadastradas">
      <header>
        <div>
          <span class="overline">GESTÃO / ESTAGIÁRIOS</span>
          <h2>Bolsas cadastradas</h2>
          <p>Cadastre bolsas diretamente na Unidade, sem depender dos tipos legados. Reutilize-as nos vínculos. Aqui você pode renomear e inativar opções existentes.</p>
        </div>
        <button type="button" class="close" aria-label="Fechar" @click="emit('fechar')">×</button>
      </header>

      <p v-if="erro" class="feedback-error" role="alert">{{ erro }}</p>
      <p v-if="sucesso" class="feedback-success">{{ sucesso }}</p>
      <p v-if="carregando">Carregando bolsas...</p>
      <p v-else-if="!itens.length">Nenhuma bolsa específica cadastrada nesta Unidade.</p>

      <div v-else class="bolsas-lista">
        <article v-for="item in itens" :key="item.id" class="bolsa-item">
          <label>
            <span>Nome da bolsa</span>
            <input v-model="nomes[item.id]" type="text" maxlength="150" />
          </label>
          <div class="bolsa-meta">
            <span :class="item.ativo ? 'status-ativo' : 'status-inativo'">
              {{ item.ativo ? 'Ativa' : 'Inativa' }}
            </span>
          </div>
          <div class="bolsa-actions">
            <button
              type="button" :disabled="!!salvandoId"
              @click="atualizar(item)"
            >Salvar nome</button>
            <button
              type="button" :disabled="!!salvandoId"
              @click="atualizar(item, !item.ativo)"
            >{{ item.ativo ? 'Inativar' : 'Reativar' }}</button>
          </div>
        </article>
      </div>
      <footer>
        <button type="button" @click="emit('fechar')">Fechar</button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.bolsas-backdrop { position: fixed; inset: 0; z-index: 70; background: rgb(15 23 42 / 50%); display: grid; place-items: center; padding: 18px; }
.bolsas-card { width: min(730px, 100%); max-height: 90vh; overflow: auto; background: #fff; color: #243247; padding: 22px; border-radius: 11px; box-shadow: 0 18px 60px rgb(0 0 0 / 18%); }
.bolsas-card header { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.bolsas-card header h2 { margin: 5px 0; font-size: 19px; }
.bolsas-card header p { margin: 0; color: #607080; font-size: 13px; }
.overline { color: #617182; font-weight: 700; font-size: 11px; letter-spacing: .05em; }
.close { align-self: start; border: none; background: transparent; font-size: 26px; cursor: pointer; color: inherit; }
.bolsas-lista { display: grid; gap: 10px; }
.bolsa-item { border: 1px solid #dce3eb; border-radius: 9px; padding: 13px; }
.bolsa-item label { display: grid; gap: 4px; font-size: 12px; }
.bolsa-item input { min-height: 38px; width: 100%; border: 1px solid #cbd5e1; border-radius: 7px; padding: 7px 9px; font: inherit; }
.bolsa-meta, .bolsa-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 10px; font-size: 12px; }
.bolsa-meta { color: #64748b; }
.status-ativo { color: #16754e; font-weight: 700; }
.status-inativo { color: #a14b25; font-weight: 700; }
.bolsa-actions button, footer button { padding: 7px 12px; background: #fff; border: 1px solid #ccd7e2; border-radius: 7px; font: inherit; font-size: 12px; cursor: pointer; }
.bolsa-actions button:disabled { opacity: .55; cursor: not-allowed; }
footer { display: flex; justify-content: flex-end; margin-top: 18px; }
.feedback-error { color: #b42318; font-size: 13px; }
.feedback-success { color: #16754e; font-size: 13px; }
</style>
