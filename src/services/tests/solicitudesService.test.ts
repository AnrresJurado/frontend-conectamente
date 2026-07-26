import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { solicitudesService } from '../solicitudesService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('solicitudesService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enviar() debe emitir la solicitud de vinculación del paciente', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { id: 'vinc-1', estado: 'PENDIENTE' } });

    const result = await solicitudesService.enviar('psic-1', 'Hola, busco consulta');
    expect(api.post).toHaveBeenCalledWith('solicitudes/enviar', {
      psicologoId: 'psic-1',
      mensajeInicial: 'Hola, busco consulta',
    });
    expect(result.id).toBe('vinc-1');
  });

  it('getBandeja() debe traer las solicitudes pendientes del psicólogo', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ id: 'vinc-1' }] });

    const result = await solicitudesService.getBandeja();
    expect(api.get).toHaveBeenCalledWith('solicitudes/bandeja');
    expect(result).toHaveLength(1);
  });

  it('procesar() debe modificar el estado de vinculación (ACEPTADA/RECHAZADA)', async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { id: 'vinc-1', estado: 'ACEPTADA' } });

    const result = await solicitudesService.procesar('vinc-1', 'ACEPTADA');
    expect(api.patch).toHaveBeenCalledWith('solicitudes/vinc-1/procesar', { estado: 'ACEPTADA' });
    expect(result.estado).toBe('ACEPTADA');
  });
});