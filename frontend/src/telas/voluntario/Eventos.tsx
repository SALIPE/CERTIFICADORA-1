import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { deleteCmnd, get, post } from '../../services/WebService';
import { Oficina } from '../../types/Oficina';

export default function Eventos() {
  const [workshops, setWorkshops] = useState<Oficina[]>([]);
  const [registeredWorkshops, setRegisteredWorkshops] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchOficinas();
    fetchMinhasInscricoes();
  }, []);

  const fetchOficinas = async () => {
    try {
      const response = await get("/oficinas")
      console.log(response)
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
          vagas: dbOficina.vagas,
          numeroVoluntarios: dbOficina.numeroVoluntarios,
          numeroParticipantes: dbOficina.numeroParticipantes || 0,
          instrutor: dbOficina.instrutor || 'Instrutor TEDI',
          status: dbOficina.status || 'ATIVA'
        };
      });

      setWorkshops(oficinasDoBanco);
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error);
    }
  };

  const fetchMinhasInscricoes = async () => {
    try {
      const response = await get('/oficinas/minhas-inscricoes');
      console.log(response)
      setRegisteredWorkshops(response);
    } catch (error) {
      console.error('Erro ao buscar as inscrições do usuário:', error);
    }
  };

  const handleRegister = async (workshopId: string, workshopName: string) => {
    if (registeredWorkshops.includes(workshopId)) {
      alert('Você já está inscrito nesta oficina!');
      return;
    }

    try {

      // Manda o pedido de inscrição para o Back
      await post(`/oficinas/${workshopId}/inscrever`, {});

      // Se der sucesso, atualiza a tela
      setRegisteredWorkshops([...registeredWorkshops, workshopId]);
      setSuccessMessage(`Você se inscreveu com sucesso em "${workshopName}"!`);
      setShowSuccess(true);

      setWorkshops(prevWorkshops =>
        prevWorkshops.map(w =>
          w.id === workshopId
            ? { ...w, numeroParticipantes: w.numeroParticipantes + 1 }
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

  const handleUnregister = async (workshopId: string, workshopName: string) => {
    if (!window.confirm(`Tem certeza que deseja cancelar sua inscrição em "${workshopName}"?`)) {
      return;
    }

    try {

      await deleteCmnd(`/oficinas/${workshopId}/desinscrever`);

      // Se der sucesso, tira o ID da lista de inscritos local
      setRegisteredWorkshops(prev => prev.filter(id => id !== workshopId));

      // Atualiza a tela: Diminui 1 participante para liberar a vaga visualmente
      setWorkshops(prevWorkshops =>
        prevWorkshops.map(w =>
          w.id === workshopId
            ? { ...w, numeroVoluntarios: Math.max(0, w.numeroVoluntarios - 1) }
            : w
        )
      );

      setSuccessMessage(`Inscrição em "${workshopName}" cancelada com sucesso!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error: any) {
      console.error('Erro ao cancelar inscrição:', error);
      alert('Erro ao cancelar inscrição. Tente novamente.');
    }
  };

  const isRegistered = (workshopId: string) => registeredWorkshops.includes(workshopId);

  const getAvailableSpots = (workshop: Oficina) => {
    return workshop.vagas - workshop.numeroVoluntarios;
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
                      <Card.Title className="mb-0">{workshop.titulo}</Card.Title>
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
                    </div>
                    {isUserRegistered ? (
                      <Button
                        variant="danger"
                        onClick={() => handleUnregister(workshop.id, workshop.titulo)}
                        className="w-100"
                      >
                        Cancelar Inscrição
                      </Button>
                    ) : (
                      <Button
                        variant={isFull ? 'secondary' : 'primary'}
                        onClick={() => handleRegister(workshop.id, workshop.titulo)}
                        disabled={isFull}
                        className="w-100"
                      >
                        {isFull ? 'Oficina Cheia' : 'Inscrever-se'}
                      </Button>
                    )}
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


