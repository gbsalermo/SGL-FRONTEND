<script setup lang="ts">
import {computed,onMounted,ref} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {useSessionStore} from '@/stores/session'
import {SglBreadcrumb,SglButton,SglStatusChip} from '@/components/common'
import {solucaoService} from '../services/solucaoService'
import {erroSolucao,exibirQuantidade,statusSolucaoLabel,type PedidoSolucao} from '../types/solucao'
import '../styles/solucoes.css'

const route=useRoute()
const router=useRouter()
const session=useSessionStore()
const pedidos=ref<PedidoSolucao[]>([])
const carregando=ref(false)
const erro=ref('')
const busca=ref('')
const expandidoId=ref<string|null>(null)
const criado=computed(()=>route.query.criado==='1')
const meusPedidos=computed(()=>pedidos.value.filter(p=>p.usuarioId===session.usuario?.id).sort((a,b)=>b.dataSolicitacao.localeCompare(a.dataSolicitacao)))
const filtrados=computed(()=>meusPedidos.value.filter(p=>!busca.value.trim()||[p.nomeSolucao,p.projetoNome,p.laboratorioNome,p.status,...p.itens.map(i=>i.produtoNome)].some(x=>String(x||'').toLocaleLowerCase('pt-BR').includes(busca.value.trim().toLocaleLowerCase('pt-BR')))))
const resumo=computed(()=>({
 pendentes:meusPedidos.value.filter(p=>p.status==='PENDENTE').length,
 preparo:meusPedidos.value.filter(p=>p.status==='EM_PREPARACAO').length,
 entregues:meusPedidos.value.filter(p=>p.status==='ENTREGUE').length,
}))
async function carregar(){
 carregando.value=true;erro.value=''
 try{if(!session.usuario?.id)throw new Error('Sessão não identificada.')
 pedidos.value=await solucaoService.listarMinhas(session.usuario.id)}
 catch(e){erro.value=erroSolucao(e)}finally{carregando.value=false}
}
onMounted(()=>void carregar())
</script>
<template>
<section class="sol-page">
 <header class="sol-header">
  <div><SglBreadcrumb :items="[{label:'Operação'},{label:'Soluções'}]"/><h1>Minhas soluções</h1><p>Acompanhe as preparações solicitadas, do pedido à entrega.</p></div>
  <div class="sol-actions"><SglButton variant="secondary" :disabled="carregando" @click="carregar">Atualizar</SglButton><SglButton variant="primary" @click="router.push('/solucoes/solicitar')">+ Solicitar solução</SglButton></div>
 </header>
 <div v-if="criado" class="sol-success">Solicitação enviada e aguardando análise do gestor.</div>
 <div v-if="erro" class="sol-error" role="alert">{{ erro }}</div>
 <div class="sol-summary">
  <div class="sol-stat"><span class="sol-muted">Pendentes</span><strong>{{ resumo.pendentes }}</strong></div>
  <div class="sol-stat"><span class="sol-muted">Em preparação</span><strong>{{ resumo.preparo }}</strong></div>
  <div class="sol-stat"><span class="sol-muted">Entregues</span><strong>{{ resumo.entregues }}</strong></div>
 </div>
 <section class="sol-card">
  <div class="sol-toolbar"><h2 style="margin:0">Histórico das minhas soluções</h2><input v-model="busca" type="search" placeholder="Buscar por solução, projeto ou status..." aria-label="Buscar soluções"/></div>
  <div v-if="carregando" class="sol-empty">Carregando solicitações...</div>
  <div v-else-if="!filtrados.length" class="sol-empty">Nenhuma Solução encontrada. Faça sua primeira solicitação.</div>
  <div v-else class="sol-table-wrap"><table class="sol-table"><thead><tr><th>Solução</th><th>Projeto</th><th>Solicitação</th><th>Status</th><th>Ações</th></tr></thead>
   <tbody v-for="pedido in filtrados" :key="pedido.id">
    <tr><td><strong>{{pedido.nomeSolucao||'Solução'}}</strong></td><td>{{pedido.projetoNome||'—'}}</td><td>{{new Date(pedido.dataSolicitacao).toLocaleDateString('pt-BR')}}</td>
     <td><SglStatusChip :tone="pedido.status==='ENTREGUE'?'success':pedido.status==='PENDENTE'?'warning':pedido.status==='EM_PREPARACAO'?'info':pedido.status==='REJEITADO'?'error':'neutral'">{{statusSolucaoLabel[pedido.status]}}</SglStatusChip></td>
     <td><SglButton variant="secondary" @click="expandidoId=expandidoId===pedido.id?null:pedido.id">{{expandidoId===pedido.id?'Ocultar':'Detalhes'}}</SglButton></td></tr>
    <tr v-if="expandidoId===pedido.id"><td colspan="5" class="sol-expanded-row"><div class="sol-details">
     <h3>Componentes da preparação</h3><ul class="sol-detail-list"><li v-for="item in pedido.itens" :key="item.id"><span>{{item.produtoNome}}</span><strong>{{exibirQuantidade(item.quantidadeNaUnidadeSolicitada??item.quantidadeSolicitada)}} {{item.unidadeMedidaSolicitada||''}}</strong></li></ul>
     <h3>Instruções de preparo</h3><p class="sol-note" style="white-space:pre-wrap">{{pedido.instrucoesPreparoSolucao||'Sem instruções registradas nesta solicitação.'}}</p>
     <p class="sol-muted">Exigências/observações: {{pedido.observacao||'Nenhuma'}}</p>
     <p v-if="pedido.status==='CANCELADO'" class="sol-note">{{pedido.solucaoPreparadaNoCancelamento?'Cancelado após o preparo. Os materiais permaneceram consumidos.':pedido.estoqueRevertidoNoCancelamento?'Cancelado antes do preparo, com reversão de estoque.':'Cancelado antes da aprovação.'}}</p>
    </div></td></tr>
   </tbody></table></div>
 </section>
</section>
</template>
