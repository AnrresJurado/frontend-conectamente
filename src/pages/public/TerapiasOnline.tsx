import React from 'react';
import { Button } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleFilled, CloseCircleOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from "../../components/Logo";

import imgInfo from '../../assets/terapias-online/terapia-info.jpeg';

const COLORS = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  accentSoft: '#bce3e6',
  bg: '#f4f9f9',
  card: '#ffffff',
  border: '#e2e8f0',
  textMuted: '#64748b',
  text: '#334155',
};

const PASOS = [
  {
    numero: '01',
    titulo: 'Elige a tu psicólogo',
    texto: 'Explora perfiles verificados y encuentra al profesional ideal para ti.',
  },
  {
    numero: '02',
    titulo: 'Agenda tu sesión',
    texto: 'Selecciona el día y la hora que mejor se acomode a tu rutina.',
  },
  {
    numero: '03',
    titulo: 'Conéctate desde donde estés',
    texto: 'Accede a tu videollamada privada desde tu celular o computador.',
  },
];

const COMPARATIVA = [
  { texto: 'Sin traslados ni tiempos de espera', online: true },
  { texto: 'Tarifas más accesibles', online: true },
  { texto: 'Horarios flexibles, incluso en la noche', online: true },
  { texto: 'Mismo respaldo y confidencialidad clínica', online: true },
  { texto: 'Depende de disponibilidad geográfica', online: false },
];

