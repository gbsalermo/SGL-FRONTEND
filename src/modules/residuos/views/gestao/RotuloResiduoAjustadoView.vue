<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ResiduoRotuloModeloAjustado from '@/modules/residuos/components/rotulo/ResiduoRotuloModeloAjustado.vue'
import { residuoService } from '@/modules/residuos/services/residuoService'
import type {
  ApiErrorResponse, RotuloResiduoResponse,
  MedidaSegurancaResiduo, UnidadeMedidaResiduo,
} from '@/modules/residuos/types/residuo'
import { caminhoPictogramaResiduo, rotuloRiscoResiduo } from '@/modules/residuos/config/pictogramas'
import ZebraExportPanel from '@/modules/rotulos/zebra/ZebraExportPanel.vue'
import type { DocumentoZpl } from '@/modules/rotulos/zebra/zpl'

const route = useRoute()
const router = useRouter()
const dados = ref<RotuloResiduoResponse | null>(null)
const carregando = ref(true)
const erro = ref('')
const larguraRotuloMm = ref(180)
const BASE_LARGURA = 180
const BASE_ALTURA = 125
const MIN = 70
const MAX = 190
const tamanhos = [90, 135, 180, 190]
const alturaRotuloMm = computed(() => Math.round(larguraRotuloMm.value / BASE_LARGURA * BASE_ALTURA * 10) / 10)

const unidades: Partial<Record<UnidadeMedidaResiduo, string>> = {
  ML:'mL', L:'L', MG:'mg', G:'g', KG:'kg', UNIDADE:'un.', REACAO:'reação',
  CAIXA:'caixa', FRASCO:'frasco', AMPOLA:'ampola', PAR:'par', METRO:'m', OUTRO:'',
}
const medidas: Record<MedidaSegurancaResiduo, string> = {
  LUVAS: 'Usar luvas de proteção',
  OCULOS_PROTECAO: 'Usar óculos de proteção',
  PROTECAO_RESPIRATORIA: 'Utilizar proteção respiratória',
  JALECO_AVENTAL: 'Usar jaleco ou avental',
  OUTRO: 'Outras medidas informadas',
}
function textoEnum(valor: string | null | undefined): string {
  return valor ? valor.toLowerCase().replaceAll('_', ' ').replace(/^./, c => c.toUpperCase()) : 'Não informado'
}
function dataBR(valor: string | null | undefined): string {
  if (!valor) return 'Não informada'
  const [ano, mes, dia] = valor.slice(0, 10).split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : valor
}

