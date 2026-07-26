import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axiosConfig';
import { adminService } from '../adminService';

vi.mock('../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('adminService - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listarUsuarios() debe enviar parámetros de paginación y filtro opcional (Caso Éxito y Borde)', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { usuarios: [], total: 0 } });

    await adminService.listarUsuarios(1, 10, 'PSICOLOGO');

    expect(api.get).toHaveBeenCalledWith('/admin/usuarios', {
      params: { pagina: 1, limite: 10, rol: 'PSICOLOGO' },
    });
  });

  it('reactivarUsuario() debe invocar la ruta de reactivación', async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { mensaje: 'Usuario reactivado' } });

    const result = await adminService.reactivarUsuario('usr-99');

    expect(api.patch).toHaveBeenCalledWith('/admin/usuarios/usr-99/reactivar');
    expect(result.mensaje).toBe('Usuario reactivado');
  });

  // Agregar al final de src/services/tests/adminService.test.ts:

    it('crearStaff() debe enviar los datos del nuevo usuario', async () => {
    const mockStaff = { id: 'usr-10', nombre: 'Carlos', apellido: 'Pérez', email: 'carlos@test.com', rol: 'ADMIN' };
    (api.post as any).mockResolvedValueOnce({ data: mockStaff });

    const result = await adminService.crearStaff({
        nombre: 'Carlos',
        apellido: 'Pérez',
        email: 'carlos@test.com',
        rol: 'ADMIN'
    });

    expect(api.post).toHaveBeenCalledWith('/admin/usuarios', {
        nombre: 'Carlos',
        apellido: 'Pérez',
        email: 'carlos@test.com',
        rol: 'ADMIN'
    });
    expect(result.id).toBe('usr-10');
    });

    it('darDeBaja() debe invocar la ruta DELETE para desactivar usuario', async () => {
    (api.delete as any).mockResolvedValueOnce({ data: { mensaje: 'Usuario desactivado' } });

    const result = await adminService.darDeBaja('usr-55');

    expect(api.delete).toHaveBeenCalledWith('/admin/usuarios/usr-55');
    expect(result.mensaje).toBe('Usuario desactivado');
    });
});