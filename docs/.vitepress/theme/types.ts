export interface BlogConfig {
  path?: string
  postsPath?: string
  authorsPath?: string
  tagsPath?: string
  title?: string
  description?: string
  defaultAuthor?: string
  categoryIcons?: Record<string, string>
  tagIcons?: Record<string, string>
  dateConfig?: { format?: string }
}
