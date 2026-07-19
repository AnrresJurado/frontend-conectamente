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

export const progresoService = {
  // GET /progreso
  getAll: async () => {
    const { data } = await api.get<Progreso[]>('/progreso');
    return data;
  },

  // GET /progreso/paciente/:id
  // ⚠️ Backend actual filtra por historial.id en vez de historial.paciente.id, así que
  // para un ID de PACIENTE real este endpoint hoy devuelve siempre un arreglo vacío.
  // Es un bug de backend (progreso.service.ts -> findByPaciente), no de este servicio.
  getByPaciente: async (pacienteId: string) => {
    const { data } = await api.get<Progreso[]>(`/progreso/paciente/${pacienteId}`);
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