# 📚 BookYourFlight API Documentation

## Accès à la documentation

La documentation Swagger interactive est disponible à :

```
http://localhost:3000/api/docs
```

## Structure de l'API

### 🌍 Ressources (Flights)
- `GET /api/resources` - Lister tous les vols disponibles
- `GET /api/resources/{id}` - Obtenir les détails d'un vol
- `POST /api/resources` - Créer un vol (Admin)
- `PATCH /api/resources/{id}` - Modifier un vol (Admin)
- `DELETE /api/resources/{id}` - Supprimer un vol (Admin)

### ✈️ Réservations
- `GET /api/reservations` - Lister mes réservations
- `GET /api/reservations/{id}` - Obtenir les détails d'une réservation
- `PATCH /api/reservations/{id}` - Annuler une réservation
- `POST /api/reservations/create-checkout` - Créer une session de paiement Stripe
- `POST /api/reservations/verify-payment` - Vérifier le paiement

### 💳 Paiements
- Les paiements sont traités via Stripe
- Webhook à `/api/webhooks/stripe` pour les mises à jour de paiement

### 🛡️ Admin
- `GET /api/admin/reservations` - Voir toutes les réservations
- `GET /api/admin/stats` - Obtenir les statistiques du dashboard

### 📧 Emails
- `POST /api/email/send` - Envoyer un email (interne)
- Intégration Brevo pour les emails transactionnels

## Authentification

L'API utilise **Clerk JWT Bearer Tokens**.

Pour les requêtes authentifiées, ajoutez le header:
```
Authorization: Bearer <CLERK_JWT_TOKEN>
```

## Modèles de données

### User
```json
{
  "id": "cuid",
  "clerkId": "string",
  "email": "string",
  "firstName": "string?",
  "lastName": "string?",
  "role": "USER|ADMIN",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Resource (Flight)
```json
{
  "id": "cuid",
  "name": "Paris → London",
  "description": "string",
  "type": "FLIGHT",
  "availableSlots": 150,
  "maxSlots": 200,
  "priceInCents": 15000,
  "currency": "EUR",
  "metadata": {
    "origin": "CDG",
    "destination": "LHR",
    "departureTime": "2024-02-15T10:30:00Z",
    "airline": "Air France",
    "flightNumber": "AF123"
  },
  "isActive": true,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Reservation
```json
{
  "id": "cuid",
  "userId": "cuid",
  "resourceId": "cuid",
  "passengerCount": 2,
  "passengerData": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "dateOfBirth": "1990-05-15"
    }
  ],
  "status": "PENDING_PAYMENT|CONFIRMED|CANCELLED|PAYMENT_FAILED|EXPIRED",
  "totalPrice": 30000,
  "confirmedAt": "ISO8601?",
  "cancelledAt": "ISO8601?",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Payment
```json
{
  "id": "cuid",
  "reservationId": "cuid",
  "amount": 30000,
  "currency": "EUR",
  "status": "PENDING|COMPLETED|FAILED|REFUNDED",
  "stripeCheckoutSessionId": "string",
  "stripePaymentIntentId": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

## Statuts des réservations

| Statut | Description |
|--------|------------|
| `PENDING_PAYMENT` | En attente de paiement |
| `CONFIRMED` | Paiement reçu, vol confirmé |
| `CANCELLED` | Annulée par l'utilisateur |
| `PAYMENT_FAILED` | Échec du paiement |
| `EXPIRED` | Réservation expirée (pas payée à temps) |

## Codes d'erreur

| Code | Description |
|------|------------|
| `200` | Succès |
| `201` | Créé |
| `400` | Mauvaise requête |
| `401` | Non authentifié |
| `403` | Accès interdit (admin requis) |
| `404` | Non trouvé |
| `500` | Erreur serveur |

## Exemples de requêtes

### 1. Lister les vols
```bash
curl http://localhost:3000/api/resources?page=1&limit=10
```

### 2. Créer une réservation (checkout)
```bash
curl -X POST http://localhost:3000/api/reservations/create-checkout \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "flight-id",
    "passengerCount": 2,
    "passengerData": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "dateOfBirth": "1990-05-15"
      }
    ]
  }'
```

### 3. Récupérer mes réservations
```bash
curl http://localhost:3000/api/reservations \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Admin - Voir toutes les réservations
```bash
curl http://localhost:3000/api/admin/reservations?page=1&limit=20 \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 5. Admin - Obtenir les statistiques
```bash
curl http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

## Webhooks Stripe

Endpoint: `POST /api/webhooks/stripe`

Les événements traités:
- `payment_intent.succeeded` → Confirme la réservation
- `payment_intent.payment_failed` → Marque la réservation comme échouée
- `charge.refunded` → Traite les remboursements

**Sécurité**: Vérifiez toujours la signature du webhook avec `STRIPE_WEBHOOK_SECRET`

## Variables d'environnement requises

```env
# Clerk Authentication
CLERK_SECRET_KEY=sk_***
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_***

# Database
DATABASE_URL=postgresql://user:password@host/db

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_***
STRIPE_SECRET_KEY=sk_***
STRIPE_WEBHOOK_SECRET=whsec_***

# Brevo Email
BREVO_API_KEY=***
BREVO_SENDER_EMAIL=noreply@bookyourflight.com

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Support

Pour toute question ou problème : support@bookyourflight.com

---

**Version**: 1.0.0  
**Dernière mise à jour**: Janvier 2025
