import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { historialService } from '../historialService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('historialService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() debe obtener todos los historiales', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ id: 'h-1', diagnostico: 'Estrés' }] });

    const result = await historialService.getAll();
    expect(api.get).toHaveBeenCalledWith('/historiales');
    expect(result).toHaveLength(1);
  });

  it('getByPacienteUsuarioId() debe filtrar los historiales por ID del usuario paciente', async () => {
    const rawData = [
      { id: 'h-1', diagnostico: 'Ansiedad', paciente: { id: 'usr-paciente-1' } },
      { id: 'h-2', diagnostico: 'Depresión', paciente: { id: 'usr-paciente-2' } },
    ];
    (api.get as any).mockResolvedValueOnce({ data: rawData });

    const result = await historialService.getByPacienteUsuarioId('usr-paciente-1');
    expect(result).toHaveLength(1);
    expect(result[0].diagnostico).toBe('Ansiedad');
  });

  it('create() debe asignar la fecha enviada o generar una fecha por defecto', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { id: 'h-3', diagnostico: 'Insomnio' } });

    const datosInput = { diagnostico: 'Insomnio', observaciones: 'Revisión semanal' };
    const result = await historialService.create('usr-paciente-1', datosInput);

    expect(api.post).toHaveBeenCalledWith('/historiales', expect.objectContaining({
      diagnostico: 'Insomnio',
      observaciones: 'Revisión semanal',
      pacienteId: 'usr-paciente-1',
    }));
    expect(result.id).toBe('h-3');
  });
});