import { defineStore } from 'pinia'

import { http, SESSION_STORAGE_KEY } from '@/services/http'
import type { LoginResponse, UsuarioSessao } from '@/modules/auth/types/session'

// Left behind by the browser-side DEV login that the JWT session replaced.
const LEGACY_STORAGE_KEY = 'sgl.dev-session'

interface SessaoPersistida {
  token: string
  usuario: UsuarioSessao
  expiraEm: number
  unidadeOperacaoId: string | null
}

function carregarSessao(): SessaoPersistida | null {
  localStorage.removeItem(LEGACY_STORAGE_KEY)

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null

    const sessao = JSON.parse(raw) as Partial<SessaoPersistida>

    if (!sessao.token || !sessao.usuario || typeof sessao.expiraEm !== 'number' || sessao.expiraEm <= Date.now()) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }

    return {
      token: sessao.token,
      usuario: sessao.usuario,
      expiraEm: sessao.expiraEm,
      unidadeOperacaoId: sessao.unidadeOperacaoId ?? null,
    }
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

const sessaoInicial = carregarSessao()

export const useSessionStore = defineStore('session', {
  state: () => ({
    token: sessaoInicial?.token ?? null as string | null,
    usuario: sessaoInicial?.usuario ?? null as UsuarioSessao | null,
    expiraEm: sessaoInicial?.expiraEm ?? null as number | null,
    unidadeOperacaoId: sessaoInicial?.unidadeOperacaoId ?? null as string | null,
  }),

  getters: {
    autenticado: (state) => Boolean(state.token && state.usuario && state.expiraEm),
    pendente: (state) => state.usuario?.situacao === 'PENDENTE_VINCULACAO',
    administradorGeral: (state) => state.usuario?.perfil === 'ADMINISTRADOR_GERAL',
  },

  actions: {
    async entrar(login: string, senha: string) {
      const { data } = await http.post<LoginResponse>('/v1/auth/login', { login: login.trim(), senha })
      return this.aplicarLogin(data)
    },

    async entrarDesenvolvimento(login: string) {
      const { data } = await http.post<LoginResponse>('/v1/auth/dev-login', { login: login.trim() })
      return this.aplicarLogin(data)
    },

    async atualizarUsuario() {
      if (!this.token) throw new Error('Sessão de usuário não encontrada.')
      const { data } = await http.get<UsuarioSessao>('/v1/auth/me')
      this.usuario = data
      this.persistir()
      return data
    },

    selecionarUnidade(unidadeId: string | null) {
      this.unidadeOperacaoId = unidadeId
      this.persistir()
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
      this.token = null
      this.usuario = null
      this.expiraEm = null
      this.unidadeOperacaoId = null
      localStorage.removeItem(SESSION_STORAGE_KEY)
    },

    aplicarLogin(resposta: LoginResponse) {
      this.token = resposta.token
      this.usuario = resposta.usuario
      this.expiraEm = Date.parse(resposta.expiraEm)
      this.unidadeOperacaoId = null
      this.persistir()
      return resposta.usuario
    },

    persistir() {
      if (!this.token || !this.usuario || !this.expiraEm) return
      const sessao: SessaoPersistida = {
        token: this.token,
        usuario: this.usuario,
        expiraEm: this.expiraEm,
        unidadeOperacaoId: this.unidadeOperacaoId,
      }
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessao))
    },
  },
})
