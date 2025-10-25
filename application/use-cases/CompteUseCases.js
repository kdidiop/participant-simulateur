const CompteService = require('../../domain/services/CompteService');
const CompteRepositoryImpl = require('../../infrastructure/repositories/CompteRepositoryImpl');
const logger = require('../../utils/logger');

/**
 * Cas d'usage pour la gestion des comptes
 * Orchestre les services de domaine et les repositories
 * Suit les principes de l'architecture hexagonale
 */
class CompteUseCases {
    constructor() {
        // Injection de dépendance : le service de domaine reçoit le repository
        this.compteRepository = new CompteRepositoryImpl();
        this.compteService = new CompteService(this.compteRepository);
    }

    /**
     * Cas d'usage : Consulter le solde d'un compte
     * @param {string} numero - Numéro du compte
     * @returns {Promise<Object|null>} - Compte ou null
     */
    async consulterSolde(numero) {
        try {
            const compte = await this.compteService.getCompte(numero);
            if (!compte) {
                throw new Error(`Compte ${numero} non trouvé`);
            }
            return compte;
        } catch (error) {
            logger.error('Erreur lors de la consultation du solde', { error: error.message, numero });
            throw error;
        }
    }

    /**
     * Cas d'usage : Lister les transactions
     * @param {Object} filters - Filtres de recherche
     * @returns {Promise<Object>} - Liste paginée des transactions
     */
    async listerTransactions(filters) {
        try {
            return await this.compteService.getTransactions(filters);
        } catch (error) {
            logger.error('Erreur lors de la récupération des transactions', { error: error.message, filters });
            throw error;
        }
    }

    /**
     * Cas d'usage : Créer une transaction
     * @param {Object} transactionData - Données de la transaction
     * @returns {Promise<Object>} - Transaction créée
     */
    async creerTransaction(transactionData) {
        try {
            return await this.compteService.createTransaction(transactionData);
        } catch (error) {
            logger.error('Erreur lors de la création de la transaction', { error: error.message, transactionData });
            throw error;
        }
    }

    /**
     * Cas d'usage : Lister les alias d'un compte
     * @param {string} numero - Numéro du compte
     * @returns {Promise<Array>} - Liste des alias
     */
    async listerAlias(numero) {
        try {
            const compte = await this.compteService.getCompte(numero);
            if (!compte) {
                throw new Error(`Compte ${numero} non trouvé`);
            }
            return await this.compteService.getAlias(numero);
        } catch (error) {
            logger.error('Erreur lors de la récupération des alias', { error: error.message, numero });
            throw error;
        }
    }

    /**
     * Cas d'usage : Créer un alias
     * @param {string} numero - Numéro du compte
     * @param {string} type - Type d'alias
     * @returns {Promise<Object>} - Alias créé
     */
    async creerAlias(numero, type) {
        try {
            const compte = await this.compteService.getCompte(numero);
            if (!compte) {
                throw new Error(`Compte ${numero} non trouvé`);
            }
            return await this.compteService.createAlias(numero, type);
        } catch (error) {
            logger.error('Erreur lors de la création de l\'alias', { error: error.message, numero, type });
            throw error;
        }
    }

    /**
     * Cas d'usage : Supprimer un alias
     * @param {string} numero - Numéro du compte
     * @param {string} cle - Clé de l'alias
     * @returns {Promise<boolean>} - True si supprimé
     */
    async supprimerAlias(numero, cle) {
        try {
            const compte = await this.compteService.getCompte(numero);
            if (!compte) {
                throw new Error(`Compte ${numero} non trouvé`);
            }
            return await this.compteService.deleteAlias(numero, cle);
        } catch (error) {
            logger.error('Erreur lors de la suppression de l\'alias', { error: error.message, numero, cle });
            throw error;
        }
    }
}

module.exports = CompteUseCases;
