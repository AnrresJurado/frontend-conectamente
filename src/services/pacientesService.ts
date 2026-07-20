import api from '../api/axiosConfig';
import { Paciente, PacienteFormData } from '../types';

export const pacientesService = {
  // 🚀 GET /pacientes - Trae únicamente los pacientes del psicólogo logueado (O todos si es ADMIN)
  getAll: async () => {
    const { data } = await api.get<Paciente[]>('/pacientes');
    return data;
  },

  // 🎯 NUEVO MÉTODO: Trae el universo completo de pacientes activos para los selectores de las citas
  getTodosParaCitas: async () => {
    const { data } = await api.get<Paciente[]>('/pacientes/buscar/todos');
    return data;
  },

  // GET /pacientes/:id - Detalle de un expediente
  getById: async (id: string) => {
    const { data } = await api.get<Paciente>(`/pacientes/${id}`);
    return data;
  },

  // POST /pacientes - Registra cuenta de usuario + expediente clínico de golpe
  create: async (pacienteData: PacienteFormData) => {
    const { data } = await api.post<Paciente>('/pacientes', pacienteData);
    return data;
  },

  // PATCH /pacientes/:id - Modifica datos clínicos y personales del paciente
  update: async (id: string, pacienteData: Partial<PacienteFormData>) => {
    const { data } = await api.patch<Paciente>(`/pacientes/${id}`, pacienteData);
    return data;
  },

  // DELETE /pacientes/:id - Remueve el expediente y desactiva al usuario
  remove: async (id: string) => {
    const { data } = await api.delete<{ deleted: boolean }>(`/pacientes/${id}`);
    return data;
  }
};