import { useState } from 'react';
import { Button, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import '../../assets/css/AdminDashboard.css';
import { Oficina } from '../../types/Oficina';

export default function AdminDashboard() {
  const [workshops, setWorkshops] = useState<Oficina[]>([
    {
      id: '1',
      name: 'React Avançado',
      description: 'Aprenda conceitos avançados de React',
      date: '2026-05-15',
      time: '14:00',
      location: 'Sala 101',
      maxParticipants: 30,
      currentParticipants: 15,
      instructor: 'João Silva',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Oficina, 'id'>>({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: 30,
    currentParticipants: 0,
    instructor: '',
  });

  const handleShowModal = (workshop?: Oficina) => {
    if (workshop) {
      setEditingId(workshop.id);
      setFormData({
        name: workshop.name,
        description: workshop.description,
        date: workshop.date,
        time: workshop.time,
        location: workshop.location,
        maxParticipants: workshop.maxParticipants,
        currentParticipants: workshop.currentParticipants,
        instructor: workshop.instructor,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        date: '',
        time: '',
        location: '',
        maxParticipants: 30,
        currentParticipants: 0,
        instructor: '',
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
      [name]: name === 'maxParticipants' || name === 'currentParticipants' ? parseInt(value) : value,
    });
  };

  const handleSaveWorkshop = () => {
    if (!formData.name || !formData.description || !formData.date || !formData.instructor) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (editingId) {
      setWorkshops(workshops.map(w => w.id === editingId ? { ...formData, id: editingId } : w));
    } else {
      const newWorkshop: Oficina = {
        ...formData,
        id: Date.now().toString(),
      };
      setWorkshops([...workshops, newWorkshop]);
    }
    handleCloseModal();
  };

  const handleDeleteWorkshop = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta oficina?')) {
      setWorkshops(workshops.filter(w => w.id !== id));
    }
  };

  return (
    <Container fluid className="admin-dashboard py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-4">Dashboard de Oficinas</h1>
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleShowModal()}
            className="mb-4"
          >
            + Nova Oficina
          </Button>
        </Col>
      </Row>

      <Row className="g-4">
        {workshops.map(workshop => (
          <Col key={workshop.id} md={6} lg={4} className="mb-3">
            <Card className="workshop-card h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="mb-3">{workshop.name}</Card.Title>

                <div className="workshop-info mb-3 flex-grow-1">
                  <p className="mb-2">
                    <strong>Descrição:</strong> {workshop.description}
                  </p>
                  <p className="mb-2">
                    <strong>Data:</strong> {new Date(workshop.date).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="mb-2">
                    <strong>Hora:</strong> {workshop.time}
                  </p>
                  <p className="mb-2">
                    <strong>Local:</strong> {workshop.location}
                  </p>
                  <p className="mb-2">
                    <strong>Instrutor:</strong> {workshop.instructor}
                  </p>
                  <p className="mb-2">
                    <strong>Participantes:</strong> {workshop.currentParticipants}/{workshop.maxParticipants}
                  </p>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${(workshop.currentParticipants / workshop.maxParticipants) * 100}%`,
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
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteWorkshop(workshop.id)}
                    className="flex-grow-1"
                  >
                    Deletar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal para criar/editar oficina */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Editar Oficina' : 'Nova Oficina'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nome da Oficina *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: React Avançado"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva a oficina"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data *</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hora *</Form.Label>
                  <Form.Control
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Local *</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ex: Sala 101"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instrutor *</Form.Label>
              <Form.Control
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                placeholder="Nome do instrutor"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Máximo de Participantes</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="1"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Participantes Atuais</Form.Label>
                  <Form.Control
                    type="number"
                    name="currentParticipants"
                    value={formData.currentParticipants}
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


