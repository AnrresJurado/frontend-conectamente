# 🧠 ConectaMente - Frontend (React + TypeScript + Vite)

¡Hola equipo! Este repositorio contiene la base estructural para el frontend de nuestra plataforma de gestión integral. La arquitectura base ya está configurada utilizando **TypeScript nativo**, **Vite** como empaquetador y **Ant Design** para la biblioteca de componentes.

## 🚀 Cómo arrancar el proyecto localmente

1. Clonar el repositorio y entrar a la carpeta del proyecto.
2. Instalar todas las dependencias ya configuradas:
   ```bash
   npm install

   Crear un archivo .env en la raíz del proyecto con la URL de la API local de NestJS:
   VITE_API_URL=http://localhost:3000

   Levantar el entorno de desarrollo:
   npm run dev

    ```

🛠️ Lo que ya está construido y configurado
Para avanzar rápido y evitar conflictos en Git, se implementaron los siguientes módulos centrales:

    ```
    src/api/axiosConfig.ts: Cliente global de Axios. Configura e intercepta las peticiones inyectando el token JWT de forma automática e intercepta errores 401 para limpiar la sesión.

    src/contexts/AuthContext.tsx: Administrador global de estado de la sesión, persistencia con localStorage y métodos de login / logout.

    src/hooks/useAuth.ts: Hook seguro para consumir los datos del usuario y rol autenticado (ADMIN, PSICOLOGO, PACIENTE).

    src/routes/: Sistema de rutas centralizado con un componente <ProtectedRoute /> que maneja restricciones automáticas basadas en los roles que devuelve el Backend.

    ```

📋 Distribución de Frentes de Trabajo y Siguientes Pasos
Cada miembro del equipo debe trabajar en su respectivo frente creando sus ramas a partir de main.

🎨 Frente 1: Diseño de Interfaz, Layouts y Área Pública
Responsable: Anahí

Archivos asignados: src/layouts/DashboardLayout.tsx, src/pages/public/Home.tsx, src/pages/public/Login.tsx.

Desde dónde continuar:

     ```
    Login (Login.tsx): El esqueleto lógico ya está conectado con Axios y el Contexto. Falta pulir el diseño institucional de la tarjeta de Login utilizando estilos de Ant Design.

    Dashboard Layout (DashboardLayout.tsx): Darle estilos visuales al Sidebar (Sider), Navbar (Header) y Footer para que luzca estético.

    Home (Home.tsx): Diseñar la Landing Page pública usando cuadrículas (Row y Col) de Ant Design.

     ```

📊 Frente 2: Dashboard, Gráficos y Servicios API
Responsable: Antoni

Archivos asignados: src/pages/admin/Dashboard.tsx, nueva carpeta src/services/ (para métricas).

Desde dónde continuar:

     ```
    Crear los servicios de Axios para obtener las estadísticas del backend.

    Diseñar el panel en Dashboard.tsx agregando las tarjetas de resumen informativo.

    Implementar los dos gráficos interactivos con Recharts (ej. volumen de citas mensuales o cantidad de pacientes según especialidad) consumiendo datos reales.

     ```

🛡️ Frente 3: Arquitectura, CRUDs Administrativos y Validación
Responsable: Andrés

Archivos asignados: src/pages/admin/Pacientes.tsx, src/services/pacientesService.ts, src/types/index.ts.

Estado: Estructura de servicios CRUD conectada a la API de NestJS (/pacientes) y visualización de datos en una <Table> responsiva de Ant Design con control de accesos por roles terminada.

Nota: Recuerden no usar interfaces sueltas en las vistas; todo el tipado común debe centralizarse en src/types/.