'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Car, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const stats = [
  { name: 'Leads este mês', value: 12, change: '+20%', icon: Users, color: 'text-blue-600' },
  { name: 'Orçamentos enviados', value: 8, change: '+15%', icon: FileText, color: 'text-yellow-600' },
  { name: 'Conversão', value: '65%', change: '+5%', icon: TrendingUp, color: 'text-green-600' },
  { name: 'Ticket médio', value: formatCurrency(850), change: '+10%', icon: Car, color: 'text-purple-600' },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visão geral da sua oficina
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">{stat.change} vs mês anterior</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads por Estágio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Novos Leads', count: 5, color: '#6B7280' },
                { name: 'Em Triagem', count: 3, color: '#3B82F6' },
                { name: 'Orçamento Enviado', count: 2, color: '#F59E0B' },
                { name: 'Aprovado', count: 1, color: '#10B981' },
                { name: 'Em Execução', count: 1, color: '#06B6D4' },
              ].map((stage) => (
                <div key={stage.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: stage.color }}
                  />
                  <div className="flex-1 text-sm">{stage.name}</div>
                  <div className="font-medium">{stage.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Novo lead criado', desc: 'Troca de óleo - Civic', time: '5 min' },
                { action: 'Orçamento enviado', desc: 'Revisão 10k - Corolla', time: '15 min' },
                { action: 'Lead aprovado', desc: 'Freios - Golf GTI', time: '1h' },
                { action: 'OS finalizada', desc: 'Suspensão - HB20', time: '2h' },
              ].map((activity, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.desc}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
