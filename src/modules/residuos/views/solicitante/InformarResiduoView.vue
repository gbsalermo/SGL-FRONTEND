<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

import { residuoService } from '@/modules/residuos/services/residuoService'
import type {
  ApiErrorResponse,
  CriarResiduoRequest,
  NivelRiscoResiduo,
  ProdutoResiduoResponse,
  ProjetoResiduoResponse,
  ResiduoResponse,
  TipoRiscoResiduo,
  UnidadeMedidaResiduo,
} from '@/modules/residuos/types/residuo'
import { useSessionStore } from '@/stores/session'

type OrigemComponente = 'CATALOGO' | 'LIVRE'

interface ComponenteForm {
  origem: OrigemComponente
  produtoId: string
  nomeComponente: string
  principal: boolean
  concentracaoOuQuantidade: string
  observacao: string
}

const niveisRisco: Array<{ value: NivelRiscoResiduo; label: string }> = [
  { value: 'NENHUM', label: 'Nenhum' },
  { value: 'BAIXO', label: 'Baixo' },
  { value: 'MEDIO', label: 'Médio' },
  { value: 'ALTO', label: 'Alto' },
]

const tiposRisco: Array<{ value: Exclude<TipoRiscoResiduo, 'NENHUM'>; label: string }> = [
  { value: 'INFLAMAVEL', label: 'Inflamável' },
  { value: 'RADIOATIVO', label: 'Radioativo' },
  { value: 'TOXICO', label: 'Tóxico' },
  { value: 'CORROSIVO', label: 'Corrosivo' },
  { value: 'BIOLOGICO', label: 'Biológico' },
  { value: 'IRRITANTE', label: 'Irritante' },
  { value: 'PERIGO_SAUDE', label: 'Perigo à saúde' },
  { value: 'OXIDANTE', label: 'Oxidante' },
  { value: 'EXPLOSIVO', label: 'Explosivo' },
  { value: 'GAS_PRESSURIZADO', label: 'Gás pressurizado' },
  { value: 'PERIGO_AMBIENTAL', label: 'Perigo ambiental' },
]

const unidadesMedida: Array<{ value: UnidadeMedidaResiduo; label: string }> = [
  { value: 'ML', label: 'mL' },
  { value: 'L', label: 'L' },
  { value: 'MG', label: 'mg' },
  { value: 'G', label: 'g' },
  { value: 'KG', label: 'kg' },
  { value: 'UNIDADE', label: 'Unidade' },
  { value: 'REACAO', label: 'Reação' },
  { value: 'CAIXA', label: 'Caixa' },
  { value: 'FRASCO', label: 'Frasco' },
  { value: 'AMPOLA', label: 'Ampola' },
  { value: 'PAR', label: 'Par' },
  { value: 'METRO', label: 'Metro' },
  { value: 'OUTRO', label: 'Outro' },
]

const session = useSessionStore()
const projetos = ref<ProjetoResiduoResponse[]>([])
const produtos = ref<ProdutoResiduoResponse[]>([])
const projetoId = ref('')
const descricao = ref('')
const processoOrigem = ref('')
const recipiente = ref('')
const quantidade = ref<number | null>(null)
const unidadeMedida = ref<UnidadeMedidaResiduo>('ML')
const nivelRiscoInformado = ref<NivelRiscoResiduo>('BAIXO')
const riscosInformados = ref<TipoRiscoResiduo[]>([])
const observacaoGerador = ref('')
const componentes = ref<ComponenteForm[]>([novoComponente(true)])
const carregandoDados = ref(false)
const enviando = ref(false)
const erro = ref('')
const avisoDados = ref('')
const resultado = ref<ResiduoResponse | null>(null)

const usuario = computed(() => session.usuario)
const podeAdicionarComponente = computed(() => componentes.value.length < 12)

function novoComponente(principal = false): ComponenteForm {
  return {
    origem: 'LIVRE',
    produtoId: '',
    nomeComponente: '',
    principal,
    concentracaoOuQuantidade: '',
    observacao: '',
  }
}

