'use client';

import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Clock, User, Car } from 'lucide-react';

interface KanbanCard {
  id: string;
  title: string;
  customer?: { name: string };
  vehicle?: { plate: string; brand: string; model: string };
  estimatedValue?: number;
  tags: string[];
  createdAt: string;
}

interface KanbanStage {
  id: string;
  name: string;
  color: string;
  position: number;
  cards: KanbanCard[];
}

interface KanbanBoardProps {
  stages: KanbanStage[];
  onUpdate: (stages: KanbanStage[]) => void;
}

export function KanbanBoard({ stages }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 min-w-max">
      {stages.map((stage) => (
        <div key={stage.id} className="w-80 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-semibold text-gray-900">{stage.name}</h3>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              {stage.cards.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[200px]">
            {stage.cards.map((card) => (
              <Card
                key={card.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-white"
              >
                <h4 className="font-medium text-gray-900 mb-2">{card.title}</h4>

                {card.customer && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    {card.customer.name}
                  </div>
                )}

                {card.vehicle && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Car className="h-4 w-4" />
                    {card.vehicle.plate} - {card.vehicle.brand} {card.vehicle.model}
                  </div>
                )}

                {card.estimatedValue && (
                  <div className="text-lg font-bold text-primary mb-2">
                    {formatCurrency(card.estimatedValue)}
                  </div>
                )}

                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {new Date(card.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </Card>
            ))}

            {stage.cards.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhum card neste estágio
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
