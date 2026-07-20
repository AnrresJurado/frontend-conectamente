import api from '../api/axiosConfig';

export interface UsuarioStaff {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'PACIENTE' | 'PSICOLOGO' | 'ADMIN';
  activo: boolean;
  creadoEn?: string;
}

export interface CreateStaffInput {
  nombre: string;
  apellido: string;
  email: string;
  rol: 'PSICOLOGO' | 'ADMIN';
}

export const adminService = {
  // 🚀 1. Listar usuarios con filtros opcionales de paginación y rol
  listarUsuarios: async (pagina = 1, limite = 10, rol?: string) => {
    const params: any = { pagina, limite };
    if (rol) params.rol = rol;

    const { data } = await api.get<any>('/admin/usuarios', { params });
    return data;
  },

  // 🚀 2. Registrar nuevo personal interno (Staff)
  crearStaff: async (datos: CreateStaffInput) => {
    const { data } = await api.post<UsuarioStaff>('/admin/usuarios', datos);
    return data;
  },

  // 🚀 3. Borrado lógico (Desactivar usuario de la plataforma)
  darDeBaja: async (id: string) => {
    const { data } = await api.delete<{ mensaje: string }>(`/admin/usuarios/${id}`);
    return data;
  },

  // 🎯 4. NUEVO: Revertir la baja del usuario en la base de datos
  reactivarUsuario: async (id: string) => {
    const { data } = await api.patch<{ mensaje: string }>(`/admin/usuarios/${id}/reactivar`);
    return data;
  }
};