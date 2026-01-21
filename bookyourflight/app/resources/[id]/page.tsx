'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Plane, MapPin, Clock, Users, DollarSign, ArrowLeft } from 'lucide-react';
import { ReservationForm } from '@/components/ReservationForm';

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

export default function ResourceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isSignedIn } = useUser();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);

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

  const handleReservationSubmit = async (data: any) => {
    if (!isSignedIn) {
      window.location.href = '/sign-in';
      return;
    }

    setReservationLoading(true);
    try {
      const res = await fetch('/api/reservations/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: data.resourceId,
          passengerCount: data.passengerCount,
          passengerData: { passengers: data.passengers },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert('Erreur: ' + (error.error || 'Impossible de créer la réservation'));
        return;
      }

      const response = await res.json();
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Une erreur est survenue');
    } finally {
      setReservationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <p className="text-zinc-400">Chargement...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">Vol non trouvé</p>
        <Link href="/resources" className="px-4 py-2 bg-orange-500 rounded-lg hover:bg-orange-600">
          Retour aux vols
        </Link>
      </div>
    );
  }

  const priceEur = (resource.priceInCents / 100).toFixed(2);
  const bookedSlots = resource.maxSlots - resource.availableSlots;
  const occupancyPercent = Math.round(
    (bookedSlots / resource.maxSlots) * 100
  );

  const departureDate = resource.metadata?.departureTime
    ? new Date(resource.metadata.departureTime).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const departureTime = resource.metadata?.departureTime
    ? new Date(resource.metadata.departureTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const arrivalTime = resource.metadata?.arrivalTime
    ? new Date(resource.metadata.arrivalTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/resources"
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Plane className="w-8 h-8 text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{resource.name}</h1>
              {resource.description && (
                <p className="text-zinc-400">{resource.description}</p>
              )}
            </div>
          </div>

          {resource.metadata?.flightNumber && (
            <div className="text-sm text-zinc-400 mb-6">
              Numéro de vol: <span className="font-mono text-orange-400">{resource.metadata.flightNumber}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Trajets</h3>
              <div className="space-y-4">
                {resource.metadata?.origin && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-zinc-400">Départ</p>
                      <p className="font-medium">{resource.metadata.origin}</p>
                    </div>
                  </div>
                )}
                {resource.metadata?.destination && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-zinc-400">Arrivée</p>
                      <p className="font-medium">{resource.metadata.destination}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Horaires</h3>
              <div className="space-y-4">
                {departureDate && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-zinc-400">Date</p>
                      <p className="font-medium capitalize">{departureDate}</p>
                    </div>
                  </div>
                )}
                {departureTime && (
                  <div className="text-sm">
                    <p className="text-zinc-400">Départ: <span className="font-medium text-white">{departureTime}</span></p>
                    {arrivalTime && (
                      <p className="text-zinc-400">Arrivée: <span className="font-medium text-white">{arrivalTime}</span></p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-8 border-t border-zinc-800">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-sm text-zinc-400">Prix par personne</p>
                <p className="text-2xl font-bold">{priceEur} €</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-sm text-zinc-400">Places disponibles</p>
                <p className="text-2xl font-bold">
                  {resource.availableSlots}/{resource.maxSlots}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-zinc-400 mb-2">Taux d'occupation</p>
              <div className="w-full bg-zinc-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
              <p className="text-sm text-zinc-400 mt-2">{occupancyPercent}% rempli</p>
            </div>
          </div>

          {resource.metadata?.airline && (
            <div className="text-sm text-zinc-400 pt-4 border-t border-zinc-800">
              Compagnie: <span className="font-medium text-white">{resource.metadata.airline}</span>
            </div>
          )}
        </div>

        {resource.availableSlots > 0 ? (
          <button
            onClick={() => setShowReservationForm(true)}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Réserver maintenant
          </button>
        ) : (
          <div className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-red-400">
            Ce vol est complet
          </div>
        )}

        {showReservationForm && resource && (
          <ReservationForm
            resourceId={resource.id}
            resourceName={resource.name}
            maxSlots={resource.maxSlots}
            availableSlots={resource.availableSlots}
            price={resource.priceInCents}
            onClose={() => setShowReservationForm(false)}
            onSubmit={handleReservationSubmit}
            isLoading={reservationLoading}
          />
        )}
      </div>
    </div>
  );
}
