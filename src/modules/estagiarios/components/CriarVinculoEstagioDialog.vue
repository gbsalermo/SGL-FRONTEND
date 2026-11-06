<script setup lang="ts">
import axios from 'axios'
import { computed, ref, watch } from 'vue'

import { listarLaboratoriosOperacionais } from '@/modules/operacao/services/laboratoriosOperacionais'
import type { LaboratorioOperacional } from '@/modules/operacao/services/laboratoriosOperacionais'
import { opcoesBolsa, opcoesFormacao } from '@/modules/estagiarios/opcoesEstagio'
import { estagiarioService } from '@/modules/estagiarios/services/estagiarioService'
import type {
  ApiErrorResponse,
  AtividadeDisponivelEstagioResponse,
  CulturaEstagioResponse,
  CursoEstagioResponse,
  EstagiarioResponse,
  EstagiarioSemVinculoResponse,
  FormacaoEstagiario,
  OrientadorElegivelResponse,
  TipoBolsaEstagiario,
} from '@/modules/estagiarios/types/estagiario'
import { useSessionStore } from '@/stores/session'

const props = defineProps<{
  pendente: EstagiarioSemVinculoResponse
  aberto: boolean
}>()

const emit = defineEmits<{
  (event: 'fechar'): void
  (event: 'criado', estagiario: EstagiarioResponse): void
}>()

const session = useSessionStore()

const laboratorios = ref<LaboratorioOperacional[]>([])
const orientadores = ref<OrientadorElegivelResponse[]>([])
const atividades = ref<AtividadeDisponivelEstagioResponse[]>([])
const cursos = ref<CursoEstagioResponse[]>([])
const culturas = ref<CulturaEstagioResponse[]>([])

const laboratorioId = ref('')
const orientadorId = ref('')
const dataInicio = ref('')
const dataFim = ref('')
const tipoBolsa = ref<TipoBolsaEstagiario | ''>('')
const formacao = ref<FormacaoEstagiario | ''>('')
const formacaoOutro = ref('')
const atividadeId = ref('')
const cursoId = ref('')
const culturaIds = ref<string[]>([])
const observacao = ref('')

const enviando = ref(false)
const erro = ref('')

const fimAntesDoInicio = computed(
  () => Boolean(dataInicio.value && dataFim.value) && dataFim.value < dataInicio.value,
)

const podeSalvar = computed(() =>
  Boolean(
    laboratorioId.value
    && orientadorId.value
    && dataInicio.value
    && dataFim.value
    && tipoBolsa.value
    && formacao.value
    && atividadeId.value,
  )
  && (formacao.value !== 'OUTRO' || formacaoOutro.value.trim() !== '')
  && !fimAntesDoInicio.value
  && !enviando.value,
)

function reiniciarFormulario() {
  laboratorioId.value = props.pendente.laboratorioId ?? ''
  orientadorId.value = ''
  dataInicio.value = ''
  dataFim.value = ''
  tipoBolsa.value = ''
  formacao.value = ''
  formacaoOutro.value = ''
  atividadeId.value = ''
  cursoId.value = ''
  culturaIds.value = []
  observacao.value = ''
  erro.value = ''
}

async function carregarOpcoes() {
  const unidadeId = session.unidadeEmOperacaoId
  try {
    const [labs, orientadoresElegiveis, atividadesAtivas, cursosAtivos, culturasAtivas] =
      await Promise.all([
        unidadeId ? listarLaboratoriosOperacionais(unidadeId) : Promise.resolve([]),
        estagiarioService.listarOrientadoresElegiveis(),
        estagiarioService.listarAtividadesDisponiveis(),
        estagiarioService.listarCursosAtivos(),
        estagiarioService.listarCulturasAtivas(),
      ])
    laboratorios.value = labs
    orientadores.value = orientadoresElegiveis
    atividades.value = atividadesAtivas
    cursos.value = cursosAtivos
    culturas.value = culturasAtivas
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível carregar as opções do formulário.')
  }
}

// Reset on every opening so a previous pendente's answers (or error) never leak into the next one.
watch(
  () => [props.aberto, props.pendente.usuarioId] as const,
  ([aberto]) => {
    if (!aberto) return
    reiniciarFormulario()
    void carregarOpcoes()
  },
  { immediate: true },
)

function mensagemDeErro(error: unknown, padrao: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) return error.response?.data?.message ?? padrao
  return error instanceof Error ? error.message : padrao
}

