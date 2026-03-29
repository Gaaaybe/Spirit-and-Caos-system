import axios from 'axios';

/**
 * Traduz e extrai a mensagem de erro mais relevante de uma falha de API ou sistema.
 * Segue a regra de pegar apenas o primeiro erro em casos de múltiplas validações.
 */
export function getErrorMessage(error: any): string {
  if (!error) return 'Ocorreu um erro inesperado.';

  // Tratar erros do Axios
  if (axios.isAxiosError(error)) {
    const response = error.response;
    const status = response?.status;
    const data = response?.data as any;

    // Erros de Validação (400 ou 422 - NestJS/Zod)
    if (status === 400 || status === 422) {
      if (data?.message) {
        // Se for um array de erros (comum no NestJS + Class Validator/Zod), pega o primeiro
        if (Array.isArray(data.message)) {
          return data.message[0] || 'Dados inválidos.';
        }
        return data.message;
      }
      return 'Dados inválidos. Verifique os campos preenchidos.';
    }

    // Erros de Autenticação/Permissão
    if (status === 401) return 'Sua sessão expirou. Por favor, entre novamente.';
    if (status === 403) return 'Você não tem permissão para realizar esta ação.';
    
    // Erros de Recurso
    if (status === 404) return 'O recurso solicitado não existe ou foi removido.';

    // Erros de Servidor
    if (status === 500) return 'O servidor encontrou um erro interno. Tente novamente em instantes.';

    // Erros de Conexão/Network
    if (error.code === 'ERR_NETWORK') {
      return 'Sem conexão com o servidor. Verifique sua internet ou tente mais tarde.';
    }

    if (error.code === 'ECONNABORTED') {
      return 'A requisição demorou demais. Tente novamente.';
    }
  }

  // Erros genéricos de JavaScript
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Algo deu errado. Se o problema persistir, contate o mestre.';
}
