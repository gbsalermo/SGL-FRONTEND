<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'

import { estagiarioService } from '@/modules/estagiarios/services/estagiarioService'
import { opcoesBolsa } from '@/modules/estagiarios/opcoesEstagio'
import type { ModalidadeBolsaResponse } from '@/modules/estagiarios/types/estagiario'

const emit = defineEmits<{ (event: 'fechar'): void }>()
const itens = ref<ModalidadeBolsaResponse[]>([])
const nomes = ref<Record<string, string>>({})
const carregando = ref(false)
const salvandoId = ref('')
const erro = ref('')
const sucesso = ref('')

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || 'Falha ao atualizar modalidade.'
  }
  return error instanceof Error ? error.message : 'Falha ao atualizar modalidade.'
}

function rotuloTipo(item: ModalidadeBolsaResponse) {
  return opcoesBolsa.find((opcao) => opcao.valor === item.tipoBase)?.rotulo ?? item.tipoBase
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    itens.value = await estagiarioService.listarModalidadesBolsa()
    nomes.value = Object.fromEntries(itens.value.map((item) => [item.id, item.nome]))
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregando.value = false
  }
}

async function atualizar(item: ModalidadeBolsaResponse, ativo = item.ativo) {
  const nome = (nomes.value[item.id] ?? '').trim()
  if (!nome) {
    erro.value = 'Informe um nome para a modalidade.'
    return
  }
  salvandoId.value = item.id
  erro.value = ''
  sucesso.value = ''
  try {
    const atualizada = await estagiarioService.atualizarModalidadeBolsa(item.id, {
      nome,
      tipoBase: item.tipoBase,
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
  <div class="modalidades-backdrop" @click.self="emit('fechar')">
    <section class="modalidades-card" role="dialog" aria-modal="true" aria-label="Gerenciar modalidades de bolsa">
      <header>
        <div>
          <span class="overline">GESTÃO / ESTAGIÁRIOS</span>
          <h2>Modalidades de bolsa</h2>
          <p>Cadastre novas modalidades ao criar um vínculo ou registrar uma nova bolsa. Aqui você pode renomear e inativar opções existentes.</p>
        </div>
        <button type="button" class="close" aria-label="Fechar" @click="emit('fechar')">×</button>
      </header>

      <p v-if="erro" class="feedback-error" role="alert">{{ erro }}</p>
      <p v-if="sucesso" class="feedback-success">{{ sucesso }}</p>
      <p v-if="carregando">Carregando modalidades...</p>
      <p v-else-if="!itens.length">Nenhuma modalidade específica cadastrada nesta Unidade.</p>

      <div v-else class="modalidades-lista">
        <article v-for="item in itens" :key="item.id" class="modalidade-item">
          <label>
            <span>Nome da modalidade</span>
            <input v-model="nomes[item.id]" type="text" maxlength="150" />
          </label>
          <div class="modalidade-meta">
            <span>{{ rotuloTipo(item) }}</span>
            <span :class="item.ativo ? 'status-ativo' : 'status-inativo'">
              {{ item.ativo ? 'Ativa' : 'Inativa' }}
            </span>
          </div>
          <div class="modalidade-actions">
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
.modalidades-backdrop { position: fixed; inset: 0; z-index: 70; background: rgb(15 23 42 / 50%); display: grid; place-items: center; padding: 18px; }
.modalidades-card { width: min(730px, 100%); max-height: 90vh; overflow: auto; background: #fff; color: #243247; padding: 22px; border-radius: 11px; box-shadow: 0 18px 60px rgb(0 0 0 / 18%); }
.modalidades-card header { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.modalidades-card header h2 { margin: 5px 0; font-size: 19px; }
.modalidades-card header p { margin: 0; color: #607080; font-size: 13px; }
.overline { color: #617182; font-weight: 700; font-size: 11px; letter-spacing: .05em; }
.close { align-self: start; border: none; background: transparent; font-size: 26px; cursor: pointer; color: inherit; }
.modalidades-lista { display: grid; gap: 10px; }
.modalidade-item { border: 1px solid #dce3eb; border-radius: 9px; padding: 13px; }
.modalidade-item label { display: grid; gap: 4px; font-size: 12px; }
.modalidade-item input { min-height: 38px; width: 100%; border: 1px solid #cbd5e1; border-radius: 7px; padding: 7px 9px; font: inherit; }
.modalidade-meta, .modalidade-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 10px; font-size: 12px; }
.modalidade-meta { color: #64748b; }
.status-ativo { color: #16754e; font-weight: 700; }
.status-inativo { color: #a14b25; font-weight: 700; }
.modalidade-actions button, footer button { padding: 7px 12px; background: #fff; border: 1px solid #ccd7e2; border-radius: 7px; font: inherit; font-size: 12px; cursor: pointer; }
.modalidade-actions button:disabled { opacity: .55; cursor: not-allowed; }
footer { display: flex; justify-content: flex-end; margin-top: 18px; }
.feedback-error { color: #b42318; font-size: 13px; }
.feedback-success { color: #16754e; font-size: 13px; }
</style>
