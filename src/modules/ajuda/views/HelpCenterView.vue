<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import HelpHome from '@/modules/ajuda/components/HelpHome.vue'
import HelpTaskContent from '@/modules/ajuda/components/HelpTaskContent.vue'
import HelpTaskMenu from '@/modules/ajuda/components/HelpTaskMenu.vue'
import { FAQ_ID, findHelpTask } from '@/modules/ajuda/helpTasks'

const route = useRoute()
const menuOpen = ref(false)
const mainRef = ref<HTMLElement | null>(null)

const taskId = computed(() => (route.params.taskId ? String(route.params.taskId) : null))

watch(
  taskId,
  async (id) => {
    const title = id === FAQ_ID ? 'Perguntas frequentes' : id ? findHelpTask(id)?.title : null
    document.title = title ? `${title} · Ajuda do SGL` : 'Central de Ajuda · SGL'
    menuOpen.value = false
    await nextTick()
    mainRef.value?.scrollIntoView?.({ block: 'start' })
    window.scrollTo?.(0, 0)
  },
  { immediate: true },
)
</script>

<template>
  <div class="help-center">
    <header class="help-center__header">
      <button
        type="button"
        class="help-center__toggle"
        data-testid="menu-toggle"
        aria-controls="help-menu"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        Tarefas
      </button>
      <RouterLink to="/ajuda" class="help-center__brand">SGL · Central de Ajuda</RouterLink>
      <RouterLink to="/login" class="help-center__login">Entrar no sistema</RouterLink>
    </header>

    <div v-if="menuOpen" class="help-center__overlay" @click="menuOpen = false" />

    <div class="help-center__body">
      <aside id="help-menu" class="help-menu" :class="{ 'help-menu--open': menuOpen }">
        <HelpTaskMenu :active-id="taskId" @navigate="menuOpen = false" />
      </aside>
      <main ref="mainRef" class="help-center__main">
        <HelpTaskContent v-if="taskId" :task-id="taskId" />
        <HelpHome v-else />
      </main>
    </div>
  </div>
</template>

<style scoped>
.help-center { min-height: 100vh; background: var(--sgl-background); color: var(--sgl-text); }
.help-center__header {
  display: flex; align-items: center; gap: var(--sgl-space-4); padding: var(--sgl-space-3) var(--sgl-space-4);
  background: var(--sgl-surface); border-bottom: var(--sgl-border-width) solid var(--sgl-border);
}
.help-center__brand { font-weight: var(--sgl-font-weight-bold); color: var(--sgl-text); text-decoration: none; }
.help-center__login { margin-left: auto; color: var(--sgl-primary); font-weight: var(--sgl-font-weight-semibold); text-decoration: none; }
.help-center__toggle {
  display: none; height: var(--sgl-control-height); padding: 0 var(--sgl-space-3); cursor: pointer;
  border: var(--sgl-border-width) solid var(--sgl-border-strong); border-radius: var(--sgl-radius-control);
  background: var(--sgl-surface); color: var(--sgl-text);
}
.help-center__body { display: flex; align-items: flex-start; gap: var(--sgl-space-6); padding: var(--sgl-space-6) var(--sgl-space-4); max-width: 1240px; margin: 0 auto; box-sizing: border-box; }
.help-menu { flex: 0 0 280px; width: 280px; position: sticky; top: var(--sgl-space-4); max-height: calc(100vh - 2 * var(--sgl-space-4)); overflow-y: auto; }
.help-center__main { flex: 1 1 auto; min-width: 0; max-width: 860px; }
.help-center__overlay { display: none; }

@media (max-width: 959px) {
  .help-center__toggle { display: inline-block; }
  .help-center__body { display: block; padding: var(--sgl-space-4); }
  .help-menu {
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 20; width: min(300px, 85vw); max-height: none;
    padding: var(--sgl-space-4); box-sizing: border-box; background: var(--sgl-surface);
    transform: translateX(-100%); transition: transform var(--sgl-transition-fast);
  }
  .help-menu--open { transform: translateX(0); }
  .help-center__overlay { display: block; position: fixed; inset: 0; z-index: 10; background: rgba(0, 0, 0, 0.4); }
}
</style>
