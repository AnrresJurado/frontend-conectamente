import api from '../api/axiosConfig';

// Tipos basados en tu backend
export interface ChatMessage {
  _id: string;
  remitenteId: string;
  destinatarioId: string;
  mensaje: string;
  enviadoEn?: string;
}

export interface CreateChatDto {
  destinatarioId: string;
  mensaje: string;
}

export interface UpdateChatDto {
  mensaje: string;
}

export const chatsService = {
  // POST /chats - Envía un nuevo mensaje
  enviarMensaje: async (dto: CreateChatDto) => {
    const { data } = await api.post<ChatMessage>('/chats', dto);
    return data;
  },

  // GET /chats/:usuarioId - Obtiene el historial entre el usuario logueado y el indicado
  obtenerHistorial: async (usuarioId: string) => {
    const { data } = await api.get<ChatMessage[]>(`/chats/${usuarioId}`);
    return data;
  },

  // PUT /chats/:id - Actualiza un mensaje existente
  actualizarMensaje: async (id: string, dto: UpdateChatDto) => {
    const { data } = await api.put<ChatMessage>(`/chats/${id}`, dto);
    return data;
  },

  // DELETE /chats/:id - Elimina un mensaje[cite: 1]
  eliminarMensaje: async (id: string) => {
    const { data } = await api.delete<{ deleted: boolean }>(`/chats/${id}`);
    return data;
  }
};