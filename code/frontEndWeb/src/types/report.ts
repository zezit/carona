 export interface Report {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // ISO date string
  autor: string;
  status?: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}

export interface CreateReportDTO {
  titulo: string;
  descricao: string;
  data: string; // ISO date string (YYYY-MM-DD)
  autor: string;
}

export interface UpdateReportDTO {
  titulo?: string;
  descricao?: string;
  data?: string; // ISO date string (YYYY-MM-DD)
  autor?: string;
  status?: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
}

export interface MetricData {
  period: string;
  rides: number;
  passengers: number;
  drivers: number;
}

export interface RideMetricsResponse {
  success: boolean;
  data: MetricData[];
  message?: string;
}

export interface ReportResponse {
  success: boolean;
  data: Report;
  message?: string;
}

export interface ReportsListResponse {
  success: boolean;
  data: Report[];
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
  message?: string;
}