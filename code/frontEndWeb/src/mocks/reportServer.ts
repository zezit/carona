// Simulação de banco de dados em memória
let reports: any[] = [];

// Funções do servidor mock
export const reportServer = {
  // Buscar todos os relatórios
  getAllReports: () => {
    return {
      success: true,
      data: reports
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
  createReport: (reportData: any) => {
    const newReport = {
      id: Date.now().toString(), // ID simples baseado no timestamp
      ...reportData,
      createdAt: new Date().toISOString()
    };
    reports.push(newReport);
    return {
      success: true,
      data: newReport
    };
  },

  // Atualizar relatório
  updateReport: (id: string, reportData: any) => {
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
  }
}; 