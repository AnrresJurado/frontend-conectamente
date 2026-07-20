import api from '../api/axiosConfig';

export interface HistorialClinico {
  id: string;
  fechaSesion: string;
  diagnostico: string;
  observaciones?: string;
  createdAt: string;
}

export const historialService = {
  // 🚀 GET /historiales - Trae el listado completo con relaciones de paciente y psicólogo.
  // Usado por el Dashboard para construir el gráfico de "Historial por especialidad".
  getAll: async () => {
    const { data } = await api.get<any[]>('/historiales');
    return data;
  },

  // 🚀 GET /historiales - Traemos todos y filtramos en frontend por el ID de Usuario del Paciente
  getByPacienteUsuarioId: async (usuarioId: string) => {
    const { data } = await api.get<any[]>('/historiales');
    return data.filter(h => h.paciente?.id === usuarioId).map(h => ({
      id: h.id,
      fechaSesion: h.fechaSesion,
      diagnostico: h.diagnostico,
      observaciones: h.observaciones,
      createdAt: h.createdAt
    })) as HistorialClinico[];
  },

  // 🚀 POST /historiales - AHORA ADMITE FECHASESION DESDE EL FORMULARIO
  create: async (usuarioId: string, datos: { diagnostico: string; observaciones: string; fechaSesion?: string | Date }) => {
    const { data } = await api.post<any>('/historiales', {
      // 🎯 Si le mandamos la fecha de la cita la usa, si no, tira la fecha de hoy por defecto
      fechaSesion: datos.fechaSesion ? new Date(datos.fechaSesion).toISOString() : new Date().toISOString(),
      diagnostico: datos.diagnostico,
      observaciones: datos.observaciones,
      pacienteId: usuarioId 
    });
    return data;
  }
};