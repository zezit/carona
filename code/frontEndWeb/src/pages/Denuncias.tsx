import React, { useState, useEffect } from "react";
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Eye, FileText, User, Calendar, Filter, Search, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { apiClient } from "@/lib/api";

// Enum para tipos de denúncia
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

// Interfaces
interface EstudanteResumoDto {
  id: number;
  nome: string;
  email: string;
}

interface DenunciaDto {
  id: number;
  caronaId: number;
  denunciante: EstudanteResumoDto;
  denunciado: EstudanteResumoDto;
  tipo: TipoDenuncia;
  descricao: string;
  dataHora: string;
  status: "PENDENTE" | "FINALIZADO";
  resolucao?: string;
  dataHoraResolucao?: string;
}

// Mapeamento dos tipos para labels legíveis
const tipoLabels: Record<TipoDenuncia, string> = {
  [TipoDenuncia.COMPORTAMENTO_INADEQUADO]: "Comportamento Inadequado",
  [TipoDenuncia.ATRASO_EXCESSIVO]: "Atraso Excessivo",
  [TipoDenuncia.DESVIO_ROTA]: "Desvio de Rota",
  [TipoDenuncia.CANCELAMENTO_INJUSTIFICADO]: "Cancelamento Injustificado",
  [TipoDenuncia.VEICULO_NAO_CONFORME]: "Veículo Não Conforme",
  [TipoDenuncia.COBRANCA_INDEVIDA]: "Cobrança Indevida",
  [TipoDenuncia.DADOS_FALSOS]: "Dados Falsos",
  [TipoDenuncia.OUTROS]: "Outros"
};

// Dados mockados para demonstração
const mockDenuncias: DenunciaDto[] = [
  {
    id: 1,
    caronaId: 101,
    denunciante: { id: 1, nome: "João Silva", email: "joao@email.com" },
    denunciado: { id: 2, nome: "Maria Santos", email: "maria@email.com" },
    tipo: TipoDenuncia.COMPORTAMENTO_INADEQUADO,
    descricao: "Motorista foi grosseiro durante a viagem e usou linguagem inapropriada.",
    dataHora: "2024-06-10T14:30:00",
    status: "PENDENTE"
  },
  {
    id: 2,
    caronaId: 102,
    denunciante: { id: 3, nome: "Pedro Costa", email: "pedro@email.com" },
    denunciado: { id: 4, nome: "Ana Oliveira", email: "ana@email.com" },
    tipo: TipoDenuncia.ATRASO_EXCESSIVO,
    descricao: "Passageiro chegou 30 minutos atrasado sem justificativa.",
    dataHora: "2024-06-11T09:15:00",
    status: "PENDENTE"
  },
  {
    id: 3,
    caronaId: 103,
    denunciante: { id: 5, nome: "Carlos Lima", email: "carlos@email.com" },
    denunciado: { id: 6, nome: "Julia Pereira", email: "julia@email.com" },
    tipo: TipoDenuncia.CANCELAMENTO_INJUSTIFICADO,
    descricao: "Cancelou a carona 5 minutos antes do horário marcado sem motivo válido.",
    dataHora: "2024-06-09T16:45:00",
    status: "FINALIZADO",
    resolucao: "Usuário foi advertido sobre a política de cancelamentos.",
    dataHoraResolucao: "2024-06-10T10:00:00"
  }
];

