import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  testsPsicometricosService,
  EstadisticaMensualTest,
} from '../../services/testsPsicometricosService';

const PALETTE = {
  primaryDark: '#12414a',
  primary: '#1d5863',
  accent: '#4da6b0',
  bg: '#eef7f7',
  card: '#ffffff',
  textMuted: '#64748b',
  border: '#e2e8f0',
};

const NOMBRES_MES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const Analitica: React.FC = () => {
  // El backend no define un enum de tipos de test (string libre en el DTO),
  // así que este campo se escribe a mano hasta que exista un catálogo real.
  const [tipoTest, setTipoTest] = useState('ANSIEDAD_GAD7');
  const [datos, setDatos] = useState<EstadisticaMensualTest[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    testsPsicometricosService
      .estadisticasPorTipo(tipoTest.trim())
      .then((res) => {
        if (activo) setDatos(res);
      })
      .catch((err) => {
        console.error('Error al cargar estadísticas de tests:', err);
        if (activo) {
          setError(
            'No se pudieron cargar las estadísticas. Verifica que el tipo de test exista y que tu rol tenga permisos (ADMIN/PSICOLOGO).'
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [tipoTest]);

  const datosGrafico = useMemo(
    () =>
      datos
        .slice()
        .reverse()
        .map((d) => ({
          mes: `${NOMBRES_MES[d._id.mes - 1]} ${d._id.año}`,
          promedio: Number(d.promedioPuntaje.toFixed(1)),
          evaluaciones: d.totalEvaluaciones,
        })),
    [datos]
  );

  return (
    <div style={{ padding: '36px 40px 60px', background: PALETTE.bg, minHeight: '100%' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: PALETTE.primaryDark, margin: '0 0 4px' }}>
        Analítica de tests psicométricos
      </h1>
      <p style={{ color: PALETTE.textMuted, margin: '0 0 24px' }}>
        Promedio mensual de puntaje por tipo de test evaluado.
      </p>

      <div
        style={{
          background: PALETTE.card,
          borderRadius: 20,
          padding: '26px 28px',
          border: `1px solid ${PALETTE.border}`,
          boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: PALETTE.primary }}>
            Tipo de test:
          </label>
          <input
            value={tipoTest}
            onChange={(e) => setTipoTest(e.target.value)}
            placeholder="ej. ANSIEDAD_GAD7"
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: `1px solid ${PALETTE.border}`,
              fontSize: 13,
              minWidth: 220,
            }}
          />
        </div>

        {error && <p style={{ color: '#c0564e', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        {cargando ? (
          <p style={{ color: PALETTE.textMuted, fontSize: 13 }}>Cargando estadísticas…</p>
        ) : datosGrafico.length === 0 ? (
          <p style={{ color: PALETTE.textMuted, fontSize: 13 }}>
            No hay evaluaciones registradas todavía para "{tipoTest}".
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={PALETTE.border} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
              <YAxis tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${PALETTE.border}` }} />
              <Bar dataKey="promedio" name="Puntaje promedio" fill={PALETTE.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Analitica;