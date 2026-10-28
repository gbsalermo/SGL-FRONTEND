<script setup lang="ts">
import { computed, ref } from 'vue'

import { caminhoPictogramaResiduo, rotuloRiscoResiduo } from '@/modules/residuos/config/pictogramas'
import type { TipoRiscoResiduo } from '@/modules/residuos/types/residuo'
import type { OrgaoFiscalizadorProduto, ProdutoRotuloResponse } from '@/modules/produtos/types/produtoRotulo'

const props = defineProps<{
  dados: ProdutoRotuloResponse
  larguraMm?: number
}>()

const logoComErro = ref(false)
const logoSglComErro = ref(false)
const pictogramaComErro = ref(false)
const BASE_LARGURA = 180
const BASE_ALTURA = 125

const largura = computed(() => props.larguraMm ?? BASE_LARGURA)
const escala = computed(() => largura.value / BASE_LARGURA)
const altura = computed(() => BASE_ALTURA * escala.value)
const frameStyle = computed(() => ({ width: `${largura.value}mm`, height: `${altura.value}mm` }))
const labelStyle = computed(() => ({ transform: `scale(${escala.value})` }))

const riscoVisivel = computed<TipoRiscoResiduo | null>(() => {
  const risco = props.dados.tipoRisco
  return risco && risco !== 'NENHUM' ? risco : null
})

function orgaoRotulo(orgao: OrgaoFiscalizadorProduto) {
  const mapa: Record<OrgaoFiscalizadorProduto, string> = {
    POLICIA_FEDERAL: 'Polícia Federal',
    VIGILANCIA_SANITARIA: 'Vigilância Sanitária',
    ANVISA: 'Anvisa',
    EXERCITO: 'Exército',
    OUTRO: 'Outro órgão',
  }
  return mapa[orgao]
}

function textoEnum(valor: string | null) {
  if (!valor) return 'Não informado'
  return valor.toLowerCase().replaceAll('_', ' ').replace(/^./, (letra) => letra.toUpperCase())
}
</script>

<template>
  <div class="label-frame" :style="frameStyle">
    <article class="produto-label" :style="labelStyle" aria-label="Rótulo do produto">
      <header class="nova-cabecalho">
        <img v-if="!logoSglComErro" src="/assets/residuos/marcas/sgl-logo.png.png" alt="SGL" @error="logoSglComErro = true" /><b v-else>SGL</b>
        <div class="titulo"><strong>PRODUTO LABORATORIAL</strong><h2>{{ dados.nome }}</h2></div>
        <div class="marca"><img v-if="!logoComErro" src="/assets/residuos/marcas/embrapa.png" alt="Embrapa" @error="logoComErro = true" /><b v-else>EMBRAPA</b><small>{{ dados.codigoReferencia || 'SEM REFERÊNCIA' }}</small></div>
      </header>
      <section class="identificacao">
        <div><b>Identificação</b><span>{{ dados.codigoReferencia || 'Não informada' }}</span></div>
        <div><b>Apresentação</b><span>{{ dados.unidadeArmazenamento || 'Não informada' }}</span></div>
        <div><b>Unidade de medida</b><span>{{ textoEnum(dados.unidadeMedida) }}</span></div>
        <div><b>Cadastro</b><span>{{ dados.ativo ? 'Ativo' : 'Inativo' }}</span></div>
      </section>
      <section class="composicao"><b>DESCRIÇÃO DO PRODUTO</b><span>{{ dados.descricao || dados.nome }}</span></section>
      <section class="seguranca">
        <div v-if="riscoVisivel" class="pictogramas"><h3>PICTOGRAMA / RISCO IDENTIFICADO</h3><img v-if="!pictogramaComErro && caminhoPictogramaResiduo(riscoVisivel)" :src="caminhoPictogramaResiduo(riscoVisivel) ?? undefined" :alt="rotuloRiscoResiduo(riscoVisivel)" @error="pictogramaComErro = true" /><span v-else>!</span><p>{{ rotuloRiscoResiduo(riscoVisivel) }}</p></div>
        <div class="classificacao"><h3>INFORMAÇÕES DE SEGURANÇA</h3><strong>{{ textoEnum(dados.risco) }}</strong><p>{{ dados.descricaoRisco || 'Sem advertência complementar cadastrada.' }}</p></div>
      </section>
      <section class="detalhes"><div><h3>ARMAZENAMENTO</h3><p><b>Condições:</b> {{ dados.condicoesArmazenamento || 'Não informadas' }}</p><p><b>Localização:</b> {{ dados.localizacaoFisica || 'Não informada' }}</p><p><b>Perecibilidade:</b> {{ dados.perecivel ? textoEnum(dados.tipoPerecivel) : 'Não perecível' }}</p></div><div><h3>CONTROLE E FISCALIZAÇÃO</h3><p>{{ dados.fiscalizado ? 'Produto sujeito a controle' : 'Sem controle externo cadastrado' }}</p><p v-if="dados.fiscalizado">{{ dados.orgaosFiscalizadores.map(orgaoRotulo).join(' · ') || 'Órgão não informado' }}</p><p v-if="dados.observacaoFiscalizacao">{{ dados.observacaoFiscalizacao }}</p></div></section>
      <footer class="rodape"><span>{{ dados.nome }}</span><strong>{{ dados.codigoReferencia || 'CATÁLOGO SGL' }}</strong></footer>
    </article>
  </div>
