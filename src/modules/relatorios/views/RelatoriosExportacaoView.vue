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

function limparDestaqueNativo() {
  document
    .querySelectorAll('.relatorios-lista .relatorio-opcao--ativo')
    .forEach((elemento) => elemento.classList.remove('relatorio-opcao--ativo'))
}

async function destacarResiduo() {
  await nextTick()
  const botoes = [...document.querySelectorAll('.relatorios-lista .relatorio-opcao')]
  const botaoResiduo = botoes.find((botao) => botao.textContent?.includes('Resíduos'))
  botaoResiduo?.classList.add('relatorio-opcao--especial-ativo')
}

async function selecionarEspecial(tipo: Exclude<RelatorioEspecial, null>) {
  relatorioEspecial.value = tipo
  ultimaConsultaRelatorio.value = null
  limparDestaqueEspecial()

  await nextTick()
  // Os relatórios especiais interceptam o clique antes do estado interno da central.
  // Remover a classe nativa evita manter o relatório anterior e o atual destacados ao mesmo tempo.
  limparDestaqueNativo()

  if (tipo === 'residuos') {
    await destacarResiduo()
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
    void selecionarEspecial('pessoas-laboratorio')
    return
  }

  if (opcao.textContent?.includes('Resíduos')) {
    event.preventDefault()
    event.stopPropagation()
    void selecionarEspecial('residuos')
    return
  }

  // Para os relatórios nativos, o próprio RelatoriosGestaoView volta a controlar
  // exatamente um item ativo.
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

/* Pessoas por laboratório entra logo depois de Estagiários. */
.relatorios-exportacao-view :deep(.relatorios-lista > .relatorio-opcao) {
  order: 3;
}
.relatorios-exportacao-view :deep(.relatorios-lista > .relatorio-opcao:first-child) {
  order: 1;
}
.relatorio-opcao--pessoas {
  order: 2 !important;
  width: 100%;
  min-height: 80px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px 14px;
  border: 1px solid #e1e7ef;
  border-radius: 7px;
  background: #fff;
  color: #24334d;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
}
.relatorio-opcao--pessoas:hover {
  border-color: #aac3ed;
  background: #fbfdff;
}
.relatorio-opcao--pessoas .relatorio-opcao__icone {
  width: 34px;
  min-width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: #68768c;
}
.relatorio-opcao--pessoas .relatorio-opcao__icone svg {
  width: 25px;
  height: 25px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.relatorio-opcao--pessoas .relatorio-opcao__texto {
  min-width: 0;
  display: grid;
  gap: 4px;
}
.relatorio-opcao--pessoas .relatorio-opcao__texto strong {
  color: inherit;
  font-size: 14px;
  font-weight: 700;
}
.relatorio-opcao--pessoas .relatorio-opcao__texto small {
  color: #74839b;
  font-size: 12px;
  line-height: 1.35;
}

.relatorios-exportacao-view--especial :deep(.relatorios-content) {
  display: none !important;
}
.relatorios-exportacao-view :deep(.relatorio-opcao--especial-ativo) {
  border-color: #4b82e7 !important;
  background: #f4f8ff !important;
  box-shadow: inset 0 0 0 1px rgb(75 130 231 / 8%) !important;
}
.relatorios-exportacao-view :deep(.relatorio-opcao--especial-ativo .relatorio-opcao__icone) {
  color: #1f66dc !important;
}

.relatorio-especial-panel {
  min-width: 0;
  display: block;
}
.relatorio-especial-panel__titulo {
  min-height: 58px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border: 1px solid #dde4ed;
  border-bottom: 0;
  border-radius: 10px 10px 0 0;
  background: #fff;
  box-shadow: 0 4px 16px rgb(17 35 64 / 7%);
}
.relatorio-especial-panel__titulo h2 {
  margin: 0;
  color: #1d2d49;
  font-size: 16px;
  font-weight: 800;
}
.relatorio-especial-panel :deep(.page-header) {
  display: none !important;
}
.relatorio-especial-panel :deep(.people-report-page),
.relatorio-especial-panel :deep(.relatorio-residuos-page) {
  max-width: none;
  margin: 0;
}

/* O bloco de filtros passa a usar as mesmas medidas da central nativa. */
.relatorio-especial-panel :deep(.filter-card) {
  margin: 0 0 20px;
  padding: 18px 20px;
  border-color: #dde4ed;
  border-top: 0;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 4px 16px rgb(17 35 64 / 7%);
}
.relatorio-especial-panel :deep(.filters label) {
  gap: 7px;
}
.relatorio-especial-panel :deep(.filters label span) {
  color: #33425c;
  font-size: 12px;
  font-weight: 700;
}
.relatorio-especial-panel :deep(.filters select),
.relatorio-especial-panel :deep(.filters input) {
  height: 39px;
  min-height: 39px;
  padding: 0 11px;
  border-color: #cfd8e5;
  border-radius: 6px;
  color: #26364f;
  font-size: 12.5px;
}
.relatorio-especial-panel :deep(.filter-actions) {
  gap: 10px;
  margin-top: 15px;
}
.relatorio-especial-panel :deep(.btn) {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 800;
}
.relatorio-especial-panel :deep(.btn--primary) {
  border: 1px solid #1b5fce;
  background: linear-gradient(135deg, #1e67dd, #1452bd);
  box-shadow: 0 4px 9px rgb(24 91 202 / 18%);
}

/* Prévia, resumos e tabelas seguem a escala tipográfica dos outros relatórios. */
.relatorio-especial-panel :deep(.empty-state) {
  min-height: 104px;
  margin-top: 0;
  color: #697890;
  font-size: 12.5px;
}
.relatorio-especial-panel :deep(.lab-summary),
.relatorio-especial-panel :deep(.result-card),
.relatorio-especial-panel :deep(.metrics-grid article),
.relatorio-especial-panel :deep(.summary-grid article) {
  box-shadow: none;
}
.relatorio-especial-panel :deep(.lab-summary span),
.relatorio-especial-panel :deep(.metrics-grid span),
.relatorio-especial-panel :deep(.summary-grid span) {
  font-size: 11.5px;
}
.relatorio-especial-panel :deep(.result-card > header strong) {
  font-size: 13px;
}
.relatorio-especial-panel :deep(.result-card > header span) {
  font-size: 10.5px;
}
.relatorio-especial-panel :deep(th) {
  font-size: 10.5px;
  font-weight: 800;
}
.relatorio-especial-panel :deep(td) {
  font-size: 12px;
}
.relatorio-especial-panel :deep(td strong) {
  font-size: 12.5px;
}
.relatorio-especial-panel :deep(td small) {
  font-size: 10.5px;
}
.relatorio-especial-panel :deep(.role),
.relatorio-especial-panel :deep(.status) {
  font-size: 10.5px;
}

@media (max-width: 900px) {
  .relatorio-especial-panel {
    grid-column: 1 / -1;
  }
}
</style>