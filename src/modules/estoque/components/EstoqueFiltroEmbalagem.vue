<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { estoqueService } from '@/modules/estoque/services/estoqueService'
import type { LoteResponse } from '@/modules/estoque/types/estoque'

const route = useRoute()

let lotes: LoteResponse[] = []
let selectEmbalagem: HTMLSelectElement | null = null
let observer: MutationObserver | null = null
let aplicacaoAgendada = false
let carregandoLotes = false

function emDetalheEstoque() {
  return route.name === 'gestao-estoque-detalhe'
}

function chaveEmbalagem(lote: LoteResponse) {
  const tipo = lote.tipoEmbalagem || 'UNITARIO'
  const multiplicador = Number(lote.conteudoPorApresentacao) || 1
  return `${tipo}::${multiplicador}`
}

function desvincularSelect() {
  if (!selectEmbalagem) return
  selectEmbalagem.removeEventListener('change', aoAlterarEmbalagem)
  selectEmbalagem = null
}

function vincularSelect() {
  if (!emDetalheEstoque()) {
    desvincularSelect()
    return
  }

  const atual = document.querySelector<HTMLSelectElement>('#quantity-view')
  if (atual === selectEmbalagem) return

  desvincularSelect()
  selectEmbalagem = atual
  selectEmbalagem?.addEventListener('change', aoAlterarEmbalagem)
}

function atualizarLegenda() {
  if (!selectEmbalagem) return
  const card = selectEmbalagem.closest('.view-card')
  const legenda = card?.querySelector('small')
  const texto = 'A seleção também filtra os lotes exibidos abaixo.'
  if (legenda && legenda.textContent !== texto) legenda.textContent = texto
}

function removerEstadoVazio() {
  document.querySelector('[data-embalagem-empty="true"]')?.remove()
}

function aplicarFiltro() {
  aplicacaoAgendada = false
  if (!emDetalheEstoque()) return

  vincularSelect()
  atualizarLegenda()

  const raiz = document.querySelector<HTMLElement>('.lot-card')
  if (!raiz || !selectEmbalagem) return

  const valor = selectEmbalagem.value
  const filtrarPorEmbalagem = valor !== 'UNITARIA'
  const codigosPermitidos = new Set(
    lotes
      .filter((lote) => lote.ativo && chaveEmbalagem(lote) === valor)
      .map((lote) => lote.codigoInterno),
  )

  const linhas = [...raiz.querySelectorAll<HTMLTableRowElement>('.lot-row')]

  const existeLoteNovo = linhas.some((linha) => {
    const codigo = linha.querySelector('td:first-child strong')?.textContent?.trim()
    return Boolean(codigo) && !lotes.some((lote) => lote.codigoInterno === codigo)
  })
  if (existeLoteNovo && !carregandoLotes) void carregarLotes()

  let visiveis = 0
  linhas.forEach((linha) => {
    const codigo = linha.querySelector('td:first-child strong')?.textContent?.trim() ?? ''
    const mostrar = !filtrarPorEmbalagem || codigosPermitidos.has(codigo)
    linha.hidden = !mostrar
    if (mostrar) visiveis += 1
  })

  const contador = raiz.querySelector<HTMLElement>('.lot-filter-result > strong')
  if (contador && contador.textContent !== String(visiveis)) {
    contador.textContent = String(visiveis)
  }

  const estadoVazio = raiz.querySelector('[data-embalagem-empty="true"]')
  const precisaEstadoVazio = filtrarPorEmbalagem && linhas.length > 0 && visiveis === 0

  if (!precisaEstadoVazio) {
    estadoVazio?.remove()
    return
  }

  if (!estadoVazio) {
    const tbody = raiz.querySelector<HTMLTableSectionElement>('.table-wrap table tbody')
    if (tbody) {
      const linha = document.createElement('tr')
      linha.dataset.embalagemEmpty = 'true'
      const celula = document.createElement('td')
      celula.colSpan = 7
      celula.className = 'estoque-embalagem-empty'
      celula.textContent = 'Nenhum lote encontrado para a embalagem selecionada.'
      linha.appendChild(celula)
      tbody.appendChild(linha)
    }
  }
}

function agendarAplicacao() {
  if (aplicacaoAgendada) return
  aplicacaoAgendada = true
  requestAnimationFrame(aplicarFiltro)
}

async function carregarLotes() {
  if (!emDetalheEstoque() || carregandoLotes) return
  const estoqueId = String(route.params.id ?? '')
  if (!estoqueId) return

  carregandoLotes = true
  try {
    lotes = await estoqueService.listarLotesPorEstoque(estoqueId)
  } catch {
    // A própria tela principal já trata erros de carregamento do estoque.
  } finally {
    carregandoLotes = false
    await nextTick()
    agendarAplicacao()
  }
}

async function aoAlterarEmbalagem() {
  await carregarLotes()
  agendarAplicacao()
}

watch(
  () => route.fullPath,
  async () => {
    lotes = []
    desvincularSelect()
    removerEstadoVazio()
    await nextTick()
    vincularSelect()
    if (emDetalheEstoque()) await carregarLotes()
  },
)

onMounted(async () => {
  await nextTick()
  vincularSelect()

  observer = new MutationObserver(() => {
    vincularSelect()
    agendarAplicacao()
  })
  observer.observe(document.body, { childList: true, subtree: true })

  if (emDetalheEstoque()) await carregarLotes()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  desvincularSelect()
  removerEstadoVazio()
})
</script>

<template>
  <span aria-hidden="true" />
</template>

<style>
.estoque-embalagem-empty {
  padding: 28px !important;
  color: #64748b !important;
  text-align: center !important;
}
</style>
