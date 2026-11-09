import tasksData from './tasks.json'

export type HelpGroup = 'solicitante' | 'gestao' | 'administracao'

export interface HelpTask {
  id: string
  title: string
  group: HelpGroup
  roles: string
  keywords: string[]
  video: string
}

export const HELP_GROUPS: Array<{ id: HelpGroup; title: string }> = [
  { id: 'solicitante', title: 'Para quem faz pedidos' },
  { id: 'gestao', title: 'Para a gestão do laboratório' },
  { id: 'administracao', title: 'Para a administração' },
]

// Array order is the menu order (spec section 5), not the video number.
export const HELP_TASKS: HelpTask[] = tasksData as HelpTask[]

export const FEATURED_TASK_IDS: string[] = [
  'fazer-um-pedido-e-acompanhar',
  'informar-um-residuo',
  'solicitar-uma-solucao',
  'analisar-pedido',
]

/** Route id of the FAQ page, which is not a video task. */
export const FAQ_ID = 'perguntas-frequentes'

export function findHelpTask(id: string): HelpTask | undefined {
  return HELP_TASKS.find((task) => task.id === id)
}

// Users type without accents or with caps lock; compare on a folded form.
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function searchHelpTasks(query: string): HelpTask[] {
  const needle = normalize(query)
  if (!needle) return HELP_TASKS
  return HELP_TASKS.filter(
    (task) =>
      normalize(task.title).includes(needle) ||
      task.keywords.some((keyword) => normalize(keyword).includes(needle)),
  )
}

export function videoUrl(task: HelpTask): string {
  return `/ajuda/videos/${task.video}.mp4`
}

export function posterUrl(task: HelpTask): string {
  return `/ajuda/posters/${task.id}.jpg`
}
