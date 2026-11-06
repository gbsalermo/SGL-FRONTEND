<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { DadoEmbrapa } from '@/modules/admin/services/pessoasCorporativasService'
import type { LaboratorioCadastro } from '@/modules/admin/types/cadastros'
import { ehPerfilGestao, perfisConcedidosPor, ROTULOS_PERFIL } from '@/modules/auth/perfis'
import type { PerfilUsuario } from '@/modules/auth/types/session'
import LaboratoriosSelect from '@/modules/operacao/components/LaboratoriosSelect.vue'
import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'
import { useSessionStore } from '@/stores/session'

const props = defineProps<{
  modo: 'importar' | 'aprovar'
  nome: string
  dados: DadoEmbrapa[]
  perfilSugerido: PerfilUsuario | null
  laboratorios: LaboratorioCadastro[]
  salvando: boolean
  erro: string
}>()

const emit = defineEmits<{
  fechar: []
  confirmar: [payload: { perfil: PerfilUsuario; laboratorioIds: string[] }]
  recusar: []
}>()

const session = useSessionStore()

const perfisDisponiveis = computed(() => perfisConcedidosPor(session.usuario?.perfil))
const laboratoriosAtivos = computed<LaboratorioResumo[]>(() =>
  props.laboratorios.filter((lab) => lab.ativo).map(({ id, nome, ativo }) => ({ id, nome, ativo })))

const laboratorioIds = ref<string[]>([])
const perfil = ref<PerfilUsuario | ''>('')
const confirmandoRecusa = ref(false)

// The suggestion is only a starting point and is dropped when the session cannot grant it.
watch(() => [props.perfilSugerido, perfisDisponiveis.value] as const, ([sugerido, disponiveis]) => {
  perfil.value = sugerido && disponiveis.includes(sugerido) ? sugerido : ''
}, { immediate: true })

// Management profiles act on the whole Unidade, so only operational ones need a laboratory.
const exigeLaboratorio = computed(() => !ehPerfilGestao(perfil.value || null))
const podeConfirmar = computed(() =>
  Boolean(perfil.value) && (!exigeLaboratorio.value || laboratorioIds.value.length > 0) && !props.salvando)

function confirmar() {
  if (!perfil.value || !podeConfirmar.value) return
  emit('confirmar', { perfil: perfil.value, laboratorioIds: laboratorioIds.value })
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
            <label class="people-field"><span>Perfil *</span>
              <select v-model="perfil" required data-test="perfil">
                <option value="" disabled>Selecione</option>
                <option v-for="p in perfisDisponiveis" :key="p" :value="p">{{ ROTULOS_PERFIL[p] }}</option>
              </select>
            </label>
          </div>
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
