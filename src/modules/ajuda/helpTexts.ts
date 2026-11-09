import { FAQ_ID } from './helpTasks'

// Kept apart from the catalog on purpose: the eager glob inlines every .md, and the
// router (entry chunk) only needs the catalog. Only the help views import this file.
// Texts are plain Markdown files so they can be edited without touching code.
const textFiles = import.meta.glob('./textos/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export function helpText(id: string): string | undefined {
  return textFiles[`./textos/${id}.md`]
}

export const FAQ_TEXT: string = helpText(FAQ_ID) ?? ''
