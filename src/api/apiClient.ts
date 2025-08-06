import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const authTokensString = localStorage.getItem('authTokens');
        if (authTokensString) {
            try {
                const authTokens = JSON.parse(authTokensString);
                if (authTokens?.access) {
                    config.headers.Authorization = `Bearer ${authTokens.access}`;
                }
            } catch (e) { console.error("Error al parsear authTokens", e); }
        }
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const authTokensString = localStorage.getItem('authTokens');
                if (!authTokensString) return Promise.reject(error);
                const { refresh } = JSON.parse(authTokensString);
                
                const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
                const newAuthTokens = response.data;
                
                localStorage.setItem('authTokens', JSON.stringify(newAuthTokens));
                originalRequest.headers.Authorization = `Bearer ${newAuthTokens.access}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                // --- CAMBIO CLAVE AQUÍ ---
                // Si el refresco falla, la sesión ha terminado.
                console.log("Sesión expirada. Redirigiendo al login.");
                // Limpiamos cualquier token viejo.
                localStorage.removeItem('authTokens');
                // Redirigimos a la página de inicio.
                window.location.href = '/login'; 
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;