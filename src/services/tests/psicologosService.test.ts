import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { psicologosService } from '../psicologosService';

// Mockear el cliente Axios
vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('psicologosService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll()', () => {
    it('debe obtener y mapear correctamente la lista de psicólogos (Caso Éxito)', async () => {
      const mockBackendData = [
        {
          id: '123',
          especialidad: 'Terapia Cognitivo Conductual',
          numColegiatura: 'COL-99',
          telefono: '0999999999',
          usuario: {
            id: 'usr-1',
            nombre: 'Carlos',
            apellido: 'Pérez',
            email: 'carlos@test.com',
            activo: true,
            rol: 'PSICOLOGO',
          },
        },
      ];

      (api.get as any).mockResolvedValueOnce({ data: mockBackendData });

      const result = await psicologosService.getAll();

      expect(api.get).toHaveBeenCalledWith('psicologos');
      expect(result).toHaveLength(1);
      expect(result[0].especialidad).toBe('Terapia Cognitivo Conductual');
      expect(result[0].licenciaProfesional).toBe('COL-99');
    });

    it('debe usar valores por defecto en el mapeo cuando vienen datos nulos o ausentes (Caso Borde)', async () => {
      const mockIncompleteData = [
        {
          id: '124',
          especialidad: null,
          numColegiatura: '',
          telefono: null,
          usuario: null,
        },
      ];

      (api.get as any).mockResolvedValueOnce({ data: mockIncompleteData });

      const result = await psicologosService.getAll();

      expect(result[0].especialidad).toBe('Psicología Clínica');
      expect(result[0].licenciaProfesional).toBe('Sin asignar');
      expect(result[0].telefono).toBe('Sin teléfono');
      expect(result[0].usuario.rol).toBe('PSICOLOGO');
    });

    it('debe rechazar la promesa si la API responde con un error 500 (Caso Error)', async () => {
      const mockError = new Error('Internal Server Error');
      (api.get as any).mockRejectedValueOnce(mockError);

      await expect(psicologosService.getAll()).rejects.toThrow('Internal Server Error');
    });
  });

  describe('create()', () => {
    it('debe estructurar el payload correctamente y enviar el registro (Caso Éxito)', async () => {
      const inputData = {
        nombre: 'Ana',
        apellido: 'Gómez',
        email: 'ana@test.com',
        especialidad: 'Infantil',
        licenciaProfesional: 'LIC-123',
        telefono: '0988888888',
      };

      const mockResponse = { id: 'p-1', ...inputData };
      (api.post as any).mockResolvedValueOnce({ data: mockResponse });

      const result = await psicologosService.create(inputData as any);

      expect(api.post).toHaveBeenCalledWith('psicologos', {
        nombre: 'Ana',
        apellido: 'Gómez',
        email: 'ana@test.com',
        password: 'Psicologo123*',
        rol: 'PSICOLOGO',
        especialidad: 'Infantil',
        numColegiatura: 'LIC-123',
        telefono: '0988888888',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update() y remove()', () => {
    it('debe enviar la petición PATCH con los campos modificados', async () => {
      (api.patch as any).mockResolvedValueOnce({ data: { success: true } });

      await psicologosService.update('usr-100', { especialidad: 'Neuropsicología' });

      expect(api.patch).toHaveBeenCalledWith('psicologos/usr-100', {
        especialidad: 'Neuropsicología',
        numColegiatura: undefined,
        telefono: undefined,
      });
    });

    it('debe enviar la petición DELETE para borrado lógico', async () => {
      (api.delete as any).mockResolvedValueOnce({ data: { message: 'Desactivado' } });

      const result = await psicologosService.remove('usr-100');

      expect(api.delete).toHaveBeenCalledWith('psicologos/usr-100');
      expect(result.message).toBe('Desactivado');
    });
  });
});