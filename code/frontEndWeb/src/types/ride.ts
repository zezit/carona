// Ride/Carona related type definitions based on backend DTOs

export interface CarroDto {
  id: number;
  modelo: string;
  placa: string;
  cor: string;
  capacidadePassageiros: number;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
  atualizadoPor: string;
}

export interface UsuarioDto {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: string;
  statusCadastro: string;
  imgUrl: string;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
  atualizadoPor: string;
}

export interface EstudanteDto extends UsuarioDto {
  dataDeNascimento: string;
  matricula: string;
  avaliacaoMedia: number;
  perfilMotorista?: PerfilMotoristaDto;
  curso: string;
}

export interface PerfilMotoristaDto {
  id: number;
  carro: CarroDto;
  cnh: string;
  whatsapp: string;
  mostrarWhatsapp: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
  atualizadoPor: string;
}

export interface TrajetoDto {
  id: number;
  pontoInicial: {
    latitude: number;
    longitude: number;
    endereco: string;
  };
  pontoFinal: {
    latitude: number;
    longitude: number;
    endereco: string;
  };
  distanciaMetros: number;
  tempoSegundos: number;
  principal: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
  atualizadoPor: string;
}

export interface Ride {
  id: number;
  motorista: PerfilMotoristaDto;
  pontoPartida: string;
  latitudePartida: number;
  longitudePartida: number;
  pontoDestino: string;
  latitudeDestino: number;
  longitudeDestino: number;
  dataHoraPartida: string; // ISO string format
  dataHoraChegada: string; // ISO string format
  vagas: number;
  status: 'AGENDADA' | 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA';
  observacoes?: string;
  passageiros: EstudanteDto[];
  vagasDisponiveis: number;
  distanciaEstimadaMetros: number;
  tempoEstimadoSegundos: number;
  trajetos: TrajetoDto[];
  trajetoPrincipal?: TrajetoDto;
  dataCriacao: string; // ISO string
  dataAtualizacao: string; // ISO string
  criadoPor: string;
  atualizadoPor: string;
}

export interface RidePageResponse {
  content: Ride[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
  message?: string;
}
