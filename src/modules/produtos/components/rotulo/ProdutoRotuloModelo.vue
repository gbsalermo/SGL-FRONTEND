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
      <header class="label-header">
        <div>
          <p>PRODUTO LABORATORIAL</p>
          <h2>{{ dados.nome }}</h2>
          <strong>{{ dados.codigoReferencia || 'SEM CÓDIGO DE REFERÊNCIA' }}</strong>
        </div>
        <div class="header-meta">
          <strong>SGL — Sistema de Gestão de Laboratórios</strong>
          <span>{{ dados.unidadeArmazenamento || 'Apresentação não informada' }}</span>
          <span>{{ dados.ativo ? 'Produto ativo no catálogo' : 'Produto inativo no catálogo' }}</span>
        </div>
      </header>

      <div class="label-body">
        <aside class="hazard-area">
          <p>Periculosidade</p>
          <template v-if="riscoVisivel">
            <img
              v-if="!pictogramaComErro"
              :src="caminhoPictogramaResiduo(riscoVisivel) ?? undefined"
              :alt="rotuloRiscoResiduo(riscoVisivel)"
              @error="pictogramaComErro = true"
            />
            <div v-else class="hazard-fallback">!</div>
            <strong>{{ rotuloRiscoResiduo(riscoVisivel) }}</strong>
          </template>
          <div v-else class="no-hazard">Sem pictograma aplicável</div>
        </aside>

        <section class="information-area">
          <div class="risk-heading">
            <span>NÍVEL DE RISCO</span>
            <h3>{{ textoEnum(dados.risco) }}</h3>
            <p>{{ dados.descricaoRisco || 'Sem advertência complementar cadastrada.' }}</p>
          </div>

          <div class="info-grid">
            <div>
              <h4>Armazenamento recomendado</h4>
              <p>{{ dados.condicoesArmazenamento || 'Não informado' }}</p>
            </div>
            <div>
              <h4>Localização física</h4>
              <p>{{ dados.localizacaoFisica || 'Não informada' }}</p>
            </div>
            <div>
              <h4>Unidade de medida</h4>
              <p>{{ textoEnum(dados.unidadeMedida) }}</p>
            </div>
            <div>
              <h4>Perecibilidade</h4>
              <p>{{ dados.perecivel ? `Perecível · ${textoEnum(dados.tipoPerecivel)}` : 'Não perecível' }}</p>
            </div>
          </div>

          <section class="inspection" :class="{ 'inspection--active': dados.fiscalizado }">
            <div>
              <span>CONTROLE / FISCALIZAÇÃO EXTERNA</span>
              <strong>{{ dados.fiscalizado ? 'Produto sujeito a controle' : 'Sem controle externo cadastrado' }}</strong>
            </div>
            <p v-if="dados.fiscalizado && dados.orgaosFiscalizadores.length">
              {{ dados.orgaosFiscalizadores.map(orgaoRotulo).join(' · ') }}
            </p>
            <p v-else-if="dados.fiscalizado">Órgão fiscalizador não informado.</p>
            <small v-if="dados.observacaoFiscalizacao">{{ dados.observacaoFiscalizacao }}</small>
          </section>
        </section>
      </div>

      <footer class="label-footer">
        <div class="embrapa-brand">
          <img v-if="!logoComErro" src="/assets/residuos/marcas/embrapa.png" alt="Embrapa" @error="logoComErro = true" />
          <strong v-else>EMBRAPA</strong>
        </div>
        <div class="description">
          <span>DESCRIÇÃO</span>
          <strong>{{ dados.descricao || dados.nome }}</strong>
        </div>
        <div class="control-badge" :class="{ active: dados.fiscalizado }">
          <span>{{ dados.fiscalizado ? 'CONTROLADO' : 'CATÁLOGO' }}</span>
          <strong>{{ dados.fiscalizado ? dados.orgaosFiscalizadores.map(orgaoRotulo).join(' / ') || 'Fiscalizado' : 'SGL' }}</strong>
        </div>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.label-frame { position: relative; flex: 0 0 auto; overflow: hidden; }
