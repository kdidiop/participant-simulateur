const CompteUseCases = require('../application/use-cases/CompteUseCases');
const logger = require('../utils/logger');

/**
 * Contrôleur pour les endpoints du module Comptes
 * Utilise l'architecture hexagonale avec les cas d'usage
 */
class CompteController {
    constructor() {
        this.compteUseCases = new CompteUseCases();
    }

    /**
     * GET /comptes/{numero} - Consultation solde
     * operationId: compteSoldeConsulter
     */
    async compteSoldeConsulter(req, res) {
        try {
            const { numero } = req.params;

            // Validation du format du compte
            if (!numero.match(/^CIC[0-9]+$/)) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'Le numéro de compte doit respecter le format CIC[0-9]+',
                    status: 400
                });
            }

            const compte = await this.compteUseCases.consulterSolde(numero);

            logger.info('Solde consulté', { numero, solde: compte.solde });
            res.json(compte);

        } catch (error) {
            logger.error('Erreur lors de la consultation du solde', { error: error.message });

            if (error.message.includes('non trouvé')) {
                return res.status(404).json({
                    type: 'about:blank',
                    title: 'Not Found',
                    detail: error.message,
                    status: 404,
                    'invalid-params': [
                        {
                            name: 'numero',
                            reason: 'Ce compte n\'existe pas'
                        }
                    ]
                });
            }

            res.status(500).json({
                type: 'about:blank',
                title: 'Internal Server Error',
                detail: 'Une erreur inattendue s\'est produite',
                status: 500
            });
        }
    }

    /**
     * GET /comptes/transactions - Liste des transactions
     * operationId: compteTransfertIntraLister
     */
    async compteTransfertIntraLister(req, res) {
        try {
            const { page = 1, size = 20, sort = '-dateCreation', statut } = req.query;

            // Validation des paramètres
            const pageNum = parseInt(page) || 1;
            const sizeNum = parseInt(size) || 20;

            if (pageNum < 1) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'La page doit être >= 1',
                    status: 400
                });
            }

            if (sizeNum < 1) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'La taille doit être >= 1',
                    status: 400
                });
            }

            if (sizeNum > 100) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'La taille doit être <= 100',
                    status: 400
                });
            }

            const transactions = await this.compteUseCases.listerTransactions({
                page: pageNum,
                size: sizeNum,
                sort,
                statut
            });

            logger.info('Transactions consultées', {
                page: pageNum,
                size: sizeNum,
                count: transactions.data.length
            });

            res.json(transactions);

        } catch (error) {
            logger.error('Erreur lors de la consultation des transactions', { error: error.message });
            res.status(500).json({
                type: 'about:blank',
                title: 'Internal Server Error',
                detail: 'Une erreur inattendue s\'est produite',
                status: 500
            });
        }
    }

    /**
     * POST /comptes/transactions - Création transfert intra-comptes
     * operationId: compteTransfertIntraCreer
     */
    async compteTransfertIntraCreer(req, res) {
        try {
            const { compteDebiteur, compteCrediteur, montant, motif } = req.body;

            // Validation des champs obligatoires
            if (!compteDebiteur || !compteCrediteur || !montant) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'Les champs compteDebiteur, compteCrediteur et montant sont obligatoires',
                    status: 400
                });
            }

            // Validation du montant
            if (montant <= 0) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'Le montant doit être positif',
                    status: 400
                });
            }

            const transaction = await this.compteUseCases.creerTransaction({
                compteDebiteur,
                compteCrediteur,
                montant,
                motif: motif || 'Transfert intra-comptes'
            });

            logger.info('Transaction créée', {
                txId: transaction.txId,
                montant,
                compteDebiteur,
                compteCrediteur
            });

            res.status(200).json(transaction);

        } catch (error) {
            logger.error('Erreur lors de la création de la transaction', { error: error.message });

            if (error.message.includes('non trouvé')) {
                return res.status(404).json({
                    type: 'about:blank',
                    title: 'Not Found',
                    detail: error.message,
                    status: 404
                });
            }

            if (error.message.includes('Solde insuffisant')) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: error.message,
                    status: 400
                });
            }

            res.status(500).json({
                type: 'about:blank',
                title: 'Internal Server Error',
                detail: 'Une erreur inattendue s\'est produite',
                status: 500
            });
        }
    }

    /**
     * GET /comptes/{numero}/alias - Liste des alias
     * operationId: aliasLister
     */
    async aliasLister(req, res) {
        try {
            const { numero } = req.params;

            // Validation du format du compte
            if (!numero.match(/^CIC[0-9]+$/)) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'Le numéro de compte doit respecter le format CIC[0-9]+',
                    status: 400
                });
            }

            const alias = await this.compteUseCases.listerAlias(numero);

            logger.info('Alias consultés', { numero, count: alias.length });
            res.json(alias);

        } catch (error) {
            logger.error('Erreur lors de la consultation des alias', { error: error.message });

            if (error.message.includes('non trouvé')) {
                return res.status(404).json({
                    type: 'about:blank',
                    title: 'Not Found',
                    detail: error.message,
                    status: 404
                });
            }

            res.status(500).json({
                type: 'about:blank',
                title: 'Internal Server Error',
                detail: 'Une erreur inattendue s\'est produite',
                status: 500
            });
        }
    }

    /**
     * POST /comptes/{numero}/alias - Création d'alias
     * operationId: aliasCreer
     */
    async aliasCreer(req, res) {
        try {
            const { numero } = req.params;
            const { type } = req.body;

            // Validation du format du compte
            if (!numero.match(/^CIC[0-9]+$/)) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'Le numéro de compte doit respecter le format CIC[0-9]+',
                    status: 400
                });
            }

            // Validation du type d'alias
            if (!type || !['SHID', 'MCOD'].includes(type)) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'Le type d\'alias doit être SHID ou MCOD',
                    status: 400
                });
            }

            const alias = await this.compteUseCases.creerAlias(numero, type);

            logger.info('Alias créé', { numero, type, cle: alias.cle });
            res.status(201).json(alias);

        } catch (error) {
            logger.error('Erreur lors de la création de l\'alias', { error: error.message });

            if (error.message.includes('non trouvé')) {
                return res.status(404).json({
                    type: 'about:blank',
                    title: 'Not Found',
                    detail: error.message,
                    status: 404
                });
            }

            if (error.message.includes('Limite d\'alias dépassée')) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: error.message,
                    status: 400
                });
            }

            res.status(500).json({
                type: 'about:blank',
                title: 'Internal Server Error',
                detail: 'Une erreur inattendue s\'est produite',
                status: 500
            });
        }
    }

    /**
     * DELETE /comptes/{numero}/alias/{cle} - Suppression d'alias
     * operationId: aliasSupprimer
     */
    async aliasSupprimer(req, res) {
        try {
            const { numero, cle } = req.params;

            // Validation du format du compte
            if (!numero.match(/^CIC[0-9]+$/)) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'Le numéro de compte doit respecter le format CIC[0-9]+',
                    status: 400
                });
            }

            // Validation du format de la clé (UUID)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!cle.match(uuidRegex)) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'La clé d\'alias doit être un UUID v4 valide',
                    status: 400
                });
            }

            const deleted = await this.compteUseCases.supprimerAlias(numero, cle);

            if (!deleted) {
                return res.status(404).json({
                    type: 'about:blank',
                    title: 'Not Found',
                    detail: `L'alias ${cle} n'existe pas pour le compte ${numero}`,
                    status: 404,
                    'invalid-params': [
                        {
                            name: 'cle',
                            reason: 'L\'alias n\'existe pas'
                        }
                    ]
                });
            }

            logger.info('Alias supprimé', { numero, cle });
            res.status(204).send();

        } catch (error) {
            logger.error('Erreur lors de la suppression de l\'alias', { error: error.message });

            if (error.message.includes('non trouvé')) {
                // Déterminer si c'est le compte ou l'alias qui n'existe pas
                if (error.message.includes('Compte')) {
                    return res.status(404).json({
                        type: 'about:blank',
                        title: 'Not Found',
                        detail: error.message,
                        status: 404,
                        'invalid-params': [
                            {
                                name: 'numero',
                                reason: 'Ce compte n\'existe pas'
                            }
                        ]
                    });
                } else {
                    return res.status(404).json({
                        type: 'about:blank',
                        title: 'Not Found',
                        detail: error.message,
                        status: 404,
                        'invalid-params': [
                            {
                                name: 'cle',
                                reason: 'L\'alias n\'existe pas'
                            }
                        ]
                    });
                }
            }

            res.status(500).json({
                type: 'about:blank',
                title: 'Internal Server Error',
                detail: 'Une erreur inattendue s\'est produite',
                status: 500
            });
        }
    }
}

// Créer une instance du contrôleur
const compteController = new CompteController();

module.exports = {
    // Noms des méthodes correspondant aux operationId de l'OpenAPI
    compteSoldeConsulter: (req, res) => compteController.compteSoldeConsulter(req, res),
    compteTransfertIntraLister: (req, res) => compteController.compteTransfertIntraLister(req, res),
    compteTransfertIntraCreer: (req, res) => compteController.compteTransfertIntraCreer(req, res),
    aliasLister: (req, res) => compteController.aliasLister(req, res),
    aliasCreer: (req, res) => compteController.aliasCreer(req, res),
    aliasSupprimer: (req, res) => compteController.aliasSupprimer(req, res)
};