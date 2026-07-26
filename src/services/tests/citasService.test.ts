import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { citasService } from '../citasService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('citasService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() debe retornar el listado de citas (Caso Éxito)', async () => {
    const mockCitas = [
      { id: 'c-1', fechaHora: '2026-08-01T10:00:00Z', estado: 'CONFIRMADA' },
    ];
    (api.get as any).mockResolvedValueOnce({ data: mockCitas });

    const result = await citasService.getAll();

    expect(api.get).toHaveBeenCalledWith('/citas');
    expect(result).toHaveLength(1);
    expect(result[0].estado).toBe('CONFIRMADA');
  });

  it('create() debe enviar la agendaId y motivoConsulta correctamente', async () => {
    const mockNuevaCita = { id: 'c-2', estado: 'PENDIENTE' };
    (api.post as any).mockResolvedValueOnce({ data: mockNuevaCita });

    const result = await citasService.create('agenda-1', 'Consulta general', 'paciente-1');

    expect(api.post).toHaveBeenCalledWith('/citas', {
      agendaId: 'agenda-1',
      motivoConsulta: 'Consulta general',
      pacienteId: 'paciente-1',
    });
    expect(result.id).toBe('c-2');
  });

  it('updatePagoStatus() debe cambiar el estado del pago', async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { id: 'pago-1', estado: 'PAGADO' } });

    const result = await citasService.updatePagoStatus('pago-1', 'PAGADO');

    expect(api.patch).toHaveBeenCalledWith('/citas/pagos/pago-1', { estado: 'PAGADO' });
    expect(result.estado).toBe('PAGADO');
  });

  it('remove() debe lanzar error si la cita no existe o ya fue cancelada (Caso Error)', async () => {
    (api.delete as any).mockRejectedValueOnce({
      response: { status: 404, data: { message: 'Cita no encontrada' } },
    });

    await expect(citasService.remove('cita-invalida')).rejects.toBeTruthy();
  });

  // Agregar al final de src/services/tests/citasService.test.ts:

   it('update() debe enviar los datos modificados de la cita', async () => {
    const mockCitaActualizada = { id: 'c-10', estado: 'REALIZADA' };
    (api.patch as any).mockResolvedValueOnce({ data: mockCitaActualizada });

    const result = await citasService.update('c-10', 'REALIZADA', 'Paciente mostró avances.');

    expect(api.patch).toHaveBeenCalledWith('/citas/c-10', {
        estado: 'REALIZADA',
        notasNotasMedicas: 'Paciente mostró avances.'
    });
    expect(result.estado).toBe('REALIZADA');
    });
});