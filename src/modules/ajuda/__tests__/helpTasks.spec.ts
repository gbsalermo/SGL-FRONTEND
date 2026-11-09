import { describe, expect, it } from 'vitest'
import {
  FEATURED_TASK_IDS,
  HELP_TASKS,
  findHelpTask,
  posterUrl,
  searchHelpTasks,
  videoUrl,
} from '../helpTasks'

const ids = (tasks: { id: string }[]) => tasks.map((t) => t.id)

describe('helpTasks', () => {
  it('has the 20 tasks of the spec with unique ids', () => {
    expect(HELP_TASKS).toHaveLength(20)
    expect(new Set(ids(HELP_TASKS)).size).toBe(20)
    for (const task of HELP_TASKS) {
      expect(task.video).toMatch(/^\d{2}-/)
      expect(task.video.endsWith(task.id)).toBe(true)
    }
  })

  it('keeps the menu order of the spec', () => {
    const requester = HELP_TASKS.filter((t) => t.group === 'solicitante')
    expect(ids(requester)).toEqual([
      'fazer-um-pedido-e-acompanhar',
      'pedido-em-qualquer-laboratorio',
      'pedido-do-estagiario',
      'solicitar-uma-solucao',
      'informar-um-residuo',
      'pedidos-dos-orientandos',
    ])
  })

  it('search ignores accents and case', () => {
    for (const q of ['residuo', 'RESÍDUO', 'resíduo']) {
      expect(ids(searchHelpTasks(q))).toContain('informar-um-residuo')
    }
  })

  it('search matches keywords', () => {
    expect(ids(searchHelpTasks('lote'))).toContain('estoque-e-lotes')
  })

  it('empty search returns all', () => {
    expect(searchHelpTasks('  ')).toHaveLength(20)
  })

  it('featured ids exist', () => {
    for (const id of FEATURED_TASK_IDS) expect(findHelpTask(id)).toBeDefined()
  })

  it('builds media urls', () => {
    const task = findHelpTask('informar-um-residuo')!
    expect(videoUrl(task)).toBe('/ajuda/videos/08-informar-um-residuo.mp4')
    expect(posterUrl(task)).toBe('/ajuda/posters/informar-um-residuo.jpg')
  })
})
