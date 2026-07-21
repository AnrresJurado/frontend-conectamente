# ConectaMente - Frontend

Plataforma web de gestión integral desarrollada con React, TypeScript y Vite, diseñada para conectar pacientes, psicólogos y administradores de manera eficiente y segura.

---

## Integrantes del Equipo
* **Anahí** - Frente 1: Diseño de Interfaz, Layouts y Área Pública.
* **Antoni** - Frente 2: Dashboard, Gráficos y Servicios API.
* **Andrés** - Frente 3: Arquitectura, CRUDs Administrativos y Validación.

---

## Descripción Funcional
ConectaMente es un sistema modular de gestión clínica que permite:
* **Autenticación Segura:** Control de acceso basado en roles (**ADMIN**, **PSICOLOGO**, **PACIENTE**) mediante tokens JWT interceptados automáticamente por Axios.
* **Área Pública y Landing Page:** Página de bienvenida e interfaz de inicio de sesión.
* **Panel de Administración (Dashboard):** Visualización de métricas en tiempo real, estadísticas e indicadores clave mediante gráficos interactivos.
* **Gestión de Pacientes:** Módulo CRUD completo adaptado con tablas responsivas y tipado estricto.

---

## Tecnologías Utilizadas
* **Core:** React, TypeScript, Vite
* **Enrutamiento:** React Router (con rutas protegidas por roles)
* **Estilos y Componentes:** Ant Design (`antd`)
* **Gráficos:** Recharts
* **Cliente HTTP:** Axios

---

## Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local:

1. **Clonar el repositorio:**
   ```bash
   git clone <https://github.com/AnrresJurado/frontend-conectamente.git>
   cd conectamente-frontend