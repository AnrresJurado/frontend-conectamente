import React, { useEffect, useState } from 'react';
import { Table, Card, Typography, message } from 'antd';
import { recomendacionesService, Recomendacion } from '../../services/recomendacionesService';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

const PALETTE = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  bg: '#eef7f7',
  card: '#ffffff',
  border: '#e2e8f0',
  textMuted: '#64748b',
};

const MisRecomendaciones: React.FC = () => {
  const { user } = useAuth();
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const cargarRecomendaciones = async () => {
    setLoading(true);
    try {
      const data = await recomendacionesService.getAll();
      setRecomendaciones(data);
    } catch (error) {
      console.error(error);
      message.error('Error al cargar tus recomendaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarRecomendaciones();
    }
  }, [user]);

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (text: string) => {
        const fecha = new Date(text);
        return <span style={{ fontWeight: 500 }}>{fecha.toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })}</span>;
      },
    },
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      render: (text: string) => <Text strong style={{ color: PALETTE.primary }}>{text}</Text>,
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
      render: (text: string) => <span style={{ color: '#475569', fontSize: 13 }}>{text}</span>,
    },
    {
      title: 'Psicólogo',
      key: 'psicologo',
      render: (_: any, record: Recomendacion) => (
        <span style={{ fontSize: 13 }}>
          {record.psicologo?.usuario?.nombre} {record.psicologo?.usuario?.apellido}
        </span>
      ),
    },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        .cm-mis-recomendaciones .ant-table { background: transparent; }
        .cm-mis-recomendaciones .ant-table-thead > tr > th {
          background: #f2f9f9;
          color: ${PALETTE.primary};
          font-weight: 700;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: none;
        }
        .cm-mis-recomendaciones .ant-table-thead > tr > th::before { display: none; }
        .cm-mis-recomendaciones .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eef2f2;
          padding-top: 14px;
          padding-bottom: 14px;
        }
        .cm-mis-recomendaciones .ant-table-tbody > tr:hover > td { background: #f7fcfc; }
        .cm-mis-recomendaciones .ant-table-tbody > tr:last-child > td { border-bottom: none; }
        .cm-mis-recomendaciones .ant-pagination-item-active { border-color: ${PALETTE.primary}; }
        .cm-mis-recomendaciones .ant-pagination-item-active a { color: ${PALETTE.primary}; }
      `}</style>

      {/* ═══════════════ ENCABEZADO ═══════════════ */}
      <div style={styles.header}>
        <div>
          <Title style={styles.title}>Mis Recomendaciones</Title>
          <Text style={styles.subtitle}>
            Aquí encontrarás las recomendaciones y consejos de tu psicólogo asignado
          </Text>
        </div>
      </div>

      {/* ═══════════════ TARJETA INFORMATIVA ═══════════════ */}
      <Card style={styles.infoCard} bordered={false}>
        <div style={styles.infoContent}>
          <div style={styles.infoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={PALETTE.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div>
            <Text strong style={styles.infoTitle}>Información importante</Text>
            <br />
            <Text style={styles.infoText}>
              Estas recomendaciones son privadas y han sido creadas especialmente para ti por tu psicólogo.
              Te ayudarán en tu proceso de tratamiento y bienestar emocional.
            </Text>
          </div>
        </div>
      </Card>

      {/* ═══════════════ TABLA ═══════════════ */}
      <div style={styles.panel} className="cm-mis-recomendaciones">
        <Table
          columns={columns as any}
          dataSource={recomendaciones}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ 
            emptyText: (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={PALETTE.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <br />
                <Text type="secondary">Aún no tienes recomendaciones registradas.</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tu psicólogo las compartirá contigo en tus sesiones.
                </Text>
              </div>
            )
          }}
        />
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: PALETTE.bg,
    minHeight: '100%',
    padding: '36px 40px 60px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.4px',
  },
  subtitle: {
    color: PALETTE.textMuted,
    fontSize: 14,
    marginTop: 4,
    display: 'block',
  },
  infoCard: {
    background: `linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)`,
    border: `1px solid #bae6fd`,
    borderRadius: 16,
    marginBottom: 24,
    boxShadow: '0 2px 8px rgba(29, 88, 99, 0.08)',
  },
  infoContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    padding: '4px 8px',
  },
  infoIcon: {
    flexShrink: 0,
    marginTop: 2,
  },
  infoTitle: {
    color: PALETTE.primary,
    fontSize: 15,
    display: 'block',
    marginBottom: 4,
  },
  infoText: {
    color: '#475569',
    fontSize: 13.5,
    lineHeight: 1.6,
    margin: 0,
  },
  panel: {
    background: PALETTE.card,
    borderRadius: 20,
    padding: '8px 20px',
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
    border: `1px solid ${PALETTE.border}`,
  },
};

export default MisRecomendaciones;