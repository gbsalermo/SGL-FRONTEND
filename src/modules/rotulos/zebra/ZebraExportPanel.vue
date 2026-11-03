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
} from './zpl'
import { prepararMarcasZpl, prepararPictogramasZpl } from './marcasZpl'

const props = defineProps<{
  documento: DocumentoZpl | null
  bloqueado?: boolean
}>()

const larguraMm = ref(90)
const alturaManualMm = ref(125)
const dpi = ref<ResolucaoZebra>(203)
const automatico = ref(true)
const orientacao = ref<OrientacaoConteudoZpl>('VERTICAL')
const erroZpl = ref('')
const gerando = ref(false)

// Mensagens antigas não devem persistir quando o usuário muda a mídia ou o registro.
watch([larguraMm, alturaManualMm, dpi, automatico, orientacao, () => props.documento], () => {
  erroZpl.value = ''
})

const recomendacao = computed(() => {
  if (!props.documento) return { config: null as ConfiguracaoZpl | null, erro: '' }
  try {
    return {
      config: recomendarConfiguracaoZpl(props.documento, Number(larguraMm.value), dpi.value),
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
  if (props.bloqueado || !documento || !configuracao || gerando.value) return
  gerando.value = true
  try {
    // Mesmas medidas usadas pela saída real, inclusive os pictogramas.
    validarEspacoZpl(documento, configuracao)
    const [marcas, pictogramas] = await Promise.all([
      prepararMarcasZpl(configuracao),
      prepararPictogramasZpl(configuracao, documento.pictogramas ?? [], documento.categoria),
    ])
    const zpl = gerarDocumentoZpl(documento, configuracao, marcas, pictogramas)
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
  <section class="zebra-panel no-print" aria-label="Exportação para impressora Zebra">
    <header>
      <div>
        <strong>Impressão Zebra — piloto ZPL</strong>
        <p>Escolha o tamanho automaticamente ou informe as medidas da sua etiqueta.</p>
      </div>
      <span class="zebra-stage">Validação física pendente</span>
    </header>

    <div class="zebra-mode" role="group" aria-label="Modo de dimensionamento da etiqueta">
      <button type="button" :class="{ chosen: automatico }" :aria-pressed="automatico" @click="selecionarModo(true)">
        Automático <span>Recomendado</span>
      </button>
      <button type="button" :class="{ chosen: !automatico }" :aria-pressed="!automatico" @click="selecionarModo(false)">
        Personalizado
      </button>
    </div>

    <div class="zebra-orientation" role="group" aria-label="Orientação do conteúdo impresso">
      <span>Orientação do conteúdo</span>
      <div class="zebra-mode">
        <button type="button" :class="{ chosen: orientacao === 'VERTICAL' }" :aria-pressed="orientacao === 'VERTICAL'" @click="selecionarOrientacao('VERTICAL')">
          <span aria-hidden="true">▯</span> Vertical
        </button>
        <button type="button" :class="{ chosen: orientacao === 'HORIZONTAL' }" :aria-pressed="orientacao === 'HORIZONTAL'" @click="selecionarOrientacao('HORIZONTAL')">
          <span aria-hidden="true">▭</span> Horizontal
        </button>
      </div>
    </div>

    <div class="zebra-options">
      <label>Largura da etiqueta (mm)
        <input v-model.number="larguraMm" type="number" min="40" max="110" step="1" />
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
      <button class="zebra-download" type="button"
        :disabled="bloqueado || !documento || gerando || !configuracaoEfetiva || !encaixeOrientacao.valido"
        @click="baixar">{{ gerando ? 'Preparando ZPL...' : 'Baixar ZPL' }}</button>
    </div>

    <p v-if="automatico && recomendacao.config" class="zebra-suggestion">
      <strong>Tamanho sugerido: {{ recomendacao.config.larguraMm }} × {{ recomendacao.config.alturaMm }} mm.</strong>
      Calculado a partir do conteúdo deste documento, sem cortar informações.
    </p>
    <p v-else-if="automatico && recomendacao.erro && documento" class="zebra-feedback zebra-error" role="alert">
      {{ recomendacao.erro }}
    </p>
    <p v-else-if="!automatico && configuracaoEfetiva" class="zebra-suggestion">
      <strong>Formato personalizado: {{ configuracaoEfetiva.larguraMm }} × {{ configuracaoEfetiva.alturaMm }} mm.</strong>
      O SGL verificará se o conteúdo cabe antes de baixar.
    </p>

    <p v-if="configuracaoEfetiva && encaixeOrientacao.mensagem" class="zebra-feedback zebra-error" role="alert">{{ encaixeOrientacao.mensagem }}</p>
    <p class="zebra-hint">
      Vertical e Horizontal mantêm exatamente a mesma largura e altura física da etiqueta; apenas o conteúdo é reorganizado e girado em 90°. A sugestão não altera a mídia instalada na impressora. Confira a largura, a altura e o dpi do papel real antes de imprimir.
      Pictogramas cadastrados são preservados; esta etiqueta não substitui a FDS nem as exigências de segurança aplicáveis.
    </p>
    <p v-if="bloqueado" class="zebra-feedback">A exportação respeita o bloqueio de impressão deste registro.</p>
    <p v-if="erroZpl" class="zebra-feedback zebra-error" role="alert">{{ erroZpl }}</p>
  </section>
</template>

<style scoped>
.zebra-panel { box-sizing: border-box; width: min(100%, 1060px); margin: 0 auto 14px; padding: 16px 18px; border: 1px solid #cad7e5; border-radius: 10px; background: #fff; color: #15243b; box-shadow: 0 7px 22px rgb(13 43 94 / 5%); }
.zebra-panel header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 13px; }
.zebra-panel header strong { font-size: 13px; }
.zebra-panel header p, .zebra-hint { margin: 4px 0 0; font-size: 11px; line-height: 1.45; color: #53647a; }
.zebra-stage { font-size: 10px; font-weight: 700; color: #805d12; background: #fff4d5; padding: 5px 9px; border-radius: 16px; }
.zebra-mode { display: inline-flex; gap: 4px; padding: 4px; border-radius: 8px; background: #edf2f8; margin-bottom: 12px; }
.zebra-mode button { border: 1px solid transparent; border-radius: 6px; min-height: 34px; padding: 0 13px; background: transparent; color: #415470; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
.zebra-mode button.chosen { border-color: #b8cce7; background: #fff; color: #174da3; box-shadow: 0 1px 5px rgb(13 43 94 / 9%); }
.zebra-mode button span { font-size: 9px; margin-left: 4px; color: #52779f; }
.zebra-orientation { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.zebra-orientation > span { font-size: 11px; color: #34445c; font-weight: 700; }
.zebra-orientation .zebra-mode { margin-bottom: 0; }
.zebra-orientation .zebra-mode button { min-width: 112px; }
.zebra-orientation .zebra-mode button span { font-size: 15px; margin-right: 5px; }
.zebra-options { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) auto; gap: 10px; align-items: end; }
.zebra-options label { display: flex; flex-direction: column; gap: 6px; min-width: 0; font-size: 10px; font-weight: 700; color: #34445c; }
.zebra-options input, .zebra-options select { min-height: 38px; width: 100%; box-sizing: border-box; border: 1px solid #aebed2; border-radius: 6px; padding: 0 9px; font: inherit; color: #15243b; background: #fff; }
.zebra-options input:disabled { background: #f0f5fa; color: #334b66; opacity: 1; cursor: default; }
.zebra-download { min-height: 38px; border: 1px solid #16479a; border-radius: 7px; background: #16479a; color: #fff; font-size: 11px; font-weight: 800; padding: 0 14px; cursor: pointer; }
.zebra-download:disabled { opacity: .5; cursor: not-allowed; }
.zebra-options input:focus-visible, .zebra-options select:focus-visible, .zebra-panel button:focus-visible { outline: 2px solid #2456c4; outline-offset: 2px; }
.zebra-suggestion { margin: 12px 0 0; padding: 9px 11px; border: 1px solid #cfdeef; border-radius: 7px; background: #f2f6fb; color: #344c6d; font-size: 11px; line-height: 1.4; }
.zebra-suggestion strong { color: #173f83; }
.zebra-hint { margin-top: 10px; }
.zebra-feedback { font-size: 11px; color: #805d12; margin: 10px 0 0; }
.zebra-error { color: #b42318; }
@media(max-width:730px) { .zebra-options { grid-template-columns: repeat(2,minmax(0,1fr)); } .zebra-download { grid-column: 1/-1; } .zebra-mode { width: 100%; box-sizing: border-box; } .zebra-mode button { flex: 1; } }
@media(max-width:440px) { .zebra-options { grid-template-columns: 1fr; } }
@media print { .zebra-panel { display: none !important; } }
</style>
