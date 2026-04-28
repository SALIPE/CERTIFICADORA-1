import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { Oficina } from '../../types/Oficina';

export default function AdminDashboard() {
  // 1. O estado inicial já começa com uma oficina de teste cadastrada
  const [workshops, setWorkshops] = useState<Oficina[]>([
    {
      id: 'teste-1',
      name: 'React Avançado (Oficina de Teste)',
      description: 'Aprenda conceitos avançados de React.',
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

  // 2. O useEffect chama a busca no banco assim que a tela abre
  useEffect(() => {
    fetchOficinas();
  }, []);

  // 3. Função para buscar do banco e juntar com a de teste
  const fetchOficinas = async () => {
    try {
      // Pega o token que foi salvo no login
      const token = localStorage.getItem('user');
      
      const response = await axios.get('http://localhost:5000/api/oficinas', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Como o Banco de Dados usa nomes diferentes (titulo em vez de name), 
      // precisamos "traduzir" os dados antes de jogar na tela
      const oficinasDoBanco = response.data.map((dbOficina: any) => ({
        id: dbOficina.id,
        name: dbOficina.titulo,
        description: dbOficina.descricao,
        // Mudamos aqui de 'inicio' para 'data_inicio'
        date: dbOficina.data_inicio ? dbOficina.data_inicio.split('T')[0] : '', 
        time: dbOficina.data_inicio ? dbOficina.data_inicio.split('T')[1].substring(0, 5) : '', 
        location: 'Local a definir', // Fixo, pois o BD não tem essa coluna ainda
        maxParticipants: 30,
        currentParticipants: dbOficina.num_participantes || 0,
        instructor: 'Instrutor TEDI' // Fixo, pois o BD não tem essa coluna ainda
      }));

      // Mantém a oficina de teste e adiciona as que vieram do banco
      setWorkshops(prev => {
        // Filtra para evitar duplicar a oficina de teste se a tela recarregar
        const base = prev.filter(w => w.id === 'teste-1');
        return [...base, ...oficinasDoBanco];
      });

    } catch (error) {
      console.error('Erro ao buscar as oficinas reais:', error);
    }
  };

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
        name: '', description: '', date: '', time: '', location: '',
        maxParticipants: 30, currentParticipants: 0, instructor: '',
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

  const handleSaveWorkshop = async () => {
    // 1. Validação básica
    if (!formData.name || !formData.description || !formData.date || !formData.time) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      const token = localStorage.getItem('user');
      
      // 2. O banco de dados exige "inicio" e "fim" (como Timestamp).
      // Vamos juntar a data e hora do form para o inicio, e colocar o fim para 2h depois.
      const dataInicio = new Date(`${formData.date}T${formData.time}:00`);
      const dataFim = new Date(dataInicio.getTime() + (2 * 60 * 60 * 1000)); // Adiciona 2 horas

      // 3. Montamos o "pacote" exatamente como o Back-end espera receber
      const payload = {
        titulo: formData.name,
        tema: 'Geral', // O banco exige o 'tema', então mandamos um fixo por enquanto
        descricao: formData.description,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString()
      };

      if (editingId) {
        // Se tem ID, é uma EDIÇÃO (PUT)
        // Atenção: Certifique-se de que a rota no backend para update existe.
        await axios.put(`http://localhost:5000/api/oficinas/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Se não tem ID, é uma CRIAÇÃO (POST)
        await axios.post('http://localhost:5000/api/oficinas', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // 4. Se deu tudo certo, fecha o modal e recarrega a lista do banco!
      handleCloseModal();
      fetchOficinas(); // Essa função vai lá no banco buscar a lista atualizada

    } catch (error) {
      console.error('Erro ao salvar oficina:', error);
      alert('Erro ao salvar a oficina. Verifique se o Back-end está rodando e a rota existe.');
    }
  };

  const handleDeleteWorkshop = async (id: string) => {
    // Trocamos a palavra Deletar por Desativar na mensagem de confirmação
    if (window.confirm('Tem certeza que deseja desativar esta oficina?')) {
      try {
        const token = localStorage.getItem('user');
        
        // Em vez de delete(), usamos patch() apontando para a rota correta do Back-end
        await axios.patch(`http://localhost:5000/api/oficinas/${id}/desativar`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Se o Back-end confirmou a desativação, nós tiramos a oficina da tela
        setWorkshops(workshops.filter(w => w.id !== id));
        
      } catch (error) {
        console.error('Erro ao desativar oficina:', error);
        alert('Erro ao desativar. Verifique o console para mais detalhes.');
      }
    }
  };

  return (
    <Container fluid className="admin-dashboard py-4">
      <Row className="mb-4">
        <Col>
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
                    <strong>Data:</strong> {workshop.date ? new Date(workshop.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}
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
                    Desativar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
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