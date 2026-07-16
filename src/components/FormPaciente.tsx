import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, DatePicker, Select, Button, Row, Col } from 'antd';
import { pacienteSchema, PacienteFormData } from '../types';
import dayjs from 'dayjs';

interface FormPacienteProps {
  onSubmit: (data: PacienteFormData) => void;
  loading: boolean;
  initialValues?: Partial<PacienteFormData>;
}

const { TextArea } = Input;

const FormPaciente: React.FC<FormPacienteProps> = ({ onSubmit, loading, initialValues }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    values: {
      nombre: initialValues?.nombre ?? '',
      apellido: initialValues?.apellido ?? '',
      email: initialValues?.email ?? '',
      fechaNacimiento: initialValues?.fechaNacimiento ?? '',
      genero: initialValues?.genero ?? '',
      ocupacion: initialValues?.ocupacion ?? '',
      telefonoEmergencia: initialValues?.telefonoEmergencia ?? '',
      contactoEmergenciaNombre: initialValues?.contactoEmergenciaNombre ?? '',
      tipoSangre: initialValues?.tipoSangre ?? '',
      antecedentesMedicos: initialValues?.antecedentesMedicos ?? '',
      motivoConsultaInicial: initialValues?.motivoConsultaInicial ?? '',
    }
  });

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Row gutter={16}>
        {/* --- DATOS DE USUARIO --- */}
        <Col span={12}>
          <Form.Item label="Nombre" validateStatus={errors.nombre ? 'error' : ''} help={errors.nombre?.message}>
            <Controller name="nombre" control={control} render={({ field }) => <Input {...field} placeholder="Andrés" />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Apellido" validateStatus={errors.apellido ? 'error' : ''} help={errors.apellido?.message}>
            <Controller name="apellido" control={control} render={({ field }) => <Input {...field} placeholder="Jurado" />} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Correo Electrónico" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
            <Controller name="email" control={control} render={({ field }) => <Input {...field} placeholder="correo@ejemplo.com" />} />
          </Form.Item>
        </Col>

        {/* --- DATOS CLÍNICOS --- */}
        <Col span={12}>
          <Form.Item label="Fecha de Nacimiento" validateStatus={errors.fechaNacimiento ? 'error' : ''} help={errors.fechaNacimiento?.message}>
            <Controller
              name="fechaNacimiento"
              control={control}
              render={({ field }) => (
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Seleccionar fecha"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(_, dateString) => field.onChange(dateString)}
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Género">
            <Controller
              name="genero"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Seleccionar género">
                  <Select.Option value="Masculino">Masculino</Select.Option>
                  <Select.Option value="Femenino">Femenino</Select.Option>
                  <Select.Option value="Otro">Otro</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Ocupación" validateStatus={errors.ocupacion ? 'error' : ''} help={errors.ocupacion?.message}>
            <Controller name="ocupacion" control={control} render={({ field }) => <Input {...field} placeholder="Estudiante" />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Tipo de Sangre">
            <Controller name="tipoSangre" control={control} render={({ field }) => <Input {...field} placeholder="O+" />} />
          </Form.Item>
        </Col>

        {/* --- CONTACTO DE EMERGENCIA --- */}
        <Col span={12}>
          <Form.Item label="Contacto de Emergencia (Nombre)" validateStatus={errors.contactoEmergenciaNombre ? 'error' : ''} help={errors.contactoEmergenciaNombre?.message}>
            <Controller name="contactoEmergenciaNombre" control={control} render={({ field }) => <Input {...field} />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Teléfono de Emergencia" validateStatus={errors.telefonoEmergencia ? 'error' : ''} help={errors.telefonoEmergencia?.message}>
            <Controller name="telefonoEmergencia" control={control} render={({ field }) => <Input {...field} />} />
          </Form.Item>
        </Col>

        {/* --- CAMPOS ABIERTOS --- */}
        <Col span={24}>
          <Form.Item label="Motivo de Consulta Inicial">
            <Controller name="motivoConsultaInicial" control={control} render={({ field }) => <TextArea {...field} rows={2} />} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Antecedentes Médicos">
            <Controller name="antecedentesMedicos" control={control} render={({ field }) => <TextArea {...field} rows={2} />} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ textAlign: 'right', marginTop: 16, marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          Guardar Registro
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FormPaciente;