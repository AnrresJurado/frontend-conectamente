// Tests psicométricos predefinidos (hardcodeados)
// No se pueden crear nuevos tests, solo estos 2

export type TipoTest = 'TENDENCIAS_PERSONALES' | 'BIENESTAR_ACTUAL';

export interface PreguntaTest {
  id: string;
  texto: string;
  tipo: 'OPCION_MULTIPLE' | 'ESCALA';
  opciones?: { valor: number; label: string }[];
  dimension?: string;
  indicador?: string;
}

export interface Intento {
  fecha: string;
  respuestas: Record<string, any>;
  puntajeTotal: number;
  diagnostico: string;
  desglose: Record<string, any>;
  alertaCritica?: boolean;
}

export interface TestConfig {
  id: TipoTest;
  nombre: string;
  instrucciones: string;
  preguntas: PreguntaTest[];
  puntajeMaximo: number;
  calcularDiagnostico: (puntaje: number) => string;
  interpretarDesglose: (respuestas: Record<string, any>) => Record<string, any>;
}

// TEST 1: Cuestionario de Tendencias Personales
export const TEST_TENDENCIAS: TestConfig = {
  id: 'TENDENCIAS_PERSONALES',
  nombre: 'Cuestionario de Tendencias Personales',
  instrucciones: 'Responde con total sinceridad seleccionando la opción que mejor se adapte a tu forma de ser habitual. No hay respuestas correctas o incorrectas.',
  preguntas: [
    {
      id: 'p1',
      texto: 'Prefiero integrarme en grupos grandes para resolver problemas en lugar de trabajar en solitario.',
      tipo: 'OPCION_MULTIPLE',
      opciones: [
        { valor: 2, label: 'Verdadero / Sí' },
        { valor: 1, label: 'Término medio / No estoy seguro' },
        { valor: 0, label: 'Falso / No' },
      ],
      dimension: 'Sociabilidad',
    },
    {
      id: 'p2',
      texto: 'Cuando las cosas se salen de control o hay mucha presión, mantengo la calma con facilidad.',
      tipo: 'OPCION_MULTIPLE',
      opciones: [
        { valor: 2, label: 'Verdadero / Sí' },
        { valor: 1, label: 'Término medio' },
        { valor: 0, label: 'Falso / No' },
      ],
      dimension: 'Estabilidad emocional',
    },
    {
      id: 'p3',
      texto: 'Me cuesta mucho delegar tareas porque temo que los demás no las hagan con el cuidado necesario.',
      tipo: 'OPCION_MULTIPLE',
      opciones: [
        { valor: 2, label: 'Verdadero / Sí' },
        { valor: 1, label: 'Término medio' },
        { valor: 0, label: 'Falso / No' },
      ],
      dimension: 'Delegación',
    },
    {
      id: 'p4',
      texto: 'Frecuentemente me encuentro dándole vueltas a mis errores del pasado o preocupándome por el futuro.',
      tipo: 'OPCION_MULTIPLE',
      opciones: [
        { valor: 2, label: 'Verdadero / Sí' },
        { valor: 1, label: 'Término medio' },
        { valor: 0, label: 'Falso / No' },
      ],
      dimension: 'Rumiación',
    },
    {
      id: 'p5',
      texto: 'Prefiero seguir las normas y métodos establecidos antes que experimentar con formas nuevas de hacer las cosas.',
      tipo: 'OPCION_MULTIPLE',
      opciones: [
        { valor: 2, label: 'Verdadero / Sí' },
        { valor: 1, label: 'Término medio' },
        { valor: 0, label: 'Falso / No' },
      ],
      dimension: 'Flexibilidad',
    },
  ],
  puntajeMaximo: 10,
  calcularDiagnostico: (puntaje: number) => {
    if (puntaje <= 3) return 'Tendencia baja';
    if (puntaje <= 6) return 'Tendencia moderada';
    return 'Tendencia alta';
  },
  interpretarDesglose: (respuestas: Record<string, any>) => {
    const dimensiones = ['Sociabilidad', 'Estabilidad emocional', 'Delegación', 'Rumiación', 'Flexibilidad'];
    const desglose: Record<string, any> = {};
    dimensiones.forEach((dim, index) => {
      const valor = respuestas[`p${index + 1}`] || 0;
      let nivel = 'Baja';
      if (valor === 2) nivel = 'Alta';
      else if (valor === 1) nivel = 'Moderada';
      desglose[dim] = { valor, nivel };
    });
    return desglose;
  },
};

// TEST 2: Inventario de Bienestar Actual
export const TEST_BIENESTAR: TestConfig = {
  id: 'BIENESTAR_ACTUAL',
  nombre: 'Inventario de Bienestar Actual',
  instrucciones: 'Selecciona qué tanto te han afectado o molestado los siguientes síntomas durante las últimas dos semanas.',
  preguntas: [
    {
      id: 'p1',
      texto: 'Sentir un miedo repentino, taquicardia o pánico sin una razón clara.',
      tipo: 'ESCALA',
      indicador: 'Síntomas ansiosos',
    },
    {
      id: 'p2',
      texto: 'Sentimientos de inutilidad, tristeza profunda o falta de energía para empezar el día.',
      tipo: 'ESCALA',
      indicador: 'Ánimo depresivo',
    },
    {
      id: 'p3',
      texto: 'Sentir la necesidad de revisar las cosas una y otra vez (como cerraduras o tareas) debido a dudas constantes.',
      tipo: 'ESCALA',
      indicador: 'Obsesión-Compulsión',
    },
    {
      id: 'p4',
      texto: 'Sentirse bloqueado o con dificultades para tomar decisiones sencillas.',
      tipo: 'ESCALA',
      indicador: 'Bloqueo decisional',
    },
    {
      id: 'p5',
      texto: 'Ideas o pensamientos recurrentes sobre el fin de la vida o hacerse daño. (Alerta Crítica)',
      tipo: 'ESCALA',
      indicador: 'Ideación suicida',
    },
  ],
  puntajeMaximo: 20,
  calcularDiagnostico: (puntaje: number) => {
    if (puntaje <= 4) return 'Bienestar normal';
    if (puntaje <= 9) return 'Leve afectación';
    if (puntaje <= 14) return 'Afectación moderada';
    return 'Afectación alta';
  },
  interpretarDesglose: (respuestas: Record<string, any>) => {
    const indicadores = ['Síntomas ansiosos', 'Ánimo depresivo', 'Obsesión-Compulsión', 'Bloqueo decisional', 'Ideación suicida'];
    const desglose: Record<string, any> = {};
    indicadores.forEach((ind, index) => {
      const valor = respuestas[`p${index + 1}`] || 0;
      let nivel = 'Normal';
      if (valor >= 3) nivel = 'Severo';
      else if (valor >= 2) nivel = 'Moderado';
      else if (valor >= 1) nivel = 'Leve';
      desglose[ind] = { valor, nivel };
    });
    return desglose;
  },
};

export const TESTS_PREDEFINIDOS: TestConfig[] = [TEST_TENDENCIAS, TEST_BIENESTAR];

export const getTestById = (id: TipoTest): TestConfig | undefined => {
  return TESTS_PREDEFINIDOS.find(t => t.id === id);
};