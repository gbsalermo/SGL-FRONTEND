<script setup lang="ts">
import { computed, ref } from 'vue'
import { caminhoPictogramaResiduo, rotuloRiscoResiduo } from '@/modules/residuos/config/pictogramas'
import type { NivelRiscoResiduo, RotuloResiduoResponse, TipoRiscoResiduo } from '@/modules/residuos/types/residuo'

const props = defineProps<{ dados: RotuloResiduoResponse; larguraMm?: number }>()
const pictogramasComErro = ref<Set<TipoRiscoResiduo>>(new Set())
const logoComErro = ref(false)
const BASE_LARGURA = 180
const BASE_ALTURA = 125
const largura = computed(() => props.larguraMm ?? BASE_LARGURA)
const escala = computed(() => largura.value / BASE_LARGURA)
const altura = computed(() => BASE_ALTURA * escala.value)
const frameStyle = computed(() => ({ width: `${largura.value}mm`, height: `${altura.value}mm` }))
const labelStyle = computed(() => ({ transform: `scale(${escala.value})` }))
const riscosVisiveis = computed(() => props.dados.riscos.filter((risco) => risco !== 'NENHUM'))
const componentePrincipal = computed(() => props.dados.componentes.find((c) => c.principal)?.nomeComponente ?? props.dados.componentes[0]?.nomeComponente ?? props.dados.descricao)
const composicao = computed(() => props.dados.componentes.map((c) => c.concentracaoOuQuantidade?.trim() ? `${c.nomeComponente} — ${c.concentracaoOuQuantidade}` : c.nomeComponente).join('; '))
function rotuloNivelRisco(nivel: NivelRiscoResiduo) { return ({ NENHUM: 'Nenhum', BAIXO: 'Baixo', MEDIO: 'Médio', ALTO: 'Alto' } as Record<NivelRiscoResiduo, string>)[nivel] }
function pictogramaFalhou(risco: TipoRiscoResiduo) { return pictogramasComErro.value.has(risco) }
function registrarErroPictograma(risco: TipoRiscoResiduo) { pictogramasComErro.value = new Set([...pictogramasComErro.value, risco]) }
function formatarData(data: string | null) { if (!data) return 'Não informada'; const [ano, mes, dia] = data.slice(0, 10).split('-'); return ano && mes && dia ? `${dia}/${mes}/${ano}` : data }
function unidadeLegivel(valor: string) { return ({ ML:'mL',L:'L',MG:'mg',G:'g',KG:'kg',UNIDADE:'un.',REACAO:'reação',CAIXA:'caixa',FRASCO:'frasco',AMPOLA:'ampola',PAR:'par',METRO:'m',OUTRO:'' } as Record<string,string>)[valor] ?? valor }
</script>

<template>
  <div class="label-frame" :style="frameStyle">
    <article class="residuo-label" :style="labelStyle" aria-label="Rótulo do resíduo">
      <header class="label-header">
        <div class="identification"><p>RESÍDUO LABORATORIAL</p><h2>{{ componentePrincipal }}</h2><strong>{{ dados.codigoRastreio }}</strong></div>
        <div class="origin">
          <strong>SGL — Sistema de Gestão de Laboratórios</strong>
          <span class="unit-line">Unidade: {{ dados.unidadeSigla }} — {{ dados.unidadeNome }}</span>
          <span>Laboratório: {{ dados.laboratorioNome }}</span>
          <span>Gerador: {{ dados.geradorNome }}</span>
          <span>Rotulagem: {{ formatarData(dados.dataRotulagem) }}</span>
        </div>
      </header>
      <div class="label-body">
        <aside class="hazards"><p>PICTOGRAMAS</p><div v-if="riscosVisiveis.length" class="hazard-grid"><div v-for="risco in riscosVisiveis" :key="risco" class="hazard-item"><img v-if="caminhoPictogramaResiduo(risco) && !pictogramaFalhou(risco)" :src="caminhoPictogramaResiduo(risco) ?? undefined" :alt="rotuloRiscoResiduo(risco)" @error="registrarErroPictograma(risco)" /><div v-else class="hazard-fallback">!</div><small>{{ rotuloRiscoResiduo(risco) }}</small></div></div><div v-else class="no-hazard">Sem pictograma aplicável</div></aside>
        <section class="information">
          <div class="risk-heading"><span>NÍVEL DE RISCO CONFIRMADO</span><h3>{{ rotuloNivelRisco(dados.nivelRisco) }}</h3><p>{{ riscosVisiveis.length ? riscosVisiveis.map(rotuloRiscoResiduo).join(' · ') : 'Nenhum risco específico confirmado.' }}</p></div>
          <div class="composition"><h4>Composição informada</h4><p>{{ composicao }}</p></div>
          <div class="info-grid"><div><h4>Processo de origem</h4><p>{{ dados.processoOrigem }}</p></div><div><h4>Recipiente</h4><p>{{ dados.recipiente }}</p></div><div><h4>Armazenamento temporário</h4><p>{{ dados.localArmazenamentoTemporario || 'Não informado' }}</p></div><div><h4>Destino previsto</h4><p>{{ dados.destinoFinalPrevisto || 'Não informado' }}</p></div></div>
          <p v-if="dados.dataPrevistaDespacho" class="dispatch-date">Despacho previsto: <strong>{{ formatarData(dados.dataPrevistaDespacho) }}</strong></p>
        </section>
      </div>
      <footer class="label-footer"><div class="embrapa-brand"><img v-if="!logoComErro" src="/assets/residuos/marcas/embrapa.png" alt="Embrapa" @error="logoComErro = true" /><strong v-else>EMBRAPA</strong></div><div class="description"><span>DESCRIÇÃO</span><strong>{{ dados.descricao }}</strong></div><div class="quantity"><span>QUANTIDADE</span><strong>{{ dados.quantidade }} {{ unidadeLegivel(dados.unidadeMedida) }}</strong></div></footer>
    </article>
  </div>
