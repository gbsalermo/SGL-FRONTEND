<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import UsuarioTesteCard from '@/modules/auth/components/UsuarioTesteCard.vue'
import { destinoAposLogin } from '@/modules/auth/destinoAposLogin'
import { mensagemDeErroDeLogin } from '@/modules/auth/loginErrors'
import { ROTULOS_PERFIL } from '@/modules/auth/perfis'
import { buscarUsuariosDeTeste, carregarResumoDeTeste } from '@/modules/auth/services/devLoginService'
import type { ResumoDeTeste, UsuarioDeTeste } from '@/modules/auth/types/devLogin'
import type { PerfilUsuario } from '@/modules/auth/types/session'
import { useSessionStore } from '@/stores/session'

const ATRASO_DA_BUSCA_MS = 300

const router = useRouter()
const session = useSessionStore()

const PERFIS = Object.keys(ROTULOS_PERFIL) as PerfilUsuario[]

const perfil = ref<PerfilUsuario | null>(null)
const unidadeId = ref('')
const busca = ref('')

const resumo = ref<ResumoDeTeste | null>(null)
const usuarios = ref<UsuarioDeTeste[]>([])
const carregando = ref(true)
const erro = ref('')
const erroAoEntrar = ref('')
const entrando = ref(false)

// Filters can change faster than the API answers; only the latest request may update the list.
let ultimaBusca = 0
let temporizadorDaBusca: ReturnType<typeof setTimeout> | undefined

const totalGeral = computed(() =>
  resumo.value ? PERFIS.reduce((soma, p) => soma + (resumo.value?.contagemPorPerfil[p] ?? 0), 0) : null,
)

const resumoDoFiltro = computed(() => {
  const rotuloPerfil = perfil.value ? ROTULOS_PERFIL[perfil.value] : 'Todos'
  const sigla = resumo.value?.unidades.find((unidade) => unidade.id === unidadeId.value)?.sigla
  const quantidade = usuarios.value.length
  return `${rotuloPerfil} · ${sigla ?? 'Todas as unidades'} · ${quantidade} ${quantidade === 1 ? 'usuário' : 'usuários'}`
})

async function carregarUsuarios() {
  const minhaBusca = ++ultimaBusca
  carregando.value = true
  erro.value = ''

  try {
    const resultado = await buscarUsuariosDeTeste({
      perfil: perfil.value,
      unidadeId: unidadeId.value || null,
      busca: busca.value,
    })
    if (minhaBusca === ultimaBusca) usuarios.value = resultado
  } catch {
    if (minhaBusca === ultimaBusca) erro.value = 'Não foi possível carregar os usuários de teste.'
  } finally {
    if (minhaBusca === ultimaBusca) carregando.value = false
  }
}

async function carregarResumo() {
  try {
    resumo.value = await carregarResumoDeTeste(unidadeId.value || null)
  } catch {
    // Counts are a convenience: the list still works without them, so the page does not fail here.
  }
}

function carregarTudo() {
  void carregarResumo()
  void carregarUsuarios()
}

function selecionarPerfil(novoPerfil: PerfilUsuario | null) {
  if (perfil.value === novoPerfil) return
  perfil.value = novoPerfil
  void carregarUsuarios()
}

function trocarUnidade() {
  // The per-profile counts are scoped to the unit, so they are refreshed together with the list.
  carregarTudo()
}

watch(busca, () => {
  clearTimeout(temporizadorDaBusca)
  temporizadorDaBusca = setTimeout(() => void carregarUsuarios(), ATRASO_DA_BUSCA_MS)
})

async function entrar(login: string) {
  if (entrando.value) return
  entrando.value = true
  erroAoEntrar.value = ''

  try {
    const usuario = await session.entrarComoTeste(login)
    await router.replace(destinoAposLogin(usuario))
  } catch (error) {
    erroAoEntrar.value = mensagemDeErroDeLogin(error)
  } finally {
    entrando.value = false
  }
}

onMounted(carregarTudo)

onBeforeUnmount(() => clearTimeout(temporizadorDaBusca))
</script>

