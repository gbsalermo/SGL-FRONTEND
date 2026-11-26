<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import { ehAdmin } from '@/modules/auth/papeis'
import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'
import { useSessionStore } from '@/stores/session'

import AcessoTemporario from '../components/AcessoTemporario.vue'
import EquipeTabela from '../components/EquipeTabela.vue'
import PendentesAprovacao from '../components/PendentesAprovacao.vue'
import TrazerDaEmbrapa from '../components/TrazerDaEmbrapa.vue'
import { mensagemDeErro } from '../mensagemDeErro'

type Aba = 'EQUIPE' | 'PENDENTES' | 'EMBRAPA' | 'TEMPORARIO'
const ABAS: Array<{ id: Aba; rotulo: string }> = [
  { id: 'EQUIPE', rotulo: 'Equipe' },
  { id: 'PENDENTES', rotulo: 'Aguardando aprovação' },
  { id: 'EMBRAPA', rotulo: 'Trazer da Embrapa' },
  { id: 'TEMPORARIO', rotulo: 'Acesso temporário' },
]

const session = useSessionStore()
const laboratorios = ref<LaboratorioResumo[]>([])
const laboratorioId = ref('')
const aba = ref<Aba>('EQUIPE')
const erro = ref('')
const equipe = ref<InstanceType<typeof EquipeTabela> | null>(null)

const laboratorioAtual = computed(() => laboratorios.value.find((lab) => lab.id === laboratorioId.value))

// A responsável manages the laboratories they are responsible for; an administrator, any active one of the Unidade.
async function carregarLaboratorios() {
  try {
    if (ehAdmin(session.usuario)) {
      const todos = await cadastrosAdminService.listarLaboratorios()
      laboratorios.value = todos.filter((lab) => lab.ativo).map(({ id, nome, ativo }) => ({ id, nome, ativo }))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    } else {
      laboratorios.value = [...(session.usuario?.responsavelPor ?? [])]
    }
    laboratorioId.value = laboratorios.value[0]?.id ?? ''
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível carregar os laboratórios.')
  }
}

function equipeMudou() {
  void equipe.value?.carregar()
}

onMounted(carregarLaboratorios)
</script>

<template>
  <section class="people-management meu-laboratorio" aria-labelledby="titulo-meu-laboratorio">
    <header class="meu-laboratorio__cabecalho">
      <div>
        <span class="people-eyebrow">EQUIPE DO LABORATÓRIO</span>
        <h1 id="titulo-meu-laboratorio">{{ laboratorioAtual?.nome ?? 'Meu laboratório' }}</h1>
        <p>Organize quem faz parte do laboratório: aprove quem chega, cadastre pessoas da Embrapa, retire quem saiu e dê acessos temporários.</p>
      </div>
      <label v-if="laboratorios.length > 1" class="people-field">
        <span>Laboratório</span>
        <select v-model="laboratorioId" data-test="laboratorio">
          <option v-for="lab in laboratorios" :key="lab.id" :value="lab.id">{{ lab.nome }}</option>
        </select>
      </label>
      <select v-else-if="laboratorios.length === 1" v-model="laboratorioId" data-test="laboratorio" hidden>
        <option :value="laboratorios[0].id">{{ laboratorios[0].nome }}</option>
      </select>
    </header>

    <div v-if="erro" class="people-feedback people-feedback--error" role="alert">{{ erro }}</div>
    <div v-else-if="laboratorios.length === 0" class="people-empty">Você não é responsável por nenhum laboratório ativo.</div>

    <template v-else-if="laboratorioId">
      <div class="people-tabs" role="tablist" aria-label="Organização da equipe">
        <button
          v-for="item in ABAS"
          :key="item.id"
          type="button"
          role="tab"
          :aria-selected="aba === item.id"
          :class="{ active: aba === item.id }"
          @click="aba = item.id"
        >
          {{ item.rotulo }}
        </button>
      </div>

      <EquipeTabela v-show="aba === 'EQUIPE'" ref="equipe" :laboratorio-id="laboratorioId" />
      <PendentesAprovacao v-if="aba === 'PENDENTES'" :laboratorio-id="laboratorioId" @aprovado="equipeMudou" />
      <TrazerDaEmbrapa v-if="aba === 'EMBRAPA'" :laboratorio-id="laboratorioId" @cadastradas="equipeMudou" />
      <AcessoTemporario v-if="aba === 'TEMPORARIO'" :laboratorio-id="laboratorioId" @alterado="equipeMudou" />
    </template>
  </section>
</template>

<style scoped>
.meu-laboratorio {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meu-laboratorio__cabecalho {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  align-items: flex-end;
  justify-content: space-between;
}

.meu-laboratorio__cabecalho h1 {
  margin: 4px 0;
}

.meu-laboratorio__cabecalho p {
  max-width: 68ch;
  margin: 0;
  color: var(--sgl-text-muted, #64748b);
}
</style>
