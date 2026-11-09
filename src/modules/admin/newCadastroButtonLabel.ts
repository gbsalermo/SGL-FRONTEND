import type { AbaCadastro } from '@/modules/admin/types/cadastros'

// Full labels instead of "+ Novo {noun}": Portuguese gender agreement varies per noun ("Nova classe").
const LABELS: Partial<Record<AbaCadastro, string>> = {
  laboratorios: '+ Novo laboratório',
  projetos: '+ Novo projeto',
  produtos: '+ Novo produto',
  'classes-residuo': '+ Nova classe',
  'locais-armazenamento': '+ Novo local',
}

export function newCadastroButtonLabel(tab: AbaCadastro): string {
  return LABELS[tab] ?? '+ Novo cadastro'
}
