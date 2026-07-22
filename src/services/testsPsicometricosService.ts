import api from '../api/axiosConfig';
import { TipoTest } from '../data/testsPredefinidos';

export interface TestResultado {
  _id: string;
  pacienteId: string;
  tipoTest: string;
  respuestas: Record<string, unknown>;
  puntajeTotal: number;
  diagnosticoPreliminar: string;
  fechaRealizacion: string;
}

export interface AsignacionTest {
  _id: string;
  pacienteId: string;
  psicologoId: string;
  tipoTest: TipoTest;
  estado: 'ACTIVO' | 'COMPLETADO' | 'INACTIVO';
  intentos: IntentoTest[];
  numeroIntentos: number;
}

export interface IntentoTest {
  fecha: string;
  respuestas: Record<string, any>;
  puntajeTotal: number;
  diagnostico: string;
  desglose: Record<string, any>;
  alertaCritica?: boolean;
}

export interface EstadisticaMensualTest {
  _id: { año: number; mes: number };
  promedioPuntaje: number;
  totalEvaluaciones: number;
}

export const testsPsicometricosService = {
  // GET /tests-psicometricos/mis-asignaciones (psicólogo)
  obtenerAsignacionesPsicologo: async () => {
    const { data } = await api.get<AsignacionTest[]>('/tests-psicometricos/mis-asignaciones');
    return data;
  },

  // GET /tests-psicometricos/paciente/asignaciones (paciente)
  obtenerAsignacionesPaciente: async () => {
    const { data } = await api.get<AsignacionTest[]>('/tests-psicometricos/paciente/asignaciones');
    return data;
  },

  // POST /tests-psicometricos/asignar (psicólogo)
  asignarTest: async (pacienteId: string, tipoTest: TipoTest) => {
    const { data } = await api.post<AsignacionTest>('/tests-psicometricos/asignar', {
      pacienteId,
      tipoTest,
    });
    return data;
  },

  // PUT /tests-psicometricos/:id/desactivar (psicólogo)
  desactivarTest: async (asignacionId: string) => {
    const { data } = await api.put<AsignacionTest>(`/tests-psicometricos/${asignacionId}/desactivar`);
    return data;
  },

  // POST /tests-psicometricos/:id/responder (paciente)
  responderTest: async (asignacionId: string, respuestas: Record<string, any>, puntajeTotal: number, diagnostico: string, desglose: Record<string, any>, alertaCritica?: boolean) => {
    const { data } = await api.post<AsignacionTest>(`/tests-psicometricos/${asignacionId}/responder`, {
      respuestas,
      puntajeTotal,
      diagnostico,
      desglose,
      alertaCritica,
    });
    return data;
  },

  // GET /tests-psicometricos/mis-resultados (requiere JWT, filtra por el usuario autenticado)
  misResultados: async () => {
    const { data } = await api.get<TestResultado[]>('/tests-psicometricos/mis-resultados');
    return data;
  },

  // GET /tests-psicometricos/estadisticas/:tipoTest
  // Solo ADMIN/PSICOLOGO (el backend lanza 403 para otros roles).
  estadisticasPorTipo: async (tipoTest: string) => {
    const { data } = await api.get<EstadisticaMensualTest[]>(
      `/tests-psicometricos/estadisticas/${encodeURIComponent(tipoTest)}`
    );
    return data;
  },

  // GET /tests-psicometricos/:id
  findOne: async (id: string) => {
    const { data } = await api.get<TestResultado>(`/tests-psicometricos/${id}`);
    return data;
  },
};