/**
 * Output Port (Port de sortie) - Interface pour la persistance des comptes
 * Définit le contrat que doit respecter le repository
 */
class CompteRepository {
    /**
     * Récupère un compte par son numéro
     * @param {string} numero - Numéro du compte
     * @returns {Promise<Object|null>} - Compte ou null si non trouvé
     */
    async findCompteByNumero(numero) {
        throw new Error('Méthode findCompteByNumero non implémentée');
    }

    /**
     * Récupère les transactions avec filtres et pagination
     * @param {Object} filters - Filtres de recherche
     * @returns {Promise<Object>} - Liste paginée des transactions
     */
    async findTransactions(filters) {
        throw new Error('Méthode findTransactions non implémentée');
    }

    /**
     * Sauvegarde une nouvelle transaction
     * @param {Object} transactionData - Données de la transaction
     * @returns {Promise<Object>} - Transaction créée
     */
    async saveTransaction(transactionData) {
        throw new Error('Méthode saveTransaction non implémentée');
    }

    /**
     * Récupère les alias d'un compte
     * @param {string} numero - Numéro du compte
     * @returns {Promise<Array>} - Liste des alias
     */
    async findAliasByCompte(numero) {
        throw new Error('Méthode findAliasByCompte non implémentée');
    }

    /**
     * Sauvegarde un nouvel alias
     * @param {string} numero - Numéro du compte
     * @param {string} type - Type d'alias
     * @returns {Promise<Object>} - Alias créé
     */
    async saveAlias(numero, type) {
        throw new Error('Méthode saveAlias non implémentée');
    }

    /**
     * Supprime un alias
     * @param {string} numero - Numéro du compte
     * @param {string} cle - Clé de l'alias
     * @returns {Promise<boolean>} - True si supprimé
     */
    async deleteAlias(numero, cle) {
        throw new Error('Méthode deleteAlias non implémentée');
    }
}

module.exports = CompteRepository;
