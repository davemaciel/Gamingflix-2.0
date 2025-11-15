// Serviço integrado de Steam Guard - busca código 2FA via email

// URL base da API - se vazio, usa defaults diferentes para desenvolvimento/produção
const BASE_URL = import.meta.env.VITE_STEAM_GUARD_API_URL;
const API_URL = BASE_URL
  ? (BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`)
  : '/api';

interface CodeResponse {
  success: boolean;
  code?: string;
  searchTime?: number;
  error?: string;
}

interface HistoryResponse {
  success: boolean;
  history?: Array<{
    id: string;
    code: string;
    timestamp: string;
    status: 'success' | 'error';
    searchTime: number;
    error?: string;
  }>;
  error?: string;
}

/**
 * Busca o código 2FA do Steam via email
 * @returns Promise com o resultado da busca
 */
export async function getSteamCode(): Promise<CodeResponse> {
  try {
    const response = await fetch(`${API_URL}/steam/code`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }

    const raw = await response.text();
    throw new Error(raw.slice(0, 200) || 'Resposta inv�lida do servidor');
  } catch (error) {
    console.error('Erro ao buscar código Steam:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar código'
    };
  }
}

/**
 * Obtém o histórico de códigos buscados
 * @returns Promise com o histórico
 */
export async function getCodeHistory(): Promise<HistoryResponse> {
  try {
    const response = await fetch(`${API_URL}/steam/history`);
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }

    const raw = await response.text();
    throw new Error(raw.slice(0, 200) || 'Resposta inv�lida do servidor');
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
