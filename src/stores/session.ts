import { defineStore } from 'pinia'

import { http } from '@/services/http'
import type { UsuarioSessao } from '@/modules/auth/types/session'

const STORAGE_KEY = 'sgl.dev-session'
export const DURACAO_SESSAO_MS = 5 * 60 * 60 * 1000

interface SessaoPersistida {
  usuario: UsuarioSessao
  expiraEm: number
}

function carregarSessao(): SessaoPersistida | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const sessao = JSON.parse(raw) as Partial<SessaoPersistida>

    if (!sessao.usuario || typeof sessao.expiraEm !== 'number' || sessao.expiraEm <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return {
      usuario: sessao.usuario,
      expiraEm: sessao.expiraEm,
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

const sessaoInicial = carregarSessao()

export const useSessionStore = defineStore('session', {
  state: () => ({
    usuario: sessaoInicial?.usuario ?? null as UsuarioSessao | null,
    expiraEm: sessaoInicial?.expiraEm ?? null as number | null,
  }),

  getters: {
    autenticado: (state) => Boolean(state.usuario && state.expiraEm),
  },

  actions: {
    async entrarDesenvolvimento(identificador: string, senha: string) {
      if (!import.meta.env.DEV) {
        throw new Error('A autenticação local definitiva ainda não está disponível.')
      }

      const login = identificador.trim().toLowerCase()

      if (!login || !senha.trim()) {
        throw new Error('Informe usuário e senha para continuar.')
      }

      const { data } = await http.get<UsuarioSessao[]>('/v1/usuarios')

      if (!Array.isArray(data)) {
        throw new Error(
          'O backend não retornou uma lista de usuários. Verifique se a API está rodando em http://localhost:8080 e se VITE_API_BASE_URL aponta para http://localhost:8080/api.',
        )
      }

      const usuario = data.find((item) => {
        if (!item.ativo) return false

        const email = item.email.toLowerCase()
        const nome = item.nome.toLowerCase()
        const usuarioEmail = email.split('@')[0]

        return email === login || usuarioEmail === login || nome === login
      })

      if (!usuario) {
        throw new Error('Usuário ativo não encontrado no backend.')
      }

      // Modo temporário de desenvolvimento: o backend ainda não possui endpoint de login.
      // A senha é exigida pela interface, mas não é validada até a etapa oficial de autenticação.
      this.usuario = usuario
      this.expiraEm = Date.now() + DURACAO_SESSAO_MS

      const sessao: SessaoPersistida = {
        usuario,
        expiraEm: this.expiraEm,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao))

      return usuario
    },

    expirarSeNecessario() {
      if (!this.usuario) return false

      if (!this.expiraEm || Date.now() >= this.expiraEm) {
        this.sair()
        return true
      }

      return false
    },

    sair() {
      this.usuario = null
      this.expiraEm = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
