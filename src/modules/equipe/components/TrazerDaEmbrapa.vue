<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import type { PessoaCorporativa, TipoPessoaCorporativa } from '@/modules/admin/services/pessoasCorporativasService'
import { CATEGORIAS, ROTULOS_CATEGORIA } from '@/modules/auth/papeis'
import type { CategoriaCargo } from '@/modules/auth/types/session'

import { equipeService } from '../equipeService'
import { mensagemDeErro } from '../mensagemDeErro'
import type { ResultadoImportacao, ResultadoImportacaoTipo } from '../types'

const props = defineProps<{ laboratorioId: string }>()
const emit = defineEmits<{ cadastradas: [] }>()

const TERMO_MINIMO = 3
const ROTULOS_RESULTADO: Record<ResultadoImportacaoTipo, string> = {
  CADASTRADA: 'Cadastrada',
  JA_CADASTRADA: 'Já estava no SGL',
  NAO_ENCONTRADA: 'Não encontrada na base da Embrapa',
  ERRO: 'Não foi possível cadastrar',
}

interface Selecionada {
  pessoa: PessoaCorporativa
  categoria: CategoriaCargo | ''
}

const tipo = ref<TipoPessoaCorporativa>('COLABORADOR')
const termo = ref('')
const resultados = ref<PessoaCorporativa[]>([])
const buscando = ref(false)
const erro = ref('')
// Kept across searches: the person types a name, ticks, types another name, ticks more.
const selecionadas = ref<Map<string, Selecionada>>(new Map())
const cadastrando = ref(false)
const relatorio = ref<ResultadoImportacao[]>([])

const chave = (pessoa: Pick<PessoaCorporativa, 'tipo' | 'referencia'>) => `${pessoa.tipo}:${pessoa.referencia}`
const listaSelecionada = computed(() => [...selecionadas.value.values()])
const nomes = computed(() => new Map(listaSelecionada.value.map((s) => [s.pessoa.referencia, s.pessoa.nome])))

let temporizador: ReturnType<typeof setTimeout> | null = null

async function buscar() {
  const texto = termo.value.trim()
  if (texto.length < TERMO_MINIMO) {
    resultados.value = []
    return
  }
  buscando.value = true
  erro.value = ''
  try {
    resultados.value = await equipeService.candidatos(props.laboratorioId, tipo.value, texto)
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível buscar na base da Embrapa.')
  } finally {
    buscando.value = false
  }
}

watch([termo, tipo], () => {
  if (temporizador) clearTimeout(temporizador)
  temporizador = setTimeout(() => void buscar(), 300)
})
onBeforeUnmount(() => {
  if (temporizador) clearTimeout(temporizador)
})

function marcada(pessoa: PessoaCorporativa) {
  return selecionadas.value.has(chave(pessoa))
}

function alternar(pessoa: PessoaCorporativa, marcar: boolean) {
  const proxima = new Map(selecionadas.value)
  if (marcar) proxima.set(chave(pessoa), { pessoa, categoria: pessoa.categoriaSugerida ?? '' })
  else proxima.delete(chave(pessoa))
  selecionadas.value = proxima
}

async function cadastrar() {
  if (listaSelecionada.value.length === 0) return
  cadastrando.value = true
  erro.value = ''
  try {
    relatorio.value = await equipeService.importar(props.laboratorioId, listaSelecionada.value.map((s) => ({
      tipo: s.pessoa.tipo,
      referencia: s.pessoa.referencia,
      categoriaCargo: s.categoria || null,
    })))
    selecionadas.value = new Map()
    resultados.value = []
    termo.value = ''
    emit('cadastradas')
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível cadastrar as pessoas.')
  } finally {
    cadastrando.value = false
  }
}
</script>

