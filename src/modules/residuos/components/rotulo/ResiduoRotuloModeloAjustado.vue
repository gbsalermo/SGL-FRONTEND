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
          <p v-if="dados.projetoOrigemNome"><b>Projeto:</b> {{ dados.projetoOrigemNome }}</p>
          <p v-if="dados.sciOrigemNome"><b>SCI:</b> {{ dados.sciOrigemNome }}</p>
          <p v-if="dados.atividadeOrigemNome"><b>Atividade:</b> {{ dados.atividadeOrigemNome }}</p>
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
          <div class="risk-and-traceability">
            <div class="risk-heading">
              <span class="field-label">{{ dados.classificacaoConfirmada ? 'NÍVEL DE RISCO CONFIRMADO' : 'NÍVEL DE RISCO INFORMADO — PRÉVIA' }}</span>
              <h3>{{ rotuloNivelRisco(dados.nivelRisco) }}</h3>
              <p>{{ riscosVisiveis.length
                ? riscosVisiveis.map(rotuloRiscoResiduo).join(' · ')
                : (dados.classificacaoConfirmada ? 'Sem riscos específicos confirmados' : 'Sem riscos específicos informados') }}</p>
            </div>
            <div class="traceability">
              <p><b>Gerador:</b> {{ dados.geradorNome }}</p>
              <p><b>Informado em:</b> {{ formatarData(dados.dataInformacao) }}</p>
              <p><b>Situação:</b> {{ statusRotulos[dados.status] }}</p>
              <p v-if="!dados.impressaoPermitida" class="preview-status">Prévia — impressão não liberada</p>
              <template v-else-if="dados.dataRotulagem">
                <p><b>Liberado em:</b> {{ formatarData(dados.dataRotulagem) }}</p>
                <p><b>Responsável pela liberação:</b> {{ dados.responsavelLiberacaoNome || 'Não identificado no histórico' }}</p>
              </template>
            </div>
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
        </div>
        <div class="observations">
          <h3>OBSERVAÇÕES</h3>
          <p v-if="dados.observacoesRotulo">{{ dados.observacoesRotulo }}</p>
          <div v-if="dados.observacaoSeguranca" class="observation-safety">
            <strong>Observação de segurança</strong>
            <p>{{ dados.observacaoSeguranca }}</p>
          </div>
          <p v-if="!dados.observacoesRotulo && !dados.observacaoSeguranca">Sem observações adicionais registradas.</p>
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
/* A etiqueta base é horizontal: 180 x 125 mm.
   Conteúdo longo expande a altura, sem esconder seções ou invadir o rodapé. */
