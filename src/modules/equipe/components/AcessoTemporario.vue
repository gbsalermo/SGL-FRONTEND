<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import type { VinculoOperacional } from '@/modules/admin/services/vinculosOperacionaisService'
import type { UsuarioPermissao } from '@/modules/admin/types/cadastros'
import { ehEstagiario } from '@/modules/auth/papeis'
import { projetosService } from '@/modules/projetos/services/projetosService'
import type { ProjetoOperacional } from '@/modules/projetos/types/projetos'
import { useSessionStore } from '@/stores/session'

import { equipeService } from '../equipeService'
import { mensagemDeErro } from '../mensagemDeErro'

const props = defineProps<{ laboratorioId: string }>()
const emit = defineEmits<{ alterado: [] }>()

// Same rule as the API: access without a deadline belongs in the person's laboratory list.
const DICA_VINCULO_GENERICO = 'Sem data final, o acesso precisa ser restrito a um projeto, SCI ou atividade. '
  + 'Para acesso sem prazo ao laboratório inteiro, inclua a pessoa na equipe.'

const session = useSessionStore()
const vinculos = ref<VinculoOperacional[]>([])
const usuarios = ref<UsuarioPermissao[]>([])
const projetos = ref<ProjetoOperacional[]>([])
const scis = ref<Array<{ id: string; nome: string }>>([])
const atividades = ref<Array<{ id: string; nome: string; sciId: string }>>([])
const erro = ref('')
const sucesso = ref('')
const salvando = ref(false)
const encerrando = ref<VinculoOperacional | null>(null)

const hoje = new Date().toLocaleDateString('en-CA')
const usuarioId = ref('')
const projetoId = ref('')
const sciId = ref('')
const atividadeId = ref('')
const dataInicio = ref(hoje)
const dataFim = ref('')
const observacao = ref('')

