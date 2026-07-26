import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationBell from './NotificationBell';
import { notificacionesService } from '../services/notificacionesService';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/notificacionesService', () => ({
  notificacionesService: {
    findByUsuario: vi.fn(),
    marcarComoLeida: vi.fn(),
  },
}));

const abrirCampana = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /notificaciones/i }));
  return user;
};

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (notificacionesService.marcarComoLeida as any).mockResolvedValue(undefined);
  });

  it('no consulta notificaciones si no hay usuario logueado (caso borde)', () => {
    (useAuth as any).mockReturnValue({ user: null });

    render(<NotificationBell />);

    expect(notificacionesService.findByUsuario).not.toHaveBeenCalled();
  });

  it('muestra el estado vacío cuando el usuario no tiene notificaciones', async () => {
    (useAuth as any).mockReturnValue({ user: { id: 'u1' } });
    (notificacionesService.findByUsuario as any).mockResolvedValue([]);

    render(<NotificationBell />);
    await abrirCampana();

    expect(await screen.findByText('No tienes notificaciones todavía')).toBeInTheDocument();
  });

  it('muestra las notificaciones ordenadas por fecha y el contador de no leídas', async () => {
    (useAuth as any).mockReturnValue({ user: { id: 'u1' } });
    (notificacionesService.findByUsuario as any).mockResolvedValue([
      { _id: '1', titulo: 'Vieja', mensaje: 'msg', leido: true, createdAt: '2024-01-01T00:00:00.000Z' },
      { _id: '2', titulo: 'Nueva', mensaje: 'msg', leido: false, createdAt: '2024-06-01T00:00:00.000Z' },
    ]);

    render(<NotificationBell />);
    await abrirCampana();

    expect(await screen.findByText('1 nuevas')).toBeInTheDocument();
    const titulos = await screen.findAllByText(/Vieja|Nueva/);
    // La más reciente ("Nueva") debe listarse primero
    expect(titulos[0]).toHaveTextContent('Nueva');
  });

  it('al hacer click en una notificación no leída, la marca como leída (caso exitoso)', async () => {
    (useAuth as any).mockReturnValue({ user: { id: 'u1' } });
    (notificacionesService.findByUsuario as any).mockResolvedValue([
      { _id: '1', titulo: 'Turno confirmado', mensaje: 'msg', leido: false, createdAt: '2024-06-01T00:00:00.000Z' },
    ]);

    render(<NotificationBell />);
    const user = await abrirCampana();

    const item = await screen.findByText('Turno confirmado');
    await user.click(item);

    await waitFor(() => expect(notificacionesService.marcarComoLeida).toHaveBeenCalledWith('1'));
  });

  it('NO vuelve a marcar como leída una notificación que ya estaba leída (caso borde)', async () => {
    (useAuth as any).mockReturnValue({ user: { id: 'u1' } });
    (notificacionesService.findByUsuario as any).mockResolvedValue([
      { _id: '1', titulo: 'Ya leída', mensaje: 'msg', leido: true, createdAt: '2024-06-01T00:00:00.000Z' },
    ]);

    render(<NotificationBell />);
    const user = await abrirCampana();

    const item = await screen.findByText('Ya leída');
    await user.click(item);

    expect(notificacionesService.marcarComoLeida).not.toHaveBeenCalled();
  });
});