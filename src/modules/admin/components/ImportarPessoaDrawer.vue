<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { DadoEmbrapa } from '@/modules/admin/services/pessoasCorporativasService'
import type { LaboratorioCadastro } from '@/modules/admin/types/cadastros'
import { CATEGORIAS, papeisConcedidosPor, ROTULOS_CATEGORIA, ROTULOS_PAPEL } from '@/modules/auth/papeis'
import type { CategoriaCargo, PapelSistema } from '@/modules/auth/types/session'
import LaboratoriosSelect from '@/modules/operacao/components/LaboratoriosSelect.vue'
import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'
import { useSessionStore } from '@/stores/session'

const props = defineProps<{
  modo: 'importar' | 'aprovar'
  nome: string
  dados: DadoEmbrapa[]
  categoriaSugerida: CategoriaCargo | null
  laboratorios: LaboratorioCadastro[]
  salvando: boolean
  erro: string
}>()

const emit = defineEmits<{
  fechar: []
  confirmar: [payload: { papeis: PapelSistema[]; categoriaCargo: CategoriaCargo; laboratorioIds: string[] }]
  recusar: []
}>()

const session = useSessionStore()

const papeisDisponiveis = computed(() => papeisConcedidosPor(session.usuario))
const laboratoriosAtivos = computed<LaboratorioResumo[]>(() =>
  props.laboratorios.filter((lab) => lab.ativo).map(({ id, nome, ativo }) => ({ id, nome, ativo })))

const laboratorioIds = ref<string[]>([])
const categoria = ref<CategoriaCargo | ''>('')
const papeis = ref<PapelSistema[]>([])
const confirmandoRecusa = ref(false)

// The category from the Embrapa cargo is only a starting point; management may correct it.
watch(() => props.categoriaSugerida, (sugerida) => {
  categoria.value = sugerida ?? ''
}, { immediate: true })

function alternarPapel(papel: PapelSistema, marcado: boolean) {
  papeis.value = marcado ? [...papeis.value, papel] : papeis.value.filter((item) => item !== papel)
}

// Management roles act on the whole Unidade, so only people without one need a laboratory.
const exigeLaboratorio = computed(() => papeis.value.length === 0)
const podeConfirmar = computed(() =>
  Boolean(categoria.value) && (!exigeLaboratorio.value || laboratorioIds.value.length > 0) && !props.salvando)

function confirmar() {
  if (!categoria.value || !podeConfirmar.value) return
  emit('confirmar', { papeis: [...papeis.value], categoriaCargo: categoria.value, laboratorioIds: laboratorioIds.value })
}
</script>

<template>
  <div class="people-management people-backdrop" @click.self="emit('fechar')">
    <aside class="people-drawer" role="dialog" aria-modal="true" :aria-label="(modo === 'importar' ? 'Importar ' : 'Aprovar ') + nome">
      <header class="people-drawer-header">
        <div>
          <span class="people-eyebrow">{{ modo === 'importar' ? 'IMPORTAR DA EMBRAPA' : 'APROVAR ACESSO PENDENTE' }}</span>
          <h2>{{ nome }}</h2>
        </div>
        <button class="people-close" type="button" aria-label="Fechar" @click="emit('fechar')">×</button>
      </header>

      <div class="people-drawer-content">
        <div v-if="erro" class="people-feedback people-feedback--error" role="alert">{{ erro }}</div>

        <section class="people-section">
          <div class="people-section-head"><div><span class="people-section-number">01</span><h3>Dados da Embrapa</h3></div></div>
          <dl class="importar-dados">
            <template v-for="dado in dados" :key="dado.rotulo">
              <dt>{{ dado.rotulo }}</dt>
              <dd>{{ dado.valor || '—' }}</dd>
            </template>
          </dl>
        </section>

        <section class="people-section">
          <div class="people-section-head"><div><span class="people-section-number">02</span><h3>No SGL</h3></div></div>
          <div class="people-filter-grid">
            <label class="people-field"><span>Categoria do cargo *</span>
              <select v-model="categoria" required data-test="categoria">
                <option value="" disabled>Selecione</option>
                <option v-for="item in CATEGORIAS" :key="item" :value="item">{{ ROTULOS_CATEGORIA[item] }}</option>
              </select>
            </label>
          </div>
          <fieldset v-if="papeisDisponiveis.length > 0" class="importar-papeis">
            <legend>Papéis no sistema (opcional)</legend>
            <label v-for="papel in papeisDisponiveis" :key="papel" class="importar-papel">
              <input
                type="checkbox"
                :data-test="`papel-${papel}`"
                :checked="papeis.includes(papel)"
                @change="alternarPapel(papel, ($event.target as HTMLInputElement).checked)"
              >
              {{ ROTULOS_PAPEL[papel] }}
            </label>
          </fieldset>
          <LaboratoriosSelect v-model="laboratorioIds" :opcoes="laboratoriosAtivos" :vinculados="[]" :obrigatorio="exigeLaboratorio" />
          <p class="people-footnote">Vínculos adicionais (projetos, SCIs, atividades) são cadastrados depois, em Vínculos operacionais.</p>
        </section>

        <div class="importar-acoes">
          <template v-if="modo === 'aprovar'">
            <button v-if="!confirmandoRecusa" class="people-danger-outline" type="button" :disabled="salvando" @click="confirmandoRecusa = true">Recusar</button>
            <template v-else>
              <span class="importar-confirmacao">Remover este cadastro pendente?</span>
              <button class="people-outline" type="button" @click="confirmandoRecusa = false">Cancelar</button>
              <button class="people-danger" type="button" :disabled="salvando" @click="emit('recusar')">Confirmar recusa</button>
            </template>
          </template>
          <button class="people-primary" type="button" data-test="confirmar" :disabled="!podeConfirmar" @click="confirmar">
            {{ salvando ? 'Salvando...' : modo === 'importar' ? 'Cadastrar e vincular' : 'Aprovar' }}
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.importar-papeis {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin: 12px 0;
  padding: 0;
  border: 0;
}

.importar-papeis legend {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
}

.importar-papel {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.importar-dados {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 8px 20px;
  margin: 0;
}

.importar-dados dt {
  color: var(--sgl-text-muted, #64748b);
  font-size: 13px;
  font-weight: 650;
}

.importar-dados dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.importar-acoes {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.importar-confirmacao {
  margin-right: auto;
  font-weight: 650;
}
</style>
