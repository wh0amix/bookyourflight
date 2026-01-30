'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ResourceCard } from '@/components/ResourceCard';
import { Plus, Search } from 'lucide-react';

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

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 12;

  useEffect(() => {
    fetchResources();
  }, [page, search]);

  async function fetchResources() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const res = await fetch(`/api/resources?${params}`);
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setResources(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce vol ?')) return;

    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setResources(resources.filter((r) => r.id !== id));
        setTotal(total - 1);
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Erreur lors de la suppression');
    }
  }

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Gestion des Vols</h1>
          <Link
            href="/admin/resources/new"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Ajouter un vol
          </Link>
        </div>

        <div className="mb-8 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher un vol..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-400">Chargement...</div>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <p className="text-zinc-400 mb-4">Aucun vol trouvé</p>
            <Link
              href="/admin/resources/new"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
            >
              Créer le premier vol
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  showActions={true}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {pages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  Précédent
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === p
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
