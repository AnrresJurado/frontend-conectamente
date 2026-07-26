import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../axiosConfig';

describe('axiosConfig Interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe inyectar el header Authorization si existe token en localStorage', async () => {
    localStorage.setItem('token', 'token-de-prueba-123');

    // Obtenemos el handler del interceptor de request
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;

    const dummyConfig = { headers: {} };
    const resultConfig = requestInterceptor(dummyConfig);

    expect(resultConfig.headers.Authorization).toBe('Bearer token-de-prueba-123');
  });

  it('debe dejar las cabeceras intactas si no hay token en localStorage', () => {
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;

    const dummyConfig = { headers: {} };
    const resultConfig = requestInterceptor(dummyConfig);

    expect(resultConfig.headers.Authorization).toBeUndefined();
  });

  it('debe limpiar el localStorage si la respuesta lanza status 401', async () => {
    localStorage.setItem('token', 'token-invalido');
    localStorage.setItem('user', JSON.stringify({ nombre: 'Andres' }));

    // Mockear window.location
    delete (window as any).location;
    window.location = { href: '' } as any;

    const responseInterceptorError = (api.interceptors.response as any).handlers[0].rejected;

    const dummyError = {
      response: { status: 401 }
    };

    try {
      await responseInterceptorError(dummyError);
    } catch (e) {
      // Esperamos que haga reject del error
    }

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});