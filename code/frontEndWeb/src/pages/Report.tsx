import React from "react";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "../components/ui/chart";
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
} from "recharts";

const barData = [
  { name: "Jan", users: 400, rides: 240 },
  { name: "Feb", users: 300, rides: 139 },
  { name: "Mar", users: 200, rides: 980 },
  { name: "Apr", users: 278, rides: 390 },
  { name: "May", users: 189, rides: 480 },
];

const lineData = [
  { name: "Week 1", active: 40 },
  { name: "Week 2", active: 30 },
  { name: "Week 3", active: 20 },
  { name: "Week 4", active: 27 },
];

const pieData = [
  { name: "Motoristas", value: 60 },
  { name: "Passageiros", value: 40 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const chartConfig = {
  users: { label: "Usuários", color: COLORS[0] },
  rides: { label: "Caronas", color: COLORS[1] },
  active: { label: "Ativos", color: COLORS[2] },
  Motoristas: { label: "Motoristas", color: COLORS[0] },
  Passageiros: { label: "Passageiros", color: COLORS[1] },
};

export default function Report() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">Relatório Geral</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gráfico de Barras */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Usuários e Caronas por Mês</h2>
            <ChartContainer config={chartConfig}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltipContent />
                <ChartLegendContent />
                <Bar dataKey="users" fill={COLORS[0]} />
                <Bar dataKey="rides" fill={COLORS[1]} />
              </BarChart>
            </ChartContainer>
          </div>
          {/* Gráfico de Linha */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Usuários Ativos por Semana</h2>
            <ChartContainer config={chartConfig}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltipContent />
                <ChartLegendContent />
                <Line type="monotone" dataKey="active" stroke={COLORS[2]} strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </div>
          {/* Gráfico de Pizza */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 col-span-1 md:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Distribuição de Usuários</h2>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltipContent />
                <ChartLegendContent />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 