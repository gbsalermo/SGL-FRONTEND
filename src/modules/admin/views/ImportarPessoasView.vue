<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import axios from 'axios'

import ImportarPessoaDrawer from '@/modules/admin/components/ImportarPessoaDrawer.vue'
import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import {
  buscarPessoas,
  importarPessoa,
  TERMO_MINIMO,
  type DadoEmbrapa,
  type PessoaCorporativa,
  type TipoPessoaCorporativa,
} from '@/modules/admin/services/pessoasCorporativasService'
import type { LaboratorioCadastro } from '@/modules/admin/types/cadastros'
import type { PerfilUsuario } from '@/modules/auth/types/session'
import { useSessionStore } from '@/stores/session'

const ATRASO_BUSCA_MS = 400

const session = useSessionStore()

const tipo = ref<TipoPessoaCorporativa>('EMPREGADO')
const termo = ref('')
const soNaoCadastrados = ref(false)
const resultados = ref<PessoaCorporativa[]>([])
const buscando = ref(false)
const erro = ref('')
const sucesso = ref('')
const laboratorios = ref<LaboratorioCadastro[]>([])

const selecionada = ref<PessoaCorporativa | null>(null)
const salvando = ref(false)
const erroDrawer = ref('')

const unidadeEmOperacao = computed(() => session.unidadeOperacaoRotulo ?? session.usuario?.unidadeSigla ?? '—')
const lista = computed(() => soNaoCadastrados.value ? resultados.value.filter((p) => !p.jaCadastrado) : resultados.value)

let timer: ReturnType<typeof setTimeout> | null = null
// Guards against an older, slower answer overwriting the results of the latest search.
let buscaAtual = 0

function mensagem(e: unknown, padrao: string) {
  if (axios.isAxiosError(e)) return e.response?.data?.message ?? padrao
  return e instanceof Error ? e.message : padrao
}

async function buscar() {
  const texto = termo.value.trim()
  if (texto.length < TERMO_MINIMO) {
    resultados.value = []
    return
  }
  const id = ++buscaAtual
  buscando.value = true
  erro.value = ''
  try {
    const encontrados = await buscarPessoas(tipo.value, texto)
    if (id === buscaAtual) resultados.value = encontrados
  } catch (e) {
    if (id === buscaAtual) erro.value = mensagem(e, 'Não foi possível consultar as bases da Embrapa.')
  } finally {
    if (id === buscaAtual) buscando.value = false
  }
}

watch([termo, tipo], () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(buscar, ATRASO_BUSCA_MS)
})

onBeforeUnmount(() => { if (timer) clearTimeout(timer) })

onMounted(async () => {
  try {
    laboratorios.value = await cadastrosAdminService.listarLaboratorios()
  } catch (e) {
    erro.value = mensagem(e, 'Não foi possível carregar os laboratórios.')
  }
})

const dadosSelecionada = computed<DadoEmbrapa[]>(() => {
  const p = selecionada.value
  if (!p) return []
  return [
    { rotulo: p.tipo === 'EMPREGADO' ? 'Matrícula' : 'Vínculo', valor: p.tipo === 'EMPREGADO' ? p.matricula : 'Estagiário / bolsista' },
    { rotulo: 'E-mail', valor: p.email },
    { rotulo: 'Cargo', valor: p.cargo },
    { rotulo: 'Sublotação', valor: p.sublotacao },
    { rotulo: 'Unidade', valor: p.unidadeNome },
  ]
})

function abrir(pessoa: PessoaCorporativa) {
  erroDrawer.value = ''
  sucesso.value = ''
  selecionada.value = pessoa
}

