const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Erreur non gérée', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // Erreur de validation
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            type: 'about:blank',
            title: 'Bad Request',
            detail: err.message,
            status: 400,
            invalidParams: err.details || []
        });
    }

    // Erreur de syntaxe JSON
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            type: 'about:blank',
            title: 'Bad Request',
            detail: 'Le corps de la requête contient un JSON invalide',
            status: 400
        });
    }

    // Erreur de limite de taille
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            type: 'about:blank',
            title: 'Payload Too Large',
            detail: 'La taille du corps de la requête dépasse la limite autorisée',
            status: 413
        });
    }

    // Erreur interne du serveur
    res.status(500).json({
        type: 'about:blank',
        title: 'Internal Server Error',
        detail: 'Une erreur inattendue s\'est produite',
        status: 500
    });
};

module.exports = errorHandler;
