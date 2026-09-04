<script setup lang="ts">
import { computed, ref } from 'vue'

import { useProfilePreferencesStore } from '@/stores/profilePreferences'
import { useSessionStore } from '@/stores/session'

withDefaults(defineProps<{ compact?: boolean }>(), {
  compact: false,
})

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

const unidadeExibicao = computed(() => {
  const usuario = session.usuario
  if (!usuario?.unidadeNome) return 'Unidade não identificada'
  return usuario.unidadeSigla
    ? `${usuario.unidadeSigla} - ${usuario.unidadeNome}`
    : usuario.unidadeNome
})

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
</script>

<template>
  <div class="gestao-profile" :class="{ 'gestao-profile--compact': compact }">
    <div class="gestao-profile__avatar">
      <img v-if="preferencias.fotoDataUrl" :src="preferencias.fotoDataUrl" alt="Foto de perfil" />
      <span v-else>{{ iniciais }}</span>
    </div>

    <div v-if="!compact" class="gestao-profile__copy">
      <div class="gestao-profile__line">
        <strong>{{ nomeExibicao }}</strong>
        <small>{{ session.usuario?.perfil }}</small>
      </div>
      <span>{{ session.usuario?.email }}</span>
      <span class="gestao-profile__unit" :title="unidadeExibicao">{{ unidadeExibicao }}</span>
    </div>

    <button
      class="gestao-profile__settings"
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
            <div>
              <span>Unidade</span>
              <strong>{{ unidadeExibicao }}</strong>
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
.gestao-profile { display: flex; align-items: center; gap: 10px; padding: 16px 4px 2px; border-top: 1px solid rgb(255 255 255 / 10%); }
.gestao-profile--compact { justify-content: center; flex-wrap: wrap; gap: 5px; }
.gestao-profile__avatar, .profile-photo-preview { overflow: hidden; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%; background: #2d6bc4; color: #fff; font-weight: 800; }
.gestao-profile__avatar { width: 42px; height: 42px; font-size: 12px; }
.gestao-profile__avatar img, .profile-photo-preview img { width: 100%; height: 100%; object-fit: cover; }
.gestao-profile__copy { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.gestao-profile__line { min-width: 0; display: flex; align-items: center; gap: 6px; }
.gestao-profile__copy strong, .gestao-profile__copy > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gestao-profile__copy strong { min-width: 0; font-size: 12px; }
.gestao-profile__copy > span { margin-top: 3px; color: #aebed7; font-size: 10px; }
.gestao-profile__copy > .gestao-profile__unit { margin-top: 5px; color: #fff; font-size: 10.5px; font-weight: 700; }
.gestao-profile__line small { flex: 0 0 auto; padding: 2px 5px; border-radius: 4px; background: #1f4eac; color: #dce8ff; font-size: 8px; font-weight: 800; }
.gestao-profile__settings { width: 32px; height: 32px; flex: 0 0 auto; display: grid; place-items: center; border: 0; border-radius: 7px; background: transparent; color: #9fb4d5; cursor: pointer; }
.gestao-profile__settings:hover { background: rgb(255 255 255 / 8%); color: #fff; }
.gestao-profile__settings svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.gestao-profile--compact .gestao-profile__settings { width: 28px; height: 28px; }
.profile-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 20px; background: rgb(5 16 37 / 50%); backdrop-filter: blur(2px); }
.profile-dialog { width: min(100%, 560px); max-height: 90vh; overflow-y: auto; border-radius: 12px; background: #fff; color: var(--sgl-text, #1a1a2e); box-shadow: 0 28px 70px rgb(5 16 37 / 30%); }
.profile-dialog > header, .profile-dialog > footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 22px; }
.profile-dialog > header { border-bottom: 1px solid var(--sgl-border, #e2e8f0); }
.profile-dialog > footer { justify-content: flex-end; border-top: 1px solid var(--sgl-border, #e2e8f0); }
.profile-dialog > header span { color: var(--sgl-primary, #1a4da1); font-size: 10px; font-weight: 800; text-transform: uppercase; }
.profile-dialog h2 { margin: 3px 0 0; font-size: 21px; }
.profile-dialog > header > button { width: 34px; height: 34px; border: 0; border-radius: 50%; background: #f4f6f9; font-size: 22px; cursor: pointer; }
.profile-content { padding: 22px; }
.profile-photo-row { display: flex; align-items: center; gap: 18px; padding-bottom: 20px; border-bottom: 1px solid var(--sgl-border, #e2e8f0); }
.profile-photo-preview { width: 76px; height: 76px; font-size: 20px; }
.profile-photo-row > div:last-child { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.profile-photo-row small { width: 100%; color: var(--sgl-text-muted, #64748b); font-size: 10px; }
.profile-error { color: #b42318 !important; }
.profile-upload, .profile-remove-photo, .profile-cancel, .profile-save { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; padding: 0 12px; border-radius: 6px; font-weight: 700; cursor: pointer; }
.profile-upload { border: 1px solid #cbd5e1; background: #fff; color: #344258; }
.profile-upload input { display: none; }
.profile-remove-photo { border: 0; background: transparent; color: #b42318; }
.profile-field { display: flex; flex-direction: column; gap: 7px; margin-top: 18px; }
.profile-field > span { color: #2b374c; font-size: 12px; font-weight: 750; }
.profile-field input, .profile-field textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; color: var(--sgl-text, #1a1a2e); font: inherit; outline: 0; }
.profile-field input { min-height: 42px; padding: 0 11px; }
.profile-field textarea { resize: vertical; padding: 10px 11px; }
.profile-field input:focus, .profile-field textarea:focus { border-color: var(--sgl-primary, #1a4da1); box-shadow: 0 0 0 3px rgb(26 77 161 / 8%); }
.profile-field small { align-self: flex-end; color: var(--sgl-text-muted, #64748b); font-size: 10px; }
.profile-essential { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 20px; padding: 14px; border-radius: 8px; background: #f8fafc; }
.profile-essential > p { grid-column: 1 / -1; margin: 0 0 2px; color: var(--sgl-text-muted, #64748b); font-size: 10px; font-weight: 800; text-transform: uppercase; }
.profile-essential div { min-width: 0; }
.profile-essential span, .profile-essential strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.profile-essential span { color: var(--sgl-text-muted, #64748b); font-size: 9px; text-transform: uppercase; }
.profile-essential strong { margin-top: 4px; font-size: 11px; }
.profile-cancel { border: 1px solid #cbd5e1; background: #fff; color: #344258; }
.profile-save { border: 0; background: var(--sgl-primary, #1a4da1); color: #fff; }
.profile-save:hover { background: var(--sgl-primary-dark, #0d2b5e); }
@media (max-width: 560px) { .profile-essential { grid-template-columns: 1fr; } .profile-photo-row { align-items: flex-start; } }
</style>