<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { CATEGORIAS, ROTULOS_CATEGORIA } from '@/modules/auth/papeis'
import type { CategoriaCargo, UsuarioSessao } from '@/modules/auth/types/session'

import { equipeService } from '../equipeService'
import { codigoDeErro, mensagemDeErro } from '../mensagemDeErro'

const props = defineProps<{ laboratorioId: string }>()
const emit = defineEmits<{ aprovado: [] }>()

const pendentes = ref<UsuarioSessao[]>([])
const categorias = ref<Record<string, CategoriaCargo | ''>>({})
const carregando = ref(false)
const aprovando = ref<string | null>(null)
const erro = ref('')
const sucesso = ref('')

async function carregar() {
  carregando.value = true
  try {
    pendentes.value = await equipeService.listarPendentes(props.laboratorioId)
    categorias.value = Object.fromEntries(pendentes.value.map((p) => [p.id, p.categoriaCargo ?? '']))
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível carregar quem aguarda aprovação.')
  } finally {
    carregando.value = false
  }
}

async function aprovar(pessoa: UsuarioSessao) {
  aprovando.value = pessoa.id
  erro.value = ''
  sucesso.value = ''
  try {
    await equipeService.aprovarPendente(props.laboratorioId, pessoa.id, categorias.value[pessoa.id] || null)
    sucesso.value = `${pessoa.nome} foi aprovado(a) e já faz parte da equipe.`
    emit('aprovado')
  } catch (error) {
    // All responsáveis see the same list, so another one may have approved this person first.
    erro.value = codigoDeErro(error) === 'USUARIO_NAO_PENDENTE'
      ? 'Esta pessoa já foi aprovada por outro responsável.'
      : mensagemDeErro(error, 'Não foi possível aprovar.')
  } finally {
    aprovando.value = null
    await carregar()
  }
}

watch(() => props.laboratorioId, carregar)
onMounted(carregar)
</script>

<template>
  <section class="people-section" aria-label="Aguardando aprovação">
    <p class="people-footnote">
      Pessoas que entraram no SGL pela primeira vez e aguardam aprovação. Todos os responsáveis da Unidade veem esta lista:
      aprove só quem é do seu laboratório. Para recusar um cadastro, procure o Administrador Local.
    </p>
    <div v-if="erro" class="people-feedback people-feedback--error" role="alert">{{ erro }}</div>
    <div v-if="sucesso" class="people-feedback people-feedback--success" role="status">{{ sucesso }}</div>
    <div v-if="carregando" class="people-empty">Carregando...</div>
    <div v-else-if="pendentes.length === 0" class="people-empty">Ninguém aguardando aprovação.</div>
    <div v-else class="people-table-wrap">
      <table class="people-table">
        <thead><tr><th>Pessoa</th><th>Categoria do cargo</th><th /></tr></thead>
        <tbody>
          <tr v-for="pessoa in pendentes" :key="pessoa.id">
            <td><strong>{{ pessoa.nome }}</strong><small>{{ pessoa.email || pessoa.cargo || '—' }}</small></td>
            <td>
              <label class="people-field">
                <span class="sr-only">Categoria de {{ pessoa.nome }}</span>
                <select v-model="categorias[pessoa.id]" :data-test="`categoria-${pessoa.id}`">
                  <option v-for="item in CATEGORIAS" :key="item" :value="item">{{ ROTULOS_CATEGORIA[item] }}</option>
                </select>
              </label>
            </td>
            <td>
              <button
                type="button"
                class="people-primary"
                :data-test="`aprovar-${pessoa.id}`"
                :disabled="aprovando === pessoa.id"
                @click="aprovar(pessoa)"
              >
                {{ aprovando === pessoa.id ? 'Aprovando...' : 'Aprovar para este laboratório' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
