
class Pokemon {
    /**
   *
   * @param {Object} pkmn - The Pokemon ctx object.
   * @param {String} pkmn.name - The Pokemon name.
   * @param {number} pkmn.iv - The Pokemon iv.
   */
    constructor({
        name,
        level,
        cp,
        iv,
        stats: {
            iv: { attack, defense, stamina },
        },
    }) {
        this.name = name || '';
        this.level = level || 0;
        this.cp = cp || 0;
        this.iv = iv || 0;
        this.stats = {
            iv: { attack, defense, stamina },
        };
    }
}

module.exports = Pokemon;
