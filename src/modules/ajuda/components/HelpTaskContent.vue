<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { FAQ_ID, findHelpTask, posterUrl, videoUrl } from '@/modules/ajuda/helpTasks'
import { FAQ_TEXT, helpText } from '@/modules/ajuda/helpTexts'
import { renderHelpMarkdown } from '@/modules/ajuda/renderHelpMarkdown'

const props = defineProps<{ taskId: string }>()

const task = computed(() => findHelpTask(props.taskId))
const isFaq = computed(() => props.taskId === FAQ_ID)
const title = computed(() => (isFaq.value ? 'Perguntas frequentes' : (task.value?.title ?? '')))
const html = computed(() =>
  renderHelpMarkdown(isFaq.value ? FAQ_TEXT : (helpText(props.taskId) ?? '')),
)

// A video missing on the server must not leave a broken player; the text stays readable.
const videoFailed = ref(false)
watch(() => props.taskId, () => (videoFailed.value = false))
</script>

<template>
  <article class="help-content">
    <h1>{{ title }}</h1>
    <template v-if="task">
      <video
        v-if="!videoFailed"
        :key="task.id"
        class="help-content__video"
        :src="videoUrl(task)"
        :poster="posterUrl(task)"
        controls
        preload="metadata"
        @error="videoFailed = true"
      />
      <p v-else class="help-content__no-video" role="status">Vídeo indisponível no momento.</p>
    </template>
    <!-- Safe: renderHelpMarkdown disables raw HTML and the text comes from the repository. -->
    <div class="help-text" v-html="html" />
  </article>
</template>

<style scoped>
.help-content h1 { font-size: var(--sgl-font-page-title); color: var(--sgl-text); margin: 0 0 var(--sgl-space-4); }
.help-content__video { width: 100%; max-height: 70vh; background: #000; border-radius: var(--sgl-radius-surface); margin-bottom: var(--sgl-space-4); }
.help-content__no-video {
  padding: var(--sgl-space-6); text-align: center; color: var(--sgl-text-muted);
  background: var(--sgl-surface-soft); border-radius: var(--sgl-radius-surface); margin: 0 0 var(--sgl-space-4);
}
.help-text { color: var(--sgl-text); font-size: var(--sgl-font-body); line-height: var(--sgl-line-height-body); overflow-wrap: anywhere; }
.help-text :deep(h2) { font-size: var(--sgl-font-card-title); margin: var(--sgl-space-6) 0 var(--sgl-space-2); }
.help-text :deep(h3) { font-size: var(--sgl-font-body); margin: var(--sgl-space-4) 0 var(--sgl-space-2); }
.help-text :deep(ol), .help-text :deep(ul) { padding-left: var(--sgl-space-6); }
.help-text :deep(li) { margin-bottom: var(--sgl-space-2); }
</style>
