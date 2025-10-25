const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Entité Alias - Représente un alias de compte
 */
class Alias {
    constructor(compte, type) {
        this.cle = uuidv4();
        this.type = type;
        this.compte = compte;
        this.dateCreation = moment().toISOString();
    }

    /**
     * Valide le type d'alias
     * @param {string} type - Type à valider
     * @returns {boolean} - True si valide
     */
    static isValidType(type) {
        return ['SHID', 'MCOD'].includes(type);
    }

    /**
     * Valide le format de la clé UUID
     * @param {string} cle - Clé à valider
     * @returns {boolean} - True si valide
     */
    static isValidCle(cle) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(cle);
    }

    /**
     * Convertit l'entité en objet JSON
     * @returns {Object} - Représentation JSON
     */
    toJSON() {
        return {
            cle: this.cle,
            type: this.type,
            compte: this.compte,
            dateCreation: this.dateCreation
        };
    }
}

module.exports = Alias;
