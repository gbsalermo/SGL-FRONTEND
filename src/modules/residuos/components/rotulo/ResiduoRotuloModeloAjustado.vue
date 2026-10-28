<script setup lang="ts">
import { computed, ref } from 'vue'
import { caminhoPictogramaResiduo, rotuloRiscoResiduo } from '@/modules/residuos/config/pictogramas'
import type {
  EstadoFisicoResiduo,
  MedidaSegurancaResiduo,
  NivelRiscoResiduo,
  RotuloResiduoResponse,
  StatusResiduo,
  TipoRiscoResiduo,
} from '@/modules/residuos/types/residuo'

const props = defineProps<{ dados: RotuloResiduoResponse; larguraMm?: number }>()
const logoEmbrapaComErro = ref(false)
const logoSglComErro = ref(false)
const pictogramasComErro = ref<Set<TipoRiscoResiduo>>(new Set())

const BASE_LARGURA_MM = 180
const largura = computed(() => props.larguraMm ?? BASE_LARGURA_MM)
const frameStyle = computed(() => ({ width: String(largura.value) + 'mm' }))
// Zoom participa do fluxo: diferentemente de transform, não corta o rodapé.
const labelStyle = computed(() => ({ zoom: largura.value / BASE_LARGURA_MM }))

const riscosVisiveis = computed(() => (props.dados.riscos ?? []).filter((r) => r !== 'NENHUM'))
const componentePrincipal = computed(() =>
  props.dados.componentes.find((c) => c.principal)?.nomeComponente
  ?? props.dados.componentes[0]?.nomeComponente
  ?? props.dados.descricao,
)
const composicao = computed(() =>
  props.dados.componentes
    .map((c) => c.concentracaoOuQuantidade?.trim()
      ? c.nomeComponente + ' — ' + c.concentracaoOuQuantidade
      : c.nomeComponente)
    .join('; ') || props.dados.descricao,
)
const medidasVisiveis = computed(() => props.dados.medidasSeguranca ?? [])

const statusRotulos: Record<StatusResiduo, string> = {
  INFORMADO: 'Informado',
  EM_ANALISE: 'Em análise',
  LIBERADO_PARA_ARMAZENAMENTO: 'Liberado para armazenamento',
  ARMAZENADO_TEMPORARIAMENTE: 'Armazenado temporariamente',
  DESPACHADO: 'Despachado',
  CANCELADO: 'Cancelado',
}
const estadoRotulos: Record<EstadoFisicoResiduo, string> = {
  LIQUIDO: 'Líquido',
  SOLIDO: 'Sólido',
  SEMISSOLIDO: 'Semissólido',
  GASOSO: 'Gasoso',
  OUTRO: 'Outro',
}
const segurancaRotulos: Record<MedidaSegurancaResiduo, string> = {
  LUVAS: 'Usar luvas de proteção',
  OCULOS_PROTECAO: 'Usar óculos de proteção',
  PROTECAO_RESPIRATORIA: 'Utilizar proteção respiratória',
  JALECO_AVENTAL: 'Usar jaleco ou avental',
  OUTRO: 'Outras medidas informadas',
}
function rotuloNivelRisco(nivel: NivelRiscoResiduo) {
  return ({ NENHUM: 'Nenhum', BAIXO: 'Baixo', MEDIO: 'Médio', ALTO: 'Alto' } as Record<NivelRiscoResiduo, string>)[nivel]
}
function formatarData(data: string | null | undefined) {
  if (!data) return 'Não informada'
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return ano && mes && dia ? [dia, mes, ano].join('/') : data
}
function unidadeLegivel(unidade: string) {
  return ({
    ML: 'mL', L: 'L', MG: 'mg', G: 'g', KG: 'kg', UNIDADE: 'un.',
    REACAO: 'reação', CAIXA: 'caixa', FRASCO: 'frasco',
    AMPOLA: 'ampola', PAR: 'par', METRO: 'm', OUTRO: '',
  } as Record<string, string>)[unidade] ?? unidade
}
function pictogramaFalhou(risco: TipoRiscoResiduo) {
  return pictogramasComErro.value.has(risco)
}
function registrarErroPictograma(risco: TipoRiscoResiduo) {
  pictogramasComErro.value = new Set([...pictogramasComErro.value, risco])
}
</script>

