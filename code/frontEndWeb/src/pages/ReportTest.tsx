import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Report, CreateReportDTO } from '@/types/report';
import { toast } from 'sonner';

export function ReportTest() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [newReport, setNewReport] = useState<CreateReportDTO>({
    titulo: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    autor: 'Usuário Teste'
  });

  // Carregar relatórios ao montar o componente
  useEffect(() => {
    fetchReports();
  }, []);

  // Função para buscar relatórios
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.reports.getAllReports();
      if (response.success) {
        setReports(response.data);
      } else {
        toast.error('Erro ao carregar relatórios');
      }
    } catch (err) {
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

    setLoading(true);
    try {
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
        toast.error('Erro ao criar relatório');
      }
    } catch (err) {
      toast.error('Erro ao criar relatório');
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar relatório
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Tem certeza que deseja deletar este relatório?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.reports.deleteReport(reportId);
      if (response.success) {
        toast.success('Relatório deletado com sucesso!');
        fetchReports();
      } else {
        toast.error('Erro ao deletar relatório');
      }
    } catch (err) {
      toast.error('Erro ao deletar relatório');
    } finally {
      setLoading(false);
    }
  };

  // Função para aprovar relatório
  const handleApproveReport = async (reportId: string) => {
    setLoading(true);
    try {
      const response = await api.reports.approveReport(reportId);
      if (response.success) {
        toast.success('Relatório aprovado com sucesso!');
        fetchReports();
      } else {
        toast.error('Erro ao aprovar relatório');
      }
    } catch (err) {
      toast.error('Erro ao aprovar relatório');
    } finally {
      setLoading(false);
    }
  };

  // Função para rejeitar relatório
  const handleRejectReport = async (reportId: string) => {
    setLoading(true);
    try {
      const response = await api.reports.rejectReport(reportId);
      if (response.success) {
        toast.success('Relatório rejeitado com sucesso!');
        fetchReports();
      } else {
        toast.error('Erro ao rejeitar relatório');
      }
    } catch (err) {
      toast.error('Erro ao rejeitar relatório');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter a cor do status
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'APROVADO':
        return 'bg-green-100 text-green-800';
      case 'REJEITADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Relatórios</h1>
      
      <div className="space-y-6">
        {/* Formulário de criação */}
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4">Criar Novo Relatório</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                type="text"
                value={newReport.titulo}
                onChange={(e) => setNewReport(prev => ({ ...prev, titulo: e.target.value }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o título"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição *</label>
              <textarea
                value={newReport.descricao}
                onChange={(e) => setNewReport(prev => ({ ...prev, descricao: e.target.value }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite a descrição"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input
                type="date"
                value={newReport.data}
                onChange={(e) => setNewReport(prev => ({ ...prev, data: e.target.value }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleCreateReport}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Relatório'}
            </button>
          </div>
        </div>

        {/* Lista de relatórios */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Relatórios</h2>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:bg-gray-50 transition-colors"
            >
              {loading ? 'Atualizando...' : 'Atualizar Lista'}
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum relatório encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="p-4 border rounded-lg shadow-sm bg-white">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{report.titulo}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status || 'PENDENTE'}
                        </span>
                      </div>
                      <p className="text-gray-600">{report.descricao}</p>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Autor: {report.autor}</p>
                        <p>Data: {new Date(report.data).toLocaleDateString()}</p>
                        <p>Criado em: {new Date(report.createdAt).toLocaleString()}</p>
                        {report.updatedAt && (
                          <p>Atualizado em: {new Date(report.updatedAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {report.status === 'PENDENTE' && (
                        <>
                          <button
                            onClick={() => handleApproveReport(report.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleRejectReport(report.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 