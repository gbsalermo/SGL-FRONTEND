<script setup lang="ts">
import { useRouter } from 'vue-router'

import RelatorioExportacaoBar from '@/modules/relatorios/components/RelatorioExportacaoBar.vue'
import { ultimaConsultaRelatorio } from '@/modules/relatorios/services/relatorioService'
import RelatoriosGestaoView from '@/modules/relatorios/views/RelatoriosGestaoView.vue'

const router = useRouter()

function tratarCliqueRelatorios(event: MouseEvent) {
  const alvo = event.target
  if (!(alvo instanceof Element)) return

  const opcao = alvo.closest('.relatorio-opcao')
  const limpouFiltros = Boolean(alvo.closest('.btn--ghost'))

  if (opcao || limpouFiltros) {
    ultimaConsultaRelatorio.value = null
  }

  if (opcao && opcao.textContent?.includes('Resíduos')) {
    event.preventDefault()
    event.stopPropagation()
    router.push('/relatorios/residuos')
  }
}
</script>

<template>
  <div class="relatorios-exportacao-view" @click.capture="tratarCliqueRelatorios">
    <div class="special-reports">
      <router-link class="special-report special-report--people" to="/relatorios/pessoas-laboratorio">
        <div>
          <span>VÍNCULOS DO LABORATÓRIO</span>
          <strong>Pessoas por laboratório</strong>
          <small>Responsável, pesquisadores, estagiários, técnicos, analistas e demais perfis vinculados.</small>
        </div>
        <b>Abrir relatório →</b>
      </router-link>

      <router-link class="special-report special-report--residuos" to="/relatorios/residuos">
        <div>
          <span>RELATÓRIO ATIVO</span>
          <strong>Resíduos — rastreabilidade completa</strong>
          <small>Geração, classificação, armazenamento, despacho e exportação PDF/XLSX.</small>
        </div>
        <b>Abrir relatório →</b>
      </router-link>
    </div>

    <RelatoriosGestaoView />
    <RelatorioExportacaoBar />
  </div>
</template>

<style scoped>
.relatorios-exportacao-view :deep(.exportacao-footer) {
  display: none !important;
}

.special-reports {
  max-width: 1440px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0 auto 18px;
}
.special-report {
  min-height: 94px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 18px;
  border-radius: 10px;
  text-decoration: none;
  box-shadow: 0 8px 24px rgb(21 55 92 / 5%);
}
.special-report > div { display: flex; flex-direction: column; gap: 3px; }
.special-report span { font-size: 9px; font-weight: 900; letter-spacing: .07em; }
.special-report strong { font-size: 14px; }
.special-report small { font-size: 10px; line-height: 1.4; }
.special-report b { font-size: 11px; white-space: nowrap; }
.special-report--people { border: 1px solid #c8d7ef; background: #f5f8ff; color: #17345f; }
.special-report--people span, .special-report--people b { color: #2456a8; }
.special-report--people small { color: #687b99; }
.special-report--residuos { border: 1px solid #bfd8ca; background: #f3faf5; color: #173c2a; }
.special-report--residuos span, .special-report--residuos b { color: #187145; }
.special-report--residuos small { color: #64786d; }
@media (max-width: 900px) { .special-reports { grid-template-columns: 1fr; } }
@media (max-width: 650px) { .special-report { align-items: flex-start; flex-direction: column; } }
</style>
