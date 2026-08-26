<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { pedidoService } from '@/modules/pedidos/services/pedidoService'
import type {
  ApiErrorResponse,
  EstoqueCentralResponse,
  PedidoRequest,
  ProjetoResponse,
} from '@/modules/pedidos/types/pedido'
import { useSessionStore } from '@/stores/session'

interface ItemForm {
  produtoId: string
  quantidadeSolicitada: number
}

const router = useRouter()
const session = useSessionStore()

const projetos = ref<ProjetoResponse[]>([])
const estoques = ref<EstoqueCentralResponse[]>([])
const projetoId = ref('')
const urgente = ref(false)
const motivoUrgencia = ref('')
const observacao = ref('')
const itens = ref<ItemForm[]>([{ produtoId: '', quantidadeSolicitada: 1 }])
const carregandoDados = ref(false)
const enviando = ref(false)
const erro = ref('')

const usuario = computed(() => session.usuario)

const podeAdicionarItem = computed(() => {
  const todosSelecionados = itens.value.every((item) => Boolean(item.produtoId))
  const produtosDisponiveis = new Set(estoques.value.map((estoque) => estoque.produtoId)).size
  return todosSelecionados && itens.value.length < produtosDisponiveis
})

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? 'Não foi possível concluir a solicitação.'
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir a solicitação.'
}

async function carregarDados() {
  const laboratorioId = usuario.value?.laboratorioId
  const unidadeId = usuario.value?.unidadeId

  if (!laboratorioId || !unidadeId) {
    erro.value = 'Seu usuário precisa estar vinculado a laboratório e unidade para criar pedidos.'
    return
  }

  carregandoDados.value = true
  erro.value = ''

  try {
    const [projetosData, estoqueData] = await Promise.all([
      pedidoService.listarProjetosPorLaboratorio(laboratorioId),
      pedidoService.listarEstoquePorUnidade(unidadeId),
    ])

    projetos.value = projetosData
    estoques.value = estoqueData.filter((estoque) => estoque.ativo)
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    carregandoDados.value = false
  }
}

function adicionarItem() {
  if (!podeAdicionarItem.value) return
  itens.value.push({ produtoId: '', quantidadeSolicitada: 1 })
}

function removerItem(index: number) {
  if (itens.value.length === 1) return
  itens.value.splice(index, 1)
}

function opcoesProduto(index: number) {
  const selecionadosEmOutrasLinhas = new Set(
    itens.value
      .filter((_, itemIndex) => itemIndex !== index)
      .map((item) => item.produtoId)
      .filter(Boolean),
  )

  return estoques.value.filter(
    (estoque) =>
      estoque.produtoId === itens.value[index]?.produtoId ||
      !selecionadosEmOutrasLinhas.has(estoque.produtoId),
  )
}

function produtoSelecionado(produtoId: string) {
  return estoques.value.find((estoque) => estoque.produtoId === produtoId)
}

function alternarUrgencia() {
  urgente.value = !urgente.value

  if (!urgente.value) {
    motivoUrgencia.value = ''
  }
}

function validarFormulario() {
  if (!usuario.value?.id || !usuario.value.laboratorioId) {
    throw new Error('Sessão sem usuário ou laboratório válido.')
  }

  if (itens.value.some((item) => !item.produtoId || item.quantidadeSolicitada < 1)) {
    throw new Error('Preencha todos os produtos e quantidades do pedido.')
  }

  const produtos = itens.value.map((item) => item.produtoId)
  if (new Set(produtos).size !== produtos.length) {
    throw new Error('O mesmo produto não pode ser adicionado mais de uma vez.')
  }

  if (urgente.value && !motivoUrgencia.value.trim()) {
    throw new Error('Informe o motivo da urgência.')
  }
}

async function enviarPedido() {
  erro.value = ''

  try {
    validarFormulario()

    const payload: PedidoRequest = {
      usuarioId: usuario.value!.id,
      laboratorioId: usuario.value!.laboratorioId!,
      projetoId: projetoId.value || null,
      urgente: urgente.value,
      motivoUrgencia: urgente.value ? motivoUrgencia.value.trim() : null,
      observacao: observacao.value.trim() || null,
      arquivoDocumento: null,
      itens: itens.value.map((item) => ({
        produtoId: item.produtoId,
        quantidadeSolicitada: item.quantidadeSolicitada,
      })),
    }

    enviando.value = true
    await pedidoService.criar(payload)
    await router.push({ path: '/meus-pedidos', query: { criado: '1' } })
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    enviando.value = false
  }
}

onMounted(carregarDados)
</script>

