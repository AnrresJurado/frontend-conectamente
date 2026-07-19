import api from '../api/axiosConfig';

export interface PreguntaEncuesta {
  pregunta: string;
  tipo: 'TEXTO' | 'ESCALA' | 'MULTIPLE';
  opciones?: string[];
}

export interface Encuesta {
  _id: string;
  titulo: string;
  descripcion: string;
  preguntas: PreguntaEncuesta[];
}

export interface RespuestaEncuesta {
  _id: string;
  encuestaId: string;
  usuarioId: string;
  respuestas: Record<string, unknown>;
  createdAt: string;
}

export const encuestasService = {
  // GET /encuestas
  getAll: async () => {
    const { data } = await api.get<Encuesta[]>('/encuestas');
    return data;
  },

  // GET /encuestas/:id/respuestas
  getRespuestas: async (encuestaId: string) => {
    const { data } = await api.get<RespuestaEncuesta[]>(`/encuestas/${encuestaId}/respuestas`);
    return data;
  },

  // POST /encuestas/:id/responder
  responder: async (encuestaId: string, usuarioId: string, respuestas: Record<string, unknown>) => {
    const { data } = await api.post<RespuestaEncuesta>(`/encuestas/${encuestaId}/responder`, {
      usuarioId,
      respuestas,
    });
    return data;
  },
};