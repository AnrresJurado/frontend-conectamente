import axios from '../api/axiosConfig';

export interface Encuesta {
  _id: string;
  titulo: string;
  descripcion: string;
  psicologoId: string;
  preguntas: Array<{
    pregunta: string;
    tipo: string;
    opciones?: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Respuesta {
  _id: string;
  encuestaId: string;
  usuarioId: string;
  respuestas: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AsignacionEncuesta {
  _id: string;
  encuestaId: string;
  psicologoId: string;
  pacienteId: string;
  estado: 'PENDIENTE' | 'RESPONDIDA';
  fechaRespuesta?: string;
  encuesta?: Encuesta;
  paciente?: {
    usuario: {
      nombre: string;
      apellido: string;
      email: string;
    };
  };
  psicologo?: {
    usuario: {
      nombre: string;
      apellido: string;
    };
  };
}

export interface CreateEncuestaDto {
  titulo: string;
  descripcion: string;
  preguntas: Array<{
    pregunta: string;
    tipo: string;
    opciones?: string[];
  }>;
}

export interface CreateRespuestaDto {
  usuarioId: string;
  respuestas: Record<string, any>;
}

export interface AsignarEncuestaDto {
  pacienteId: string;
}

export const encuestasService = {
  // Obtener todas las encuestas (plantillas)
  async getAll(): Promise<Encuesta[]> {
    const response = await axios.get('/encuestas');
    return response.data;
  },

  // Obtener una encuesta por ID
  async getById(id: string): Promise<Encuesta> {
    const response = await axios.get(`/encuestas/${id}`);
    return response.data;
  },

  // Crear una nueva encuesta (plantilla)
  async create(data: CreateEncuestaDto): Promise<Encuesta> {
    const response = await axios.post('/encuestas', data);
    return response.data;
  },

  // Actualizar una encuesta
  async update(id: string, data: Partial<CreateEncuestaDto>): Promise<Encuesta> {
    const response = await axios.put(`/encuestas/${id}`, data);
    return response.data;
  },

  // Eliminar una encuesta
  async delete(id: string): Promise<{ eliminado: boolean; id: string }> {
    const response = await axios.delete(`/encuestas/${id}`);
    return response.data;
  },

  // Obtener respuestas de una encuesta (solo para el psicólogo que la creó)
  async getRespuestas(encuestaId: string): Promise<Respuesta[]> {
    const response = await axios.get(`/encuestas/${encuestaId}/respuestas`);
    return response.data;
  },

  // Guardar respuesta de un paciente
  async guardarRespuesta(encuestaId: string, usuarioId: string, respuestas: Record<string, any>): Promise<Respuesta> {
    const response = await axios.post(`/encuestas/${encuestaId}/responder`, {
      usuarioId,
      respuestas,
    });
    return response.data;
  },

  // Obtener mis respuestas (para pacientes)
  async getMisRespuestas(): Promise<Respuesta[]> {
    const response = await axios.get('/encuestas/mis-respuestas');
    return response.data;
  },

  // Asignar encuesta a un paciente (solo psicólogo)
  async asignarEncuesta(encuestaId: string, pacienteId: string): Promise<AsignacionEncuesta> {
    const response = await axios.post(`/encuestas/${encuestaId}/asignar`, {
      pacienteId,
    });
    return response.data;
  },

  // Obtener encuestas asignadas al psicólogo
  async getMisAsignadas(): Promise<AsignacionEncuesta[]> {
    const response = await axios.get('/encuestas/mis-asignadas');
    return response.data;
  },

  // Obtener mis encuestas asignadas (para pacientes)
  async getMisEncuestas(): Promise<AsignacionEncuesta[]> {
    const response = await axios.get('/encuestas/mis-encuestas');
    return response.data;
  },

  // Obtener métricas generales
  async getMetricasGenerales(): Promise<any> {
    const response = await axios.get('/encuestas/metricas/generales');
    return response.data;
  },
};