import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Report as ReportType, CreateReportDTO } from '@/types/report';
import { toast } from 'sonner';
import { AnimatedPage } from '@/components/AnimatedPage';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedList, AnimatedListItem } from '@/components/AnimatedList';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  RefreshCw, 
  Plus, 
  FileText, 
  Calendar, 
  User, 
  Check, 
  X, 
  Trash2,
  Clock
} from 'lucide-react';
import { reportServer } from '@/mocks/reportServer';
//import { reportServer } from '@/mocks/reportServer';

export function ReportTest() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [reports, setReports] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newReport, setNewReport] = useState<CreateReportDTO>({
    titulo: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    autor: 'Usuário Teste'
  });

  // Carregar relatórios ao montar o componente
  useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated]);

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Redirect if not authenticated
  // if (!isAuthenticated) {
  //   return <Navigate to="/" />;
  // }

  // Função para buscar relatórios
  const fetchReports = async () => {
  setLoading(true);
  console.log('Iniciando fetchReports...');
  
  try {
    // <-- alterando
    // Tenta usar a API real primeiro
    console.log('Tentando API real para getAllReports...');
    const response = await api.reports.getAllReports();
    console.log('Resposta API getAllReports:', response);
    
    if (response.success && response.data.length > 0 ) {
      console.log('API funcionou, usando dados da API:', response.data);
      setReports((response.data || []) as unknown as ReportType[]);
    } else {
      // API não funcionou, usa mock
      console.warn('API retornou success: false, usando mock:', response);

      const mockResponse = reportServer.getAllReports();
      console.log('Resposta do mock getAllReports:', mockResponse);
      
      if (mockResponse.success) {
        setReports((mockResponse.data || []) as unknown as ReportType[]);
      } else {
        toast.error('Erro ao carregar relatórios');
      }
    }
    // fim da alteração -->
  } catch (err: any) {
    console.error('Erro completo em fetchReports:', err);
    toast.error('Erro ao carregar relatórios');
  } finally {
    setLoading(false);
  }
};

// Função para criar relatório
const handleCreateReport = async () => {
  if (!newReport.titulo || !newReport.descricao) {
    toast.error('Por favor, preencha todos os campos obrigatórios');
    return;
  }

  setIsCreating(true);
  
  try {
    // Tenta usar a API real primeiro
    
    const response = await api.reports.createReport(newReport);
    if (response.success) {
      toast.success('Relatório criado com sucesso!');
      setNewReport({
        titulo: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        autor: 'Usuário Teste'
      });
      fetchReports();
    } else {
      // API não funcionou, usa mock
      const mockResponse = reportServer.createReport(newReport);
      
      if (mockResponse.success) {
        toast.success('Relatório criado com sucesso!');
        setNewReport({
          titulo: '',
          descricao: '',
          data: new Date().toISOString().split('T')[0],
          autor: 'Usuário Teste'
        });
        fetchReports();
      } else {
        toast.error(mockResponse.message || 'Erro ao criar relatório');
      }
    }
  } catch (err: any) {
    console.error('Erro completo em createReport:', err);
    toast.error('Erro ao criar relatório');
  } finally {
    setIsCreating(false);
  }
};

// Função para deletar relatório
const handleDeleteReport = async (reportId: string) => {
  if (!confirm('Tem certeza que deseja deletar este relatório?')) {
    return;
  }

  try {
    const response = await api.reports.deleteReport(reportId);
    
    if (response.success) {
      toast.success(response.message || 'Relatório deletado com sucesso!');
      fetchReports();
    } else {
      // API não funcionou, usa mock
      const mockResponse = reportServer.deleteReport(reportId);
      
      if (mockResponse.success) {
        toast.success(mockResponse.message || 'Relatório deletado com sucesso!');
        fetchReports();
      } else {
        toast.error(mockResponse.message || 'Erro ao deletar relatório');
      }
    }
  } catch (err: any) {
    console.error('Erro completo em deleteReport:', err);
    toast.error('Erro ao deletar relatório');
  }
};

// Função para aprovar relatório
const handleApproveReport = async (reportId: string) => {
  try {
    const response = await api.reports.approveReport(reportId);

    
    if (response.success) {
      toast.success('Relatório aprovado com sucesso!');
      fetchReports();
    } else {
      // API não funcionou, usa mock
      const mockResponse = reportServer.approveReport(reportId);
      
      if (mockResponse.success) {
        toast.success('Relatório aprovado com sucesso!');
        fetchReports();
      } else {
        toast.error(mockResponse.message || 'Erro ao aprovar relatório');
      }
    }
  } catch (err: any) {
    console.error('Erro completo em approveReport:', err);
    toast.error('Erro ao aprovar relatório');
  }
};

