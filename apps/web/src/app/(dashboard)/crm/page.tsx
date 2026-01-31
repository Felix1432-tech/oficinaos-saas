'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/components/crm/kanban-board';

export default function CrmPage() {
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setStages([
      {
        id: '1',
        name: 'Novos Leads',
        color: '#6B7280',
        position: 1,
        cards: [
          {
            id: 'c1',
            title: 'Troca de óleo - Civic',
            customer: { name: 'João Silva' },
            vehicle: { plate: 'ABC1D23', brand: 'Honda', model: 'Civic' },
            estimatedValue: 350,
            tags: ['urgente'],
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: '2',
        name: 'Em Triagem',
        color: '#3B82F6',
        position: 2,
        cards: [
          {
            id: 'c2',
            title: 'Revisão 10.000km - Corolla',
            customer: { name: 'Maria Santos' },
            vehicle: { plate: 'XYZ9E87', brand: 'Toyota', model: 'Corolla' },
            estimatedValue: 850,
            tags: ['revisão'],
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: '3',
        name: 'Orçamento Enviado',
        color: '#F59E0B',
        position: 3,
        cards: [],
      },
      {
        id: '4',
        name: 'Aprovado',
        color: '#10B981',
        position: 4,
        cards: [],
      },
      {
        id: '5',
        name: 'Em Execução',
        color: '#06B6D4',
        position: 5,
        cards: [],
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM - Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie seus leads e oportunidades
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
        <KanbanBoard stages={stages} onUpdate={setStages} />
      </div>
    </div>
  );
}
