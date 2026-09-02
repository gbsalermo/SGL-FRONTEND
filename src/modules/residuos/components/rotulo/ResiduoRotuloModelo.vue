<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  caminhoPictogramaResiduo,
  rotuloRiscoResiduo,
} from '@/modules/residuos/config/pictogramas'
import type {
  NivelRiscoResiduo,
  RotuloResiduoResponse,
  TipoRiscoResiduo,
} from '@/modules/residuos/types/residuo'

const LARGURA_BASE_MM = 180
const ALTURA_BASE_MM = 108
const LARGURA_MINIMA_MM = 70
const LARGURA_MAXIMA_MM = 190

const props = withDefaults(defineProps<{
  dados: RotuloResiduoResponse
  larguraMm?: number
}>(), {
  larguraMm: LARGURA_BASE_MM,
})

const pictogramasComErro = ref<Set<TipoRiscoResiduo>>(new Set())
const logoComErro = ref(false)

const larguraNormalizada = computed(() =>
  Math.min(LARGURA_MAXIMA_MM, Math.max(LARGURA_MINIMA_MM, props.larguraMm)),
)

const escalaRotulo = computed(() => larguraNormalizada.value / LARGURA_BASE_MM)
const alturaRotuloMm = computed(() => ALTURA_BASE_MM * escalaRotulo.value)

const estiloMoldura = computed(() => ({
  width: `${larguraNormalizada.value}mm`,
  height: `${alturaRotuloMm.value}mm`,
}))

const estiloRotulo = computed(() => ({
  transform: `scale(${escalaRotulo.value})`,
}))

const riscosVisiveis = computed(() =>
  props.dados.riscos.filter((risco) => risco !== 'NENHUM'),
)

const componentePrincipal = computed(() =>
  props.dados.componentes.find((componente) => componente.principal)?.nomeComponente
    ?? props.dados.componentes[0]?.nomeComponente
    ?? props.dados.descricao,
)

const composicao = computed(() =>
  props.dados.componentes
    .map((componente) => {
      const quantidade = componente.concentracaoOuQuantidade?.trim()
      return quantidade ? `${componente.nomeComponente} — ${quantidade}` : componente.nomeComponente
    })
    .join('; '),
)

const nivelRisco = computed(() => rotuloNivelRisco(props.dados.nivelRisco))

function rotuloNivelRisco(nivel: NivelRiscoResiduo) {
  const rotulos: Record<NivelRiscoResiduo, string> = {
    NENHUM: 'Nenhum',
    BAIXO: 'Baixo',
    MEDIO: 'Médio',
    ALTO: 'Alto',
  }
  return rotulos[nivel]
}

function caminhoPictograma(risco: TipoRiscoResiduo) {
  return caminhoPictogramaResiduo(risco)
}

function pictogramaFalhou(risco: TipoRiscoResiduo) {
  return pictogramasComErro.value.has(risco)
}

function registrarErroPictograma(risco: TipoRiscoResiduo) {
  pictogramasComErro.value = new Set([...pictogramasComErro.value, risco])
}

function formatarData(data: string | null) {
  if (!data) return 'Não informada'
  const apenasData = data.slice(0, 10)
  const [ano, mes, dia] = apenasData.split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}

function unidadeLegivel(valor: string) {
  const rotulos: Record<string, string> = {
    ML: 'mL', L: 'L', MG: 'mg', G: 'g', KG: 'kg', UNIDADE: 'un.', REACAO: 'reação',
    CAIXA: 'caixa', FRASCO: 'frasco', AMPOLA: 'ampola', PAR: 'par', METRO: 'm', OUTRO: '',
  }
  return rotulos[valor] ?? valor
}
</script>

<template>
  <div class="label-size-frame" :style="estiloMoldura">
    <article class="residuo-label" :style="estiloRotulo" aria-label="Modelo de rótulo do resíduo">
      <header class="label-header">
        <div class="label-identification">
          <p class="label-kicker">RESÍDUO LABORATORIAL</p>
          <h2>{{ componentePrincipal }}</h2>
          <strong>{{ dados.codigoRastreio }}</strong>
        </div>

        <div class="label-origin">
          <strong>SGL — Sistema de Gestão de Laboratórios</strong>
          <span>{{ dados.laboratorioNome }}</span>
          <span>Gerador: {{ dados.geradorNome }}</span>
          <span>Rotulagem: {{ formatarData(dados.dataRotulagem) }}</span>
        </div>
      </header>

      <div class="label-body">
        <aside class="label-hazards" aria-label="Pictogramas de periculosidade">
          <p>Pictogramas</p>

          <div v-if="riscosVisiveis.length" class="hazard-grid">
            <div v-for="risco in riscosVisiveis" :key="risco" class="hazard-item">
              <img
                v-if="caminhoPictograma(risco) && !pictogramaFalhou(risco)"
                :src="caminhoPictograma(risco) ?? undefined"
                :alt="rotuloRiscoResiduo(risco)"
                @error="registrarErroPictograma(risco)"
              />
              <div v-else class="hazard-fallback" aria-hidden="true">
                <span>!</span>
              </div>
              <small>{{ rotuloRiscoResiduo(risco) }}</small>
            </div>
          </div>

          <div v-else class="no-hazard">Sem pictograma aplicável</div>
        </aside>

        <section class="label-information">
          <div class="risk-heading">
            <span>NÍVEL DE RISCO CONFIRMADO</span>
            <h3>{{ nivelRisco }}</h3>
          </div>

          <div class="label-section">
            <h4>Advertências de perigo</h4>
            <p v-if="riscosVisiveis.length">
              {{ riscosVisiveis.map(rotuloRiscoResiduo).join(' · ') }}
            </p>
            <p v-else>Nenhum risco específico confirmado pela Gestão.</p>
          </div>

          <div class="label-section">
            <h4>Composição informada</h4>
            <p>{{ composicao }}</p>
          </div>

          <div class="label-section label-section--compact">
            <div>
              <h4>Processo de origem</h4>
              <p>{{ dados.processoOrigem }}</p>
            </div>
            <div>
              <h4>Recipiente</h4>
              <p>{{ dados.recipiente }}</p>
            </div>
          </div>

          <div class="label-section label-section--compact">
            <div>
              <h4>Armazenamento temporário</h4>
              <p>{{ dados.localArmazenamentoTemporario || 'Não informado' }}</p>
            </div>
            <div>
              <h4>Destino previsto</h4>
              <p>{{ dados.destinoFinalPrevisto || 'Não informado' }}</p>
            </div>
          </div>

          <p v-if="dados.dataPrevistaDespacho" class="dispatch-date">
            Despacho previsto: <strong>{{ formatarData(dados.dataPrevistaDespacho) }}</strong>
          </p>
        </section>
      </div>

      <footer class="label-footer">
        <div class="embrapa-brand">
          <img
            v-if="!logoComErro"
            src="/assets/residuos/marcas/embrapa.png"
            alt="Embrapa"
            @error="logoComErro = true"
          />
          <strong v-else>EMBRAPA</strong>
        </div>

        <div class="label-description">
          <span>Descrição</span>
          <strong>{{ dados.descricao }}</strong>
        </div>

        <div class="nominal-quantity">
          <span>Quantidade</span>
          <strong>{{ dados.quantidade }} {{ unidadeLegivel(dados.unidadeMedida) }}</strong>
        </div>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.label-size-frame {
  position: relative;
  flex: 0 0 auto;
  overflow: hidden;
}

