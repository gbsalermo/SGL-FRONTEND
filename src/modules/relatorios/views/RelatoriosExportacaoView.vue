<script setup lang="ts">
import RelatorioExportacaoBar from '@/modules/relatorios/components/RelatorioExportacaoBar.vue'
import { ultimaConsultaRelatorio } from '@/modules/relatorios/services/relatorioService'
import RelatoriosGestaoView from '@/modules/relatorios/views/RelatoriosGestaoView.vue'

function limparExportacaoAoTrocarRelatorio(event: MouseEvent) {
  const alvo = event.target
  if (!(alvo instanceof Element)) return
  if (alvo.closest('.relatorio-opcao')) {
    ultimaConsultaRelatorio.value = null
  }
}
</script>

<template>
  <div class="relatorios-exportacao-view" @click.capture="limparExportacaoAoTrocarRelatorio">
    <RelatoriosGestaoView />
    <RelatorioExportacaoBar />
  </div>
</template>

<style scoped>
.relatorios-exportacao-view :deep(.exportacao-footer) {
  display: none !important;
}
</style>