const documentoZebra = computed<DocumentoZpl | null>(() => {
  const d = dados.value
  if (!d || !d.impressaoPermitida) return null
  const riscos = (d.riscos ?? []).filter(r => r !== 'NENHUM')
  const pictogramas = riscos.flatMap(r => {
    const caminho = caminhoPictogramaResiduo(r)
    return caminho ? [{ caminho, rotulo: rotuloRiscoResiduo(r) }] : []
  })
  const principal = d.componentes.find(c => c.principal)?.nomeComponente
    || d.componentes[0]?.nomeComponente || d.descricao
  return {
    titulo: 'RÓTULO DE RESÍDUO',
    identificador: d.codigoRastreio,
    subtitulo: principal,
    situacao: textoEnum(d.status),
    categoria: 'RESIDUO',
    pictogramas,
    secoes: [
      { titulo: 'Origem', campos: [
        { rotulo: 'Unidade', valor: d.unidadeSigla + ' — ' + d.unidadeNome },
        { rotulo: 'Laboratório', valor: d.laboratorioNome },
        { rotulo: 'Projeto', valor: d.projetoOrigemNome },
        { rotulo: 'SCI', valor: d.sciOrigemNome },
        { rotulo: 'Atividade', valor: d.atividadeOrigemNome },
      ] },
      { titulo: 'Risco e quantidade', campos: [
        { rotulo: 'Nível de risco ' + (d.classificacaoConfirmada ? 'confirmado' : 'informado'),
          valor: d.nivelRisco === 'MEDIO' ? 'Médio' : textoEnum(d.nivelRisco) },
        { rotulo: 'Riscos específicos', valor: riscos.length
          ? riscos.map(rotuloRiscoResiduo).join(', ')
          : (d.classificacaoConfirmada ? 'Sem riscos específicos confirmados' : 'Sem riscos específicos informados') },
        { rotulo: 'Quantidade', valor: d.quantidade.toLocaleString('pt-BR') + ' ' + (unidades[d.unidadeMedida] ?? d.unidadeMedida) },
        { rotulo: 'Estado físico', valor: textoEnum(d.estadoFisico) },
        { rotulo: 'Recipiente', valor: d.recipiente || 'Não informado' },
      ] },
      { titulo: 'Rastreabilidade', campos: [
        { rotulo: 'Gerador registrado', valor: d.geradorNome },
        { rotulo: 'Informado em', valor: dataBR(d.dataInformacao) },
        { rotulo: 'Liberação em', valor: dataBR(d.dataRotulagem) },
        { rotulo: 'Responsável pela liberação', valor: d.responsavelLiberacaoNome || 'Não identificado no histórico' },
      ] },
      { titulo: 'Componentes e composição', campos: d.componentes.length
        ? d.componentes.map(c => ({
          rotulo: c.nomeComponente,
          valor: c.concentracaoOuQuantidade || 'Quantidade não informada',
        })) : [{ rotulo: 'Composição', valor: d.descricao }] },
      { titulo: 'Armazenamento e destino', campos: [
        { rotulo: 'Processo de origem', valor: d.processoOrigem || 'Não informado' },
        { rotulo: 'Armazenamento temporário', valor: d.localArmazenamentoTemporario || 'Não informado' },
        { rotulo: 'Destino previsto', valor: d.destinoFinalPrevisto || 'Não informado' },
        { rotulo: 'Despacho previsto', valor: d.dataPrevistaDespacho ? dataBR(d.dataPrevistaDespacho) : null },
      ] },
      { titulo: 'Medidas de segurança', campos: [
        { rotulo: d.classificacaoConfirmada ? 'Confirmadas' : 'Informadas',
          valor: d.medidasSeguranca.length
            ? d.medidasSeguranca.map(m => medidas[m]).join('; ')
            : 'Nenhuma medida registrada' },
      ] },
      { titulo: 'Observações', campos: [
        { rotulo: 'Descrição', valor: d.descricao },
        { rotulo: 'Observações registradas', valor: d.observacoesRotulo },
        { rotulo: 'Observação de segurança', valor: d.observacaoSeguranca },
      ] },
    ],
    avisoFinal: 'IDENTIFICAÇÃO INTERNA. CONSULTAR AS MEDIDAS DE SEGURANÇA E EXIGÊNCIAS APLICÁVEIS.',
  }
})

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) return error.response?.data?.message ?? 'Não foi possível carregar o rótulo.'
  return error instanceof Error ? error.message : 'Não foi possível carregar o rótulo.'
}

async function carregar() {
  try {
    dados.value = await residuoService.buscarDadosRotulo(String(route.params.id ?? ''))
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregando.value = false
  }
}

function normalizar() {
  larguraRotuloMm.value = Math.min(MAX, Math.max(MIN, Math.round(Number(larguraRotuloMm.value) || BASE_LARGURA)))
}

function imprimir() {
  if (!dados.value?.impressaoPermitida) return
  normalizar()
  window.print()
}
function voltar() { router.push('/residuos') }
onMounted(carregar)
</script>

<template>
  <main class="print-page" :class="{ 'print-page--blocked': dados && !dados.impressaoPermitida }">
    <header class="toolbar no-print">
      <button type="button" @click="voltar">← Voltar</button>
      <div>
        <strong>{{ dados?.impressaoPermitida ? 'Rótulo de resíduo' : 'Prévia do rótulo' }}</strong>
        <span v-if="dados?.impressaoPermitida">A folha permanece A4; o rótulo pode aumentar em altura para preservar todo o conteúdo.</span>
        <span v-else>Confira os dados disponíveis. A impressão será liberada após a análise técnica.</span>
      </div>
      <button class="primary" type="button" :disabled="!dados?.impressaoPermitida" @click="imprimir">Imprimir rótulo</button>
    </header>

    <section v-if="dados && !dados.impressaoPermitida" class="preview-warning no-print">
      <strong>Prévia — impressão bloqueada</strong>
      <span>Status atual: {{ dados.status.replaceAll('_', ' ') }}. A identificação e o QR já pertencem ao Resíduo, mas a impressão física só é autorizada após a liberação.</span>
    </section>

    <section class="controls no-print">
      <div class="presets">
        <button v-for="largura in tamanhos" :key="largura" type="button" :class="{ active: larguraRotuloMm === largura }" @click="larguraRotuloMm = largura">
          <strong>{{ largura === 90 ? 'Pequeno' : largura === 135 ? 'Médio' : largura === 180 ? 'Grande' : 'Máx. A4' }}</strong>
          <span>{{ largura }} × {{ Math.round(largura / BASE_LARGURA * BASE_ALTURA) }} mm</span>
        </button>
      </div>
      <div class="custom">
        <label><span>Largura personalizada</span><input v-model.number="larguraRotuloMm" type="range" :min="MIN" :max="MAX" step="5" /></label>
        <label class="number"><span>Largura</span><div><input v-model.number="larguraRotuloMm" type="number" :min="MIN" :max="MAX" @change="normalizar" /><b>mm</b></div></label>
        <div class="result"><span>Dimensões mínimas</span><strong>{{ larguraRotuloMm }} × {{ alturaRotuloMm }} mm</strong></div>
      </div>
    </section>

    <ZebraExportPanel :documento="documentoZebra" :bloqueado="carregando || !!erro || !dados?.impressaoPermitida" />

    <section v-if="carregando" class="state">Carregando rótulo...</section>
    <section v-else-if="erro" class="state error">{{ erro }}</section>
    <div v-else-if="dados" class="canvas"><ResiduoRotuloModeloAjustado :dados="dados" :largura-mm="larguraRotuloMm" /></div>
  </main>
