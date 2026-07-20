import api from '../api/axiosConfig';

export interface TestResultado {
  _id: string;
  pacienteId: string;
  tipoTest: string;
  respuestas: Record<string, unknown>;
  puntajeTotal: number;
  diagnosticoPreliminar: string;
  fechaRealizacion: string;
}

export interface CreateTestResultadoInput {
  tipoTest: string;
  respuestas: Record<string, unknown>;
  puntajeTotal: number;
  diagnosticoPreliminar: string;
}

export interface EstadisticaMensualTest {
  _id: { año: number; mes: number };
  promedioPuntaje: number;
  totalEvaluaciones: number;
}

export const testsPsicometricosService = {
  // GET /tests-psicometricos/mis-resultados (requiere JWT, filtra por el usuario autenticado)
  misResultados: async () => {
    const { data } = await api.get<TestResultado[]>('/tests-psicometricos/mis-resultados');
    return data;
  },

  // GET /tests-psicometricos/estadisticas/:tipoTest
  // Solo ADMIN/PSICOLOGO (el backend lanza 403 para otros roles).
  // ⚠️ "tipoTest" es un string libre en el DTO/schema (no hay enum en backend).
  estadisticasPorTipo: async (tipoTest: string) => {
    const { data } = await api.get<EstadisticaMensualTest[]>(
      `/tests-psicometricos/estadisticas/${encodeURIComponent(tipoTest)}`
    );
    return data;
  },

  registrar: async (input: CreateTestResultadoInput) => {
    const { data } = await api.post<TestResultado>('/tests-psicometricos', input);
    return data;
  },
};