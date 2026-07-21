import api from '../api/axiosConfig';

export interface SolicitudVinculacion {
  id: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  mensajeInicial?: string;
  creadoEn: string;
  paciente?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export const solicitudesService = {
  // 🚪 El Paciente envía la solicitud al psicólogo
  enviar: async (psicologoId: string, mensajeInicial?: string) => {
    const { data } = await api.post('solicitudes/enviar', { psicologoId, mensajeInicial });
    return data;
  },

  // 🩺 El Psicólogo mira sus solicitudes pendientes
  getBandeja: async () => {
    const { data } = await api.get<SolicitudVinculacion[]>('solicitudes/bandeja');
    return data;
  },

  // 🛠️ El Psicólogo acepta o rechaza la vinculación
  procesar: async (solicitudId: string, estado: 'ACEPTADA' | 'RECHAZADA') => {
    const { data } = await api.patch(`solicitudes/${solicitudId}/procesar`, { estado });
    return data;
  },
};