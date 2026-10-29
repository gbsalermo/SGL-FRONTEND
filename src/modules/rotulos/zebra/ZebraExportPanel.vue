<script setup lang="ts">
import { ref } from 'vue'
import { gerarDocumentoZpl, type DocumentoZpl, type ResolucaoZebra } from './zpl'

const props = defineProps<{
  documento: DocumentoZpl | null
  bloqueado?: boolean
}>()
const larguraMm = ref(90)
const alturaMm = ref(125)
const dpi = ref<ResolucaoZebra>(203)
const erroZpl = ref('')

function baixar() {
  erroZpl.value = ''
  if (props.bloqueado || !props.documento) return
  try {
    const zpl = gerarDocumentoZpl(props.documento, {
      larguraMm: Number(larguraMm.value),
      alturaMm: Number(alturaMm.value),
      dpi: dpi.value,
    })
    const nomeSeguro = props.documento.identificador
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
  }
}
</script>

<template>
  <section class="zebra-panel" aria-label="Exportação para impressora Zebra">
    <header>
      <div>
        <strong>Impressão Zebra — piloto ZPL</strong>
        <p>Exporta um arquivo de etiqueta textual. Não envia comandos diretamente à impressora.</p>
      </div>
      <span class="zebra-stage">Validação física pendente</span>
    </header>

    <div class="zebra-options">
      <label>Largura da mídia (mm)
        <input v-model.number="larguraMm" type="number" min="40" max="110" step="1" />
      </label>
      <label>Altura da mídia (mm)
        <input v-model.number="alturaMm" type="number" min="40" max="300" step="1" />
      </label>
      <label>Resolução da impressora
        <select v-model.number="dpi">
          <option :value="203">203 dpi</option>
          <option :value="300">300 dpi</option>
        </select>
      </label>
      <button type="button" :disabled="bloqueado || !documento" @click="baixar">Baixar ZPL</button>
    </div>
    <p class="zebra-hint">Confirme tamanho real, dpi e compatibilidade ZPL no equipamento antes de usar. Esta versão não reproduz logotipos ou pictogramas; os rótulos completos continuam disponíveis pela impressão normal.</p>
    <p v-if="bloqueado" class="zebra-feedback">A exportação respeita o bloqueio de impressão deste registro.</p>
    <p v-if="erroZpl" class="zebra-feedback zebra-error" role="alert">{{ erroZpl }}</p>
  </section>
</template>

<style scoped>
.zebra-panel{box-sizing:border-box;width:min(100%,1060px);margin:0 auto 14px;padding:16px 18px;border:1px solid #cad7e5;border-radius:10px;background:#fff;color:#15243b;box-shadow:0 7px 22px rgb(13 43 94 / 5%)}
.zebra-panel header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px}
.zebra-panel header strong{font-size:13px}
.zebra-panel header p,.zebra-hint{margin:4px 0 0;font-size:11px;line-height:1.45;color:#53647a}
.zebra-stage{font-size:10px;font-weight:700;color:#805d12;background:#fff4d5;padding:5px 9px;border-radius:16px}
.zebra-options{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:10px;align-items:end}
.zebra-options label{display:flex;flex-direction:column;gap:6px;min-width:0;font-size:10px;font-weight:700;color:#34445c}
.zebra-options input,.zebra-options select{min-height:38px;width:100%;box-sizing:border-box;border:1px solid #aebed2;border-radius:6px;padding:0 9px;font:inherit;color:#15243b;background:#fff}
.zebra-options button{min-height:38px;border:1px solid #16479a;border-radius:7px;background:#16479a;color:#fff;font-size:11px;font-weight:800;padding:0 14px;cursor:pointer}
.zebra-options button:disabled{opacity:.5;cursor:not-allowed}
.zebra-options input:focus-visible,.zebra-options select:focus-visible,.zebra-options button:focus-visible{outline:2px solid #2456c4;outline-offset:2px}
.zebra-hint{margin-top:10px}
.zebra-feedback{font-size:11px;color:#805d12;margin:10px 0 0}
.zebra-error{color:#b42318}
@media(max-width:730px){.zebra-options{grid-template-columns:repeat(2,minmax(0,1fr))}.zebra-options button{grid-column:1/-1}}
@media print{.zebra-panel{display:none!important}}
</style>
