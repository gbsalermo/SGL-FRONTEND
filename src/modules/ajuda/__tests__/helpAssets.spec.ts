import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { HELP_TASKS } from '../helpTasks'

const POSTERS_DIR = join(process.cwd(), 'public', 'ajuda', 'posters')
// Posters are shipped in the image, so they must stay light.
const MAX_POSTER_BYTES = 250 * 1024

describe('help center posters', () => {
  it.each(HELP_TASKS.map((task) => task.id))('has a light poster for %s', (id) => {
    const file = join(POSTERS_DIR, `${id}.jpg`)
    expect(existsSync(file)).toBe(true)
    expect(statSync(file).size).toBeLessThan(MAX_POSTER_BYTES)
  })
})