function mensagemErro(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const api = error.response?.data
    if (api?.message) return api.message

    if (Array.isArray(api?.fieldErrors)) {
      const mensagens = api.fieldErrors.map((item) => item.message).filter(Boolean)
      if (mensagens.length > 0) return mensagens.join(' ')
    }

    if (api?.fieldErrors && !Array.isArray(api.fieldErrors)) {
      const mensagens = Object.values(api.fieldErrors).filter(Boolean)
      if (mensagens.length > 0) return mensagens.join(' ')
    }

    return 'Não foi possível informar o resíduo.'
  }

  return error instanceof Error ? error.message : 'Não foi possível informar o resíduo.'
}

async function carregarDados() {
  const laboratorioId = usuario.value?.laboratorioId
  if (!laboratorioId) {
    erro.value = 'Seu usuário precisa estar vinculado a um laboratório para informar resíduos.'
    return
  }

  carregandoDados.value = true
  erro.value = ''
  avisoDados.value = ''

  const [projetosResult, produtosResult] = await Promise.allSettled([
    residuoService.listarProjetosPorLaboratorio(laboratorioId),
    residuoService.listarProdutosAtivos(),
  ])

  if (projetosResult.status === 'fulfilled') {
    projetos.value = projetosResult.value
  } else {
    avisoDados.value = 'Não foi possível carregar os projetos. Você ainda pode informar o resíduo sem projeto vinculado.'
  }

  if (produtosResult.status === 'fulfilled') {
    produtos.value = produtosResult.value
  } else {
    avisoDados.value = avisoDados.value
      ? `${avisoDados.value} O catálogo de produtos também não pôde ser carregado; use componentes livres.`
      : 'O catálogo de produtos não pôde ser carregado. Você ainda pode informar componentes livremente.'
  }

  carregandoDados.value = false
}

function produtoSelecionado(produtoId: string) {
  return produtos.value.find((produto) => produto.id === produtoId)
}

function selecionarOrigem(componente: ComponenteForm, origem: OrigemComponente) {
  componente.origem = origem
  if (origem === 'CATALOGO') componente.nomeComponente = ''
  else componente.produtoId = ''
}

function adicionarComponente() {
  if (!podeAdicionarComponente.value) return
  componentes.value.push(novoComponente(false))
}

function removerComponente(index: number) {
  if (componentes.value.length === 1) return
  const removidoPrincipal = componentes.value[index]?.principal
  componentes.value.splice(index, 1)
  if (removidoPrincipal && componentes.value.length > 0) componentes.value[0]!.principal = true
}

function definirPrincipal(index: number) {
  componentes.value.forEach((componente, indice) => {
    componente.principal = indice === index
  })
}

function alterarNivelRisco() {
  if (nivelRiscoInformado.value === 'NENHUM') riscosInformados.value = []
}

function validarFormulario() {
  if (!usuario.value?.id || !usuario.value.laboratorioId) {
    throw new Error('Sessão sem usuário ou laboratório válido.')
  }
  if (!descricao.value.trim()) throw new Error('Informe uma descrição para o resíduo.')
  if (!processoOrigem.value.trim()) throw new Error('Informe o processo que originou o resíduo.')
  if (!recipiente.value.trim()) throw new Error('Informe o recipiente utilizado.')
  if (!quantidade.value || Number(quantidade.value) <= 0) throw new Error('Informe uma quantidade maior que zero.')
  if (nivelRiscoInformado.value !== 'NENHUM' && riscosInformados.value.length === 0) {
    throw new Error('Selecione pelo menos um risco percebido ou marque o nível como Nenhum.')
  }
  if (componentes.value.length === 0) throw new Error('Informe ao menos um componente do resíduo.')

  for (const componente of componentes.value) {
    if (componente.origem === 'CATALOGO' && !componente.produtoId) {
      throw new Error('Selecione o produto de todos os componentes vinculados ao catálogo.')
    }
    if (componente.origem === 'LIVRE' && !componente.nomeComponente.trim()) {
      throw new Error('Informe o nome de todos os componentes livres.')
    }
  }

  if (!componentes.value.some((componente) => componente.principal)) {
    throw new Error('Defina um componente principal para o resíduo.')
  }
}

