<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

import RelatorioExportacaoBar from '@/modules/relatorios/components/RelatorioExportacaoBar.vue'
import { ultimaConsultaRelatorio } from '@/modules/relatorios/services/relatorioService'
import RelatorioPessoasLaboratorioView from '@/modules/relatorios/views/RelatorioPessoasLaboratorioView.vue'
import RelatorioResiduosView from '@/modules/relatorios/views/RelatorioResiduosView.vue'
import RelatoriosGestaoView from '@/modules/relatorios/views/RelatoriosGestaoView.vue'

type RelatorioEspecial = 'pessoas-laboratorio' | 'residuos' | null

const relatorioEspecial = ref<RelatorioEspecial>(null)
const centralPronta = ref(false)

function limparDestaqueEspecial() {
  document
    .querySelectorAll('.relatorio-opcao--especial-ativo')
    .forEach((elemento) => elemento.classList.remove('relatorio-opcao--especial-ativo'))
}

async function destacarResiduo() {
  await nextTick()
  const botoes = [...document.querySelectorAll('.relatorios-lista .relatorio-opcao')]
  const botaoResiduo = botoes.find((botao) => botao.textContent?.includes('Resíduos'))
  botaoResiduo?.classList.add('relatorio-opcao--especial-ativo')
}

function selecionarEspecial(tipo: Exclude<RelatorioEspecial, null>) {
  relatorioEspecial.value = tipo
  ultimaConsultaRelatorio.value = null
  limparDestaqueEspecial()

  if (tipo === 'residuos') {
    void destacarResiduo()
  }
}

function tratarCliqueRelatorios(event: MouseEvent) {
  const alvo = event.target
  if (!(alvo instanceof Element)) return

  const opcao = alvo.closest('.relatorio-opcao')
  const limpouFiltros = Boolean(alvo.closest('.btn--ghost'))

  if (opcao || limpouFiltros) {
    ultimaConsultaRelatorio.value = null
  }

  if (!opcao) return

  const especial = opcao.getAttribute('data-relatorio-especial')
  if (especial === 'pessoas-laboratorio') {
    event.preventDefault()
    event.stopPropagation()
    selecionarEspecial('pessoas-laboratorio')
    return
  }

  if (opcao.textContent?.includes('Resíduos')) {
    event.preventDefault()
    event.stopPropagation()
    selecionarEspecial('residuos')
    return
  }

  relatorioEspecial.value = null
  limparDestaqueEspecial()
}

onMounted(async () => {
  await nextTick()
  centralPronta.value = Boolean(
    document.querySelector('.relatorios-lista') && document.querySelector('.relatorios-grid'),
  )
})
</script>

<template>
  <div
    class="relatorios-exportacao-view"
    :class="{ 'relatorios-exportacao-view--especial': Boolean(relatorioEspecial) }"
    @click.capture="tratarCliqueRelatorios"
  >
    <RelatoriosGestaoView />

    <Teleport v-if="centralPronta" to=".relatorios-lista">
      <button
        class="relatorio-opcao relatorio-opcao--pessoas"
        :class="{ 'relatorio-opcao--especial-ativo': relatorioEspecial === 'pessoas-laboratorio' }"
        data-relatorio-especial="pessoas-laboratorio"
        type="button"
      >
        <span class="relatorio-opcao__icone" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M16 20v-1.7c0-2.1-1.7-3.8-3.8-3.8H7.8A3.8 3.8 0 0 0 4 18.3V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM16 8h4M18 6v4" />
          </svg>
        </span>
        <span class="relatorio-opcao__texto">
          <strong>Pessoas por laboratório</strong>
          <small>Responsável e demais perfis vinculados</small>
        </span>
      </button>
    </Teleport>

    <Teleport v-if="centralPronta && relatorioEspecial" to=".relatorios-grid">
      <div class="relatorio-especial-panel">
        <section class="relatorio-especial-panel__titulo">
          <h2>
            2. Filtros do relatório:
            {{ relatorioEspecial === 'residuos' ? 'Resíduos' : 'Pessoas por laboratório' }}
          </h2>
        </section>

        <RelatorioResiduosView v-if="relatorioEspecial === 'residuos'" />
        <RelatorioPessoasLaboratorioView v-else />
      </div>
    </Teleport>

    <RelatorioExportacaoBar v-if="!relatorioEspecial" />
  </div>
</template>

<style scoped>
.relatorios-exportacao-view :deep(.exportacao-footer) {
  display: none !important;
}

/* O relatório de pessoas entra logo depois de Estagiários sem alterar a ordem dos demais. */
.relatorios-exportacao-view :deep(.relatorios-lista > .relatorio-opcao) {
  order: 3;
}
.relatorios-exportacao-view :deep(.relatorios-lista > .relatorio-opcao:first-child) {
  order: 1;
}
.relatorio-opcao--pessoas {
  order: 2 !important;
  width: 100%;
  min-height: 74px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 11px 13px;
  border: 1px solid #dce3ed;
  border-radius: 7px;
  background: #fff;
  color: #2a3b56;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;
}
.relatorio-opcao--pessoas:hover {
  border-color: #a9bce1;
  background: #f9fbff;
}
.relatorio-opcao--pessoas .relatorio-opcao__icone {
  width: 29px;
  min-width: 29px;
  height: 29px;
  display: grid;
  place-items: center;
  color: #71819a;
}
.relatorio-opcao--pessoas .relatorio-opcao__icone svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.relatorio-opcao--pessoas .relatorio-opcao__texto {
  min-width: 0;
  display: grid;
  gap: 4px;
}
.relatorio-opcao--pessoas .relatorio-opcao__texto strong {
  color: #182842;
  font-size: 13px;
  font-weight: 750;
}
.relatorio-opcao--pessoas .relatorio-opcao__texto small {
  color: #75839a;
  font-size: 10px;
  line-height: 1.3;
}

.relatorios-exportacao-view--especial :deep(.relatorios-content) {
  display: none !important;
}
.relatorios-exportacao-view--especial :deep(.relatorio-opcao--ativo:not(.relatorio-opcao--especial-ativo)) {
  border-color: #dce3ed !important;
  background: #fff !important;
}
.relatorios-exportacao-view :deep(.relatorio-opcao--especial-ativo) {
  border-color: #4f72ff !important;
  background: #f4f7ff !important;
}
.relatorios-exportacao-view :deep(.relatorio-opcao--especial-ativo .relatorio-opcao__icone) {
  color: #3863d8 !important;
}

.relatorio-especial-panel {
  min-width: 0;
  display: grid;
  gap: 14px;
}
.relatorio-especial-panel__titulo {
  min-height: 52px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  border: 1px solid #dce3ed;
  border-radius: 8px;
  background: #fff;
}
.relatorio-especial-panel__titulo h2 {
  margin: 0;
  color: #172842;
  font-size: 14px;
}
.relatorio-especial-panel :deep(.page-header) {
  display: none !important;
}
.relatorio-especial-panel :deep(.people-report-page),
.relatorio-especial-panel :deep(.relatorio-residuos-page) {
  max-width: none;
  margin: 0;
}
.relatorio-especial-panel :deep(.filter-card),
.relatorio-especial-panel :deep(.result-card),
.relatorio-especial-panel :deep(.lab-summary) {
  box-shadow: none;
}

@media (max-width: 900px) {
  .relatorio-especial-panel {
    grid-column: 1 / -1;
  }
}
</style>
