export interface DashboardStats {
  totalPatients: number;
  activeProtocols: number;
  recentLabs: number;
  averageAdherence: number;
}

export interface AdherenceStats {
  totalItems: number;
  completedItems: number;
  percentage: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface LabChartData {
  testName: string;
  data: ChartDataPoint[];
  color: string;
}
