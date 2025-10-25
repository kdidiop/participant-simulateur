const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Détermine le scope requis selon l'endpoint et la méthode
 */
function getRequiredScope(path, method) {
    // Endpoints de consultation
    if (path.includes('/comptes/') && method === 'GET' && !path.includes('/transactions')) {
        return 'compte.read';
    }

    // Endpoints de transactions
    if (path.includes('/comptes/transactions')) {
        return method === 'GET' ? 'compte_transaction.read' : 'compte_transaction.write';
    }

    // Endpoints d'alias
    if (path.includes('/alias')) {
        if (method === 'GET') return 'alias.read';
        if (method === 'POST') return 'alias.write';
        if (method === 'DELETE') return 'alias.delete';
    }

    return null;
}

const oauth2Middleware = (req, res, next) => {
    // Skip OAuth2 pour les routes de santé et OAuth2
    if (req.path === '/health' || req.path === '/oauth/token' || req.method === 'POST' && req.path === '/oauth/token') {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            type: 'about:blank',
            title: 'Unauthorized',
            detail: 'Token d\'authentification manquant ou invalide',
            status: 401
        });
    }

    const token = authHeader.substring(7);

    try {
        // Simulation de validation du token
        if (!token.startsWith('mock-token-')) {
            throw new Error('Token invalide');
        }

        // Simulation des scopes
        const scopes = [
            'compte.read',
            'compte.write',
            'alias.read',
            'alias.write',
            'alias.delete',
            'compte_transaction.read',
            'compte_transaction.write'
        ];

        req.user = {
            client_id: 'mock-client',
            scopes: scopes
        };

        // Vérifier les permissions spécifiques selon l'endpoint
        const requiredScope = getRequiredScope(req.path, req.method);
        if (requiredScope && !scopes.includes(requiredScope)) {
            logger.warn('Permission insuffisante', {
                required: requiredScope,
                available: scopes,
                path: req.path,
                method: req.method
            });
            return res.status(403).json({
                type: 'about:blank',
                title: 'Forbidden',
                detail: `Permission ${requiredScope} requise pour accéder à cette ressource`,
                status: 403
            });
        }

        logger.info('Token OAuth2 validé', {
            client_id: req.user.client_id,
            scopes: scopes.length
        });

        next();
    } catch (error) {
        logger.error('Erreur de validation du token', { error: error.message });
        return res.status(401).json({
            type: 'about:blank',
            title: 'Unauthorized',
            detail: 'Le token d\'authentification est invalide ou expiré',
            status: 401
        });
    }
};

module.exports = oauth2Middleware;
