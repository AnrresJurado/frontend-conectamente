import React, { useEffect, useRef, useState } from 'react';
import { Badge, Popover, Empty, Spin } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { notificacionesService, Notificacion } from '../services/notificacionesService';
import { useAuth } from '../hooks/useAuth';

const COLORS = {
  primary: '#1d5863',
  accent: '#4da6b0',
  border: '#e2e8f0',
  textMuted: '#94a3b8',
};

const POLL_INTERVAL_MS = 15000;

const tiempoRelativo = (fechaISO?: string) => {
  if (!fechaISO) return '';
  const diffMs = Date.now() - new Date(fechaISO).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
};

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cargar = async (mostrarLoading: boolean) => {
    if (!user?.id) return;
    if (mostrarLoading) setLoading(true);
    try {
      const data = await notificacionesService.findByUsuario(user.id);
      // Más recientes primero
      const ordenadas = [...data].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setNotificaciones(ordenadas);
    } catch (error) {
      console.error(error);
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    cargar(true);
    pollRef.current = setInterval(() => cargar(false), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user?.id]);

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  const handleClickNotificacion = async (n: Notificacion) => {
    if (n.leido) return;
    try {
      await notificacionesService.marcarComoLeida(n._id);
      setNotificaciones((prev) =>
        prev.map((item) => (item._id === n._id ? { ...item, leido: true } : item))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const contenido = (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>Notificaciones</span>
        {noLeidas > 0 && <span style={styles.panelBadge}>{noLeidas} nuevas</span>}
      </div>

      <div style={styles.panelBody}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <Spin size="small" />
          </div>
        ) : notificaciones.length === 0 ? (
          <Empty
            description="No tienes notificaciones todavía"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '20px 0' }}
          />
        ) : (
          notificaciones.map((n) => (
            <button
              key={n._id}
              onClick={() => handleClickNotificacion(n)}
              style={{
                ...styles.item,
                background: n.leido ? 'transparent' : 'rgba(77, 166, 176, 0.08)',
              }}
            >
              {!n.leido && <span style={styles.dot} />}
              <div style={styles.itemContent}>
                <span style={styles.itemTitulo}>{n.titulo}</span>
                <span style={styles.itemCuerpo}>{n.mensaje}</span>
                <span style={styles.itemTiempo}>{tiempoRelativo(n.createdAt)}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={contenido}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayInnerStyle={{ padding: 0 }}
    >
      <button style={styles.bellButton} aria-label="Notificaciones">
        <Badge count={noLeidas} size="small" offset={[-2, 2]}>
          <BellOutlined style={{ fontSize: 19, color: COLORS.primary }} />
        </Badge>
      </button>
    </Popover>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  bellButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 6,
    borderRadius: 10,
  },
  panel: {
    width: 340,
    maxHeight: 420,
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  panelTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    color: COLORS.primary,
    fontSize: 15,
  },
  panelBadge: {
    fontSize: 11.5,
    fontWeight: 700,
    color: COLORS.accent,
    background: 'rgba(77, 166, 176, 0.12)',
    padding: '3px 10px',
    borderRadius: 12,
  },
  panelBody: {
    overflowY: 'auto',
    maxHeight: 360,
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    borderBottom: `1px solid ${COLORS.border}`,
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: COLORS.accent,
    marginTop: 6,
    flexShrink: 0,
  },
  itemContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  itemTitulo: {
    fontSize: 13.5,
    fontWeight: 700,
    color: '#334155',
  },
  itemCuerpo: {
    fontSize: 12.5,
    color: '#64748b',
    lineHeight: 1.4,
  },
  itemTiempo: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
};

export default NotificationBell;