import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { agendasService } from '../agendasService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('agendasService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() debe obtener todos los bloques de disponibilidad', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ id: 'b-1', estaReservado: false }] });

    const result = await agendasService.getAll();
    expect(api.get).toHaveBeenCalledWith('/agendas');
    expect(result).toHaveLength(1);
  });

  it('createBlock() debe crear un nuevo bloque horario', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { id: 'b-2', fechaHoraInicio: '2026-08-01T08:00:00Z' } });

    const result = await agendasService.createBlock('2026-08-01T08:00:00Z');
    expect(api.post).toHaveBeenCalledWith('/agendas', { fechaHoraInicio: '2026-08-01T08:00:00Z' });
    expect(result.id).toBe('b-2');
  });

  it('deleteBlock() debe eliminar un bloque por id', async () => {
    (api.delete as any).mockResolvedValueOnce({ data: { message: 'Bloque eliminado' } });

    const result = await agendasService.deleteBlock('b-1');
    expect(api.delete).toHaveBeenCalledWith('/agendas/b-1');
    expect(result.message).toBe('Bloque eliminado');
  });

  it('getHorariosTrabajo() y createHorarioTrabajo() deben gestionar la jornada semanal', async () => {
    const horarioDto = { diaSemana: 1, horaApertura: '08:00', horaCierre: '17:00' };
    (api.post as any).mockResolvedValueOnce({ data: { id: 'h-1', ...horarioDto } });

    const result = await agendasService.createHorarioTrabajo(horarioDto);
    expect(api.post).toHaveBeenCalledWith('/agendas/horarios-trabajo', horarioDto);
    expect(result.id).toBe('h-1');
  });

  it('createExcepcion() debe registrar una indisponibilidad temporal', async () => {
    const excepcionDto = { fechaInicio: '2026-09-01', fechaFin: '2026-09-05', motivo: 'Vacaciones' };
    (api.post as any).mockResolvedValueOnce({ data: { id: 'e-1', ...excepcionDto } });

    const result = await agendasService.createExcepcion(excepcionDto);
    expect(api.post).toHaveBeenCalledWith('/agendas/disponibilidad-excepciones', excepcionDto);
    expect(result.id).toBe('e-1');
  });
});