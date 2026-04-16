import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './assets/css/Index.css';
import ProtectedRoute from './components/ProtectedRoute';
import { UserProvider } from './contexts/UserContext';
import AdminLayout from './layouts/Admin';
import VoluntarioLayout from './layouts/VoluntarioLayout';
import CadastroVoluntario from './telas/CadastroVoluntario';
import LoginPage from './telas/Login';
import AdminDashboard from './telas/admin/AdminDashboard';
import Eventos from './telas/voluntario/Eventos';

export const MySwal = withReactContent(Swal);

export default function App() {
  document.title = 'TEDI';

  return (
    <HashRouter>
      <UserProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroVoluntario />} />

          <Route
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route
            element={
              <ProtectedRoute requiredRole="VOLUNTARIO">
                <VoluntarioLayout />
              </ProtectedRoute>
            }>
            <Route path="/voluntario/eventos" element={<Eventos />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </UserProvider>
    </HashRouter>
  );
}



