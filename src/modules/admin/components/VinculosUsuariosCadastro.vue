<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { LaboratorioCadastro, ProjetoCadastro, UsuarioPermissao } from '@/modules/admin/types/cadastros'
import { projetosService } from '@/modules/projetos/services/projetosService'
import { vinculosOperacionaisService, type VinculoOperacional } from '@/modules/admin/services/vinculosOperacionaisService'

const props = defineProps<{
  usuarios: UsuarioPermissao[]
  laboratorios: LaboratorioCadastro[]
  projetos: ProjetoCadastro[]
}>()
const usuarioId = ref('')
const usuario = computed(() => props.usuarios.find(u => u.id === usuarioId.value))
const laboratorioBaseId = ref('')
const laboratorioId = ref('')
const projetoId = ref('')
const sciId = ref('')
const atividadeId = ref('')
const nivel = ref<'LABORATORIO' | 'PROJETO' | 'SCI' | 'ATIVIDADE'>('LABORATORIO')
const scis = ref<Array<{id:string;nome:string}>>([])
const atividades = ref<Array<{id:string;nome:string;sciId:string}>>([])
const vinculos = ref<VinculoOperacional[]>([])
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')
const hoje = new Date().toLocaleDateString('en-CA')
const dataInicio = ref(hoje)
const observacao = ref('')

const laboratoriosValidos = computed(() => props.laboratorios.filter(l => l.ativo && l.unidadeId === usuario.value?.unidadeId))
const projetosValidos = computed(() => props.projetos.filter(p => p.ativo && p.laboratorioId === laboratorioId.value))
const scisValidos = computed(() => scis.value)
const atividadesValidas = computed(() => atividades.value.filter(a => !sciId.value || a.sciId === sciId.value))
const elegivel = computed(() => !!usuario.value && usuario.value.perfil !== 'ESTAGIARIO')

function mensagem(e: unknown): string {
  return e instanceof Error ? e.message : 'Falha ao processar operação.'
}
async function selecionarUsuario() {
  erro.value = ''
  sucesso.value = ''
  laboratorioBaseId.value = usuario.value?.laboratorioId || ''
  laboratorioId.value = ''
  projetoId.value = ''
  sciId.value = ''
  atividadeId.value = ''
  vinculos.value = []
  if (!usuarioId.value || !elegivel.value) return
  try { vinculos.value = await vinculosOperacionaisService.listar(usuarioId.value) }
  catch(e) { erro.value = mensagem(e) }
}
function selecionarLaboratorio() {
  projetoId.value = ''
  sciId.value = ''
  atividadeId.value = ''
  scis.value = []
  atividades.value = []
}
async function selecionarProjeto() {
  sciId.value = ''
  atividadeId.value = ''
  scis.value = []
  atividades.value = []
  if (!projetoId.value) return
  try {
    const [s, a] = await Promise.all([
      projetosService.listarScisPorProjeto(projetoId.value),
      projetosService.listarAtividadesPorProjeto(projetoId.value),
    ])
    scis.value = s.map(x => ({id:x.id,nome:x.nome}))
    atividades.value = a.map(x => ({id:x.id,nome:x.nome,sciId:x.sciId}))
  } catch(e) { erro.value = mensagem(e) }
}
function selecionarSci() { atividadeId.value = '' }
async function salvarBase() {
  if (!elegivel.value) return
  salvando.value = true
  erro.value = ''
  try {
    await vinculosOperacionaisService.atualizarBase(usuarioId.value, laboratorioBaseId.value || null)
    sucesso.value = 'Laboratório-base atualizado. Recarregue a sessão DEV do usuário para refletir a alteração.'
  } catch(e) { erro.value = mensagem(e) }
  finally { salvando.value = false }
}
async function vincular() {
  if (!elegivel.value || !laboratorioId.value || (nivel.value !== 'LABORATORIO' && !projetoId.value)
    || (nivel.value === 'SCI' && !sciId.value) || (nivel.value === 'ATIVIDADE' && !atividadeId.value)) {
    erro.value = 'Selecione o contexto obrigatório para o nível do vínculo.'
    return
  }
  salvando.value = true
  erro.value = ''
  try {
    await vinculosOperacionaisService.criar({
      usuarioId: usuarioId.value, laboratorioId: laboratorioId.value,
      projetoId: nivel.value === 'LABORATORIO' ? null : projetoId.value,
      sciId: nivel.value === 'SCI' ? sciId.value : nivel.value === 'ATIVIDADE'
        ? atividades.value.find(a => a.id === atividadeId.value)?.sciId || null : null,
      atividadeId: nivel.value === 'ATIVIDADE' ? atividadeId.value : null,
      dataInicio: dataInicio.value, dataFim: null, observacao: observacao.value || null,
    })
    vinculos.value = await vinculosOperacionaisService.listar(usuarioId.value)
    sucesso.value = 'Vínculo cadastrado.'
  } catch(e) { erro.value = mensagem(e) }
  finally { salvando.value = false }
}
async function encerrar(id:string) {
  salvando.value = true
  erro.value = ''
  try {
    await vinculosOperacionaisService.encerrar(id)
    vinculos.value = await vinculosOperacionaisService.listar(usuarioId.value)
    sucesso.value = 'Vínculo encerrado. Histórico preservado.'
  } catch(e) { erro.value = mensagem(e) }
  finally { salvando.value = false }
}
watch(() => props.usuarios, () => {
  if (usuario.value && usuario.value.perfil !== 'ESTAGIARIO' && !laboratorioBaseId.value) {
    laboratorioBaseId.value = usuario.value.laboratorioId || ''
  }
})
</script>

