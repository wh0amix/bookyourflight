import { currentUser } from '@clerk/nextjs/server';

export default async function AdminDashboardPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="bg-zinc-900 border border-orange-500 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Accès Administrateur</h2>
          <p className="text-zinc-400 mb-4">
            Vous êtes connecté en tant qu'administrateur : {user?.emailAddresses[0]?.emailAddress}
          </p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
              ADMIN
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Vols</h3>
            <p className="text-3xl font-bold text-orange-500">0</p>
            <p className="text-sm text-zinc-400">Vols disponibles</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Réservations</h3>
            <p className="text-3xl font-bold text-orange-500">0</p>
            <p className="text-sm text-zinc-400">Réservations totales</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Utilisateurs</h3>
            <p className="text-3xl font-bold text-orange-500">0</p>
            <p className="text-sm text-zinc-400">Utilisateurs inscrits</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-orange-500">0 €</p>
            <p className="text-sm text-zinc-400">Chiffre d'affaires</p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            User Dashboard
          </a>
          <a
            href="/"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
