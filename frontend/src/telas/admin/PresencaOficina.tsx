import { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { get, patch } from '../../services/WebService';
import { Oficina } from '../../types/Oficina';
import { successAlert } from '../../utils/Functions';

interface UsuarioOficina {
  id: string;
  usuario_id: string;
  nome: string;
  email: string;
  perfil: string;
  presente: boolean;
  ativo: boolean;
}

export default function PresencaOficina() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [oficina, setOficina] = useState<Oficina | null>(null);
  const [voluntarios, setVoluntarios] = useState<UsuarioOficina[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOficina(id);
      fetchVoluntarios(id);
    }
  }, [id]);

  async function fetchOficina(oficinaId: string) {
    try {
      const response = await get(`/oficinas/${oficinaId}`);
      const dbOficina = response;
      let oficina: Oficina = {
        id: dbOficina.id,
        titulo: dbOficina.titulo,
        tema: dbOficina.tema || 'Geral',
        descricao: dbOficina.descricao || '',
        dataInicio: dbOficina.dataInicio ? dbOficina.dataInicio.split('T')[0] : '',
        dataFim: dbOficina.dataFim ? dbOficina.dataFim.split('T')[0] : '',
        local: dbOficina.local || 'Local a definir',
        vagas: dbOficina.vagas || 30,
        numeroParticipantes: dbOficina.numeroParticipantes || 0,
        numeroVoluntarios: dbOficina.numeroVoluntarios || 0,
        instrutor: dbOficina.instrutor || 'Instrutor TEDI',
        status: dbOficina.status || 'ATIVA'
      }

      setOficina(oficina);
    } catch (error) {
      console.error('Erro ao buscar oficina:', error);
    }
  };

  async function fetchVoluntarios(oficinaId: string) {
    try {
      setLoading(true);
      const response = await get(`/oficinas/${oficinaId}/voluntarios`);
      console.log(response)
      setVoluntarios(response);
    } catch (error) {
      console.error('Erro ao buscar voluntários:', error);
      alert('Erro ao carregar lista de voluntários');
    } finally {
      setLoading(false);
    }
  };


  const handlePresenca = async (voluntario: UsuarioOficina) => {
    if (!window.confirm(`Registrar presença para ${voluntario.nome}?`)) {
      return;
    }

    try {
      await patch(`/usuario-oficinas/${voluntario.id}/presenca`, {});
      successAlert('Presença registrada com sucesso!');
      if (id) {
        fetchVoluntarios(id);
      }
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      alert('Erro ao registrar presença');
    }
  };

  const handleFalta = async (voluntario: UsuarioOficina) => {
    if (!window.confirm(`Registrar falta para ${voluntario.nome}?`)) {
      return;
    }

    try {
      await patch(`/usuario-oficinas/${voluntario.id}/falta`, {});
      successAlert('Falta registrada com sucesso!');
      if (id) {
        fetchVoluntarios(id);
      }
    } catch (error) {
      console.error('Erro ao registrar falta:', error);
      alert('Erro ao registrar falta');
    }
  };

  const handleReativar = async (voluntario: UsuarioOficina) => {
    if (!window.confirm(`Reativar ${voluntario.nome} nesta oficina?`)) {
      return;
    }

    try {
      await patch(`/usuario-oficinas/${voluntario.id}/reativar`, {});
      successAlert('Voluntário reativado!');
      if (id) {
        fetchVoluntarios(id);
      }
    } catch (error) {
      console.error('Erro ao reativar:', error);
      alert('Erro ao reativar voluntário');
    }
  };

  const handleDesvincular = async (voluntario: UsuarioOficina) => {
    if (!window.confirm(`Tem certeza que deseja desvincular ${voluntario.nome}?`)) {
      return;
    }

    try {
      await patch(`/usuario-oficinas/${voluntario.id}/desvincular`, {});
      successAlert('Voluntário desvinculado!');
      if (id) {
        fetchVoluntarios(id);
      }
    } catch (error) {
      console.error('Erro ao desvincular:', error);
      alert('Erro ao desvincular voluntário');
    }
  };

  if (loading && !oficina) {
    return (
      <Container className="py-4">
        <Alert variant="info">Carregando...</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="presenca-oficina py-4">
      <Row className="mb-4">
        <Col>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/dashboard')}
            className="mb-3"
          >
            ← Voltar
          </Button>
          {oficina && (
            <div>
              <h1>{oficina.titulo}</h1>
              <p className="text-muted">
                <strong>Data:</strong> {oficina.dataInicio} a {oficina.dataFim} |
                <strong> Local:</strong> {oficina.local} |
                <strong> Instrutor:</strong> {oficina.instrutor}
              </p>
            </div>
          )}
        </Col>
      </Row>

      {voluntarios.length === 0 ? (
        <Alert variant="info">Nenhum voluntário inscrito nesta oficina.</Alert>
      ) : (
        <Row className="mb-4">
          <Col>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Ativo</th>
                    <th>Presente</th>
                  </tr>
                </thead>
                <tbody>
                  {voluntarios.map(voluntario => (
                    <tr key={voluntario.id}>
                      <td>{voluntario.nome}</td>
                      <td>{voluntario.email}</td>
                      <td>
                        {voluntario.ativo ? (
                          <span className="badge bg-success">Ativo</span>
                        ) : (
                          <span className="badge bg-danger">Inativo</span>
                        )}
                      </td>
                      <td>
                        {voluntario.presente ? (
                          <span className="badge bg-success">Presente</span>
                        ) : (
                          <span className="badge bg-danger">Faltante</span>
                        )}
                      </td>
                      <td>
                        {voluntario.ativo ? (
                          <div className="btn-group btn-group-sm" role="group">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handlePresenca(voluntario)}
                              title="Marcar presença"
                            >
                              ✓
                            </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleFalta(voluntario)}
                              title="Marcar falta">
                              ✗
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDesvincular(voluntario)}
                              title="Desvincular">
                              ⊗
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleReativar(voluntario)}
                            title="Reativar"
                          >
                            Reativar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      )}

    </Container>
  );
}
