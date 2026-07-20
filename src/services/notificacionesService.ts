import api from '../api/axiosConfig';

export type TipoNotificacion = 'INFO' | 'ALERTA' | 'CITA';

export interface Notificacion {
  _id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo?: TipoNotificacion;
  leido: boolean;
  createdAt?: string;
}

export interface CreateNotificacionDto {
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo?: TipoNotificacion;
}

export const notificacionesService = {
  // POST /notificaciones - Crea y envía una nueva notificación
  create: async (dto: CreateNotificacionDto) => {
    const { data } = await api.post<Notificacion>('/notificaciones', dto);
    return data;
  },

  // GET /notificaciones/usuario/:usuarioId - Obtiene todas las notificaciones de un usuario[cite: 7]
  findByUsuario: async (usuarioId: string) => {
    const { data } = await api.get<Notificacion[]>(`/notificaciones/usuario/${usuarioId}`);
    return data;
  },

  // GET /notificaciones/:id - Obtiene una notificación por ID[cite: 7]
  findOne: async (id: string) => {
    const { data } = await api.get<Notificacion>(`/notificaciones/${id}`);
    return data;
  },

  // GET /notificaciones - Obtiene todas las notificaciones (Admin)[cite: 7]
  findAll: async () => {
    const { data } = await api.get<Notificacion[]>('/notificaciones');
    return data;
  },

  // PATCH /notificaciones/:id/leer - Marca notificación como leída
  marcarComoLeida: async (id: string) => {
    const { data } = await api.patch<Notificacion>(`/notificaciones/${id}/leer`);
    return data;
  },

  // PUT /notificaciones/:id - Actualiza una notificación[cite: 7]
  update: async (id: string, dto: any) => {
    const { data } = await api.patch<Notificacion>(`/notificaciones/${id}`, dto);
    return data;
  },

  // DELETE /notificaciones/:id - Elimina una notificación[cite: 7, 10]
  remove: async (id: string) => {
    const { data } = await api.delete<{ deleted: boolean }>(`/notificaciones/${id}`);
    return data;
  }
};