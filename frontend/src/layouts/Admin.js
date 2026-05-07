import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function AdminLayout() {
  const { user, logout } = useUser()
  const navigate = useNavigate();

  const handleEditUser = () => {
    navigate('/admin/usuarios');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      
      {/* HEADER INICIO*/}
      <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm py-3">
        <Container fluid>
          <Navbar.Brand href="#home" className="fw-bold fs-3 text-primary">
            TEDI <span className="text-light fs-6 fw-normal ms-2">| Painel Administrativo</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* Espaço para navegação adicional */}
            </Nav>
            <Nav className="align-items-center">
              <Nav.Item className="text-light me-4 fw-medium">
                {user ? `Olá, ${user.nome}` : "Usuário não logado"}
              </Nav.Item>
              <NavDropdown
                title={<span className="btn btn-outline-light btn-sm">Menu Admin</span>}
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item onClick={handleEditUser}>
                  <i className="bi bi-person-gear me-2"></i> Editar Perfil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i> Sair do Sistema
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* HEADER FIM */}

      <Container fluid className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>
        <Outlet />
      </Container>

      {/* FOOTER INICIO */}
      <footer className="bg-dark text-light py-4 mt-auto border-top border-primary border-3">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <div className="mb-3 mb-md-0">
              <h5 className="text-primary fw-bold mb-0">TEDI</h5>
              <small className="text-muted">Transformando a Educação de forma Dinâmica e Inclusiva</small>
            </div>
            
            <div className="text-center text-md-end">
              <p className="mb-0 small text-muted">
                &copy; {new Date().getFullYear()} TEDI. Todos os direitos reservados.
              </p>
              <p className="mb-0 small text-muted">
                Suporte: <a href="mailto:suporte@tedi.com" className="text-primary text-decoration-none">suporte@tedi.com</a>
              </p>
            </div>
          </div>
        </Container>
      </footer>
      {/* FOOTER FIM */}

    </div>
  );
}