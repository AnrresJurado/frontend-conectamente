import api from '../api/axiosConfig';

export interface Perfil {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  activo: boolean;
  [key: string]: any;
}

export interface UpdatePerfilPayload {
  nombre?: string;
  apellido?: string;
  password?: string;
}

export const perfilService = {
  // GET /perfil - Trae los datos del usuario autenticado (extraídos del JWT)
  getMe: async () => {
    const { data } = await api.get<Perfil>('/perfil');
    return data;
  },

  // PATCH /perfil - Actualiza nombre / apellido / password del usuario autenticado
  update: async (payload: UpdatePerfilPayload) => {
    const { data } = await api.patch<Perfil>('/perfil', payload);
    return data;
  },
};