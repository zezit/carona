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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function Report() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await api.reports.getRideMetrics(timeRange);
      if (response.success) {
        setMetrics(response.data);
      } else {
        toast.error('Erro ao carregar métricas');
      }
    } catch (err) {
      toast.error('Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  const getXAxisKey = () => {
    switch (timeRange) {
      case 'daily':
        return 'day';
      case 'weekly':
        return 'week';
      case 'monthly':
        return 'month';
    }
  };

  const getTotalMetrics = () => {
    return metrics.reduce((acc, curr) => ({
      rides: acc.rides + curr.rides,
      passengers: acc.passengers + curr.passengers,
      drivers: acc.drivers + curr.drivers,
    }), { rides: 0, passengers: 0, drivers: 0 });
  };

  const totals = getTotalMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Métricas de Viagens</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('daily')}
              className={`px-4 py-2 rounded ${
                timeRange === 'daily'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Diário
            </button>
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-4 py-2 rounded ${
                timeRange === 'weekly'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-4 py-2 rounded ${
                timeRange === 'monthly'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Mensal
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Resumo */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 col-span-1 md:col-span-2">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                Resumo do Período
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">Total de Viagens</h3>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {totals.rides}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="text-lg font-medium text-green-700 dark:text-green-300">Total de Passageiros</h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {totals.passengers}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h3 className="text-lg font-medium text-yellow-700 dark:text-yellow-300">Total de Motoristas</h3>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {totals.drivers}
                  </p>
                </div>
              </div>
            </div>

            {/* Gráfico de Barras - Viagens */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                Viagens por Período
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={getXAxisKey()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rides" name="Viagens" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Linha - Passageiros */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                Passageiros por Período
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={getXAxisKey()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="passengers"
                      name="Passageiros"
                      stroke={COLORS[1]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Pizza - Motoristas */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 col-span-1 md:col-span-2">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                Distribuição de Motoristas por Período
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics}
                      dataKey="drivers"
                      nameKey={getXAxisKey()}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {metrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 