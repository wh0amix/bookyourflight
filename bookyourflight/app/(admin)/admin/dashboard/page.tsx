'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plane,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
} from 'lucide-react';

interface Stats {
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  totalRevenue: number;
  totalUsers: number;
  totalResources: number;
}

interface RecentReservation {
  id: string;
  userEmail: string;
  userName: string;
  resourceName: string;
  passengerCount: number;
  status: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  count: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [revenueByDay, setRevenueByDay] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');

      const data = await res.json();
      setStats(data.stats);
      setRecentReservations(data.recentReservations || []);
      setRevenueByDay(data.revenueByDay || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <p className="text-zinc-400">Chargement...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Revenus totaux',
      value: `${(stats?.totalRevenue || 0).toFixed(2)} €`,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Réservations',
      value: stats?.totalReservations || 0,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Confirmées',
      value: stats?.confirmedReservations || 0,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'En attente',
      value: stats?.pendingReservations || 0,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Utilisateurs',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Vols',
      value: stats?.totalResources || 0,
      icon: Plane,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-zinc-400 mt-2">Bienvenue dans votre panel d'administration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-orange-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-1">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-semibold">Revenus (30 derniers jours)</h2>
            </div>
            {revenueByDay.length > 0 ? (
              <div className="space-y-2">
                {revenueByDay.slice(0, 7).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
                  >
                    <span className="text-sm text-zinc-400">
                      {new Date(item.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-zinc-400">{item.count} réservations</span>
                      <span className="font-semibold text-green-400">
                        {item.revenue.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">Aucune donnée de revenu disponible</p>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Statistiques rapides</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Taux de confirmation</span>
                <span className="font-semibold">
                  {stats?.totalReservations
                    ? Math.round(
                        ((stats.confirmedReservations || 0) / stats.totalReservations) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Revenu moyen / réservation</span>
                <span className="font-semibold text-green-400">
                  {stats?.confirmedReservations
                    ? ((stats.totalRevenue || 0) / stats.confirmedReservations).toFixed(2)
                    : '0.00'}{' '}
                  €
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Utilisateurs actifs</span>
                <span className="font-semibold">{stats?.totalUsers || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Réservations récentes</h2>
            <Link
              href="/admin/bookings"
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              Voir tout →
            </Link>
          </div>

          {recentReservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Vol</th>
                    <th className="pb-3 font-medium">Passagers</th>
                    <th className="pb-3 font-medium">Montant</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium">
                            {reservation.userName || 'N/A'}
                          </p>
                          <p className="text-xs text-zinc-500">{reservation.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 text-sm">{reservation.resourceName}</td>
                      <td className="py-3 text-sm">{reservation.passengerCount}</td>
                      <td className="py-3 text-sm font-semibold text-green-400">
                        {reservation.amount.toFixed(2)} €
                      </td>
                      <td className="py-3">
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
                      <td className="py-3 text-sm text-zinc-400">
                        {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-8">
              Aucune réservation récente
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
