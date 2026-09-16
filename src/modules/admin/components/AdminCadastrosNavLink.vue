<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useSessionStore } from '@/stores/session'

const router = useRouter()
const route = useRoute()
const session = useSessionStore()
let alvo: HTMLElement | null = null
let observer: MutationObserver | null = null

function navegar() {
  void router.push('/administracao/cadastros')
}

function tecla(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    navegar()
  }
}

function aplicar() {
  if (session.usuario?.perfil !== 'ADMINISTRADOR') return
  const candidato = [...document.querySelectorAll<HTMLElement>('.gestao-nav__future')]
    .find((elemento) => elemento.textContent?.includes('Cadastros'))
  if (!candidato) return

  if (alvo && alvo !== candidato) limpar()
  alvo = candidato
  alvo.classList.add('admin-cadastros-link')
  alvo.setAttribute('role', 'link')
  alvo.setAttribute('tabindex', '0')
  alvo.setAttribute('title', 'Cadastros administrativos')
  alvo.querySelector('small')?.remove()
  alvo.removeEventListener('click', navegar)
  alvo.removeEventListener('keydown', tecla)
  alvo.addEventListener('click', navegar)
  alvo.addEventListener('keydown', tecla)
  atualizarAtivo()
}

function atualizarAtivo() {
  alvo?.classList.toggle('admin-cadastros-link--active', route.path.startsWith('/administracao/cadastros'))
}

function limpar() {
  if (!alvo) return
  alvo.removeEventListener('click', navegar)
  alvo.removeEventListener('keydown', tecla)
  alvo.classList.remove('admin-cadastros-link', 'admin-cadastros-link--active')
  alvo.removeAttribute('role')
  alvo.removeAttribute('tabindex')
  alvo = null
}

async function aplicarContextoBuscaGlobal() {
  if (route.path !== '/administracao/cadastros' || session.usuario?.perfil !== 'ADMINISTRADOR') return

  const secao = typeof route.query.secao === 'string' ? route.query.secao : ''
  const rotuloAba: Record<string, string> = {
    laboratorios: 'Laboratórios',
    projetos: 'Projetos',
    produtos: 'Produtos',
    usuarios: 'Permissões',
    permissoes: 'Permissões',
  }

  const rotulo = rotuloAba[secao]
  if (rotulo) {
    const botao = [...document.querySelectorAll<HTMLButtonElement>('.admin-page .tab-button')]
      .find((item) => item.querySelector('strong')?.textContent?.trim() === rotulo)
    if (botao && !botao.classList.contains('tab-button--active')) {
      botao.click()
      await nextTick()
    }
  }

  const termo = typeof route.query.busca === 'string' ? route.query.busca : ''
  if (!termo) return

  const input = document.querySelector<HTMLInputElement>('.admin-page .toolbar .search-field input')
  if (!input || input.value === termo) return

  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, termo)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.focus()
}

watch(() => route.fullPath, async () => {
  await nextTick()
  aplicar()
  atualizarAtivo()
  await aplicarContextoBuscaGlobal()
})

watch(() => session.usuario?.perfil, async () => {
  await nextTick()
  if (session.usuario?.perfil === 'ADMINISTRADOR') {
    aplicar()
    await aplicarContextoBuscaGlobal()
  } else limpar()
})

onMounted(async () => {
  await nextTick()
  aplicar()
  await aplicarContextoBuscaGlobal()
  observer = new MutationObserver(() => aplicar())
  observer.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  limpar()
})
</script>

<template><span aria-hidden="true" /></template>

<style>
.gestao-nav__future.admin-cadastros-link {
  color: #eef4ff !important;
  cursor: pointer !important;
}
.gestao-nav__future.admin-cadastros-link:hover {
  background: rgb(255 255 255 / 6%) !important;
}
.gestao-nav__future.admin-cadastros-link--active {
  background: linear-gradient(135deg, #1a4da1 0%, #2456c4 100%) !important;
  box-shadow: 0 6px 14px rgb(16 63 150 / 18%);
}
</style>