import { Report, CreateReportDTO, UpdateReportDTO } from '@/types/report';

// Mock data for reports
const reports: Report[] = [
  {
    id: 1,
    title: "Relatório de Viagens - Janeiro",
    description: "Análise das viagens realizadas em janeiro",
    status: "APROVADO",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
  },
  {
    id: 2,
    title: "Relatório de Viagens - Fevereiro",
    description: "Análise das viagens realizadas em fevereiro",
    status: "PENDENTE",
    createdAt: "2024-02-01T09:15:00Z",
    updatedAt: "2024-02-01T09:15:00Z",
  },
];

// Mock data for ride metrics
const rideMetrics = {
  monthly: [
    {
      month: "Jan",
      rides: 45,
      passengers: 120,
      drivers: 25,
    },
    {
      month: "Fev",
      rides: 52,
      passengers: 145,
      drivers: 28,
    },
    {
      month: "Mar",
      rides: 48,
      passengers: 130,
      drivers: 26,
    },
    {
      month: "Abr",
      rides: 55,
      passengers: 160,
      drivers: 30,
    },
    {
      month: "Mai",
      rides: 60,
      passengers: 180,
      drivers: 32,
    },
    {
      month: "Jun",
      rides: 65,
      passengers: 200,
      drivers: 35,
    },
  ],
  weekly: [
    {
      week: "Semana 1",
      rides: 15,
      passengers: 40,
      drivers: 10,
    },
    {
      week: "Semana 2",
      rides: 18,
      passengers: 50,
      drivers: 12,
    },
    {
      week: "Semana 3",
      rides: 20,
      passengers: 55,
      drivers: 13,
    },
    {
      week: "Semana 4",
      rides: 22,
      passengers: 60,
      drivers: 14,
    },
  ],
  daily: [
    {
      day: "Segunda",
      rides: 8,
      passengers: 25,
      drivers: 5,
    },
    {
      day: "Terça",
      rides: 10,
      passengers: 30,
      drivers: 6,
    },
    {
      day: "Quarta",
      rides: 12,
      passengers: 35,
      drivers: 7,
    },
    {
      day: "Quinta",
      rides: 15,
      passengers: 40,
      drivers: 8,
    },
    {
      day: "Sexta",
      rides: 20,
      passengers: 50,
      drivers: 10,
    },
  ],
};

// Mock server functions
export const reportServer = {
  // Report functions
  getAllReports: () => {
    return Promise.resolve({
      success: true,
      data: reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    });
  },

  getReportById: (id: number) => {
    const report = reports.find((r) => r.id === id);
    return Promise.resolve({
      success: !!report,
      data: report || null,
    });
  },

  createReport: (data: CreateReportDTO) => {
    const newReport: Report = {
      id: reports.length + 1,
      ...data,
      status: "PENDENTE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reports.push(newReport);
    return Promise.resolve({
      success: true,
      data: newReport,
    });
  },

  updateReport: (id: number, data: UpdateReportDTO) => {
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) {
      return Promise.resolve({
        success: false,
        data: null,
      });
    }

    reports[index] = {
      ...reports[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return Promise.resolve({
      success: true,
      data: reports[index],
    });
  },

  deleteReport: (id: number) => {
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) {
      return Promise.resolve({
        success: false,
        data: null,
      });
    }

    reports.splice(index, 1);
    return Promise.resolve({
      success: true,
      data: null,
    });
  },

  approveReport: (id: number) => {
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) {
      return Promise.resolve({
        success: false,
        data: null,
      });
    }

    reports[index] = {
      ...reports[index],
      status: "APROVADO",
      updatedAt: new Date().toISOString(),
    };

    return Promise.resolve({
      success: true,
      data: reports[index],
    });
  },

  rejectReport: (id: number) => {
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) {
      return Promise.resolve({
        success: false,
        data: null,
      });
    }

    reports[index] = {
      ...reports[index],
      status: "REJEITADO",
      updatedAt: new Date().toISOString(),
    };

    return Promise.resolve({
      success: true,
      data: reports[index],
    });
  },

  // Ride metrics functions
  getRideMetrics: (period: 'daily' | 'weekly' | 'monthly') => {
    return Promise.resolve({
      success: true,
      data: rideMetrics[period],
    });
  },
}; 