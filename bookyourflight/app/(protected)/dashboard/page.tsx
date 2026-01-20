import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Bienvenue, {user?.firstName || 'Utilisateur'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-400">Email</p>
              <p className="font-medium">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
            <div>
              <p className="text-zinc-400">Rôle</p>
              <p className="font-medium">{user?.publicMetadata?.role as string || 'USER'}</p>
            </div>
            <div>
              <p className="text-zinc-400">Compte créé le</p>
              <p className="font-medium">{new Date(user?.createdAt || '').toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <p className="text-zinc-400">2FA activé</p>
              <p className="font-medium">{user?.twoFactorEnabled ? 'Oui' : 'Non'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Réservations</h3>
            <p className="text-3xl font-bold text-orange-500">0</p>
            <p className="text-sm text-zinc-400">Réservations actives</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Vols</h3>
            <p className="text-3xl font-bold text-orange-500">0</p>
            <p className="text-sm text-zinc-400">Vols réservés</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Total dépensé</h3>
            <p className="text-3xl font-bold text-orange-500">0 €</p>
            <p className="text-sm text-zinc-400">Montant total</p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <a
            href="/"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </a>
          <a
            href="/admin/dashboard"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
          >
            Admin Dashboard (test)
          </a>
        </div>
      </div>
    </div>
  );
}
