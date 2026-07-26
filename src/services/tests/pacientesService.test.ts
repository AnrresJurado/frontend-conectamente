import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { pacientesService } from '../pacientesService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('pacientesService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() debe traer pacientes', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ id: 'pac-1' }] });

    const result = await pacientesService.getAll();
    expect(api.get).toHaveBeenCalledWith('/pacientes');
    expect(result).toHaveLength(1);
  });

  it('getTodosParaCitas() debe consultar el selector de citas', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ id: 'pac-1' }, { id: 'pac-2' }] });

    const result = await pacientesService.getTodosParaCitas();
    expect(api.get).toHaveBeenCalledWith('/pacientes/buscar/todos');
    expect(result).toHaveLength(2);
  });

  it('getMe() debe consultar el perfil propio del paciente', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { id: 'pac-1', expediente: 'EXP-100' } });

    const result = await pacientesService.getMe();
    expect(api.get).toHaveBeenCalledWith('/pacientes/me/perfil');
    expect(result.id).toBe('pac-1');
  });

  it('remove() debe eliminar expediente y usuario paciente', async () => {
    (api.delete as any).mockResolvedValueOnce({ data: { deleted: true } });

    const result = await pacientesService.remove('pac-1');
    expect(api.delete).toHaveBeenCalledWith('/pacientes/pac-1');
    expect(result.deleted).toBe(true);
  });
});