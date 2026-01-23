# 📧 Système d'Emails Brevo - Récapitulatif Complet

## ✅ Configuration Terminée

### Compte Brevo
- **Email expéditeur**: eventflow.ynov@hotmail.com
- **API Key**: Configurée dans `.env.local`
- **SDK**: @getbrevo/brevo v3.0.1

### Variables d'environnement (.env.local)
```env
BREVO_API_KEY="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"
BREVO_SENDER_EMAIL="eventflow.ynov@hotmail.com"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## 🎨 Templates d'Emails

### Direction Artistique
Tous les templates respectent la DA du site:
- **Couleurs principales**: Noir (#000000), Gris foncé (#18181b, #27272a)
- **Accent**: Dégradé orange (#f97316 → #ea580c)
- **Texte**: Blanc (#ffffff), Gris clair (#a1a1aa, #71717a)
- **Logo**: PNG transparent intégré (`/bookyourflight-transp.png`)

### 1. Confirmation de Réservation
**Template**: `emailTemplates.reservationConfirmation()`

**Contenu**:
- En-tête avec dégradé orange et logo PNG
- Itinéraire (origine → destination) en gros
- Détails du vol (numéro, date, passagers)
- Prix payé en grand format
- Numéro de réservation (8 premiers caractères en majuscules)
- Instructions (arrivée 2h avant, pièce d'identité, etc.)

**Envoyé**:
- ✅ Après paiement Stripe (webhook `checkout.session.completed`)
- ✅ Après redirection (endpoint `verify-payment`)

### 2. Annulation de Réservation
**Template**: `emailTemplates.reservationCancelled()`

**Contenu**:
- En-tête rouge (annulation)
- Détails du vol annulé
- Montant du remboursement (si applicable)
- Note: remboursement sous 5-7 jours

**Envoyé**:
- ✅ Lorsqu'un admin annule une réservation
- ✅ Lorsqu'un utilisateur annule sa réservation

### 3. Rappel de Paiement
**Template**: `emailTemplates.paymentReminder()`

**Contenu**:
- Rappel de paiement en attente
- Date d'expiration
- Bouton CTA "Finaliser le paiement"

**Envoyé**:
- ⏱️ Peut être utilisé pour rappels automatiques (à implémenter avec cron)

---

## 🔧 Intégrations Techniques

### Fichier Principal: `lib/email/brevo.ts`

**Fonctionnalités**:
- ✅ Authentification SDK correcte (`TransactionalEmailsApiApiKeys.apiKey`)
- ✅ Accès correct au messageId (`result.body?.messageId`)
- ✅ Logging automatique dans la table `EmailLog`
- ✅ Gestion d'erreurs avec fallback
- ✅ Logs console détaillés pour debugging

### Points d'Intégration

#### 1. Webhook Stripe
**Fichier**: `app/api/webhooks/stripe/route.ts`
**Ligne**: 92-115

```typescript
case 'checkout.session.completed': {
  // ... transaction confirmée ...

  if (reservation?.user) {
    const htmlContent = emailTemplates.reservationConfirmation({
      passengerName: reservation.user.firstName || reservation.user.email,
      flightName: reservation.resource.name,
      // ... autres données ...
    });

    await sendEmail({
      to: reservation.user.email,
      subject: 'Votre réservation est confirmée',
      htmlContent,
      type: 'RESERVATION_CONFIRMATION',
      metadata: { reservationId, userId }
    });
  }
}
```

#### 2. Vérification Post-Paiement
**Fichier**: `app/api/reservations/verify-payment/route.ts`
**Ligne**: 98-127

```typescript
const user = payment.reservation.user;
if (user) {
  console.log('📧 [VERIFY-PAYMENT] Sending confirmation email to:', user.email);

  const htmlContent = emailTemplates.reservationConfirmation({
    // ... données de réservation ...
  });

  const emailResult = await sendEmail({
    to: user.email,
    subject: 'Votre réservation est confirmée - BookYourFlight',
    htmlContent,
    type: 'RESERVATION_CONFIRMATION',
    metadata: { reservationId, userId }
  });

  console.log('📧 [VERIFY-PAYMENT] Email result:', emailResult);
}
```

#### 3. Actions Admin
**Fichier**: `app/api/admin/reservations/[id]/route.ts`

- **Confirmation manuelle** (ligne ~150): Envoie email de confirmation
- **Annulation** (ligne ~230): Envoie email d'annulation avec montant remboursé
- **Suppression** (ligne ~330): Envoie email d'annulation

---

## 🧪 Tests

### Test Manuel (Endpoint de Test)
**URL**: `POST http://localhost:3000/api/email/test`

**Commande PowerShell**:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/email/test" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{ email = "eventflow.ynov@hotmail.com" } | ConvertTo-Json)
```

**Résultat Attendu**:
```json
{
  "success": true,
  "message": "Test email sent to eventflow.ynov@hotmail.com",
  "messageId": "<202601231157.13397940252@smtp-relay.mailin.fr>"
}
```

✅ **Dernier test réussi**: 23/01/2026 à 11:57

### Test du Flux Complet

1. **Réserver un vol**:
   - Aller sur `/resources`
   - Sélectionner un vol
   - Cliquer "Réserver"
   - Remplir les informations passagers

2. **Paiement Stripe**:
   - Utiliser carte test: `4242 4242 4242 4242`
   - Date: future
   - CVC: 123

3. **Vérifications attendues**:
   - ✅ Redirection vers `/reservations/success?session_id=xxx`
   - ✅ Email reçu à l'adresse de l'utilisateur
   - ✅ Logo PNG visible dans l'email
   - ✅ Design dark avec accents orange
   - ✅ Entrée dans la table `EmailLog` avec status `SENT`

---

## 📊 Monitoring

### Logs Base de Données
Les emails sont trackés dans la table `EmailLog`:

```sql
SELECT
  emailType,
  status,
  recipientEmail,
  sentAt,
  brevoMessageId,
  error
