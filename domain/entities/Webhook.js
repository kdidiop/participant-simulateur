const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class Webhook {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.callbackUrl = data.callbackUrl;
        this.events = data.events || [];
        this.alias = data.alias || null;
        this.secret = data.secret || this.generateSecret();
        this.dateCreation = data.dateCreation || new Date().toISOString();
        this.dateModification = data.dateModification || null;
    }

    generateSecret() {
        return crypto.randomBytes(32).toString('hex');
    }

    toJSON() {
        return {
            id: this.id,
            callbackUrl: this.callbackUrl,
            events: this.events,
            alias: this.alias,
            secret: this.secret,
            dateCreation: this.dateCreation,
            dateModification: this.dateModification
        };
    }

    // Méthodes de validation
    static validateEvents(events) {
        const validEvents = [
            'PAIEMENT_RECU',
            'PAIEMENT_ENVOYE',
            'PAIEMENT_REJETE',
            'RTP_RECU',
            'RTP_REJETE',
            'RTP_REPONSE_REJETE',
            'ANNULATION_DEMANDE',
            'ANNULATION_REPONSE_REJETE',
            'ANNULATION_REJETE',
            'RETOUR_ENVOYE',
            'RETOUR_REJETE',
            'RETOUR_RECU'
        ];

        if (!Array.isArray(events)) {
            return false;
        }

        return events.every(event => validEvents.includes(event));
    }

    static validateCallbackUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = Webhook;
