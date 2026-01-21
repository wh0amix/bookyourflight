'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Resource {
  id?: string;
  name: string;
  description?: string;
  type: string;
  maxSlots: number;
  availableSlots?: number;
  priceInCents: number;
  currency: string;
  metadata?: Record<string, any>;
}

interface ResourceFormProps {
  initialData?: Resource;
  isEditing?: boolean;
}

export function ResourceForm({ initialData, isEditing = false }: ResourceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Resource>(
    initialData || {
      name: '',
      description: '',
      type: 'FLIGHT',
      maxSlots: 180,
      priceInCents: 10000,
      currency: 'EUR',
      metadata: {
        flightNumber: '',
        origin: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        airline: '',
      },
    }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `/api/resources/${initialData?.id}`
        : '/api/resources';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      router.push('/admin/resources');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Nom du vol</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          placeholder="Ex: Vol Paris-Londres AF1234"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 h-24"
          placeholder="Description du vol..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Places max</label>
          <input
            type="number"
            required
            min="1"
            value={formData.maxSlots}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxSlots: parseInt(e.target.value) || 1,
              })
            }
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        {isEditing && (
          <div>
            <label className="block text-sm font-medium mb-2">Places disponibles</label>
            <input
              type="number"
              min="0"
              value={formData.availableSlots || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  availableSlots: parseInt(e.target.value) || 0,
                })
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Prix (€)</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={(formData.priceInCents / 100).toFixed(2)}
            onChange={(e) =>
              setFormData({
                ...formData,
                priceInCents: Math.round(parseFloat(e.target.value) * 100),
              })
            }
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="space-y-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
        <h3 className="text-sm font-medium">Métadonnées du vol</h3>

        <input
          type="text"
          placeholder="Numéro du vol (ex: AF1234)"
          value={formData.metadata?.flightNumber || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              metadata: {
                ...formData.metadata,
                flightNumber: e.target.value,
              },
            })
          }
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Aéroport de départ (CDG, LHR)"
            value={formData.metadata?.origin || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                metadata: {
                  ...formData.metadata,
                  origin: e.target.value,
                },
              })
            }
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          <input
            type="text"
            placeholder="Aéroport d'arrivée (LHR, JFK)"
            value={formData.metadata?.destination || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                metadata: {
                  ...formData.metadata,
                  destination: e.target.value,
                },
              })
            }
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="datetime-local"
            placeholder="Heure de départ"
            value={formData.metadata?.departureTime || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                metadata: {
                  ...formData.metadata,
                  departureTime: e.target.value,
                },
              })
            }
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          <input
            type="datetime-local"
            placeholder="Heure d'arrivée"
            value={formData.metadata?.arrivalTime || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                metadata: {
                  ...formData.metadata,
                  arrivalTime: e.target.value,
                },
              })
            }
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <input
          type="text"
          placeholder="Compagnie aérienne (Air France, Vueling)"
          value={formData.metadata?.airline || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              metadata: {
                ...formData.metadata,
                airline: e.target.value,
              },
            })
          }
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 rounded-lg transition-all font-medium"
        >
          {loading ? 'Traitement...' : isEditing ? 'Mettre à jour' : 'Créer le vol'}
        </button>
        <Link
          href="/admin/resources"
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
