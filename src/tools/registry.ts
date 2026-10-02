import type { ComponentType } from 'react'
import { DeletePages } from './delete-pages/DeletePages'

export type Tool = { id: string; name: string; component: ComponentType }

// Para adicionar uma ferramenta nova, crie a pasta em src/tools e registre aqui.
export const tools: Tool[] = [
  { id: 'delete-pages', name: 'Excluir páginas', component: DeletePages },
]
