# Guide de Déploiement - Simulateur Participant PI-SPI

## Vue d'ensemble

Ce guide explique comment déployer le simulateur participant PI-SPI sur différentes plateformes cloud.

## Prérequis

- Node.js 18+ 
- npm 8+
- Git configuré
- Comptes sur les plateformes de déploiement choisies

## Plateformes supportées

### 1. Heroku (Recommandé pour la simplicité)

#### Installation de Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Linux/Windows
# Télécharger depuis https://devcenter.heroku.com/articles/heroku-cli
```

#### Déploiement

```bash
# Se connecter à Heroku
heroku login

# Déployer
./scripts/deploy.sh heroku
```

**Avantages :**
- Configuration automatique
- Scaling facile
- Monitoring intégré
- SSL automatique

### 2. Railway (Recommandé pour la performance)

#### Installation de Railway CLI

```bash
npm install -g @railway/cli
```

#### Déploiement

```bash
# Se connecter à Railway
railway login

# Déployer
./scripts/deploy.sh railway
```

**Avantages :**
- Déploiement automatique depuis Git
- Performance optimale
- Variables d'environnement sécurisées
- Logs en temps réel

### 3. Vercel (Recommandé pour les applications serverless)

#### Installation de Vercel CLI

```bash
npm install -g vercel
```

#### Déploiement

```bash
# Se connecter à Vercel
vercel login

# Déployer
./scripts/deploy.sh vercel
```

**Avantages :**
- Déploiement serverless
- Edge functions
- CDN global
- Optimisations automatiques

### 4. Docker (Déploiement local ou sur serveur)

#### Déploiement local

```bash
# Construire et démarrer
./scripts/deploy.sh docker

# Ou manuellement
docker build -t pi-spi-simulator .
docker run -d -p 3000:3000 --name pi-spi-simulator pi-spi-simulator
```

#### Déploiement sur serveur

```bash
# Copier les fichiers sur le serveur
scp -r . user@server:/path/to/simulator

# Sur le serveur
cd /path/to/simulator
./scripts/deploy.sh docker
```

## Configuration des variables d'environnement

### Variables requises

```bash
NODE_ENV=production
PORT=3000
```

### Variables optionnelles

```bash
# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Sécurité
CORS_ORIGIN=*
HELMET_ENABLED=true

# Performance
COMPRESSION_ENABLED=true
```

## Monitoring et logs

### Heroku

```bash
# Voir les logs
heroku logs --tail -a pi-spi-simulator

# Voir les métriques
heroku ps -a pi-spi-simulator
```

### Railway

```bash
# Voir les logs
railway logs

# Voir les métriques
railway status
```

### Vercel

```bash
# Voir les logs
vercel logs

# Voir les métriques
vercel inspect
```

### Docker

```bash
# Voir les logs
docker logs pi-spi-simulator

# Voir les métriques
docker stats pi-spi-simulator
```

## Tests de santé

### Endpoint de santé

```bash
curl https://your-app-url.com/health
```

**Réponse attendue :**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Tests de conformité

```bash
# Tester l'authentification OAuth2
curl -X POST https://your-app-url.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{"client_id": "mock-client-id", "client_secret": "mock-client-secret", "grant_type": "client_credentials"}'

# Tester un endpoint protégé
curl -X GET https://your-app-url.com/comptes/CIC2344256727788288822 \
  -H "Authorization: Bearer your-token" \
  -H "X-Client-Certificate: BCEAO-TEST-CERT"
```

## Scaling et performance

### Heroku

```bash
# Scale horizontal
heroku ps:scale web=3 -a pi-spi-simulator

# Scale vertical
heroku ps:resize web=standard-2x -a pi-spi-simulator
```

### Railway

```bash
# Configuration dans railway.json
{
  "deploy": {
    "numReplicas": 3,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Docker

```bash
# Scale avec docker-compose
docker-compose up --scale simulator=3
```

## Sécurité

### HTTPS/SSL

- **Heroku** : SSL automatique
- **Railway** : SSL automatique  
- **Vercel** : SSL automatique
- **Docker** : Configuration manuelle requise

### Variables d'environnement

```bash
# Ne jamais commiter les secrets
echo "*.env" >> .gitignore
echo "*.key" >> .gitignore
echo "*.pem" >> .gitignore
```

### Headers de sécurité

Le simulateur inclut automatiquement :
- Helmet.js pour les headers de sécurité
- CORS configuré
- Compression gzip
- Rate limiting (optionnel)

## Maintenance

### Mises à jour

```bash
# Mise à jour des dépendances
npm update

# Redéploiement
./scripts/deploy.sh [platform]
```

### Sauvegarde

```bash
# Sauvegarder la configuration
git add .
git commit -m "Backup configuration"
git push origin main
```

### Rollback

```bash
# Heroku
heroku rollback -a pi-spi-simulator

# Railway
railway rollback

# Vercel
vercel rollback

# Docker
docker run -d -p 3000:3000 pi-spi-simulator:previous
```

## Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Changer le port
   PORT=3001 npm start
   ```

2. **Mémoire insuffisante**
   ```bash
   # Augmenter la limite
   node --max-old-space-size=4096 server.js
   ```

3. **Variables d'environnement manquantes**
   ```bash
   # Vérifier les variables
   heroku config -a pi-spi-simulator
   ```

### Logs d'erreur

```bash
# Analyser les logs
tail -f logs/app.log | grep ERROR

# Logs en temps réel
heroku logs --tail -a pi-spi-simulator
```

## Coûts estimés

### Heroku
- **Hobby** : Gratuit (avec limitations)
- **Basic** : $7/mois
- **Standard** : $25/mois

### Railway
- **Starter** : Gratuit (avec limitations)
- **Pro** : $5/mois

### Vercel
- **Hobby** : Gratuit (avec limitations)
- **Pro** : $20/mois

### Docker (Serveur dédié)
- **VPS** : $5-20/mois
- **Dedicated** : $50-200/mois

## Support

Pour toute question ou problème :

1. Vérifier les logs de l'application
2. Consulter la documentation de la plateforme
3. Contacter l'équipe PI-SPI : pi-spi@bceao.int
