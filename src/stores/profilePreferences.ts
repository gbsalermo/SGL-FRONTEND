import { defineStore } from 'pinia'

export interface ProfilePreferences {
  apelido: string
  descricao: string
  fotoDataUrl: string | null
}

const STORAGE_KEY = 'sgl.profile-preferences'

function carregarPreferencias(): Record<string, ProfilePreferences> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ProfilePreferences>) : {}
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return {}
  }
}

export const useProfilePreferencesStore = defineStore('profilePreferences', {
  state: () => ({
    porUsuario: carregarPreferencias(),
  }),

  actions: {
    obter(usuarioId: string): ProfilePreferences {
      return this.porUsuario[usuarioId] ?? {
        apelido: '',
        descricao: '',
        fotoDataUrl: null,
      }
    },

    salvar(usuarioId: string, preferences: ProfilePreferences) {
      this.porUsuario[usuarioId] = {
        apelido: preferences.apelido.trim(),
        descricao: preferences.descricao.trim(),
        fotoDataUrl: preferences.fotoDataUrl,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.porUsuario))
    },
  },
})
