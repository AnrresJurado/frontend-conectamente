import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { progresoService } from '../progresoService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('progresoService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getByPaciente() debe traer el historial de avance del paciente', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ id: 'prog-1', estadoEmocional: 'Estable' }] });

    const result = await progresoService.getByPaciente('pac-10');
    expect(api.get).toHaveBeenCalledWith('/progreso/paciente/pac-10');
    expect(result).toHaveLength(1);
  });

  it('create() debe registrar un nuevo avance', async () => {
    const input = { historialId: 'h-1', fecha: '2026-07-26', estadoEmocional: 'Optimista', avance: 'Bueno' };
    (api.post as any).mockResolvedValueOnce({ data: { id: 'prog-2', ...input } });

    const result = await progresoService.create(input);
    expect(api.post).toHaveBeenCalledWith('/progreso', input);
    expect(result.id).toBe('prog-2');
  });

  it('remove() debe eliminar un registro de progreso', async () => {
    (api.delete as any).mockResolvedValueOnce({ data: { message: 'Eliminado' } });

    const result = await progresoService.remove('prog-1');
    expect(api.delete).toHaveBeenCalledWith('/progreso/prog-1');
    expect(result.message).toBe('Eliminado');
  });
});