async function cadastrar(payload: { perfil: PerfilUsuario; laboratorioBaseId: string }) {
  const pessoa = selecionada.value
  if (!pessoa) return
  salvando.value = true
  erroDrawer.value = ''
  try {
    await importarPessoa({ tipo: pessoa.tipo, referencia: pessoa.referencia, ...payload })
    pessoa.jaCadastrado = true
    pessoa.situacao = 'ATIVO'
    sucesso.value = `${pessoa.nome} foi cadastrado(a) no SGL.`
    selecionada.value = null
  } catch (e) {
    erroDrawer.value = mensagem(e, 'Não foi possível cadastrar a pessoa.')
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <section class="admin-page people-management">
    <header class="page-header">
      <div>
        <p class="eyebrow">ADMINISTRAÇÃO / CADASTROS / VÍNCULOS</p>
        <h1>Importar da Embrapa</h1>
        <span>Busque empregados e estagiários/bolsistas nas bases corporativas e cadastre-os já com laboratório e perfil.</span>
      </div>
      <RouterLink class="btn btn--ghost" to="/administracao/cadastros/vinculos">Voltar aos vínculos</RouterLink>
    </header>

    <div v-if="sucesso" class="people-feedback people-feedback--success" role="status">{{ sucesso }}</div>
    <div v-if="erro" class="people-feedback people-feedback--error" role="alert">{{ erro }}</div>

    <section class="people-workspace">
      <div class="people-tabs" role="tablist">
        <button type="button" role="tab" :aria-selected="tipo === 'EMPREGADO'" :class="{ active: tipo === 'EMPREGADO' }" @click="tipo = 'EMPREGADO'">Empregados</button>
        <button type="button" role="tab" :aria-selected="tipo === 'COLABORADOR'" :class="{ active: tipo === 'COLABORADOR' }" @click="tipo = 'COLABORADOR'">Estagiários / bolsistas</button>
      </div>

      <div class="people-filter-grid">
        <label class="people-field people-field--search"><span>Buscar por nome{{ tipo === 'EMPREGADO' ? ' ou matrícula' : '' }}</span>
          <input v-model="termo" type="search" :placeholder="`Digite ao menos ${TERMO_MINIMO} caracteres`" />
        </label>
        <div class="people-field"><span>Unidade</span><strong class="importar-unidade">{{ unidadeEmOperacao }}</strong></div>
        <label class="importar-check"><input v-model="soNaoCadastrados" type="checkbox" /> Só quem ainda não está no SGL</label>
      </div>

      <div v-if="buscando" class="people-empty">Consultando as bases da Embrapa...</div>
      <div v-else-if="termo.trim().length < TERMO_MINIMO" class="people-empty">Digite ao menos {{ TERMO_MINIMO }} caracteres para buscar.</div>
      <div v-else-if="lista.length === 0" class="people-empty">Nenhuma pessoa encontrada.</div>
      <div v-else class="people-table-wrap">
        <table class="people-table">
          <thead><tr><th>Nome</th><th>Cargo · Sublotação</th><th><span class="sr-only">Situação</span></th></tr></thead>
          <tbody>
            <tr v-for="p in lista" :key="p.tipo + p.referencia">
              <td><strong>{{ p.nome }}</strong><small v-if="p.matricula"> · {{ p.matricula }}</small></td>
              <td>{{ [p.cargo, p.sublotacao].filter(Boolean).join(' · ') || '—' }}</td>
              <td class="importar-situacao">
                <span v-if="p.jaCadastrado" class="importar-cadastrado" title="Já cadastrado no SGL" aria-label="Já cadastrado no SGL" role="img" />
                <button v-else type="button" class="people-outline" @click="abrir(p)">Importar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <ImportarPessoaDrawer
      v-if="selecionada"
      modo="importar"
      :nome="selecionada.nome"
      :dados="dadosSelecionada"
      :perfil-sugerido="selecionada.perfilSugerido"
      :laboratorios="laboratorios"
      :salvando="salvando"
      :erro="erroDrawer"
      @fechar="selecionada = null"
      @confirmar="cadastrar"
    />
  </section>
</template>

<style scoped>
.importar-unidade {
  padding: 10px 0;
}

.importar-check {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: end;
  padding-bottom: 12px;
  font-size: 14px;
}

.importar-situacao {
  width: 1%;
  text-align: right;
  white-space: nowrap;
}

.importar-cadastrado {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #16a34a;
  box-shadow: 0 0 0 3px rgb(22 163 74 / 18%);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