function montarPayload(): CriarResiduoRequest {
  const riscos: TipoRiscoResiduo[] = nivelRiscoInformado.value === 'NENHUM'
    ? ['NENHUM']
    : riscosInformados.value.filter((risco) => risco !== 'NENHUM')

  return {
    usuarioGeradorId: usuario.value!.id,
    laboratorioId: usuario.value!.laboratorioId!,
    projetoId: projetoId.value || null,
    descricao: descricao.value.trim(),
    processoOrigem: processoOrigem.value.trim(),
    recipiente: recipiente.value.trim(),
    quantidade: Number(quantidade.value),
    unidadeMedida: unidadeMedida.value,
    nivelRiscoInformado: nivelRiscoInformado.value,
    riscosInformados: riscos,
    observacaoGerador: observacaoGerador.value.trim() || null,
    componentes: componentes.value.map((componente) => ({
      produtoId: componente.origem === 'CATALOGO' ? componente.produtoId : null,
      nomeComponente: componente.origem === 'LIVRE' ? componente.nomeComponente.trim() : null,
      principal: componente.principal,
      concentracaoOuQuantidade: componente.concentracaoOuQuantidade.trim() || null,
      observacao: componente.observacao.trim() || null,
    })),
  }
}

async function enviarResiduo() {
  erro.value = ''

  try {
    validarFormulario()
    enviando.value = true
    resultado.value = await residuoService.criar(montarPayload())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    erro.value = mensagemErro(error)
  } finally {
    enviando.value = false
  }
}

function limparFormulario() {
  projetoId.value = ''
  descricao.value = ''
  processoOrigem.value = ''
  recipiente.value = ''
  quantidade.value = null
  unidadeMedida.value = 'ML'
  nivelRiscoInformado.value = 'BAIXO'
  riscosInformados.value = []
  observacaoGerador.value = ''
  componentes.value = [novoComponente(true)]
  erro.value = ''
  resultado.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatarData(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor))
}

onMounted(carregarDados)
</script>

