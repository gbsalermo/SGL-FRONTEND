<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import logoSgl from '@/assets/images/auth/sgl-logo.png'
import { useProfilePreferencesStore } from '@/stores/profilePreferences'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()
const profilePreferences = useProfilePreferencesStore()

const configuracoesAbertas = ref(false)
const apelidoEdicao = ref('')
const descricaoEdicao = ref('')
const fotoEdicao = ref<string | null>(null)
const erroFoto = ref('')

const preferencias = computed(() => {
  const usuarioId = session.usuario?.id
  return usuarioId
    ? profilePreferences.obter(usuarioId)
    : { apelido: '', descricao: '', fotoDataUrl: null }
})

const nomeExibicao = computed(() =>
  preferencias.value.apelido || session.usuario?.nome || 'Usuário',
)

const iniciais = computed(() =>
  nomeExibicao.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join(''),
)

function abrirConfiguracoes() {
  apelidoEdicao.value = preferencias.value.apelido
  descricaoEdicao.value = preferencias.value.descricao
  fotoEdicao.value = preferencias.value.fotoDataUrl
  erroFoto.value = ''
  configuracoesAbertas.value = true
}

function fecharConfiguracoes() {
  configuracoesAbertas.value = false
  erroFoto.value = ''
}

function selecionarFoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (!file.type.startsWith('image/')) {
    erroFoto.value = 'Selecione um arquivo de imagem.'
    input.value = ''
    return
  }

  if (file.size > 1024 * 1024) {
    erroFoto.value = 'A imagem deve ter no máximo 1 MB nesta etapa.'
    input.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    fotoEdicao.value = typeof reader.result === 'string' ? reader.result : null
    erroFoto.value = ''
  }
  reader.onerror = () => {
    erroFoto.value = 'Não foi possível carregar a imagem.'
  }
  reader.readAsDataURL(file)
}

function salvarConfiguracoes() {
  const usuarioId = session.usuario?.id
  if (!usuarioId) return

  profilePreferences.salvar(usuarioId, {
    apelido: apelidoEdicao.value.slice(0, 40),
    descricao: descricaoEdicao.value.slice(0, 160),
    fotoDataUrl: fotoEdicao.value,
  })

  fecharConfiguracoes()
}

function sair() {
  session.sair()
  router.replace('/login')
}
</script>

<template>
  <div class="solicitante-shell">
    <aside class="solicitante-sidebar">
      <div class="solicitante-sidebar__brand">
        <img :src="logoSgl" alt="SGL — Sistema de Gestão de Laboratórios" />
      </div>

      <nav class="solicitante-nav" aria-label="Navegação principal">
        <p class="solicitante-nav__group">PRINCIPAL</p>

        <router-link class="solicitante-nav__item" to="/meus-pedidos">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4h14v16H5z" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
          <span>Meus pedidos</span>
        </router-link>

        <p class="solicitante-nav__group solicitante-nav__group--spaced">SOLICITAÇÕES</p>

        <router-link class="solicitante-nav__item" to="/pedidos/novo">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Novo pedido</span>
        </router-link>
      </nav>

      <div class="solicitante-sidebar__user">
        <div class="solicitante-avatar">
          <img v-if="preferencias.fotoDataUrl" :src="preferencias.fotoDataUrl" alt="Foto de perfil" />
          <span v-else>{{ iniciais }}</span>
        </div>

        <div class="solicitante-usercopy">
          <strong>{{ nomeExibicao }}</strong>
          <span>{{ session.usuario?.email }}</span>
          <small>{{ session.usuario?.perfil }}</small>
        </div>

        <button
          class="solicitante-user-settings"
          type="button"
          title="Configurar perfil"
          aria-label="Configurar perfil"
          @click="abrirConfiguracoes"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.13.37.34.7.6 1 .3.28.68.42 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.7.6Z" />
          </svg>
        </button>
      </div>
    </aside>

    <div class="solicitante-workspace">
      <header class="solicitante-topbar">
        <div class="solicitante-topbar__context">
          <strong>{{ session.usuario?.laboratorioNome ?? 'Laboratório não vinculado' }}</strong>
          <span>{{ session.usuario?.unidadeNome ?? 'Unidade não vinculada' }}</span>
        </div>

        <button class="solicitante-logout" type="button" @click="sair">
          <span>Sair</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />
          </svg>
        </button>
      </header>

      <main class="solicitante-main">
        <router-view />
      </main>
    </div>

    <div v-if="configuracoesAbertas" class="profile-backdrop" @click.self="fecharConfiguracoes">
      <section class="profile-dialog" role="dialog" aria-modal="true" aria-label="Configurações do perfil">
        <header>
          <div>
            <span>Perfil</span>
            <h2>Personalizar perfil</h2>
          </div>
          <button type="button" aria-label="Fechar" @click="fecharConfiguracoes">×</button>
        </header>

        <div class="profile-content">
          <div class="profile-photo-row">
            <div class="profile-photo-preview">
              <img v-if="fotoEdicao" :src="fotoEdicao" alt="Prévia da foto de perfil" />
              <span v-else>{{ iniciais }}</span>
            </div>

            <div>
              <label class="profile-upload">
                Escolher foto
                <input type="file" accept="image/*" @change="selecionarFoto" />
              </label>
              <button v-if="fotoEdicao" class="profile-remove-photo" type="button" @click="fotoEdicao = null">
                Remover foto
              </button>
              <small>PNG/JPG, até 1 MB.</small>
              <small v-if="erroFoto" class="profile-error">{{ erroFoto }}</small>
            </div>
          </div>

          <label class="profile-field">
            <span>Apelido / nome de exibição</span>
            <input v-model="apelidoEdicao" maxlength="40" :placeholder="session.usuario?.nome" />
            <small>{{ apelidoEdicao.length }}/40</small>
          </label>

          <label class="profile-field">
            <span>Descrição</span>
            <textarea
              v-model="descricaoEdicao"
              maxlength="160"
              rows="3"
              placeholder="Adicione uma breve descrição ao seu perfil..."
            />
            <small>{{ descricaoEdicao.length }}/160</small>
          </label>

          <div class="profile-essential">
            <p>Dados institucionais</p>
            <div>
              <span>Nome verdadeiro</span>
              <strong>{{ session.usuario?.nome }}</strong>
            </div>
            <div>
              <span>E-mail</span>
              <strong>{{ session.usuario?.email }}</strong>
            </div>
            <div>
              <span>Perfil</span>
              <strong>{{ session.usuario?.perfil }}</strong>
            </div>
          </div>
        </div>

        <footer>
          <button class="profile-cancel" type="button" @click="fecharConfiguracoes">Cancelar</button>
          <button class="profile-save" type="button" @click="salvarConfiguracoes">Salvar alterações</button>
        </footer>
      </section>
    </div>
  </div>