const nomes = computed(() => new Map(usuarios.value.map((u) => [u.id, u.nome])))
// Interns use internship links, and nobody grants access to themselves (same rules as the API).
const pessoas = computed(() => usuarios.value
  .filter((u) => u.ativo && u.situacao !== 'PENDENTE_VINCULACAO' && !ehEstagiario(u) && u.id !== session.usuario?.id)
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')))
const projetosDoLaboratorio = computed(() => projetos.value
  .filter((p) => p.ativo && p.laboratorios.some((lab) => lab.id === props.laboratorioId)))
const atividadesDoSci = computed(() => atividades.value.filter((a) => !sciId.value || a.sciId === sciId.value))
const vinculoGenerico = computed(() => !projetoId.value && !dataFim.value)
const podeCriar = computed(() => Boolean(usuarioId.value && dataInicio.value) && !vinculoGenerico.value && !salvando.value)

type Situacao = 'Agendado' | 'Vigente' | 'Encerrado'
function situacao(v: VinculoOperacional): Situacao {
  if (v.encerrado || (v.dataFim && v.dataFim < hoje)) return 'Encerrado'
  return v.dataInicio > hoje ? 'Agendado' : 'Vigente'
}

const editando = ref<VinculoOperacional | null>(null)
const edicaoDataFim = ref('')
const edicaoObservacao = ref('')

function abrirEdicao(v: VinculoOperacional) {
  editando.value = v
  edicaoDataFim.value = v.dataFim ?? ''
  edicaoObservacao.value = v.observacao ?? ''
}

async function salvarEdicao() {
  const vinculo = editando.value
  if (!vinculo) return
  erro.value = ''
  try {
    await equipeService.editarVinculo(props.laboratorioId, vinculo.id, {
      dataFim: edicaoDataFim.value || null,
      observacao: edicaoObservacao.value.trim() || null,
    })
    sucesso.value = 'Acesso temporário atualizado.'
    editando.value = null
    await carregar()
    emit('alterado')
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível atualizar o acesso.')
  }
}

function data(valor: string | null) {
  if (!valor) return 'Sem data final'
  const [ano, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${ano}`
}

function contexto(v: VinculoOperacional) {
  return v.atividadeNome || v.sciNome || v.projetoNome || 'Laboratório inteiro'
}

async function carregar() {
  erro.value = ''
  try {
    const [lista, todos, todosProjetos] = await Promise.all([
      equipeService.listarVinculos(props.laboratorioId),
      cadastrosAdminService.listarUsuarios(),
      projetosService.listarProjetos(),
    ])
    vinculos.value = lista
    usuarios.value = todos
    projetos.value = todosProjetos
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível carregar os acessos temporários.')
  }
}

watch(projetoId, async (id) => {
  sciId.value = ''
  atividadeId.value = ''
  scis.value = []
  atividades.value = []
  if (!id) return
  try {
    const [s, a] = await Promise.all([projetosService.listarScisPorProjeto(id), projetosService.listarAtividadesPorProjeto(id)])
    scis.value = s.map((v) => ({ id: v.id, nome: v.nome }))
    atividades.value = a.map((v) => ({ id: v.id, nome: v.nome, sciId: v.sciId }))
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível carregar o projeto.')
  }
})

async function criar() {
  if (!podeCriar.value) return
  salvando.value = true
  erro.value = ''
  sucesso.value = ''
  try {
    await equipeService.criarVinculo(props.laboratorioId, {
      usuarioId: usuarioId.value,
      laboratorioId: props.laboratorioId,
      projetoId: projetoId.value || null,
      sciId: sciId.value || null,
      atividadeId: atividadeId.value || null,
      dataInicio: dataInicio.value,
      dataFim: dataFim.value || null,
      observacao: observacao.value.trim() || null,
    })
    sucesso.value = `Acesso temporário concedido a ${nomes.value.get(usuarioId.value) ?? 'esta pessoa'}.`
    usuarioId.value = ''
    projetoId.value = ''
    dataFim.value = ''
    observacao.value = ''
    await carregar()
    emit('alterado')
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível conceder o acesso.')
  } finally {
    salvando.value = false
  }
}

async function confirmarEncerramento() {
  const vinculo = encerrando.value
  if (!vinculo) return
  erro.value = ''
  try {
    await equipeService.encerrarVinculo(props.laboratorioId, vinculo.id)
    sucesso.value = 'Acesso temporário encerrado.'
    encerrando.value = null
    await carregar()
    emit('alterado')
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível encerrar o acesso.')
  }
}

watch(() => props.laboratorioId, carregar)
onMounted(carregar)
</script>

<template>
  <section class="people-section" aria-label="Acesso temporário">
    <p class="people-footnote">
      Dê acesso ao laboratório por um período, ou só a um projeto, SCI ou atividade dele. Estagiários usam o vínculo de estágio.
    </p>
    <div v-if="erro" class="people-feedback people-feedback--error" role="alert">{{ erro }}</div>
    <div v-if="sucesso" class="people-feedback people-feedback--success" role="status">{{ sucesso }}</div>

    <form class="people-inline-form" aria-label="Novo acesso temporário" @submit.prevent="criar">
      <div class="people-filter-grid">
        <label class="people-field"><span>Pessoa *</span>
          <select v-model="usuarioId" data-test="pessoa" required>
            <option value="" disabled>Selecione</option>
            <option v-for="pessoa in pessoas" :key="pessoa.id" :value="pessoa.id">{{ pessoa.nome }}</option>
          </select>
        </label>
        <label class="people-field"><span>Projeto (opcional)</span>
          <select v-model="projetoId" data-test="projeto">
            <option value="">Laboratório inteiro</option>
            <option v-for="projeto in projetosDoLaboratorio" :key="projeto.id" :value="projeto.id">{{ projeto.nome }}</option>
          </select>
        </label>
        <label v-if="projetoId" class="people-field"><span>SCI (opcional)</span>
          <select v-model="sciId">
            <option value="">Todo o projeto</option>
            <option v-for="sci in scis" :key="sci.id" :value="sci.id">{{ sci.nome }}</option>
          </select>
        </label>
        <label v-if="projetoId" class="people-field"><span>Atividade (opcional)</span>
          <select v-model="atividadeId">
            <option value="">Todas</option>
            <option v-for="atividade in atividadesDoSci" :key="atividade.id" :value="atividade.id">{{ atividade.nome }}</option>
          </select>
        </label>
        <label class="people-field"><span>Início *</span><input v-model="dataInicio" type="date" data-test="data-inicio" required></label>
        <label class="people-field"><span>Fim</span><input v-model="dataFim" type="date" data-test="data-fim" :min="dataInicio"></label>
        <label class="people-field"><span>Observação</span><input v-model="observacao" type="text" maxlength="500"></label>
      </div>
      <p v-if="vinculoGenerico" class="people-footnote">{{ DICA_VINCULO_GENERICO }}</p>
      <button type="button" class="people-primary" data-test="criar" :disabled="!podeCriar" @click="criar">
        {{ salvando ? 'Salvando...' : 'Conceder acesso' }}
      </button>
    </form>

    <div v-if="encerrando" class="people-pending-message" role="alert">
      <p>Encerrar hoje o acesso de {{ nomes.get(encerrando.usuarioId) ?? 'esta pessoa' }}? O histórico é mantido.</p>
      <button type="button" class="people-outline" @click="encerrando = null">Cancelar</button>
      <button type="button" class="people-danger" data-test="confirmar-encerramento" @click="confirmarEncerramento">Encerrar</button>
    </div>

    <div v-if="editando" class="people-inline-form" aria-label="Editar acesso temporário">
      <p>Acesso de {{ nomes.get(editando.usuarioId) ?? 'esta pessoa' }}, a partir de {{ data(editando.dataInicio) }}</p>
      <div class="people-filter-grid">
        <label class="people-field"><span>Fim</span>
          <input v-model="edicaoDataFim" type="date" data-test="editar-data-fim" :min="editando.dataInicio">
        </label>
        <label class="people-field"><span>Observação</span>
          <input v-model="edicaoObservacao" type="text" maxlength="500" data-test="editar-observacao">
        </label>
      </div>
      <button type="button" class="people-outline" @click="editando = null">Cancelar</button>
      <button type="button" class="people-primary" data-test="salvar-edicao" @click="salvarEdicao">Salvar</button>
    </div>

    <div v-if="vinculos.length === 0" class="people-empty">Nenhum acesso temporário neste laboratório.</div>
    <div v-else class="people-table-wrap">
      <table class="people-table">
        <thead><tr><th>Pessoa</th><th>Onde</th><th>Período</th><th>Situação</th><th /></tr></thead>
        <tbody>
          <tr v-for="vinculo in vinculos" :key="vinculo.id">
            <td><strong>{{ nomes.get(vinculo.usuarioId) ?? '—' }}</strong><small>{{ vinculo.observacao || '' }}</small></td>
            <td>{{ contexto(vinculo) }}</td>
            <td>{{ data(vinculo.dataInicio) }} a {{ data(vinculo.dataFim) }}</td>
            <td>{{ situacao(vinculo) }}</td>
            <td>
              <button
                v-if="situacao(vinculo) !== 'Encerrado'"
                type="button"
                class="people-outline"
                :data-test="`editar-${vinculo.id}`"
                @click="abrirEdicao(vinculo)"
              >
                Editar
              </button>
              <button
                v-if="situacao(vinculo) !== 'Encerrado'"
                type="button"
                class="people-danger-outline"
                :data-test="`encerrar-${vinculo.id}`"
                @click="encerrando = vinculo"
              >
                Encerrar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
