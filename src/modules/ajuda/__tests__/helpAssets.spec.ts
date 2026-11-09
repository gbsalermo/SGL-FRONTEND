import { existsSync, readFileSync, statSync } from 'node:fs'
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

describe('help center PDF guide', () => {
  const pdf = join(process.cwd(), 'public', 'ajuda', 'sgl-guia.pdf')
  // Shipped in the image, so it must stay light.
  const MAX_PDF_BYTES = 3 * 1024 * 1024

  it('exists, is a PDF and is light', () => {
    expect(existsSync(pdf)).toBe(true)
    expect(readFileSync(pdf).subarray(0, 4).toString('latin1')).toBe('%PDF')
    expect(statSync(pdf).size).toBeLessThan(MAX_PDF_BYTES)
  })
})