.produto-label {
  width: 180mm;
  height: 125mm;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  padding: 7mm;
  border: 1.2px solid #111827;
  background: #fff;
  color: #111827;
  font-family: Arial, Helvetica, sans-serif;
  box-sizing: border-box;
  transform-origin: top left;
}
.label-header { display: grid; grid-template-columns: 1.5fr .9fr; gap: 8mm; padding-bottom: 4mm; border-bottom: 1px solid #cbd5e1; }
.label-header p { margin: 0 0 1.5mm; font-size: 8pt; font-weight: 800; letter-spacing: .08em; }
.label-header h2 { margin: 0; font-size: 19pt; line-height: 1.05; }
.label-header > div > strong { display: block; margin-top: 2mm; font-size: 10pt; }
.header-meta { display: flex; flex-direction: column; gap: 1mm; font-size: 8pt; line-height: 1.3; }
.header-meta > strong { margin: 0 !important; font-size: 9pt !important; }
.label-body { min-height: 0; display: grid; grid-template-columns: 42mm minmax(0, 1fr); gap: 6mm; padding: 5mm 0; }
.hazard-area { min-height: 0; padding-right: 5mm; border-right: 1px solid #cbd5e1; text-align: center; }
.hazard-area > p { margin: 0 0 3mm; font-size: 8pt; font-weight: 800; text-transform: uppercase; text-align: left; }
.hazard-area img, .hazard-fallback { width: 25mm; height: 25mm; margin: 0 auto 2mm; object-fit: contain; }
.hazard-area > strong { display: block; font-size: 8pt; }
.hazard-fallback { display: grid; place-items: center; border: 3px solid #dc2626; color: #111827; font-size: 24pt; font-weight: 900; }
.no-hazard { padding: 6mm 2mm; border: 1px dashed #94a3b8; font-size: 8pt; }
.information-area { min-width: 0; min-height: 0; display: grid; grid-template-rows: auto auto minmax(0, 1fr); gap: 3mm; }
.risk-heading span, .info-grid h4, .inspection span, .description span, .control-badge span { font-size: 7pt; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.risk-heading h3 { margin: .5mm 0 1mm; font-size: 16pt; line-height: 1; }
.risk-heading p, .info-grid p, .inspection p, .inspection small { margin: 0; font-size: 8pt; line-height: 1.3; overflow-wrap: anywhere; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 5mm; }
.info-grid h4 { margin: 0 0 1mm; }
.inspection { align-self: stretch; padding: 3mm; border: 1px solid #cbd5e1; background: #f8fafc; }
.inspection--active { border: 1.4px solid #b45309; background: #fff8eb; }
.inspection > div { display: flex; align-items: baseline; justify-content: space-between; gap: 4mm; margin-bottom: 1.5mm; }
.inspection > div strong { font-size: 9pt; }
.inspection small { display: block; margin-top: 1mm; color: #475569; }
.label-footer { display: grid; grid-template-columns: 38mm minmax(0, 1fr) 45mm; align-items: center; gap: 5mm; padding-top: 4mm; border-top: 1px solid #cbd5e1; }
.embrapa-brand { min-height: 13mm; display: flex; align-items: center; }
.embrapa-brand img { display: block; max-width: 34mm; max-height: 12mm; object-fit: contain; object-position: left center; }
.embrapa-brand > strong { font-size: 12pt; }
.description { min-width: 0; display: flex; flex-direction: column; gap: 1mm; }
.description strong { font-size: 8pt; line-height: 1.2; overflow-wrap: anywhere; }
.control-badge { padding: 2mm 2.5mm; border: 1px solid #cbd5e1; text-align: center; }
.control-badge.active { border-color: #b45309; background: #fff8eb; }
.control-badge strong { display: block; margin-top: .8mm; font-size: 7pt; line-height: 1.2; }
@media print { .produto-label { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
