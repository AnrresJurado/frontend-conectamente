import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { especialidadesService } from '../especialidadesService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('especialidadesService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() debe solicitar el catálogo de especialidades maestras (Caso Éxito)', async () => {
    const mockEspecialidades = [
      { id: 'esp-1', nombre: 'Psicología Clínica' },
      { id: 'esp-2', nombre: 'Neuropsicología' },
    ];

    (api.get as any).mockResolvedValueOnce({ data: mockEspecialidades });

    const result = await especialidadesService.getAll();

    expect(api.get).toHaveBeenCalledWith('especialidades');
    expect(result).toHaveLength(2);
    expect(result[0].nombre).toBe('Psicología Clínica');
  });

  it('getAll() debe manejar respuestas con arreglos vacíos (Caso Borde)', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [] });

    const result = await especialidadesService.getAll();

    expect(api.get).toHaveBeenCalledWith('especialidades');
    expect(result).toEqual([]);
  });

  it('getAll() debe propagar el error si la API responde con fallo (Caso Error)', async () => {
    const mockError = new Error('Error al obtener especialidades');
    (api.get as any).mockRejectedValueOnce(mockError);

    await expect(especialidadesService.getAll()).rejects.toThrow('Error al obtener especialidades');
  });
});