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
      <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
        <Container fluid>
          <Navbar.Brand href="#home">TEDI</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* Espaço para navegação adicional se necessário */}
            </Nav>
            <Nav>
              <Nav.Item className="d-flex align-items-center text-light me-3">
                {user ? `Olá, ${user.nome}` : "Usuário não logado"}
              </Nav.Item>
              <NavDropdown
                title={<i className="bi bi-house"></i>}
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item onClick={handleEditUser}>
                  Editar Usuário
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="flex-grow-1">
        <Outlet />
      </Container>
      <footer className="bg-dark text-light text-center py-3 mt-auto">
        Footer
      </footer>
    </div>
  );
}

