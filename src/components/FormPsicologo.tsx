import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Button, Row, Col, Select, message } from 'antd';
import { psicologoSchema } from '../types';
import { especialidadesService, EspecialidadMaestra } from '../services/especialidadesService';

interface FormPsicologoProps {
  onSubmit: (data: any) => void;
  loading: boolean;
  initialValues?: any;
}

const FormPsicologo: React.FC<FormPsicologoProps> = ({ onSubmit, loading, initialValues }) => {
  const [especialidades, setEspecialidades] = useState<EspecialidadMaestra[]>([]);

  useEffect(() => {
    const cargarEspecialidadesMaestras = async () => {
      try {
        const data = await especialidadesService.getAll();
        setEspecialidades(data);
      } catch (error) {
        console.error(error);
        message.error('No se pudieron cargar las especialidades del servidor.');
      }
    };
    cargarEspecialidadesMaestras();
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(psicologoSchema),
    values: {
      nombre: initialValues?.nombre ?? '',
      apellido: initialValues?.apellido ?? '',
      email: initialValues?.email ?? '',
      password: '', 
      especialidadesIds: initialValues?.especialidadesIds ?? [], 
      licenciaProfesional: initialValues?.licenciaProfesional ?? '',
      telefono: initialValues?.telefono ?? '',
    }
  });

  const esEdicion = !!initialValues?.email;

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Row gutter={16}>
        {/* --- DATOS PERSONALES DEL USUARIO --- */}
        <Col span={12}>
          <Form.Item label="Nombre" validateStatus={errors.nombre ? 'error' : ''} help={errors.nombre?.message as string}>
            <Controller name="nombre" control={control} render={({ field }) => <Input {...field} placeholder="Nombre del psicólogo" />} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Apellido" validateStatus={errors.apellido ? 'error' : ''} help={errors.apellido?.message as string}>
            <Controller name="apellido" control={control} render={({ field }) => <Input {...field} placeholder="Apellido del psicólogo" />} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Correo Electrónico" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message as string}>
            <Controller name="email" control={control} render={({ field }) => <Input {...field} placeholder="profesional@conectamente.com" disabled={esEdicion} />} />
          </Form.Item>
        </Col>

        {/* --- CONTRASEÑA --- */}
        {!esEdicion && (
          <Col span={24}>
            <Form.Item label="Contraseña Temporal" validateStatus={errors.password ? 'error' : ''} help={errors.password?.message as string}>
              <Controller name="password" control={control} render={({ field }) => <Input.Password {...field} placeholder="••••••••" />} />
            </Form.Item>
          </Col>
        )}

        {/* --- DATOS PROFESIONALES --- */}
        <Col span={12}>
          <Form.Item label="Especialidades Clínicas" validateStatus={errors.especialidadesIds ? 'error' : ''} help={errors.especialidadesIds?.message as string}>
            <Controller 
              name="especialidadesIds" 
              control={control} 
              render={({ field }) => (
                <Select 
                  {...field} 
                  mode="multiple" 
                  placeholder="Selecciona las especialidades"
                  showSearch
                  optionFilterProp="label"
                  options={especialidades.map(e => ({ value: e.id, label: e.nombre }))} 
                />
              )} 
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Licencia / Registro Profesional" validateStatus={errors.licenciaProfesional ? 'error' : ''} help={errors.licenciaProfesional?.message as string}>
            <Controller name="licenciaProfesional" control={control} render={({ field }) => <Input {...field} placeholder="MSP-004-987" />} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Teléfono de Contacto" validateStatus={errors.telefono ? 'error' : ''} help={errors.telefono?.message as string}>
            <Controller name="telefono" control={control} render={({ field }) => <Input {...field} placeholder="0995876635" />} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ textAlign: 'right', marginTop: 16, marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          Guardar Registro Profesional
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FormPsicologo;