</template>

<style scoped>
.print-page { min-height: 100vh; padding: 24px; background: #edf1f6; color: #15243b; }
.toolbar, .controls, .preview-warning { width: min(100%, 1120px); margin: 0 auto 14px; padding: 16px 18px; border: 1px solid #d9e1eb; border-radius: 11px; background: #fff; box-shadow: 0 10px 30px rgb(13 43 94 / 7%); }
.preview-warning { display: flex; flex-direction: column; gap: 4px; margin: 0 auto 14px; padding: 12px 16px; border: 1px solid #e5c773; border-radius: 9px; background: #fff9e8; color: #705814; }
.preview-warning strong { font-size: 11px; text-transform: uppercase; }
.preview-warning span { font-size: 10px; line-height: 1.45; }
.toolbar { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 18px; }
.toolbar > div { display: flex; flex-direction: column; gap: 3px; }
.toolbar span { color: #718096; font-size: 12px; }
.toolbar button, .presets button { min-height: 40px; padding: 0 14px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #34445c; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.toolbar .primary { border: 0; background: #174da3; color: #fff; }
.toolbar .primary:disabled { opacity: .45; cursor: not-allowed; }
.controls { display: grid; gap: 14px; margin-bottom: 22px; }
.presets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.presets button { min-height: 54px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px; }
.presets button.active { border-color: #2456c4; background: #eef4ff; color: #173f91; }
.presets span { color: #78869a; font-size: 9px; }
.custom { display: grid; grid-template-columns: 1fr 150px 190px; gap: 14px; align-items: end; padding-top: 13px; border-top: 1px solid #e5eaf1; }
.custom label, .result { display: flex; flex-direction: column; gap: 6px; }
.custom label > span, .result span { color: #64748b; font-size: 9px; font-weight: 800; text-transform: uppercase; }
.custom input[type='range'] { width: 100%; accent-color: #2456c4; }
.number div { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 7px; overflow: hidden; }
.number input { width: 100%; min-height: 38px; padding: 0 9px; border: 0; outline: 0; }
.number b { padding-right: 10px; font-size: 11px; }
.result strong { min-height: 40px; display: flex; align-items: center; font-size: 13px; }
.canvas { width: min-content; max-width: 100%; margin: 0 auto; padding: 16px; background: #fff; box-shadow: 0 20px 60px rgb(6 24 56 / 14%); }
.state { width: min(100%, 720px); margin: 60px auto; padding: 30px; border-radius: 10px; background: #fff; text-align: center; }
.error { color: #a62121; }
@media (max-width: 760px) { .toolbar, .custom { grid-template-columns: 1fr; } .presets { grid-template-columns: 1fr 1fr; } .canvas { width: 100%; overflow-x: auto; } }
@media print {
  @page { size: A4 portrait; margin: 10mm; }
  .print-page { min-height: 0; padding: 0; background: #fff; }
  .no-print { display: none !important; }
  .canvas { width: auto; max-width: none; margin: 0; padding: 0; box-shadow: none; }
  .print-page--blocked .canvas { display: none !important; }
  .print-page--blocked::after {
    content: 'Impressão não autorizada: o Resíduo ainda não foi liberado pela Gestão.';
    display: block;
    padding: 20mm;
    color: #111827;
    font: 700 14pt Arial, sans-serif;
    text-align: center;
  }
}
</style>
