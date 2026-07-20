import axios from '../api/axiosConfig';

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
    const response = await axios.get('/recomendaciones');
    return response.data;
  },

  // Obtener una recomendación por ID
  async getById(id: string): Promise<Recomendacion> {
    const response = await axios.get(`/recomendaciones/${id}`);
    return response.data;
  },

  // Obtener recomendaciones de un paciente específico
  async getByPaciente(pacienteId: string): Promise<Recomendacion[]> {
    const response = await axios.get(`/recomendaciones/paciente/${pacienteId}`);
    return response.data;
  },

  // Crear una nueva recomendación (solo psicólogos)
  async create(data: CreateRecomendacionDto): Promise<Recomendacion> {
    const response = await axios.post('/recomendaciones', data);
    return response.data;
  },

  // Actualizar una recomendación
  async update(id: string, data: UpdateRecomendacionDto): Promise<Recomendacion> {
    const response = await axios.patch(`/recomendaciones/${id}`, data);
    return response.data;
  },

  // Eliminar una recomendación
  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const response = await axios.delete(`/recomendaciones/${id}`);
    return response.data;
  },
};