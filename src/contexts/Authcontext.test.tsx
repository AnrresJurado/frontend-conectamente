import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode';

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

vi.mock('../api/axiosConfig', () => ({
  default: { post: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext / AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('inicia con user null y termina con loading en false si no hay sesión guardada (caso borde)', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('restaura la sesión desde localStorage si ya existe un token guardado', async () => {
    const usuarioGuardado = { id: '1', email: 'a@a.com', nombre: 'Ana', apellido: 'Diaz', rol: 'PACIENTE' };
    localStorage.setItem('token', 'token-guardado');
    localStorage.setItem('user', JSON.stringify(usuarioGuardado));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(usuarioGuardado);
  });

  it('login exitoso: decodifica el token, guarda el usuario y actualiza el estado (caso exitoso)', async () => {
    (api.post as any).mockResolvedValue({ data: { accessToken: 'jwt-valido' } });
    (jwtDecode as any).mockReturnValue({
      sub: '5',
      email: 'user@conectamente.com',
      nombre: 'Pedro',
      apellido: 'Lopez',
      rol: 'PSICOLOGO',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login('user@conectamente.com', '123456');
    });

    expect(result.current.user).toEqual({
      id: '5',
      email: 'user@conectamente.com',
      nombre: 'Pedro',
      apellido: 'Lopez',
      rol: 'PSICOLOGO',
    });
    expect(localStorage.getItem('token')).toBe('jwt-valido');
    expect(JSON.parse(localStorage.getItem('user') as string)).toEqual(result.current.user);
  });

  it('login: lanza un error si el backend no devuelve token (caso de error)', async () => {
    (api.post as any).mockResolvedValue({ data: '' });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.login('user@conectamente.com', 'mal-password');
      })
    ).rejects.toThrow('No se recibió un token válido del servidor.');

    expect(result.current.user).toBeNull();
  });

  it('logout: limpia localStorage y vuelve el user a null', async () => {
    localStorage.setItem('token', 'token-x');
    localStorage.setItem('user', JSON.stringify({ id: '1', rol: 'PACIENTE' }));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});