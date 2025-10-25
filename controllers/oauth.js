const logger = require('../utils/logger');

/**
 * Contrôleur OAuth2 pour le simulateur
 * Simule le flux client_credentials pour les tests
 */
class OAuthController {
    /**
     * POST /oauth/token - Obtention du token OAuth2
     * Simule le flux client_credentials
     */
    async getToken(req, res) {
        try {
            const { client_id, client_secret, grant_type } = req.body;

            // Validation des paramètres
            if (!client_id || !client_secret || !grant_type) {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'Les paramètres client_id, client_secret et grant_type sont obligatoires',
                    status: 400
                });
            }

            if (grant_type !== 'client_credentials') {
                return res.status(400).json({
                    type: 'about:blank',
                    title: 'Bad Request',
                    detail: 'Seul le grant_type client_credentials est supporté',
                    status: 400
                });
            }

            // Simulation de la validation des credentials
            if (client_id !== 'mock-client-id' || client_secret !== 'mock-client-secret') {
                return res.status(401).json({
                    type: 'about:blank',
                    title: 'Unauthorized',
                    detail: 'Credentials invalides',
                    status: 401
                });
            }

            // Génération d'un token mock
            const token = {
                access_token: 'mock-token-12345',
                token_type: 'Bearer',
                expires_in: 3600,
                scope: 'compte.read compte_transaction.read compte_transaction.write alias.read alias.write alias.delete'
            };

            logger.info('Token OAuth2 généré', { client_id, scope: token.scope });
            res.json(token);

        } catch (error) {
            logger.error('Erreur lors de la génération du token', { error: error.message });
            res.status(500).json({
                type: 'about:blank',
                title: 'Internal Server Error',
                detail: 'Erreur lors de la génération du token',
                status: 500
            });
        }
    }
}

module.exports = new OAuthController();
