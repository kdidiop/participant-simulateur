const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
require('dotenv').config();

const logger = require('./utils/logger');
const oauth2Middleware = require('./middleware/oauth2');
const mtlsMiddleware = require('./middleware/mtls');
const errorHandler = require('./middleware/error-handler');

// Import controllers
const comptesController = require('./controllers/comptes');
const oauthController = require('./controllers/oauth');
const webhooksController = require('./controllers/webhooks');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de sécurité (sauf pour OAuth2)
app.use((req, res, next) => {
    if (req.path === '/oauth/token' && req.method === 'POST') {
        return next();
    }
    mtlsMiddleware(req, res, next);
});

app.use((req, res, next) => {
    if (req.path === '/oauth/token' && req.method === 'POST') {
        return next();
    }
    oauth2Middleware(req, res, next);
});

// Routes publiques (sans authentification)

// Routes du module Comptes - Noms correspondant aux operationId
// Routes spécifiques avant les routes avec paramètres
app.get('/comptes/transactions', comptesController.compteTransfertIntraLister);
app.post('/comptes/transactions', comptesController.compteTransfertIntraCreer);
// Routes avec paramètres
app.get('/comptes/:numero', comptesController.compteSoldeConsulter);
app.get('/comptes/:numero/alias', comptesController.aliasLister);
app.post('/comptes/:numero/alias', comptesController.aliasCreer);
app.delete('/comptes/:numero/alias/:cle', comptesController.aliasSupprimer);

// Routes du module Webhooks
app.get('/webhooks/:id', webhooksController.webhookConsulter);
app.post('/webhooks', webhooksController.webhookCreer);
app.put('/webhooks/:id', webhooksController.webhookModifier);
app.delete('/webhooks/:id', webhooksController.webhookSupprimer);
app.post('/webhooks/:id/secrets', webhooksController.webhookSecretRenouveler);

// Route de santé
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        scenario: process.env.SCENARIO || 'perfectConformance'
    });
});

// Route OAuth2 pour la simulation
app.post('/oauth/token', (req, res) => {
    const { client_id, client_secret, grant_type } = req.body;

    if (grant_type !== 'client_credentials') {
        return res.status(400).json({
            error: 'unsupported_grant_type',
            error_description: 'Seul le grant_type client_credentials est supporté'
        });
    }

    if (client_id !== process.env.OAUTH_CLIENT_ID || client_secret !== process.env.OAUTH_CLIENT_SECRET) {
        return res.status(401).json({
            error: 'invalid_client',
            error_description: 'Identifiants client invalides'
        });
    }

    const token = {
        access_token: 'mock-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'compte.read compte.write alias.read alias.write alias.delete compte_transaction.read compte_transaction.write webhook.read webhook.write webhook.delete webhook.secret'
    };

    logger.info('Token OAuth2 généré', { client_id, scope: token.scope });
    res.json(token);
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
    logger.info(`🚀 Simulateur de participant PI-SPI démarré sur le port ${PORT}`);
    logger.info(`📊 Scénario actuel: ${process.env.SCENARIO || 'perfectConformance'}`);
    logger.info(`🔗 URL: http://localhost:${PORT}`);
    logger.info(`📋 Documentation: http://localhost:${PORT}/health`);
});

module.exports = app;
