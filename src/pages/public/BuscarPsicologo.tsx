import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Modal, message, List, Tag, Typography, Avatar, Empty } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, SendOutlined, HeartOutlined } from '@ant-design/icons';
import { psicologosService } from '../../services/psicologosService';
import { solicitudesService } from '../../services/solicitudesService';
import { Psicologo } from '../../types';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// misma paleta que MiPerfil / MiEspacio / Dashboard, para mantener identidad visual
const PALETTE = {
  primaryDark: '#12414a',
  primary: '#1d5863',
  accent: '#4da6b0',
  accentSoft: '#bce3e6',
  bg: '#eef7f7',
  card: '#ffffff',
  textMuted: '#64748b',
  border: '#e2e8f0',
};

// paleta rotativa para las etiquetas de especialidad, coherente con el resto de la app
const ESPECIALIDAD_COLORS = ['#1d5863', '#4da6b0', '#8B5CF6', '#0EA5E9', '#10B981'];
const colorParaEspecialidad = (texto?: string) => {
  if (!texto) return PALETTE.primary;
  const suma = texto.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ESPECIALIDAD_COLORS[suma % ESPECIALIDAD_COLORS.length];
};

const BuscarPsicologo: React.FC = () => {
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState<Psicologo | null>(null);
  const [mensaje, setMensaje] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);

  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        const data = await psicologosService.getAll();
        setPsicologos(data);
      } catch (error) {
        message.error('Error al cargar el catálogo de especialistas.');
      } finally {
        setLoading(false);
      }
    };
    cargarProfesionales();
  }, []);

  const abrirModalSolicitud = (psicologo: Psicologo) => {
    setPsicologoSeleccionado(psicologo);
    setModalOpen(true);
  };

  const handleEnviar = async () => {
    if (!psicologoSeleccionado) return;
    setEnviando(true);
    try {
      await solicitudesService.enviar(psicologoSeleccionado.id, mensaje);
      message.success(`Solicitud enviada con éxito al Dr/Dra. ${psicologoSeleccionado.usuario?.apellido}.`);
      setModalOpen(false);
      setMensaje('');
    } catch (error) {
      message.error('No se pudo enviar la solicitud en este momento.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        .buscarpsico-input.ant-input { border-radius: 12px !important; padding: 10px 14px !important; }
        .buscarpsico-card .ant-card-body { padding: 22px 22px 8px; }
        .buscarpsico-card .ant-card-actions { border-radius: 0 0 20px 20px; background: ${PALETTE.bg}; }
        .buscarpsico-card .ant-card-actions > li { margin: 10px 0; }
        .buscarpsico-card { transition: transform .18s ease, box-shadow .18s ease; }
        .buscarpsico-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(29, 88, 99, 0.16) !important; }
      `}</style>

      {/* ═══════════════ ENCABEZADO ═══════════════ */}
      <div style={styles.hero}>
        <svg style={styles.heroDecoration} viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
          <circle cx="900" cy="20" r="150" fill="rgba(255,255,255,0.05)" />
          <circle cx="80" cy="200" r="100" fill="rgba(255,255,255,0.04)" />
        </svg>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Tag style={styles.heroEyebrow}>
            <HeartOutlined style={{ marginRight: 6 }} />
            Acompañamiento profesional
          </Tag>
          <Title level={2} style={{ color: '#fff', margin: '12px 0 6px' }}>
            Encuentra a tu Especialista Clínico
          </Title>
          <Paragraph style={{ color: PALETTE.accentSoft, fontSize: 15, maxWidth: 620, marginBottom: 0 }}>
            Selecciona el profesional de la salud mental con el que deseas iniciar tu acompañamiento
            terapéutico y envíale una solicitud de vinculación.
          </Paragraph>
        </div>
      </div>

      {/* ═══════════════ GRID DE ESPECIALISTAS ═══════════════ */}
      <List
        style={{ marginTop: 28 }}
        grid={{ gutter: 20, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
        loading={loading}
        dataSource={psicologos}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Aún no hay especialistas disponibles en el catálogo."
              style={{ padding: '48px 0' }}
            />
          ),
        }}
        renderItem={(psico) => {
          const especialidadColor = colorParaEspecialidad(psico.especialidad);
          return (
            <List.Item>
              <Card
                className="buscarpsico-card"
                bordered={false}
                style={styles.card}
                actions={[
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => abrirModalSolicitud(psico)}
                    style={styles.ctaButton}
                  >
                    Solicitar atención
                  </Button>,
                ]}
              >
                <div style={styles.cardHeader}>
                  <Avatar
                    size={56}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: especialidadColor, flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <Text strong style={styles.nombrePsico}>
                      {psico.usuario?.nombre} {psico.usuario?.apellido}
                    </Text>
                    <div style={styles.licenciaRow}>
                      <SafetyCertificateOutlined style={{ color: PALETTE.textMuted, fontSize: 13 }} />
                      <Text type="secondary" style={{ fontSize: 12.5 }}>
                        {psico.licenciaProfesional}
                      </Text>
                    </div>
                  </div>
                </div>

                <div style={styles.especialidadWrap}>
                  <Tag
                    style={{
                      ...styles.especialidadTag,
                      color: especialidadColor,
                      background: `${especialidadColor}14`,
                      borderColor: `${especialidadColor}33`,
                    }}
                  >
                    {psico.especialidad}
                  </Tag>
                </div>
              </Card>
            </List.Item>
          );
        }}
      />

      {/* ═══════════════ MODAL DE SOLICITUD ═══════════════ */}
      <Modal
        title={
          <span style={{ color: PALETTE.primaryDark, fontWeight: 700 }}>
            Solicitar vinculación con el profesional
          </span>
        }
        open={modalOpen}
        onCancel={() => !enviando && setModalOpen(false)}
        onOk={handleEnviar}
        confirmLoading={enviando}
        okText="Enviar solicitud"
        cancelText="Cancelar"
        okButtonProps={{ style: { background: PALETTE.primary, borderColor: PALETTE.primary, borderRadius: 10 } }}
        cancelButtonProps={{ style: { borderRadius: 10 } }}
        style={{ top: 80 }}
      >
        <div style={{ marginTop: 12 }}>
          <Paragraph style={{ color: PALETTE.textMuted, marginBottom: 12 }}>
            Cuéntale brevemente al <Text strong>Dr/Dra. {psicologoSeleccionado?.usuario?.apellido}</Text> el
            motivo de tu consulta inicial:
          </Paragraph>
          <TextArea
            className="buscarpsico-input"
            rows={4}
            value={mensaje}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMensaje(e.target.value)}
            placeholder="Ej. Hola, requiero acompañamiento debido a problemas constantes de estrés y ansiedad..."
          />
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────────────────────
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: PALETTE.bg,
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    padding: 'clamp(16px, 3vw, 40px)',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryDark})`,
    boxShadow: '0 12px 30px rgba(18, 65, 74, 0.25)',
    padding: 'clamp(24px, 3vw, 40px)',
  },
  heroDecoration: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  heroEyebrow: {
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: '#fff',
    borderRadius: 999,
    padding: '4px 12px',
    fontSize: 12.5,
    fontWeight: 600,
  },
  card: {
    borderRadius: 20,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.08)',
    border: `1px solid ${PALETTE.border}`,
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  nombrePsico: {
    display: 'block',
    fontSize: 16,
    color: PALETTE.primaryDark,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  licenciaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  especialidadWrap: {
    marginTop: 16,
    paddingBottom: 4,
  },
  especialidadTag: {
    borderRadius: 999,
    padding: '3px 12px',
    fontWeight: 600,
    fontSize: 12.5,
    border: '1px solid',
  },
  ctaButton: {
    background: PALETTE.primary,
    border: 'none',
    borderRadius: 10,
    fontWeight: 600,
    width: '90%',
  },
};

export default BuscarPsicologo;