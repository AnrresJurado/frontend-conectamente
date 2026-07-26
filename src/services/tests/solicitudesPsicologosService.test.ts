import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { solicitudesPsicologosService } from '../solicitudesPsicologosService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('solicitudesPsicologosService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enviarSolicitud() debe enviar la postulación del profesional', async () => {
    const payload = {
      nombre: 'Pedro',
      apellido: 'Gómez',
      email: 'pedro@test.com',
      password: 'Pass123*',
      licenciaProfesional: 'LIC-999',
    };
    (api.post as any).mockResolvedValueOnce({ data: { id: 'sol-1', ...payload } });

    const result = await solicitudesPsicologosService.enviarSolicitud(payload);
    expect(api.post).toHaveBeenCalledWith('solicitudes-psicologos', payload);
    expect(result.id).toBe('sol-1');
  });

  it('getSolicitudes() debe obtener la lista de solicitudes pendientes', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ id: 'sol-1', estado: 'PENDIENTE' }] });

    const result = await solicitudesPsicologosService.getSolicitudes();
    expect(api.get).toHaveBeenCalledWith('solicitudes-psicologos');
    expect(result).toHaveLength(1);
  });

  it('aprobarSolicitud() debe hacer PATCH con observaciones', async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { id: 'sol-1', estado: 'APROBADA' } });

    const result = await solicitudesPsicologosService.aprobarSolicitud('sol-1', 'Todo en regla');
    expect(api.patch).toHaveBeenCalledWith('solicitudes-psicologos/sol-1/aprobar', {
      adminObservaciones: 'Todo en regla',
    });
    expect(result.estado).toBe('APROBADA');
  });

  it('rechazarSolicitud() debe hacer PATCH con observaciones', async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { id: 'sol-1', estado: 'RECHAZADA' } });

    const result = await solicitudesPsicologosService.rechazarSolicitud('sol-1', 'Documento inválido');
    expect(api.patch).toHaveBeenCalledWith('solicitudes-psicologos/sol-1/rechazar', {
      adminObservaciones: 'Documento inválido',
    });
    expect(result.estado).toBe('RECHAZADA');
  });
});