<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModelosResiduoAdminView from '@/modules/admin/views/ModelosResiduoAdminView.vue'
import ModelosSolucaoAdminView from '@/modules/admin/views/ModelosSolucaoAdminView.vue'

const props=withDefaults(defineProps<{embedded?:boolean}>(),{embedded:false})
const route=useRoute()
const router=useRouter()
const local=ref<'RESIDUOS'|'SOLUCOES'>('RESIDUOS')
const tipo=computed(() => {
  if (props.embedded) return local.value
  return route.query.tipo === 'solucoes' ? 'SOLUCOES' : 'RESIDUOS'
})
function selecionar(novo:'RESIDUOS'|'SOLUCOES') {
  if(props.embedded) {local.value=novo;return}
  void router.replace({query:{...route.query,tipo:novo==='SOLUCOES'?'solucoes':'residuos'}})
}
</script>
<template>
  <div class="catalogos-conjuntos">
    <header v-if="!embedded" class="catalogos-conjuntos__header">
      <div><span>ADMINISTRAÇÃO / CADASTROS</span><h1>Resíduos e soluções</h1><p>Modelos reutilizáveis cadastrados pelo Administrador.</p></div>
      <router-link class="catalogos-conjuntos__link" to="/administracao/cadastros">Voltar aos cadastros</router-link>
    </header>
    <div class="catalogos-conjuntos__tabs" role="tablist" aria-label="Selecionar catálogo">
      <button type="button" role="tab" :aria-selected="tipo==='RESIDUOS'" :class="{active:tipo==='RESIDUOS'}" @click="selecionar('RESIDUOS')">Modelos de resíduos</button>
      <button type="button" role="tab" :aria-selected="tipo==='SOLUCOES'" :class="{active:tipo==='SOLUCOES'}" @click="selecionar('SOLUCOES')">Modelos de soluções</button>
    </div>
    <ModelosResiduoAdminView v-if="tipo==='RESIDUOS'" :embedded="true" />
    <ModelosSolucaoAdminView v-else :embedded="true" />
  </div>
</template>
<style scoped>
.catalogos-conjuntos {width:100%;max-width:1500px;margin:0 auto;color:var(--sgl-text);}
.catalogos-conjuntos__header {display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:20px;}
.catalogos-conjuntos__header span {color:var(--sgl-primary);font-size:11px;letter-spacing:.06em;font-weight:800;}
.catalogos-conjuntos__header h1 {margin:5px 0;font-size:var(--sgl-font-page-title);}
.catalogos-conjuntos__header p {color:var(--sgl-text-muted);font-size:13px;}
.catalogos-conjuntos__link {align-self:center;text-decoration:none;border:1px solid var(--sgl-border-strong);border-radius:var(--sgl-radius-control);padding:10px 14px;color:var(--sgl-text);font-size:12px;font-weight:700;}
.catalogos-conjuntos__tabs {display:flex;flex-wrap:wrap;gap:0;border-bottom:1px solid var(--sgl-border);margin-bottom:20px;}
.catalogos-conjuntos__tabs button {font:inherit;font-size:13px;font-weight:700;border:0;border-bottom:2px solid transparent;background:transparent;padding:13px 17px;color:var(--sgl-text-muted);cursor:pointer;}
.catalogos-conjuntos__tabs button.active {border-bottom-color:var(--sgl-primary);color:var(--sgl-primary);}
.catalogos-conjuntos__tabs button:hover {background:var(--sgl-surface-interactive);}
</style>