<template>
  <section class="novo-pedido-page">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">Pedidos / Novo pedido</p>
        <h1>Novo pedido</h1>
        <p>Solicite materiais disponíveis na unidade vinculada ao seu laboratório.</p>
      </div>
      <button class="secondary-action" type="button" @click="router.push('/meus-pedidos')">
        Voltar para meus pedidos
      </button>
    </header>

    <div class="context-grid">
      <article>
        <span>Solicitante</span>
        <strong>{{ usuario?.nome }}</strong>
        <small>{{ usuario?.email }}</small>
      </article>
      <article>
        <span>Laboratório</span>
        <strong>{{ usuario?.laboratorioNome ?? 'Não vinculado' }}</strong>
        <small>{{ usuario?.unidadeNome ?? 'Unidade não vinculada' }}</small>
      </article>
    </div>

    <form class="request-surface" @submit.prevent="enviarPedido">
      <section class="form-section">
        <div class="section-title">
          <div>
            <span>1</span>
            <div>
              <h2>Contexto da solicitação</h2>
              <p>Vincule um projeto e informe dados que ajudem a gestão a compreender o pedido.</p>
            </div>
          </div>
        </div>

        <label class="field">
          <span>Projeto <small>(opcional)</small></span>
          <select v-model="projetoId" :disabled="carregandoDados">
            <option value="">Sem projeto vinculado</option>
            <option v-for="projeto in projetos" :key="projeto.id" :value="projeto.id">
              {{ projeto.nome }}
            </option>
          </select>
        </label>

        <div class="urgency-field">
          <div>
            <span class="field-label">Urgência <small>(opcional)</small></span>
            <p>A marcação apenas informa a gestão e não altera automaticamente o fluxo do pedido.</p>
          </div>

          <button
            class="urgency-toggle"
            :class="{ 'urgency-toggle--active': urgente }"
            type="button"
            :aria-pressed="urgente"
            @click="alternarUrgencia"
          >
            <span class="urgency-toggle__indicator" aria-hidden="true" />
            {{ urgente ? 'Pedido urgente' : 'Marcar como urgente' }}
          </button>
        </div>

        <label v-if="urgente" class="field urgency-reason">
          <span>Motivo da urgência</span>
          <textarea
            v-model="motivoUrgencia"
            rows="3"
            maxlength="500"
            required
            placeholder="Explique por que este pedido precisa de atenção da gestão..."
          />
          <small>{{ motivoUrgencia.length }}/500 caracteres</small>
        </label>

        <label class="field">
          <span>Observação <small>(opcional)</small></span>
          <textarea
            v-model="observacao"
            rows="3"
            placeholder="Informe finalidade, contexto do uso ou alguma orientação para a gestão..."
          />
        </label>
      </section>

      <section class="form-section">
        <div class="section-title section-title--action">
          <div>
            <span>2</span>
            <div>
              <h2>Materiais solicitados</h2>
              <p>Cada produto pode aparecer apenas uma vez. Para pedir mais, ajuste a quantidade.</p>
            </div>
          </div>
          <button
            type="button"
            :disabled="!podeAdicionarItem"
            :title="podeAdicionarItem ? 'Adicionar outro produto' : 'Selecione o produto atual ou todos os produtos já foram adicionados'"
            @click="adicionarItem"
          >
            + Adicionar item
          </button>
        </div>

        <div v-if="carregandoDados" class="state-box">Carregando produtos disponíveis...</div>

        <div v-else class="items-list">
          <div v-for="(item, index) in itens" :key="index" class="item-row">
            <label class="field item-product">
              <span>Produto</span>
              <select v-model="item.produtoId" required>
                <option value="" disabled>Selecione um produto</option>
                <option
                  v-for="estoque in opcoesProduto(index)"
                  :key="estoque.id"
                  :value="estoque.produtoId"
                >
                  {{ estoque.produtoNome }} — {{ estoque.produtoUnidadeArmazenamento }}
                </option>
              </select>
              <small v-if="produtoSelecionado(item.produtoId)">
                Estoque registrado: {{ produtoSelecionado(item.produtoId)?.quantidadeAtual }}
              </small>
            </label>

            <label class="field item-quantity">
              <span>Quantidade</span>
              <input v-model.number="item.quantidadeSolicitada" type="number" min="1" required />
            </label>

            <button
              class="remove-item"
              type="button"
              :disabled="itens.length === 1"
              aria-label="Remover item"
              @click="removerItem(index)"
            >
              ×
            </button>
          </div>
        </div>
      </section>

      <div v-if="erro" class="error-banner">{{ erro }}</div>

      <footer class="form-footer">
        <p>
          O pedido ficará pendente até análise da gestão.
          <span class="urgent-footer-note">Marque o pedido como urgente apenas quando necessário.</span>
        </p>
        <button class="primary-action" type="submit" :disabled="enviando || carregandoDados">
          {{ enviando ? 'Enviando...' : 'Enviar pedido' }}
        </button>
      </footer>
    </form>
  </section>
</template>

