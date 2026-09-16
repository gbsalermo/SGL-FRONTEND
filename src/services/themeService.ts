import { ref } from 'vue'

import { vuetify } from '@/app/vuetify'

export type TemaAplicacao = 'light' | 'dark'

const TEMA_STORAGE_KEY = 'sgl.theme'

function carregarTemaPersistido(): TemaAplicacao {
  try {
    return localStorage.getItem(TEMA_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export const tema = ref<TemaAplicacao>(carregarTemaPersistido())

function aplicarTemaEfetivo(novoTema: TemaAplicacao) {
  document.documentElement.dataset.theme = novoTema
  document.body.classList.toggle('sgl-dark-active', novoTema === 'dark')
  document.body.classList.toggle('sgl-light-active', novoTema === 'light')
  vuetify.theme.change(novoTema === 'dark' ? 'sglDark' : 'sglLight')
}

function ehRotaSempreClara(path: string) {
  return path === '/login'
    || path.startsWith('/404')
    || /^\/residuos\/[^/]+\/rotulo$/.test(path)
    || /^\/produtos\/[^/]+\/rotulo$/.test(path)
}

export function aplicarTema(novoTema: TemaAplicacao) {
  tema.value = novoTema

  try {
    localStorage.setItem(TEMA_STORAGE_KEY, novoTema)
  } catch {
    // Mantém a troca funcional mesmo sem persistência local.
  }

  aplicarTemaEfetivo(novoTema)
}

export function alternarTema() {
  aplicarTema(tema.value === 'light' ? 'dark' : 'light')
}

export function aplicarTemaDaRota(path: string, forcarClaro = false) {
  if (forcarClaro || ehRotaSempreClara(path)) {
    aplicarTemaEfetivo('light')
    return
  }

  aplicarTemaEfetivo(tema.value)
}
