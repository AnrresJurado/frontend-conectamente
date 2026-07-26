import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const renderConRuta = (allowedRoles?: Array<'ADMIN' | 'PSICOLOGO' | 'PACIENTE'>) => {
  return render(
    <MemoryRouter initialEntries={['/privado']}>
      <Routes>
        <Route path="/login" element={<div>Pantalla de Login</div>} />
        <Route path="/dashboard" element={<div>Dashboard base</div>} />
        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route path="/privado" element={<div>Contenido privado</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga mientras loading es true (caso borde)', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: true });

    renderConRuta();

    expect(screen.getByText(/cargando conectamente/i)).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('redirige a /login si no hay usuario autenticado (caso de error/no autorizado)', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: false });

    renderConRuta();

    expect(screen.getByText('Pantalla de Login')).toBeInTheDocument();
  });

  it('renderiza el contenido protegido si el usuario está autenticado y no se piden roles (caso exitoso)', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', rol: 'PACIENTE' },
      loading: false,
    });

    renderConRuta();

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('redirige a /dashboard si el usuario no tiene ninguno de los roles permitidos (caso borde)', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', rol: 'PACIENTE' },
      loading: false,
    });

    renderConRuta(['ADMIN']);

    expect(screen.getByText('Dashboard base')).toBeInTheDocument();
  });

  it('renderiza el contenido si el usuario tiene uno de los roles permitidos', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '2', rol: 'PSICOLOGO' },
      loading: false,
    });

    renderConRuta(['ADMIN', 'PSICOLOGO']);

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });
});