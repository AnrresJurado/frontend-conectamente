import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '../contexts/AuthContext';

vi.mock('../api/axiosConfig', () => ({
  default: { post: vi.fn() },
}));

describe('useAuth', () => {
  it('lanza un error si se usa fuera de un AuthProvider (caso de error)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth debe ser utilizado obligatoriamente dentro de un AuthProvider'
    );

    spy.mockRestore();
  });

  it('devuelve el contexto (user, login, logout) cuando se usa dentro de un AuthProvider (caso exitoso)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });
});