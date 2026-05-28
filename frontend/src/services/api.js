import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 60000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Network / proxy / CORS errors (no response)
        if (!error.response) {
            console.warn('API network error:', {
                message: error.message,
                baseURL: api.defaults.baseURL,
                url: error.config?.url,
                method: error.config?.method,
            });
            return Promise.reject(error);
        }

        // Only auto-logout on 401 from non-auth-verification endpoints
        // /auth/me is handled by AuthContext itself
        const url = error.config?.url || '';
        if (
            error.response?.status === 401 &&
            localStorage.getItem('token') &&
            !url.includes('/auth/me')
        ) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;