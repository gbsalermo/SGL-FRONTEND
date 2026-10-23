<script setup lang="ts">
import { computed } from 'vue'
import type {
  ContextoParticipacaoOperacional,
  OpcoesSelecaoContexto,
} from '@/modules/operacao/types/contextoOperacional'

const props = defineProps<{
  opcoes: OpcoesSelecaoContexto
  modelValue: string
  carregando: boolean
  erro?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [valor: string]
}>()

const selecionado = computed<ContextoParticipacaoOperacional | undefined>(() =>
  props.opcoes.contextosElegiveis.find(x => x.participacaoId === props.modelValue),
)

function selecionar(evento: Event) {
  emit('update:modelValue', (evento.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="seletor-participacao">
    <label class="seletor-participacao__campo" for="participacao-operacional">
      <span>Participação / Atividade <small>(obrigatório)</small></span>
      <select
        id="participacao-operacional"
        :value="modelValue"
        :disabled="carregando || opcoes.situacao === 'SEM_CONTEXTO_ELEGIVEL'"
        required
        @change="selecionar"
      >
        <option value="">Selecione uma participação elegível</option>
        <option
          v-for="contexto in opcoes.contextosElegiveis"
          :key="contexto.participacaoId"
          :value="contexto.participacaoId"
        >
          {{ contexto.atividadeNome || 'Atividade' }} — {{ contexto.projetoNome || 'Projeto' }} · {{ contexto.laboratorioNome || 'Laboratório' }}
        </option>
      </select>
    </label>
    <p v-if="carregando" class="seletor-participacao__ajuda">Consultando participações e sua elegibilidade...</p>
    <p v-else-if="erro" role="alert" class="seletor-participacao__erro">{{ erro }}</p>
    <p v-else-if="opcoes.situacao === 'SEM_CONTEXTO_ELEGIVEL'" role="status" class="seletor-participacao__ajuda">
      Nenhuma participação está elegível para novas solicitações. Verifique com a gestão o vínculo de estágio, as datas e a situação da Atividade.
    </p>
    <p v-else-if="opcoes.situacao === 'ESCOLHA_OBRIGATORIA' && !modelValue" class="seletor-participacao__ajuda">
      Você participa de mais de uma Atividade. Selecione a participação correspondente a esta solicitação, mesmo que as atividades pertençam ao mesmo Projeto.
    </p>

    <div v-if="selecionado" class="seletor-participacao__resumo" aria-label="Contexto derivado da participação">
      <div><span>Atividade</span><strong>{{ selecionado.atividadeNome || 'Não informada' }}</strong></div>
      <div><span>SCI</span><strong>{{ selecionado.sciNome || 'Não informado' }}</strong></div>
      <div><span>Projeto</span><strong>{{ selecionado.projetoNome || 'Não informado' }}</strong></div>
      <div><span>Laboratório</span><strong>{{ selecionado.laboratorioNome || 'Não informado' }}</strong></div>
      <p>Esses dados são derivados da participação. O servidor os validará novamente ao registrar a solicitação.</p>
    </div>
  </div>
</template>

<style scoped>
.seletor-participacao { display: flex; flex-direction: column; gap: 12px; }
.seletor-participacao__campo { display: flex; flex-direction: column; gap: 7px; }
.seletor-participacao__campo > span { font-size: 13px; font-weight: 700; color: var(--sgl-text); }
.seletor-participacao__campo small { font-weight: 500; color: var(--sgl-text-muted); }
.seletor-participacao__campo select {
  width: 100%; min-height: 40px; padding: 0 12px; box-sizing: border-box;
  border: 1px solid var(--sgl-border-strong); border-radius: 6px;
  background: var(--sgl-surface); color: var(--sgl-text); font: inherit;
}
.seletor-participacao__campo select:focus-visible { outline: 2px solid var(--sgl-primary); outline-offset: 2px; }
.seletor-participacao__campo select:disabled { opacity: .7; cursor: not-allowed; }
.seletor-participacao__ajuda, .seletor-participacao__erro { margin: 0; font-size: 12px; line-height: 1.5; color: var(--sgl-text-muted); }
.seletor-participacao__erro { color: var(--sgl-error); }
.seletor-participacao__resumo {
  display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px;
  border: 1px solid var(--sgl-border); border-radius: 8px;
  background: var(--sgl-surface-soft); padding: 16px;
}
.seletor-participacao__resumo > div { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.seletor-participacao__resumo span { color: var(--sgl-text-muted); font-size: 12px; }
.seletor-participacao__resumo strong { color: var(--sgl-text); font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
.seletor-participacao__resumo p { margin: 0; grid-column: 1 / -1; color: var(--sgl-text-muted); font-size: 12px; }
@media (max-width: 650px) {
  .seletor-participacao__resumo { grid-template-columns: minmax(0,1fr); }
}
</style>
