<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'

import { http } from '@/services/http'

interface UnidadeCorporativa {
  codigoCorporativo: number
  sigla: string
  nome: string
  habilitada: boolean
}

const unidades = ref<UnidadeCorporativa[]>([])
const filtro = ref('')
const carregando = ref(false)
const habilitando = ref<number | null>(null)
const erro = ref('')
const sucesso = ref('')

const lista = computed(() => {
  const termo = filtro.value.trim().toLowerCase()
  if (!termo) return unidades.value
  return unidades.value.filter((u) => `${u.sigla} ${u.nome}`.toLowerCase().includes(termo))
})

function mensagem(e: unknown, padrao: string) {
  return axios.isAxiosError(e) ? (e.response?.data?.message ?? padrao) : e instanceof Error ? e.message : padrao
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const { data } = await http.get<UnidadeCorporativa[]>('/v1/unidades/corporativas')
    unidades.value = data
  } catch (e) {
    erro.value = mensagem(e, 'Não foi possível consultar as Unidades da Embrapa.')
  } finally {
    carregando.value = false
  }
}

async function habilitar(unidade: UnidadeCorporativa) {
  habilitando.value = unidade.codigoCorporativo
  erro.value = ''
  sucesso.value = ''
  try {
    await http.post('/v1/unidades/habilitar', { codigoCorporativo: unidade.codigoCorporativo })
    unidade.habilitada = true
    sucesso.value = `${unidade.sigla} foi habilitada no SGL e já aparece no seletor de Unidade.`
  } catch (e) {
    erro.value = mensagem(e, 'Não foi possível habilitar a Unidade.')
  } finally {
    habilitando.value = null
  }
}

onMounted(carregar)
</script>

<template>
  <section class="admin-page people-management">
    <header class="page-header">
      <div>
        <p class="eyebrow">ADMINISTRAÇÃO</p>
        <h1>Unidades</h1>
        <span>Unidades da Embrapa disponíveis para o SGL. Habilitar uma Unidade permite que seus empregados entrem e sejam importados.</span>
      </div>
      <button class="btn btn--ghost" type="button" :disabled="carregando" @click="carregar">Atualizar</button>
    </header>

    <div v-if="sucesso" class="people-feedback people-feedback--success" role="status">{{ sucesso }}</div>
    <div v-if="erro" class="people-feedback people-feedback--error" role="alert">{{ erro }}</div>

    <section class="people-workspace">
      <div class="people-filter-grid">
        <label class="people-field people-field--search"><span>Filtrar</span>
          <input v-model="filtro" type="search" placeholder="Sigla ou nome" />
        </label>
      </div>

      <div v-if="carregando" class="people-empty">Consultando a Unidadeapi...</div>
      <div v-else-if="lista.length === 0" class="people-empty">Nenhuma Unidade encontrada.</div>
      <div v-else class="people-table-wrap">
        <table class="people-table">
          <thead><tr><th>Sigla</th><th>Nome</th><th>Código</th><th /></tr></thead>
          <tbody>
            <tr v-for="u in lista" :key="u.codigoCorporativo">
              <td><strong>{{ u.sigla }}</strong></td>
              <td>{{ u.nome }}</td>
              <td>{{ u.codigoCorporativo }}</td>
              <td>
                <span v-if="u.habilitada" class="people-pill people-pill--vinculado"><span class="people-dot" />Habilitada</span>
                <button v-else type="button" class="people-outline" :disabled="habilitando !== null" @click="habilitar(u)">
                  {{ habilitando === u.codigoCorporativo ? 'Habilitando...' : 'Habilitar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>
