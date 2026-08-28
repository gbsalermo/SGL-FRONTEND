<script setup lang="ts">
import RelatorioExportacaoBar from '@/modules/relatorios/components/RelatorioExportacaoBar.vue'
import { ultimaConsultaRelatorio } from '@/modules/relatorios/services/relatorioService'
import RelatoriosGestaoView from '@/modules/relatorios/views/RelatoriosGestaoView.vue'

function invalidarExportacaoQuandoNecessario(event: MouseEvent) {
  const alvo = event.target
  if (!(alvo instanceof Element)) return

  const trocouRelatorio = Boolean(alvo.closest('.relatorio-opcao'))
  const limpouFiltros = Boolean(alvo.closest('.btn--ghost'))
  if (trocouRelatorio || limpouFiltros) {
    ultimaConsultaRelatorio.value = null
  }
}
</script>

<template>
  <div class="relatorios-exportacao-view" @click.capture="invalidarExportacaoQuandoNecessario">
    <RelatoriosGestaoView />
    <RelatorioExportacaoBar />
  </div>
</template>

<style scoped>
.relatorios-exportacao-view :deep(.exportacao-footer) {
  display: none !important;
}
</style>
