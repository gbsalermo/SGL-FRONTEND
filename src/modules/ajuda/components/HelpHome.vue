<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { FEATURED_TASK_IDS, findHelpTask, type HelpTask } from '@/modules/ajuda/helpTasks'

const featured = FEATURED_TASK_IDS.map(findHelpTask).filter((task): task is HelpTask => !!task)
</script>

<template>
  <section class="help-home">
    <h1>Como podemos ajudar?</h1>
    <p>Escolha uma tarefa no menu ou comece por uma das mais procuradas.</p>
    <ul class="help-home__grid">
      <li v-for="task in featured" :key="task.id">
        <RouterLink data-testid="featured-task" :to="`/ajuda/${task.id}`">
          <strong>{{ task.title }}</strong>
          <span>{{ task.roles }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.help-home h1 { font-size: var(--sgl-font-page-title); margin: 0 0 var(--sgl-space-2); color: var(--sgl-text); }
.help-home p { color: var(--sgl-text-muted); margin: 0 0 var(--sgl-space-4); }
.help-home__grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--sgl-space-4); }
.help-home__grid a {
  display: flex; flex-direction: column; gap: var(--sgl-space-1); height: 100%; box-sizing: border-box;
  padding: var(--sgl-card-padding); border: var(--sgl-border-width) solid var(--sgl-border); border-radius: var(--sgl-radius-surface);
  background: var(--sgl-surface); color: var(--sgl-text); text-decoration: none;
}
.help-home__grid a:hover { border-color: var(--sgl-primary); }
.help-home__grid span { font-size: var(--sgl-font-helper); color: var(--sgl-text-muted); }
</style>