</template>

<style scoped>
.solicitante-shell {
  min-height: 100vh;
  background: var(--sgl-background);
  color: var(--sgl-text);
}

.solicitante-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 20;
  width: 258px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px 18px 20px;
  background: linear-gradient(180deg, #07142f 0%, #0d2147 100%);
  color: #fff;
}

.solicitante-sidebar__brand {
  min-height: 92px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-bottom: 1px solid rgb(255 255 255 / 11%);
}

.solicitante-sidebar__brand img {
  display: block;
  width: 178px;
  max-height: 74px;
  object-fit: contain;
  transform: none;
  filter: drop-shadow(0 4px 14px rgb(0 0 0 / 22%));
}

.solicitante-nav { padding-top: 28px; }

.solicitante-nav__group {
  margin: 0 10px 10px;
  color: #8fa3c4;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.solicitante-nav__group--spaced { margin-top: 28px; }

.solicitante-nav__item {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 46px;
  padding: 0 13px;
  border-radius: 8px;
  color: #eef4ff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background var(--sgl-transition-fast) ease, transform var(--sgl-transition-fast) ease;
}

.solicitante-nav__item + .solicitante-nav__item { margin-top: 6px; }
.solicitante-nav__item:hover { background: rgb(45 107 196 / 19%); }
.solicitante-nav__item.router-link-active { background: linear-gradient(135deg, #1a4da1, #214fb8); }

.solicitante-nav__item svg,
.solicitante-user-settings svg,
.solicitante-logout svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.solicitante-nav__item svg { width: 22px; height: 22px; }

.solicitante-sidebar__user {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 18px 4px 2px;
  border-top: 1px solid rgb(255 255 255 / 11%);
}

.solicitante-avatar,
.profile-photo-preview {
  overflow: hidden;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #2d6bc4;
  color: #fff;
  font-weight: 800;
}

.solicitante-avatar { width: 42px; height: 42px; }
.solicitante-avatar img,
.profile-photo-preview img { width: 100%; height: 100%; object-fit: cover; }

.solicitante-usercopy {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.solicitante-usercopy strong,
.solicitante-usercopy span,
.solicitante-usercopy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.solicitante-usercopy strong { font-size: 13px; }
.solicitante-usercopy span { margin-top: 2px; color: #aebed7; font-size: 11px; }
.solicitante-usercopy small { margin-top: 5px; color: #83a8ff; font-size: 10px; font-weight: 700; }

.solicitante-user-settings {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #9fb4d5;
  cursor: pointer;
}

.solicitante-user-settings:hover { background: rgb(255 255 255 / 8%); color: #fff; }
.solicitante-user-settings svg { width: 19px; height: 19px; }

.solicitante-workspace {
  min-width: 0;
  margin-left: 258px;
}

.solicitante-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: #08162f;
  color: #fff;
  box-shadow: 0 4px 14px rgb(6 18 40 / 8%);
}

.solicitante-topbar__context { display: flex; flex-direction: column; gap: 2px; }
.solicitante-topbar__context strong { font-size: 13px; }
.solicitante-topbar__context span { color: #9fb0ca; font-size: 11px; }

.solicitante-logout {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 0 14px;
  border: 1px solid rgb(255 255 255 / 23%);
  border-radius: 7px;
  background: transparent;
  color: #fff;
  cursor: pointer;
}

.solicitante-logout:hover { background: rgb(255 255 255 / 7%); }
.solicitante-logout svg { width: 19px; height: 19px; }

.solicitante-main {
  min-height: calc(100vh - 72px);
  padding: 30px;
  background: radial-gradient(circle at top left, rgb(45 107 196 / 6%), transparent 28%), var(--sgl-background);
}

.profile-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(5 16 37 / 50%);
  backdrop-filter: blur(2px);
}

.profile-dialog {
  width: min(100%, 560px);
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
  background: #fff;
  color: var(--sgl-text);
  box-shadow: 0 28px 70px rgb(5 16 37 / 30%);
}

.profile-dialog > header,
.profile-dialog > footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
}

.profile-dialog > header { border-bottom: 1px solid var(--sgl-border); }
.profile-dialog > footer { justify-content: flex-end; border-top: 1px solid var(--sgl-border); }

.profile-dialog > header span {
  color: var(--sgl-primary);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.profile-dialog h2 { margin: 3px 0 0; font-size: 21px; }
.profile-dialog > header > button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: #f4f6f9;
  font-size: 22px;
  cursor: pointer;
}

.profile-content { padding: 22px; }

.profile-photo-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--sgl-border);
}

.profile-photo-preview { width: 76px; height: 76px; font-size: 20px; }
.profile-photo-row > div:last-child { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.profile-photo-row small { width: 100%; color: var(--sgl-text-muted); font-size: 10px; }
.profile-error { color: #b42318 !important; }

.profile-upload,
.profile-remove-photo,
.profile-cancel,
.profile-save {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

.profile-upload { border: 1px solid #cbd5e1; background: #fff; color: #344258; }
.profile-upload input { display: none; }
.profile-remove-photo { border: 0; background: transparent; color: #b42318; }

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 18px;
}

.profile-field > span { color: #2b374c; font-size: 12px; font-weight: 750; }
.profile-field input,
.profile-field textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: var(--sgl-text);
  font: inherit;
  outline: 0;
}
.profile-field input { min-height: 42px; padding: 0 11px; }
.profile-field textarea { resize: vertical; padding: 10px 11px; }
.profile-field input:focus,
.profile-field textarea:focus { border-color: var(--sgl-primary); box-shadow: 0 0 0 3px rgb(26 77 161 / 8%); }
.profile-field small { align-self: flex-end; color: var(--sgl-text-muted); font-size: 10px; }

.profile-essential {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 20px;
  padding: 14px;
  border-radius: 8px;
  background: #f8fafc;
}

.profile-essential > p { grid-column: 1 / -1; margin: 0 0 2px; color: var(--sgl-text-muted); font-size: 10px; font-weight: 800; text-transform: uppercase; }
.profile-essential div { min-width: 0; }
.profile-essential span,
.profile-essential strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.profile-essential span { color: var(--sgl-text-muted); font-size: 9px; text-transform: uppercase; }
.profile-essential strong { margin-top: 4px; font-size: 11px; }

.profile-cancel { border: 1px solid #cbd5e1; background: #fff; color: #344258; }
.profile-save { border: 0; background: var(--sgl-primary); color: #fff; }
.profile-save:hover { background: var(--sgl-primary-dark); }

@media (max-width: 900px) {
  .solicitante-sidebar {
    position: static;
    width: auto;
    height: auto;
    min-height: auto;
    overflow: visible;
    padding: 14px 18px;
  }

  .solicitante-workspace { margin-left: 0; }
  .solicitante-sidebar__brand { min-height: 58px; border-bottom: 0; }
  .solicitante-sidebar__brand img { width: 145px; transform: none; }
  .solicitante-nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding-top: 12px; }
  .solicitante-nav__group,
  .solicitante-sidebar__user { display: none; }
  .solicitante-topbar { position: static; min-height: 62px; padding-inline: 18px; }
  .solicitante-main { min-height: calc(100vh - 62px); padding: 20px; }
}

@media (max-width: 560px) {
  .solicitante-topbar__context { max-width: 68%; }
  .solicitante-logout span { display: none; }
  .solicitante-main { padding: 16px; }
  .profile-essential { grid-template-columns: 1fr; }
  .profile-photo-row { align-items: flex-start; }
}
</style>