<template>
  <section class="residuo-page">
    <header class="page-heading">
      <div>
        <p class="breadcrumb">Resíduos / Informar resíduo</p>
        <h1>Informar resíduo</h1>
        <p>Registre o material gerado no laboratório para que a Gestão possa receber, classificar, rotular e destinar corretamente.</p>
      </div>
    </header>

    <div class="context-grid">
      <article>
        <span>Gerador</span>
        <strong>{{ usuario?.nome }}</strong>
        <small>{{ usuario?.email }}</small>
      </article>
      <article>
        <span>Laboratório</span>
        <strong>{{ usuario?.laboratorioNome ?? 'Não vinculado' }}</strong>
        <small>{{ usuario?.unidadeNome ?? 'Unidade não vinculada' }}</small>
      </article>
    </div>

    <div v-if="resultado" class="success-surface">
      <div class="success-icon" aria-hidden="true">✓</div>
      <div class="success-copy">
        <span>RESÍDUO INFORMADO</span>
        <h2>Registro enviado para a Gestão</h2>
        <p>O resíduo foi registrado como <strong>INFORMADO</strong>. A classificação técnica final será realizada pela Gestão sem alterar sua declaração original.</p>
        <div class="success-meta">
          <div><small>Código SGL</small><strong>{{ resultado.codigoRastreio ?? 'Código indisponível' }}</strong></div>
          <div><small>Data</small><strong>{{ formatarData(resultado.dataInformacao) }}</strong></div>
          <div><small>Componentes</small><strong>{{ resultado.componentes.length }}</strong></div>
        </div>
      </div>
      <button type="button" @click="limparFormulario">Informar outro resíduo</button>
    </div>

    <form v-else class="residuo-form" @submit.prevent="enviarResiduo">
      <div v-if="avisoDados" class="notice notice--warning">{{ avisoDados }}</div>
      <div v-if="erro" class="notice notice--error">{{ erro }}</div>

      <section class="form-section">
        <div class="section-title">
          <span>1</span>
          <div>
            <h2>Origem do resíduo</h2>
            <p>Explique o que foi gerado e em qual processo. O projeto é opcional.</p>
          </div>
        </div>

        <div class="form-grid form-grid--two">
          <label class="field">
            <span>Projeto <small>(opcional)</small></span>
            <select v-model="projetoId" :disabled="carregandoDados">
              <option value="">Sem projeto vinculado</option>
              <option v-for="projeto in projetos" :key="projeto.id" :value="projeto.id">{{ projeto.nome }}</option>
            </select>
          </label>

          <label class="field">
            <span>Descrição do resíduo</span>
            <input v-model="descricao" required placeholder="Ex.: Mistura residual da extração de DNA" />
          </label>
        </div>

        <label class="field">
          <span>Processo de origem</span>
          <textarea v-model="processoOrigem" rows="3" required placeholder="Descreva o procedimento, experimento ou atividade que gerou este resíduo..." />
        </label>
      </section>

      <section class="form-section">
        <div class="section-title">
          <span>2</span>
          <div>
            <h2>Recipiente e quantidade</h2>
            <p>Informe como o material foi acondicionado e a quantidade aproximada entregue.</p>
          </div>
        </div>

        <div class="form-grid form-grid--quantity">
          <label class="field">
            <span>Recipiente</span>
            <input v-model="recipiente" required placeholder="Ex.: Frasco de vidro de 500 mL" />
          </label>
          <label class="field">
            <span>Quantidade</span>
            <input v-model.number="quantidade" type="number" min="0.001" step="0.001" required placeholder="0" />
          </label>
          <label class="field">
            <span>Unidade</span>
            <select v-model="unidadeMedida" required>
              <option v-for="unidade in unidadesMedida" :key="unidade.value" :value="unidade.value">{{ unidade.label }}</option>
            </select>
          </label>
        </div>
      </section>

      <section class="form-section">
        <div class="section-title">
          <span>3</span>
          <div>
            <h2>Riscos percebidos</h2>
            <p>Esta é a declaração do laboratório. A Gestão poderá confirmar ou corrigir a classificação sem apagar o que foi informado aqui.</p>
          </div>
        </div>

        <label class="field risk-level">
          <span>Nível de risco informado</span>
          <select v-model="nivelRiscoInformado" @change="alterarNivelRisco">
            <option v-for="nivel in niveisRisco" :key="nivel.value" :value="nivel.value">{{ nivel.label }}</option>
          </select>
        </label>

        <div v-if="nivelRiscoInformado !== 'NENHUM'" class="risk-grid">
          <label v-for="risco in tiposRisco" :key="risco.value" class="risk-option">
            <input v-model="riscosInformados" type="checkbox" :value="risco.value" />
            <span>{{ risco.label }}</span>
          </label>
        </div>
        <div v-else class="risk-none">Você informou que não percebe risco específico. O backend registrará essa declaração como <strong>NENHUM</strong>.</div>
      </section>

      <section class="form-section">
        <div class="section-title section-title--action">
          <div class="section-title__copy">
            <span>4</span>
            <div>
              <h2>Composição</h2>
              <p>Informe um ou mais componentes. Produto do catálogo é apenas referência e não movimenta estoque.</p>
            </div>
          </div>
          <button class="add-component" type="button" :disabled="!podeAdicionarComponente" @click="adicionarComponente">+ Adicionar componente</button>
        </div>

        <div class="components-list">
          <article v-for="(componente, index) in componentes" :key="index" class="component-card">
            <header class="component-card__header">
              <div>
                <span>Componente {{ index + 1 }}</span>
                <strong v-if="componente.principal">Principal</strong>
              </div>
              <button v-if="componentes.length > 1" type="button" class="remove-component" @click="removerComponente(index)">Remover</button>
            </header>

            <div class="origin-switch" role="group" aria-label="Origem do componente">
              <button type="button" :class="{ active: componente.origem === 'CATALOGO' }" @click="selecionarOrigem(componente, 'CATALOGO')">Produto do catálogo</button>
              <button type="button" :class="{ active: componente.origem === 'LIVRE' }" @click="selecionarOrigem(componente, 'LIVRE')">Componente livre</button>
            </div>

            <div class="component-grid">
              <label v-if="componente.origem === 'CATALOGO'" class="field component-name">
                <span>Produto</span>
                <select v-model="componente.produtoId" required>
                  <option value="" disabled>Selecione um produto</option>
                  <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
                    {{ produto.nome }}{{ produto.codigoReferencia ? ` · ${produto.codigoReferencia}` : '' }}
                  </option>
                </select>
                <small v-if="produtoSelecionado(componente.produtoId)">
                  {{ produtoSelecionado(componente.produtoId)?.unidadeArmazenamento ?? 'Produto cadastrado' }} · vínculo somente para composição
                </small>
              </label>

              <label v-else class="field component-name">
                <span>Nome do componente</span>
                <input v-model="componente.nomeComponente" required placeholder="Ex.: Solução tampão residual" />
                <small>Use texto livre quando o material não existir no catálogo.</small>
              </label>

              <label class="field">
                <span>Concentração / quantidade <small>(opcional)</small></span>
                <input v-model="componente.concentracaoOuQuantidade" placeholder="Ex.: aprox. 100 mL ou 70%" />
              </label>
            </div>

            <label class="field component-observation">
              <span>Observação do componente <small>(opcional)</small></span>
              <input v-model="componente.observacao" placeholder="Informações complementares sobre este componente..." />
            </label>

            <button type="button" class="principal-action" :class="{ active: componente.principal }" @click="definirPrincipal(index)">
              <span class="principal-indicator" aria-hidden="true">{{ componente.principal ? '✓' : '' }}</span>
              {{ componente.principal ? 'Componente principal' : 'Definir como principal' }}
            </button>
          </article>
        </div>
      </section>

      <section class="form-section form-section--last">
        <div class="section-title">
          <span>5</span>
          <div>
            <h2>Observações finais</h2>
            <p>Adicione qualquer informação que ajude a Gestão no recebimento e na conferência.</p>
          </div>
        </div>

        <label class="field">
          <span>Observação do gerador <small>(opcional)</small></span>
          <textarea v-model="observacaoGerador" rows="3" placeholder="Ex.: recipiente fechado, material gerado hoje, cuidados no transporte interno..." />
        </label>
      </section>

      <footer class="form-footer">
        <div>
          <strong>Ao enviar</strong>
          <span>o resíduo entra como INFORMADO e aguarda o recebimento físico pela Gestão.</span>
        </div>
        <button class="submit-action" type="submit" :disabled="enviando || carregandoDados">
          {{ enviando ? 'Enviando...' : 'Informar resíduo' }}
        </button>
      </footer>
    </form>
  </section>
