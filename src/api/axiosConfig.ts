import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Solicitud: Inyecta el token en las cabeceras
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta: Manejo global de desautenticación
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError): Promise<AxiosError> => {
    // El propio intento de login no debe disparar este manejo: un 401 aquí es
    // "credenciales inválidas", no una sesión expirada, y Login.tsx ya lo maneja
    // con su propio try/catch. Forzar la redirección aquí recargaba la página
    // completa y borraba el mensaje de error antes de que el usuario lo viera.
    const esLogin = error.config?.url?.includes('/auth/login');
    if (error.response && error.response.status === 401 && !esLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;