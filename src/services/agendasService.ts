import api from '../api/axiosConfig';

export interface AgendaBlock {
  id: string;
  fechaHoraInicio: string;
  estaReservado: boolean;
  psicologo?: {
    id: string;
    nombre?: string;
  };
}

export interface HorarioTrabajo {
  id: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
}

export interface ExcepcionDisponibilidad {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
}

export const agendasService = {
  // --- GESTIÓN DE BLOQUES DE DISPONIBILIDAD ---
  getAll: async () => {
    const { data } = await api.get<AgendaBlock[]>('/agendas');
    return data;
  },

  createBlock: async (fechaHoraInicio: string) => {
    const { data } = await api.post<AgendaBlock>('/agendas', { fechaHoraInicio });
    return data;
  },

  deleteBlock: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/agendas/${id}`);
    return data;
  },

  // --- GESTIÓN DE HORARIOS SEMANALES ---
  getHorariosTrabajo: async () => {
    const { data } = await api.get<HorarioTrabajo[]>('/agendas/horarios-trabajo');
    return data;
  },

  createHorarioTrabajo: async (datos: { diaSemana: number; horaApertura: string; horaCierre: string }) => {
    const { data } = await api.post<HorarioTrabajo>('/agendas/horarios-trabajo', datos);
    return data;
  },

  deleteHorarioTrabajo: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/agendas/horarios-trabajo/${id}`);
    return data;
  },

  // --- GESTIÓN DE EXCEPCIONES ---
  getExcepciones: async () => {
    const { data } = await api.get<ExcepcionDisponibilidad[]>('/agendas/disponibilidad-excepciones');
    return data;
  },

  createExcepcion: async (datos: { fechaInicio: string; fechaFin: string; motivo: string }) => {
    const { data } = await api.post<ExcepcionDisponibilidad>('/agendas/disponibilidad-excepciones', datos);
    return data;
  },

  deleteExcepcion: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/agendas/disponibilidad-excepciones/${id}`);
    return data;
  }
};