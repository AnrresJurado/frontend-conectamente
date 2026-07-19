import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import Dashboard from '../pages/admin/Dashboard';
import Pacientes from '../pages/admin/Pacientes';
import Psicologos from '../pages/admin/Psicologos'; 
import Citas from '../pages/admin/Citas'; 
import Agenda from '../pages/admin/Agenda'; 
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

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* --- RUTAS PÚBLICAS --- */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/registro" element={<Register />} /> {/* Mantiene soporte para la ruta en español */}
      <Route path="/profesionales" element={<Profesionales />} />
      <Route path="/profesionales/:id" element={<ProfesionalDetalle />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/bienestar" element={<Bienestar />} />
      <Route path="/unete-psicologo" element={<UnetePsicologo />} />
      <Route path="/terapias-online" element={<TerapiasOnline />} />  
      <Route path="/grupos-apoyo" element={<GruposApoyo />} />
      <Route path="/servicios" element={<Servicios />} /> 
      

      

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
        </Route>
      </Route>

      {/* --- RUTAS PRIVADAS EXCLUSIVAS DE ADMINISTRACIÓN --- */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/psicologos" element={<Psicologos />} />
        </Route>
      </Route>

      {/* Redirección por defecto si entran a una ruta inexistente */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;