// Componente FilterBar
const FilterBar = ({ onFilterChange, categories }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onFilterChange(value, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilterChange(searchQuery, category);
    setIsFilterOpen(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Barra de pesquisa */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por descrição, denunciante ou denunciado..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por categoria */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <Filter className="h-4 w-4 mr-2" />
            Categoria
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {selectedCategory === "all" ? "Todas" : categories.find(c => c.value === selectedCategory)?.label}
            </span>
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <button
                  onClick={() => handleCategoryChange("all")}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                    selectedCategory === "all" ? "bg-blue-50 text-blue-700" : ""
                  }`}
                >
                  Todas as categorias
                </button>
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryChange(category.value)}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                      selectedCategory === category.value ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente DenunciaCard
const DenunciaCard = ({ denuncia, onResolve, onArchive, onView, mode, tipoLabel }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDENTE": return "bg-yellow-100 text-yellow-800";
      case "FINALIZADO": return "bg-green-100 text-green-800";
      // case "ARQUIVADA": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case TipoDenuncia.COMPORTAMENTO_INADEQUADO: return "bg-red-100 text-red-800";
      case TipoDenuncia.ATRASO_EXCESSIVO: return "bg-orange-100 text-orange-800";
      case TipoDenuncia.DESVIO_ROTA: return "bg-blue-100 text-blue-800";
      case TipoDenuncia.CANCELAMENTO_INJUSTIFICADO: return "bg-purple-100 text-purple-800";
      case TipoDenuncia.VEICULO_NAO_CONFORME: return "bg-indigo-100 text-indigo-800";
      case TipoDenuncia.COBRANCA_INDEVIDA: return "bg-pink-100 text-pink-800";
      case TipoDenuncia.DADOS_FALSOS: return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(denuncia.status)}`}>
            {denuncia.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(denuncia.tipo)}`}>
            {tipoLabel}
          </span>
        </div>
        <span className="text-xs text-gray-500">#{denuncia.id}</span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 mr-2" />
          <span className="font-medium">Denunciante:</span>
          <span className="ml-1">{denuncia.denunciante.nome}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 mr-2" />
          <span className="font-medium">Denunciado:</span>
          <span className="ml-1">{denuncia.denunciado.nome}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(denuncia.dataHora)}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700 line-clamp-3">
          {denuncia.descricao}
        </p>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView(denuncia)}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver Detalhes
        </button>

        {mode === "PENDENTE" && (
          <>
            <button
              onClick={() => onResolve && onResolve(denuncia.id)}
              className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolver
            </button>
            {/* <button
              onClick={() => onArchive && onArchive(denuncia.id)}
              className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Arquivar
            </button> */}
          </>
        )}
      </div>
    </div>
  );
};

// Componente DenunciaDetails
const DenunciaDetails = ({ denuncia, isOpen, onClose, tipoLabel }) => {
  if (!isOpen || !denuncia) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalhes da Denúncia #{denuncia.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                denuncia.status === "PENDENTE" ? "bg-yellow-100 text-yellow-800" :
                denuncia.status === "FINALIZADO" ? "bg-green-100 text-green-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {denuncia.status}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <span className="text-sm text-gray-900">{tipoLabel}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data/Hora</label>
              <span className="text-sm text-gray-900">{formatDate(denuncia.dataHora)}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carona ID</label>
              <span className="text-sm text-gray-900">#{denuncia.caronaId}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Denunciante</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">{denuncia.denunciante.nome}</p>
                <p className="text-sm text-gray-600">{denuncia.denunciante.email}</p>
                <p className="text-xs text-gray-500">ID: {denuncia.denunciante.id}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Denunciado</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">{denuncia.denunciado.nome}</p>
                <p className="text-sm text-gray-600">{denuncia.denunciado.email}</p>
                <p className="text-xs text-gray-500">ID: {denuncia.denunciado.id}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900">{denuncia.descricao}</p>
            </div>
          </div>

          {denuncia.status === "FINALIZADO" && denuncia.resolucao && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resolução</label>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-900">{denuncia.resolucao}</p>
                {denuncia.dataHoraResolucao && (
                  <p className="text-sm text-green-700 mt-2">
                    Resolvido em: {formatDate(denuncia.dataHoraResolucao)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

const ResolverDenunciaModal = ({ denuncia, isOpen, onClose, onConfirm, isLoading }) => {
  const [resolucao, setResolucao] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (resolucao.trim()) {
      onConfirm(resolucao.trim());
    }
  };

  const handleClose = () => {
    setResolucao("");
    onClose();
  };

  if (!isOpen || !denuncia) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Resolver Denúncia #{denuncia.id}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolução da denúncia
            </label>
            <textarea
              value={resolucao}
              onChange={(e) => setResolucao(e.target.value)}
              placeholder="Descreva como a denúncia foi resolvida..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !resolucao.trim()}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Resolvendo..." : "Resolver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal
const DenunciasManagement = () => {
  const [activeTab, setActiveTab] = useState<"PENDENTE" | "FINALIZADO" >("PENDENTE");
  const [denuncias, setDenuncias] = useState<DenunciaDto[]>([]);
  const [filteredDenuncias, setFilteredDenuncias] = useState<DenunciaDto[]>([]);
  const [selectedDenuncia, setSelectedDenuncia] = useState<DenunciaDto | null>(null);
  const [isDenunciaDetailsOpen, setIsDenunciaDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [counts, setCounts] = useState({ PENDENTE: 0, FINALIZADO: 0});
  const [denunciaParaResolver, setDenunciaParaResolver] = useState<DenunciaDto | null>(null);
const [isResolverModalOpen, setIsResolverModalOpen] = useState(false);
const [isResolvingDenuncia, setIsResolvingDenuncia] = useState(false);

  // Busca as denúncias por status
  const fetchDenuncias = async (status: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/denuncia/status?status=${status}`);
      const content = response.data.content || [];
      setDenuncias(content);
      setFilteredDenuncias(content);
      setCounts((prev) => ({ ...prev, [status]: content.length }));
    } catch (error) {
      console.error("Erro ao buscar denúncias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza sempre que mudar de aba
  useEffect(() => {
    fetchDenuncias(activeTab);
  }, [activeTab]);

  const handleViewDenuncia = (denuncia: DenunciaDto) => {
    setSelectedDenuncia(denuncia);
    setIsDenunciaDetailsOpen(true);
  };

  const handleCloseDenunciaDetails = () => {
    setIsDenunciaDetailsOpen(false);
    setSelectedDenuncia(null);
  };

  const handleResolveClick = (denunciaId: number) => {
  const denuncia = denuncias.find(d => d.id === denunciaId);
  if (denuncia) {
    setDenunciaParaResolver(denuncia);
    setIsResolverModalOpen(true);
  }
};

  const handleArchiveClick = (denunciaId: number) => {
    alert(`Arquivar denúncia ${denunciaId} - Implementar popup aqui`);
  };

const handleConfirmResolve = async (resolucao: string) => {
  if (!denunciaParaResolver) return;

  try {
    setIsResolvingDenuncia(true);

    await apiClient.put(`/denuncia/${denunciaParaResolver.id}/resolver`, {
      status: "FINALIZADO",
      resolucao: resolucao
    });

    // Atualiza a lista removendo a denúncia resolvida das pendentes
    const updatedDenuncias = denuncias.filter(d => d.id !== denunciaParaResolver.id);
    setDenuncias(updatedDenuncias);
    setFilteredDenuncias(updatedDenuncias);

    // Atualiza os contadores
    setCounts(prev => ({
      ...prev,
      PENDENTE: prev.PENDENTE - 1,
      FINALIZADO: prev.FINALIZADO + 1
    }));

    // Fecha o modal
    setIsResolverModalOpen(false);
    setDenunciaParaResolver(null);

    // Opcional: mostrar mensagem de sucesso
    alert("Denúncia resolvida com sucesso!");

  } catch (error) {
    console.error("Erro ao resolver denúncia:", error);
    alert("Erro ao resolver denúncia. Tente novamente.");
  } finally {
    setIsResolvingDenuncia(false);
  }
};

const handleCloseResolverModal = () => {
  setIsResolverModalOpen(false);
  setDenunciaParaResolver(null);
};

  const handleFilter = (query: string, tipo: string) => {
    const filtered = denuncias.filter((denuncia) => {
      const matchesQuery = query
        ? denuncia.descricao.toLowerCase().includes(query.toLowerCase()) ||
          denuncia.denunciante.nome.toLowerCase().includes(query.toLowerCase()) ||
          denuncia.denunciado.nome.toLowerCase().includes(query.toLowerCase())
        : true;

      const matchesTipo = tipo && tipo !== "all" ? denuncia.tipo === tipo : true;

      return matchesQuery && matchesTipo;
    });

    setFilteredDenuncias(filtered);
  };

  const handleRefresh = () => {
    fetchDenuncias(activeTab);
  };

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case "PENDENTE":
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-600" />,
          title: "Nenhuma denúncia pendente",
          description: "Ótimo! Não há denúncias aguardando análise no momento."
        };
      case "FINALIZADO":
        return {
          icon: <CheckCircle className="h-12 w-12 text-blue-600" />,
          title: "Nenhuma denúncia FINALIZADA",
          description: "Não há histórico de denúncias FINALIZADOS ainda."
        };
      // case "ARQUIVADA":
      //   return {
      //     icon: <AlertTriangle className="h-12 w-12 text-gray-400" />,
      //     title: "Nenhuma denúncia arquivada",
      //     description: "Não há denúncias arquivadas no momento."
      //   };
    }
  };

  const emptyState = getEmptyStateContent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Denúncias</h1>
              <p className="text-gray-600 mt-1">
                Gerencie denúncias e mantenha a plataforma segura
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm border">
          <button
            onClick={() => setActiveTab("PENDENTE")}
            className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "PENDENTE"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Clock className="mr-2 h-4 w-4" />
            Pendentes ({counts.PENDENTE})
          </button>
          <button
            onClick={() => setActiveTab("FINALIZADO")}
            className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "FINALIZADO"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Finalizadas ({counts.FINALIZADO})
          </button>
          {/* <button
            onClick={() => setActiveTab("ARQUIVADA")}
            className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "ARQUIVADA"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Arquivadas ({counts.ARQUIVADA})
          </button> */}
        </div>

        <FilterBar
          onFilterChange={handleFilter}
          categories={Object.entries(tipoLabels).map(([value, label]) => ({ value, label }))}
        />

        {filteredDenuncias.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="mx-auto flex items-center justify-center rounded-full bg-gray-50 mb-4 h-16 w-16">
              {emptyState.icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {emptyState.title}
            </h3>
            <p className="text-sm text-gray-500">
              {emptyState.description}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDenuncias.map((denuncia) => (
              <DenunciaCard
                key={denuncia.id}
                denuncia={denuncia}
                onResolve={activeTab === "PENDENTE" ? handleResolveClick : undefined}
                onArchive={activeTab === "PENDENTE" ? handleArchiveClick : undefined}
                onView={handleViewDenuncia}
                mode={activeTab}
                tipoLabel={tipoLabels[denuncia.tipo]}
              />
            ))}
          </div>
        )}
      </main>

      {selectedDenuncia && (
        <DenunciaDetails
          denuncia={selectedDenuncia}
          isOpen={isDenunciaDetailsOpen}
          onClose={handleCloseDenunciaDetails}
          tipoLabel={tipoLabels[selectedDenuncia.tipo]}
        />
      )}
      {denunciaParaResolver && (
  <ResolverDenunciaModal
    denuncia={denunciaParaResolver}
    isOpen={isResolverModalOpen}
    onClose={handleCloseResolverModal}
    onConfirm={handleConfirmResolve}
    isLoading={isResolvingDenuncia}
  />
)}
    </div>
  );
};


export default DenunciasManagement;