FROM EmailLog
ORDER BY createdAt DESC
LIMIT 10;
```

### Logs Console
Chaque envoi produit des logs détaillés:

```
===============================================
📧 [BREVO] sendEmail() CALLED
📧 [BREVO] To: user@example.com
📧 [BREVO] Type: RESERVATION_CONFIRMATION
📧 [BREVO] Subject: Votre réservation est confirmée
===============================================
📧 Attempting to send email to user@example.com
🔑 BREVO_API_KEY exists, creating SendSmtpEmail...
📤 Sending email via Brevo API...
✅ Brevo API response: <202601231157.13397940252@smtp-relay.mailin.fr>
✅ Email sent successfully to user@example.com
```

---

## 🐛 Debugging

### Problème: Email non reçu

**Vérifications**:
1. Vérifier les logs console → chercher "📧 [BREVO]"
2. Vérifier la table `EmailLog` → status = SENT ou FAILED ?
3. Vérifier les spams de la boîte mail
4. Vérifier le dashboard Brevo → Statistiques → Emails transactionnels

### Problème: Image non visible

**Vérifications**:
1. Vérifier que `NEXT_PUBLIC_API_URL` est correctement configuré
2. Vérifier que le fichier existe: `ls public/bookyourflight-transp.png`
3. Vérifier que le serveur est accessible depuis l'extérieur (si email consulté hors localhost)

**Note**: Les emails clients (Gmail, Outlook) bloquent parfois les images par défaut. L'utilisateur doit cliquer "Afficher les images".

### Problème: Erreur SDK

Si erreur `Cannot read property 'messageId'`:
- ✅ **CORRIGÉ**: Utiliser `result.body?.messageId` au lieu de `result.messageId`

Si erreur `apiInstance.setApiKey is not a function`:
- ✅ **CORRIGÉ**: Utiliser `TransactionalEmailsApiApiKeys.apiKey` au lieu de `TransactionalEmailsApi.ApiKeyAuth`

---

## 🚀 Améliorations Futures (Optionnelles)

### 1. Email de Rappel Automatique
Implémenter un cron job qui envoie des rappels 24h avant le vol:

**Endpoint à créer**: `app/api/cron/send-reminders/route.ts`

```typescript
// Récupérer toutes les réservations confirmées avec départ dans 24h
const reservations = await prisma.reservation.findMany({
  where: {
    status: 'CONFIRMED',
    startTime: {
      gte: new Date(Date.now() + 23 * 60 * 60 * 1000),
      lte: new Date(Date.now() + 25 * 60 * 60 * 1000),
    }
  },
  include: { user: true, resource: true }
});

// Envoyer email pour chaque réservation
for (const reservation of reservations) {
  await sendEmail({
    to: reservation.user.email,
    subject: '✈️ Votre vol est demain !',
    htmlContent: emailTemplates.paymentReminder({
      passengerName: reservation.user.firstName,
      flightName: reservation.resource.name,
      // ...
    }),
    type: 'PAYMENT_REMINDER',
    metadata: { reservationId: reservation.id }
  });
}
```

**Configurer Vercel Cron**:
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/send-reminders",
    "schedule": "0 9 * * *"
  }]
}
```

### 2. Email de Changement de Vol
Si un admin modifie un vol (horaire, terminal, etc.), envoyer un email automatique aux passagers concernés.

### 3. Email d'Enquête de Satisfaction
24h après le vol, envoyer un email avec lien vers formulaire de satisfaction.

### 4. Retry Queue
Implémenter une queue pour réessayer l'envoi des emails échoués:
- Utiliser BullMQ ou Redis
- Retry exponentiel backoff
- Alert admin après 5 échecs

---

## ✅ Checklist Finale

- [x] SDK Brevo installé et configuré
- [x] Variables d'environnement `.env.local`
- [x] Templates HTML dark theme créés
- [x] Logo PNG intégré
- [x] Integration webhook Stripe
- [x] Integration verify-payment
- [x] Integration actions admin
- [x] Logs base de données (EmailLog)
- [x] Logs console détaillés
- [x] Test endpoint fonctionnel
- [x] Test email envoyé avec succès
- [x] Gestion d'erreurs implémentée

---

## 📞 Support

**Problème persistant ?**
1. Vérifier les logs console du serveur
2. Vérifier la table `EmailLog` dans la base de données
3. Vérifier le dashboard Brevo: https://app.brevo.com/
4. Tester avec l'endpoint de test: `POST /api/email/test`

**Compte Brevo**:
- Email: eventflow.ynov@hotmail.com
- Dashboard: https://app.brevo.com/

---

*Dernière mise à jour: 23 janvier 2026 à 11:57*
*Statut: ✅ Système opérationnel*
