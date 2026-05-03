import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
//import '../assets/css/Auth.css';
import { useUser } from '../contexts/UserContext';
import { errorAlert } from '../utils/Functions';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Email e senha são obrigatórios');
      }

      let userType = await login(email, password);

      if (userType == null) {
        errorAlert("Login Incorreto!", () => null)
      }
      else {
        // Redirecionar baseado no tipo de usuário
        if (userType === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/voluntario/eventos');
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="min-vh-100 d-flex align-items-center justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5}>
            <Card className="auth-card shadow-lg">
              <Card.Body className="p-5">
                <h2 className="text-center mb-2 auth-title">
                  TEDI
                </h2>
                <p className="text-center text-muted mb-4">
                  Sistema de Gerenciamento de Oficinas
                </p>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="seu@email.com"
                      className="form-control-custom"
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">
                      Senha
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Digite sua senha"
                      className="form-control-custom"
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 btn-auth mb-4"
                    disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </Form>

                <hr />

                <p className="text-center text-muted mb-2">
                  Não tem uma conta?
                </p>
                <Link to="/cadastro" className="d-block text-center mb-3">
                  <Button variant="outline-primary" className="w-100">
                    Cadastrar como Voluntário
                  </Button>
                </Link>

                <p className="text-center text-muted small mb-0">
                  Para acesso de administrador, contate o suporte
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
