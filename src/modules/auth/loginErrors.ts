import { isAxiosError } from 'axios'

const MENSAGENS_POR_CODIGO: Record<string, string> = {
  CREDENCIAIS_INVALIDAS: 'Usuário ou senha inválidos.',
  CONTA_DESATIVADA: 'Sua conta está desativada na Embrapa.',
  UNIDADE_NAO_HABILITADA: 'Sua Unidade ainda não usa o SGL.',
  AUTENTICACAO_INDISPONIVEL: 'Autenticação corporativa indisponível. Tente novamente em instantes.',
  MUITAS_TENTATIVAS: 'Muitas tentativas. Aguarde alguns minutos.',
  PESSOA_NAO_ENCONTRADA: 'Seu cadastro não foi encontrado nas bases de empregados e colaboradores da Embrapa.',
}

export function mensagemDeErroDeLogin(error: unknown): string {
  if (isAxiosError<{ codigo?: string; message?: string }>(error)) {
    const codigo = error.response?.data?.codigo
    if (codigo && MENSAGENS_POR_CODIGO[codigo]) return MENSAGENS_POR_CODIGO[codigo]
    if (!error.response) return MENSAGENS_POR_CODIGO.AUTENTICACAO_INDISPONIVEL
    return error.response.data?.message ?? 'Não foi possível acessar o sistema.'
  }
  return error instanceof Error ? error.message : 'Não foi possível acessar o sistema.'
}
