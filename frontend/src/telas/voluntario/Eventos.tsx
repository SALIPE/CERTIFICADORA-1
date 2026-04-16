import { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import '../../assets/css/AdminDashboard.css';
import { Oficina } from '../../types/Oficina';

export default function Eventos() {
  const [workshops] = useState<Oficina[]>([
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
    {
      id: '2',
      name: 'TypeScript Essencial',
      description: 'Domine TypeScript do zero',
      date: '2026-05-20',
      time: '10:00',
      location: 'Sala 102',
      maxParticipants: 25,
      currentParticipants: 25,
      instructor: 'Maria Santos',
    },
  ]);

  const [registeredWorkshops, setRegisteredWorkshops] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = (workshopId: string, workshopName: string) => {
    if (registeredWorkshops.includes(workshopId)) {
      alert('Você já está inscrito nesta oficina!');
      return;
    }

    setRegisteredWorkshops([...registeredWorkshops, workshopId]);
    setSuccessMessage(`Você se inscreveu com sucesso em "${workshopName}"!`);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
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