.residuo-label {
  width: 180mm;
  height: 108mm;
  display: flex;
  flex-direction: column;
  padding: 7mm;
  border: 1.2px solid #111827;
  background: #fff;
  color: #111827;
  font-family: Arial, Helvetica, sans-serif;
  box-sizing: border-box;
  transform-origin: top left;
}

.label-header {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, .9fr);
  gap: 8mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid #cbd5e1;
}

.label-identification,
.label-origin,
.label-information,
.label-section,
.label-section > div,
.label-description { min-width: 0; }

.label-kicker {
  margin: 0 0 1.5mm;
  font-size: 8pt;
  font-weight: 800;
  letter-spacing: .08em;
}

.label-identification h2 {
  margin: 0;
  font-size: 19pt;
  line-height: 1.05;
}

.label-identification > strong {
  display: block;
  margin-top: 2mm;
  font-size: 10pt;
  letter-spacing: .04em;
}

.label-origin {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1mm;
  font-size: 8pt;
  line-height: 1.25;
}

.label-origin > strong { font-size: 9pt; }

.label-body {
  flex: 1;
  display: grid;
  grid-template-columns: 45mm minmax(0, 1fr);
  gap: 6mm;
  padding: 5mm 0;
  min-height: 0;
}

.label-hazards {
  padding-right: 5mm;
  border-right: 1px solid #cbd5e1;
}

.label-hazards > p {
  margin: 0 0 3mm;
  font-size: 8pt;
  font-weight: 800;
  text-transform: uppercase;
}

.hazard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3mm;
}

.hazard-item {
  min-width: 0;
  text-align: center;
}

.hazard-item img,
.hazard-fallback {
  width: 17mm;
  height: 17mm;
  margin-inline: auto;
  object-fit: contain;
}

.hazard-fallback {
  display: grid;
  place-items: center;
  border: 2.5px solid #dc2626;
  transform: rotate(45deg) scale(.72);
  box-sizing: border-box;
}

.hazard-fallback span {
  color: #111827;
  font-size: 18pt;
  font-weight: 900;
  transform: rotate(-45deg) scale(1.25);
}

.hazard-item small {
  display: block;
  margin-top: 1mm;
  font-size: 6.5pt;
  line-height: 1.1;
}

.no-hazard {
  padding: 5mm 2mm;
  border: 1px dashed #94a3b8;
  font-size: 8pt;
  text-align: center;
}

.label-information {
  display: flex;
  flex-direction: column;
  gap: 3mm;
  min-height: 0;
}

.risk-heading span,
.label-section h4,
.label-description span,
.nominal-quantity span {
  font-size: 7pt;
  font-weight: 800;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.risk-heading h3 {
  margin: .5mm 0 0;
  font-size: 16pt;
  line-height: 1;
}

.label-section h4 { margin: 0 0 1mm; }
.label-section p {
  margin: 0;
  font-size: 8pt;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.label-section--compact {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5mm;
}

.dispatch-date {
  margin: auto 0 0;
  font-size: 8pt;
}

.label-footer {
  display: grid;
  grid-template-columns: 37mm minmax(0, 1fr) auto;
  align-items: end;
  gap: 5mm;
  padding-top: 4mm;
  border-top: 1px solid #cbd5e1;
}

.embrapa-brand {
  min-height: 12mm;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.embrapa-brand img {
  display: block;
  width: auto;
  max-width: 32mm;
  max-height: 11mm;
  object-fit: contain;
  object-position: left center;
}

.embrapa-brand strong { font-size: 12pt; letter-spacing: .05em; }

.label-description {
  display: flex;
  flex-direction: column;
  gap: 1mm;
}

.label-description strong {
  font-size: 8pt;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.nominal-quantity {
  min-width: 27mm;
  text-align: right;
}

.nominal-quantity span { display: block; }
.nominal-quantity strong {
  display: block;
  margin-top: 1mm;
  font-size: 15pt;
  white-space: nowrap;
}

@media print {
  .label-size-frame {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .residuo-label {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
