import api from '../api/axiosConfig';
import { Paciente, PacienteFormData } from '../types';

export const pacientesService = {
  // GET /pacientes - Trae todos los expedientes clínicos de pacientes
  getAll: async () => {
    const { data } = await api.get<Paciente[]>('/pacientes');
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