</template>

<style scoped>
.label-frame { position: relative; flex: 0 0 auto; overflow: hidden; }
.residuo-label { width:180mm;height:125mm;display:grid;grid-template-rows:auto minmax(0,1fr) auto;padding:7mm;border:1.2px solid #111827;background:#fff;color:#111827;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;transform-origin:top left; }
.label-header { display:grid;grid-template-columns:1.5fr .9fr;gap:8mm;padding-bottom:4mm;border-bottom:1px solid #cbd5e1; }
.identification p { margin:0 0 1.5mm;font-size:8pt;font-weight:800;letter-spacing:.08em; }.identification h2{margin:0;font-size:19pt;line-height:1.05}.identification>strong{display:block;margin-top:2mm;font-size:10pt}
.origin{display:flex;flex-direction:column;gap:1mm;font-size:8pt;line-height:1.25}.origin>strong{font-size:9pt}.unit-line{font-weight:800}
.label-body{min-height:0;display:grid;grid-template-columns:44mm minmax(0,1fr);gap:6mm;padding:5mm 0}.hazards{min-height:0;padding-right:5mm;border-right:1px solid #cbd5e1}.hazards>p{margin:0 0 3mm;font-size:8pt;font-weight:800}.hazard-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2.5mm}.hazard-item{min-width:0;text-align:center}.hazard-item img,.hazard-fallback{width:17mm;height:17mm;margin:0 auto;object-fit:contain}.hazard-fallback{display:grid;place-items:center;border:2.5px solid #dc2626;font-size:17pt;font-weight:900}.hazard-item small{display:block;margin-top:.7mm;font-size:6.2pt;line-height:1.05}.no-hazard{padding:5mm 2mm;border:1px dashed #94a3b8;font-size:8pt;text-align:center}
.information{min-width:0;min-height:0;display:grid;grid-template-rows:auto auto auto auto;align-content:start;gap:3mm}.risk-heading span,.composition h4,.info-grid h4,.description span,.quantity span{font-size:7pt;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.risk-heading h3{margin:.5mm 0 1mm;font-size:16pt;line-height:1}.risk-heading p,.composition p,.info-grid p,.dispatch-date{margin:0;font-size:8pt;line-height:1.25;overflow-wrap:anywhere}.composition h4,.info-grid h4{margin:0 0 1mm}.composition p,.info-grid p{max-height:8mm;overflow:hidden}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm 5mm}.dispatch-date{margin-top:0}
.label-footer{display:grid;grid-template-columns:38mm minmax(0,1fr) 35mm;align-items:center;gap:5mm;min-height:15mm;padding-top:4mm;border-top:1px solid #cbd5e1}.embrapa-brand{min-height:13mm;display:flex;align-items:center}.embrapa-brand img{display:block;width:34mm;max-height:12mm;object-fit:contain;object-position:left center}.embrapa-brand>strong{font-size:12pt}.description{min-width:0;display:flex;flex-direction:column;gap:1mm}.description strong{font-size:8pt;line-height:1.2;overflow-wrap:anywhere}.quantity{text-align:right}.quantity strong{display:block;margin-top:1mm;font-size:15pt;white-space:nowrap}@media print{.residuo-label{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style>
