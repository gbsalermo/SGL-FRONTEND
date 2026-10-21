<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import type { PedidoResponse } from '@/modules/pedidos/types/pedido'

const session = useSessionStore()
const pedidos = ref<PedidoResponse[]>([])
const carregando = ref(false)
const erro = ref('')
const termo = ref('')
const filtrados = computed(() => pedidos.value.filter(p =>
  [p.usuarioNome, p.atividadeOrigemNome, p.projetoNome, p.laboratorioNome, p.status]
    .some(x => (x || '').toLowerCase().includes(termo.value.toLowerCase()))))
async function carregar() {
  if (!session.usuario?.id) return
  carregando.value = true
  erro.value = ''
  try {
    const resposta = await http.get<PedidoResponse[]>(
      `/v1/pedidos-orientados/orientadores/${session.usuario.id}`)
    pedidos.value = resposta.data
  } catch(e) { erro.value = e instanceof Error ? e.message : 'Não foi possível listar os pedidos orientados.' }
  finally { carregando.value = false }
}
onMounted(carregar)
</script>
<template>
  <section class="pedidos-page">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">Supervisão / Orientandos</p>
        <h1>Pedidos dos orientandos</h1>
        <p class="page-subtitle">Acompanhe os pedidos dos estagiários sob sua orientação, dentro dos laboratórios autorizados. Consulta sem aprovação de estoque.</p>
      </div>
      <button type="button" class="secondary-action" :disabled="carregando" @click="carregar">Atualizar</button>
    </header>
    <p v-if="erro" role="alert">{{ erro }}</p>
    <div class="filters-row"><input v-model="termo" type="search" placeholder="Pesquisar orientando, projeto, atividade ou laboratório" /></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Solicitante</th><th>Atividade / Projeto</th><th>Laboratório</th><th>Solicitado em</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="p in filtrados" :key="p.id">
            <td><strong>{{ p.usuarioNome }}</strong></td>
            <td><strong>{{ p.atividadeOrigemNome || 'Atividade não registrada' }}</strong><small>{{ p.projetoNome || 'Sem projeto' }}</small></td>
            <td>{{ p.laboratorioNome }}</td>
            <td>{{ new Date(p.dataSolicitacao).toLocaleString('pt-BR') }}</td>
            <td>{{ p.status }}</td>
          </tr>
          <tr v-if="!filtrados.length"><td colspan="5">{{ carregando ? 'Carregando...' : 'Nenhum pedido encontrado.' }}</td></tr>
        </tbody>
      </table>
    </div>
    <small>Visão de homologação DEV. A identidade do orientador será validada pela integração institucional no ambiente real.</small>
  </section>
</template>