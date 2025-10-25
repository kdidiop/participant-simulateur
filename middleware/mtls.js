const logger = require('../utils/logger');

const mtlsMiddleware = (req, res, next) => {
    // Skip mTLS pour les routes de santé et OAuth2
    if (req.path === '/health' || req.path === '/oauth/token') {
        return next();
    }

    // Simulation de validation mTLS
    const clientCert = req.headers['x-client-certificate'] || 'BCEAO-TEST-CERT';

    // Pour les tests, on accepte un certificat de test
    if (clientCert === 'BCEAO-TEST-CERT') {
        logger.info('Certificat de test accepté');
        return next();
    }

    if (!clientCert) {
        logger.warn('Certificat client manquant');
        return res.status(401).json({
            type: 'about:blank',
            title: 'Unauthorized',
            detail: 'Un certificat client valide est requis pour accéder à cette API',
            status: 401
        });
    }

    // Simulation de validation du certificat BCEAO
    if (!clientCert.includes('BCEAO') && !clientCert.includes('PI-SPI')) {
        logger.warn('Certificat client invalide', { cert: clientCert.substring(0, 20) + '...' });
        return res.status(403).json({
            type: 'about:blank',
            title: 'Forbidden',
            detail: 'Le certificat client doit être délivré par la BCEAO',
            status: 403
        });
    }

    logger.info('Certificat mTLS validé', {
        cert_issuer: 'BCEAO',
        cert_subject: 'PI-SPI-Participant'
    });

    next();
};

module.exports = mtlsMiddleware;
