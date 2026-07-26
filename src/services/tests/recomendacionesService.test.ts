import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { recomendacionesService } from '../recomendacionesService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('recomendacionesService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() debe retornar la lista de recomendaciones', async () => {
    const mockData = [{ id: 'rec-1', titulo: 'Ejercicio físico' }];
    (api.get as any).mockResolvedValueOnce({ data: mockData });

    const result = await recomendacionesService.getAll();
    expect(api.get).toHaveBeenCalledWith('/recomendaciones');
    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe('Ejercicio físico');
  });

  it('getById() debe retornar una recomendación por su ID', async () => {
    const mockData = { id: 'rec-1', titulo: 'Lectura diaria' };
    (api.get as any).mockResolvedValueOnce({ data: mockData });

    const result = await recomendacionesService.getById('rec-1');
    expect(api.get).toHaveBeenCalledWith('/recomendaciones/rec-1');
    expect(result.id).toBe('rec-1');
  });

  it('getByPaciente() debe filtrar recomendaciones por id del paciente', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ id: 'rec-1' }] });

    const result = await recomendacionesService.getByPaciente('pac-10');
    expect(api.get).toHaveBeenCalledWith('/recomendaciones/paciente/pac-10');
    expect(result).toHaveLength(1);
  });

  it('create() debe enviar la nueva recomendación', async () => {
    const input = { fecha: '2026-08-01', titulo: 'Meditación', descripcion: '10 min diarios', pacienteId: 'pac-1' };
    (api.post as any).mockResolvedValueOnce({ data: { id: 'rec-2', ...input } });

    const result = await recomendacionesService.create(input);
    expect(api.post).toHaveBeenCalledWith('/recomendaciones', input);
    expect(result.id).toBe('rec-2');
  });

  it('update() debe enviar petición PATCH con los cambios', async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { id: 'rec-1', titulo: 'Ajustado' } });

    const result = await recomendacionesService.update('rec-1', { titulo: 'Ajustado' });
    expect(api.patch).toHaveBeenCalledWith('/recomendaciones/rec-1', { titulo: 'Ajustado' });
    expect(result.titulo).toBe('Ajustado');
  });

  it('delete() debe invocar endpoint DELETE de la recomendación', async () => {
    (api.delete as any).mockResolvedValueOnce({ data: { deleted: true, id: 'rec-1' } });

    const result = await recomendacionesService.delete('rec-1');
    expect(api.delete).toHaveBeenCalledWith('/recomendaciones/rec-1');
    expect(result.deleted).toBe(true);
  });
});