# Guide de Test - Phase 1 : Authentification & Base de données

## 🎯 Objectif
Tester l'authentification Clerk (magic link + 2FA) et la protection des routes (RBAC).

---

## 📋 Prérequis

### 1. Configuration Clerk Dashboard

1. Allez sur [clerk.com](https://clerk.com) et créez un compte
2. Créez une nouvelle application
3. Dans **Settings > Session token**:
   - Ajouter un custom claim :
   ```json
   {
     "metadata": "{{user.public_metadata}}",
     "role": "{{user.public_metadata.role}}"
   }
   ```

4. Dans **Configure > Email, Phone, Username**:
   - Activez "Email address" (required)
   - Activez "Magic Link" authentication
   - Activez "Two-factor authentication"

5. Copiez vos clés API dans `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_VOTRE_CLE"
   CLERK_SECRET_KEY="sk_test_VOTRE_CLE"
   ```

### 2. Démarrer PostgreSQL

```bash
docker-compose up -d
```

Vérifiez que la DB est accessible :
```bash
psql -h localhost -p 5432 -U postgres -d bookyourflight
# Mot de passe: postgres
```

---

## 🧪 Tests à effectuer

### Test 1 : Landing Page (Public)

1. Démarrez le serveur de développement :
   ```bash
   cd bookyourflight
   pnpm dev
   ```

2. Accédez à [http://localhost:3000](http://localhost:3000)

**Résultat attendu** :
- ✅ Landing page s'affiche (avec logo, loader circulaire orange)
- ✅ Header avec logo `bookyourflight-transp.png`
- ✅ Bouton "Sign In" visible dans le header
- ✅ Pas de redirection vers login

---

### Test 2 : Sign Up (Création de compte)

1. Cliquez sur "Sign In" dans le header
2. Cliquez sur "Sign up" en bas du formulaire
3. Créez un compte avec votre email

**Résultat attendu** :
- ✅ Formulaire Clerk s'affiche (fond noir avec bordure zinc-800)
- ✅ Après création, redirection vers `/dashboard`
- ✅ Dashboard affiche vos informations :
   - Email
   - Rôle : `USER`
   - 2FA : Non
   - Statistiques à 0

---

### Test 3 : Magic Link

1. Déconnectez-vous (bouton User Menu → Sign Out)
2. Allez sur `/sign-in`
3. Cliquez sur "Use magic link instead"
4. Entrez votre email et cliquez "Send magic link"
5. Vérifiez votre boîte email
6. Cliquez sur le lien

**Résultat attendu** :
- ✅ Email reçu avec lien magic link
- ✅ Clic sur le lien → connexion automatique
- ✅ Redirection vers `/dashboard`

---

### Test 4 : Activation 2FA

1. Connectez-vous
2. Allez dans votre profil Clerk (User Menu → Manage Account)
3. Section "Security" → Enable Two-factor authentication
4. Scannez le QR code avec Google Authenticator / Authy
5. Entrez le code à 6 chiffres
6. Déconnectez-vous et reconnectez-vous

**Résultat attendu** :
- ✅ Après login classique, demande du code 2FA
- ✅ Code validé → connexion réussie
- ✅ Dashboard affiche "2FA activé : Oui"

---

### Test 5 : Protection des routes

#### 5.1 Route protégée sans connexion

1. Déconnectez-vous
2. Essayez d'accéder à [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

**Résultat attendu** :
- ✅ Redirection automatique vers `/sign-in`

#### 5.2 Route admin sans rôle admin

1. Connectez-vous avec un compte USER
2. Essayez d'accéder à [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

**Résultat attendu** :
- ✅ Redirection vers `/error/403` (Accès refusé)

---

### Test 6 : Promotion en ADMIN

Pour tester le dashboard admin, vous devez promouvoir votre compte en ADMIN :

#### Option 1 : Via Clerk Dashboard (Recommandé)

1. Allez sur [dashboard.clerk.com](https://dashboard.clerk.com)
2. Cliquez sur votre application
3. **Users** → Sélectionnez votre utilisateur
4. **Metadata** → **Public metadata** → Edit
5. Ajoutez :
   ```json
   {
     "role": "ADMIN"
   }
   ```
6. Sauvegardez
7. Déconnectez-vous et reconnectez-vous

#### Option 2 : Via API (avancé)

Créez un fichier temporaire `scripts/set-admin.ts` :

```typescript
import { clerkClient } from '@clerk/nextjs/server';

async function setAdmin(userId: string) {
  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { role: 'ADMIN' }
  });
  console.log('User promoted to ADMIN');
}

// Remplacez par votre userId (visible dans Clerk Dashboard)
setAdmin('user_VOTRE_ID');
```

**Résultat attendu après promotion** :
- ✅ Accès au [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
- ✅ Badge "ADMIN" affiché
- ✅ Statistiques admin visibles (0 vols, 0 réservations, etc.)
- ✅ Dashboard user affiche "Rôle : ADMIN"

---

### Test 7 : Vérification Base de données

Vérifiez que les données seed sont bien présentes :

```bash
cd bookyourflight
npx prisma studio
```

**Résultat attendu** :
- ✅ Table `User` : 2 utilisateurs de test + vos comptes créés
- ✅ Table `Resource` : 10 vols de test
- ✅ Pas de réservations (normal pour l'instant)

Ou via SQL :

```sql
psql -h localhost -U postgres -d bookyourflight

SELECT * FROM "User";
SELECT * FROM "Resource";
```

---

## ✅ Checklist de validation

- [ ] Landing page affiche correctement
- [ ] Création de compte fonctionne
- [ ] Magic link fonctionne
- [ ] 2FA s'active et fonctionne
- [ ] Routes protégées redirigent vers login
- [ ] Routes admin bloquées pour les USER
- [ ] Promotion en ADMIN fonctionne
- [ ] Dashboard admin accessible uniquement aux ADMIN
- [ ] Base de données contient les données seed
- [ ] Prisma Studio affiche les tables correctement

---

## 🐛 Problèmes courants

### Erreur "Clerk keys not found"
- Vérifiez que `.env.local` existe et contient les bonnes clés
- Redémarrez le serveur (`pnpm dev`)

### Redirection infinie vers `/sign-in`
- Vérifiez que `middleware.ts` est bien à la racine de `bookyourflight/`
- Vérifiez que les routes publiques incluent `/sign-in` et `/sign-up`

### 403 Forbidden sur routes admin
- Normal si vous n'êtes pas ADMIN
- Suivez les étapes de promotion en ADMIN ci-dessus

### Base de données vide
- Exécutez `npx prisma db seed` dans `bookyourflight/`
- Vérifiez que Docker PostgreSQL tourne

### Magic link ne fonctionne pas
- Vérifiez votre boîte spam
- Dans Clerk Dashboard, vérifiez que "Magic Link" est activé
- En développement, utilisez le mode "Development email" de Clerk

---

## 📚 Ressources

- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## 🎉 Prochaine étape

Une fois que tous les tests passent, la **Phase 1 (Auth + DB)** est validée !

Prochaine phase : **Phase 2 - CRUD Ressources (Vols)**
