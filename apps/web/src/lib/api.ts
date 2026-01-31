const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function api<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || 'Erro na requisição');
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, token?: string) =>
    api<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, data: unknown, token?: string) =>
    api<T>(endpoint, { method: 'POST', body: JSON.stringify(data), token }),

  put: <T>(endpoint: string, data: unknown, token?: string) =>
    api<T>(endpoint, { method: 'PUT', body: JSON.stringify(data), token }),

  delete: <T>(endpoint: string, token?: string) =>
    api<T>(endpoint, { method: 'DELETE', token }),
};
