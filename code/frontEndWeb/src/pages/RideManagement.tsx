import { AnimatedPage } from "@/components/AnimatedPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import { RideMap } from "@/components/RideMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Ride, RidePageResponse } from "@/types/ride";
import { Calendar, Car, Clock, Eye, Map, MapPin, RefreshCw, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

const RideManagement = () => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rideStats, setRideStats] = useState({
    total: 0,
    agendada: 0,
    emAndamento: 0,
    finalizada: 0,
    cancelada: 0
  });

  const ridesPerPage = 10;

  // Status mapping for display
  const statusConfig = {
    AGENDADA: { label: "Agendada", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
    EM_ANDAMENTO: { label: "Em Andamento", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
    FINALIZADA: { label: "Finalizada", variant: "success" as const, color: "bg-green-100 text-green-800" },
    CANCELADA: { label: "Cancelada", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
  };

  // Fetch ride statistics from API
  const fetchRideStats = async () => {
    try {
      const response = await api.reports.getRideStats();
      if (response.success && response.data) {
        setRideStats({
          total: response.data.total || 0,
          agendada: response.data.agendada || 0,
          emAndamento: response.data.emAndamento || 0,
          finalizada: response.data.finalizada || 0,
          cancelada: response.data.cancelada || 0
        });
      }
    } catch (error) {
      console.error("Error fetching ride stats:", error);
    }
  };

  // Fetch rides from API with search and status filtering
  const fetchRides = async (page: number = 0, status?: string, search?: string) => {
    try {
      setIsLoading(true);
      const filterStatus = status || statusFilter;
      const searchParam = search !== undefined ? search : searchQuery;
      const response = await api.admin.getAllRides(page, ridesPerPage, filterStatus, searchParam);
      
      if (response.success && response.data) {
        const rideData: RidePageResponse = response.data;
        setRides(rideData.content);
        setFilteredRides(rideData.content);
        setTotalPages(rideData.totalPages);
        setTotalElements(rideData.totalElements);
        setCurrentPage(rideData.number);
      } else {
        toast.error("Erro ao carregar viagens");
        setRides([]);
        setFilteredRides([]);
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
      toast.error("Erro ao carregar viagens");
      setRides([]);
      setFilteredRides([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load rides and stats when component mounts or status filter changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchRides(0, statusFilter, searchQuery);
      fetchRideStats();
    }
  }, [isAuthenticated, statusFilter]);

  // Debounced search effect
  useEffect(() => {
    if (isAuthenticated) {
      const timeoutId = setTimeout(() => {
        fetchRides(0, statusFilter, searchQuery);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, isAuthenticated, statusFilter]);

  // Remove client-side filtering since it's now done at API level
  useEffect(() => {
    // No longer needed - filtering is done server-side
    setFilteredRides(rides);
  }, [rides]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format duration in minutes
  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  // Format distance in km
  const formatDistance = (meters: number) => {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  };

  const handleRefresh = () => {
    fetchRides(currentPage, statusFilter, searchQuery);
  };

  const handlePageChange = (page: number) => {
    fetchRides(page, statusFilter, searchQuery);
  };

  const handleViewDetails = (ride: Ride) => {
    setSelectedRide(ride);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedRide(null);
  };

  // Status transition functions (removed as requested)

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Show loading spinner
  if (isLoading && rides.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <AnimatedPage>
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Viagens</h1>
            <p className="text-gray-600 mt-1">
              Visualize e gerencie todas as viagens de carona da plataforma
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center text-gray-700"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por origem, destino, CNH, modelo ou placa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="AGENDADA">Agendada</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Viagens</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rideStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {rideStats.agendada}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {rideStats.emAndamento}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {rideStats.finalizada}
              </div>
            </CardContent>
          </Card>
        </div>

        {filteredRides.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-carona-50 mb-4">
              <Car className="h-8 w-8 text-carona-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Nenhuma viagem encontrada
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery || statusFilter !== "all" 
                ? "Tente ajustar os filtros para encontrar viagens."
                : "Não há viagens cadastradas no sistema."
              }
            </p>
          </div>
        ) : (
          <>
            {/* Rides Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Viagem
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Motorista
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Passageiros
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRides.map((ride) => (
                      <tr key={ride.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                <MapPin className="h-4 w-4 text-green-600 mr-1" />
                                {ride.pontoPartida}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center mt-1">
                                <MapPin className="h-4 w-4 text-red-600 mr-1" />
                                {ride.pontoDestino}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {formatDistance(ride.distanciaEstimadaMetros)} • {formatDuration(ride.tempoEstimadoSegundos)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Motorista #{ride.motorista.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            CNH: {ride.motorista.cnh}
                          </div>
                          <div className="text-xs text-gray-400">
                            {ride.motorista.carro?.modelo} • {ride.motorista.carro?.placa}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(ride.dataHoraPartida)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Chegada: {formatDate(ride.dataHoraChegada)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={statusConfig[ride.status].color}>
                            {statusConfig[ride.status].label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ride.passageiros.length} / {ride.vagas}
                          </div>
                          <div className="text-xs text-gray-500">
                            {ride.vagas - ride.passageiros.length} vagas disponíveis
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(ride)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver no mapa"
                            >
                              <Map className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(ride)}
                              className="text-carona-600 hover:text-carona-900"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 0 && handlePageChange(currentPage - 1)}
                      className={currentPage <= 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => handlePageChange(index)}
                        isActive={currentPage === index}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages - 1 && handlePageChange(currentPage + 1)}
                      className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>

      {/* Ride Details Modal */}
      {selectedRide && isDetailsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detalhes da Viagem</h2>
                  <p className="text-sm text-gray-500 mt-1">ID: {selectedRide.id}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCloseDetails} className="text-2xl">
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Route Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações da Rota</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Origem</label>
                        <p className="text-sm text-gray-900 flex items-center">
                          <MapPin className="h-4 w-4 text-green-600 mr-1" />
                          {selectedRide.pontoPartida}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Destino</label>
                        <p className="text-sm text-gray-900 flex items-center">
                          <MapPin className="h-4 w-4 text-red-600 mr-1" />
                          {selectedRide.pontoDestino}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Partida</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedRide.dataHoraPartida)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Chegada Prevista</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedRide.dataHoraChegada)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Distância</label>
                        <p className="text-sm text-gray-900">{formatDistance(selectedRide.distanciaEstimadaMetros)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tempo Estimado</label>
                        <p className="text-sm text-gray-900">{formatDuration(selectedRide.tempoEstimadoSegundos)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Vagas</label>
                        <p className="text-sm text-gray-900">{selectedRide.passageiros.length} / {selectedRide.vagas}</p>
                      </div>
                    </div>
                  </div>

                  {/* Route Map */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Mapa da Rota</h3>
                    <RideMap ride={selectedRide} height="300px" />
                  </div>

                  {/* Driver Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Motorista</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Motorista</label>
                        <p className="text-sm font-medium text-gray-900">Motorista #{selectedRide.motorista.id}</p>
                        <p className="text-sm text-gray-600">CNH: {selectedRide.motorista.cnh}</p>
                        {selectedRide.motorista.whatsapp && (
                          <p className="text-sm text-gray-600">WhatsApp: {selectedRide.motorista.whatsapp}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Veículo</label>
                        <p className="text-sm text-gray-900">
                          {selectedRide.motorista.carro?.modelo} • {selectedRide.motorista.carro?.cor}
                        </p>
                        <p className="text-sm text-gray-600">Placa: {selectedRide.motorista.carro?.placa}</p>
                      </div>
                    </div>
                  </div>

                  {/* Passengers */}
                  {selectedRide.passageiros.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Passageiros ({selectedRide.passageiros.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedRide.passageiros.map((passageiro) => (
                          <div key={passageiro.id} className="bg-white rounded-lg p-3 border">
                            <p className="text-sm font-medium text-gray-900">{passageiro.nome}</p>
                            <p className="text-sm text-gray-600">{passageiro.email}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Observations */}
                  {selectedRide.observacoes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
                      <p className="text-sm text-gray-900 bg-white rounded-lg p-3 border">
                        {selectedRide.observacoes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status and Actions Panel */}
                <div className="space-y-6">
                  {/* Status Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Status da Viagem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <Badge className={`${statusConfig[selectedRide.status].color} text-lg px-4 py-2`}>
                          {statusConfig[selectedRide.status].label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions Card - Removed as requested */}

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estatísticas Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vagas Ocupadas:</span>
                        <span className="font-medium">
                          {selectedRide.passageiros.length}/{selectedRide.vagas}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taxa de Ocupação:</span>
                        <span className="font-medium">
                          {Math.round((selectedRide.passageiros.length / selectedRide.vagas) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vagas Restantes:</span>
                        <span className="font-medium">
                          {selectedRide.vagas - selectedRide.passageiros.length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default RideManagement;
