import api from '../api/axiosConfig';

export interface Progreso {
  id: string;
  fecha: string;
  estadoEmocional: string;
  avance: string;
  observaciones?: string;
  historial?: {
    id: string;
    paciente?: { id: string; nombre: string; apellido: string };
  };
  createdAt: string;
}

export interface CreateProgresoInput {
  historialId: string;
  fecha: string;
  estadoEmocional: string;
  avance: string;
  observaciones?: string;
}

export interface MetricasProgreso {
  totalProgresos: number;
  progresosUltimos30Dias: number;
  porEstadoEmocional: Array<{
    estado: string;
    cantidad: number;
  }>;
  ultimosProgresos: Progreso[];
}

export const progresoService = {
  // GET /progreso
  getAll: async () => {
    const { data } = await api.get<Progreso[]>('/progreso');
    return data;
  },

  // GET /progreso/paciente/:id
  getByPaciente: async (pacienteId: string) => {
    const { data } = await api.get<Progreso[]>(`/progreso/paciente/${pacienteId}`);
    return data;
  },

  // GET /progreso/metricas/generales
  getMetricas: async () => {
    const { data } = await api.get<MetricasProgreso>('/progreso/metricas/generales');
    return data;
  },

  create: async (input: CreateProgresoInput) => {
    const { data } = await api.post<Progreso>('/progreso', input);
    return data;
  },

  update: async (id: string, input: Partial<CreateProgresoInput>) => {
    const { data } = await api.patch<Progreso>(`/progreso/${id}`, input);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/progreso/${id}`);
    return data;
  },
};
