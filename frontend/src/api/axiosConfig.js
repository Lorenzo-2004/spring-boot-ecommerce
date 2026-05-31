import axios from 'axios';

const api = axios.create({
    baseURL:'http://192.168.43.101:8080/api',
    timeout: 120000,  // Augmenté à 120 secondes
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url} - Timeout: ${config.timeout || 60000}ms`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`📥 ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('❌ Request timeout:', error.config?.url);
        }
        if (error.response?.status === 401) {
            console.log('Unauthorized - Redirecting to login');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;