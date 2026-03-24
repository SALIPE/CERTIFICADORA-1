import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './assets/css/Index.css';
import AdminLayout from "./layouts/Admin";
import LoginPage from "./telas/Login";
import AdminDashboard from "./telas/admin/AdminDashboard";

export const MySwal = withReactContent(Swal);

export default function App() {

  document.title = 'TEDI';

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
};


