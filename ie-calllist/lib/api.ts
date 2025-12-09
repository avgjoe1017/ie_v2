/**
 * API client helper for making requests
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  
  let url = `${BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }
  
  return response.json();
}

// Auth API
export const authApi = {
  login: (pin: string) => 
    fetchApi<{ success: boolean; user: { name: string; role: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    }),
    
  logout: () =>
    fetchApi<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),
    
  me: () =>
    fetchApi<{ user: { id: string; name: string; role: string } | null }>('/api/auth/me'),
};

// Markets API
export const marketsApi = {
  list: (params?: { feed?: string; search?: string }) =>
    fetchApi<{ stations: Station[] }>('/api/markets', { params }),
    
  get: (id: string) =>
    fetchApi<{ station: Station }>(`/api/markets/${id}`),
    
  update: (id: string, data: Partial<Station>) =>
    fetchApi<{ station: Station }>(`/api/markets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  setPrimaryPhone: (stationId: string, phoneId: string) =>
    fetchApi<{ success: boolean }>(`/api/markets/${stationId}/phones/${phoneId}/primary`, {
      method: 'PATCH',
    }),
};

// Call Logs API
export const callLogsApi = {
  list: (params?: { page?: string; limit?: string }) =>
    fetchApi<{ logs: CallLog[]; total: number }>('/api/call-logs', { params }),
    
  create: (data: { stationId: string; phoneId: string; phoneNumber: string }) =>
    fetchApi<{ log: CallLog }>('/api/call-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Edit Logs API
export const editLogsApi = {
  list: (params?: { stationId?: string; page?: string; limit?: string }) =>
    fetchApi<{ logs: EditLog[]; total: number }>('/api/edit-logs', { params }),
};

// Admin API
export const adminApi = {
  importCSV: (formData: FormData) =>
    fetch('/api/admin/import', {
      method: 'POST',
      body: formData,
    }).then(r => r.json()),
    
  bulkUpdate: (data: { stationIds: string[]; updates: Partial<Station> }) =>
    fetchApi<{ updated: number }>('/api/admin/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  listUsers: () =>
    fetchApi<{ users: User[] }>('/api/admin/users'),
    
  createUser: (data: { name: string; pin: string; role: string }) =>
    fetchApi<{ user: User }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  updateUser: (id: string, data: { name?: string; pin?: string; role?: string }) =>
    fetchApi<{ user: User }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  deleteUser: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    }),
};

// Types (re-exported for convenience)
interface Station {
  id: string;
  marketNumber: number;
  marketName: string;
  callLetters: string;
  feed: string;
  broadcastStatus: string | null;
  airTimeLocal: string;
  airTimeET: string;
  isActive: boolean;
  phones: PhoneNumber[];
}

interface PhoneNumber {
  id: string;
  label: string;
  number: string;
  sortOrder: number;
}

interface CallLog {
  id: string;
  stationId: string;
  phoneNumber: string;
  createdAt: string;
  station?: { marketName: string; callLetters: string };
  phone?: { label: string };
}

interface EditLog {
  id: string;
  stationId: string;
  field: string;
  oldValue: string;
  newValue: string;
  editedBy: string;
  createdAt: string;
  station?: { marketName: string; callLetters: string };
  user?: { name: string };
}

interface User {
  id: string;
  name: string;
  role: string;
  createdAt: string;
}

export type { Station, PhoneNumber, CallLog, EditLog, User };

