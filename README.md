# Simulateur de Participant PI-SPI

## Vue d'ensemble

Ce simulateur reproduit le comportement d'un participant PI-SPI (institution financière) exposant l'API Business à ses clients business. Il est conçu pour tester les tests d'homologation de la BCEAO.

## Fonctionnalités

### ✅ **Module Comptes** (Implémenté)
- `GET /comptes/{numero}` - Consultation solde
- `GET /comptes/transactions` - Liste des transactions
- `POST /comptes/transactions` - Transfert intra-comptes
- `GET /comptes/{numero}/alias` - Liste des alias
- `POST /comptes/{numero}/alias` - Création d'alias
- `DELETE /comptes/{numero}/alias/{cle}` - Suppression d'alias

### 🔄 **Modules à venir**
- Notifications (Webhooks)
- Demandes de paiement
- Paiements
- Retours de fonds

## Installation

```bash
cd participant-simulator
npm install
```

## Configuration

1. Copier `env.example` vers `.env`
2. Configurer les paramètres selon vos besoins

```bash
cp env.example .env
```

## Utilisation

### Démarrage du simulateur
```bash
npm start
```

Le simulateur sera accessible sur `http://localhost:3000`

### Démarrage en mode développement
```bash
npm run dev
```

### Vérification de l'état
```bash
curl http://localhost:3000/health
```

## Authentification

### OAuth2 - Client Credentials
```bash
# Obtenir un token
curl -X POST http://localhost:3000/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "mock-client-id",
    "client_secret": "mock-client-secret",
    "grant_type": "client_credentials"
  }'
```

### Utilisation du token
```bash
# Utiliser le token dans les requêtes
curl -H "Authorization: Bearer mock-token-12345" \
     -H "X-Client-Certificate: BCEAO-Cert-12345" \
     http://localhost:3000/comptes/CIC2344256727788288822
```

## Endpoints disponibles

### Consultation solde
```bash
GET /comptes/{numero}
```

### Liste des transactions
```bash
GET /comptes/transactions?page=1&size=20&sort=-dateCreation
```

### Création de transfert
```bash
POST /comptes/transactions
{
  "compteDebiteur": "CIC2344256727788288822",
  "compteCrediteur": "CIC2344256727788288823",
  "montant": 100000,
  "motif": "Transfert test"
}
```

### Gestion des alias
```bash
# Liste des alias
GET /comptes/{numero}/alias

# Création d'alias
POST /comptes/{numero}/alias
{
  "type": "SHID"
}

# Suppression d'alias
DELETE /comptes/{numero}/alias/{cle}
```

## Données de test

Le simulateur inclut des données de test :

### Comptes
- `CIC2344256727788288822` - Solde: 1,500,000 XOF
- `CIC2344256727788288823` - Solde: 750,000 XOF

### Alias existants
- `8b1b2499-3e50-435b-b757-ac7a83d8aa7f` (SHID)
- `9c2c3500-4f61-546c-c868-bd8b94e9bb8g` (MCOD)

### Transactions
- `TXN001` - Transfert de 100,000 XOF (IRREVOCABLE)
- `TXN002` - Transfert de 50,000 XOF (INITIE)

## Gestion des erreurs

Le simulateur respecte le format RFC 7807 pour les erreurs :

```json
{
  "type": "https://api.pi-bceao.com/errors/account-not-found",
  "title": "Compte non trouvé",
  "detail": "Le compte CIC0000000000000000000 n'existe pas",
  "status": 404
}
```

## Scénarios de test

### Scénario par défaut : `perfectConformance`
- Tous les endpoints fonctionnent parfaitement
- Réponses conformes aux schémas
- Gestion d'erreurs appropriée

### Scénarios à venir
- `validationErrors` - Erreurs de validation
- `securityIssues` - Problèmes de sécurité
- `performanceIssues` - Problèmes de performance

## Logs

Les logs sont disponibles dans :
- `logs/combined.log` - Tous les logs
- `logs/error.log` - Erreurs uniquement
- Console - Logs en temps réel

## Tests

```bash
# Lancer les tests unitaires
npm test

# Tests avec couverture
npm run test:coverage
```

## Utilisation avec les tests d'homologation

```bash
# Dans le dossier test-automation
PARTICIPANT_API_URL=http://localhost:3000 npm run test:comptes
```

## Structure du projet

```
participant-simulator/
├── server.js                    # Serveur principal
├── controllers/                 # Contrôleurs des endpoints
│   └── comptes.js             # Module Comptes
├── services/                    # Services métier
│   └── comptes.js             # Logique des comptes
├── middleware/                  # Middleware
│   ├── oauth2.js              # Authentification OAuth2
│   ├── mtls.js                 # Validation mTLS
│   ├── validation.js           # Validation des données
│   └── error-handler.js        # Gestion des erreurs
├── utils/                       # Utilitaires
│   └── logger.js               # Configuration des logs
├── data/                        # Données de test
└── logs/                        # Fichiers de logs
```

## Support

Pour toute question concernant le simulateur :
- **Email** : pisfn-sandbox@bceao.int
- **Documentation** : [API Business Documentation](../README.md)