<template>
  <section class="vinculos-adm">
    <header class="vinculos-adm__header">
      <h3>Vínculos operacionais dos usuários</h3>
      <p>Vincule usuários de teste a laboratórios, projetos, SCIs e atividades. O laboratório-base continua independente dos demais vínculos.</p>
    </header>
    <label class="field">
      <span>Usuário</span>
      <select v-model="usuarioId" @change="selecionarUsuario">
        <option value="">Selecione um usuário</option>
        <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.nome }} — {{ u.perfil }}</option>
      </select>
    </label>
    <p v-if="usuario?.perfil === 'ESTAGIARIO'">Estagiários são vinculados pelo fluxo de Estágios e Participações em Atividades.</p>
    <template v-if="elegivel">
      <div class="vinculos-adm__form">
        <label class="field">
          <span>Laboratório-base</span>
          <select v-model="laboratorioBaseId">
            <option value="">Sem laboratório-base</option>
            <option v-for="lab in laboratoriosValidos" :key="lab.id" :value="lab.id">{{ lab.nome }}</option>
          </select>
        </label>
        <button class="btn btn--primary" type="button" :disabled="salvando" @click="salvarBase">Salvar laboratório-base</button>
      </div>
      <h4>Adicionar vínculo</h4>
      <div class="vinculos-adm__form">
        <label class="field"><span>Nível</span>
          <select v-model="nivel" @change="selecionarLaboratorio">
            <option value="LABORATORIO">Laboratório</option>
            <option value="PROJETO">Projeto</option>
            <option value="SCI">SCI</option>
            <option value="ATIVIDADE">Atividade</option>
          </select>
        </label>
        <label class="field"><span>Laboratório</span>
          <select v-model="laboratorioId" @change="selecionarLaboratorio">
            <option value="">Selecione</option>
            <option v-for="lab in laboratoriosValidos" :key="lab.id" :value="lab.id">{{ lab.nome }}</option>
          </select>
        </label>
        <label v-if="nivel !== 'LABORATORIO'" class="field"><span>Projeto</span>
          <select v-model="projetoId" @change="selecionarProjeto">
            <option value="">Selecione</option>
            <option v-for="p in projetosValidos" :key="p.id" :value="p.id">{{ p.nome }}</option>
          </select>
        </label>
        <label v-if="nivel === 'SCI' || nivel === 'ATIVIDADE'" class="field"><span>SCI</span>
          <select v-model="sciId" @change="selecionarSci">
            <option value="">Selecione</option>
            <option v-for="s in scisValidos" :key="s.id" :value="s.id">{{ s.nome }}</option>
          </select>
        </label>
        <label v-if="nivel === 'ATIVIDADE'" class="field"><span>Atividade</span>
          <select v-model="atividadeId">
            <option value="">Selecione</option>
            <option v-for="a in atividadesValidas" :key="a.id" :value="a.id">{{ a.nome }}</option>
          </select>
        </label>
        <label class="field"><span>Início do vínculo</span><input v-model="dataInicio" type="date" /></label>
        <label class="field"><span>Observação</span><input v-model="observacao" placeholder="Justificativa / referência" /></label>
        <button class="btn btn--primary" type="button" :disabled="salvando" @click="vincular">Adicionar vínculo</button>
      </div>
      <h4>Vínculos cadastrados</h4>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Contexto</th><th>Início</th><th>Fim</th><th></th></tr></thead>
          <tbody>
            <tr v-for="v in vinculos" :key="v.id">
              <td><strong>{{ v.atividadeNome || v.sciNome || v.projetoNome || v.laboratorioNome }}</strong><small>{{ v.laboratorioNome }}{{ v.projetoNome ? ' / ' + v.projetoNome : '' }}</small></td>
              <td>{{ v.dataInicio }}</td><td>{{ v.dataFim || 'Vigente' }}</td>
              <td><button type="button" :disabled="salvando || !!v.dataFim" @click="encerrar(v.id)">Encerrar</button></td>
            </tr>
            <tr v-if="!vinculos.length"><td colspan="4">Nenhum vínculo adicional.</td></tr>
          </tbody>
        </table>
      </div>
    </template>
    <p v-if="erro" role="alert">{{ erro }}</p>
    <p v-if="sucesso" role="status">{{ sucesso }}</p>
    <small>Operação de homologação DEV/DEMO. A autorização institucional será integrada futuramente.</small>
  </section>
</template>

<style scoped>
.vinculos-adm { padding: 1.5rem 0; display:grid; gap:1rem }
.vinculos-adm__header p { opacity:.75; margin-top:.25rem }
.vinculos-adm__form { display:flex; flex-wrap:wrap; align-items:end; gap:1rem }
.vinculos-adm__form .field { min-width:190px; flex:1 }
.vinculos-adm__form button { min-height:40px }
</style>