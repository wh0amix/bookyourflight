export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-orange-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Accès refusé</h2>
        <p className="text-zinc-400 mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors inline-block"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
