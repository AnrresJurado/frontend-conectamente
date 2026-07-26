import type { ComponentProps } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import FormPsicologo from './FormPsicologo';
import { especialidadesService } from '../services/especialidadesService';


vi.mock('../types', () => {
  const psicologoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    apellido: z.string().min(1, 'El apellido es obligatorio'),
    email: z.string().min(1, 'El correo es obligatorio').email('El correo no es válido'),
    password: z.string().optional(),
    especialidadesIds: z.array(z.any()).optional(),
    licenciaProfesional: z.string().optional(),
    telefono: z.string().optional(),
  });
  return { psicologoSchema };
});


vi.mock('../services/especialidadesService', () => ({
  especialidadesService: {
    getAll: vi.fn(),
  },
}));


vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    message: { ...actual.message, error: vi.fn(), success: vi.fn() },
  };
});

const especialidadesMock = [
  { id: '1', nombre: 'Ansiedad' },
  { id: '2', nombre: 'Terapia de pareja' },
];

const renderForm = (props?: Partial<ComponentProps<typeof FormPsicologo>>) => {
  const onSubmit = vi.fn();
  const utils = render(<FormPsicologo onSubmit={onSubmit} loading={false} {...props} />);
  return { onSubmit, ...utils };
};

describe('FormPsicologo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (especialidadesService.getAll as any).mockResolvedValue(especialidadesMock);
  });

  it('renderiza los campos principales del formulario', async () => {
    renderForm();

    expect(screen.getByPlaceholderText('Nombre del psicólogo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellido del psicólogo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('profesional@conectamente.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MSP-004-987')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0995876635')).toBeInTheDocument();

    await waitFor(() => expect(especialidadesService.getAll).toHaveBeenCalledTimes(1));
  });

  it('muestra el campo de contraseña temporal cuando es un alta nueva', () => {
    renderForm();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('oculta contraseña y deshabilita el email cuando es edición (caso borde)', () => {
    renderForm({ initialValues: { email: 'ya@existe.com', nombre: 'Juan' } });

    expect(screen.queryByPlaceholderText('••••••••')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('profesional@conectamente.com')).toBeDisabled();
  });

  it('muestra un error si falla la carga de especialidades desde la API (caso de error)', async () => {
    (especialidadesService.getAll as any).mockRejectedValue(new Error('network error'));
    const antd = await import('antd');

    renderForm();

    await waitFor(() => expect(antd.message.error as any).toHaveBeenCalled());
  });

  it('NO llama a onSubmit si nombre, apellido o email están vacíos', async () => {
    const { onSubmit, container } = renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /guardar registro profesional/i }));

    await waitFor(() => {
      expect(container.querySelectorAll('.ant-form-item-explain-error').length).toBeGreaterThan(0);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('llama a onSubmit con los datos correctos cuando el formulario es válido (caso exitoso)', async () => {
    const { onSubmit } = renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Nombre del psicólogo'), 'Laura');
    await user.type(screen.getByPlaceholderText('Apellido del psicólogo'), 'Gómez');
    await user.type(screen.getByPlaceholderText('profesional@conectamente.com'), 'laura@conectamente.com');
    await user.click(screen.getByRole('button', { name: /guardar registro profesional/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      nombre: 'Laura',
      apellido: 'Gómez',
      email: 'laura@conectamente.com',
    });
  });
});