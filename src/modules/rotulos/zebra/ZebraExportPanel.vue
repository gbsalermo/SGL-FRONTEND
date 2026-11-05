<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  recomendarConfiguracaoZpl,
  validarEspacoZpl,
  gerarDocumentoZpl,
  type ConfiguracaoZpl,
  type DocumentoZpl,
  type ResolucaoZebra,
  type OrientacaoConteudoZpl,
  LARGURA_PADRAO_ZPL_MM,
  LARGURA_MAXIMA_ZPL_MM,
} from './zpl'
import { prepararMarcasZpl, prepararPictogramasZpl } from './marcasZpl'
import { listarImpressorasZebra, enviarZplParaZebra, type ImpressoraZebraLocal } from './browserPrintLocal'

const props = defineProps<{
  documento: DocumentoZpl | null
  bloqueado?: boolean
}>()

const larguraMm = ref(90)
const larguraAmpliadaConfirmada = ref(false)
const larguraAmpliada = computed(() => Number(larguraMm.value) > LARGURA_PADRAO_ZPL_MM)
const alturaManualMm = ref(125)
const dpi = ref<ResolucaoZebra>(203)
const automatico = ref(true)
const orientacao = ref<OrientacaoConteudoZpl>('VERTICAL')
const erroZpl = ref('')
const gerando = ref(false)
const buscandoImpressoras = ref(false)
const imprimindoZebra = ref(false)
const impressoras = ref<ImpressoraZebraLocal[]>([])
const impressoraSelecionada = ref('')
const mensagemImpressao = ref('')
const erroImpressora = ref('')

// Mensagens antigas não devem persistir quando o usuário muda a mídia ou o registro.
watch([larguraMm, alturaManualMm, dpi, automatico, orientacao, () => props.documento], () => {
  erroZpl.value = ''
  mensagemImpressao.value = ''
  erroImpressora.value = ''
})

const recomendacao = computed(() => {
  if (!props.documento) return { config: null as ConfiguracaoZpl | null, erro: '' }
  try {
    return {
      config: recomendarConfiguracaoZpl(props.documento, Number(larguraMm.value), dpi.value, orientacao.value),
      erro: '',
    }
  } catch (error) {
    return {
      config: null as ConfiguracaoZpl | null,
      erro: error instanceof Error ? error.message : 'Não foi possível determinar o tamanho adequado.',
    }
  }
})

const configuracaoEfetiva = computed<ConfiguracaoZpl | null>(() => {
  if (!props.documento) return null
  // A orientação troca apenas a leitura do conteúdo, nunca a mídia física.
  const fisico = automatico.value
    ? recomendacao.value.config
    : { larguraMm: Number(larguraMm.value), alturaMm: Number(alturaManualMm.value), dpi: dpi.value }
  return fisico ? { ...fisico, orientacao: orientacao.value } : null
})

const encaixeOrientacao = computed(() => {
  if (!props.documento || !configuracaoEfetiva.value) return { valido: false, mensagem: '' }
  try {
    validarEspacoZpl(props.documento, configuracaoEfetiva.value)
    return { valido: true, mensagem: '' }
  } catch (error) {
    return {
      valido: false,
      mensagem: error instanceof Error ? error.message : 'A orientação selecionada não cabe na etiqueta atual.',
    }
  }
})

function selecionarOrientacao(valor: OrientacaoConteudoZpl) {
  orientacao.value = valor
  erroZpl.value = ''
}

async function buscarImpressoras() {
  if (buscandoImpressoras.value || imprimindoZebra.value) return
  buscandoImpressoras.value = true
  erroImpressora.value = ''
  mensagemImpressao.value = ''
  impressoras.value = []
  impressoraSelecionada.value = ''
  try {
    const encontradas = await listarImpressorasZebra(window.location.protocol)
    impressoras.value = encontradas
    if (encontradas.length === 1) impressoraSelecionada.value = encontradas[0].uid
    if (!encontradas.length) {
      erroImpressora.value = 'Nenhuma Zebra encontrada. Verifique se o Browser Print está aberto e se a impressora está conectada.'
    }
  } catch (error) {
    erroImpressora.value = error instanceof Error ? error.message : 'Não foi possível localizar o serviço Zebra.'
  } finally {
    buscandoImpressoras.value = false
  }
}

