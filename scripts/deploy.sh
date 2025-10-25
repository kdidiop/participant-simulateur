#!/bin/bash

# Script de déploiement pour le simulateur participant PI-SPI
# Supporte Heroku, Railway, Vercel et Docker

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Vérifier les prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        error "npm n'est pas installé"
    fi
    
    # Vérifier la version de Node.js
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        error "Node.js version $REQUIRED_VERSION ou supérieure requise. Version actuelle: $NODE_VERSION"
    fi
    
    log "Prérequis validés ✓"
}

# Installation des dépendances
install_dependencies() {
    log "Installation des dépendances..."
    npm ci --only=production
    log "Dépendances installées ✓"
}

# Déploiement sur Heroku
deploy_heroku() {
    log "Déploiement sur Heroku..."
    
    # Vérifier si Heroku CLI est installé
    if ! command -v heroku &> /dev/null; then
        error "Heroku CLI n'est pas installé. Installez-le depuis https://devcenter.heroku.com/articles/heroku-cli"
    fi
    
    # Vérifier si l'utilisateur est connecté
    if ! heroku auth:whoami &> /dev/null; then
        error "Vous n'êtes pas connecté à Heroku. Exécutez 'heroku login'"
    fi
    
    # Créer l'application si elle n'existe pas
    if ! heroku apps:info pi-spi-simulator &> /dev/null; then
        log "Création de l'application Heroku..."
        heroku create pi-spi-simulator
    fi
    
    # Configurer les variables d'environnement
    log "Configuration des variables d'environnement..."
    heroku config:set NODE_ENV=production
    heroku config:set PORT=3000
    
    # Déployer
    log "Déploiement en cours..."
    git push heroku main
    
    log "Déploiement Heroku terminé ✓"
    log "URL: https://pi-spi-simulator.herokuapp.com"
}

# Déploiement sur Railway
deploy_railway() {
    log "Déploiement sur Railway..."
    
    # Vérifier si Railway CLI est installé
    if ! command -v railway &> /dev/null; then
        error "Railway CLI n'est pas installé. Installez-le avec 'npm install -g @railway/cli'"
    fi
    
    # Vérifier si l'utilisateur est connecté
    if ! railway whoami &> /dev/null; then
        error "Vous n'êtes pas connecté à Railway. Exécutez 'railway login'"
    fi
    
    # Déployer
    log "Déploiement en cours..."
    railway up
    
    log "Déploiement Railway terminé ✓"
}

# Déploiement sur Vercel
deploy_vercel() {
    log "Déploiement sur Vercel..."
    
    # Vérifier si Vercel CLI est installé
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI n'est pas installé. Installez-le avec 'npm install -g vercel'"
    fi
    
    # Vérifier si l'utilisateur est connecté
    if ! vercel whoami &> /dev/null; then
        error "Vous n'êtes pas connecté à Vercel. Exécutez 'vercel login'"
    fi
    
    # Déployer
    log "Déploiement en cours..."
    vercel --prod
    
    log "Déploiement Vercel terminé ✓"
}

# Déploiement Docker
deploy_docker() {
    log "Déploiement avec Docker..."
    
    # Vérifier si Docker est installé
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé"
    fi
    
    # Construire l'image
    log "Construction de l'image Docker..."
    docker build -t pi-spi-simulator .
    
    # Démarrer le conteneur
    log "Démarrage du conteneur..."
    docker run -d -p 3000:3000 --name pi-spi-simulator pi-spi-simulator
    
    log "Déploiement Docker terminé ✓"
    log "URL: http://localhost:3000"
}

# Test de santé
health_check() {
    log "Vérification de la santé de l'application..."
    
    # Attendre que l'application démarre
    sleep 5
    
    # Tester l'endpoint de santé
    if curl -f http://localhost:3000/health &> /dev/null; then
        log "Application en bonne santé ✓"
    else
        warn "L'application ne répond pas correctement"
    fi
}

# Fonction principale
main() {
    local platform=$1
    
    case $platform in
        "heroku")
            check_prerequisites
            install_dependencies
            deploy_heroku
            ;;
        "railway")
            check_prerequisites
            install_dependencies
            deploy_railway
            ;;
        "vercel")
            check_prerequisites
            install_dependencies
            deploy_vercel
            ;;
        "docker")
            check_prerequisites
            deploy_docker
            health_check
            ;;
        *)
            echo "Usage: $0 {heroku|railway|vercel|docker}"
            echo ""
            echo "Plateformes supportées:"
            echo "  heroku   - Déploiement sur Heroku"
            echo "  railway  - Déploiement sur Railway"
            echo "  vercel   - Déploiement sur Vercel"
            echo "  docker   - Déploiement local avec Docker"
            exit 1
            ;;
    esac
}

# Exécuter le script
main "$@"
