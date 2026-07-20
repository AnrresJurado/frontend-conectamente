import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, Card, Button, Progress, Timeline, Input, Avatar, Space, Typography, Row, Col, message, Spin, Empty, Tag, Badge, Modal, List } from 'antd';
import { 
  HomeOutlined, 
  TeamOutlined, 
  LineChartOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  SendOutlined,
  CalendarOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  SafetyOutlined,
  RightCircleOutlined,
  SaveOutlined,
  MessageOutlined,
  RiseOutlined,
  StarOutlined,
  BookOutlined,
  ExperimentOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import api from '../../api/axiosConfig';
import { progresoService } from '../../services/progresoService';
import { chatsService } from '../../services/chatsService';
import { psicologosService } from '../../services/psicologosService';
import { notificacionesService } from '../../services/notificacionesService';
import { useAuth } from '../../hooks/useAuth';

const { Title, Paragraph, Text } = Typography;

// ─────────────────────────────────────────────────────────────
// Paleta e identidad visual — misma familia que Dashboard
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

const frasesDelDia = [
  '"No tienes que controlarlo todo. A veces solo necesitas dejar ir, confiar y dar el siguiente paso con amor propio."',
  '"El autocuidado no es egoísmo, es la base para poder cuidar de los demás."',
  '"Cada pequeño paso que das hacia tu bienestar es una victoria que merece ser celebrada."',
  '"Tu salud mental es tan importante como tu salud física. Ambas merecen atención y cuidado."',
  '"No estás solo en este camino. Pedir ayuda es un acto de valentía, no de debilidad."',
  '"La sanación no es lineal. Permítete sentir, procesar y crecer a tu propio ritmo."',
  '"Hoy es un buen día para empezar de nuevo. Cada amanecer trae una nueva oportunidad."',
];

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

const formatearFecha = (fechaStr: string) => {
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatearHora = (fechaStr: string) => {
  const d = new Date(fechaStr);
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
};

const getEmojiPorEstado = (estado: string) => {
  const map: Record<string, string> = {
    'FELIZ': '😊',
    'TRISTE': '😢',
    'ANSIEDAD': '😰',
    'TRANQUILO': '😌',
    'ESTRES': '😤',
    'MOTIVADO': '🔥',
    'CANSADO': '😴',
    'NEUTRO': '😐',
    'ESPERANZA': '🌟',
    'AGRADECIDO': '🙏',
  };
  return map[estado?.toUpperCase()] || '💚';
};

const getColorPorEstado = (estado: string) => {
  const map: Record<string, string> = {
    'FELIZ': '#10B981',
    'TRISTE': '#6366F1',
    'ANSIEDAD': '#F59E0B',
    'TRANQUILO': '#06B6D4',
    'ESTRES': '#EF4444',
    'MOTIVADO': '#F97316',
    'CANSADO': '#8B5CF6',
    'NEUTRO': '#94A3B8',
    'ESPERANZA': '#14B8A6',
    'AGRADECIDO': '#EC4899',
  };
  return map[estado?.toUpperCase()] || '#4da6b0';
};

export const MiEspacio: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);

  // Estados dinámicos conectados al backend
  const [pacienteData, setPacienteData] = useState<any>(null);
  const [psicologoData, setPsicologoData] = useState<any>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [progreso, setProgreso] = useState<any[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<any[]>([]);
  
  // Estado del chat
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [psicologoUserId, setPsicologoUserId] = useState<string | null>(null);

  // Estados para el formulario de perfil editable
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  // ─── Estados para buscar psicólogos ───
  const [psicologosDisponibles, setPsicologosDisponibles] = useState<any[]>([]);
  const [cargandoPsicologos, setCargandoPsicologos] = useState(false);
  const [modalPsicologosVisible, setModalPsicologosVisible] = useState(false);
  const [solicitandoPsicologo, setSolicitandoPsicologo] = useState(false);

  // Frase del día (cambia cada día según la fecha)
  const fraseDelDia = useMemo(() => {
    const dia = new Date().getDate();
    return frasesDelDia[dia % frasesDelDia.length];
  }, []);

  useEffect(() => {
    fetchDataPaciente();
  }, []);

  const fetchDataPaciente = async () => {
    setLoading(true);
    try {
      const resPaciente = await api.get('/pacientes/perfil-me');
      const dataPac = resPaciente.data;
      setPacienteData(dataPac);
      setNombre(dataPac.usuario?.nombre || '');
      setApellido(dataPac.usuario?.apellido || '');
      setTelefono(dataPac.telefonoEmergencia || '');

      if (dataPac.psicologo) {
        setPsicologoData(dataPac.psicologo);
        if (dataPac.psicologo.usuario?.id) {
          setPsicologoUserId(dataPac.psicologo.usuario.id);
        }
      }

      const resCitas = await api.get('/citas/mis-citas');
      setCitas(resCitas.data || []);

      try {
        if (dataPac.id) {
          const resProgreso = await progresoService.getByPaciente(dataPac.id);
          setProgreso(resProgreso || []);
        } else {
          const resProgresoGen = await progresoService.getAll();
          setProgreso(resProgresoGen || []);
        }
      } catch (errProg) {
        console.warn("No se pudo cargar el progreso:", errProg);
      }

      try {
        const resRecom = await api.get('/recomendaciones/mis-recomendaciones');
        setRecomendaciones(resRecom.data || []);
      } catch {
        console.warn("No se pudieron cargar recomendaciones");
      }

    } catch (err) {
      console.error("Error al cargar la información:", err);
      message.error("No se pudieron cargar todos los datos de tu espacio.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Cargar lista de psicólogos disponibles ───
  const cargarPsicologosDisponibles = async () => {
    setCargandoPsicologos(true);
    try {
      const data = await psicologosService.getAll();
      setPsicologosDisponibles(data || []);
    } catch (err) {
      console.error("Error al cargar psicólogos:", err);
      message.error("No se pudieron cargar los psicólogos disponibles.");
    } finally {
      setCargandoPsicologos(false);
    }
  };

  const abrirModalPsicologos = () => {
    cargarPsicologosDisponibles();
    setModalPsicologosVisible(true);
  };

  // ─── Solicitar asignación a un psicólogo ───
  const solicitarPsicologo = async (psicologo: any) => {
    setSolicitandoPsicologo(true);
    try {
      // 1. Asignar el psicólogo al paciente
      await api.patch(`/pacientes/${pacienteData.id}/asignar-psicologo`, {
        psicologoId: psicologo.id,
      });

      // 2. Enviar notificación al psicólogo
      const usuarioPsicologoId = psicologo.usuario?.id;
      if (usuarioPsicologoId && user) {
        await notificacionesService.create({
          usuarioId: usuarioPsicologoId,
          titulo: 'Nuevo paciente solicitante 🙋',
          mensaje: `El paciente ${user.nombre} ${user.apellido} ha solicitado ser atendido por ti. Por favor, revisa tu lista de pacientes para confirmar la asignación.`,
          tipo: 'INFO',
        });
      }

      message.success(`Has solicitado a ${psicologo.usuario?.nombre || 'el psicólogo'}. Te notificaremos cuando confirme la asignación.`);
      setModalPsicologosVisible(false);
      
      // Recargar datos para reflejar el nuevo psicólogo asignado
      fetchDataPaciente();
    } catch (err: any) {
      console.error("Error al solicitar psicólogo:", err);
      message.error(err?.response?.data?.message || "No se pudo enviar la solicitud. Intenta de nuevo.");
    } finally {
      setSolicitandoPsicologo(false);
    }
  };

  // Cargar historial del chat
  useEffect(() => {
    if (psicologoUserId && activeTab === '2') {
      cargarHistorialChat();
    }
  }, [psicologoUserId, activeTab]);

  const cargarHistorialChat = async () => {
    if (!psicologoUserId) return;
    setChatLoading(true);
    try {
      const historial = await chatsService.obtenerHistorial(psicologoUserId);
      if (historial && historial.length > 0) {
        const mensajesMapeados = historial.map((msg: any) => ({
          sender: msg.remitenteId === user?.id ? 'paciente' : 'psicologo',
          text: msg.mensaje,
          _id: msg._id,
          enviadoEn: msg.enviadoEn,
        }));
        setMessages(mensajesMapeados);
      } else {
        setMessages([
          { sender: 'psicologo', text: '¡Hola! Bienvenido a tu espacio de comunicación directa. ¿Cómo te has sentido estos días?' }
        ]);
      }
    } catch (err) {
      console.warn("No se pudo cargar el historial del chat:", err);
      setMessages([
        { sender: 'psicologo', text: '¡Hola! Bienvenido a tu espacio de comunicación directa.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !psicologoUserId) return;
    
    const texto = chatMessage;
    setChatMessage('');
    setMessages(prev => [...prev, { sender: 'paciente', text: texto }]);
    
    try {
      await chatsService.enviarMensaje({
        destinatarioId: psicologoUserId,
        mensaje: texto,
      });
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      message.error("No se pudo enviar el mensaje. Intenta de nuevo.");
    }
  };

  const handleUpdateProfile = async () => {
    setGuardandoPerfil(true);
    try {
      await api.patch('/usuarios/actualizar-perfil', {
        nombre,
        apellido,
        telefonoEmergencia: telefono,
      });
      message.success("¡Perfil actualizado con éxito!");
      fetchDataPaciente();
    } catch (err) {
      console.error(err);
      message.error("Error al actualizar el perfil.");
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const progresoGeneral = useMemo(() => {
    if (progreso.length === 0) return 0;
    const objetivo = 10;
    const porcentaje = Math.min(Math.round((progreso.length / objetivo) * 100), 100);
    return porcentaje;
  }, [progreso]);

  const proximaCita = useMemo(() => {
    return citas
      .filter(c => c.estado === 'PROGRAMADA' || c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA')
      .sort((a, b) => new Date(a.fechaHora || a.fecha).getTime() - new Date(b.fechaHora || b.fecha).getTime())
      [0] || null;
  }, [citas]);

  const ultimosProgresos = useMemo(() => {
    return [...progreso]
      .sort((a, b) => new Date(b.fecha || b.createdAt).getTime() - new Date(a.fecha || a.createdAt).getTime())
      .slice(0, 3);
  }, [progreso]);

  const citasCompletadas = useMemo(() => {
    return citas.filter(c => c.estado === 'REALIZADA' || c.estado === 'COMPLETADA').length;
  }, [citas]);

  // Nombre para mostrar: prioridad del backend, luego user de auth, luego fallback
  const nombreMostrar = nombre || user?.nombre || 'Paciente';

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
          <Title level={2} style={styles.heroTitle}>
            {saludoSegunHora()}, {nombreMostrar} 🌿
          </Title>
          <Paragraph style={styles.heroSubtitle}>
            Tu espacio seguro de bienestar — un lugar diseñado exclusivamente para tu tranquilidad, evolución y acompañamiento profesional.
          </Paragraph>
        </div>

        <div style={styles.heroStat}>
          <span style={styles.heroStatValue}>
            {proximaCita ? formatearHora(proximaCita.fechaHora || proximaCita.fecha) : '—'}
          </span>
          <span style={styles.heroStatLabel}>
            {proximaCita 
              ? `Próxima sesión · ${formatearFecha(proximaCita.fechaHora || proximaCita.fecha)}`
              : 'Sin cita próxima'}
          </span>
        </div>
      </div>

      {/* ═══════════════ TARJETAS RESUMEN ═══════════════ */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, background: `${PALETTE.primary}1a`, color: PALETTE.primary }}>
            <CalendarOutlined />
          </span>
          <div>
            <span style={styles.statValue}>{citas.length}</span>
            <span style={styles.statLabel}>Citas registradas</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, background: '#10B9811a', color: '#10B981' }}>
            <CheckCircleOutlined />
          </span>
          <div>
            <span style={styles.statValue}>{citasCompletadas}</span>
            <span style={styles.statLabel}>Sesiones completadas</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, background: '#8B5CF61a', color: '#8B5CF6' }}>
            <RiseOutlined />
          </span>
          <div>
            <span style={styles.statValue}>{progreso.length}</span>
            <span style={styles.statLabel}>Registros emocionales</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, background: '#F59E0B1a', color: '#F59E0B' }}>
            <StarOutlined />
          </span>
          <div>
            <span style={styles.statValue}>{recomendaciones.length}</span>
            <span style={styles.statLabel}>Recomendaciones</span>
          </div>
        </div>
      </div>

      {/* ═══════════════ NAVEGACIÓN POR PESTAÑAS ═══════════════ */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        style={{ marginTop: 24 }}
        items={[
          {
            key: '1',
            label: (<span><HomeOutlined /> Inicio</span>),
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card bordered={false} style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <Title level={4} style={{ margin: 0, color: PALETTE.primary }}>
                        <RiseOutlined style={{ marginRight: 8 }} />
                        Tu progreso general
                      </Title>
                      <Tag color={progresoGeneral >= 70 ? 'success' : progresoGeneral >= 40 ? 'processing' : 'warning'} style={{ borderRadius: 20, padding: '2px 14px' }}>
                        {progresoGeneral}%
                      </Tag>
                    </div>
                    <Progress 
                      percent={progresoGeneral} 
                      strokeColor={{ '0%': PALETTE.accent, '100%': PALETTE.primary }}
                      trailColor="#E2E8F0"
                      style={{ marginBottom: 16 }}
                    />
                    <Paragraph style={{ color: PALETTE.textMuted, margin: 0 }}>
                      {progreso.length === 0 
                        ? 'Aún no tienes registros de progreso. Comienza tu primera evaluación en la pestaña "Progreso".'
                        : `Llevas ${progreso.length} registro${progreso.length !== 1 ? 's' : ''} de tu evolución emocional. ¡Sigue así!`
                      }
                    </Paragraph>
                  </Card>

                  {ultimosProgresos.length > 0 && (
                    <Card bordered={false} style={{ ...styles.card, marginTop: 20 }}>
                      <Title level={4} style={{ margin: '0 0 16px', color: PALETTE.primary }}>
                        <HeartOutlined style={{ marginRight: 8 }} />
                        Últimos registros emocionales
                      </Title>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {ultimosProgresos.map((item: any, idx: number) => (
                          <div key={idx} style={styles.progresoItem}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontSize: 28 }}>
                                {getEmojiPorEstado(item.estadoEmocional)}
                              </span>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Text strong style={{ color: '#1E293B' }}>
                                    {item.estadoEmocional || 'Sin estado'}
                                  </Text>
                                  <Tag color={getColorPorEstado(item.estadoEmocional)} style={{ borderRadius: 12, fontSize: 11 }}>
                                    {formatearFecha(item.fecha || item.createdAt)}
                                  </Tag>
                                </div>
                                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
                                  {item.avance || item.observaciones || 'Sin notas'}
                                </Text>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </Col>

                <Col xs={24} lg={8}>
                  <Card bordered={false} style={styles.cardInspiracional}>
                    <Title level={4} style={{ color: '#fff', margin: 0 }}>
                      <HeartOutlined style={{ marginRight: 8 }} />
                      Frase del día
                    </Title>
                    <Paragraph style={{ color: '#E0E7FF', fontSize: 15, fontStyle: 'italic', marginTop: 16, lineHeight: 1.6 }}>
                      {fraseDelDia}
                    </Paragraph>
                    <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12 }}>
                      <Text style={{ color: '#BCE3E6', fontSize: 12 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        Reflexiona sobre esta frase hoy
                      </Text>
                    </div>
                  </Card>

                  <Card bordered={false} style={{ ...styles.card, marginTop: 20 }}>
                    <Title level={4} style={{ margin: '0 0 12px', color: PALETTE.primary, fontSize: 15 }}>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      Próxima sesión
                    </Title>
                    {proximaCita ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <div style={{ background: PALETTE.bg, borderRadius: 12, padding: '8px 12px', textAlign: 'center', minWidth: 60 }}>
                            <Text strong style={{ color: PALETTE.primary, fontSize: 18, display: 'block' }}>
                              {new Date(proximaCita.fechaHora || proximaCita.fecha).getDate()}
                            </Text>
                            <Text style={{ color: PALETTE.textMuted, fontSize: 11 }}>
                              {new Date(proximaCita.fechaHora || proximaCita.fecha).toLocaleDateString('es-EC', { month: 'short' })}
                            </Text>
                          </div>
                          <div>
                            <Text strong style={{ color: '#1E293B', display: 'block' }}>
                              {formatearHora(proximaCita.fechaHora || proximaCita.fecha)}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {proximaCita.motivoConsulta || 'Sesión de seguimiento'}
                            </Text>
                          </div>
                        </div>
                        <Tag color="processing" style={{ borderRadius: 12 }}>
                          {proximaCita.estado}
                        </Tag>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <Text type="secondary">No tienes citas programadas</Text>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: '2',
            label: (<span><TeamOutlined /> Mi Psicólogo & Chat</span>),
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  {/* Tarjeta del psicólogo asignado */}
                  <Card bordered={false} style={styles.card}>
                    <div style={{ textAlign: 'center' }}>
                      <Avatar 
                        size={100} 
                        src={psicologoData?.fotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${psicologoData?.usuario?.nombre || 'psicologo'}`}
                        style={{ border: '4px solid #EEF2FF', marginBottom: 16 }}
                      />
                      {psicologoData ? (
                        <>
                          <Title level={4} style={{ margin: 0, color: '#1E293B' }}>
                            {psicologoData.usuario?.nombre || ''} {psicologoData.usuario?.apellido || ''}
                          </Title>
                          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                            {psicologoData?.especialidad || 'Especialista en Salud Mental'}
                          </Text>
                          <div style={{ marginTop: 20, textAlign: 'left' }}>
                            <div style={styles.infoRow}>
                              <SafetyOutlined style={{ color: PALETTE.accent }} />
                              <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>
                                {psicologoData.numColegiatura || psicologoData.licenciaProfesional || 'Licencia profesional'}
                              </Text>
                            </div>
                            {psicologoData.usuario?.email && (
                              <div style={{ ...styles.infoRow, marginTop: 8 }}>
                                <MailOutlined style={{ color: PALETTE.accent }} />
                                <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>
                                  {psicologoData.usuario.email}
                                </Text>
                              </div>
                            )}
                            {psicologoData.telefono && (
                              <div style={{ ...styles.infoRow, marginTop: 8 }}>
                                <PhoneOutlined style={{ color: PALETTE.accent }} />
                                <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>
                                  {psicologoData.telefono}
                                </Text>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <Title level={4} style={{ margin: 0, color: '#1E293B' }}>
                            Sin psicólogo asignado
                          </Title>
                          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                            Busca un profesional y solicita ser atendido
                          </Text>
                        </>
                      )}

                      <div style={{ marginTop: 20 }}>
                        <Button 
                          type="primary" 
                          icon={<SearchOutlined />}
                          onClick={abrirModalPsicologos}
                          style={{ 
                            background: psicologoData ? '#ffffff' : PALETTE.primary, 
                            border: psicologoData ? `1.5px solid ${PALETTE.primary}` : 'none',
                            color: psicologoData ? PALETTE.primary : '#ffffff',
                            borderRadius: 12,
                            width: '100%'
                          }}
                        >
                          {psicologoData ? 'Cambiar de psicólogo' : 'Buscar psicólogo'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={16}>
                  <Card 
                    bordered={false}
                    style={styles.cardChat}
                    bodyStyle={{ display: 'flex', flexDirection: 'column', height: '480px', padding: 0 }}
                  >
                    <div style={styles.chatHeader}>
                      <Space>
                        <Badge status={psicologoUserId ? "success" : "default"} />
                        <span style={{ fontWeight: 600, color: '#1E293B' }}>
                          Chat con {psicologoData?.usuario?.nombre || 'tu psicólogo'}
                        </span>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <MessageOutlined style={{ marginRight: 4 }} />
                        Respuesta en 24-48 hrs
                      </Text>
                    </div>

                    <div style={styles.chatMessages}>
                      {!psicologoUserId ? (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                          <TeamOutlined style={{ fontSize: 48, color: PALETTE.border, marginBottom: 16 }} />
                          <Title level={4} style={{ color: PALETTE.textMuted, margin: 0 }}>
                            No tienes un psicólogo asignado
                          </Title>
                          <Paragraph type="secondary" style={{ marginTop: 8 }}>
                            Para poder chatear, primero debes buscar y solicitar un psicólogo usando el botón de arriba.
                          </Paragraph>
                          <Button 
                            type="primary" 
                            icon={<SearchOutlined />}
                            onClick={abrirModalPsicologos}
                            style={{ background: PALETTE.primary, border: 'none', borderRadius: 12, marginTop: 8 }}
                            size="large"
                          >
                            Buscar psicólogos disponibles
                          </Button>
                        </div>
                      ) : chatLoading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                          <Spin />
                        </div>
                      ) : messages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                          <Empty description="No hay mensajes aún" />
                        </div>
                      ) : (
                        messages.map((msg, index) => (
                          <div 
                            key={index} 
                            style={{
                              ...styles.chatBubble,
                              alignSelf: msg.sender === 'paciente' ? 'flex-end' : 'flex-start',
                              background: msg.sender === 'paciente' ? PALETTE.primary : '#F1F5F9',
                              color: msg.sender === 'paciente' ? '#fff' : '#1E293B',
                              borderBottomRightRadius: msg.sender === 'paciente' ? 4 : 16,
                              borderBottomLeftRadius: msg.sender === 'paciente' ? 16 : 4,
                            }}
                          >
                            <Text style={{ color: 'inherit', fontSize: 14 }}>{msg.text}</Text>
                            {msg.enviadoEn && (
                              <Text style={{ color: msg.sender === 'paciente' ? 'rgba(255,255,255,0.6)' : PALETTE.textMuted, fontSize: 10, display: 'block', marginTop: 4 }}>
                                {formatearHora(msg.enviadoEn)}
                              </Text>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div style={styles.chatInput}>
                      <Input 
                        placeholder="Escribe un mensaje para tu psicólogo..." 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onPressEnter={handleSendMessage}
                        style={{ borderRadius: 12, padding: '10px 16px', border: '1px solid #E2E8F0' }}
                        disabled={!psicologoUserId}
                      />
                      <Button 
                        type="primary" 
                        icon={<SendOutlined />} 
                        onClick={handleSendMessage}
                        style={{ height: 44, borderRadius: 12, background: PALETTE.primary, border: 'none', minWidth: 44 }}
                        disabled={!psicologoUserId || !chatMessage.trim()}
                      />
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: '3',
            label: (<span><LineChartOutlined /> Progreso</span>),
            children: (
              <Card bordered={false} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <Title level={4} style={{ margin: 0, color: PALETTE.primary }}>
                      <RiseOutlined style={{ marginRight: 8 }} />
                      Tu línea de evolución emocional
                    </Title>
                    <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                      {progreso.length > 0 
                        ? `${progreso.length} registro${progreso.length !== 1 ? 's' : ''} en total`
                        : 'Aún no hay registros de progreso'}
                    </Paragraph>
                  </div>
                  <Progress 
                    type="circle" 
                    percent={progresoGeneral} 
                    size={80}
                    strokeColor={{ '0%': PALETTE.accent, '100%': PALETTE.primary }}
                    trailColor="#E2E8F0"
                    format={(pct) => `${pct}%`}
                  />
                </div>

                <Timeline
                  mode="left"
                  items={
                    progreso.length > 0 
                      ? progreso.map((item: any) => ({
                          color: getColorPorEstado(item.estadoEmocional),
                          dot: <span style={{ fontSize: 20 }}>{getEmojiPorEstado(item.estadoEmocional)}</span>,
                          children: (
                            <div style={{ paddingBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <Tag color={getColorPorEstado(item.estadoEmocional)} style={{ borderRadius: 12, fontWeight: 600 }}>
                                  {getEmojiPorEstado(item.estadoEmocional)} {item.estadoEmocional || 'Sin estado'}
                                </Tag>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {formatearFecha(item.fecha || item.createdAt)}
                                </Text>
                              </div>
                              <Paragraph style={{ margin: '8px 0 0 0', color: '#475569', fontSize: 14 }}>
                                {item.avance || item.observaciones || 'Sin notas adicionales.'}
                              </Paragraph>
                            </div>
                          ),
                        }))
                      : [
                          {
                            color: PALETTE.accent,
                            children: (
                              <div>
                                <Text strong style={{ color: '#1E293B' }}>Bienvenido a tu espacio de progreso</Text>
                                <Paragraph type="secondary" style={{ margin: '4px 0 0 0', fontSize: 13 }}>
                                  Tu historial de evolución emocional aparecerá aquí a medida que registres tus sesiones y estados de ánimo.
                                </Paragraph>
                              </div>
                            ),
                          }
                        ]
                  }
                />
              </Card>
            ),
          },
          {
            key: '4',
            label: (<span><FileTextOutlined /> Encuestas</span>),
            children: (
              <Card bordered={false} style={styles.card}>
                <Title level={4} style={{ margin: 0, color: PALETTE.primary }}>
                  <BookOutlined style={{ marginRight: 8 }} />
                  Tus evaluaciones y recomendaciones
                </Title>
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  Revisa las pautas y recomendaciones asignadas por tu especialista para medir tu evolución.
                </Paragraph>
                
                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {recomendaciones.length > 0 ? (
                    recomendaciones.map((rec: any, index: number) => (
                      <div key={index} style={styles.recomendacionItem}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                          <div style={{ background: `${PALETTE.accent}1a`, borderRadius: 12, padding: '10px', fontSize: 20 }}>
                            <ExperimentOutlined style={{ color: PALETTE.accent }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ color: '#1E293B', fontSize: 15, display: 'block' }}>
                              {rec.titulo || 'Recomendación clínica'}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
                              {rec.descripcion || 'Sin descripción detallada'}
                            </Text>
                            {rec.fechaAsignacion && (
                              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                Asignada: {formatearFecha(rec.fechaAsignacion)}
                              </Text>
                            )}
                          </div>
                          <Button 
                            type="primary" 
                            style={{ background: PALETTE.primary, border: 'none', borderRadius: 10 }}
                            icon={<RightCircleOutlined />}
                          >
                            Ver
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={styles.recomendacionItem}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ background: `${PALETTE.accent}1a`, borderRadius: 12, padding: '10px', fontSize: 20 }}>
                          <BookOutlined style={{ color: PALETTE.accent }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ color: '#1E293B', fontSize: 15, display: 'block' }}>
                            Test de Bienestar General
                          </Text>
                          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
                            Evalúa tu estado de ánimo y bienestar emocional — Pendiente
                          </Text>
                        </div>
                        <Button 
                          type="primary" 
                          style={{ background: PALETTE.primary, border: 'none', borderRadius: 10 }}
                          icon={<RightCircleOutlined />}
                        >
                          Comenzar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ),
          },
          {
            key: '5',
            label: (<span><UserOutlined /> Perfil</span>),
            children: (
              <Row justify="center">
                <Col xs={24} md={12} lg={10}>
                  <Card bordered={false} style={styles.card}>
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                      <Avatar 
                        size={88} 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: PALETTE.primary, marginBottom: 12 }}
                        src={pacienteData?.fotoUrl || null}
                      />
                      <Title level={4} style={{ margin: 0, color: '#1E293B' }}>
                        {nombre} {apellido}
                      </Title>
                      <Text type="secondary">Actualiza tu información de contacto</Text>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                          Nombre
                        </Text>
                        <Input 
                          value={nombre} 
                          onChange={(e) => setNombre(e.target.value)} 
                          style={{ borderRadius: 10, padding: '8px 12px' }}
                          prefix={<UserOutlined style={{ color: PALETTE.textMuted }} />}
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                          Apellido
                        </Text>
                        <Input 
                          value={apellido} 
                          onChange={(e) => setApellido(e.target.value)} 
                          style={{ borderRadius: 10, padding: '8px 12px' }}
                          prefix={<UserOutlined style={{ color: PALETTE.textMuted }} />}
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                          Teléfono de contacto / Emergencia
                        </Text>
                        <Input 
                          value={telefono} 
                          onChange={(e) => setTelefono(e.target.value)} 
                          style={{ borderRadius: 10, padding: '8px 12px' }}
                          prefix={<PhoneOutlined style={{ color: PALETTE.textMuted }} />}
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                          Correo electrónico
                        </Text>
                        <Input 
                          value={pacienteData?.usuario?.email || ''} 
                          disabled 
                          style={{ borderRadius: 10, padding: '8px 12px' }}
                          prefix={<MailOutlined style={{ color: PALETTE.textMuted }} />}
                        />
                      </div>
                      <Button 
                        type="primary" 
                        onClick={handleUpdateProfile}
                        loading={guardandoPerfil}
                        icon={<SaveOutlined />}
                        style={{ 
                          background: PALETTE.primary, 
                          border: 'none',
                          borderRadius: 10, 
                          marginTop: 8, 
                          height: 44, 
                          fontWeight: 600,
                          fontSize: 15
                        }}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />

      {/* ═══════════════ MODAL: BUSCAR PSICÓLOGOS ═══════════════ */}
      <Modal
        title={
          <Space>
            <SearchOutlined style={{ color: PALETTE.primary }} />
            <span style={{ color: PALETTE.primaryDark, fontWeight: 700 }}>Buscar psicólogos disponibles</span>
          </Space>
        }
        open={modalPsicologosVisible}
        onCancel={() => setModalPsicologosVisible(false)}
        footer={null}
        width={680}
        destroyOnClose
      >
        {cargandoPsicologos ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <Paragraph type="secondary" style={{ marginTop: 16 }}>Cargando psicólogos...</Paragraph>
          </div>
        ) : psicologosDisponibles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <TeamOutlined style={{ fontSize: 48, color: PALETTE.border }} />
            <Title level={4} style={{ color: PALETTE.textMuted, marginTop: 16 }}>
              No hay psicólogos disponibles
            </Title>
            <Paragraph type="secondary">
              Por el momento no hay profesionales registrados en la plataforma. Intenta más tarde.
            </Paragraph>
          </div>
        ) : (
          <List
            dataSource={psicologosDisponibles}
            renderItem={(psicologo: any) => {
              const nombrePsi = psicologo.usuario?.nombre || '';
              const apellidoPsi = psicologo.usuario?.apellido || '';
              const yaEsMiPsicologo = psicologoData?.id === psicologo.id;
              
              return (
                <List.Item
                  style={{ 
                    padding: '16px 0',
                    borderBottom: `1px solid ${PALETTE.border}`,
                    opacity: yaEsMiPsicologo ? 0.6 : 1
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={56} 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nombrePsi}`}
                        style={{ border: `2px solid ${PALETTE.accent}` }}
                      />
                    }
                    title={
                      <Text strong style={{ color: '#1E293B', fontSize: 15 }}>
                        {nombrePsi} {apellidoPsi}
                      </Text>
                    }
                    description={
                      <div style={{ marginTop: 4 }}>
                        <Tag color="processing" style={{ borderRadius: 8, fontSize: 11 }}>
                          {psicologo.especialidad || 'Psicología Clínica'}
                        </Tag>
                        <div style={{ marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          {psicologo.usuario?.email && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <MailOutlined style={{ marginRight: 4 }} />
                              {psicologo.usuario.email}
                            </Text>
                          )}
                          {psicologo.telefono && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <PhoneOutlined style={{ marginRight: 4 }} />
                              {psicologo.telefono}
                            </Text>
                          )}
                          {psicologo.licenciaProfesional && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <SafetyOutlined style={{ marginRight: 4 }} />
                              Lic. {psicologo.licenciaProfesional}
                            </Text>
                          )}
                        </div>
                      </div>
                    }
                  />
                  <div>
                    {yaEsMiPsicologo ? (
                      <Tag color="success" style={{ borderRadius: 10 }}>Asignado</Tag>
                    ) : (
                      <Button 
                        type="primary"
                        icon={<PlusOutlined />}
                        loading={solicitandoPsicologo}
                        onClick={() => solicitarPsicologo(psicologo)}
                        style={{ background: PALETTE.primary, border: 'none', borderRadius: 10 }}
                      >
                        Solicitar
                      </Button>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        )}
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
    minHeight: '100%',
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
    margin: '8px 0 0 0',
    maxWidth: 500,
  },
  heroStat: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 18,
    padding: '18px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 180,
  },
  heroStatValue: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 32,
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
  card: {
    borderRadius: 20,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
    border: `1px solid ${PALETTE.border}`,
    padding: '4px',
  },
  cardInspiracional: {
    borderRadius: 20,
    background: `linear-gradient(135deg, ${PALETTE.primary} 0%, ${PALETTE.primaryDark} 100%)`,
    color: '#fff',
    boxShadow: '0 8px 24px rgba(18, 65, 74, 0.25)',
    padding: '4px',
  },
  progresoItem: {
    background: PALETTE.bg,
    borderRadius: 14,
    padding: '14px 16px',
    border: `1px solid ${PALETTE.border}`,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    background: PALETTE.bg,
    borderRadius: 10,
  },
  cardChat: {
    borderRadius: 20,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
    border: `1px solid ${PALETTE.border}`,
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '16px 20px',
    borderBottom: `1px solid ${PALETTE.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#FAFAFA',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    background: '#FFFFFF',
  },
  chatBubble: {
    padding: '12px 16px',
    borderRadius: 16,
    maxWidth: '80%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  chatInput: {
    padding: '12px 16px',
    borderTop: `1px solid ${PALETTE.border}`,
    display: 'flex',
    gap: 8,
    background: '#FAFAFA',
  },
  recomendacionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    background: PALETTE.bg,
    borderRadius: 16,
    border: `1px solid ${PALETTE.border}`,
  },
};