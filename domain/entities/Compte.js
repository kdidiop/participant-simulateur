/**
 * Entité Compte - Représente un compte bancaire
 */
class Compte {
    constructor(numero, solde, devise = 'XOF') {
        this.numero = numero;
        this.solde = solde;
        this.devise = devise;
        this.dateConsultation = new Date().toISOString();
    }

    /**
     * Valide le format du numéro de compte
     * @param {string} numero - Numéro à valider
     * @returns {boolean} - True si valide
     */
    static isValidNumero(numero) {
        return /^CIC[0-9]+$/.test(numero);
    }

    /**
     * Convertit l'entité en objet JSON
     * @returns {Object} - Représentation JSON
     */
    toJSON() {
        return {
            numero: this.numero,
            solde: this.solde,
            devise: this.devise,
            dateConsultation: this.dateConsultation
        };
    }
}

module.exports = Compte;
