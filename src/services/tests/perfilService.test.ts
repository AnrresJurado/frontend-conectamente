import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { perfilService } from '../perfilService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('perfilService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMe() debe traer los datos del usuario autenticado', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { id: 'usr-1', nombre: 'Andrés' } });

    const result = await perfilService.getMe();
    expect(api.get).toHaveBeenCalledWith('/perfil');
    expect(result.nombre).toBe('Andrés');
  });

  it('update() debe enviar PATCH con los campos del perfil a actualizar', async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { id: 'usr-1', nombre: 'Andrés Actualizado' } });

    const result = await perfilService.update({ nombre: 'Andrés Actualizado' });
    expect(api.patch).toHaveBeenCalledWith('/perfil', { nombre: 'Andrés Actualizado' });
    expect(result.nombre).toBe('Andrés Actualizado');
  });
});