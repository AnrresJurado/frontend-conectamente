import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import Dashboard from '../pages/admin/Dashboard';
import Analitica from '../pages/admin/Analitica';
import Pacientes from '../pages/admin/Pacientes';
import Psicologos from '../pages/admin/Psicologos';
import Citas from '../pages/admin/Citas';
import Agenda from '../pages/admin/Agenda';
import UsuariosAdmin from '../pages/admin/UsuariosAdmin';
import Progreso from '../pages/admin/Progreso';
import Encuestas from '../pages/admin/Encuestas';
import MiProgreso from '../pages/admin/MiProgreso';
import MisEncuestas from '../pages/admin/MisEncuestas';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import Home from '../pages/public/Home';
import Profesionales from '../pages/admin/Profesionales';
import ProfesionalDetalle from '../pages/admin/ProfesionalDetalle';
import Contacto from '../pages/public/Contacto';
import Bienestar from '../pages/public/Bienestar';
import UnetePsicologo from '../pages/public/UnetePsicologo';
import TerapiasOnline from '../pages/public/TerapiasOnline';
import GruposApoyo from '../pages/public/GruposApoyo';
import Servicios from '../pages/public/Servicios';
import Recursos from '../pages/public/Recursos';
import Recomendaciones from '../pages/admin/Recomendaciones';
import MisRecomendaciones from '../pages/paciente/MisRecomendaciones';
import TestsPsicometricos from '../pages/admin/TestsPsicometricos';
import MisTestsPsicometricos from '../pages/paciente/MisTestsPsicometricos';

// 🎯 Tus importaciones
import BuscarPsicologo from '../pages/public/BuscarPsicologo';
import BandejaSolicitudes from '../pages/admin/BandejaSolicitudes';
import SolicitudesPsicologos from '../pages/admin/SolicitudesPsicologos'; // 👈 🎯 1. IMPORTAR VISTA DE SOLICITUDES DE PSICÓLOGOS

// 💬 Importaciones unificadas de tu compañera
import Chats from '../pages/admin/Chats';
import PacienteLayout from '../layouts/PacienteLayout';
import { MiEspacio } from '../pages/admin/MiEspacio';
import RegisterPsicologo from '../pages/public/RegisterPsicologo';
import MiPerfil from '../pages/admin/MiPerfil';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* --- RUTAS PÚBLICAS --- */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/profesionales" element={<Profesionales />} />
      <Route path="/profesionales/:id" element={<ProfesionalDetalle />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/bienestar" element={<Bienestar />} />
      <Route path="/unete-psicologo" element={<UnetePsicologo />} />
      <Route path="/terapias-online" element={<TerapiasOnline />} />  
      <Route path="/grupos-apoyo" element={<GruposApoyo />} />
      <Route path="/servicios" element={<Servicios />} />
      <Route path="/recursos" element={<Recursos />} />
      
      {/* Rutas de registro específicas para psicólogos */}
      <Route path="/register/psicologo" element={<RegisterPsicologo />} />
      <Route path="/registro-psicologo" element={<RegisterPsicologo />} />
      
      {/* --- RUTA EXCLUSIVA PARA PACIENTE --- */}
      <Route element={<ProtectedRoute allowedRoles={['PACIENTE']} />}>
        <Route element={<PacienteLayout />}>
          <Route path="/mi-espacio" element={<MiEspacio />} />
          <Route path="/mi-progreso" element={<MiProgreso />} />
          <Route path="/mis-encuestas" element={<MisEncuestas />} />
          <Route path="/mis-tests-psicometricos" element={<MisTestsPsicometricos />} />
          <Route path="/buscar-psicologo" element={<BuscarPsicologo />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/mis-recomendaciones" element={<MisRecomendaciones />} />
          <Route path="/mi-perfil" element={<MiPerfil />} />
        </Route>
      </Route>

      {/* --- RUTAS PRIVADAS COMPARTIDAS --- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      {/* --- RUTAS PRIVADAS COMPARTIDAS (ADMIN / PSICOLOGO) --- */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PSICOLOGO']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/pacientes" element={<Pacientes />} />
          <Route path="/dashboard/citas" element={<Citas />} />
          <Route path="/dashboard/agenda" element={<Agenda />} />
          <Route path="/dashboard/analitica" element={<Analitica />} />
          <Route path="/dashboard/chats" element={<Chats />} />
          <Route path="/dashboard/progreso" element={<Progreso />} />
          <Route path="/dashboard/encuestas" element={<Encuestas />} />
          <Route path="/dashboard/tests-psicometricos" element={<TestsPsicometricos />} />
          <Route path="/dashboard/solicitudes" element={<BandejaSolicitudes />} />
          <Route path="/dashboard/recomendaciones" element={<Recomendaciones />} />
        </Route>
      </Route>
      
      {/* --- RUTAS PRIVADAS EXCLUSIVAS DE ADMINISTRACIÓN --- */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/psicologos" element={<Psicologos />} />
          <Route path="/dashboard/usuarios" element={<UsuariosAdmin />} />
          <Route path="/dashboard/solicitudes-psicologos" element={<SolicitudesPsicologos />} /> {/* 👈 🎯 2. RUTA REGISTRADA EXCLUSIVA PARA ADMIN */}
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;