<template>
  <div class="login-teste">
    <header class="login-teste__topo">
      <div class="login-teste__marca">
        <strong>SGL</strong>
        <span class="login-teste__pilula">⚠ Modo desenvolvimento · somente local</span>
      </div>
      <router-link to="/login" class="login-teste__voltar">← Voltar ao login corporativo</router-link>
    </header>

    <div class="login-teste__corpo">
      <aside class="login-teste__filtros" aria-label="Filtros">
        <p class="login-teste__rotulo-secao">Perfil</p>
        <ul class="login-teste__perfis">
          <li>
            <button
              type="button"
              class="login-teste__perfil"
              :class="{ 'login-teste__perfil--ativo': perfil === null }"
              :aria-pressed="perfil === null"
              data-test="perfil-TODOS"
              @click="selecionarPerfil(null)"
            >
              <span>Todos</span>
              <span v-if="totalGeral !== null" class="login-teste__contagem">{{ totalGeral }}</span>
            </button>
          </li>
          <li v-for="item in PERFIS" :key="item">
            <button
              type="button"
              class="login-teste__perfil"
              :class="{ 'login-teste__perfil--ativo': perfil === item }"
              :aria-pressed="perfil === item"
              :data-test="`perfil-${item}`"
              @click="selecionarPerfil(item)"
            >
              <span>{{ ROTULOS_PERFIL[item] }}</span>
              <span v-if="resumo" class="login-teste__contagem">{{ resumo.contagemPorPerfil[item] ?? 0 }}</span>
            </button>
          </li>
        </ul>

        <label class="login-teste__campo-unidade" for="login-teste-unidade">
          <span>Unidade</span>
          <select id="login-teste-unidade" v-model="unidadeId" data-test="unidade" @change="trocarUnidade">
            <option value="">Todas as unidades</option>
            <option v-for="unidade in resumo?.unidades ?? []" :key="unidade.id" :value="unidade.id">
              {{ unidade.sigla }}
            </option>
          </select>
        </label>
      </aside>

      <main class="login-teste__principal">
        <div class="login-teste__cabecalho">
          <div>
            <h1>Entrar como usuário de teste</h1>
            <p class="login-teste__resumo">{{ resumoDoFiltro }}</p>
          </div>

          <div class="login-teste__busca">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              v-model="busca"
              type="search"
              data-test="busca"
              aria-label="Buscar por nome ou login"
              placeholder="Buscar por nome ou login..."
            />
          </div>
        </div>

        <p v-if="erroAoEntrar" class="login-teste__alerta" role="alert">{{ erroAoEntrar }}</p>

        <div v-if="erro" class="login-teste__estado login-teste__estado--erro" data-test="erro" role="alert">
          <p>{{ erro }}</p>
          <button type="button" class="login-teste__tentar" @click="carregarTudo">Tentar novamente</button>
        </div>

        <p v-else-if="carregando && usuarios.length === 0" class="login-teste__estado" data-test="carregando">
          Carregando usuários...
        </p>

        <p v-else-if="usuarios.length === 0" class="login-teste__estado" data-test="vazio">
          Nenhum usuário encontrado
        </p>

        <div v-else class="login-teste__grade" :aria-busy="carregando">
          <UsuarioTesteCard v-for="usuario in usuarios" :key="usuario.id" :usuario="usuario" @entrar="entrar" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.login-teste {
  /*
   * Same local tokens as LoginView: this page sits outside the authenticated layouts and must stay
   * light even when a dark preference was persisted by a previous session.
   */
  --sgl-primary: #1a4da1;
  --sgl-primary-dark: #0d2b5e;
  --sgl-primary-light: #2d6bc4;
  --sgl-background: #f5f7fa;
  --sgl-surface: #ffffff;
  --sgl-surface-elevated: #ffffff;
  --sgl-text: #1a1a2e;
  --sgl-text-muted: #64748b;
  --sgl-border: #e2e8f0;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--sgl-surface);
  color: var(--sgl-text);
  color-scheme: light;
}

.login-teste__topo {
  min-height: 72px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  padding: 12px 48px;
  border-bottom: 1px solid var(--sgl-border);
}