async function prepararZpl(documento: DocumentoZpl, configuracao: ConfiguracaoZpl): Promise<string> {
  validarEspacoZpl(documento, configuracao)
  const [marcas, pictogramas] = await Promise.all([
    prepararMarcasZpl(configuracao),
    prepararPictogramasZpl(configuracao, documento.pictogramas ?? [], documento.categoria),
  ])
  return gerarDocumentoZpl(documento, configuracao, marcas, pictogramas)
}

async function imprimirDiretamente() {
  const documento = props.documento
  const configuracao = configuracaoEfetiva.value
  const impressora = impressoras.value.find(item => item.uid === impressoraSelecionada.value)
  if (props.bloqueado || !documento || !configuracao || !encaixeOrientacao.value.valido ||
      !impressora || imprimindoZebra.value || gerando.value ||
      (larguraAmpliada.value && !larguraAmpliadaConfirmada.value)) return
  // Ação explícita do operador: nunca enviar trabalho no carregamento da tela.
  if (!window.confirm(`Enviar 1 etiqueta de "${documento.subtitulo || documento.titulo}" para "${impressora.name}"? Confirme que a mídia física corresponde às dimensões selecionadas.`)) return
  imprimindoZebra.value = true
  erroImpressora.value = ''
  mensagemImpressao.value = ''
  try {
    const zpl = await prepararZpl(documento, configuracao)
    await enviarZplParaZebra(window.location.protocol, impressora, zpl)
    mensagemImpressao.value = 'ZPL enviado ao serviço Zebra para ' + impressora.name + '. Confira na impressora se a etiqueta foi realmente impressa.'
  } catch (error) {
    erroImpressora.value = error instanceof Error ? error.message : 'Não foi possível enviar a etiqueta à Zebra.'
  } finally {
    imprimindoZebra.value = false
  }
}

function selecionarModo(auto: boolean) {
  if (!auto && automatico.value && recomendacao.value.config) {
    alturaManualMm.value = recomendacao.value.config.alturaMm
  }
  automatico.value = auto
  erroZpl.value = ''
}

