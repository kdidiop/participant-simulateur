const moment = require('moment');

/**
 * Entité Transaction - Représente une transaction bancaire
 */
class Transaction {
    constructor(compteDebiteur, compteCrediteur, montant, motif = 'Transfert intra-comptes') {
        this.txId = 'TXN' + Date.now();
        this.statut = 'INITIE';
        this.dateCreation = moment().toISOString();
        this.compteDebiteur = compteDebiteur;
        this.compteCrediteur = compteCrediteur;
        this.montant = montant;
        this.motif = motif;
    }

    /**
     * Valide les données de transaction
     * @param {Object} data - Données à valider
     * @returns {Object} - Résultat de validation
     */
    static validate(data) {
        const errors = [];

        if (!data.compteDebiteur || !/^CIC[0-9]+$/.test(data.compteDebiteur)) {
            errors.push('compteDebiteur invalide');
        }

        if (!data.compteCrediteur || !/^CIC[0-9]+$/.test(data.compteCrediteur)) {
            errors.push('compteCrediteur invalide');
        }

        if (!data.montant || data.montant <= 0) {
            errors.push('montant doit être positif');
        }

        if (data.motif && data.motif.length > 140) {
            errors.push('motif trop long (max 140 caractères)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Convertit l'entité en objet JSON
     * @returns {Object} - Représentation JSON
     */
    toJSON() {
        return {
            txId: this.txId,
            statut: this.statut,
            dateCreation: this.dateCreation,
            compteDebiteur: this.compteDebiteur,
            compteCrediteur: this.compteCrediteur,
            montant: this.montant,
            motif: this.motif
        };
    }
}

module.exports = Transaction;
