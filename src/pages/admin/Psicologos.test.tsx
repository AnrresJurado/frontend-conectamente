import { render, screen, waitFor } from '@testing-library/react';
import Psicologos from './Psicologos';
import { psicologosService } from '../../services/psicologosService';
import { vi, describe, it, expect, beforeAll } from 'vitest';

// 🛠️ Volvemos a falsear matchMedia para la tabla de Ant Design
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false, addListener: vi.fn(), removeListener: vi.fn(),
    })),
  });
});

// 1. Falsificamos el servicio del backend y el hook de autenticación
vi.mock('../../services/psicologosService', () => ({
  psicologosService: {
    getAll: vi.fn()
  }
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { rol: 'ADMIN' } })
}));

describe('Pantalla Principal de Psicologos', () => {
  it('debe renderizar la tabla y cargar los datos obtenidos del servicio', async () => {
    // 2. Creamos datos simulados de un psicólogo (Mock Data)
    const mockData = [
      {
        id: 'uuid-123',
        especialidad: 'Psicología Clínica',
        licenciaProfesional: 'PSC-44231',
        telefono: '0999999999',
        usuario: { 
          nombre: 'Francisco', 
          apellido: 'Higuera', 
          email: 'francisco@conectamente2.com',
          rol: 'PSICOLOGO'
        }
      }
    ];

    // 3. Forzamos al servicio a devolver nuestros datos simulados
    (psicologosService.getAll as any).mockResolvedValue(mockData);

    // 4. Renderizamos la pantalla
    render(<Psicologos />);

    // 5. Verificamos que el título de la página esté presente
    expect(screen.getByText('Gestión de Psicólogos Clínicos')).toBeInTheDocument();

    // 6. Esperamos a que la promesa se resuelva y verifique que el nombre y el correo se pintaron en la tabla
    await waitFor(() => {
      expect(screen.getByText('Francisco Higuera')).toBeInTheDocument();
      expect(screen.getByText('francisco@conectamente2.com')).toBeInTheDocument();
      expect(screen.getByText('PSC-44231')).toBeInTheDocument();
    });
  });
});