const TerapiasOnline: React.FC = () => {
  const navigate = useNavigate();

  const irARegistro = () => {
    navigate('/register');
  };

  return (
    <div style={styles.page}>
      <style>{`
        .cm-t2-paso:hover .cm-t2-numero {
          background: ${COLORS.primary};
          color: #ffffff;
        }
        .cm-t2-cta:hover {
          filter: brightness(1.08);
        }
        .cm-t2-comp-row:hover {
          background: ${COLORS.bg};
        }
      `}</style>

      <div style={styles.heroDark}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          Volver
        </Button>

        <div style={styles.heroInner}>
          <div style={styles.heroTextCol}>
            <Logo size={40} textColor="#ffffff" accentColor={COLORS.accentSoft} />
            <div style={styles.heroBadgePill}>
              <VideoCameraOutlined />
              <span>Sesiones por videollamada</span>
            </div>
            <h1 style={styles.heroTitle}>
              Terapia psicológica,
              <br />
              sin salir de casa
            </h1>
            <p style={styles.heroSubtitle}>
              Habla con un psicólogo desde tu celular o computador, en un
              espacio privado y a la hora que mejor te acomode.
            </p>
            <Button
              type="primary"
              size="large"
              className="cm-t2-cta"
              style={styles.ctaButtonHero}
              onClick={irARegistro}
            >
              Agendar mi primera sesión
            </Button>
          </div>

          <div style={styles.heroImageCol}>
            <img src={imgInfo} alt="Terapia online" style={styles.heroImage} />
          </div>
        </div>
      </div>

      {/* PASOS */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Empezar es más simple de lo que crees</h2>
        <p style={styles.sectionSubtitle}>Tres pasos y estarás en tu primera sesión.</p>

        <div style={styles.pasosGrid}>
          {PASOS.map((p) => (
            <div key={p.numero} className="cm-t2-paso" style={styles.pasoCard}>
              <span className="cm-t2-numero" style={styles.pasoNumero}>{p.numero}</span>
              <h3 style={styles.pasoTitulo}>{p.titulo}</h3>
              <p style={styles.pasoTexto}>{p.texto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARATIVA + STATS */}
      <div style={styles.compSection}>
        <div style={styles.compCard}>
          <h2 style={styles.compTitle}>¿Por qué elegir la modalidad online?</h2>
          <p style={styles.compSubtitle}>
            Los mismos beneficios clínicos que una sesión presencial, con
            mucha más comodidad para tu día a día.
          </p>
          <div style={styles.compList}>
            {COMPARATIVA.map((item) => (
              <div key={item.texto} className="cm-t2-comp-row" style={styles.compRow}>
                {item.online ? (
                  <CheckCircleFilled style={{ color: COLORS.accent, fontSize: 18 }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#cbd5e1', fontSize: 18 }} />
                )}
                <span style={{ ...styles.compText, opacity: item.online ? 1 : 0.55 }}>
                  {item.texto}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.statsPanel}>
          <div style={styles.statBlock}>
            <span style={styles.statNumber}>+30%</span>
            <span style={styles.statLabel}>más económico que una sesión presencial</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statBlock}>
            <span style={styles.statNumber}>24/7</span>
            <span style={styles.statLabel}>horarios disponibles según tu psicólogo</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statBlock}>
            <span style={styles.statNumber}>100%</span>
            <span style={styles.statLabel}>confidencial, desde un espacio privado</span>
          </div>
        </div>
      </div>

      {/* CIERRE */}
      <div style={styles.closingSection}>
        <div style={styles.closingCard}>
          <h3 style={styles.closingTitle}>Tu bienestar no debería esperar</h3>
          <p style={styles.closingText}>
            Da el primer paso hoy. Encuentra a tu psicólogo ideal y comienza
            tu proceso terapéutico esta misma semana.
          </p>
          <Button
            type="primary"
            size="large"
            className="cm-t2-cta"
            style={styles.ctaButtonFinal}
            onClick={irARegistro}
          >
            Quiero empezar mi terapia
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: COLORS.bg,
    minHeight: '100vh',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  heroDark: {
    background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
    padding: '20px 40px 60px',
  },
  backButton: {
    color: '#ffffff',
    fontWeight: 500,
    paddingLeft: 0,
  },
  heroInner: {
    maxWidth: 1160,
    margin: '10px auto 0',
    display: 'flex',
    alignItems: 'center',
    gap: 48,
    flexWrap: 'wrap',
  },
  heroTextCol: {
    flex: '1 1 420px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  heroBadgePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255,255,255,0.12)',
    color: COLORS.accentSoft,
    fontSize: 13,
    fontWeight: 600,
    padding: '7px 16px',
    borderRadius: 20,
    width: 'fit-content',
    marginTop: 18,
    border: '1px solid rgba(255,255,255,0.2)',
  },
  heroTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 800,
    letterSpacing: '-1px',
    lineHeight: 1.18,
    margin: '16px 0',
  },
  heroSubtitle: {
    color: COLORS.accentSoft,
    fontSize: 16,
    lineHeight: 1.7,
    margin: '0 0 30px',
    maxWidth: 460,
  },
  ctaButtonHero: {
    background: '#ffffff',
    borderColor: '#ffffff',
    color: COLORS.primary,
    borderRadius: 26,
    fontWeight: 700,
    height: 50,
    paddingInline: 28,
    width: 'fit-content',
    boxShadow: '0 10px 24px rgba(0,0,0,0.2)',
  },
  heroImageCol: {
    flex: '1 1 380px',
    maxWidth: 460,
  },
  heroImage: {
    width: '100%',
    height: 340,
    objectFit: 'cover',
    borderRadius: 24,
    boxShadow: '0 24px 60px rgba(18, 65, 74, 0.35)',
    border: '6px solid rgba(255,255,255,0.9)',
    display: 'block',
  },
  section: {
    maxWidth: 1160,
    margin: '70px auto 0',
    padding: '0 40px 20px',
  },
  sectionTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    textAlign: 'center',
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14.5,
    textAlign: 'center',
    margin: '8px 0 40px',
  },
  pasosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 28,
  },
  pasoCard: {
    padding: '4px 12px',
  },
  pasoNumero: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 46,
    borderRadius: '50%',
    background: COLORS.accentSoft,
    color: COLORS.primary,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 800,
    fontSize: 15,
    transition: 'all 0.25s ease',
    marginBottom: 16,
  },
  pasoTitulo: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: 700,
    margin: '0 0 8px',
  },
  pasoTexto: {
    color: COLORS.textMuted,
    fontSize: 13.5,
    lineHeight: 1.6,
    margin: 0,
  },
  compSection: {
    maxWidth: 1160,
    margin: '80px auto 0',
    padding: '0 40px',
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  compCard: {
    background: COLORS.card,
    borderRadius: 28,
    padding: '48px 56px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 10px 30px rgba(29, 88, 99, 0.08)',
    flex: '1 1 480px',
  },
  compTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 800,
    margin: '0 0 10px',
  },
  compSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14.5,
    lineHeight: 1.6,
    margin: '0 0 26px',
  },
  compList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  compRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 10px',
    borderRadius: 10,
    transition: 'background 0.2s ease',
  },
  compText: {
    color: COLORS.text,
    fontSize: 14.5,
  },
  statsPanel: {
    flex: '1 1 320px',
    background: `linear-gradient(150deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
    borderRadius: 28,
    padding: '44px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 22,
    boxShadow: '0 10px 30px rgba(29, 88, 99, 0.18)',
  },
  statBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statNumber: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 800,
  },
  statLabel: {
    color: COLORS.accentSoft,
    fontSize: 13.5,
    lineHeight: 1.5,
    maxWidth: 240,
  },
  statDivider: {
    height: 1,
    background: 'rgba(255,255,255,0.15)',
  },
  closingSection: {
    maxWidth: 1160,
    margin: '80px auto 0',
    padding: '0 40px 90px',
    display: 'flex',
    justifyContent: 'center',
  },
  closingCard: {
    textAlign: 'center',
    maxWidth: 560,
  },
  closingTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: 800,
    margin: '0 0 12px',
  },
  closingText: {
    color: COLORS.textMuted,
    fontSize: 15.5,
    lineHeight: 1.7,
    margin: '0 0 26px',
  },
  ctaButtonFinal: {
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
    borderColor: COLORS.primary,
    borderRadius: 26,
    fontWeight: 700,
    height: 50,
    paddingInline: 30,
    boxShadow: '0 10px 24px rgba(29, 88, 99, 0.3)',
  },
};

export default TerapiasOnline;