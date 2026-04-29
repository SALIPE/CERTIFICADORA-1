import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
//import '../assets/css/Auth.css';
import { useUser } from '../contexts/UserContext';
import { errorAlert, successAlert } from '../utils/Functions';

export default function CadastroVoluntario() {
  const navigate = useNavigate();
  const { register } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validações
      if (!formData.name.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (formData.name.trim().length < 3) {
        throw new Error('Nome deve ter pelo menos 3 caracteres');
      }

      if (!formData.email.trim()) {
        throw new Error('Email é obrigatório');
      }

      if (!formData.password) {
        throw new Error('Senha é obrigatória');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Senhas não conferem');
      }

      // Registrar
      const cadastrou = await register(formData.name, formData.email, formData.password);

      if (cadastrou) {
        successAlert("Cadastro concluído", () => navigate('/login'));
      } else {
        errorAlert("Erro ao se cadastrar, tente novamente mais tarde!")
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="min-vh-100 d-flex align-items-center justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5}>
            <Card className="auth-card shadow-lg">
              <Card.Body className="p-5">
                <h2 className="text-center mb-4 auth-title">
                  Cadastro de Voluntário
                </h2>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Nome Completo
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ex: João Silva"
                      className="form-control-custom"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className="form-control-custom"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Senha
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Mínimo 6 caracteres"
                      className="form-control-custom"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">
                      Confirme a Senha
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirme sua senha"
                      className="form-control-custom"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 btn-auth mb-3"
                    disabled={loading}
                  >
                    {loading ? 'Registrando...' : 'Cadastrar'}
                  </Button>
                </Form>

                <hr />

                <p className="text-center text-muted mb-0">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="auth-link">
                    Faça login
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
