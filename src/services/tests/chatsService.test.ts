import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { chatsService } from '../chatsService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('chatsService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enviarMensaje() debe realizar POST con la carga del mensaje', async () => {
    const payload = { destinatarioId: 'usr-2', mensaje: 'Hola doctor' };
    (api.post as any).mockResolvedValueOnce({ data: { _id: 'm-1', ...payload } });

    const result = await chatsService.enviarMensaje(payload);
    expect(api.post).toHaveBeenCalledWith('/chats', payload);
    expect(result._id).toBe('m-1');
  });

  it('obtenerHistorial() debe consultar mensajes con un usuario específico', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ _id: 'm-1', mensaje: 'Hola' }] });

    const result = await chatsService.obtenerHistorial('usr-2');
    expect(api.get).toHaveBeenCalledWith('/chats/usr-2');
    expect(result).toHaveLength(1);
  });

  it('actualizarMensaje() debe enviar PUT para editar el texto', async () => {
    (api.put as any).mockResolvedValueOnce({ data: { _id: 'm-1', mensaje: 'Editado' } });

    const result = await chatsService.actualizarMensaje('m-1', { mensaje: 'Editado' });
    expect(api.put).toHaveBeenCalledWith('/chats/m-1', { mensaje: 'Editado' });
    expect(result.mensaje).toBe('Editado');
  });

  it('eliminarMensaje() debe llamar a DELETE', async () => {
    (api.delete as any).mockResolvedValueOnce({ data: { deleted: true } });

    const result = await chatsService.eliminarMensaje('m-1');
    expect(api.delete).toHaveBeenCalledWith('/chats/m-1');
    expect(result.deleted).toBe(true);
  });
});