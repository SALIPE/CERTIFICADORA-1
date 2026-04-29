import { useState, useEffect } from 'react'; // <-- Adicionamos useEffect
import axios from 'axios';
import { Alert, Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
//import '../../assets/css/AdminDashboard.css';
import { Oficina } from '../../types/Oficina';

export default function Eventos() {
  const [workshops, setWorkshops] = useState<Oficina[]>([]);
  
  const [registeredWorkshops, setRegisteredWorkshops] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Chama a função de buscar oficinas assim que a tela abre
  useEffect(() => {
    fetchOficinas();
  }, []);

  const fetchOficinas = async () => {
    try {
      const token = localStorage.getItem('user');
      const response = await axios.get('http://localhost:5000/api/oficinas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const oficinasDoBanco = response.data
        .filter((dbOficina: any) => dbOficina.status === 'ATIVA')
        .map((dbOficina: any) => {
          const dataISO = dbOficina.dataInicio || dbOficina.data_inicio;
          
          return {
            id: dbOficina.id,
            name: dbOficina.titulo,
            description: dbOficina.descricao || '',
            date: dataISO ? dataISO.split('T')[0] : '', 
            time: dataISO ? dataISO.split('T')[1].substring(0, 5) : '', 
            location: dbOficina.local || 'Local a definir',
            maxParticipants: Number(dbOficina.vagas) || 30,         
            currentParticipants: dbOficina.numeroParticipantes || 0,
            instructor: dbOficina.instrutor || 'Instrutor TEDI'
          };
        });

      setWorkshops(oficinasDoBanco);
    } catch (error) {
      console.error('Erro ao buscar as oficinas reais:', error);
    }
  };

  const handleRegister = async (workshopId: string, workshopName: string) => {
    if (registeredWorkshops.includes(workshopId)) {
      alert('Você já está inscrito nesta oficina!');
      return;
    }

    try {
      const token = localStorage.getItem('user');
      
      // Manda o pedido de inscrição para o Back
      await axios.post(`http://localhost:5000/api/oficinas/${workshopId}/inscrever`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Se der sucesso, atualiza a tela
      setRegisteredWorkshops([...registeredWorkshops, workshopId]);
      setSuccessMessage(`Você se inscreveu com sucesso em "${workshopName}"!`);
      setShowSuccess(true);

      setWorkshops(prevWorkshops => 
        prevWorkshops.map(w => 
          w.id === workshopId 
            ? { ...w, currentParticipants: w.currentParticipants + 1 }
            : w
        )
      );

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Erro ao se inscrever:', error);
      // Se o Back avisar que já está inscrito, mostra o erro
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message || 'Você já está inscrito nesta oficina.');
      } else {
        alert('Erro ao realizar inscrição. Tente novamente.');
      }
    }
  };

  const isRegistered = (workshopId: string) => registeredWorkshops.includes(workshopId);

  const getAvailableSpots = (workshop: Oficina) => {
    return workshop.maxParticipants - workshop.currentParticipants;
  };

  return (
    <Container fluid className="eventos-page py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-4">Oficinas Disponíveis</h1>
          {registeredWorkshops.length > 0 && (
            <Alert variant="info" dismissible>
              Você está inscrito em {registeredWorkshops.length} oficina(s)
            </Alert>
          )}
        </Col>
      </Row>

      {showSuccess && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
              {successMessage}
            </Alert>
          </Col>
        </Row>
      )}

      {workshops.length === 0 ? (
        <Row>
          <Col>
            <Alert variant="warning">
              Nenhuma oficina disponível no momento.
            </Alert>
          </Col>
        </Row>
      ) : (
        <Row className="g-4">
          {workshops.map(workshop => {
            const available = getAvailableSpots(workshop);
            const isFull = available === 0;
            const isUserRegistered = isRegistered(workshop.id);

            return (
              <Col key={workshop.id} md={6} lg={4} className="mb-3">
                <Card className="workshop-card h-100 shadow-sm workshop-volunteer">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0">{workshop.name}</Card.Title>
                      {isFull && (
                        <Badge bg="danger" className="ms-2">
                          Cheio
                        </Badge>
                      )}
                      {isUserRegistered && (
                        <Badge bg="success" className="ms-2">
                          Inscrito
                        </Badge>
                      )}
                    </div>

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

                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="small">
                            <strong>Vagas:</strong> {available} disponível(is)
                          </span>
                          <span className="small text-muted">
                            {workshop.currentParticipants}/{workshop.maxParticipants}
                          </span>
                        </div>
                        <div className="progress">
                          <div
                            className={`progress-bar ${isFull ? 'bg-danger' : ''}`}
                            role="progressbar"
                            style={{
                              width: `${(workshop.currentParticipants / workshop.maxParticipants) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant={isUserRegistered ? 'success' : isFull ? 'secondary' : 'primary'}
                      onClick={() => handleRegister(workshop.id, workshop.name)}
                      disabled={isFull || isUserRegistered}
                      className="w-100"
                    >
                      {isUserRegistered
                        ? '✓ Já inscrito'
                        : isFull
                          ? 'Oficina Cheia'
                          : 'Inscrever-se'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}


