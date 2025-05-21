import { Report, CreateReportDTO, UpdateReportDTO } from '@/types/report';

// Simulação de banco de dados em memória
let reports: Report[] = [];

// Funções do servidor mock
export const reportServer = {
  // Buscar todos os relatórios
  getAllReports: () => {
    return {
      success: true,
      data: reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    };
  },

  // Buscar relatório por ID
  getReportById: (id: string) => {
    const report = reports.find(r => r.id === id);
    return {
      success: !!report,
      data: report || null
    };
  },

  // Criar novo relatório
  createReport: (reportData: CreateReportDTO) => {
    const newReport: Report = {
      id: Date.now().toString(),
      ...reportData,
      status: 'PENDENTE',
      createdAt: new Date().toISOString()
    };
    reports.push(newReport);
    return {
      success: true,
      data: newReport
    };
  },

  // Atualizar relatório
  updateReport: (id: string, reportData: UpdateReportDTO) => {
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) {
      return {
        success: false,
        error: 'Relatório não encontrado'
      };
    }

    reports[index] = {
      ...reports[index],
      ...reportData,
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: reports[index]
    };
  },

  // Deletar relatório
  deleteReport: (id: string) => {
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) {
      return {
        success: false,
        error: 'Relatório não encontrado'
      };
    }

    reports = reports.filter(r => r.id !== id);
    return {
      success: true,
      data: null
    };
  },

  // Aprovar relatório
  approveReport: (id: string) => {
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) {
      return {
        success: false,
        error: 'Relatório não encontrado'
      };
    }

    reports[index] = {
      ...reports[index],
      status: 'APROVADO',
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: reports[index]
    };
  },

  // Rejeitar relatório
  rejectReport: (id: string) => {
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) {
      return {
        success: false,
        error: 'Relatório não encontrado'
      };
    }

    reports[index] = {
      ...reports[index],
      status: 'REJEITADO',
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: reports[index]
    };
  }
}; 