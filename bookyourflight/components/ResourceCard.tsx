'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  const [imageError, setImageError] = useState(false);

  // Get destination from metadata for image URL
  const destination = resource.metadata?.destination || 'flight';
  const imageUrl = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop&q=80`;
  const destinationImageUrl = resource.metadata?.imageUrl
    || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop&q=80&auto=format`;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-orange-500 transition-colors flex flex-col h-full">
      {/* Image */}
      <div className="relative w-full h-48 bg-zinc-800 overflow-hidden">
        {!imageError ? (
          <Image
            src={destinationImageUrl}
            alt={destination}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Plane className="w-12 h-12 text-white opacity-50" />
          </div>
        )}
        {/* Destination badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
          <p className="text-sm font-semibold text-orange-400">{destination}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
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
              href={`/admin/resources/${resource.id}/passengers`}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Voir les passagers"
            >
              <Users className="w-4 h-4 text-purple-400" />
            </Link>
            <Link
              href={`/admin/resources/${resource.id}/edit`}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Éditer"
            >
              <Edit className="w-4 h-4 text-blue-400" />
            </Link>
            <button
              onClick={() => onDelete?.(resource.id)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Supprimer"
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
    </div>
  );
}