async function baixar() {
  erroZpl.value = ''
  const documento = props.documento
  const configuracao = configuracaoEfetiva.value
  if (props.bloqueado || !documento || !configuracao || gerando.value || imprimindoZebra.value) return
  gerando.value = true
  try {
    const zpl = await prepararZpl(documento, configuracao)
    const nomeSeguro = documento.identificador
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 65) || 'rotulo-sgl'
    const url = URL.createObjectURL(new Blob([zpl], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'SGL-' + nomeSeguro + '.zpl'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (error) {
    erroZpl.value = error instanceof Error ? error.message : 'Não foi possível gerar o ZPL.'
  } finally {
    gerando.value = false
  }
}
</script>

<template>
  <section class="zebra-panel no-print" aria-label="Impressão Zebra">
    <header class="zebra-header">
      <div class="zebra-header-copy">
        <strong>Impressão Zebra</strong>
        <p>ZPL · {{ orientacao === 'VERTICAL' ? 'Vertical' : 'Horizontal' }} · {{ automatico ? 'Automático' : 'Personalizado' }}
          · {{ configuracaoEfetiva?.larguraMm ?? larguraMm }} × {{ configuracaoEfetiva?.alturaMm ?? '—' }} mm · {{ dpi }} dpi</p>
      </div>
      <span class="zebra-stage">Validação física pendente</span>
    </header>

    <details class="zebra-settings">
      <summary>
        <span><span class="zebra-chevron" aria-hidden="true">›</span> Configurações da etiqueta</span>
        <span class="zebra-expand-hint">Expandir para alterar orientação e medidas</span>
      </summary>
      <div class="zebra-settings-body">
        <div class="zebra-controls-row">
          <div class="zebra-control-group">
            <span>Dimensionamento</span>
            <div class="zebra-mode" role="group" aria-label="Modo de dimensionamento">
              <button type="button" :class="{ chosen: automatico }" :aria-pressed="automatico" @click="selecionarModo(true)">
                Automático <span>Recomendado</span>
              </button>
              <button type="button" :class="{ chosen: !automatico }" :aria-pressed="!automatico" @click="selecionarModo(false)">
                Personalizado
              </button>
            </div>
          </div>
          <div class="zebra-control-group">
            <span>Orientação do conteúdo</span>
            <div class="zebra-mode" role="group" aria-label="Orientação do conteúdo impresso">
              <button type="button" :class="{ chosen: orientacao === 'VERTICAL' }" :aria-pressed="orientacao === 'VERTICAL'" @click="selecionarOrientacao('VERTICAL')">
                Vertical
              </button>
              <button type="button" :class="{ chosen: orientacao === 'HORIZONTAL' }" :aria-pressed="orientacao === 'HORIZONTAL'" @click="selecionarOrientacao('HORIZONTAL')">
                Horizontal
              </button>
            </div>
          </div>
        </div>

        <div class="zebra-options">
          <label>Largura da etiqueta (mm)
            <input v-model.number="larguraMm" type="number" min="40" :max="LARGURA_MAXIMA_ZPL_MM" step="1" />
          </label>
          <label>Altura da etiqueta (mm)
            <input v-if="automatico" :value="recomendacao.config?.alturaMm ?? '—'" type="text" disabled aria-label="Altura recomendada automaticamente" />
            <input v-else v-model.number="alturaManualMm" type="number" min="40" max="300" step="1" />
          </label>
          <label>Resolução Zebra
            <select v-model.number="dpi">
              <option :value="203">203 dpi</option>
              <option :value="300">300 dpi</option>
            </select>
          </label>
        </div>
        <p v-if="larguraAmpliada" class="zebra-wide-warning">
          <strong>Largura ampliada ({{ larguraMm }} mm).</strong> Esta opção exige uma Zebra com cabeça de impressão compatível
          com essa largura (por exemplo, um modelo de 6 polegadas). A maioria das Zebras de 4 polegadas não imprime 150 mm.
          <label><input v-model="larguraAmpliadaConfirmada" type="checkbox" />
            Confirmo que a impressora selecionada suporta esta largura física.</label>
        </p>
        <p v-if="automatico && recomendacao.config" class="zebra-suggestion">
          Altura sugerida para <strong>{{ orientacao === 'HORIZONTAL' ? 'horizontal' : 'vertical' }}:
          {{ recomendacao.config.alturaMm }} mm</strong>. O cálculo considera todo o conteúdo, incluindo os pictogramas.
        </p>

        <p class="zebra-hint">
          A orientação gira o conteúdo e os gráficos, mantendo a largura física escolhida. No automático, o SGL recomenda
          a menor altura que comporte a orientação selecionada; confirme as dimensões da etiqueta real antes de imprimir.
          O rótulo não substitui a FDS nem requisitos de segurança aplicáveis.
        </p>
        <p class="zebra-browser-link">Impressão direta requer o
          <a href="https://www.zebra.com/us/en/support-downloads/software/printer-software/browser-print.html"
            target="_blank" rel="noopener noreferrer">Zebra Browser Print</a> instalado e o SGL autorizado neste computador.
        </p>
      </div>
    </details>

    <div class="zebra-actions">
      <button class="zebra-download" type="button"
        :disabled="bloqueado || !documento || gerando || imprimindoZebra || !encaixeOrientacao.valido"
        @click="baixar">{{ gerando ? 'Gerando ZPL...' : 'Baixar ZPL' }}</button>
      <button type="button" class="zebra-find" :disabled="buscandoImpressoras || imprimindoZebra" @click="buscarImpressoras">
        {{ buscandoImpressoras ? 'Procurando...' : impressoras.length ? 'Atualizar impressoras' : 'Buscar impressoras' }}
      </button>
      <label v-if="impressoras.length" class="zebra-device-label">Impressora
        <select v-model="impressoraSelecionada" :disabled="imprimindoZebra">
          <option value="">Selecione uma impressora</option>
          <option v-for="item in impressoras" :key="item.uid" :value="item.uid">
            {{ item.name }} ({{ item.connection || item.uid }})
          </option>
        </select>
      </label>
      <button type="button" class="zebra-print"
        :disabled="bloqueado || !documento || gerando || imprimindoZebra || !encaixeOrientacao.valido || !impressoraSelecionada || (larguraAmpliada && !larguraAmpliadaConfirmada)"
        @click="imprimirDiretamente">{{ imprimindoZebra ? 'Enviando...' : 'Imprimir na Zebra' }}</button>
    </div>

    <p v-if="larguraAmpliada" class="zebra-feedback zebra-wide-alert">
      Largura {{ larguraMm }} mm: disponível para cálculo e prévia ZPL. Confira a capacidade da impressora antes de imprimir fisicamente.
    </p>
    <p v-if="automatico && recomendacao.erro && documento" class="zebra-feedback zebra-error" role="alert">
      {{ recomendacao.erro }}
    </p>
    <p v-if="encaixeOrientacao.mensagem && documento" class="zebra-feedback zebra-error" role="alert">
      {{ encaixeOrientacao.mensagem }}
    </p>
    <p v-if="erroImpressora" class="zebra-feedback zebra-error" role="alert">{{ erroImpressora }}</p>
    <p v-if="mensagemImpressao" class="zebra-feedback zebra-sent" role="status">{{ mensagemImpressao }}</p>
    <p v-if="bloqueado" class="zebra-feedback">A exportação respeita o bloqueio de impressão deste registro.</p>
    <p v-if="erroZpl" class="zebra-feedback zebra-error" role="alert">{{ erroZpl }}</p>
  </section>
</template>

<style scoped>
.zebra-panel { box-sizing: border-box; width: min(100%, 1060px); margin: 0 auto 12px; padding: 12px 16px; border: 1px solid #cad7e5; border-radius: 10px; background: #fff; color: #15243b; box-shadow: 0 5px 16px rgb(13 43 94 / 5%); }
.zebra-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.zebra-header-copy { min-width: 0; }
.zebra-header-copy strong { font-size: 13px; }
.zebra-header-copy p { margin: 3px 0 0; font-size: 11px; color: #53647a; line-height: 1.45; }
.zebra-stage { font-size: 10px; font-weight: 700; color: #805d12; background: #fff4d5; padding: 5px 9px; border-radius: 16px; }
.zebra-settings { margin-top: 9px; border: 1px solid #d7e1ee; border-radius: 7px; }
.zebra-settings > summary { padding: 9px 11px; cursor: pointer; display: flex; justify-content: space-between; gap: 9px; align-items: center; color: #214a83; font-size: 11px; font-weight: 700; list-style: none; }
.zebra-settings > summary::-webkit-details-marker { display: none; }
.zebra-settings > summary:focus-visible { outline: 2px solid #2456c4; outline-offset: 2px; }
.zebra-settings[open] > summary { border-bottom: 1px solid #d7e1ee; background: #f3f7fc; }
.zebra-chevron { display: inline-block; margin-right: 5px; font-size: 18px; line-height: 10px; transform: rotate(0deg); transition: transform .15s ease; }
.zebra-settings[open] .zebra-chevron { transform: rotate(90deg); }
.zebra-expand-hint { font-size: 10px; color: #63768f; font-weight: 400; text-align: right; }
.zebra-settings-body { padding: 12px; }
.zebra-controls-row { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; margin-bottom: 11px; }
.zebra-control-group { display: flex; flex-direction: column; gap: 5px; }
.zebra-control-group > span { font-size: 10px; font-weight: 700; color: #34445c; }
.zebra-mode { display: inline-flex; gap: 4px; padding: 3px; border-radius: 7px; background: #edf2f8; }
.zebra-mode button { border: 1px solid transparent; border-radius: 5px; min-height: 32px; padding: 0 12px; background: transparent; color: #415470; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
.zebra-mode button.chosen { border-color: #b8cce7; background: #fff; color: #174da3; box-shadow: 0 1px 5px rgb(13 43 94 / 9%); }
.zebra-mode button span { font-size: 9px; margin-left: 3px; color: #52779f; }
.zebra-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.zebra-options label { display: flex; flex-direction: column; gap: 6px; min-width: 0; font-size: 10px; font-weight: 700; color: #34445c; }
.zebra-options input, .zebra-options select, .zebra-device-label select { min-height: 36px; width: 100%; box-sizing: border-box; border: 1px solid #aebed2; border-radius: 6px; padding: 0 9px; font: inherit; color: #15243b; background: #fff; }
.zebra-options input:disabled { background: #f0f5fa; opacity: 1; color: #334b66; }
.zebra-suggestion { margin: 10px 0 0; font-size: 11px; color: #344c6d; }
.zebra-wide-warning { margin: 11px 0 0; padding: 10px 12px; border: 1px solid #dfc98b; border-radius: 7px; background: #fff9e9; font-size: 11px; color: #73510f; line-height: 1.45; }
.zebra-wide-warning strong { display: block; margin-bottom: 3px; }
.zebra-wide-warning label { display: flex; align-items: center; gap: 7px; margin-top: 7px; cursor: pointer; font-weight: 700; }
.zebra-wide-warning input { width: 15px; height: 15px; }
.zebra-wide-alert { color: #84601b; }
.zebra-hint, .zebra-browser-link { margin: 9px 0 0; font-size: 11px; line-height: 1.4; color: #53647a; }
.zebra-browser-link a { color: #174da3; text-decoration: underline; }
.zebra-actions { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; align-items: end; }
.zebra-actions button { min-height: 38px; border-radius: 7px; font-weight: 700; font-size: 11px; padding: 0 14px; cursor: pointer; }
.zebra-download { border: 1px solid #16479a; background: #16479a; color: #fff; }
.zebra-print { border: 1px solid #1b7549; background: #1b7549; color: #fff; }
.zebra-find { border: 1px solid #aebed2; background: #fff; color: #1d416f; }
.zebra-actions button:disabled { opacity: .5; cursor: not-allowed; }
.zebra-device-label { display: flex; min-width: 190px; max-width: 340px; flex: 1; flex-direction: column; gap: 4px; font-weight: 700; font-size: 10px; color: #34445c; }
.zebra-panel button:focus-visible, .zebra-panel input:focus-visible, .zebra-panel select:focus-visible { outline: 2px solid #2456c4; outline-offset: 2px; }
.zebra-feedback { font-size: 11px; color: #805d12; margin: 9px 0 0; }
.zebra-error { color: #b42318; }
.zebra-sent { color: #1b7549; font-weight: 650; }
@media (max-width: 680px) { .zebra-options { grid-template-columns: repeat(2, minmax(0, 1fr)); } .zebra-settings > summary { align-items: flex-start; } }
@media (max-width: 440px) { .zebra-options { grid-template-columns: 1fr; } .zebra-actions button { flex: 1; } .zebra-device-label { min-width: 100%; max-width: 100%; } .zebra-expand-hint { display: none; } }
@media print { .zebra-panel { display: none !important; } }
</style>
