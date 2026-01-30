import { ResourceForm } from '@/components/ResourceForm';

export default function NewResourcePage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 pt-20 lg:pt-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Créer un nouveau vol</h1>
        <ResourceForm />
      </div>
    </div>
  );
}
