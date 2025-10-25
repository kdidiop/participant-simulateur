const CompteRepository = require('../../domain/ports/CompteRepository');
const Compte = require('../../domain/entities/Compte');
const Alias = require('../../domain/entities/Alias');
const Transaction = require('../../domain/entities/Transaction');
const logger = require('../../utils/logger');
const moment = require('moment');

/**
 * Implémentation du repository pour la gestion des comptes (en mémoire)
 * Implémente l'output port CompteRepository
 */
class CompteRepositoryImpl extends CompteRepository {
    constructor() {
        super();
        // Données de test en mémoire
        this.comptes = [
            new Compte('CIC2344256727788288822', 1500000, 'XOF'), // Compte existant normal
            new Compte('CIC2344256727788288823', 750000, 'XOF'), // Compte existant normal
            new Compte('CIC9999999999999999999', 100000, 'XOF'), // Compte avec limite d'alias dépassée (20 alias)
            new Compte('CIC8888888888888888888', 50000, 'XOF'),   // Compte avec solde insuffisant
            new Compte('CIC7777777777777777777', 200000, 'XOF')  // Compte sans alias
        ];

        this.alias = [
            // Alias pour le compte normal (seulement 2 alias initiaux)
            {
                cle: '8b1b2499-3e50-435b-b757-ac7a83d8aa7f',
                type: 'SHID',
                compte: 'CIC2344256727788288822',
                dateCreation: moment(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: '9c2c3500-4f61-4c6c-a868-bd8b94e9bb8f',
                type: 'MCOD',
                compte: 'CIC2344256727788288822',
                dateCreation: moment(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            // 20 alias pour le compte avec limite dépassée (selon PI-SPI)
            {
                cle: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                type: 'SHID',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
                type: 'MCOD',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
                type: 'SHID',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'd4e5f6g7-h8i9-0123-def0-456789012345',
                type: 'MCOD',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'e5f6g7h8-i9j0-1234-ef01-567890123456',
                type: 'SHID',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'f6g7h8i9-j0k1-2345-f012-678901234567',
                type: 'MCOD',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'g7h8i9j0-k1l2-3456-0123-789012345678',
                type: 'SHID',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'h8i9j0k1-l2m3-4567-1234-890123456789',
                type: 'MCOD',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'i9j0k1l2-m3n4-5678-2345-901234567890',
                type: 'SHID',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'j0k1l2m3-n4o5-6789-3456-012345678901',
                type: 'MCOD',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'k1l2m3n4-o5p6-7890-4567-123456789012',
                type: 'SHID',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'l2m3n4o5-p6q7-8901-5678-234567890123',
                type: 'MCOD',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'm3n4o5p6-q7r8-9012-6789-345678901234',
                type: 'SHID',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'n4o5p6q7-r8s9-0123-7890-456789012345',
                type: 'MCOD',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'o5p6q7r8-s9t0-1234-8901-567890123456',
                type: 'SHID',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'p6q7r8s9-t0u1-2345-9012-678901234567',
                type: 'MCOD',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'q7r8s9t0-u1v2-3456-0123-789012345678',
                type: 'SHID',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 'r8s9t0u1-v2w3-4567-1234-890123456789',
                type: 'MCOD',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 's9t0u1v2-w3x4-5678-2345-901234567890',
                type: 'SHID',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                cle: 't0u1v2w3-x4y5-6789-3456-012345678901',
                type: 'MCOD',
                compte: 'CIC9999999999999999999',
                dateCreation: moment(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        this.transactions = [
            {
                txId: 'TXN001',
                statut: 'IRREVOCABLE',
                dateCreation: moment(Date.now() - 60 * 60 * 1000).toISOString(),
                compteDebiteur: 'CIC2344256727788288822',
                compteCrediteur: 'CIC2344256727788288823',
                montant: 100000,
                motif: 'Transfert test'
            },
            {
                txId: 'TXN002',
                statut: 'INITIE',
                dateCreation: moment(Date.now() - 30 * 60 * 1000).toISOString(),
                compteDebiteur: 'CIC2344256727788288823',
                compteCrediteur: 'CIC2344256727788288822',
                montant: 50000,
                motif: 'Paiement service'
            }
        ];
    }

    /**
     * Récupère un compte par son numéro
     * @param {string} numero - Numéro du compte
     * @returns {Promise<Object|null>} - Compte ou null
     */
    async findCompteByNumero(numero) {
        logger.info('Recherche du compte', { numero });
        const compte = this.comptes.find(c => c.numero === numero);
        return compte ? compte.toJSON() : null;
    }

    /**
     * Récupère les transactions avec filtres et pagination
     * @param {Object} filters - Filtres de recherche
     * @returns {Promise<Object>} - Liste paginée des transactions
     */
    async findTransactions(filters) {
        logger.info('Recherche des transactions', filters);

        let filteredTransactions = [...this.transactions];

        // Filtrage par statut
        if (filters.statut) {
            filteredTransactions = filteredTransactions.filter(t => t.statut === filters.statut);
        }

        // Tri
        if (filters.sort) {
            const sortField = filters.sort.startsWith('-') ? filters.sort.substring(1) : filters.sort;
            const sortOrder = filters.sort.startsWith('-') ? -1 : 1;

            filteredTransactions.sort((a, b) => {
                if (sortField === 'dateCreation') {
                    return sortOrder * (new Date(a.dateCreation) - new Date(b.dateCreation));
                }
                return sortOrder * (a[sortField] - b[sortField]);
            });
        }

        // Pagination
        const startIndex = (filters.page - 1) * filters.size;
        const endIndex = startIndex + filters.size;
        const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

        return {
            data: paginatedTransactions,
            meta: {
                total: filteredTransactions.length,
                page: filters.page,
                size: filters.size,
                next: endIndex < filteredTransactions.length ? filters.page + 1 : null,
                prev: filters.page > 1 ? filters.page - 1 : null
            }
        };
    }

    /**
     * Sauvegarde une nouvelle transaction
     * @param {Object} transactionData - Données de la transaction
     * @returns {Promise<Object>} - Transaction créée
     */
    async saveTransaction(transactionData) {
        const transaction = new Transaction(
            transactionData.compteDebiteur,
            transactionData.compteCrediteur,
            transactionData.montant,
            transactionData.motif
        );

        this.transactions.push(transaction.toJSON());

        logger.info('Transaction créée', {
            txId: transaction.txId,
            montant: transactionData.montant
        });

        return transaction.toJSON();
    }

    /**
     * Récupère les alias d'un compte
     * @param {string} numero - Numéro du compte
     * @returns {Promise<Array>} - Liste des alias
     */
    async findAliasByCompte(numero) {
        logger.info('Recherche des alias', { numero });
        const aliasList = this.alias.filter(a => a.compte === numero);

        // S'assurer que tous les champs sont présents
        return aliasList.map(alias => ({
            cle: alias.cle,
            type: alias.type,
            compte: alias.compte,
            dateCreation: alias.dateCreation
        }));
    }

    /**
     * Sauvegarde un nouvel alias
     * @param {string} numero - Numéro du compte
     * @param {string} type - Type d'alias
     * @returns {Promise<Object>} - Alias créé
     */
    async saveAlias(numero, type) {
        // Pour les tests, on limite le nombre d'alias par compte à 3 maximum
        const existingAliasCount = this.alias.filter(a => a.compte === numero).length;
        if (existingAliasCount >= 3) {
            // Supprimer les alias les plus anciens pour ce compte (garder seulement les 2 premiers)
            const aliasToKeep = this.alias.filter(a => a.compte !== numero);
            const aliasForThisAccount = this.alias.filter(a => a.compte === numero).slice(0, 2);
            this.alias = [...aliasToKeep, ...aliasForThisAccount];
        }

        const alias = new Alias(numero, type);
        const aliasData = alias.toJSON();

        this.alias.push(aliasData);

        logger.info('Alias créé', { numero, type, cle: alias.cle });

        return aliasData;
    }

    /**
     * Trouve un compte par son numéro
     * @param {string} numero - Numéro du compte
     * @returns {Promise<Object|null>} - Compte trouvé ou null
     */
    async findByNumero(numero) {
        logger.info('Recherche compte par numéro', { numero });
        return this.comptes.find(c => c.numero === numero) || null;
    }

    /**
     * Compte le nombre d'alias pour un compte
     * @param {string} numero - Numéro du compte
     * @returns {Promise<number>} - Nombre d'alias
     */
    async getAliasCount(numero) {
        logger.info('Compte des alias', { numero });
        return this.alias.filter(a => a.compte === numero).length;
    }

    /**
     * Supprime un alias
     * @param {string} numero - Numéro du compte
     * @param {string} cle - Clé de l'alias
     * @returns {Promise<boolean>} - True si supprimé
     */
    async deleteAlias(numero, cle) {
        logger.info('Suppression d\'alias', { numero, cle });

        const aliasIndex = this.alias.findIndex(a => a.compte === numero && a.cle === cle);

        if (aliasIndex === -1) {
            return false;
        }

        this.alias.splice(aliasIndex, 1);

        logger.info('Alias supprimé', { numero, cle });

        return true;
    }
}

module.exports = CompteRepositoryImpl;
