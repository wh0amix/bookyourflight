'use client';

import { Plane, Users, DollarSign, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Resource {
  id: string;
  name: string;
  description?: string;
  availableSlots: number;
  maxSlots: number;
  priceInCents: number;
  currency: string;
  metadata?: Record<string, any>;
}

interface ResourceCardProps {
  resource: Resource;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function ResourceCard({ resource, showActions = false, onDelete }: ResourceCardProps) {
  const priceEur = (resource.priceInCents / 100).toFixed(2);
  const bookedSlots = resource.maxSlots - resource.availableSlots;
  const occupancyPercent = Math.round(
    (bookedSlots / resource.maxSlots) * 100
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-orange-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <Plane className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{resource.name}</h3>
            {resource.description && (
              <p className="text-sm text-zinc-400">{resource.description}</p>
            )}
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Link
              href={`/admin/resources/${resource.id}/edit`}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 text-blue-400" />
            </Link>
            <button
              onClick={() => onDelete?.(resource.id)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <div className="text-sm">
            <p className="text-zinc-400">Places disponibles</p>
            <p className="font-semibold">
              {resource.availableSlots}/{resource.maxSlots}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-400" />
          <div className="text-sm">
            <p className="text-zinc-400">Prix</p>
            <p className="font-semibold">{priceEur} €</p>
          </div>
        </div>
      </div>

      <div className="w-full bg-zinc-800 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
          style={{ width: `${occupancyPercent}%` }}
        />
      </div>
      <p className="text-xs text-zinc-400 mt-2">
        Occupation: {occupancyPercent}%
      </p>
    </div>
  );
}
