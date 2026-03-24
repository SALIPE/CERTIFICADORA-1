import { ChangeEvent, FormEvent, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { errorAlert, utf8ToB64 } from "../utils/Functions";

export default function LoginPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    username: false,
    password: false,
  });

  function change(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setErrors((prev) => ({
      ...prev,
      [name]: false,
    }));

    if (name === "username") {
      setUsername(value.toLowerCase());
    } else {
      setPassword(value);
    }
  }

  function validateForm() {
    const newErrors = {
      username: username.trim() === "",
      password: !resetPassword && password.trim() === "",
    };

    setErrors(newErrors);

    return !newErrors.username && !newErrors.password;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) return;

    await login();
  }

  async function login() {
    try {
      setIsLogin(true);

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Context: "null",
          Authorization: "Basic " + utf8ToB64(username + ":" + password),
        },
      };

      // Simulação de login
      // Substitua pela chamada real da sua API:
      // const resp = await fetch(baseURL + "/users/login", requestOptions);
      // const user = await handleResponse(resp);

      console.log("Request:", requestOptions);

      // Exemplo temporário:
      navigate("/admin/dashboard");
    } catch (error) {
      logout();
    } finally {
      setIsLogin(false);
    }
  }

  function logout() {
    setIsLogin(false);
    errorAlert("Usuário ou senha inválidos!", hideAlert);
    sessionStorage.removeItem("user");
  }

  function hideAlert() {
    return null;
  }

  async function handleResponse(response: Response | null) {
    if (response == null || !response.ok) {
      logout();
      return false;
    }

    return response.json();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5}>
            <Card
              className="shadow border-0"
              style={{
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <Card.Body style={{ padding: "2rem" }}>
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-2">
                    {resetPassword ? "Recuperar Senha" : "Bem-vindo"}
                  </h2>
                  <p className="text-muted mb-0">
                    {resetPassword
                      ? "Informe seu e-mail para recuperação"
                      : "Faça login para acessar o sistema"}
                  </p>
                </div>

                <Form onSubmit={onSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                      type="email"
                      name="username"
                      placeholder="Digite seu e-mail"
                      value={username}
                      onChange={change}
                      isInvalid={errors.username}
                    />
                    <Form.Control.Feedback type="invalid">
                      Informe seu e-mail.
                    </Form.Control.Feedback>
                  </Form.Group>

                  {!resetPassword && (
                    <Form.Group className="mb-3">
                      <Form.Label>Senha</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={change}
                        autoComplete="off"
                        isInvalid={errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        Informe sua senha.
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}

                  <div className="d-grid mb-3">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isLogin}
                      style={{ borderRadius: "10px", padding: "10px" }}
                    >
                      {isLogin ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Entrando...
                        </>
                      ) : resetPassword ? (
                        "Enviar recuperação"
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    {!resetPassword ? (
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none"
                        onClick={() => setResetPassword(true)}
                      >
                        Esqueci minha senha
                      </Button>
                    ) : (
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none"
                        onClick={() => setResetPassword(false)}
                      >
                        Voltar para o login
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}