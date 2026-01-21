'use client';

import { useState, useEffect } from 'react';
import { ResourceForm } from '@/components/ResourceForm';
import { useParams } from 'next/navigation';

interface Resource {
  id: string;
  name: string;
  description?: string;
  type: string;
  maxSlots: number;
  priceInCents: number;
  currency: string;
  metadata?: Record<string, any>;
}

export default function EditResourcePage() {
  const params = useParams();
  const id = params.id as string;
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResource() {
      try {
        const res = await fetch(`/api/resources/${id}`);
        if (res.ok) {
          const data = await res.json();
          setResource(data);
        }
      } catch (error) {
        console.error('Error fetching resource:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchResource();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <p className="text-zinc-400">Chargement...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <p className="text-red-400">Vol non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Modifier le vol</h1>
        <ResourceForm initialData={resource} isEditing={true} />
      </div>
    </div>
  );
}
