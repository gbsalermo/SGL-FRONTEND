<script setup lang="ts">
import { computed, ref } from 'vue'
import { caminhoPictogramaResiduo, rotuloRiscoResiduo } from '@/modules/residuos/config/pictogramas'
import type { NivelRiscoResiduo, RotuloResiduoResponse, TipoRiscoResiduo } from '@/modules/residuos/types/residuo'

const props = defineProps<{ dados: RotuloResiduoResponse; larguraMm?: number }>()
const pictogramasComErro = ref<Set<TipoRiscoResiduo>>(new Set())
const logoComErro = ref(false)
const logoSglComErro = ref(false)
const BASE_LARGURA = 180
const BASE_ALTURA = 125
const largura = computed(() => props.larguraMm ?? BASE_LARGURA)
const escala = computed(() => largura.value / BASE_LARGURA)
const altura = computed(() => BASE_ALTURA * escala.value)
const frameStyle = computed(() => ({ width: `${largura.value}mm`, height: `${altura.value}mm` }))
const labelStyle = computed(() => ({ transform: `scale(${escala.value})` }))
const riscosVisiveis = computed(() => props.dados.riscos.filter((risco) => risco !== 'NENHUM'))
const componentePrincipal = computed(() => props.dados.componentes.find((c) => c.principal)?.nomeComponente ?? props.dados.componentes[0]?.nomeComponente ?? props.dados.descricao)
const perigoso = computed(() => props.dados.nivelRisco === 'ALTO' || props.dados.riscos.some(r => r !== 'NENHUM'))
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
      <header class="nova-cabecalho">
        <img v-if="!logoSglComErro" src="/assets/residuos/marcas/sgl-logo.png.png" alt="SGL" @error="logoSglComErro = true" /><b v-else>SGL</b>
        <div class="titulo"><strong>{{ perigoso ? 'RESÍDUO QUÍMICO — RISCOS IDENTIFICADOS' : 'RESÍDUO LABORATORIAL' }}</strong><h2>{{ componentePrincipal }}</h2></div>
        <div class="marca"><img v-if="!logoComErro" src="/assets/residuos/marcas/embrapa.png" alt="Embrapa" @error="logoComErro = true" /><b v-else>EMBRAPA</b><small>{{ dados.codigoRastreio }}</small></div>
      </header>
      <section class="identificacao">
        <div><b>Unidade</b><span>{{ dados.unidadeSigla }} — {{ dados.unidadeNome }}</span></div>
        <div><b>Laboratório</b><span>{{ dados.laboratorioNome }}</span></div>
        <div><b>Gerador</b><span>{{ dados.geradorNome }}</span></div>
        <div><b>Data</b><span>{{ dados.impressaoPermitida ? formatarData(dados.dataRotulagem) : 'Prévia — impressão bloqueada' }}</span></div>
      </section>
      <section class="composicao"><b>COMPOSIÇÃO</b><span>{{ composicao || dados.descricao }}</span></section>
      <section class="medidas"><div><b>Recipiente</b><span>{{ dados.recipiente || 'Não informado' }}</span></div><div><b>Quantidade real</b><strong>{{ dados.quantidade }} {{ unidadeLegivel(dados.unidadeMedida) }}</strong></div><div><b>Origem</b><span>{{ dados.processoOrigem || 'Não informado' }}</span></div></section>
      <section class="seguranca">
        <div><h3>PICTOGRAMAS E RISCOS IDENTIFICADOS</h3><div class="simbolos"><div v-for="risco in riscosVisiveis" :key="risco" class="simbolo"><img v-if="caminhoPictogramaResiduo(risco) && !pictogramaFalhou(risco)" :src="caminhoPictogramaResiduo(risco) ?? undefined" :alt="rotuloRiscoResiduo(risco)" @error="registrarErroPictograma(risco)" /><span v-else>!</span><small>{{ rotuloRiscoResiduo(risco) }}</small></div><p v-if="!riscosVisiveis.length">Sem pictograma registrado</p></div></div>
        <div class="classificacao"><h3>{{ dados.classificacaoConfirmada ? 'CLASSIFICAÇÃO CONFIRMADA' : 'CLASSIFICAÇÃO PRELIMINAR' }}</h3><strong>{{ rotuloNivelRisco(dados.nivelRisco) }}</strong><p>Frases H/P e palavra de advertência dependem de classificação química específica validada.</p></div>
      </section>
      <section class="detalhes"><div><h3>INFORMAÇÕES DE SEGURANÇA</h3><p>{{ riscosVisiveis.length ? riscosVisiveis.map(rotuloRiscoResiduo).join(' · ') : 'Sem riscos específicos registrados' }}</p></div><div><h3>ARMAZENAMENTO E DESTINO</h3><p><b>Armazenamento:</b> {{ dados.localArmazenamentoTemporario || 'Não informado' }}</p><p><b>Destino:</b> {{ dados.destinoFinalPrevisto || 'Não informado' }}</p><p v-if="dados.dataPrevistaDespacho"><b>Despacho previsto:</b> {{ formatarData(dados.dataPrevistaDespacho) }}</p></div></section>
      <footer class="rodape"><span>{{ dados.descricao }}</span><strong>{{ dados.codigoRastreio }}</strong></footer>
    </article>
  </div>
