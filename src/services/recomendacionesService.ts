import api from '../api/axiosConfig';

export interface Recomendacion {
  id: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  pacienteId: string;
  psicologoId?: string;
  paciente?: {
    id: string;
    usuario: {
      id: string;
      nombre: string;
      apellido: string;
      email: string;
    };
  };
  psicologo?: {
    id: string;
    usuario: {
      id: string;
      nombre: string;
      apellido: string;
    };
  };
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateRecomendacionDto {
  fecha: string;
  titulo: string;
  descripcion: string;
  pacienteId: string;
}

export interface UpdateRecomendacionDto {
  fecha?: string;
  titulo?: string;
  descripcion?: string;
  pacienteId?: string;
}

export const recomendacionesService = {
  // Obtener todas las recomendaciones (filtradas según el rol del usuario)
  async getAll(): Promise<Recomendacion[]> {
    const { data } = await api.get('/recomendaciones');
    return data;
  },

  // Obtener una recomendación por ID
  async getById(id: string): Promise<Recomendacion> {
    const { data } = await api.get(`/recomendaciones/${id}`);
    return data;
  },

  // Obtener recomendaciones de un paciente específico
  async getByPaciente(pacienteId: string): Promise<Recomendacion[]> {
    const { data } = await api.get(`/recomendaciones/paciente/${pacienteId}`);
    return data;
  },

  // Crear una nueva recomendación (solo psicólogos)
  async create(data: CreateRecomendacionDto): Promise<Recomendacion> {
    const { data: responseData } = await api.post('/recomendaciones', data);
    return responseData;
  },

  // Actualizar una recomendación
  async update(id: string, data: UpdateRecomendacionDto): Promise<Recomendacion> {
    const { data: responseData } = await api.patch(`/recomendaciones/${id}`, data);
    return responseData;
  },

  // Eliminar una recomendación
  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const { data: responseData } = await api.delete(`/recomendaciones/${id}`);
    return responseData;
  },
};