</template>

<style scoped>
.residuo-page { max-width: 1180px; margin: 0 auto; }
.page-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
.breadcrumb { margin: 0 0 7px; color: var(--sgl-primary); font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.page-heading h1 { margin: 0; color: #17213a; font-size: clamp(28px, 3vw, 36px); letter-spacing: -.03em; }
.page-heading p:not(.breadcrumb) { max-width: 760px; margin: 8px 0 0; color: var(--sgl-text-muted); font-size: 13px; line-height: 1.6; }
.context-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.context-grid article { min-width: 0; padding: 15px 17px; border: 1px solid var(--sgl-border); border-radius: 9px; background: #fff; box-shadow: 0 8px 24px rgb(25 47 82 / 5%); }
.context-grid span, .context-grid strong, .context-grid small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.context-grid span { color: var(--sgl-text-muted); font-size: 9px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.context-grid strong { margin-top: 5px; color: #1b2941; font-size: 13px; }
.context-grid small { margin-top: 3px; color: #718096; font-size: 10px; }
.residuo-form, .success-surface { overflow: hidden; border: 1px solid var(--sgl-border); border-radius: 12px; background: #fff; box-shadow: 0 16px 44px rgb(30 54 88 / 7%); }
.form-section { padding: 24px 26px; border-bottom: 1px solid #edf1f5; }
.form-section--last { border-bottom: 0; }
.section-title, .section-title__copy { display: flex; align-items: flex-start; gap: 12px; }
.section-title { margin-bottom: 19px; }
.section-title > span, .section-title__copy > span { width: 30px; height: 30px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 8px; background: #eaf1ff; color: #1b55ad; font-size: 12px; font-weight: 900; }
.section-title h2 { margin: 0; color: #1b2941; font-size: 16px; }
.section-title p { margin: 4px 0 0; color: #718096; font-size: 11px; line-height: 1.5; }
.section-title--action { justify-content: space-between; gap: 20px; }
.add-component { min-height: 38px; padding: 0 13px; border: 1px solid #b9c7db; border-radius: 7px; background: #fff; color: #244b82; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.add-component:hover:not(:disabled) { border-color: #2d6bc4; background: #f5f9ff; }
.add-component:disabled { opacity: .45; cursor: not-allowed; }
.form-grid { display: grid; gap: 14px; }
.form-grid--two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.form-grid--quantity { grid-template-columns: minmax(0, 2fr) minmax(140px, .7fr) minmax(140px, .7fr); }
.field { display: flex; flex-direction: column; gap: 7px; margin-top: 14px; }
.form-grid > .field { margin-top: 0; }
.field > span { color: #344258; font-size: 11px; font-weight: 800; }
.field > span small { color: #8a97a8; font-size: 9px; font-weight: 600; }
.field input, .field select, .field textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #1f2d43; font: inherit; font-size: 12px; outline: 0; transition: border-color 160ms ease, box-shadow 160ms ease; }
.field input, .field select { min-height: 43px; padding: 0 11px; }
.field textarea { resize: vertical; padding: 11px; line-height: 1.5; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: #2d6bc4; box-shadow: 0 0 0 3px rgb(45 107 196 / 9%); }
.field small { color: #7c8a9d; font-size: 9px; line-height: 1.45; }
.risk-level { max-width: 300px; margin-top: 0; }
.risk-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; margin-top: 16px; }
.risk-option { min-height: 42px; display: flex; align-items: center; gap: 9px; padding: 0 11px; border: 1px solid #d7dee8; border-radius: 7px; background: #fbfcfe; color: #344258; font-size: 10px; font-weight: 700; cursor: pointer; }
.risk-option:has(input:checked) { border-color: #6c94d0; background: #eef5ff; color: #1d4f99; }
.risk-option input { width: 15px; height: 15px; accent-color: #245eb6; }
.risk-none { margin-top: 14px; padding: 12px 14px; border-radius: 7px; background: #f4f7fb; color: #5f6f84; font-size: 10px; }
.components-list { display: grid; gap: 12px; }
.component-card { padding: 16px; border: 1px solid #dce3ec; border-radius: 9px; background: #fcfdff; }
.component-card__header { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 13px; }
.component-card__header > div { display: flex; align-items: center; gap: 9px; }
.component-card__header span { color: #536277; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.component-card__header strong { padding: 4px 7px; border-radius: 999px; background: #e8f7ee; color: #137145; font-size: 8px; text-transform: uppercase; }
.remove-component { border: 0; background: transparent; color: #b42318; font: inherit; font-size: 10px; font-weight: 800; cursor: pointer; }
.origin-switch { display: inline-flex; overflow: hidden; margin-bottom: 14px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; }
.origin-switch button { min-height: 36px; padding: 0 12px; border: 0; border-right: 1px solid #dbe2eb; background: transparent; color: #66758a; font: inherit; font-size: 10px; font-weight: 800; cursor: pointer; }
.origin-switch button:last-child { border-right: 0; }
.origin-switch button.active { background: #174d9d; color: #fff; }
.component-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(220px, .8fr); gap: 14px; }
.component-observation { margin-top: 12px; }
.principal-action { min-height: 35px; display: inline-flex; align-items: center; gap: 8px; margin-top: 13px; padding: 0 10px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; color: #58677c; font: inherit; font-size: 10px; font-weight: 800; cursor: pointer; }
.principal-action.active { border-color: #9ccdb2; background: #f0faf4; color: #167247; }
.principal-indicator { width: 17px; height: 17px; display: grid; place-items: center; border: 1px solid currentColor; border-radius: 50%; font-size: 9px; }
.notice { margin: 18px 26px 0; padding: 12px 14px; border-radius: 7px; font-size: 10px; line-height: 1.5; }
.notice--error { border: 1px solid #f1b7b3; background: #fff3f2; color: #9f2018; }
.notice--warning { border: 1px solid #ead8a6; background: #fffaf0; color: #7a5b12; }
.form-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 26px; background: #f8fafc; }
.form-footer > div { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.form-footer strong { color: #344258; font-size: 10px; }
.form-footer span { color: #718096; font-size: 10px; }
.submit-action { min-width: 160px; min-height: 43px; padding: 0 18px; border: 0; border-radius: 7px; background: linear-gradient(135deg, #174d9d, #2b67c0); color: #fff; font: inherit; font-size: 11px; font-weight: 850; cursor: pointer; box-shadow: 0 7px 18px rgb(29 83 166 / 19%); }
.submit-action:hover:not(:disabled) { filter: brightness(1.05); }
.submit-action:disabled { opacity: .55; cursor: not-allowed; box-shadow: none; }
.success-surface { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 18px; padding: 24px; border-color: #bbdfca; background: linear-gradient(135deg, #fbfffc, #f4fbf7); }
.success-icon { width: 52px; height: 52px; display: grid; place-items: center; border-radius: 50%; background: #157347; color: #fff; font-size: 22px; font-weight: 900; }
.success-copy > span { color: #157347; font-size: 9px; font-weight: 900; letter-spacing: .08em; }
.success-copy h2 { margin: 4px 0 5px; color: #173a2a; font-size: 20px; }
.success-copy p { margin: 0; color: #5f7468; font-size: 11px; line-height: 1.5; }
.success-meta { display: grid; grid-template-columns: 2fr 1fr .5fr; gap: 8px; margin-top: 14px; }
.success-meta div { min-width: 0; padding: 9px 10px; border-radius: 6px; background: rgb(255 255 255 / 72%); }
.success-meta small, .success-meta strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.success-meta small { color: #759080; font-size: 8px; text-transform: uppercase; }
.success-meta strong { margin-top: 3px; color: #244a37; font-size: 10px; }
.success-surface > button { min-height: 40px; padding: 0 14px; border: 1px solid #94c4a8; border-radius: 7px; background: #fff; color: #176c46; font: inherit; font-size: 10px; font-weight: 800; cursor: pointer; }
@media (max-width: 900px) {
  .form-grid--two, .form-grid--quantity, .component-grid { grid-template-columns: 1fr; }
  .risk-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .success-surface { grid-template-columns: auto minmax(0, 1fr); }
  .success-surface > button { grid-column: 1 / -1; justify-self: start; }
}
@media (max-width: 620px) {
  .context-grid, .risk-grid { grid-template-columns: 1fr; }
  .form-section { padding: 20px 16px; }
  .section-title--action, .form-footer { align-items: stretch; flex-direction: column; }
  .add-component, .submit-action { width: 100%; }
  .notice { margin-inline: 16px; }
  .form-footer { padding: 18px 16px; }
  .success-surface { grid-template-columns: 1fr; padding: 20px; }
  .success-meta { grid-template-columns: 1fr; }
  .origin-switch { width: 100%; }
  .origin-switch button { flex: 1; }
}
</style>