async function salvar() {
  if (!podeSalvar.value) return
  enviando.value = true
  erro.value = ''
  try {
    const criado = await estagiarioService.criar({
      usuarioId: props.pendente.usuarioId,
      laboratorioId: laboratorioId.value,
      orientadorId: orientadorId.value,
      dataInicioEstagio: dataInicio.value,
      dataFimEstagio: dataFim.value,
      tipoBolsa: tipoBolsa.value as TipoBolsaEstagiario,
      formacao: formacao.value as FormacaoEstagiario,
      formacaoOutro: formacao.value === 'OUTRO' ? formacaoOutro.value.trim() : null,
      atividadeId: atividadeId.value,
      cursoId: cursoId.value || null,
      culturaIds: culturaIds.value,
      observacao: observacao.value.trim() || null,
      ativo: true,
    })
    emit('criado', criado)
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível criar o vínculo.')
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div v-if="aberto" class="vinculo-backdrop" @click.self="emit('fechar')">
    <section
      class="vinculo-card"
      role="dialog"
      aria-modal="true"
      :aria-label="`Criar vínculo de ${pendente.nome}`"
    >
      <header>
        <h2>Criar vínculo</h2>
        <p>{{ pendente.nome }}</p>
        <button type="button" aria-label="Fechar" @click="emit('fechar')">×</button>
      </header>

      <form class="vinculo-form" @submit.prevent>
        <p v-if="erro" class="vinculo-erro" role="alert">{{ erro }}</p>

        <label>
          <span>Laboratório</span>
          <select v-model="laboratorioId" data-test="laboratorio">
            <option value="" disabled>Selecione</option>
            <option v-for="lab in laboratorios" :key="lab.id" :value="lab.id">{{ lab.nome }}</option>
          </select>
        </label>

        <label>
          <span>Orientador</span>
          <select v-model="orientadorId" data-test="orientador">
            <option value="" disabled>Selecione</option>
            <option v-for="o in orientadores" :key="o.usuarioId" :value="o.usuarioId">
              {{ o.nome }}
            </option>
          </select>
        </label>

        <div class="vinculo-row">
          <label>
            <span>Data de início</span>
            <input v-model="dataInicio" type="date" data-test="data-inicio" />
          </label>
          <label>
            <span>Data de fim prevista</span>
            <input v-model="dataFim" type="date" data-test="data-fim" />
          </label>
        </div>
        <small v-if="fimAntesDoInicio" class="vinculo-erro">
          A data de fim não pode ser anterior à de início.
        </small>

        <label>
          <span>Tipo de vínculo</span>
          <select v-model="tipoBolsa" data-test="tipo-bolsa">
            <option value="" disabled>Selecione</option>
            <option v-for="opcao in opcoesBolsa" :key="opcao.valor" :value="opcao.valor">
              {{ opcao.rotulo }}
            </option>
          </select>
        </label>

        <label>
          <span>Formação</span>
          <select v-model="formacao" data-test="formacao">
            <option value="" disabled>Selecione</option>
            <option v-for="opcao in opcoesFormacao" :key="opcao.valor" :value="opcao.valor">
              {{ opcao.rotulo }}
            </option>
          </select>
        </label>

        <label v-if="formacao === 'OUTRO'">
          <span>Descrição da formação</span>
          <input v-model="formacaoOutro" type="text" data-test="formacao-outro" />
        </label>

        <label>
          <span>Atividade inicial</span>
          <select v-model="atividadeId" data-test="atividade">
            <option value="" disabled>Selecione</option>
            <option v-for="a in atividades" :key="a.id" :value="a.id">
              {{ a.codigoSeg }} — {{ a.nome }}
            </option>
          </select>
        </label>

        <label>
          <span>Curso (opcional)</span>
          <select v-model="cursoId" data-test="curso">
            <option value="">Sem curso</option>
            <option v-for="c in cursos" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
        </label>

        <fieldset v-if="culturas.length > 0">
          <legend>Culturas (opcional)</legend>
          <label v-for="cultura in culturas" :key="cultura.id" class="vinculo-check">
            <input v-model="culturaIds" type="checkbox" :value="cultura.id" />
            {{ cultura.nome }}
          </label>
        </fieldset>

        <label>
          <span>Observação (opcional)</span>
          <textarea v-model="observacao" rows="3" data-test="observacao" />
        </label>

        <footer>
          <button type="button" data-test="cancelar" @click="emit('fechar')">Cancelar</button>
          <button type="button" data-test="salvar" :disabled="!podeSalvar" @click="salvar">
            {{ enviando ? 'Salvando...' : 'Salvar' }}
          </button>
        </footer>
      </form>
    </section>
  </div>
</template>

<style scoped>
.vinculo-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgb(15 23 42 / 45%);
}

.vinculo-card {
  width: min(560px, 94vw);
  max-height: 92vh;
  overflow-y: auto;
  padding: 20px 24px;
  border-radius: 11px;
  background: #fff;
}

.vinculo-card header {
  position: relative;
  margin-bottom: 12px;
}

.vinculo-card h2,
.vinculo-card header p {
  margin: 0;
}

.vinculo-card header button {
  position: absolute;
  top: 0;
  right: 0;
  border: 0;
  background: none;
  font-size: 22px;
  cursor: pointer;
}

.vinculo-form {
  display: grid;
  gap: 12px;
}

.vinculo-form label,
.vinculo-form fieldset {
  display: grid;
  gap: 4px;
  font-size: 13px;
}

.vinculo-form input[type='date'],
.vinculo-form input[type='text'],
.vinculo-form select,
.vinculo-form textarea {
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

.vinculo-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.vinculo-check {
  display: flex !important;
  align-items: center;
  gap: 6px;
}

.vinculo-erro {
  margin: 0;
  color: #b42318;
}

.vinculo-form footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.vinculo-form footer button {
  padding: 8px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.vinculo-form footer button[data-test='salvar'] {
  border-color: #1d4ed8;
  background: #1d4ed8;
  color: #fff;
}

.vinculo-form footer button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
