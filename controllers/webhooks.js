const Webhook = require('../domain/entities/Webhook');
const logger = require('../utils/logger');

// Stockage en mémoire pour la simulation
let webhooks = new Map();

// Helper pour générer une erreur RFC 7807
function createErrorResponse(status, title, detail, invalidParams = null) {
    const error = {
        type: 'https://developers.pi-bceao.com/problems/' + status,
        title: title,
        detail: detail,
        status: status
    };

    if (invalidParams) {
        error['invalid-params'] = invalidParams;
    }

    return error;
}

// Helper pour valider les données de webhook
function validateWebhookData(data) {
    const errors = [];

    if (!data.callbackUrl) {
        errors.push({
            name: 'callbackUrl',
            reason: 'Le champ callbackUrl est obligatoire'
        });
    } else if (!Webhook.validateCallbackUrl(data.callbackUrl)) {
        errors.push({
            name: 'callbackUrl',
            reason: 'L\'URL de callback est invalide'
        });
    }

    if (!data.events) {
        errors.push({
            name: 'events',
            reason: 'Le champ events est obligatoire'
        });
    } else if (!Webhook.validateEvents(data.events)) {
        errors.push({
            name: 'events',
            reason: 'Les événements spécifiés ne sont pas valides'
        });
    }

    return errors;
}

// GET /webhooks/{id} - Consultation d'un webhook
const webhookConsulter = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation de l'ID (UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json(createErrorResponse(
                400,
                'ID invalide',
                'L\'ID fourni n\'est pas un UUID valide',
                [{ name: 'id', reason: 'Format UUID invalide' }]
            ));
        }

        const webhook = webhooks.get(id);
        if (!webhook) {
            return res.status(404).json(createErrorResponse(
                404,
                'Webhook non trouvé',
                'Le webhook demandé n\'existe pas',
                [{ name: 'id', reason: 'Webhook non trouvé' }]
            ));
        }

        logger.info('Webhook consulté', { webhookId: id });
        res.json(webhook.toJSON());

    } catch (error) {
        logger.error('Erreur lors de la consultation du webhook', { error: error.message });
        res.status(500).json(createErrorResponse(500, 'Erreur interne', 'Une erreur inattendue s\'est produite'));
    }
};

// POST /webhooks - Création d'un webhook
const webhookCreer = async (req, res) => {
    try {
        const data = req.body;

        // Validation des données
        const validationErrors = validateWebhookData(data);
        if (validationErrors.length > 0) {
            return res.status(400).json(createErrorResponse(
                400,
                'Données invalides',
                'Les données fournies ne sont pas valides',
                validationErrors
            ));
        }

        // Vérifier la limite de webhooks (simulation: max 10)
        if (webhooks.size >= 10) {
            return res.status(400).json(createErrorResponse(
                400,
                'Limite dépassée',
                'Le nombre maximum de webhooks a été atteint',
                [{ name: 'webhooks', reason: 'Limite de webhooks dépassée' }]
            ));
        }

        // Créer le webhook
        const webhook = new Webhook(data);
        webhooks.set(webhook.id, webhook);

        logger.info('Webhook créé', { webhookId: webhook.id, callbackUrl: webhook.callbackUrl });
        res.status(201).json(webhook.toJSON());

    } catch (error) {
        logger.error('Erreur lors de la création du webhook', { error: error.message });
        res.status(500).json(createErrorResponse(500, 'Erreur interne', 'Une erreur inattendue s\'est produite'));
    }
};

// PUT /webhooks/{id} - Modification d'un webhook
const webhookModifier = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Validation de l'ID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json(createErrorResponse(
                400,
                'ID invalide',
                'L\'ID fourni n\'est pas un UUID valide',
                [{ name: 'id', reason: 'Format UUID invalide' }]
            ));
        }

        const webhook = webhooks.get(id);
        if (!webhook) {
            return res.status(404).json(createErrorResponse(
                404,
                'Webhook non trouvé',
                'Le webhook demandé n\'existe pas',
                [{ name: 'id', reason: 'Webhook non trouvé' }]
            ));
        }

        // Validation des données
        const validationErrors = validateWebhookData(data);
        if (validationErrors.length > 0) {
            return res.status(400).json(createErrorResponse(
                400,
                'Données invalides',
                'Les données fournies ne sont pas valides',
                validationErrors
            ));
        }

        // Mettre à jour le webhook
        webhook.callbackUrl = data.callbackUrl;
        webhook.events = data.events;
        webhook.alias = data.alias || null;
        webhook.dateModification = new Date().toISOString();

        logger.info('Webhook modifié', { webhookId: id, callbackUrl: webhook.callbackUrl });
        res.json(webhook.toJSON());

    } catch (error) {
        logger.error('Erreur lors de la modification du webhook', { error: error.message });
        res.status(500).json(createErrorResponse(500, 'Erreur interne', 'Une erreur inattendue s\'est produite'));
    }
};

// DELETE /webhooks/{id} - Suppression d'un webhook
const webhookSupprimer = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation de l'ID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json(createErrorResponse(
                400,
                'ID invalide',
                'L\'ID fourni n\'est pas un UUID valide',
                [{ name: 'id', reason: 'Format UUID invalide' }]
            ));
        }

        const webhook = webhooks.get(id);
        if (!webhook) {
            return res.status(404).json(createErrorResponse(
                404,
                'Webhook non trouvé',
                'Le webhook demandé n\'existe pas',
                [{ name: 'id', reason: 'Webhook non trouvé' }]
            ));
        }

        webhooks.delete(id);

        logger.info('Webhook supprimé', { webhookId: id });
        res.status(204).send();

    } catch (error) {
        logger.error('Erreur lors de la suppression du webhook', { error: error.message });
        res.status(500).json(createErrorResponse(500, 'Erreur interne', 'Une erreur inattendue s\'est produite'));
    }
};

// POST /webhooks/{id}/secrets - Renouvellement du secret
const webhookSecretRenouveler = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation de l'ID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json(createErrorResponse(
                400,
                'ID invalide',
                'L\'ID fourni n\'est pas un UUID valide',
                [{ name: 'id', reason: 'Format UUID invalide' }]
            ));
        }

        const webhook = webhooks.get(id);
        if (!webhook) {
            return res.status(404).json(createErrorResponse(
                404,
                'Webhook non trouvé',
                'Le webhook demandé n\'existe pas',
                [{ name: 'id', reason: 'Webhook non trouvé' }]
            ));
        }

        // Générer un nouveau secret
        webhook.secret = webhook.generateSecret();
        webhook.dateModification = new Date().toISOString();

        logger.info('Secret webhook renouvelé', { webhookId: id });
        res.json({ secret: webhook.secret });

    } catch (error) {
        logger.error('Erreur lors du renouvellement du secret', { error: error.message });
        res.status(500).json(createErrorResponse(500, 'Erreur interne', 'Une erreur inattendue s\'est produite'));
    }
};

module.exports = {
    webhookConsulter,
    webhookCreer,
    webhookModifier,
    webhookSupprimer,
    webhookSecretRenouveler
};
