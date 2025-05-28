import { Report, CreateReportDTO, UpdateReportDTO, ApiResponse, MetricData } from '@/types/report';

class ReportServer {
  private reports: Report[] = [
    {
      id: '1',
      titulo: 'Relatório de Usuários - Janeiro',
      descricao: 'Análise completa dos usuários cadastrados em janeiro de 2024',
      data: '2024-01-31',
      autor: 'Admin Sistema',
      status: 'APROVADO',
      createdAt: '2024-01-31T10:00:00Z',
      updatedAt: '2024-01-31T14:30:00Z'
    },
    {
      id: '2',
      titulo: 'Relatório de Viagens - Fevereiro',
      descricao: 'Métricas de viagens realizadas no mês de fevereiro',
      data: '2024-02-29',
      autor: 'João Silva',
      status: 'PENDENTE',
      createdAt: '2024-02-29T09:15:00Z'
    },
    {
      id: '3',
      titulo: 'Análise de Performance - Q1',
      descricao: 'Relatório trimestral de performance da plataforma',
      data: '2024-03-31',
      autor: 'Maria Santos',
      status: 'REJEITADO',
      createdAt: '2024-03-31T16:45:00Z',
      updatedAt: '2024-04-01T08:20:00Z'
    }
  ];
    private mockMetrics = {
    daily: [
      { period: '2024-05-20', rides: 45, passengers: 78, drivers: 23 },
      { period: '2024-05-21', rides: 52, passengers: 89, drivers: 28 },
      { period: '2024-05-22', rides: 38, passengers: 65, drivers: 19 },
      { period: '2024-05-23', rides: 61, passengers: 102, drivers: 32 },
      { period: '2024-05-24', rides: 55, passengers: 95, drivers: 29 },
      { period: '2024-05-25', rides: 43, passengers: 71, drivers: 21 },
      { period: '2024-05-26', rides: 49, passengers: 84, drivers: 26 }
    ],
    weekly: [
      { period: 'Semana 1', rides: 234, passengers: 412, drivers: 87 },
      { period: 'Semana 2', rides: 289, passengers: 501, drivers: 102 },
      { period: 'Semana 3', rides: 267, passengers: 445, drivers: 94 },
      { period: 'Semana 4', rides: 312, passengers: 578, drivers: 115 }
    ],
    monthly: [
      { period: 'Janeiro', rides: 1245, passengers: 2134, drivers: 345 },
      { period: 'Fevereiro', rides: 1367, passengers: 2456, drivers: 389 },
      { period: 'Março', rides: 1523, passengers: 2789, drivers: 423 },
      { period: 'Abril', rides: 1456, passengers: 2678, drivers: 401 },
      { period: 'Maio', rides: 1678, passengers: 3012, drivers: 467 }
    ]
  };

  getAllReports(): ApiResponse<Report[]> {
    return {
      success: true,
      data: [...this.reports]
    };
  }

  getReportById(reportId: string): ApiResponse<Report> {
    const report = this.reports.find(r => r.id === reportId);
    if (report) {
      return {
        success: true,
        data: report
      };
    }
    return {
      success: false,
      message: 'Relatório não encontrado'
    };
  }

  createReport(reportData: CreateReportDTO): ApiResponse<Report> {
    const newReport: Report = {
      id: Date.now().toString(),
      ...reportData,
      status: 'PENDENTE',
      createdAt: new Date().toISOString()
    };
    
    this.reports.push(newReport);
    
    return {
      success: true,
      data: newReport
    };
  }

  updateReport(reportId: string, reportData: UpdateReportDTO): ApiResponse<Report> {
    const index = this.reports.findIndex(r => r.id === reportId);
    if (index === -1) {
      return {
        success: false,
        message: 'Relatório não encontrado'
      };
    }

    this.reports[index] = {
      ...this.reports[index],
      ...reportData,
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: this.reports[index]
    };
  }

  deleteReport(reportId: string): ApiResponse {
    const index = this.reports.findIndex(r => r.id === reportId);
    if (index === -1) {
      return {
        success: false,
        message: 'Relatório não encontrado'
      };
    }

    this.reports.splice(index, 1);
    
    return {
      success: true,
      message: 'Relatório deletado com sucesso'
    };
  }

  approveReport(reportId: string): ApiResponse<Report> {
    const index = this.reports.findIndex(r => r.id === reportId);
    if (index === -1) {
      return {
        success: false,
        message: 'Relatório não encontrado'
      };
    }

    this.reports[index] = {
      ...this.reports[index],
      status: 'APROVADO',
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: this.reports[index]
    };
  }

  rejectReport(reportId: string): ApiResponse<Report> {
    const index = this.reports.findIndex(r => r.id === reportId);
    if (index === -1) {
      return {
        success: false,
        message: 'Relatório não encontrado'
      };
    }

    this.reports[index] = {
      ...this.reports[index],
      status: 'REJEITADO',
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: this.reports[index]
    };
  }
    getRideMetrics(period: 'daily' | 'weekly' | 'monthly'): ApiResponse<MetricData[]> {
    console.log('Simple mock getRideMetrics called with period:', period);
    
    const data = this.mockMetrics[period];
    console.log('Simple mock returning data:', data);
    
    if (data && data.length > 0) {
      return {
        success: true,
        data: data
      };
    } else {
      return {
        success: false,
        message: `Nenhum dado encontrado para o período ${period}`,
        data: []
      };
    }
  }


  // NEW: Mock function for dashboard summary
  getDashboardSummary(): ApiResponse<any> {
    const totalMetrics = Object.values(this.mockMetrics.monthly).reduce(
      (acc, curr) => ({
        rides: acc.rides + curr.rides,
        passengers: acc.passengers + curr.passengers,
        drivers: acc.drivers + curr.drivers
      }),
      { rides: 0, passengers: 0, drivers: 0 }
    );

    return {
      success: true,
      data: {
        totalUsers: 1247,
        totalRides: totalMetrics.rides,
        totalReports: this.reports.length,
        pendingApprovals: this.reports.filter(r => r.status === 'PENDENTE').length,
        totalPassengers: totalMetrics.passengers,
        totalDrivers: totalMetrics.drivers,
        growthRate: 12.5,
        satisfaction: 4.7
      }
    };
  }
}

export const reportServer = new ReportServer();