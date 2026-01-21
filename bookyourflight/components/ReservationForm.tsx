'use client';

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface Passenger {
  firstName: string;
  lastName: string;
  passportNumber: string;
}

interface ReservationFormProps {
  resourceId: string;
  resourceName: string;
  maxSlots: number;
  availableSlots: number;
  price: number;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ReservationForm({
  resourceId,
  resourceName,
  maxSlots,
  availableSlots,
  price,
  onClose,
  onSubmit,
  isLoading = false,
}: ReservationFormProps) {
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { firstName: '', lastName: '', passportNumber: '' },
  ]);

  const totalPrice = (price * passengerCount) / 100;

  const handlePassengerCountChange = (newCount: number) => {
    const count = Math.max(1, Math.min(newCount, availableSlots));
    setPassengerCount(count);

    if (count > passengers.length) {
      setPassengers([
        ...passengers,
        ...Array(count - passengers.length)
          .fill(null)
          .map(() => ({ firstName: '', lastName: '', passportNumber: '' })),
      ]);
    } else if (count < passengers.length) {
      setPassengers(passengers.slice(0, count));
    }
  };

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      resourceId,
      passengerCount,
      passengers,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
          <h2 className="text-xl font-bold">Réserver: {resourceName}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de passagers</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handlePassengerCountChange(passengerCount - 1)}
                disabled={passengerCount === 1 || isLoading}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="text-center flex-1">
                <input
                  type="number"
                  min="1"
                  max={availableSlots}
                  value={passengerCount}
                  onChange={(e) => handlePassengerCountChange(parseInt(e.target.value) || 1)}
                  disabled={isLoading}
                  className="w-full text-center bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50"
                />
              </div>

              <button
                type="button"
                onClick={() => handlePassengerCountChange(passengerCount + 1)}
                disabled={passengerCount === availableSlots || isLoading}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-2">{availableSlots} places disponibles</p>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
            <div className="text-sm">
              <p className="text-zinc-400">Prix par passager</p>
              <p className="text-lg font-semibold">{(price / 100).toFixed(2)} €</p>
            </div>
            <div className="border-t border-zinc-700 pt-3">
              <p className="text-zinc-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-orange-500">{totalPrice.toFixed(2)} €</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Informations des passagers (optionnel en mode test)</h3>
            {passengers.map((passenger, index) => (
              <div key={index} className="bg-zinc-800/30 rounded-lg p-4 space-y-3">
                <p className="text-xs text-zinc-400 font-medium">Passager {index + 1}</p>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={passenger.firstName}
                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                    disabled={isLoading}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50"
                  />
                  <input
                    type="text"
                    placeholder="Nom"
                    value={passenger.lastName}
                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                    disabled={isLoading}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Numéro de passeport"
                  value={passenger.passportNumber}
                  onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isLoading ? 'Traitement...' : `Réserver (${totalPrice.toFixed(2)} €)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
