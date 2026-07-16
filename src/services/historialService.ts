import api from '../api/axiosConfig';

export interface HistorialClinico {
  id: string;
  fechaSesion: string;
  diagnostico: string;
  observaciones?: string;
  createdAt: string;
}

export const historialService = {
  // 🚀 GET /historiales - Traemos todos y filtramos en frontend por el ID de Usuario del Paciente
  // Tu backend actual no tiene "getByPacienteId", así que utilizaremos findAll y filtraremos de forma segura.
  getByPacienteUsuarioId: async (usuarioId: string) => {
    const { data } = await api.get<any[]>('/historiales');
    // Filtramos los historiales que correspondan al ID de usuario del paciente
    return data.filter(h => h.paciente?.id === usuarioId).map(h => ({
      id: h.id,
      fechaSesion: h.fechaSesion,
      diagnostico: h.diagnostico,
      observaciones: h.observaciones,
      createdAt: h.createdAt
    })) as HistorialClinico[];
  },

  // 🚀 POST /historiales - Guardamos mandando las variables que tu DTO y NestJS exigen
  create: async (usuarioId: string, datos: { diagnostico: string; observaciones: string }) => {
    const { data } = await api.post<any>('/historiales', {
      fechaSesion: new Date().toISOString(), // Fecha actual de la consulta
      diagnostico: datos.diagnostico,
      observaciones: datos.observaciones,
      pacienteId: usuarioId // Vinculamos al id de Usuario del paciente
    });
    return data;
  }
};