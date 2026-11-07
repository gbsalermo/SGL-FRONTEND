<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import CargosSubstituirTable from '@/modules/admin/components/CargosSubstituirTable.vue'
import ImportarPessoaDrawer from '@/modules/admin/components/ImportarPessoaDrawer.vue'
import VinculosUsuariosCadastro from '@/modules/admin/components/VinculosUsuariosCadastro.vue'
import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import type { DadoEmbrapa } from '@/modules/admin/services/pessoasCorporativasService'
import { vinculosOperacionaisService } from '@/modules/admin/services/vinculosOperacionaisService'
import type { UsuarioPermissao, LaboratorioCadastro, ProjetoCadastro } from '@/modules/admin/types/cadastros'
import { ROTULOS_PERFIL } from '@/modules/auth/perfis'
import type { PerfilUsuario, UsuarioSessao } from '@/modules/auth/types/session'
const usuarios = ref<UsuarioPermissao[]>([])
const laboratorios = ref<LaboratorioCadastro[]>([])
const projetos = ref<ProjetoCadastro[]>([])
const pendentes = ref<UsuarioSessao[]>([])
type Aba = 'USUARIOS' | 'PENDENTES' | 'CARGOS'
// ?aba=PENDENTES (link "Aprovar" de Cadastros) abre direto na aba pedida; sem query, Usuários.
const abaInicial = String(useRoute().query.aba ?? '').toUpperCase()
const aba = ref<Aba>((['USUARIOS', 'PENDENTES', 'CARGOS'] as const).find((a) => a === abaInicial) ?? 'USUARIOS')
const erro = ref('')
const sucesso = ref('')
const carregando = ref(false)
const analisando = ref<UsuarioSessao | null>(null)
const salvando = ref(false)
const erroDrawer = ref('')
function mensagem(e: unknown, padrao: string) {
  return axios.isAxiosError(e) ? (e.response?.data?.message ?? padrao) : e instanceof Error ? e.message : padrao
}
async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const [u, l, p, pend] = await Promise.all([
      cadastrosAdminService.listarUsuarios(),
      cadastrosAdminService.listarLaboratorios(),
      cadastrosAdminService.listarProjetos(),
      vinculosOperacionaisService.listarPendentes(),
    ])
    usuarios.value = u
    laboratorios.value = l
    projetos.value = p
    pendentes.value = pend
  } catch(e) {
    erro.value = mensagem(e, 'Não foi possível carregar os cadastros.')
  } finally { carregando.value = false }
}
onMounted(carregar)
const dadosAnalisando = computed<DadoEmbrapa[]>(() => analisando.value ? [
  { rotulo: 'E-mail', valor: analisando.value.email },
  { rotulo: 'Unidade', valor: analisando.value.unidadeNome },
] : [])
function analisar(usuario: UsuarioSessao) {
  erroDrawer.value = ''
  sucesso.value = ''
  analisando.value = usuario
}
async function concluir(acao: () => Promise<unknown>, texto: string) {
  salvando.value = true
  erroDrawer.value = ''
  try {
    await acao()
    sucesso.value = texto
    analisando.value = null
    await carregar()
  } catch (e) {
    erroDrawer.value = mensagem(e, 'Não foi possível concluir a operação.')
  } finally { salvando.value = false }
}
function aprovar(payload: { perfil: PerfilUsuario; laboratorioIds: string[] }) {
  const alvo = analisando.value
  if (alvo) void concluir(() => vinculosOperacionaisService.aprovar(alvo.id, payload), `${alvo.nome} foi aprovado(a).`)
}
function recusar() {
  const alvo = analisando.value
  if (alvo) void concluir(() => vinculosOperacionaisService.recusar(alvo.id), `O cadastro pendente de ${alvo.nome} foi removido.`)
}
</script>
<template>
  <section class="admin-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">ADMINISTRAÇÃO / CADASTROS</p>
        <h1>Vínculos operacionais</h1>
        <span>Identifique usuários pendentes, consulte vínculos ativos e históricos e gerencie suas associações operacionais.</span>
      </div>
      <div class="vinculos-acoes">
        <RouterLink class="btn btn--primary" to="/administracao/cadastros/vinculos/importar">Importar da Embrapa</RouterLink>
        <button class="btn btn--ghost" type="button" :disabled="carregando" @click="carregar">Atualizar</button>
      </div>
    </header>
    <p v-if="erro" role="alert">{{ erro }}</p>
    <div class="people-management">
      <div v-if="sucesso" class="people-feedback people-feedback--success" role="status">{{ sucesso }}</div>
      <div class="people-tabs" role="tablist">
        <button type="button" role="tab" :aria-selected="aba === 'USUARIOS'" :class="{ active: aba === 'USUARIOS' }" @click="aba = 'USUARIOS'">Usuários</button>
        <button type="button" role="tab" :aria-selected="aba === 'PENDENTES'" :class="{ active: aba === 'PENDENTES' }" @click="aba = 'PENDENTES'">
          Pendentes <span v-if="pendentes.length" class="people-pill people-pill--pendente"><span class="people-dot" />{{ pendentes.length }} aguardando</span>
        </button>
        <button type="button" role="tab" :aria-selected="aba === 'CARGOS'" :class="{ active: aba === 'CARGOS' }" @click="aba = 'CARGOS'">Cargos a substituir</button>
      </div>
    </div>
    <p v-if="carregando">Carregando...</p>
    <VinculosUsuariosCadastro v-else-if="aba === 'USUARIOS'" :usuarios="usuarios" :laboratorios="laboratorios" :projetos="projetos" />
    <CargosSubstituirTable v-else-if="aba === 'CARGOS'" />
    <section v-else class="people-management people-workspace">
      <div v-if="pendentes.length === 0" class="people-empty">Nenhum acesso aguardando aprovação.</div>
      <div v-else class="people-table-wrap">
        <table class="people-table">
          <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil sugerido</th><th /></tr></thead>
          <tbody>
            <tr v-for="p in pendentes" :key="p.id">
              <td><strong>{{ p.nome }}</strong></td>
              <td>{{ p.email || '—' }}</td>
              <td>{{ ROTULOS_PERFIL[p.perfil] }}</td>
              <td><button type="button" class="people-outline" @click="analisar(p)">Analisar <span aria-hidden="true">→</span></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <ImportarPessoaDrawer
      v-if="analisando"
      modo="aprovar"
      :nome="analisando.nome"
      :dados="dadosAnalisando"
      :perfil-sugerido="analisando.perfil"
      :laboratorios="laboratorios"
      :salvando="salvando"
      :erro="erroDrawer"
      @fechar="analisando = null"
      @confirmar="aprovar"
      @recusar="recusar"
    />
  </section>
</template>
<style scoped>
.vinculos-acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