</template>

<style scoped>
.label-frame{position:relative;flex:0 0 auto;overflow:hidden}
.residuo-label{width:180mm;height:125mm;box-sizing:border-box;padding:5mm;display:flex;flex-direction:column;gap:2mm;background:#fff;color:#1e293b;border:1px solid #234764;font-family:Arial,Helvetica,sans-serif;transform-origin:top left;print-color-adjust:exact;-webkit-print-color-adjust:exact}
.nova-cabecalho{display:grid;grid-template-columns:23mm 1fr 29mm;gap:3mm;align-items:center;border-bottom:1px solid #cbd5e1;padding-bottom:2mm}
.nova-cabecalho>img{width:22mm;max-height:13mm;object-fit:contain}.titulo{text-align:center}.titulo>strong{display:block;background:#bd2026;color:#fff;padding:2mm;font-size:10pt}.titulo h2{font-size:12pt;margin:1mm 0;overflow-wrap:anywhere}.marca{display:flex;flex-direction:column;align-items:flex-end;gap:1mm}.marca img{width:25mm;max-height:10mm;object-fit:contain}.marca small{font-size:7pt;font-weight:bold}
.identificacao{display:grid;grid-template-columns:1.2fr 1fr 1fr .9fr;gap:2mm;font-size:7pt}.identificacao div,.medidas div{display:flex;flex-direction:column;gap:.6mm;min-width:0}.identificacao span,.medidas span{overflow-wrap:anywhere}
.composicao{display:flex;gap:3mm;align-items:center;padding:2mm;background:#eff5f8;font-size:8pt;overflow-wrap:anywhere}.composicao span{font-weight:bold}
.medidas{display:grid;grid-template-columns:1fr .8fr 1fr;gap:4mm;font-size:8pt;border-bottom:1px solid #cbd5e1;padding:1mm 0 2mm}.medidas strong{font-size:12pt}
.identificacao b,.medidas b,.composicao b{font-size:7pt;text-transform:uppercase;color:#174969}
.seguranca{display:grid;grid-template-columns:1.45fr 1fr;gap:4mm;min-height:0}.seguranca h3,.detalhes h3{font-size:8pt;margin:1mm 0 2mm}.simbolos{display:flex;flex-wrap:wrap;gap:2mm}.simbolo{width:19mm;text-align:center}.simbolo img,.simbolo>span{display:block;width:15mm;height:15mm;margin:0 auto;object-fit:contain}.simbolo small{display:block;font-size:6pt;line-height:1.1}.classificacao{border-left:1px solid #cbd5e1;padding-left:4mm}.classificacao strong{display:block;font-size:17pt;color:#b91c1c}.classificacao p{font-size:7pt;line-height:1.25}.detalhes{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:4mm;border-top:1px solid #cbd5e1}.detalhes p{font-size:8pt;line-height:1.2;margin:1mm 0;overflow-wrap:anywhere}
.rodape{display:flex;justify-content:space-between;align-items:center;gap:3mm;border-top:1px solid #cbd5e1;padding-top:2mm;font-size:8pt}.rodape span{overflow-wrap:anywhere}.rodape strong{white-space:nowrap}
</style>