import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { get, post, put } from '../../services/WebService';
import { Oficina } from '../../types/Oficina';
import { successAlert } from '../../utils/Functions';

export default function AdminDashboard() {
  const [workshops, setWorkshops] = useState<Oficina[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'ATIVA' | 'INATIVA'>('ATIVA');
  const [formData, setFormData] = useState<Partial<Oficina>>({
    titulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    local: '',
    tema: 'Geral',
    instrutor: '',
    vagas: 30,
    numeroParticipantes: 0
  });


  useEffect(() => {
    fetchOficinas();
  }, []);

  const fetchOficinas = async () => {
    try {
      const response = await get("/oficinas")
      const oficinasDoBanco = response.map((dbOficina: any) => {
        const dataInicio = dbOficina.dataInicio || dbOficina.dataInicio;
        return {
          id: dbOficina.id,
          titulo: dbOficina.titulo,
          tema: dbOficina.tema || 'Geral',
          descricao: dbOficina.descricao || '',
          dataInicio: dataInicio ? dataInicio.split('T')[0] : '',
          dataFim: dbOficina.dataFim ? dbOficina.dataFim.split('T')[0] : '',
          local: dbOficina.local || 'Local a definir',
          numeroParticipantes: dbOficina.numeroParticipantes || 0,
          numeroVoluntarios: dbOficina.numeroVoluntarios || 0,
          vagas: dbOficina.vagas,
          instrutor: dbOficina.instrutor || 'Instrutor TEDI',
          status: dbOficina.status || 'ATIVA'
        };
      });

      setWorkshops(oficinasDoBanco);
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error);
    }
  };

  const handleShowModal = (workshop?: Oficina) => {
    if (workshop) {
      setEditingId(workshop.id);
      setFormData({
        titulo: workshop.titulo,
        descricao: workshop.descricao,
        dataInicio: workshop.dataInicio,
        dataFim: workshop.dataFim,
        local: workshop.local,
        tema: workshop.tema,
        instrutor: workshop.instrutor,
        vagas: workshop.vagas,
        numeroParticipantes: workshop.numeroParticipantes
      });
    } else {
      setEditingId(null);
      setFormData({
        titulo: '',
        descricao: '',
        dataInicio: '',
        dataFim: '',
        local: '',
        tema: 'Geral',
        instrutor: '',
        vagas: 30,
        numeroParticipantes: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveWorkshop = async () => {
    // 1. Validação básica
    if (!formData.titulo || !formData.descricao || !formData.dataInicio || !formData.dataFim) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      const dataInicio = new Date(formData.dataInicio + 'T08:00:00Z');
      const dataFim = new Date(formData.dataFim + 'T10:00:00Z');

      // 2. Montamos o "pacote" usando o que está no formData
      const payload = {
        titulo: formData.titulo,
        tema: formData.tema || 'Geral',
        descricao: formData.descricao,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
        local: formData.local,
        instrutor: formData.instrutor,
        vagas: formData.vagas,
        numeroParticipantes: Number(formData.numeroParticipantes)
      };

      if (editingId) {
        console.log(payload)
        await put(`/oficinas/${editingId}`, payload);
        successAlert("Oficina Editada com Sucesso!");
      } else {
        await post("/oficinas", payload);
        successAlert("Oficina Criada com Sucesso!");
      }

      handleCloseModal();
      fetchOficinas();

    } catch (error) {
      console.error('Erro ao salvar oficina:', error);
      alert('Erro ao salvar a oficina. Verifique o console e o terminal do Back-end.');
    }
  };

  const handleDeleteWorkshop = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar esta oficina?')) {
      try {

        await put(`/oficinas/${id}/desativar`);
        successAlert("Oficina Desativada!");

        // MUDA O STATUS EM VEZ DE DELETAR DA TELA
        setWorkshops(workshops.map(w => w.id === id ? { ...w, status: 'INATIVA' } : w));

      } catch (error) {
        console.error('Erro ao desativar oficina:', error);
        alert('Erro ao desativar. Verifique o console para mais detalhes.');
      }
    }
  };

  const handleActivateWorkshop = async (id: string) => {
    if (window.confirm('Tem certeza que deseja reativar esta oficina?')) {
      try {
        await put(`/oficinas/${id}/ativar`, {});
        successAlert("Oficina Reativada!");

        // MUDA O STATUS PARA ATIVA E ELA VOLTA PRA PRIMEIRA ABA
        setWorkshops(workshops.map(w => w.id === id ? { ...w, status: 'ATIVA' } : w));

      } catch (error) {
        console.error('Erro ao reativar oficina:', error);
        alert('Erro ao reativar. Verifique o console para mais detalhes.');
      }
    }
  };

  const getAvailableSpots = (workshop: Oficina) => {
    return workshop.vagas - workshop.numeroVoluntarios;
  };

  return (
    <Container fluid className="admin-dashboard py-4">
      <Row className="mb-4 align-items-center">
        <Col xs={12} md="auto" className="mb-3 mb-md-0">
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleShowModal()}
          >
            + Nova Oficina
          </Button>
        </Col>

        {/* NOSSOS NOVOS BOTÕES DE FILTRO */}
        <Col xs={12} md="auto">
          <ButtonGroup>
            <Button
              variant={filtroStatus === 'ATIVA' ? 'primary' : 'outline-primary'}
              onClick={() => setFiltroStatus('ATIVA')}
            >
              Oficinas Ativas
            </Button>
            <Button
              variant={filtroStatus === 'INATIVA' ? 'secondary' : 'outline-secondary'}
              onClick={() => setFiltroStatus('INATIVA')}
            >
              Oficinas Desativadas
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      <Row className="g-4">
        {workshops
          .filter(workshop => workshop.status === filtroStatus)
          .map(workshop => {
            const available = getAvailableSpots(workshop);
            const isFull = available === 0;
            return (
              <Col key={workshop.id} md={6} lg={4} className="mb-3">
                <Card className="workshop-card h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="mb-3">{workshop.titulo}</Card.Title>

                    <div className="workshop-info mb-3 flex-grow-1">
                      <p className="mb-2">
                        <strong>Descrição:</strong> {workshop.descricao}
                      </p>
                      <p className="mb-2">
                        <strong>Data Início:</strong> {workshop.dataInicio ? new Date(workshop.dataInicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}
                      </p>
                      <p className="mb-2">
                        <strong>Data Fim:</strong> {workshop.dataFim ? new Date(workshop.dataFim).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}
                      </p>
                      <p className="mb-2">
                        <strong>Local:</strong> {workshop.local}
                      </p>
                      <p className="mb-2">
                        <strong>Tema:</strong> {workshop.tema}
                      </p>
                      <p className="mb-2">
                        <strong>Instrutor:</strong> {workshop.instrutor}
                      </p>
                      <p className="mb-2">
                        <strong>Participantes:</strong> {workshop.numeroParticipantes}
                      </p>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">
                          <strong>Vagas:</strong> {available} disponível(is)
                        </span>
                        <span className="small text-muted">
                          {workshop.numeroVoluntarios}/{workshop.vagas}
                        </span>
                      </div>
                      <div className="progress">
                        <div
                          className={`progress-bar ${isFull ? 'bg-danger' : ''}`}
                          role="progressbar"
                          style={{
                            width: `${(workshop.numeroVoluntarios / workshop.vagas) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleShowModal(workshop)}
                        className="flex-grow-1"
                      >
                        Editar
                      </Button>

                      {workshop.status === 'ATIVA' ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteWorkshop(workshop.id)}
                          className="flex-grow-1"
                        >
                          Desativar
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleActivateWorkshop(workshop.id)}
                          className="flex-grow-1"
                        >
                          Ativar Oficina
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Editar Oficina' : 'Nova Oficina'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título da Oficina *</Form.Label>
              <Form.Control
                type="text"
                name="titulo"
                value={formData.titulo || ''}
                onChange={handleInputChange}
                placeholder="Ex: React Avançado"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descricao"
                value={formData.descricao || ''}
                onChange={handleInputChange}
                placeholder="Descreva a oficina"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tema</Form.Label>
              <Form.Control
                type="text"
                name="tema"
                value={formData.tema || 'Geral'}
                onChange={handleInputChange}
                placeholder="Ex: Desenvolvimento Web"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Início *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dataInicio"
                    value={formData.dataInicio || ''}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Fim *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dataFim"
                    value={formData.dataFim || ''}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Local *</Form.Label>
              <Form.Control
                type="text"
                name="local"
                value={formData.local || ''}
                onChange={handleInputChange}
                placeholder="Ex: Sala 101"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instrutor *</Form.Label>
              <Form.Control
                type="text"
                name="instrutor"
                value={formData.instrutor || ''}
                onChange={handleInputChange}
                placeholder="Nome do instrutor"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Vagas Disponíveis Voluntários</Form.Label>
                  <Form.Control
                    type="number"
                    name="vagas"
                    value={formData.vagas}
                    onChange={handleInputChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Numero Participantes</Form.Label>
                  <Form.Control
                    type="number"
                    name="numeroParticipantes"
                    value={formData.numeroParticipantes}
                    onChange={handleInputChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveWorkshop}>
            {editingId ? 'Atualizar' : 'Criar'} Oficina
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}