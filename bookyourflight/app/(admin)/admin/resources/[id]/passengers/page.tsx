'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, CheckCircle, Clock, Calendar } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  availableSlots: number;
  maxSlots: number;
  metadata?: {
    origin?: string;
    destination?: string;
    departureTime?: string;
    arrivalTime?: string;
  };
}

interface Statistics {
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  totalPassengers: number;
  occupancyRate: number;
  totalRevenue: number;
}

interface Passenger {
  firstName: string;
  lastName: string;
  passportNumber: string;
}

interface Reservation {
  id: string;
  status: string;
  passengerCount: number;
  createdAt: string;
  confirmedAt: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  payment: {
    amount: number;
    status: string;
    paidAt: string | null;
  } | null;
  passengers: Passenger[];
}

export default function FlightPassengersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [resource, setResource] = useState<Resource | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPassengers();
  }, [filters.page, filters.status, filters.search]);

  async function fetchPassengers() {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(
        `/api/admin/resources/${id}/passengers?${searchParams}`
      );

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setResource(data.resource);
      setStatistics(data.statistics);
      setReservations(data.reservations);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors du chargement des passagers');
    } finally {
      setLoading(false);
    }
  }

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      CONFIRMED: 'bg-green-500/10 text-green-400 border-green-500/20',
      PENDING_PAYMENT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return badges[status] || 'bg-zinc-500/10 text-zinc-400';
  };

  const occupancyPercent = statistics && resource
    ? Math.round((statistics.totalPassengers / resource.maxSlots) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/resources"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux vols
        </Link>
        <h1 className="text-3xl font-bold">
          Passagers: {resource?.name || 'Chargement...'}
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-zinc-400">Chargement des passagers...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-zinc-400">Total réservations</span>
              </div>
              <p className="text-3xl font-bold">
                {statistics?.totalReservations || 0}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-zinc-400">Confirmées</span>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {statistics?.confirmedReservations || 0}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-zinc-400">En attente</span>
              </div>
              <p className="text-3xl font-bold text-yellow-400">
                {statistics?.pendingReservations || 0}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-zinc-400">Passagers</span>
              </div>
              <p className="text-3xl font-bold text-purple-400">
                {statistics?.totalPassengers || 0}
              </p>
            </div>
          </div>

          {/* Flight Details Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Détails du vol</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Route</p>
                <p className="text-lg font-semibold">
                  {resource?.metadata?.origin || 'N/A'} →{' '}
                  {resource?.metadata?.destination || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-1">Départ</p>
                <p className="text-lg font-semibold">
                  {resource?.metadata?.departureTime
                    ? new Date(resource.metadata.departureTime).toLocaleString('fr-FR')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-1">Occupation</p>
                <p className="text-lg font-semibold">
                  {statistics?.totalPassengers || 0}/{resource?.maxSlots || 0} places ({occupancyPercent}%)
                </p>
                <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-1">Revenus confirmés</p>
                <p className="text-lg font-semibold text-green-400">
                  {((statistics?.totalRevenue || 0) / 100).toFixed(2)} €
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value, page: 1 })
              }
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 focus:border-orange-500 focus:outline-none"
            >
              <option value="">Tous les statuts</option>
              <option value="CONFIRMED">Confirmés</option>
              <option value="PENDING_PAYMENT">En attente</option>
              <option value="CANCELLED">Annulés</option>
            </select>

            <input
              type="text"
              placeholder="Rechercher par nom, email, passeport..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold whitespace-nowrap">ID</th>
                    <th className="text-left p-4 text-sm font-semibold whitespace-nowrap">Client</th>
                    <th className="text-left p-4 text-sm font-semibold whitespace-nowrap">Passagers</th>
                    <th className="text-left p-4 text-sm font-semibold whitespace-nowrap">Statut</th>
                    <th className="text-left p-4 text-sm font-semibold whitespace-nowrap">Paiement</th>
                    <th className="text-left p-4 text-sm font-semibold whitespace-nowrap">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-zinc-400">
                        {filters.status || filters.search
                          ? 'Aucune réservation ne correspond aux critères de recherche'
                          : 'Aucune réservation pour ce vol'}
                      </td>
                    </tr>
                  ) : (
                    reservations.map((reservation) => (
                      <>
                        <tr
                          key={reservation.id}
                          onClick={() => toggleRow(reservation.id)}
                          className="border-t border-zinc-800 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                        >
                          <td className="p-4 font-mono text-sm">
                            {reservation.id.slice(0, 8)}...
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">
                                {reservation.user.firstName || ''} {reservation.user.lastName || ''}
                              </p>
                              <p className="text-sm text-zinc-400">
                                {reservation.user.email}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-center">{reservation.passengerCount}</td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs border ${getStatusBadge(
                                reservation.status
                              )}`}
                            >
                              {reservation.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {reservation.payment ? (
                              <div>
                                <p className="font-medium">
                                  {(reservation.payment.amount / 100).toFixed(2)} €
                                </p>
                                <p className="text-sm text-zinc-400">
                                  {reservation.payment.status}
                                </p>
                              </div>
                            ) : (
                              <span className="text-zinc-500">N/A</span>
                            )}
                          </td>
                          <td className="p-4 text-sm">
                            {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                        {expandedRows.has(reservation.id) && (
                          <tr className="bg-zinc-800/30">
                            <td colSpan={6} className="p-4">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-orange-400 mb-3">
                                  Détails des passagers ({reservation.passengerCount})
                                </h4>
                                {reservation.passengers && reservation.passengers.length > 0 ? (
                                  reservation.passengers.map((passenger, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-zinc-900/50 rounded p-3 text-sm"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <span className="text-zinc-500 text-xs">
                                            Passager {idx + 1}
                                          </span>
                                          <p className="font-medium">
                                            {passenger.firstName} {passenger.lastName}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-zinc-500 text-xs">
                                            Passeport
                                          </span>
                                          <p className="font-mono">
                                            {passenger.passportNumber || 'N/A'}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-zinc-500 text-xs">Type</span>
                                          <p>{idx === 0 ? 'Titulaire' : 'Accompagnant'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-zinc-500 text-sm">
                                    Aucune donnée passager disponible
                                  </p>
                                )}

                                <div className="mt-4 pt-4 border-t border-zinc-700">
                                  <h5 className="text-xs font-semibold text-zinc-400 mb-2">
                                    INFORMATIONS SUPPLÉMENTAIRES
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-zinc-500 text-xs">Réservation ID:</span>
                                      <p className="font-mono text-xs">{reservation.id}</p>
                                    </div>
                                    <div>
                                      <span className="text-zinc-500 text-xs">Date de réservation:</span>
                                      <p>{new Date(reservation.createdAt).toLocaleString('fr-FR')}</p>
                                    </div>
                                    {reservation.confirmedAt && (
                                      <div>
                                        <span className="text-zinc-500 text-xs">Date de confirmation:</span>
                                        <p>{new Date(reservation.confirmedAt).toLocaleString('fr-FR')}</p>
                                      </div>
                                    )}
                                    {reservation.payment && (
                                      <div>
                                        <span className="text-zinc-500 text-xs">Statut paiement:</span>
                                        <p>{reservation.payment.status}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 transition-colors"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-zinc-400">
                Page {pagination.page} sur {pagination.pages}
              </span>
              <button
                disabled={filters.page === pagination.pages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
