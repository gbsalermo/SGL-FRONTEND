<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  relatorioService,
  ultimaConsultaRelatorio,
  type FormatoExportacaoRelatorio,
  type TipoRelatorioExportavel,
} from '@/modules/relatorios/services/relatorioService'

const exportando = ref<FormatoExportacaoRelatorio | null>(null)
const erroExportacao = ref('')

const nomes: Record<TipoRelatorioExportavel, string> = {
  estagiarios: 'Estagiários',
  produtos: 'Produtos',
  movimentacoes: 'Movimentações',
  'resumo-operacional': 'Resumo operacional',
  'estoque-lotes': 'Estoque e lotes',
  fiscalizacao: 'Fiscalização',
}

const podeExportar = computed(() => Boolean(ultimaConsultaRelatorio.value))
const relatorioAtual = computed(() =>
  ultimaConsultaRelatorio.value ? nomes[ultimaConsultaRelatorio.value.tipo] : null,
)

async function exportar(formato: FormatoExportacaoRelatorio) {
  const consulta = ultimaConsultaRelatorio.value
  if (!consulta || exportando.value) return

  erroExportacao.value = ''
  exportando.value = formato
  try {
    const arquivo = await relatorioService.exportar(consulta.tipo, formato, consulta.filtros)
    const url = URL.createObjectURL(arquivo.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = arquivo.nomeArquivo
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    erroExportacao.value = 'Não foi possível gerar o arquivo. Verifique a API e tente novamente.'
  } finally {
    exportando.value = null
  }
}
</script>

<template>
  <footer class="exportacao-real">
    <div class="exportacao-real__texto">
      <strong v-if="relatorioAtual">Exportar: {{ relatorioAtual }}</strong>
      <strong v-else>Exportação do relatório</strong>
      <span v-if="podeExportar">O arquivo usa exatamente os filtros da última prévia visualizada.</span>
      <span v-else>Visualize um relatório para habilitar PDF e Excel.</span>
      <small v-if="erroExportacao">{{ erroExportacao }}</small>
    </div>

    <div class="exportacao-real__acoes">
      <button
        class="export-btn export-btn--pdf"
        type="button"
        :disabled="!podeExportar || Boolean(exportando)"
        @click="exportar('PDF')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v5h5M9 13h6M9 17h4" /></svg>
        {{ exportando === 'PDF' ? 'Gerando PDF...' : 'PDF' }}
      </button>

      <button
        class="export-btn export-btn--xlsx"
        type="button"
        :disabled="!podeExportar || Boolean(exportando)"
        @click="exportar('XLSX')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM9 4v16M9 9h10M9 14h10" /></svg>
        {{ exportando === 'XLSX' ? 'Gerando Excel...' : 'Excel' }}
      </button>
    </div>
  </footer>
</template>

<style scoped>
.exportacao-real {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 22px 30px 38px;
  padding: 14px 18px;
  border: 1px solid #a9d7b8;
  border-radius: 8px;
  background: #f4fbf6;
  color: #52645b;
}
.exportacao-real__texto { min-width: 0; display: grid; gap: 3px; }
.exportacao-real__texto strong { color: #273b31; font-size: 13px; }
.exportacao-real__texto span { font-size: 11.5px; }
.exportacao-real__texto small { color: #b42318; font-size: 11px; }
.exportacao-real__acoes { display: flex; gap: 9px; }
.export-btn {
  min-width: 92px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid #d4dce4;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
}
.export-btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.export-btn--pdf { color: #c23d32; }
.export-btn--xlsx { color: #277845; }
.export-btn:disabled { opacity: .48; cursor: not-allowed; }
@media (max-width: 720px) {
  .exportacao-real { align-items: stretch; flex-direction: column; margin: 18px 12px 24px; }
  .exportacao-real__acoes { width: 100%; }
  .export-btn { flex: 1; }
}
</style>
