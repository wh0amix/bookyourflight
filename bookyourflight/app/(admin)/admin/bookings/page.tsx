'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Filter, Search } from 'lucide-react';

interface Reservation {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  resourceId: string;
  resourceName: string;
  passengerCount: number;
  passengerData: any;
  status: string;
  confirmedAt: string | null;
  createdAt: string;
  payment: {
    amount: number;
    status: string;
    sessionId: string;
  } | null;
  flightDetails: {
    origin?: string;
    destination?: string;
    departureTime?: string;
  };
}

export default function AdminBookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const limit = 20;

  useEffect(() => {
    fetchReservations();
  }, [page, statusFilter]);

  async function fetchReservations() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/reservations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setReservations(data.reservations || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: 'confirm' | 'cancel' | 'delete') {
    const messages = {
      confirm: 'Êtes-vous sûr de vouloir confirmer cette réservation ?',
      cancel: 'Êtes-vous sûr de vouloir annuler cette réservation ?',
      delete: 'Êtes-vous sûr de vouloir supprimer définitivement cette réservation ?',
    };

    if (!confirm(messages[action])) return;

    try {
      const method = action === 'delete' ? 'DELETE' : 'PATCH';
      const body = action === 'delete' ? undefined : JSON.stringify({ action });

      const res = await fetch(`/api/admin/reservations/${id}`, {
        method,
        ...(body && {
          headers: { 'Content-Type': 'application/json' },
          body,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Action failed');
      }

      alert('Action effectuée avec succès');
      fetchReservations();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  }

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Toutes les réservations</h1>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="">Tous les statuts</option>
              <option value="CONFIRMED">Confirmées</option>
              <option value="PENDING_PAYMENT">En attente</option>
              <option value="CANCELLED">Annulées</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-400">Chargement...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
            <p className="text-zinc-400">Aucune réservation trouvée</p>
          </div>
        ) : (
          <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr className="text-left text-sm text-zinc-400">
                      <th className="p-4 font-medium">ID</th>
                      <th className="p-4 font-medium">Client</th>
                      <th className="p-4 font-medium">Vol</th>
                      <th className="p-4 font-medium">Route</th>
                      <th className="p-4 font-medium">Passagers</th>
                      <th className="p-4 font-medium">Montant</th>
                      <th className="p-4 font-medium">Statut</th>
                      <th className="p-4 font-medium">Paiement</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => (
                      <tr
                        key={reservation.id}
                        className="border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="p-4 text-xs font-mono text-zinc-500">
                          {reservation.id.slice(0, 8)}...
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium">{reservation.userName}</p>
                            <p className="text-xs text-zinc-500">{reservation.userEmail}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{reservation.resourceName}</td>
                        <td className="p-4 text-sm text-zinc-400">
                          {reservation.flightDetails.origin && reservation.flightDetails.destination
                            ? `${reservation.flightDetails.origin} → ${reservation.flightDetails.destination}`
                            : '-'}
                        </td>
                        <td className="p-4 text-sm text-center">
                          {reservation.passengerCount}
                        </td>
                        <td className="p-4 text-sm font-semibold text-green-400">
                          {reservation.payment
                            ? `${reservation.payment.amount.toFixed(2)} €`
                            : '-'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              reservation.status === 'CONFIRMED'
                                ? 'bg-green-500/20 text-green-400'
                                : reservation.status === 'PENDING_PAYMENT'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {reservation.status === 'CONFIRMED'
                              ? 'Confirmée'
                              : reservation.status === 'PENDING_PAYMENT'
                              ? 'En attente'
                              : 'Annulée'}
                          </span>
                        </td>
                        <td className="p-4">
                          {reservation.payment && (
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                reservation.payment.status === 'COMPLETED'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {reservation.payment.status}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-zinc-400">
                          {new Date(reservation.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {reservation.status === 'PENDING_PAYMENT' && (
                              <button
                                onClick={() => handleAction(reservation.id, 'confirm')}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors"
                              >
                                Valider
                              </button>
                            )}
                            {reservation.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleAction(reservation.id, 'cancel')}
                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded transition-colors"
                              >
                                Annuler
                              </button>
                            )}
                            <button
                              onClick={() => handleAction(reservation.id, 'delete')}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  Précédent
                </button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                  let pageNum;
                  if (pages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pages - 2) {
                    pageNum = pages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        page === pageNum
                          ? 'bg-orange-500 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}

            <div className="mt-4 text-sm text-zinc-400 text-center">
              Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, total)} sur {total}{' '}
              réservations
            </div>
          </>
        )}
      </div>
    </div>
  );
}
