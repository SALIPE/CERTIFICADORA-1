export interface Oficina {
  id: string;
  titulo: string;
  tema: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  local: string;
  vagas: number;
  numeroVoluntarios: number;
  numeroParticipantes: number;
  instrutor: string;
  status?: string;
}
