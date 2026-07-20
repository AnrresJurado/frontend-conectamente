import React, { useEffect, useMemo, useState } from 'react';
import { Spin, Alert } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { citasService, Cita } from '../../services/citasService';
import { pacientesService } from '../../services/pacientesService';
import { psicologosService } from '../../services/psicologosService';
import { historialService } from '../../services/historialService';
import { progresoService } from '../../services/progresoService';
import { encuestasService } from '../../services/encuestasService';
import { testsPsicometricosService } from '../../services/testsPsicometricosService';
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

const PALETA_ESPECIALIDADES = ['#1d5863', '#4da6b0', '#e0a13a', '#c0564e', '#7c6fda', '#3f9d6f'];

interface HistorialConRelaciones {
  id: string;
  psicologo?: { id?: string; especialidad?: string } | null;
}

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
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [totalPsicologos, setTotalPsicologos] = useState(0);
  const [historiales, setHistoriales] = useState<HistorialConRelaciones[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metricasProgreso, setMetricasProgreso] = useState<any>(null);
  const [metricasEncuestas, setMetricasEncuestas] = useState<any>(null);
  const [metricasTests, setMetricasTests] = useState<any>(null);

  const rol = user?.rol;
  const esAdmin = rol === 'ADMIN';
  const esPsicologo = rol === 'PSICOLOGO';

  useEffect(() => {
    let activo = true;

    const cargarDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        // El backend ya filtra /citas según el rol/token del usuario.
        const [citasData, pacientesData, historialesData] = await Promise.all([
          citasService.getAll(),
          pacientesService.getAll(),
          historialService.getAll(),
        ]);

        if (!activo) return;

        setCitas(citasData);
        setTotalPacientes(pacientesData.length);

        // Un PSICÓLOGO solo debe ver su propio historial clínico en el gráfico.
        const historialesFiltrados = esAdmin
          ? historialesData
          : historialesData.filter((h: HistorialConRelaciones) => h.psicologo?.id === user?.id);
        setHistoriales(historialesFiltrados);

        if (esAdmin) {
          const psicologos = await psicologosService.getAll();
          if (activo) setTotalPsicologos(psicologos.length);
        }

        // Cargar métricas de progreso para ADMIN y PSICÓLOGO
        if (esAdmin || esPsicologo) {
          const [metricasProg, metricasEnc, metricasTest] = await Promise.all([
            progresoService.getMetricas(),
            encuestasService.getMetricasGenerales(),
            testsPsicometricosService.estadisticasPorTipo('general'),
          ]);
          if (activo) {
            setMetricasProgreso(metricasProg);
            setMetricasEncuestas(metricasEnc);
            setMetricasTests(metricasTest);
          }
        }
      } catch (err) {
        console.error(err);
        if (activo) setError('No se pudieron cargar todas las estadísticas del panel.');
      } finally {
        if (activo) setLoading(false);
      }
    };

    if (user) cargarDashboard();
    return () => {
      activo = false;
    };
  }, [user, esAdmin]);

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

  // Últimos 6 meses (incluyendo el actual), con conteo total de citas.
  const citasPorMes = useMemo(() => {
    const hoy = new Date();
    const meses = Array.from({ length: 6 }).map((_, i) => {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1);
      return {
        key: `${fecha.getFullYear()}-${fecha.getMonth()}`,
        mes: fecha.toLocaleDateString('es-EC', { month: 'short', year: '2-digit' }),
        total: 0,
      };
    });
    const indice = new Map(meses.map((m, i) => [m.key, i]));
    citas.forEach((c) => {
      const fecha = new Date(c.fechaHora);
      const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      const idx = indice.get(key);
      if (idx !== undefined) meses[idx].total += 1;
    });
    return meses;
  }, [citas]);

  // Historiales agrupados por la especialidad del psicólogo que los registró.
  const historialPorEspecialidad = useMemo(() => {
    const conteo = new Map<string, number>();
    historiales.forEach((h) => {
      const especialidad = h.psicologo?.especialidad?.trim() || 'Sin especialidad';
      conteo.set(especialidad, (conteo.get(especialidad) || 0) + 1);
    });
    return Array.from(conteo.entries())
      .map(([especialidad, valor]) => ({ especialidad, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [historiales]);

  // Progreso agrupado por estado emocional (para el gráfico)
  const progresoPorEstadoEmocional = useMemo(() => {
    if (!metricasProgreso?.porEstadoEmocional) return [];
    return metricasProgreso.porEstadoEmocional.map((item: any) => ({
      estado: item.estado,
      cantidad: item.cantidad,
    }));
  }, [metricasProgreso]);

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

      {/* ═══════════════ TARJETAS RESUMEN ═══════════════ */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, background: `${PALETTE.primary}1a`, color: PALETTE.primary }}>👥</span>
          <div>
            <span style={styles.statValue}>{totalPacientes}</span>
            <span style={styles.statLabel}>Pacientes registrados</span>
          </div>
        </div>

        {esAdmin && (
          <div style={styles.statCard}>
            <span style={{ ...styles.statIcon, background: '#7c6fda1a', color: '#7c6fda' }}>🧑‍⚕️</span>
            <div>
              <span style={styles.statValue}>{totalPsicologos}</span>
              <span style={styles.statLabel}>Psicólogos activos</span>
            </div>
          </div>
        )}

        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, background: '#4da6b01a', color: PALETTE.accent }}>📅</span>
          <div>
            <span style={styles.statValue}>{totalCitas}</span>
            <span style={styles.statLabel}>{esAdmin ? 'Citas totales' : 'Mis citas'}</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, background: '#e0a13a1a', color: '#e0a13a' }}>📋</span>
          <div>
            <span style={styles.statValue}>{historiales.length}</span>
            <span style={styles.statLabel}>Historiales clínicos</span>
          </div>
        </div>

        {(esAdmin || esPsicologo) && metricasProgreso && (
          <>
            <div style={styles.statCard}>
              <span style={{ ...styles.statIcon, background: '#3f9d6f1a', color: '#3f9d6f' }}>📊</span>
              <div>
                <span style={styles.statValue}>{metricasProgreso.totalProgresos}</span>
                <span style={styles.statLabel}>Registros de progreso</span>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={{ ...styles.statIcon, background: '#7c6fda1a', color: '#7c6fda' }}>📈</span>
              <div>
                <span style={styles.statValue}>{metricasProgreso.progresosUltimos30Dias}</span>
                <span style={styles.statLabel}>Progresos (últ. 30 días)</span>
              </div>
            </div>
          </>
        )}

        {(esAdmin || esPsicologo) && metricasEncuestas && (
          <>
            <div style={styles.statCard}>
              <span style={{ ...styles.statIcon, background: '#e0a13a1a', color: '#e0a13a' }}>📝</span>
              <div>
                <span style={styles.statValue}>{metricasEncuestas.totalEncuestas}</span>
                <span style={styles.statLabel}>Encuestas activas</span>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={{ ...styles.statIcon, background: '#c0564e1a', color: '#c0564e' }}>✅</span>
              <div>
                <span style={styles.statValue}>{metricasEncuestas.totalRespuestas}</span>
                <span style={styles.statLabel}>Respuestas registradas</span>
              </div>
            </div>
          </>
        )}
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
                      formatter={(value, name) => [String(value), ESTADO_META[String(name)]?.label || String(name)]}
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

      {/* ═══════════════ CITAS POR MES · HISTORIAL POR ESPECIALIDAD ═══════════════ */}
      <div style={styles.chartsGrid}>
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Citas por mes</h2>
          {citas.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: 30 }}>📈</span>
              <p style={styles.emptyText}>Aún no hay citas registradas para graficar.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={citasPorMes} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={PALETTE.border} />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${PALETTE.border}` }} />
                <Bar dataKey="total" name="Citas" fill={PALETTE.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Historial de pacientes por especialidad</h2>
          {historialPorEspecialidad.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: 30 }}>🗂️</span>
              <p style={styles.emptyText}>Aún no hay historiales clínicos para graficar.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={historialPorEspecialidad}
                    dataKey="valor"
                    nameKey="especialidad"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={78}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {historialPorEspecialidad.map((entry, idx) => (
                      <Cell key={entry.especialidad} fill={PALETA_ESPECIALIDADES[idx % PALETA_ESPECIALIDADES.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${PALETTE.border}` }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.legend}>
                {historialPorEspecialidad.map(({ especialidad, valor }, idx) => (
                  <div key={especialidad} style={styles.legendItem}>
                    <span
                      style={{
                        ...styles.legendDot,
                        background: PALETA_ESPECIALIDADES[idx % PALETA_ESPECIALIDADES.length],
                      }}
                    />
                    <span style={styles.legendLabel}>{especialidad}</span>
                    <span style={styles.legendValue}>{valor}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════ GRÁFICO DE PROGRESO EMOCIONAL ═══════════════ */}
      {(esAdmin || esPsicologo) && metricasProgreso && progresoPorEstadoEmocional.length > 0 && (
        <div style={styles.chartsGrid}>
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Distribución de estados emocionales</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={progresoPorEstadoEmocional} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={PALETTE.border} />
                <XAxis dataKey="estado" tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${PALETTE.border}` }} />
                <Bar dataKey="cantidad" name="Registros" fill={PALETTE.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══════════════ GRÁFICO DE ENCUESTAS ═══════════════ */}
      {(esAdmin || esPsicologo) && metricasEncuestas?.respuestasPorEncuesta?.length > 0 && (
        <div style={styles.chartsGrid}>
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Respuestas por encuesta</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={metricasEncuestas.respuestasPorEncuesta} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={PALETTE.border} />
                <XAxis dataKey="encuestaTitulo" tick={{ fontSize: 11, fill: PALETTE.textMuted }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${PALETTE.border}` }} />
                <Bar dataKey="cantidad" name="Respuestas" fill={PALETTE.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══════════════ GRÁFICO DE TESTS PSICOMÉTRICOS ═══════════════ */}
      {(esAdmin || esPsicologo) && metricasTests?.length > 0 && (
        <div style={styles.chartsGrid}>
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Promedios mensuales de tests psicométricos</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={metricasTests} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={PALETTE.border} />
                <XAxis 
                  dataKey="_id" 
                  tick={{ fontSize: 11, fill: PALETTE.textMuted }}
                  tickFormatter={(value) => `${value.mes}/${value.año}`}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
                <Tooltip 
                  contentStyle={{ borderRadius: 10, border: `1px solid ${PALETTE.border}` }}
                  labelFormatter={(value) => `Mes ${value.mes}/${value.año}`}
                />
                <Bar dataKey="promedioPuntaje" name="Promedio" fill={PALETTE.primaryDark} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginTop: 24,
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: PALETTE.card,
    borderRadius: 18,
    padding: '18px 20px',
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 4px 16px rgba(29, 88, 99, 0.05)',
  },
  statIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 12,
    fontSize: 19,
    flexShrink: 0,
  },
  statValue: {
    display: 'block',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primaryDark,
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.15,
  },
  statLabel: {
    display: 'block',
    color: PALETTE.textMuted,
    fontSize: 12.5,
    marginTop: 2,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
    gap: 24,
    marginTop: 28,
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: 24,
    marginTop: 24,
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