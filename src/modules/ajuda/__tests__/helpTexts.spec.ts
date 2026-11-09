import { describe, expect, it } from 'vitest'
import { HELP_TASKS } from '../helpTasks'
import { FAQ_TEXT, helpText } from '../helpTexts'

// Same glob as the loader, used here to detect texts that match no task.
const files = import.meta.glob('../textos/*.md', { query: '?raw', import: 'default', eager: true })

describe('help texts', () => {
  it('every task has a text with the required sections', () => {
    for (const task of HELP_TASKS) {
      const text = helpText(task.id)
      expect(text, task.id).toBeDefined()
      expect(text, task.id).toContain('## Para que serve')
      expect(text, task.id).toContain('## Quem pode fazer')
      expect(text, task.id).toContain('## Passo a passo')
      expect(text, task.id).toMatch(/^1\. /m)
    }
  })

  it('has no orphan texts', () => {
    const taskIds = new Set(HELP_TASKS.map((t) => t.id))
    for (const path of Object.keys(files)) {
      const id = path.split('/').pop()!.replace(/\.md$/, '')
      if (id === 'perguntas-frequentes') continue
      expect(taskIds.has(id), id).toBe(true)
    }
  })

  it('faq has questions', () => {
    expect((FAQ_TEXT.match(/^### /gm) ?? []).length).toBeGreaterThanOrEqual(6)
  })

  it('returns undefined for an unknown id', () => {
    expect(helpText('nao-existe')).toBeUndefined()
  })
})
