import api from '../api/axiosConfig';
import { Psicologo, CreatePsicologoInput } from '../types';

export const psicologosService = {
  // GET /usuarios - Trae todos los psicólogos registrados procesando la envoltura de paginación
  getAll: async () => {
    const response = await api.get<any>('/usuarios');
    let listaUsuarios: any[] = [];
    
    if (response && response.data) {
      // Si el endpoint de usuarios devuelve el listado paginado en { data: [...] } o directo
      listaUsuarios = Array.isArray(response.data) ? response.data : (response.data.data || []);
    }

    // Filtramos únicamente a los usuarios con rol de Psicólogo
    const psicologos = listaUsuarios.filter((u: any) => 
      u && typeof u.rol === 'string' && u.rol.trim().toUpperCase() === 'PSICOLOGO'
    );

    return psicologos.map((u: any) => {
      const perfil = u.perfilPsicologo || {};
      return {
        id: u.id, // ID único del usuario para evitar colisiones en AntD
        especialidad: perfil.especialidad || 'Terapia General',
        licenciaProfesional: perfil.numColegiatura || 'Sin asignar perfil',
        telefono: perfil.biografia || 'Sin teléfono',
        usuario: {
          id: u.id,
          nombre: (u.nombre || '').trim(),
          apellido: (u.apellido || '').trim(),
          email: u.email || '',
          rol: u.rol || 'PSICOLOGO'
        }
      };
    }) as Psicologo[];
  },

  getById: async (id: string) => {
    const { data } = await api.get<Psicologo>(`/usuarios/${id}`);
    return data;
  },

  // POST /usuarios - UN SOLO DISPARO DIRECTO. El backend se encarga de toda la transacción
  create: async (psicologoData: CreatePsicologoInput) => {
    const payload = {
      nombre: psicologoData.nombre,
      apellido: psicologoData.apellido,
      email: psicologoData.email,
      password: psicologoData.password || 'Psicologo123*',
      rol: 'PSICOLOGO',
      especialidad: psicologoData.especialidad,
      licenciaProfesional: psicologoData.licenciaProfesional,
      telefono: psicologoData.telefono
    };

    const { data } = await api.post<any>('/usuarios', payload);
    return data;
  },

  update: async (id: string, psicologoData: Partial<CreatePsicologoInput>) => {
    const payload = {
      nombre: psicologoData.nombre,
      apellido: psicologoData.apellido,
    };
    const { data } = await api.patch<any>(`/usuarios/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/usuarios/${id}`);
    return data;
  }
};