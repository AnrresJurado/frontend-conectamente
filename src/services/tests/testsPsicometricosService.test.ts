import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { testsPsicometricosService } from '../testsPsicometricosService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('testsPsicometricosService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('obtenerAsignacionesPsicologo() debe consultar las asignaciones del psicólogo', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ _id: 'asig-1' }] });

    const result = await testsPsicometricosService.obtenerAsignacionesPsicologo();
    expect(api.get).toHaveBeenCalledWith('/tests-psicometricos/mis-asignaciones');
    expect(result).toHaveLength(1);
  });

  it('obtenerAsignacionesPaciente() debe consultar las asignaciones del paciente', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ _id: 'asig-2' }] });

    const result = await testsPsicometricosService.obtenerAsignacionesPaciente();
    expect(api.get).toHaveBeenCalledWith('/tests-psicometricos/paciente/asignaciones');
    expect(result).toHaveLength(1);
  });

  it('asignarTest() debe enviar la asignación al paciente', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { _id: 'asig-3', tipoTest: 'ANSIEDAD' } });

    const result = await testsPsicometricosService.asignarTest('pac-1', 'ANSIEDAD' as any);
    expect(api.post).toHaveBeenCalledWith('/tests-psicometricos/asignar', {
      pacienteId: 'pac-1',
      tipoTest: 'ANSIEDAD',
    });
    expect(result._id).toBe('asig-3');
  });

  it('desactivarTest() debe desactivar la asignación mediante PUT', async () => {
    (api.put as any).mockResolvedValueOnce({ data: { _id: 'asig-1', estado: 'INACTIVO' } });

    const result = await testsPsicometricosService.desactivarTest('asig-1');
    expect(api.put).toHaveBeenCalledWith('/tests-psicometricos/asig-1/desactivar');
    expect(result.estado).toBe('INACTIVO');
  });

  it('responderTest() debe guardar las respuestas e intento del paciente', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { _id: 'asig-1', estado: 'COMPLETADO' } });

    const result = await testsPsicometricosService.responderTest(
      'asig-1',
      { p1: 3 },
      15,
      'Ansiedad Moderada',
      {},
      false
    );

    expect(api.post).toHaveBeenCalledWith('/tests-psicometricos/asig-1/responder', {
      respuestas: { p1: 3 },
      puntajeTotal: 15,
      diagnostico: 'Ansiedad Moderada',
      desglose: {},
      alertaCritica: false,
    });
    expect(result.estado).toBe('COMPLETADO');
  });

  it('misResultados() debe consultar los resultados del usuario autenticado', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ _id: 'res-1' }] });

    const result = await testsPsicometricosService.misResultados();
    expect(api.get).toHaveBeenCalledWith('/tests-psicometricos/mis-resultados');
    expect(result).toHaveLength(1);
  });

  it('estadisticasPorTipo() debe consultar las métricas codificando la URL', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [{ promedioPuntaje: 12 }] });

    const result = await testsPsicometricosService.estadisticasPorTipo('DEPRESION Y ANSIEDAD');
    expect(api.get).toHaveBeenCalledWith('/tests-psicometricos/estadisticas/DEPRESION%20Y%20ANSIEDAD');
    expect(result[0].promedioPuntaje).toBe(12);
  });

  it('findOne() debe retornar un resultado por ID', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { _id: 'res-10' } });

    const result = await testsPsicometricosService.findOne('res-10');
    expect(api.get).toHaveBeenCalledWith('/tests-psicometricos/res-10');
    expect(result._id).toBe('res-10');
  });
});