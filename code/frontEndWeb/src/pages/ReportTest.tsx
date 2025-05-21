import { useState } from 'react';
import { api } from '@/lib/api';

export function ReportTest() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newReport, setNewReport] = useState({
    titulo: '',
    descricao: ''
  });

  // Test function to get all reports
  const testGetAllReports = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.reports.getAllReports();
      if (response.success) {
        setReports(response.data);
        setSuccess('Relatórios carregados com sucesso!');
      } else {
        setError('Erro ao carregar relatórios');
      }
    } catch (err) {
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  // Test function to create a report
  const testCreateReport = async () => {
    if (!newReport.titulo || !newReport.descricao) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.reports.createReport({
        ...newReport,
        data: new Date().toISOString()
      });
      
      if (response.success) {
        setSuccess('Relatório criado com sucesso!');
        setNewReport({ titulo: '', descricao: '' });
        // Refresh the reports list
        testGetAllReports();
      } else {
        setError('Erro ao criar relatório');
      }
    } catch (err) {
      setError('Erro ao criar relatório');
    } finally {
      setLoading(false);
    }
  };

  // Test function to delete a report
  const testDeleteReport = async (reportId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.reports.deleteReport(reportId);
      if (response.success) {
        setSuccess('Relatório deletado com sucesso!');
        // Refresh the reports list
        testGetAllReports();
      } else {
        setError('Erro ao deletar relatório');
      }
    } catch (err) {
      setError('Erro ao deletar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Teste de Relatórios</h1>
      
      <div className="space-y-4">
        {/* Formulário de criação */}
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Criar Novo Relatório</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                type="text"
                value={newReport.titulo}
                onChange={(e) => setNewReport(prev => ({ ...prev, titulo: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Digite o título"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                value={newReport.descricao}
                onChange={(e) => setNewReport(prev => ({ ...prev, descricao: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Digite a descrição"
                rows={3}
              />
            </div>
            <button
              onClick={testCreateReport}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Criando...' : 'Criar Relatório'}
            </button>
          </div>
        </div>

        {/* Botão de atualizar lista */}
        <button
          onClick={testGetAllReports}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Carregando...' : 'Atualizar Lista'}
        </button>

        {/* Mensagens de feedback */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Lista de relatórios */}
        {reports.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Relatórios:</h2>
            <div className="space-y-2">
              {reports.map((report) => (
                <div key={report.id} className="p-4 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{report.titulo}</h3>
                      <p className="mt-1">{report.descricao}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Criado em: {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => testDeleteReport(report.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 