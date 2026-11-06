<script setup lang="ts">
import type { EstagiarioSemVinculoResponse } from '@/modules/estagiarios/types/estagiario'

defineProps<{
  pendentes: EstagiarioSemVinculoResponse[]
}>()

defineEmits<{
  (event: 'criar-vinculo', pendente: EstagiarioSemVinculoResponse): void
}>()
</script>

<template>
  <section v-if="pendentes.length > 0" class="workspace-card pending-card">
    <ul class="pending-list">
      <li v-for="pendente in pendentes" :key="pendente.usuarioId" class="pending-row">
        <div class="student-cell">
          <strong>{{ pendente.nome }}</strong>
          <small class="student-responsible">
            {{ pendente.laboratorioNome || 'Sem laboratório-base' }}
          </small>
        </div>
        <span class="status-pill status-pill--pending">
          <span class="status-dot" />
          Vínculo pendente
        </span>
        <button class="detail-action" type="button" @click="$emit('criar-vinculo', pendente)">
          Criar vínculo
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.workspace-card {
  overflow: hidden;
  border: 1px solid #dbe3ee;
  border-radius: 11px;
  background: #fff;
}

.pending-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.pending-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8eef6;
}

.pending-row:last-child {
  border-bottom: 0;
}

.student-cell {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.student-cell strong {
  color: #17243a;
  font-size: 13px;
}

.student-responsible {
  color: #64748a;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  min-height: 25px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.status-pill--pending {
  background: #fff5dc;
  color: #aa7200;
}

.detail-action {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid #cbd7e6;
  border-radius: 7px;
  background: #fff;
  color: #2456c4;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
}
</style>
