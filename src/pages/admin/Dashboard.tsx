import React, { useEffect, useMemo, useState } from 'react';
import { Spin } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { citasService, Cita } from '../../services/citasService';
import { useAuth } from '../../hooks/useAuth';

// ─────────────────────────────────────────────────────────────
// Paleta e identidad visual — misma familia que Login / Register / Home
// ─────────────────────────────────────────────────────────────
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

const ESTADO_META: Record<string, { color: string; label: string }> = {
  PENDIENTE: { color: '#e0a13a', label: 'Pendientes' },
  REALIZADA: { color: '#3f9d6f', label: 'Realizadas' },
  CANCELADA: { color: '#c0564e', label: 'Canceladas' },
};

const esMismoDia = (fecha: string) => {
  const d = new Date(fecha);
  const hoy = new Date();
  return (
    d.getDate() === hoy.getDate() &&
    d.getMonth() === hoy.getMonth() &&
    d.getFullYear() === hoy.getFullYear()
  );
};

const saludoSegunHora = () => {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const fechaLarga = () =>
  new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const rol = user?.rol;

  useEffect(() => {
    const cargarCitas = async () => {
      setLoading(true);
      try {
        // El backend ya filtra el listado según el rol/token del usuario
        // (mismo patrón que usa Citas.tsx con citasService.getAll()).
        const data = await citasService.getAll();
        setCitas(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user) cargarCitas();
  }, [user]);

  const citasDeHoy = useMemo(
    () => citas.filter((c) => esMismoDia(c.fechaHora) && c.estado !== 'CANCELADA'),
    [citas]
  );

  const proximasCitas = useMemo(
    () =>
      citas
        .filter((c) => c.estado === 'PENDIENTE' && new Date(c.fechaHora) >= new Date())
        .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
        .slice(0, 5),
    [citas]
  );

  const datosEstado = useMemo(() => {
    const conteo: Record<string, number> = { PENDIENTE: 0, REALIZADA: 0, CANCELADA: 0 };
    citas.forEach((c) => {
      if (conteo[c.estado] !== undefined) conteo[c.estado] += 1;
    });
    return Object.entries(conteo)
      .filter(([, valor]) => valor > 0)
      .map(([estado, valor]) => ({ estado, valor }));
  }, [citas]);

  const totalCitas = citas.length;
  const esPaciente = rol === 'PACIENTE';
  const listaDatos = esPaciente ? proximasCitas : citasDeHoy;

  const nombrePropio = user?.nombre
    ? rol === 'PSICOLOGO'
      ? `Dr(a). ${user.nombre}`
      : user.nombre
    : '';

  const listaTitulo =
    rol === 'ADMIN'
      ? 'Citas de hoy · Todos los profesionales'
      : rol === 'PSICOLOGO'
      ? 'Tu agenda de hoy'
      : 'Tus próximas sesiones';

  const subtitulo =
    rol === 'ADMIN'
      ? 'Vista consolidada de la operación clínica.'
      : rol === 'PSICOLOGO'
      ? 'Así está tu agenda por ahora.'
      : 'Este es el estado de tu acompañamiento.';

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', background: PALETTE.bg, minHeight: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ═══════════════ HERO DE BIENVENIDA ═══════════════ */}
      <div style={styles.hero}>
        <div>
          <span style={styles.eyebrow}>{fechaLarga()}</span>
          <h1 style={styles.heroTitle}>
            {saludoSegunHora()}{nombrePropio ? `, ${nombrePropio}` : ''}
          </h1>
          <p style={styles.heroSubtitle}>{subtitulo}</p>
        </div>

        <div style={styles.heroStat}>
          <span style={styles.heroStatValue}>{esPaciente ? proximasCitas.length : citasDeHoy.length}</span>
          <span style={styles.heroStatLabel}>
            {esPaciente ? 'próximas sesiones' : 'citas para hoy'}
          </span>
        </div>
      </div>

      {/* ═══════════════ CONTENIDO ═══════════════ */}
      <div style={styles.grid}>
        {/* TIMELINE DE CITAS */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>{listaTitulo}</h2>

          {listaDatos.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: 30 }}>🗓️</span>
              <p style={styles.emptyText}>No hay citas para mostrar por ahora.</p>
            </div>
          ) : (
            <div style={styles.timeline}>
              {listaDatos.map((item) => {
                const fecha = new Date(item.fechaHora);
                const meta = ESTADO_META[item.estado] || { color: PALETTE.accent, label: item.estado };
                return (
                  <div key={item.id} style={styles.timelineItem}>
                    <div style={styles.timeBadge}>
                      <span style={styles.timeBadgeHour}>
                        {fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={styles.timeBadgeDate}>
                        {fecha.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>

                    <div style={styles.timelineContent}>
                      <span style={styles.timelineTitle}>
                        {esPaciente
                          ? item.motivoConsulta || 'Sesión de seguimiento'
                          : `${item.paciente?.nombre || ''} ${item.paciente?.apellido || ''}`}
                      </span>
                      {!esPaciente && item.motivoConsulta && (
                        <span style={styles.timelineSubtitle}>{item.motivoConsulta}</span>
                      )}
                    </div>

                    <span style={{ ...styles.pill, color: meta.color, borderColor: meta.color }}>
                      {meta.label.replace(/s$/, '')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DONUT DE ESTADO */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Distribución de citas</h2>

          {datosEstado.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: 30 }}>📊</span>
              <p style={styles.emptyText}>Aún no hay citas registradas para graficar.</p>
            </div>
          ) : (
            <>
              <div style={styles.donutWrapper}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={datosEstado}
                      dataKey="valor"
                      nameKey="estado"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {datosEstado.map((entry) => (
                        <Cell key={entry.estado} fill={ESTADO_META[entry.estado]?.color || PALETTE.accent} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [value, ESTADO_META[name]?.label || name]}
                      contentStyle={{ borderRadius: 10, border: `1px solid ${PALETTE.border}` }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div style={styles.donutCenter}>
                  <span style={styles.donutTotal}>{totalCitas}</span>
                  <span style={styles.donutTotalLabel}>en total</span>
                </div>
              </div>

              <div style={styles.legend}>
                {datosEstado.map(({ estado, valor }) => (
                  <div key={estado} style={styles.legendItem}>
                    <span
                      style={{ ...styles.legendDot, background: ESTADO_META[estado]?.color || PALETTE.accent }}
                    />
                    <span style={styles.legendLabel}>{ESTADO_META[estado]?.label || estado}</span>
                    <span style={styles.legendValue}>{valor}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Estilos — mismo enfoque (objetos JS) que Login.tsx / Register.tsx
// ─────────────────────────────────────────────────────────────
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: PALETTE.bg,
    minHeight: '100%',
    padding: '36px 40px 60px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  hero: {
    background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryDark})`,
    borderRadius: 24,
    padding: '34px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 24,
    boxShadow: '0 12px 30px rgba(18, 65, 74, 0.25)',
  },
  eyebrow: {
    color: PALETTE.accentSoft,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'capitalize',
  },
  heroTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: '-0.5px',
    margin: '6px 0 4px',
  },
  heroSubtitle: {
    color: PALETTE.accentSoft,
    fontSize: 15,
    margin: 0,
  },
  heroStat: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 18,
    padding: '18px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 160,
  },
  heroStatValue: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 38,
    fontWeight: 800,
    lineHeight: 1,
  },
  heroStatLabel: {
    color: PALETTE.accentSoft,
    fontSize: 12.5,
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: '0.02em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
    gap: 24,
    marginTop: 28,
  },
  panel: {
    background: PALETTE.card,
    borderRadius: 20,
    padding: '26px 28px',
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
    border: `1px solid ${PALETTE.border}`,
  },
  panelTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontSize: 17,
    fontWeight: 700,
    margin: '0 0 20px',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '12px 14px',
    borderRadius: 14,
    background: PALETTE.bg,
  },
  timeBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: PALETTE.primary,
    color: '#ffffff',
    borderRadius: 12,
    minWidth: 64,
    padding: '8px 6px',
    lineHeight: 1.15,
  },
  timeBadgeHour: { fontSize: 14, fontWeight: 700 },
  timeBadgeDate: { fontSize: 11, opacity: 0.8, textTransform: 'capitalize' },
  timelineContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  timelineTitle: {
    color: '#1e293b',
    fontWeight: 600,
    fontSize: 14.5,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  timelineSubtitle: {
    color: PALETTE.textMuted,
    fontSize: 12.5,
    marginTop: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pill: {
    fontSize: 11.5,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 20,
    border: '1.5px solid',
    background: '#ffffff',
    whiteSpace: 'nowrap',
  },
  donutWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  donutTotal: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1,
  },
  donutTotalLabel: {
    color: PALETTE.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 18,
    borderTop: `1px solid ${PALETTE.border}`,
    paddingTop: 16,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendLabel: {
    color: '#334155',
    fontSize: 13.5,
    flex: 1,
  },
  legendValue: {
    color: PALETTE.primary,
    fontWeight: 700,
    fontSize: 13.5,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    gap: 10,
  },
  emptyText: {
    color: PALETTE.textMuted,
    fontSize: 13.5,
    margin: 0,
  },
};

export default Dashboard;