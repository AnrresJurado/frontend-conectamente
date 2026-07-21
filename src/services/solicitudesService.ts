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

  // ==========================================
  // 📋 SOLICITUDES DE REGISTRO DE PSICÓLOGOS
  // ==========================================

  // 🆕 El Psicólogo aspirante envía su solicitud de registro
  enviarSolicitudPsicologo: async (datos: EnviarSolicitudPsicologoData) => {
    const { data } = await api.post('solicitudes-psicologos', datos);
    return data;
  },

  // 👀 El Administrador obtiene todas las solicitudes pendientes
  getSolicitudesPsicologos: async () => {
    const { data } = await api.get<SolicitudPsicologo[]>('solicitudes-psicologos');
    return data;
  },

  // ✅ El Administrador aprueba la solicitud (crea el usuario automáticamente)
  aprobarSolicitudPsicologo: async (solicitudId: string, observaciones?: string) => {
    const { data } = await api.patch(`solicitudes-psicologos/${solicitudId}/aprobar`, { adminObservaciones: observaciones });
    return data;
  },

  // ❌ El Administrador rechaza la solicitud
  rechazarSolicitudPsicologo: async (solicitudId: string, observaciones?: string) => {
    const { data } = await api.patch(`solicitudes-psicologos/${solicitudId}/rechazar`, { adminObservaciones: observaciones });
    return data;
  },
};