import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/AnimatedPage";
import { AnimatedCard } from "@/components/AnimatedCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { 
  RefreshCw, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Car,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { reportServer } from "@/mocks/reportServer";
import { ApiResponse } from "@/types/report";

const COLORS = ["#DC2626", "#16A34A", "#CA8A04", "#2563EB", "#7C3AED"];

interface MetricData {
  period: string;
  rides: number;
  passengers: number;
  drivers: number;
}

export default function Report() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
    }
  }, [timeRange, isAuthenticated]);

  const fetchMetrics = async () => {
  setIsLoading(true);
  setError(null);
  try {
    // <-- alterando
    // Tenta usar a API real primeiro
    const response = await api.reports.getRideMetrics(timeRange);

    
    if (response.success && response.data && response.data.length > 0) {
      console.log('API funcionou, usando dados da API:', response.data);
      setMetrics(response.data);
    } else {
      // API não funcionou, usa mock
      const mockResponse =  reportServer.getRideMetrics(timeRange);
      
      if (mockResponse.success && mockResponse.data) {
        setMetrics(mockResponse.data);
      } else {
        setError(mockResponse.message || 'Não foi possível carregar as métricas');
        toast.error(mockResponse.message || 'Erro ao carregar métricas');
      }
    }
    // fim da alteração -->
  } catch (err: any) {
    console.error('Erro completo:', err);
    setError('Ocorreu um erro ao carregar as métricas');
    toast.error('Erro ao carregar métricas');
  } finally {
    setIsLoading(false);
  }
};

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Redirect if not authenticated
  // if (!isAuthenticated) {
  //   return <Navigate to="/" />;
  // }

  const getTotalMetrics = () => {
    return metrics.reduce((acc, curr) => ({
      rides: acc.rides + curr.rides,
      passengers: acc.passengers + curr.passengers,
      drivers: acc.drivers + curr.drivers,
    }), { rides: 0, passengers: 0, drivers: 0 });
  };

  const totals = getTotalMetrics();

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      default: return 'Mensal';
    }
  };

  if (error) {
    return (
      <AnimatedPage>
        <Navbar />
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Erro ao carregar dados
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={fetchMetrics}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </main>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Métricas de Viagens</h1>
            <p className="text-gray-600 mt-1">
              Análise visual dos dados da plataforma
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setTimeRange('daily')}
              variant={timeRange === 'daily' ? 'default' : 'outline'}
              size="sm"
              className={timeRange === 'daily' ? 'bg-carona-600 hover:bg-carona-700' : ''}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Diário
            </Button>
            <Button
              onClick={() => setTimeRange('weekly')}
              variant={timeRange === 'weekly' ? 'default' : 'outline'}
              size="sm"
              className={timeRange === 'weekly' ? 'bg-carona-600 hover:bg-carona-700' : ''}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Semanal
            </Button>
            <Button
              onClick={() => setTimeRange('monthly')}
              variant={timeRange === 'monthly' ? 'default' : 'outline'}
              size="sm"
              className={timeRange === 'monthly' ? 'bg-carona-600 hover:bg-carona-700' : ''}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Mensal
            </Button>
            <Button
              onClick={fetchMetrics}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin-slow h-8 w-8 border-4 border-carona-500 border-t-transparent rounded-full"></div>
          </div>
        ) : metrics.length === 0 ? (
          <div className="bg-white rounded-lg shadow-subtle p-8 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-carona-50 mb-4">
              <BarChart3 className="h-8 w-8 text-carona-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Nenhum dado disponível
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Não há dados para o período {getTimeRangeLabel(timeRange).toLowerCase()} selecionado.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo */}
            <AnimatedCard className="bg-white rounded-lg shadow-subtle p-6">
              <div className="flex items-center mb-6">
                <TrendingUp className="w-6 h-6 text-carona-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Resumo - Período {getTimeRangeLabel(timeRange)}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-blue-700 mb-1">Total de Viagens</h3>
                      <p className="text-2xl font-bold text-blue-900">{totals.rides.toLocaleString()}</p>
                    </div>
                    <Car className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-green-700 mb-1">Total de Passageiros</h3>
                      <p className="text-2xl font-bold text-green-900">{totals.passengers.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-orange-700 mb-1">Total de Motoristas</h3>
                      <p className="text-2xl font-bold text-orange-900">{totals.drivers.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Barras - Viagens */}
              <AnimatedCard className="bg-white rounded-lg shadow-subtle p-6">
                <div className="flex items-center mb-4">
                  <BarChart3 className="w-5 h-5 text-carona-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Viagens por Período</h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="rides" 
                        name="Viagens" 
                        fill="#DC2626"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedCard>

              {/* Gráfico de Linha - Passageiros */}
              <AnimatedCard className="bg-white rounded-lg shadow-subtle p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-carona-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Passageiros por Período</h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="passengers"
                        name="Passageiros"
                        stroke="#16A34A"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#16A34A' }}
                        activeDot={{ r: 6, fill: '#16A34A' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedCard>
            </div>

            {/* Gráfico de Pizza - Motoristas */}
            <AnimatedCard className="bg-white rounded-lg shadow-subtle p-6">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-carona-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Distribuição de Motoristas por Período</h3>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics}
                      dataKey="drivers"
                      nameKey="period"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, value, percent }) => 
                        `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                      }
                      labelLine={false}
                    >
                      {metrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          </div>
        )}
      </main>
    </AnimatedPage>
  );
}