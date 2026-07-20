import api from '../api/axiosConfig';

export interface EspecialidadMaestra {
  id: string;
  nombre: string;
}

export const especialidadesService = {
  getAll: async () => {
    // 🎯 CORREGIDO: Quitamos el slash inicial para respetar el prefijo base de Axios
    const { data } = await api.get<EspecialidadMaestra[]>('especialidades');
    return data;
  }
};