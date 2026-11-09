<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { FAQ_ID, HELP_GROUPS, searchHelpTasks } from '@/modules/ajuda/helpTasks'

defineProps<{ activeId: string | null }>()
const emit = defineEmits<{ navigate: [] }>()

const query = ref('')
const results = computed(() => searchHelpTasks(query.value))
const groups = computed(() =>
  HELP_GROUPS.map((group) => ({
    ...group,
    tasks: results.value.filter((task) => task.group === group.id),
  })).filter((group) => group.tasks.length > 0),
)
</script>

<template>
  <nav class="help-nav" aria-label="Tarefas da Central de Ajuda">
    <label class="help-nav__search">
      <span class="help-nav__label">Buscar tarefa</span>
      <input v-model="query" type="search" placeholder="Ex.: resíduo, lote, pedido" />
    </label>

    <p v-if="groups.length === 0" class="help-nav__empty" role="status">Nenhuma tarefa encontrada.</p>

    <section v-for="group in groups" :key="group.id" class="help-nav__group">
      <h2>{{ group.title }}</h2>
      <ul>
        <li v-for="task in group.tasks" :key="task.id">
          <RouterLink
            :to="`/ajuda/${task.id}`"
            :class="{ 'is-active': task.id === activeId }"
            :aria-current="task.id === activeId ? 'page' : undefined"
            @click="emit('navigate')"
          >
            {{ task.title }}
          </RouterLink>
        </li>
      </ul>
    </section>

    <ul class="help-nav__fixed">
      <li>
        <RouterLink
          :to="`/ajuda/${FAQ_ID}`"
          :class="{ 'is-active': activeId === FAQ_ID }"
          @click="emit('navigate')"
        >
          Perguntas frequentes
        </RouterLink>
      </li>
      <li><a href="/ajuda/sgl-guia.pdf" download>Baixar guia em PDF</a></li>
    </ul>
  </nav>
</template>

<style scoped>
.help-nav { display: flex; flex-direction: column; gap: var(--sgl-space-4); }
.help-nav__label { display: block; font-size: var(--sgl-font-label); color: var(--sgl-text-muted); margin-bottom: var(--sgl-space-1); }
.help-nav__search input {
  width: 100%; box-sizing: border-box; height: var(--sgl-control-height); padding: 0 var(--sgl-space-3);
  border: var(--sgl-border-width) solid var(--sgl-border-strong); border-radius: var(--sgl-radius-control);
  background: var(--sgl-surface); color: var(--sgl-text); font-size: var(--sgl-font-body);
}
.help-nav__empty { color: var(--sgl-text-muted); font-size: var(--sgl-font-helper); margin: 0; }
.help-nav h2 { font-size: var(--sgl-font-label); font-weight: var(--sgl-font-weight-semibold); color: var(--sgl-text-muted); margin: 0 0 var(--sgl-space-2); }
.help-nav ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.help-nav a {
  display: block; padding: var(--sgl-space-2) var(--sgl-space-3); border-radius: var(--sgl-radius-control);
  color: var(--sgl-text); text-decoration: none; font-size: var(--sgl-font-body);
}
.help-nav a:hover { background: var(--sgl-surface-soft); }
.help-nav a.is-active { background: var(--sgl-surface-soft); color: var(--sgl-primary); font-weight: var(--sgl-font-weight-semibold); }
.help-nav__fixed { border-top: var(--sgl-border-width) solid var(--sgl-border); padding-top: var(--sgl-space-3) !important; }
</style>