<template>
  <div class="label-frame" :style="frameStyle">
    <article class="residuo-label" :style="labelStyle" aria-label="Rótulo do resíduo">
      <header class="label-header">
        <div class="identification">
          <p class="eyebrow">RESÍDUO LABORATORIAL</p>
          <h2>{{ componentePrincipal }}</h2>
          <strong class="tracking-code">{{ dados.codigoRastreio }}</strong>
          <div class="header-quantity">
            <span class="field-label">QUANTIDADE</span>
            <strong>{{ dados.quantidade }} {{ unidadeLegivel(dados.unidadeMedida) }}</strong>
          </div>
        </div>
        <div class="origin">
          <strong class="system-name">SGL — Sistema de Gestão de Laboratórios</strong>
          <p><b>Unidade:</b> {{ dados.unidadeSigla }} — {{ dados.unidadeNome }}</p>
          <p><b>Laboratório:</b> {{ dados.laboratorioNome }}</p>
          <p><b>Gerador registrado:</b> {{ dados.geradorNome }}</p>
          <p><b>Informado em:</b> {{ formatarData(dados.dataInformacao) }}</p>
          <p><b>Situação:</b> {{ statusRotulos[dados.status] }}</p>
          <p v-if="!dados.impressaoPermitida" class="preview-status">Prévia — impressão não liberada</p>
          <p v-else-if="dados.dataRotulagem"><b>Liberado em:</b> {{ formatarData(dados.dataRotulagem) }}</p>
        </div>
      </header>

      <div class="label-body">
        <aside class="hazards">
          <h3>PICTOGRAMAS</h3>
          <div v-if="riscosVisiveis.length" class="hazard-grid">
            <div v-for="risco in riscosVisiveis" :key="risco" class="hazard-item">
              <img
                v-if="caminhoPictogramaResiduo(risco) && !pictogramaFalhou(risco)"
                :src="caminhoPictogramaResiduo(risco) ?? undefined"
                :alt="rotuloRiscoResiduo(risco)"
                @error="registrarErroPictograma(risco)"
              />
              <div v-else class="hazard-fallback" aria-hidden="true">!</div>
              <small>{{ rotuloRiscoResiduo(risco) }}</small>
            </div>
          </div>
          <p v-else class="no-hazard">Sem pictogramas registrados</p>
        </aside>

        <section class="information">
          <div class="risk-heading">
            <span class="field-label">{{ dados.classificacaoConfirmada ? 'NÍVEL DE RISCO CONFIRMADO' : 'NÍVEL DE RISCO INFORMADO — PRÉVIA' }}</span>
            <h3>{{ rotuloNivelRisco(dados.nivelRisco) }}</h3>
            <p>{{ riscosVisiveis.length
              ? riscosVisiveis.map(rotuloRiscoResiduo).join(' · ')
              : (dados.classificacaoConfirmada ? 'Sem riscos específicos confirmados' : 'Sem riscos específicos informados') }}</p>
          </div>

          <div class="composition">
            <h4>{{ dados.classificacaoConfirmada ? 'COMPOSIÇÃO REGISTRADA' : 'COMPOSIÇÃO INFORMADA' }}</h4>
            <p>{{ composicao }}</p>
          </div>

          <div class="info-grid">
            <div><h4>PROCESSO DE ORIGEM</h4><p>{{ dados.processoOrigem || 'Não informado' }}</p></div>
            <div><h4>ESTADO FÍSICO</h4><p>{{ dados.estadoFisico ? estadoRotulos[dados.estadoFisico] : 'Não informado' }}</p></div>
            <div><h4>ARMAZENAMENTO TEMPORÁRIO</h4><p>{{ dados.localArmazenamentoTemporario || 'Não informado' }}</p></div>
            <div><h4>RECIPIENTE</h4><p>{{ dados.recipiente || 'Não informado' }}</p></div>
            <div class="full-row"><h4>DESTINO PREVISTO</h4><p>{{ dados.destinoFinalPrevisto || 'Não informado' }}</p></div>
          </div>
          <p v-if="dados.dataPrevistaDespacho" class="dispatch-date">
            Despacho previsto: <strong>{{ formatarData(dados.dataPrevistaDespacho) }}</strong>
          </p>
        </section>
      </div>

      <section class="supplemental">
        <div class="safety-notes">
          <h3>MEDIDAS DE SEGURANÇA {{ dados.classificacaoConfirmada ? '(CONFIRMADAS)' : '(INFORMADAS)' }}</h3>
          <ul v-if="medidasVisiveis.length">
            <li v-for="medida in medidasVisiveis" :key="medida">{{ segurancaRotulos[medida] }}</li>
          </ul>
          <p v-else>Nenhuma medida {{ dados.classificacaoConfirmada ? 'confirmada' : 'informada' }}.</p>
          <p v-if="dados.observacaoSeguranca" class="safety-additional">{{ dados.observacaoSeguranca }}</p>
        </div>
        <div class="observations">
          <h3>OBSERVAÇÕES</h3>
          <p>{{ dados.observacoesRotulo || 'Sem observações adicionais registradas.' }}</p>
        </div>
      </section>

      <footer class="label-footer">
        <div class="embrapa-brand">
          <img v-if="!logoEmbrapaComErro" src="/assets/residuos/marcas/embrapa.png" alt="Embrapa" @error="logoEmbrapaComErro = true" />
          <strong v-else>EMBRAPA</strong>
        </div>
        <div class="description">
          <span class="field-label">DESCRIÇÃO</span>
          <strong>{{ dados.descricao }}</strong>
        </div>
        <div class="sgl-footer-brand">
          <img v-if="!logoSglComErro" src="/assets/residuos/marcas/sgl-logo.png.png" alt="SGL — Sistema de Gestão de Laboratórios" @error="logoSglComErro = true" />
          <strong v-else>SGL</strong>
        </div>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.label-frame{position:relative;flex:0 0 auto;overflow:visible}
