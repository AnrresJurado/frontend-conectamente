import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from '../../api/axiosConfig';
import { encuestasService } from '../encuestasService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('encuestasService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() debe retornar el listado de encuestas', async () => {
    const mockEncuestas = [{ _id: 'enc-1', titulo: 'Satisfacción' }];
    (axios.get as any).mockResolvedValueOnce({ data: mockEncuestas });

    const result = await encuestasService.getAll();
    expect(axios.get).toHaveBeenCalledWith('/encuestas');
    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe('Satisfacción');
  });

  it('getById() debe obtener una encuesta por su ID', async () => {
    const mockEncuesta = { _id: 'enc-1', titulo: 'Test Ansiolítico' };
    (axios.get as any).mockResolvedValueOnce({ data: mockEncuesta });

    const result = await encuestasService.getById('enc-1');
    expect(axios.get).toHaveBeenCalledWith('/encuestas/enc-1');
    expect(result._id).toBe('enc-1');
  });

  it('create() debe registrar una nueva plantilla de encuesta', async () => {
    const input = { titulo: 'Nueva', descripcion: 'Desc', preguntas: [] };
    (axios.post as any).mockResolvedValueOnce({ data: { _id: 'enc-2', ...input } });

    const result = await encuestasService.create(input);
    expect(axios.post).toHaveBeenCalledWith('/encuestas', input);
    expect(result._id).toBe('enc-2');
  });

  it('update() debe enviar petición PUT con cambios', async () => {
    (axios.put as any).mockResolvedValueOnce({ data: { _id: 'enc-1', titulo: 'Modificado' } });

    const result = await encuestasService.update('enc-1', { titulo: 'Modificado' });
    expect(axios.put).toHaveBeenCalledWith('/encuestas/enc-1', { titulo: 'Modificado' });
    expect(result.titulo).toBe('Modificado');
  });

  it('delete() debe invocar endpoint DELETE de la encuesta', async () => {
    (axios.delete as any).mockResolvedValueOnce({ data: { eliminado: true, id: 'enc-1' } });

    const result = await encuestasService.delete('enc-1');
    expect(axios.delete).toHaveBeenCalledWith('/encuestas/enc-1');
    expect(result.eliminado).toBe(true);
  });

  it('guardarRespuesta() debe enviar respuestas del paciente', async () => {
    (axios.post as any).mockResolvedValueOnce({ data: { _id: 'resp-1' } });

    const result = await encuestasService.guardarRespuesta('enc-1', 'usr-1', { p1: 'Opción A' });
    expect(axios.post).toHaveBeenCalledWith('/encuestas/enc-1/responder', {
      usuarioId: 'usr-1',
      respuestas: { p1: 'Opción A' }
    });
    expect(result._id).toBe('resp-1');
  });

  it('asignarEncuesta() debe asociar la encuesta al paciente', async () => {
    (axios.post as any).mockResolvedValueOnce({ data: { _id: 'asig-1', estado: 'PENDIENTE' } });

    const result = await encuestasService.asignarEncuesta('enc-1', 'pac-1');
    expect(axios.post).toHaveBeenCalledWith('/encuestas/enc-1/asignar', { pacienteId: 'pac-1' });
    expect(result.estado).toBe('PENDIENTE');
  });
});