const API_BASE_URL = import.meta.env.VITE_STEAM_GUARD_API_URL;

interface SteamCodeResponse {
  success: boolean;
  code?: string;
  searchTime?: number;
  error?: string;
}

export async function fetchSteamGuardCode(): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error('A URL da API do Steam Guard (VITE_STEAM_GUARD_API_URL) não está definida.');
  }

  const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/steam/code`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar código Steam Guard (HTTP ${response.status}).`);
  }

  const data: SteamCodeResponse = await response.json();

  if (!data.success || !data.code) {
    throw new Error(data.error || 'API retornou uma resposta sem código.');
  }

  return data.code;
}
