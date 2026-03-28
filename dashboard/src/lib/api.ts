import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('lg_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const luaGuardApi = {
  // Auth
  login: async (username: string, password: string) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
    if (res.data.token) localStorage.setItem('lg_token', res.data.token);
    return res.data;
  },
  register: async (username: string, password: string, invite_code: string) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { username, password, invite_code });
    return res.data;
  },
  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('lg_token');
  },
  
  // Scripts
  getScripts: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/scripts`, { headers: getAuthHeaders() });
    return res.data;
  },
  createScript: async (name: string, script_body: string) => {
    const res = await axios.post(`${API_BASE_URL}/api/scripts/create`, { name, script_body }, { headers: getAuthHeaders() });
    return res.data;
  },

  // Keys
  getKeys: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/keys`, { headers: getAuthHeaders() });
    return res.data;
  },
  generateKey: async (script_id: string, custom_key: string = '') => {
    const res = await axios.post(`${API_BASE_URL}/api/keys/generate`, { script_id, custom_key }, { headers: getAuthHeaders() });
    return res.data;
  },

  // Analytics
  getAnalytics: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/analytics`, { headers: getAuthHeaders() });
    return res.data;
  }
};
