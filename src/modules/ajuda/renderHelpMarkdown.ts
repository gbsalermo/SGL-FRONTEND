import MarkdownIt from 'markdown-it'

// html:false escapes raw HTML, which is what makes injecting the result with v-html safe.
const markdown = new MarkdownIt({ html: false, linkify: true })

export function renderHelpMarkdown(text: string): string {
  return markdown.render(text)
}
