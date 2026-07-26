import type { ComponentProps } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import FormPaciente from './FormPaciente';

vi.mock('../types', () => {
  const pacienteSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    apellido: z.string().min(1, 'El apellido es obligatorio'),
    email: z
      .string()
      .min(1, 'El correo es obligatorio')
      .email('El correo no es válido'),
    fechaNacimiento: z.string().optional(),
    genero: z.string().optional(),
    ocupacion: z.string().optional(),
    telefonoEmergencia: z.string().optional(),
    contactoEmergenciaNombre: z.string().optional(),
    tipoSangre: z.string().optional(),
    antecedentesMedicos: z.string().optional(),
    motivoConsultaInicial: z.string().optional(),
  });
  return { pacienteSchema };
});

const renderForm = (props?: Partial<ComponentProps<typeof FormPaciente>>) => {
  const onSubmit = vi.fn();
  const utils = render(<FormPaciente onSubmit={onSubmit} loading={false} {...props} />);
  return { onSubmit, ...utils };
};

describe('FormPaciente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza los campos principales del formulario', () => {
    renderForm();

    expect(screen.getByPlaceholderText('Andrés')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Jurado')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar registro/i })).toBeInTheDocument();
  });

  it('NO llama a onSubmit y marca errores si se envía con campos obligatorios vacíos', async () => {
    const { onSubmit, container } = renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /guardar registro/i }));

    await waitFor(() => {
      expect(container.querySelectorAll('.ant-form-item-explain-error').length).toBeGreaterThan(0);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra un error de formato cuando el email es inválido (caso borde)', async () => {
    const { onSubmit } = renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Andrés'), 'Ana');
    await user.type(screen.getByPlaceholderText('Jurado'), 'Pérez');
    await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'no-es-un-email');
    await user.click(screen.getByRole('button', { name: /guardar registro/i }));

    expect(await screen.findByText('El correo no es válido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('llama a onSubmit con los datos correctos cuando el formulario es válido (caso exitoso)', async () => {
    const { onSubmit } = renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Andrés'), 'Ana');
    await user.type(screen.getByPlaceholderText('Jurado'), 'Pérez');
    await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'ana@ejemplo.com');
    await user.click(screen.getByRole('button', { name: /guardar registro/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      nombre: 'Ana',
      apellido: 'Pérez',
      email: 'ana@ejemplo.com',
    });
  });

  it('precarga los valores iniciales cuando se edita un paciente existente (caso borde)', () => {
    renderForm({
      initialValues: {
        nombre: 'Carlos',
        apellido: 'Ruiz',
        email: 'carlos@ejemplo.com',
      },
    });

    expect(screen.getByPlaceholderText('Andrés')).toHaveValue('Carlos');
    expect(screen.getByPlaceholderText('Jurado')).toHaveValue('Ruiz');
    expect(screen.getByPlaceholderText('correo@ejemplo.com')).toHaveValue('carlos@ejemplo.com');
  });

  it('muestra el botón en estado loading cuando la prop loading es true', () => {
    renderForm({ loading: true });
    const boton = screen.getByRole('button', { name: /guardar registro/i });
    expect(boton).toHaveClass('ant-btn-loading');
  });
});