<template>
  <section class="people-section trazer" aria-label="Trazer da Embrapa">
    <p class="people-footnote">
      Busque pessoas da sua Unidade que ainda não estão no SGL. Marque quantas quiser, troque a busca e marque mais:
      elas ficam em "Selecionados". Quem você cadastrar aqui já entra na equipe, sem precisar de aprovação.
    </p>
    <div v-if="erro" class="people-feedback people-feedback--error" role="alert">{{ erro }}</div>

    <div class="trazer__grade">
      <div class="trazer__busca">
        <div class="people-filter-grid">
          <label class="people-field">
            <span>Quem procurar</span>
            <select v-model="tipo" data-test="tipo">
              <option value="COLABORADOR">Colaboradores (estagiários, bolsistas)</option>
              <option value="EMPREGADO">Empregados</option>
            </select>
          </label>
          <label class="people-field">
            <span>Nome (pelo menos 3 letras)</span>
            <input v-model="termo" type="search" data-test="busca" placeholder="Ex.: Ana">
          </label>
        </div>
        <p v-if="buscando" class="people-empty-inline">Buscando...</p>
        <p v-else-if="termo.trim().length >= TERMO_MINIMO && resultados.length === 0" class="people-empty-inline">
          Ninguém encontrado fora do SGL com esse nome.
        </p>
        <ul class="trazer__lista">
          <li v-for="pessoa in resultados" :key="chave(pessoa)">
            <label>
              <input
                type="checkbox"
                :data-test="`marcar-${pessoa.referencia}`"
                :checked="marcada(pessoa)"
                @change="alternar(pessoa, ($event.target as HTMLInputElement).checked)"
              >
              <span><strong>{{ pessoa.nome }}</strong><small>{{ pessoa.cargo || pessoa.sublotacao || '—' }}</small></span>
            </label>
          </li>
        </ul>
      </div>

      <aside class="trazer__selecionados" data-test="selecionados" aria-live="polite">
        <h3>Selecionados ({{ listaSelecionada.length }})</h3>
        <p v-if="listaSelecionada.length === 0" class="people-empty-inline">Marque pessoas na busca ao lado.</p>
        <ul class="trazer__lista">
          <li v-for="item in listaSelecionada" :key="chave(item.pessoa)">
            <span><strong>{{ item.pessoa.nome }}</strong></span>
            <label class="people-field">
              <span class="sr-only">Categoria de {{ item.pessoa.nome }}</span>
              <select v-model="item.categoria" :data-test="`categoria-${item.pessoa.referencia}`">
                <option v-for="categoria in CATEGORIAS" :key="categoria" :value="categoria">{{ ROTULOS_CATEGORIA[categoria] }}</option>
              </select>
            </label>
            <button type="button" class="people-link" :data-test="`remover-${item.pessoa.referencia}`" @click="alternar(item.pessoa, false)">
              Remover
            </button>
          </li>
        </ul>
        <button
          type="button"
          class="people-primary"
          data-test="cadastrar"
          :disabled="listaSelecionada.length === 0 || cadastrando"
          @click="cadastrar"
        >
          {{ cadastrando ? 'Cadastrando...' : `Cadastrar ${listaSelecionada.length} pessoa${listaSelecionada.length === 1 ? '' : 's'}` }}
        </button>
      </aside>
    </div>

    <div v-if="relatorio.length" class="trazer__relatorio" role="status">
      <h3>Resultado do cadastro</h3>
      <ul>
        <li v-for="item in relatorio" :key="item.referencia">
          <strong>{{ item.nome || nomes.get(item.referencia) || item.referencia }}</strong>:
          {{ ROTULOS_RESULTADO[item.resultado] }}<span v-if="item.resultado === 'ERRO' && item.mensagem"> ({{ item.mensagem }})</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.trazer__grade {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 16px;
}

@media (max-width: 760px) {
  .trazer__grade {
    grid-template-columns: minmax(0, 1fr);
  }
}

.trazer__lista {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 8px 0;
  padding: 0;
  list-style: none;
}

.trazer__lista label,
.trazer__lista li {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.trazer__lista small {
  display: block;
  color: var(--sgl-text-muted, #64748b);
}

.trazer__selecionados {
  padding: 12px 14px;
  border: 1px solid var(--sgl-border, #dce4ef);
  border-radius: 9px;
}

.trazer__selecionados h3,
.trazer__relatorio h3 {
  margin: 0 0 6px;
  font-size: 14px;
}

.trazer__relatorio ul {
  margin: 0;
  padding-left: 1.2em;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
