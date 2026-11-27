<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import type { UsuarioPermissao } from '@/modules/admin/types/cadastros'
import PapeisBadge from '@/components/PapeisBadge.vue'
import { useSessionStore } from '@/stores/session'

import { equipeService } from '../equipeService'
import { mensagemDeErro } from '../mensagemDeErro'
import type { MembroEquipe } from '../types'

const props = defineProps<{ laboratorioId: string }>()
const emit = defineEmits<{ alterada: [] }>()

const session = useSessionStore()
const membros = ref<MembroEquipe[]>([])
const carregando = ref(false)
const erro = ref('')
const sucesso = ref('')
const retirando = ref<MembroEquipe | null>(null)
const incluindo = ref(false)
const usuarios = ref<UsuarioPermissao[]>([])
const buscaIncluir = ref('')

const candidatosParaIncluir = computed(() => {
  const naEquipe = new Set(membros.value.map((m) => m.usuarioId))
  const termo = buscaIncluir.value.trim().toLocaleLowerCase('pt-BR')
  return usuarios.value
    .filter((u) => u.ativo && u.situacao !== 'PENDENTE_VINCULACAO' && !naEquipe.has(u.id))
    .filter((u) => !termo || u.nome.toLocaleLowerCase('pt-BR').includes(termo))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
})

function podeRetirar(membro: MembroEquipe) {
  return !membro.responsavel && membro.usuarioId !== session.usuario?.id
}

function acesso(membro: MembroEquipe) {
  if (membro.permanente) return 'Permanente'
  if (!membro.acessoTemporarioAte) return 'Temporário, sem data final'
  const [ano, mes, dia] = membro.acessoTemporarioAte.split('-')
  return `Temporário até ${dia}/${mes}/${ano}`
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    membros.value = await equipeService.listar(props.laboratorioId)
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível carregar a equipe.')
  } finally {
    carregando.value = false
  }
}

async function confirmarRetirada() {
  const membro = retirando.value
  if (!membro) return
  erro.value = ''
  try {
    await equipeService.retirar(props.laboratorioId, membro.usuarioId)
    sucesso.value = `${membro.nome} saiu da equipe.`
    retirando.value = null
    await carregar()
    emit('alterada')
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível retirar a pessoa.')
  }
}

async function abrirIncluir() {
  incluindo.value = true
  buscaIncluir.value = ''
  try {
    usuarios.value = await cadastrosAdminService.listarUsuarios()
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível carregar as pessoas da Unidade.')
  }
}

async function incluir(usuario: UsuarioPermissao) {
  erro.value = ''
  try {
    await equipeService.incluir(props.laboratorioId, usuario.id)
    sucesso.value = `${usuario.nome} entrou na equipe.`
    incluindo.value = false
    await carregar()
    emit('alterada')
  } catch (error) {
    erro.value = mensagemDeErro(error, 'Não foi possível incluir a pessoa.')
  }
}

watch(() => props.laboratorioId, () => {
  retirando.value = null
  incluindo.value = false
  sucesso.value = ''
  void carregar()
})
onMounted(carregar)
defineExpose({ carregar })
</script>

<template>
  <section class="people-section" aria-label="Equipe do laboratório">
    <div v-if="erro" class="people-feedback people-feedback--error" role="alert">{{ erro }}</div>
    <div v-if="sucesso" class="people-feedback people-feedback--success" role="status">{{ sucesso }}</div>

    <div class="equipe-acoes">
      <button type="button" class="people-outline" data-test="abrir-incluir" @click="abrirIncluir">
        Incluir pessoa já cadastrada
      </button>
    </div>

    <div v-if="incluindo" class="people-inline-form" aria-label="Incluir pessoa já cadastrada">
      <label class="people-field">
        <span>Buscar na Unidade</span>
        <input v-model="buscaIncluir" type="search" placeholder="Nome da pessoa">
      </label>
      <ul class="equipe-opcoes">
        <li v-for="usuario in candidatosParaIncluir" :key="usuario.id">
          <button type="button" class="people-link" data-test="opcao-incluir" @click="incluir(usuario)">{{ usuario.nome }}</button>
        </li>
        <li v-if="candidatosParaIncluir.length === 0" class="people-empty-inline">Ninguém fora da equipe com esse nome.</li>
      </ul>
      <button type="button" class="people-link" @click="incluindo = false">Fechar</button>
    </div>

    <div v-if="retirando" class="people-pending-message" role="alert">
      <p>Retirar {{ retirando.nome }} deste laboratório? Os acessos temporários da pessoa a ele também serão encerrados.</p>
      <button type="button" class="people-outline" @click="retirando = null">Cancelar</button>
      <button type="button" class="people-danger" data-test="confirmar-retirada" @click="confirmarRetirada">Retirar</button>
    </div>

    <div v-if="carregando" class="people-empty">Carregando equipe...</div>
    <div v-else-if="membros.length === 0" class="people-empty">Ninguém na equipe ainda.</div>
    <div v-else class="people-table-wrap">
      <table class="people-table">
        <thead><tr><th>Pessoa</th><th>Acesso no SGL</th><th>No laboratório</th><th /></tr></thead>
        <tbody>
          <tr v-for="membro in membros" :key="membro.usuarioId">
            <td>
              <strong>{{ membro.nome }}</strong>
              <span v-if="membro.responsavel" class="people-pill people-pill--vinculado">Responsável</span>
              <small>{{ membro.email || membro.cargo || '—' }}</small>
            </td>
            <td><PapeisBadge :usuario="membro" /></td>
            <td>{{ acesso(membro) }}</td>
            <td>
              <button
                v-if="podeRetirar(membro)"
                type="button"
                class="people-danger-outline"
                :data-test="`retirar-${membro.usuarioId}`"
                @click="retirando = membro"
              >
                Retirar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.equipe-acoes {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.equipe-opcoes {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  margin: 8px 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}
</style>
