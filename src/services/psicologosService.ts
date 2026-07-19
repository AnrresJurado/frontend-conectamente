import api from '../api/axiosConfig';
import { Psicologo, CreatePsicologoInput } from '../types';

export interface PsicologoPerfil {
  id: string;
  especialidad: string;
  numColegiatura: string; // 🎯 CORREGIDO: Refleja el nombre real de tu columna en TypeORM
  telefono?: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    activo: boolean;
    rol: string;
  };
}

export const psicologosService = {
  // 🚀 GET /psicologos - Trae todos los psicólogos mapeados desde NestJS
  getAll: async () => {
    const { data } = await api.get<PsicologoPerfil[]>('/psicologos');
    
    return data.map((p) => ({
      id: p.id,
      especialidad: p.especialidad || 'Psicología Clínica',
      licenciaProfesional: p.numColegiatura || 'Sin asignar', // 🎯 Mapeamos numColegiatura a lo que espera la tabla
      telefono: p.telefono || 'Sin teléfono',
      usuario: {
        id: p.usuario?.id,
        nombre: p.usuario?.nombre || '',
        apellido: p.usuario?.apellido || '',
        email: p.usuario?.email || '',
        rol: p.usuario?.rol || 'PSICOLOGO'
      }
    })) as unknown as Psicologo[];
  },

  // 🚀 GET /psicologos/:id - Obtener un perfil específico
  getById: async (id: string) => {
    const { data } = await api.get<Psicologo>(`/psicologos/${id}`);
    return data;
  },

  // 🚀 POST /psicologos - Envía el payload con la estructura correcta hacia NestJS
  create: async (psicologoData: CreatePsicologoInput) => {
    const payload = {
      nombre: psicologoData.nombre,
      apellido: psicologoData.apellido,
      email: psicologoData.email,
      password: psicologoData.password || 'Psicologo123*',
      rol: 'PSICOLOGO',
      especialidad: psicologoData.especialidad,
      numColegiatura: psicologoData.licenciaProfesional, // 🎯 Sincronizado con el backend
      telefono: psicologoData.telefono
    };

    const { data } = await api.post<any>('/psicologos', payload);
    return data;
  },

  // 🚀 PATCH /psicologos/:usuarioId - Modifica los datos usando el campo numColegiatura
  update: async (usuarioId: string, psicologoData: { especialidad?: string; registroProfesional?: string; telefono?: string }) => {
    const payload = {
      especialidad: psicologoData.especialidad,
      numColegiatura: psicologoData.registroProfesional, // 🎯 Sincronizado con el backend
      telefono: psicologoData.telefono
    };

    const { data } = await api.patch<any>(`/psicologos/${usuarioId}`, payload);
    return data;
  },

  // 🚀 DELETE /psicologos/:usuarioId - Desactiva el perfil profesional (Borrado Lógico)
  remove: async (usuarioId: string) => {
    const { data } = await api.delete<{ message: string }>(`/psicologos/${usuarioId}`);
    return data;
  }
};