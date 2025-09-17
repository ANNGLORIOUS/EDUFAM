const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * A wrapper around the native fetch API to handle common API requests.
 *
 * @param endpoint The API endpoint to call (e.g., '/users').
 * @param options Optional fetch options (method, body, etc.).
 * @returns A promise that resolves with the JSON response.
 * @throws {Error} If the network response is not ok.
 */
export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${getToken()}` // Example for adding auth token
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return Promise.resolve(null as T);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

// Convenience methods for different HTTP verbs
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
