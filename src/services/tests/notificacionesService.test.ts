import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { notificacionesService } from '../notificacionesService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('notificacionesService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('create() debe enviar la notificación', async () => {
    const dto = { usuarioId: 'usr-1', titulo: 'Cita', mensaje: 'Recordatorio' };
    (api.post as any).mockResolvedValueOnce({ data: { _id: 'n-1', ...dto } });

    const result = await notificacionesService.create(dto);
    expect(api.post).toHaveBeenCalledWith('/notificaciones', dto);
    expect(result._id).toBe('n-1');
  });

  it('findByUsuario() debe consultar notificaciones por ID de usuario', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ _id: 'n-1', leido: false }] });

    const result = await notificacionesService.findByUsuario('usr-1');
    expect(api.get).toHaveBeenCalledWith('/notificaciones/usuario/usr-1');
    expect(result).toHaveLength(1);
  });

  it('marcarComoLeida() debe hacer PATCH a /leer', async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { _id: 'n-1', leido: true } });

    const result = await notificacionesService.marcarComoLeida('n-1');
    expect(api.patch).toHaveBeenCalledWith('/notificaciones/n-1/leer');
    expect(result.leido).toBe(true);
  });

  it('remove() debe eliminar la notificación especificada', async () => {
    (api.delete as any).mockResolvedValueOnce({ data: { deleted: true } });

    const result = await notificacionesService.remove('n-1');
    expect(api.delete).toHaveBeenCalledWith('/notificaciones/n-1');
    expect(result.deleted).toBe(true);
  });
});