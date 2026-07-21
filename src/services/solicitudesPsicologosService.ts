import api from '../api/axiosConfig';

export interface SolicitudPsicologo {
  id: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  licenciaProfesional: string;
  telefono: string;
  especialidad?: string;
  mensajeAdicional?: string;
  creadoEn: string;
  procesadoEn?: string;
  adminObservaciones?: string;
}

export interface EnviarSolicitudPsicologoData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  licenciaProfesional: string;
  telefono?: string;
  especialidad?: string;
  mensajeAdicional?: string;
}

export const solicitudesPsicologosService = {
  // 🆕 El Psicólogo aspirante envía su solicitud de registro desde /registro-psicologo
  enviarSolicitud: async (datos: EnviarSolicitudPsicologoData) => {
    const { data } = await api.post('solicitudes-psicologos', datos);
    return data;
  },

  // 👀 El Administrador obtiene todas las solicitudes pendientes
  getSolicitudes: async () => {
    const { data } = await api.get<SolicitudPsicologo[]>('solicitudes-psicologos');
    return data;
  },

  // ✅ El Administrador aprueba la solicitud (crea la cuenta automáticamente)
  aprobarSolicitud: async (solicitudId: string, observaciones?: string) => {
    const { data } = await api.patch(`solicitudes-psicologos/${solicitudId}/aprobar`, { adminObservaciones: observaciones });
    return data;
  },

  // ❌ El Administrador rechaza la solicitud
  rechazarSolicitud: async (solicitudId: string, observaciones?: string) => {
    const { data } = await api.patch(`solicitudes-psicologos/${solicitudId}/rechazar`, { adminObservaciones: observaciones });
    return data;
  },
};