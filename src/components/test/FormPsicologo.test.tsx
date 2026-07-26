import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormPsicologo from '../FormPsicologo';
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';

// 1. Mockear especialidadesService para evitar ERR_NETWORK con localhost:3000
vi.mock('../../services/especialidadesService', () => ({
  especialidadesService: {
    getAll: vi.fn().mockResolvedValue([
      { id: '1', especialidad: 'Psicología Clínica' },
      { id: '2', especialidad: 'Infantil' },
    ]),
  },
}));

// 🛠️ Truco clave: Ant Design necesita que 'matchMedia' exista en el entorno de pruebas
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('Pantalla FormPsicologo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe bloquear el envío y mostrar los errores de Zod si los campos están vacíos', async () => {
    // 1. Preparamos una función falsa (mock) para espiar si se llama al onSubmit
    const mockOnSubmit = vi.fn();
    
    // 2. Renderizamos el formulario pasándole la función falsa y el loading en false
    render(<FormPsicologo onSubmit={mockOnSubmit} loading={false} />);

    // 3. Buscamos el botón de guardar y le hacemos click sin llenar nada
    const botonGuardar = screen.getByRole('button', { name: /Guardar Registro Profesional/i });
    fireEvent.click(botonGuardar);

    // 4. Verificamos los mensajes de error reales que dispara Zod en la pantalla
    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres.')).toBeInTheDocument();
      expect(screen.getByText('El apellido debe tener al menos 2 caracteres.')).toBeInTheDocument();
    });

    // 5. Confirmamos que la función onSubmit NUNCA se ejecutó
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});