// Função para rejeitar relatório
const handleRejectReport = async (reportId: string) => {
  try {
    
    const response = await api.reports.rejectReport(reportId);
    
    if (response.success) {
      toast.success('Relatório rejeitado com sucesso!');
      fetchReports();
    } else {
      // API não funcionou, usa mock
      const mockResponse = reportServer.rejectReport(reportId);
      
      if (mockResponse.success) {
        toast.success('Relatório rejeitado com sucesso!');
        fetchReports();
      } else {
        toast.error(mockResponse.message || 'Erro ao rejeitar relatório');
      }
    }
  
  } catch (err: any) {
    console.error('Erro completo em rejectReport:', err);
    toast.error('Erro ao rejeitar relatório');
  }
};

  // Função para obter a cor e ícone do status
  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'APROVADO':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Check className="w-3 h-3" />,
          text: 'Aprovado'
        };
      case 'REJEITADO':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <X className="w-3 h-3" />,
          text: 'Rejeitado'
        };
      default:
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="w-3 h-3" />,
          text: 'Pendente'
        };
    }
  };

  return (
    <AnimatedPage>
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Relatórios</h1>
            <p className="text-gray-600 mt-1">
              Crie, gerencie e aprove relatórios do sistema
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchReports}
            className="flex items-center text-gray-700"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de criação */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-subtle p-6 sticky top-24">
              <div className="flex items-center mb-4">
                <Plus className="w-5 h-5 text-carona-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Novo Relatório</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newReport.titulo}
                    onChange={(e) => setNewReport(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-carona-500 focus:border-carona-500 transition-colors"
                    placeholder="Digite o título"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    value={newReport.descricao}
                    onChange={(e) => setNewReport(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-carona-500 focus:border-carona-500 transition-colors"
                    placeholder="Digite a descrição"
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={newReport.data}
                    onChange={(e) => setNewReport(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-carona-500 focus:border-carona-500 transition-colors"
                  />
                </div>
                
                <Button
                  onClick={handleCreateReport}
                  disabled={isCreating || !newReport.titulo || !newReport.descricao}
                  className="w-full bg-carona-600 hover:bg-carona-700"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Relatório
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de relatórios */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin-slow h-8 w-8 border-4 border-carona-500 border-t-transparent rounded-full"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white rounded-lg shadow-subtle p-8 text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-carona-50 mb-4">
                  <FileText className="h-8 w-8 text-carona-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Nenhum relatório encontrado
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Crie seu primeiro relatório usando o formulário ao lado.
                </p>
              </div>
            ) : (
              
              <AnimatedList className="space-y-4">
                {reports.map((report) => {
                  const statusInfo = getStatusInfo(report.status);
                  return (
                    <AnimatedCard>
                    <AnimatedListItem key={report.id}>
                      <div className="bg-white rounded-lg shadow-subtle p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <FileText className="w-5 h-5 text-carona-600" />
                              <h3 className="font-bold text-lg text-gray-900">{report.titulo}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                {statusInfo.icon}
                                {statusInfo.text}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-4">{report.descricao}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Autor: {report.autor}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Data: {new Date(report.data).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Criado: {new Date(report.createdAt).toLocaleString('pt-BR')}</span>
                              </div>
                              {report.updatedAt && (
                                <div className="flex items-center gap-2">
                                  <RefreshCw className="w-4 h-4" />
                                  <span>Atualizado: {new Date(report.updatedAt).toLocaleString('pt-BR')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            {report.status === 'PENDENTE' && (
                              <>
                                <Button
                                  onClick={() => handleApproveReport(report.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  onClick={() => handleRejectReport(report.id)}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            <Button
                              onClick={() => handleDeleteReport(report.id)}
                              size="sm"
                              variant="outline"
                              className="text-gray-600 hover:text-red-600 hover:border-red-300"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Deletar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AnimatedListItem>
                    </AnimatedCard>
                  );
                })}
              </AnimatedList>
              
            )}
          </div>
        </div>
      </main>
    </AnimatedPage>
  );
}