</template>

<style scoped>
.label-frame{position:relative;flex:0 0 auto;overflow:hidden}
.produto-label{width:180mm;height:125mm;box-sizing:border-box;padding:5mm;display:flex;flex-direction:column;gap:2mm;background:#fff;color:#1e293b;border:1px solid #234764;font-family:Arial,Helvetica,sans-serif;transform-origin:top left;print-color-adjust:exact;-webkit-print-color-adjust:exact}
.nova-cabecalho{display:grid;grid-template-columns:23mm 1fr 29mm;gap:3mm;align-items:center;border-bottom:1px solid #cbd5e1;padding-bottom:2mm}
.nova-cabecalho>img{width:22mm;max-height:13mm;object-fit:contain}.titulo{text-align:center}.titulo>strong{display:block;background:#1667b3;color:#fff;padding:2mm;font-size:10pt}.titulo h2{font-size:13pt;margin:1mm 0;overflow-wrap:anywhere}.marca{display:flex;flex-direction:column;align-items:flex-end;gap:1mm}.marca img{width:25mm;max-height:10mm;object-fit:contain}.marca small{font-size:7pt;font-weight:bold}
.identificacao{display:grid;grid-template-columns:1fr 1fr 1fr .6fr;gap:2mm;font-size:8pt}.identificacao div{display:flex;flex-direction:column;gap:.6mm;min-width:0}.identificacao span{overflow-wrap:anywhere}
.composicao{display:flex;gap:3mm;align-items:center;padding:2mm;background:#eff5f8;font-size:8pt;overflow-wrap:anywhere}.composicao span{font-weight:bold}
.identificacao b,.composicao b{font-size:7pt;text-transform:uppercase;color:#174969}
.seguranca{display:flex;gap:5mm;min-height:27mm;border-bottom:1px solid #cbd5e1}.seguranca h3,.detalhes h3{font-size:8pt;margin:1mm 0 2mm}.pictogramas{width:38mm;flex-shrink:0}.pictogramas img,.pictogramas>span{display:block;width:19mm;height:19mm;object-fit:contain}.pictogramas p{font-size:8pt;margin:1mm 0}.classificacao{flex:1;min-width:0}.classificacao strong{display:block;font-size:16pt;color:#1b5680}.classificacao p{font-size:8pt;line-height:1.3;overflow-wrap:anywhere}
.detalhes{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:5mm}.detalhes p{font-size:8pt;line-height:1.25;margin:1mm 0;overflow-wrap:anywhere}
.rodape{display:flex;justify-content:space-between;align-items:center;gap:3mm;border-top:1px solid #cbd5e1;padding-top:2mm;font-size:8pt}.rodape span{overflow-wrap:anywhere}.rodape strong{white-space:nowrap}
</style>