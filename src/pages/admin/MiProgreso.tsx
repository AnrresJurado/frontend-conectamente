import React, { useEffect, useState } from 'react';
import { Tag, Spin, Alert, message, Card, Statistic, Timeline } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { progresoService, Progreso } from '../../services/progresoService';
import dayjs from 'dayjs';

const PALETTE = {
  primaryDark: '#12414a',
  primary: '#1d5863',
  accent: '#4da6b0',
  accentSoft: '#bce3e6',
  bg: '#eef7f7',
  card: '#ffffff',
  textMuted: '#64748b',
  border: '#e2e8f0',
  success: '#3f9d6f',
  warning: '#e0a13a',
  danger: '#c0564e',
};

const ESTADO_EMOCIONAL_COLORS: Record<string, string> = {
  'Excelente': '#3f9d6f',
  'Bien': '#4da6b0',
  'Regular': '#e0a13a',
  'Malo': '#c0564e',
  'Muy malo': '#a83232',
};

const MiProgreso: React.FC = () => {
  const { user } = useAuth();
  const [progresos, setProgresos] = useState<Progreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarMiProgreso();
  }, []);

  const cargarMiProgreso = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await progresoService.getByPaciente(user?.id || '');
      setProgresos(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar tu progreso.');
      message.error('Error al cargar tu progreso');
    } finally {
      setLoading(false);
    }
  };

  // Datos para el gráfico
  const datosEstadosEmocionales = Object.entries(
    progresos.reduce((acc, p) => {
      acc[p.estadoEmocional] = (acc[p.estadoEmocional] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([estado, cantidad]) => ({
    estado,
    cantidad,
    color: ESTADO_EMOCIONAL_COLORS[estado] || PALETTE.accent,
  }));

  // Estadísticas
  const estadisticas = {
    total: progresos.length,
    ultimos30Dias: progresos.filter((p) =>
      dayjs(p.fecha).isAfter(dayjs().subtract(30, 'day'))
    ).length,
    promedioAvance: progresos.length > 0
      ? Math.round(
          progresos.reduce((acc, p) => {
            const valor = parseInt(p.avance) || 0;
            return acc + valor;
          }, 0) / progresos.length
        )
      : 0,
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '120px 0',
          background: PALETTE.bg,
          minHeight: '100%',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 20, borderRadius: 12 }}
        />
      )}

      {/* ═══════════════ ENCABEZADO ═══════════════ */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Mi Progreso Clínico</h1>
          <p style={styles.subtitle}>
            Visualiza tu evolución y estado emocional a lo largo del tiempo
          </p>
        </div>
      </div>

      {/* ═══════════════ ESTADÍSTICAS ═══════════════ */}
      <div style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Statistic
            title="Total de Registros"
            value={estadisticas.total}
            prefix="📊"
            valueStyle={{ color: PALETTE.primary, fontWeight: 700 }}
          />
        </Card>
        <Card style={styles.statCard}>
          <Statistic
            title="Últimos 30 Días"
            value={estadisticas.ultimos30Dias}
            prefix="📅"
            valueStyle={{ color: PALETTE.accent, fontWeight: 700 }}
          />
        </Card>
        <Card style={styles.statCard}>
          <Statistic
            title="Avance Promedio"
            value={estadisticas.promedioAvance}
            suffix="%"
            prefix="📈"
            valueStyle={{ color: PALETTE.success, fontWeight: 700 }}
          />
        </Card>
      </div>

      {/* ═══════════════ GRÁFICOS ═══════════════ */}
      {progresos.length > 0 && (
        <div style={styles.chartsGrid}>
          <Card style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Distribución por Estado Emocional</h3>
            {datosEstadosEmocionales.length === 0 ? (
              <p style={styles.emptyText}>No hay datos para mostrar</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosEstadosEmocionales}
                    dataKey="cantidad"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }: any) => `${name}: ${value}`}
                  >
                    {datosEstadosEmocionales.map((entry) => (
                      <Cell key={entry.estado} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Tu Evolución</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={progresos
                  .slice()
                  .reverse()
                  .slice(-10)
                  .map((p) => ({
                    fecha: dayjs(p.fecha).format('DD/MM/YYYY'),
                    avance: parseInt(p.avance) || 0,
                  }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={PALETTE.border} />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: PALETTE.textMuted }} />
                <YAxis tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${PALETTE.border}` }} />
                <Bar dataKey="avance" name="Avance %" fill={PALETTE.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* ═══════════════ TIMELINE DE PROGRESO ═══════════════ */}
      <Card style={styles.tableCard}>
        <h3 style={styles.chartTitle}>Historial de Progreso</h3>
        {progresos.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 30 }}>📋</span>
            <p style={styles.emptyText}>Aún no hay registros de progreso</p>
          </div>
        ) : (
          <Timeline
            items={progresos
              .slice()
              .reverse()
              .map((p) => ({
                color: ESTADO_EMOCIONAL_COLORS[p.estadoEmocional] || PALETTE.accent,
                children: (
                  <div style={styles.timelineItem}>
                    <div style={styles.timelineHeader}>
                      <strong style={styles.timelineDate}>
                        {dayjs(p.fecha).format('DD/MM/YYYY')}
                      </strong>
                      <Tag color={ESTADO_EMOCIONAL_COLORS[p.estadoEmocional] || PALETTE.accent}>
                        {p.estadoEmocional}
                      </Tag>
                    </div>
                    <div style={styles.timelineContent}>
                      <div style={styles.avanceBar}>
                        <div
                          style={{
                            ...styles.avanceFill,
                            width: `${p.avance}%`,
                            background: ESTADO_EMOCIONAL_COLORS[p.estadoEmocional] || PALETTE.primary,
                          }}
                        />
                      </div>
                      <span style={styles.avanceText}>Avance: {p.avance}%</span>
                    </div>
                    {p.observaciones && (
                      <p style={styles.observaciones}>{p.observaciones}</p>
                    )}
                  </div>
                ),
              }))}
          />
        )}
      </Card>
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
    margin: '4px 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 20,
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 24,
    marginBottom: 24,
  },
  chartCard: {
    borderRadius: 20,
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
  },
  chartTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontSize: 17,
    fontWeight: 700,
    margin: '0 0 20px',
  },
  tableCard: {
    borderRadius: 20,
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    gap: 12,
  },
  emptyText: {
    color: PALETTE.textMuted,
    fontSize: 13.5,
    margin: 0,
    textAlign: 'center',
  },
  timelineItem: {
    background: PALETTE.bg,
    borderRadius: 12,
    padding: '16px',
    marginBottom: 12,
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineDate: {
    color: PALETTE.primary,
    fontSize: 14,
  },
  timelineContent: {
    marginBottom: 8,
  },
  avanceBar: {
    width: '100%',
    height: 8,
    background: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  avanceFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  avanceText: {
    fontSize: 12,
    color: PALETTE.textMuted,
  },
  observaciones: {
    color: '#475569',
    fontSize: 13.5,
    margin: '8px 0 0',
    lineHeight: 1.5,
  },
};

export default MiProgreso;