import api from '../api/axiosConfig';

export interface Cita {
  id: string;
  fechaHora: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'REALIZADA';
  motivoConsulta?: string;
  notasNotasMedicas?: string;
  paciente?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export const citasService = {
  // Trae todas las citas del psicólogo logueado o administrador
  getAll: async () => {
    const { data } = await api.get<Cita[]>('/citas');
    return data;
  },

  // Agenda una nueva cita asociándola a un bloque de agenda y un paciente específico
  create: async (agendaId: string, motivoConsulta: string, pacienteId?: string) => {
    const { data } = await api.post<Cita>('/citas', {
      agendaId,
      motivoConsulta,
      pacienteId // 🚀 Enviado si estamos agendando desde el psicólogo
    });
    return data;
  },

  // Modifica el estado o notas de una cita
  update: async (id: string, estado: string, notasNotasMedicas?: string) => {
    const { data } = await api.patch<Cita>(`/citas/${id}`, {
      estado,
      notasNotasMedicas
    });
    return data;
  },

  // Cancela la cita y libera el bloque en la agenda
  remove: async (id: string) => {
    const { data } = await api.delete<void>(`/citas/${id}`);
    return data;
  }
};