.residuo-label{box-sizing:border-box;width:180mm;min-height:125mm;height:auto;border:1.2px solid #14273c;background:#fff;color:#111827;padding:6.5mm;display:flex;flex-direction:column;font-family:Arial,Helvetica,sans-serif;gap:0;print-color-adjust:exact;-webkit-print-color-adjust:exact}
.label-header{display:grid;grid-template-columns:1.23fr 1fr;gap:10mm;padding:1mm 0 5mm;border-bottom:1px solid #9eb4c8}
.identification,.origin,.information,.description{min-width:0}
.eyebrow{margin:0 0 3mm;font-size:9pt;font-weight:800;letter-spacing:.035em}
.identification h2{font-size:21pt;line-height:1.12;margin:0 0 3mm;overflow-wrap:anywhere}
.tracking-code{display:block;font-size:12pt;overflow-wrap:anywhere}
.field-label{font-weight:800;font-size:8pt;letter-spacing:.035em}
.header-quantity{margin-top:5mm;display:flex;flex-direction:column;gap:.7mm}
.header-quantity strong{font-size:15pt;line-height:1.2}
.origin{font-size:9pt;line-height:1.28}
.origin .system-name{font-size:11pt;line-height:1.25;display:block;margin:0 0 2mm}
.origin p{margin:1mm 0;overflow-wrap:anywhere}
.preview-status{font-weight:700;color:#9b2626}
.label-body{display:grid;grid-template-columns:43mm minmax(0,1fr);gap:6mm;padding:5mm 0;border-bottom:1px solid #9eb4c8;align-items:stretch}
.hazards{min-width:0;border-right:1px solid #9eb4c8;padding-right:5mm}
.hazards h3,.supplemental h3{font-size:9pt;font-weight:800;margin:0 0 3mm;letter-spacing:.025em}
.hazard-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4mm 2mm}
.hazard-item{text-align:center;min-width:0}
.hazard-item img,.hazard-fallback{display:block;width:17mm;height:17mm;max-width:100%;object-fit:contain;margin:0 auto 1.5mm}
.hazard-fallback{border:2px solid #c32727;font-size:16pt;font-weight:800;display:grid;place-items:center;box-sizing:border-box}
.hazard-item small{display:block;font-size:7pt;line-height:1.15;overflow-wrap:anywhere}
.no-hazard{font-size:8.5pt;line-height:1.3}
.information{display:flex;flex-direction:column;gap:3mm}
.risk-heading .field-label{font-size:8.5pt}
.risk-heading h3{font-size:19pt;line-height:1;margin:1mm 0}
.risk-heading p,.composition p,.info-grid p,.dispatch-date{margin:0;font-size:9pt;line-height:1.3;overflow-wrap:anywhere}
.composition h4,.info-grid h4{font-size:8.5pt;letter-spacing:.025em;font-weight:800;margin:0 0 1mm}
.composition p{font-weight:500}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:3.5mm 5mm}
.full-row{grid-column:1/-1}
.dispatch-date{margin-top:0}
.supplemental{display:grid;grid-template-columns:1.05fr 1fr;gap:6mm;padding:4mm 0;border-bottom:1px solid #9eb4c8}
.safety-notes{border-right:1px solid #9eb4c8;padding-right:5mm}
.safety-notes ul{margin:0;padding-left:5mm;display:grid;gap:.9mm}
.supplemental li,.supplemental p{font-size:9pt;line-height:1.3;overflow-wrap:anywhere}
.supplemental p{margin:0}
.safety-additional{margin-top:2mm!important;font-style:italic}
.label-footer{display:grid;grid-template-columns:38mm minmax(0,1fr) 38mm;gap:5mm;align-items:center;min-height:20mm;padding-top:4mm}
.embrapa-brand,.sgl-footer-brand{height:16mm;display:flex;align-items:center;justify-content:center;overflow:hidden}
.embrapa-brand img{display:block;width:34mm;height:16mm;object-fit:contain;object-position:center}
.sgl-footer-brand img{display:block;width:38mm;height:16mm;object-fit:contain;object-position:center}
.embrapa-brand strong,.sgl-footer-brand strong{font-size:14pt}
.description{display:flex;flex-direction:column;gap:2mm;align-items:flex-start;justify-content:center}
.description strong{font-size:9pt;line-height:1.3;overflow-wrap:anywhere}
@media print{
  .residuo-label{break-inside:avoid;page-break-inside:avoid}
}
</style>
