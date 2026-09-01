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
    <router-link class="residuos-report-access" to="/relatorios/residuos">
      <div>
        <span>RELATÓRIO ATIVO</span>
        <strong>Resíduos — rastreabilidade completa</strong>
        <small>Geração, classificação, armazenamento, despacho e exportação PDF/XLSX.</small>
      </div>
      <b>Abrir relatório →</b>
    </router-link>

    <RelatoriosGestaoView />
    <RelatorioExportacaoBar />
  </div>
</template>

<style scoped>
.relatorios-exportacao-view :deep(.exportacao-footer) {
  display: none !important;
}

.residuos-report-access {
  max-width: 1440px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 auto 18px;
  padding: 16px 18px;
  border: 1px solid #bfd8ca;
  border-radius: 10px;
  background: #f3faf5;
  color: #173c2a;
  text-decoration: none;
  box-shadow: 0 8px 24px rgb(21 92 53 / 5%);
}
.residuos-report-access > div { display: flex; flex-direction: column; gap: 3px; }
.residuos-report-access span { color: #187145; font-size: 9px; font-weight: 900; letter-spacing: .07em; }
.residuos-report-access strong { font-size: 14px; }
.residuos-report-access small { color: #64786d; font-size: 10px; }
.residuos-report-access b { color: #176b3b; font-size: 11px; white-space: nowrap; }
@media (max-width: 650px) { .residuos-report-access { align-items: flex-start; flex-direction: column; } }
</style>
