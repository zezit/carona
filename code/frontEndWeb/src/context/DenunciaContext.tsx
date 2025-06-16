// @/context/DenunciaContext.tsx
interface DenunciaContextType {
  denunciasPendentes: DenunciaDto[];
  denunciasResolvidas: DenunciaDto[];
  denunciasArquivadas: DenunciaDto[];
  resolverDenuncia: (id: number, resolucao: string) => Promise<void>;
  arquivarDenuncia: (id: number) => Promise<void>;
  fetchDenunciasPendentes: () => Promise<void>;
  fetchDenunciasResolvidas: () => Promise<void>;
  fetchDenunciasArquivadas: () => Promise<void>;
}

interface EstudanteResumoDto {
  id: number;
  nome: string;
  email: string;
  // outros campos necessários
}

// Defina o tipo ou enum TipoDenuncia conforme necessário
// Exemplo de enum:
export enum TipoDenuncia {
  COMPORTAMENTO_INADEQUADO = "COMPORTAMENTO_INADEQUADO",
  ATRASO_EXCESSIVO = "ATRASO_EXCESSIVO", 
  DESVIO_ROTA = "DESVIO_ROTA",
  CANCELAMENTO_INJUSTIFICADO = "CANCELAMENTO_INJUSTIFICADO",
  VEICULO_NAO_CONFORME = "VEICULO_NAO_CONFORME",
  COBRANCA_INDEVIDA = "COBRANCA_INDEVIDA",
  DADOS_FALSOS = "DADOS_FALSOS",
  OUTROS = "OUTROS"
}

interface DenunciaDto {
  id: number;
  caronaId: number;
  denunciante: EstudanteResumoDto;
  denunciado: EstudanteResumoDto;
  tipo: TipoDenuncia;
  descricao: string;
  dataHora: string;
  status: "PENDENTE" | "RESOLVIDA" | "ARQUIVADA";
  resolucao?: string;
  dataHoraResolucao?: string;
}