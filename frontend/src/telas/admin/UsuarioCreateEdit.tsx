import { useEffect, useState } from 'react';
import { Button, Container, Form, Modal, Table } from 'react-bootstrap';
import { get, post, put } from '../../services/WebService';
import { User } from '../../types/User';
import { errorAlert, successAlert } from '../../utils/Functions';

export default function UsuarioCreateEdit() {

  const [usuariosList, setUsuariosList] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false);
  const [showModalNovaSenha, setShowModalNovaSenha] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    perfil: 'VOLUNTARIO',
  });
  const [resetFormData, setResetFormData] = useState({
    novaSenha: '',
    confirmarSenha: '',
  });
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  async function getUserList() {
    try {
      const response = await get("/usuarios")
      setUsuariosList(response.data)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  }

  useEffect(() => {
    getUserList()
  }, [])

  const handleCreateNew = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setFormData({
      nome: '',
      email: '',
      perfil: 'VOLUNTARIO',
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setIsEditing(true);
    setEditingUserId(user.id);
    setFormData({
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
    });
    setShowModal(true);
  };

  const handleResetPassword = (user: User) => {
    setEditingUserId(user.id);
    setShowModalNovaSenha(true);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetInputChange = (e: any) => {
    const { name, value } = e.target;
    setResetFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.nome.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (!formData.email.trim()) {
        throw new Error('Email é obrigatório');
      }

      if (isEditing && editingUserId) {
        // Editar usuário
        await put(`/usuarios/${editingUserId}`, formData);
        successAlert("Usuário atualizado com sucesso!");
      } else {
        // Criar novo usuário
        console.log(formData)
        await post("/usuarios", formData);
        successAlert("Usuário criado com sucesso!");
      }

      setShowModal(false);
      getUserList();
    } catch (error) {
      errorAlert(error instanceof Error ? error.message : 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!resetFormData.novaSenha.trim()) {
        throw new Error('Nova senha é obrigatória');
      }

      if (resetFormData.novaSenha !== resetFormData.confirmarSenha) {
        throw new Error('As senhas não coincidem');
      }

      if (editingUserId) {
        await post(`/usuarios/${editingUserId}/senha`, { novaSenha: resetFormData.novaSenha });
        successAlert("Senha resetada com sucesso!");
        setShowModalNovaSenha(false);
        setResetFormData({ novaSenha: '', confirmarSenha: '' });
      }
    } catch (error) {
      errorAlert(error instanceof Error ? error.message : 'Erro ao resetar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowModalNovaSenha(false);
    setResetFormData({ novaSenha: '', confirmarSenha: '' });
    setFormData({
      nome: '',
      email: '',
      perfil: 'VOLUNTARIO',
    });
  };

  return (
    <Container fluid className="admin-dashboard py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Gerenciar Usuários</h2>
        <Button variant="success" onClick={handleCreateNew} className="shadow-sm d-inline-flex align-items-center">
          <i className="bi bi-plus-lg me-2"></i> Criar Usuário
        </Button>
      </div>

      <div className="shadow-sm rounded overflow-hidden">
        <Table striped bordered hover responsive className="mb-0 bg-white">
          <thead className="table-dark">
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Ações</th>
              <th>Resetar Senha</th>
            </tr>
          </thead>
          <tbody>
            {usuariosList.map(user => (
              <tr key={user.id} className="align-middle">
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.perfil === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                    {user.perfil}
                  </span>
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(user)}
                    className="me-2 d-inline-flex align-items-center text-dark fw-medium">
                    <i className="bi bi-pencil-square me-1"></i> Editar
                  </Button>
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleResetPassword(user)}
                    className="d-inline-flex align-items-center">
                    <i className="bi bi-shield-lock me-1"></i> Resetar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* MODAL DO FORMULÁRIO */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-primary fw-bold">
            {isEditing ? <><i className="bi bi-person-gear me-2"></i>Editar Usuário</> : <><i className="bi bi-person-plus-fill me-2"></i>Criar Novo Usuário</>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Nome</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Nome completo"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Perfil</Form.Label>
              <Form.Select
                name="perfil"
                value={formData.perfil}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="VOLUNTARIO">Voluntário</option>
                <option value="ADMIN">Admin</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="flex-grow-1 shadow-sm d-inline-flex justify-content-center align-items-center"
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span> Salvando...</>
                ) : (
                  <><i className="bi bi-check-lg me-1"></i> {isEditing ? 'Atualizar' : 'Criar'}</>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                disabled={loading}
                className="flex-grow-1 shadow-sm"
              >
                Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL PARA RESET DA SENHA */}
      <Modal show={showModalNovaSenha} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-primary fw-bold">
            <i className="bi bi-key-fill me-2"></i> Resetar Senha
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleResetSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Nova Senha</Form.Label>
              <Form.Control
                type="password"
                name="novaSenha"
                value={resetFormData.novaSenha}
                onChange={handleResetInputChange}
                placeholder="Digite a nova senha"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Confirmar Nova Senha</Form.Label>
              <Form.Control
                type="password"
                name="confirmarSenha"
                value={resetFormData.confirmarSenha}
                onChange={handleResetInputChange}
                placeholder="Confirme a nova senha"
                disabled={loading}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="flex-grow-1 shadow-sm d-inline-flex justify-content-center align-items-center"
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span> Resetando...</>
                ) : (
                  <><i className="bi bi-check-lg me-1"></i> Resetar Senha</>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                disabled={loading}
                className="flex-grow-1 shadow-sm"
              >
                Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}