<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const alvoCadastrosDisponivel = ref(false)
const alvoInformarResiduoDisponivel = ref(false)
let observer: MutationObserver | null = null

function atualizarAlvos() {
  alvoCadastrosDisponivel.value = route.path === '/administracao/cadastros'
    && Boolean(document.querySelector('.tabs-card'))

  alvoInformarResiduoDisponivel.value = route.path === '/residuos/novo'
    && Boolean(document.querySelector('.components-list'))
}

watch(() => route.path, async () => {
  await nextTick()
  atualizarAlvos()
})

onMounted(async () => {
  await nextTick()
  atualizarAlvos()
  observer = new MutationObserver(atualizarAlvos)
  observer.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <Teleport v-if="alvoCadastrosDisponivel" to=".tabs-card">
    <button
      class="residuo-modelo-admin-tab"
      type="button"
      disabled
      aria-disabled="true"
      title="Opção em estudo: modelos de resíduos recorrentes cadastrados pela Gestão"
    >
      <span class="residuo-modelo-admin-tab__topline">
        <strong>Resíduos</strong>
        <small>EM BREVE</small>
      </span>
      <span class="residuo-modelo-admin-tab__description">
        Modelos completos com origem, recipiente, riscos, composição e observações.
      </span>
    </button>
  </Teleport>

  <Teleport v-if="alvoInformarResiduoDisponivel" to=".components-list">
    <article class="residuo-modelo-user-card" aria-disabled="true">
      <header>
        <div>
          <span>MODELO DE RESÍDUO</span>
          <h3>Resíduo pré-cadastrado</h3>
        </div>
        <strong>EM BREVE</strong>
      </header>

      <div class="residuo-modelo-user-card__body">
        <label>
          <span>Resíduo definido pela Gestão</span>
          <select disabled>
            <option>Selecione um modelo de resíduo...</option>
          </select>
        </label>

        <div class="residuo-modelo-user-card__rule">
          <strong>Regra planejada</strong>
          <span>
            Produto do catálogo <b>ou</b> resíduo pré-cadastrado: pelo menos um dos dois deverá ser selecionado.
            Ao escolher um modelo de resíduo, Produto passa a ser opcional; ao escolher Produto, o modelo passa a ser opcional.
          </span>
        </div>
      </div>

      <p>
        Quando ativado, o modelo poderá preencher automaticamente descrição, processo de origem, recipiente,
        unidade, riscos, composição e observações. A quantidade real continuará ajustável no momento do registro.
      </p>
    </article>
  </Teleport>
</template>

<style>
.residuo-modelo-admin-tab {
  width: 100%;
  min-height: 66px;
  display: grid;
  gap: 3px;
  padding: 11px 12px;
  border: 1px dashed #d6dee9;
  border-radius: 7px;
  background: #fafbfc;
  color: #536178;
  font: inherit;
  text-align: left;
  cursor: not-allowed;
  opacity: .78;
}

.residuo-modelo-admin-tab__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.residuo-modelo-admin-tab__topline strong {
  color: #41516a;
  font-size: 12px;
}

.residuo-modelo-admin-tab__topline small {
  margin: 0;
  padding: 3px 6px;
  border-radius: 999px;
  background: #eef1f5;
  color: #758196;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: .05em;
}

.residuo-modelo-admin-tab__description {
  color: #7a879a;
  font-size: 9px;
  line-height: 1.35;
}

.residuo-modelo-user-card {
  order: -1;
  padding: 15px 16px;
  border: 1px dashed #b9c7db;
  border-radius: 9px;
  background: linear-gradient(135deg, #fbfcfe, #f6f9fd);
  color: #40516a;
}

.residuo-modelo-user-card > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 13px;
}

.residuo-modelo-user-card > header span {
  display: block;
  color: #6e7e94;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .08em;
}

.residuo-modelo-user-card > header h3 {
  margin: 4px 0 0;
  color: #263952;
  font-size: 13px;
}

.residuo-modelo-user-card > header > strong {
  padding: 4px 7px;
  border-radius: 999px;
  background: #e9edf3;
  color: #6d798b;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .05em;
}

.residuo-modelo-user-card__body {
  display: grid;
  grid-template-columns: minmax(220px, .8fr) minmax(0, 1.2fr);
  gap: 12px;
  align-items: stretch;
}

.residuo-modelo-user-card label {
  display: grid;
  gap: 6px;
}

.residuo-modelo-user-card label > span {
  color: #45566f;
  font-size: 9px;
  font-weight: 800;
}

.residuo-modelo-user-card select {
  width: 100%;
  min-height: 40px;
  padding: 0 10px;
  border: 1px solid #d5dde8;
  border-radius: 7px;
  background: #f1f4f8;
  color: #8a97a8;
  font: inherit;
  font-size: 10px;
  cursor: not-allowed;
}

.residuo-modelo-user-card__rule {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 7px;
  background: #eef4fc;
}

.residuo-modelo-user-card__rule strong {
  color: #31588d;
  font-size: 9px;
}

.residuo-modelo-user-card__rule span {
  color: #5d6f87;
  font-size: 9px;
  line-height: 1.45;
}

.residuo-modelo-user-card > p {
  margin: 11px 0 0;
  color: #718096;
  font-size: 9px;
  line-height: 1.5;
}

@media (max-width: 760px) {
  .residuo-modelo-user-card__body {
    grid-template-columns: 1fr;
  }
}
</style>