.label-frame{position:relative;flex:0 0 auto;overflow:visible}
.residuo-label{
  box-sizing:border-box;width:180mm;min-height:125mm;height:auto;
  padding:5mm 6mm;border:1.2px solid #14273c;background:#fff;color:#111827;
  font-family:Arial,Helvetica,sans-serif;display:grid;
  grid-template-rows:auto minmax(0,1fr) auto auto;gap:0;
  print-color-adjust:exact;-webkit-print-color-adjust:exact;
}
/* Mais espaço útil em largura e menos altura acumulada no cabeçalho. */
.label-header{
  display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,1fr);
  gap:8mm;align-items:start;padding:0 0 3mm;
  border-bottom:1px solid #9eb4c8;
}
.identification,.origin,.information,.description{min-width:0}
.eyebrow{margin:0 0 1.8mm;font-size:9pt;font-weight:800;letter-spacing:.035em}
.identification h2{font-size:20pt;line-height:1.1;margin:0 0 2mm;overflow-wrap:anywhere}
.tracking-code{display:block;font-size:11.5pt;overflow-wrap:anywhere}
.field-label{font-weight:800;font-size:8pt;letter-spacing:.035em}
.header-quantity{margin-top:3.5mm;display:flex;flex-direction:column;gap:.5mm}
.header-quantity strong{font-size:14pt;line-height:1.1}
.origin{font-size:9pt;line-height:1.18}
.origin .system-name{font-size:10.5pt;line-height:1.2;display:block;margin:0 0 1.5mm}
.origin p{margin:.6mm 0;overflow-wrap:anywhere}
.preview-status{font-weight:700;color:#9b2626}
/* Pictogramas em uma coluna; campos operacionais em duas colunas reais. */
.label-body{
  display:grid;grid-template-columns:43mm minmax(0,1fr);gap:6mm;
  padding:3.5mm 0 3.5mm;border-bottom:1px solid #9eb4c8;align-items:stretch;
}
.hazards{min-width:0;border-right:1px solid #9eb4c8;padding-right:4mm}
.hazards h3,.supplemental h3{
  font-size:8.7pt;font-weight:800;margin:0 0 2mm;letter-spacing:.025em;
}
.hazard-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2mm}
.hazard-item{text-align:center;min-width:0}
.hazard-item img,.hazard-fallback{
  display:block;width:18mm;height:18mm;max-width:100%;
  object-fit:contain;margin:0 auto 1mm;
}
.hazard-fallback{
  border:2px solid #c32727;font-size:16pt;font-weight:800;
  display:grid;place-items:center;box-sizing:border-box;
}
.hazard-item small{display:block;font-size:7pt;line-height:1.12;overflow-wrap:anywhere}
.no-hazard{font-size:8.5pt;line-height:1.2}
.information{display:flex;flex-direction:column;gap:2mm}
.risk-and-traceability{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);column-gap:4mm;align-items:start;padding-bottom:2.2mm;border-bottom:1px solid #e2e8f0}
.risk-heading,.traceability{min-width:0}
.traceability{padding-left:3mm;border-left:1px solid #cbd5e1;font-size:8.3pt;line-height:1.18}
.traceability p{margin:0 0 .9mm;overflow-wrap:anywhere}
.traceability b{font-weight:700}
.risk-heading .field-label{font-size:8.5pt}
.risk-heading h3{font-size:18pt;line-height:1;margin:.7mm 0}
.risk-heading p,.composition p,.info-grid p,.dispatch-date{
  margin:0;font-size:9.2pt;line-height:1.22;overflow-wrap:anywhere;
}
.composition h4,.info-grid h4{
  font-size:8.3pt;letter-spacing:.025em;font-weight:800;margin:0 0 .7mm;
}
.composition p{font-weight:500}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:2.6mm 6mm}
.full-row{grid-column:1/-1}
.dispatch-date{margin-top:0}
/* As duas informações secundárias dividem uma faixa curta, como no esboço. */
.supplemental{
  display:grid;grid-template-columns:1fr 1fr;gap:6mm;
  padding:2.8mm 0 3mm;border-bottom:1px solid #9eb4c8;align-items:start;
}
.safety-notes{border-right:1px solid #9eb4c8;padding-right:5mm;min-width:0}
.observations{min-width:0}
.safety-notes ul{margin:0;padding-left:5mm;display:grid;gap:.5mm}
.supplemental li,.supplemental p{font-size:8.9pt;line-height:1.22;overflow-wrap:anywhere}
.supplemental p{margin:0}
.observation-safety{margin-top:1.8mm}.observation-safety strong{display:block;font-size:8pt;margin-bottom:.8mm}
/* Rodapé alinhado numa faixa horizontal, sem uma segunda marca no topo. */
.label-footer{
  display:grid;grid-template-columns:38mm minmax(0,1fr) 38mm;gap:5mm;
  align-items:center;min-height:17mm;padding-top:2.5mm;
}
.embrapa-brand,.sgl-footer-brand{
  height:15mm;display:flex;align-items:center;justify-content:center;overflow:hidden;
}
.embrapa-brand img{display:block;width:34mm;height:15mm;object-fit:contain;object-position:center}
.sgl-footer-brand img{display:block;width:38mm;height:15mm;object-fit:contain;object-position:center}
.embrapa-brand strong,.sgl-footer-brand strong{font-size:14pt}
.description{
  display:flex;flex-direction:column;gap:1mm;align-items:flex-start;
  justify-content:center;min-width:0;
}
.description strong{font-size:9pt;line-height:1.22;overflow-wrap:anywhere}
@media print{
  .residuo-label{break-inside:avoid;page-break-inside:avoid}
}
</style>