.login-teste__marca {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.login-teste__marca strong {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.login-teste__pilula {
  padding: 6px 12px;
  border: 1px solid #f5c66b;
  border-radius: 999px;
  background: #fff7e0;
  color: #8a5300;
  font-size: 13px;
  font-weight: 700;
}

.login-teste__voltar {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  padding: 0 20px;
  border: 1px solid #cbd5e1;
  border-radius: var(--sgl-radius-control, 6px);
  color: var(--sgl-primary);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: border-color var(--sgl-transition-fast, 180ms) ease;
}

.login-teste__voltar:hover {
  border-color: var(--sgl-primary);
}

.login-teste__voltar:focus-visible,
.login-teste__perfil:focus-visible,
.login-teste__tentar:focus-visible {
  outline: 3px solid rgb(45 107 196 / 28%);
  outline-offset: 2px;
}

.login-teste__corpo {
  flex: 1;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
}

.login-teste__filtros {
  padding: 40px 32px;
  border-right: 1px solid var(--sgl-border);
  background: var(--sgl-background);
}

.login-teste__rotulo-secao {
  margin: 0 0 16px;
  color: var(--sgl-text-muted);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-teste__perfis {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 36px;
  padding: 0;
  list-style: none;
}

.login-teste__perfil {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--sgl-text);
  font-size: 15px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: background var(--sgl-transition-fast, 180ms) ease;
}

.login-teste__perfil:hover {
  background: rgb(26 77 161 / 7%);
}

.login-teste__perfil--ativo,
.login-teste__perfil--ativo:hover {
  background: var(--sgl-primary);
  color: #fff;
}

.login-teste__contagem {
  color: var(--sgl-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.login-teste__perfil--ativo .login-teste__contagem {
  color: rgb(255 255 255 / 85%);
}

.login-teste__campo-unidade {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 15px;
  font-weight: 700;
}

.login-teste__campo-unidade select {
  min-height: 52px;
  padding: 0 40px 0 14px;
  border: 1px solid var(--sgl-border);
  border-radius: var(--sgl-radius-control, 6px);
  /* The global reset strips the native arrow, so the chevron is drawn here. */
  appearance: none;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center / 18px;
  color: var(--sgl-text);
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
}

.login-teste__campo-unidade select:focus,
.login-teste__busca:focus-within {
  border-color: var(--sgl-primary);
  box-shadow: 0 0 0 3px rgb(26 77 161 / 11%);
  outline: 0;
}

.login-teste__principal {
  min-width: 0;
  padding: 40px 48px 56px;
}

.login-teste__cabecalho {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px 32px;
  margin-bottom: 28px;
}

.login-teste__cabecalho h1 {
  margin: 0;
  font-size: clamp(24px, 2.2vw, 30px);
  font-weight: 750;
  letter-spacing: -0.02em;
}

.login-teste__resumo {
  margin: 8px 0 0;
  color: var(--sgl-text-muted);
  font-size: 16px;
}

.login-teste__busca {
  width: min(100%, 380px);
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border: 1px solid var(--sgl-border);
  border-radius: var(--sgl-radius-control, 6px);
  background: #fff;
}

.login-teste__busca svg {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--sgl-text-muted);
  stroke-width: 1.8;
  stroke-linecap: round;
}

.login-teste__busca input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--sgl-text);
  font-size: 15px;
}

.login-teste__alerta {
  margin: 0 0 20px;
  padding: 12px 14px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fff1f1;
  color: #b42318;
  font-size: 14px;
}

.login-teste__grade {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.login-teste__grade[aria-busy='true'] {
  opacity: 0.6;
}

.login-teste__estado {
  margin: 0;
  padding: 56px 24px;
  border: 1px dashed var(--sgl-border);
  border-radius: 10px;
  color: var(--sgl-text-muted);
  font-size: 15px;
  text-align: center;
}

.login-teste__estado--erro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border-color: #fecaca;
  color: #b42318;
}

.login-teste__estado--erro p {
  margin: 0;
}

.login-teste__tentar {
  min-height: 42px;
  padding: 0 20px;
  border: 0;
  border-radius: var(--sgl-radius-control, 6px);
  background: var(--sgl-primary);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1280px) {
  .login-teste__grade {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Narrow screens: the filter column moves above the list instead of squeezing it. */
@media (max-width: 900px) {
  .login-teste__topo {
    padding-inline: 16px;
  }

  .login-teste__corpo {
    grid-template-columns: 1fr;
  }

  .login-teste__filtros {
    padding: 24px 16px;
    border-right: 0;
    border-bottom: 1px solid var(--sgl-border);
  }

  .login-teste__perfis {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    margin-bottom: 24px;
  }

  .login-teste__principal {
    padding: 28px 16px 40px;
  }

  .login-teste__busca {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .login-teste__grade {
    grid-template-columns: 1fr;
  }
}
</style>
