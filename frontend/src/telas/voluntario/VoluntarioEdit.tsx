import { useState } from 'react';
import { Container } from 'react-bootstrap';

export default function VoluntarioEdit() {


  const [formData, setFormData] = useState({
    nome: '',
    email: '',
  });



  return (
    <Container fluid className="admin-dashboard py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Editar Perfil</h2>
      </div>


    </Container>
  );
}