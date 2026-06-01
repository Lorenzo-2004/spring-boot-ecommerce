import axios from 'axios';

const getBaseURL = () => {
    const envURL = import.meta.env?.VITE_API_URL || process.env?.REACT_APP_API_URL;
    if (envURL) {
        return envURL.endsWith('/api') ? envURL : `${envURL}/api`;
    }
    return 'http://localhost:8080/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 120000,
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
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;