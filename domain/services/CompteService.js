/**
 * Service de domaine pour la gestion des comptes
 * Suit les principes de l'architecture hexagonale
 * Utilise l'injection de dépendance pour le repository (output port)
 */
class CompteService {
    constructor(compteRepository) {
        this.compteRepository = compteRepository;
    }

    /**
     * Récupère un compte par son numéro
     * @param {string} numero - Numéro du compte
     * @returns {Promise<Object|null>} - Compte ou null si non trouvé
     */
    async getCompte(numero) {
        return await this.compteRepository.findCompteByNumero(numero);
    }

    /**
     * Récupère la liste des transactions avec pagination et filtres
     * @param {Object} filters - Filtres de recherche
     * @returns {Promise<Object>} - Liste paginée des transactions
     */
    async getTransactions(filters) {
        return await this.compteRepository.findTransactions(filters);
    }

    /**
     * Crée une nouvelle transaction
     * @param {Object} transactionData - Données de la transaction
     * @returns {Promise<Object>} - Transaction créée
     */
    async createTransaction(transactionData) {
        // Validation des données métier
        this._validateTransaction(transactionData);

        // Vérifier l'existence des comptes
        const compteDebiteur = await this.compteRepository.findByNumero(transactionData.compteDebiteur);
        const compteCrediteur = await this.compteRepository.findByNumero(transactionData.compteCrediteur);

        if (!compteDebiteur) {
            throw new Error(`Compte débiteur ${transactionData.compteDebiteur} non trouvé`);
        }
        if (!compteCrediteur) {
            throw new Error(`Compte créditeur ${transactionData.compteCrediteur} non trouvé`);
        }

        // Vérifier le solde suffisant
        if (compteDebiteur.solde < transactionData.montant) {
            throw new Error('Solde insuffisant');
        }

        return await this.compteRepository.saveTransaction(transactionData);
    }

    /**
     * Récupère les alias d'un compte
     * @param {string} numero - Numéro du compte
     * @returns {Promise<Array>} - Liste des alias
     */
    async getAlias(numero) {
        // Vérifier l'existence du compte
        const compte = await this.compteRepository.findByNumero(numero);
        if (!compte) {
            throw new Error(`Compte ${numero} non trouvé`);
        }

        return await this.compteRepository.findAliasByCompte(numero);
    }

    /**
     * Crée un nouvel alias pour un compte
     * @param {string} numero - Numéro du compte
     * @param {string} type - Type d'alias (SHID, MCOD)
     * @returns {Promise<Object>} - Alias créé
     */
    async createAlias(numero, type) {
        // Validation des règles métier
        this._validateAliasType(type);

        // Vérifier l'existence du compte
        const compte = await this.compteRepository.findByNumero(numero);
        if (!compte) {
            throw new Error(`Compte ${numero} non trouvé`);
        }

        // Vérifier la limite d'alias (20 maximum selon PI-SPI)
        const aliasCount = await this.compteRepository.getAliasCount(numero);
        if (aliasCount >= 20) {
            throw new Error('Limite d\'alias dépassée pour ce compte');
        }

        return await this.compteRepository.saveAlias(numero, type);
    }

    /**
     * Supprime un alias
     * @param {string} numero - Numéro du compte
     * @param {string} cle - Clé de l'alias
     * @returns {Promise<boolean>} - True si supprimé, false sinon
     */
    async deleteAlias(numero, cle) {
        // Vérifier l'existence du compte
        const compte = await this.compteRepository.findByNumero(numero);
        if (!compte) {
            throw new Error(`Compte ${numero} non trouvé`);
        }

        return await this.compteRepository.deleteAlias(numero, cle);
    }

    /**
     * Validation des données de transaction
     * @param {Object} transactionData - Données à valider
     * @private
     */
    _validateTransaction(transactionData) {
        if (!transactionData.compteDebiteur || !/^CIC[0-9]+$/.test(transactionData.compteDebiteur)) {
            throw new Error('compteDebiteur invalide');
        }

        if (!transactionData.compteCrediteur || !/^CIC[0-9]+$/.test(transactionData.compteCrediteur)) {
            throw new Error('compteCrediteur invalide');
        }

        if (!transactionData.montant || transactionData.montant <= 0) {
            throw new Error('montant doit être positif');
        }

        if (transactionData.motif && transactionData.motif.length > 140) {
            throw new Error('motif trop long (max 140 caractères)');
        }
    }

    /**
     * Validation du type d'alias
     * @param {string} type - Type à valider
     * @private
     */
    _validateAliasType(type) {
        if (!type || !['SHID', 'MCOD'].includes(type)) {
            throw new Error(`Type d'alias invalide: ${type}. Types autorisés: SHID, MCOD`);
        }
    }
}

module.exports = CompteService;