<style scoped>
.novo-pedido-page {
  width: min(100%, 1080px);
  margin: 0 auto;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.breadcrumb {
  margin: 0 0 10px;
  color: var(--sgl-text-muted);
  font-size: 13px;
}

.page-heading h1 {
  margin: 0;
  font-size: clamp(28px, 3vw, 38px);
  letter-spacing: -0.035em;
}

.page-heading > div > p:last-child {
  margin: 8px 0 0;
  color: var(--sgl-text-muted);
  font-size: 14px;
}

.secondary-action,
.section-title--action button {
  min-height: 40px;
  padding: 0 13px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #344258;
  font-weight: 700;
  cursor: pointer;
}

.secondary-action:hover,
.section-title--action button:hover:not(:disabled) {
  border-color: var(--sgl-primary);
  color: var(--sgl-primary);
}

.section-title--action button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.context-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.context-grid article {
  padding: 15px 17px;
  border: 1px solid var(--sgl-border);
  border-radius: 8px;
  background: #fff;
}

.context-grid span,
.context-grid small {
  display: block;
  color: var(--sgl-text-muted);
}

.context-grid span {
  margin-bottom: 5px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.context-grid strong {
  display: block;
  font-size: 14px;
}

.context-grid small {
  margin-top: 3px;
  font-size: 11px;
}

.request-surface {
  overflow: hidden;
  border: 1px solid var(--sgl-border);
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 26px rgb(15 37 71 / 5%);
}

.form-section {
  padding: 22px;
  border-bottom: 1px solid var(--sgl-border);
}

.section-title {
  margin-bottom: 18px;
}

.section-title,
.section-title > div,
.section-title--action {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.section-title--action {
  justify-content: space-between;
}

.section-title > div > span {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #eaf1ff;
  color: var(--sgl-primary);
  font-size: 12px;
  font-weight: 800;
}

.section-title h2 {
  margin: 0;
  font-size: 16px;
}

.section-title p {
  margin: 4px 0 0;
  color: var(--sgl-text-muted);
  font-size: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field + .field,
.urgency-field + .field,
.field + .urgency-field {
  margin-top: 16px;
}

.field > span,
.field-label {
  color: #2b374c;
  font-size: 12px;
  font-weight: 750;
}

.field > span small,
.field-label small {
  color: var(--sgl-text-muted);
  font-weight: 500;
}

.field select,
.field input,
.field textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: var(--sgl-text);
  font: inherit;
  outline: 0;
}

.field select,
.field input {
  min-height: 44px;
  padding: 0 12px;
}

.field textarea {
  resize: vertical;
  padding: 11px 12px;
}

.field select:focus,
.field input:focus,
.field textarea:focus {
  border-color: var(--sgl-primary);
  box-shadow: 0 0 0 3px rgb(26 77 161 / 8%);
}

.field > small {
  color: var(--sgl-text-muted);
  font-size: 10px;
}

.urgency-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px;
  border: 1px solid #e5eaf1;
  border-radius: 8px;
  background: #fbfcfe;
}

.urgency-field p {
  margin: 4px 0 0;
  color: var(--sgl-text-muted);
  font-size: 11px;
}

.urgency-toggle {
  min-height: 40px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 13px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #344258;
  font-weight: 750;
  cursor: pointer;
}

.urgency-toggle:hover {
  border-color: #dc2626;
  color: #b42318;
}

.urgency-toggle--active {
  border-color: #fecaca;
  background: #fff1f1;
  color: #b42318;
}

.urgency-toggle__indicator {
  width: 9px;
  height: 9px;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.urgency-toggle--active .urgency-toggle__indicator {
  background: currentColor;
}

.urgency-reason textarea {
  border-color: #f2b8b5;
  background: #fffafa;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 130px 38px;
  align-items: end;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e5eaf1;
  border-radius: 8px;
  background: #fbfcfe;
}

.item-row .field + .field {
  margin-top: 0;
}

.remove-item {
  width: 38px;
  height: 44px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  color: #b42318;
  font-size: 20px;
  cursor: pointer;
}

.remove-item:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.state-box {
  padding: 24px;
  color: var(--sgl-text-muted);
  text-align: center;
}

.error-banner {
  margin: 18px 22px 0;
  padding: 12px 14px;
  border: 1px solid #fecaca;
  border-radius: 7px;
  background: #fff1f1;
  color: #b42318;
  font-size: 12px;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 22px;
  background: #fbfcfe;
}

.form-footer p {
  margin: 0;
  color: var(--sgl-text-muted);
  font-size: 12px;
}

.urgent-footer-note {
  display: block;
  margin-top: 4px;
  color: #b42318;
  font-weight: 700;
}

.primary-action {
  min-height: 44px;
  padding: 0 20px;
  border: 0;
  border-radius: 6px;
  background: var(--sgl-primary);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.primary-action:hover:not(:disabled) {
  background: var(--sgl-primary-dark);
}

.primary-action:disabled {
  opacity: 0.6;
  cursor: wait;
}

@media (max-width: 720px) {
  .page-heading,
  .form-footer,
  .section-title--action,
  .urgency-field {
    align-items: stretch;
    flex-direction: column;
  }

  .secondary-action,
  .primary-action,
  .section-title--action button,
  .urgency-toggle {
    align-self: flex-start;
  }

  .context-grid,
  .item-row {
    grid-template-columns: 1fr;
  }

  .remove-item {
    width: 100%;
  }
}
</style>
