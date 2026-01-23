'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResourceCard } from '@/components/ResourceCard';
import { Search, Filter } from 'lucide-react';
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

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const isInitializingRef = useRef(true);

  const limit = 12;

  // Initialize from URL params
  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');

    if (origin || destination) {
      const searchQuery = [origin, destination].filter(Boolean).join(' ');
      console.log('🔍 URL params found:', { origin, destination, searchQuery });
      setSearch(searchQuery);
      setDebouncedSearch(searchQuery);
      setPage(1);
      isInitializingRef.current = true;
    } else {
      isInitializingRef.current = false;
    }
  }, [searchParams]);

  // Debounce search input changes (skip for initialization)
  useEffect(() => {
    if (isInitializingRef.current) {
      console.log('🔍 Skipping debounce during initialization');
      isInitializingRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      console.log('🔍 Setting debounced search:', search);
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch resources when dependencies change
  useEffect(() => {
    console.log('🔍 useEffect fetchResources triggered with:', { page, debouncedSearch, sortBy });
    fetchResources();
  }, [page, debouncedSearch, sortBy]);

  async function fetchResources() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      console.log('🔍 Fetching with params:', params.toString(), 'debouncedSearch:', debouncedSearch);
      const res = await fetch(`/api/resources?${params}`);

      if (!res.ok) {
        throw new Error('Failed to fetch resources');
      }

      const data = await res.json();

      let sorted = data.data || [];
      if (sortBy === 'price-low') {
        sorted.sort((a: Resource, b: Resource) => a.priceInCents - b.priceInCents);
      } else if (sortBy === 'price-high') {
        sorted.sort((a: Resource, b: Resource) => b.priceInCents - a.priceInCents);
      } else if (sortBy === 'available') {
        sorted.sort((a: Resource, b: Resource) => b.availableSlots - a.availableSlots);
      }

      setResources(sorted);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Nos Vols</h1>

        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
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
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="newest">Plus récents</option>
                <option value="price-low">Prix: bas au haut</option>
                <option value="price-high">Prix: haut au bas</option>
                <option value="available">Plus de places</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-400">Chargement...</div>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <p className="text-zinc-400">Aucun vol ne correspond à votre recherche</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {resources.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/resources/${resource.id}`}
                  className="hover:scale-105 transition-transform"
                >
                  <ResourceCard resource={resource} />
                </Link>
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
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  const startPage = Math.max(1, page - 2);
                  return startPage + i;
                }).map((p) => (
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
