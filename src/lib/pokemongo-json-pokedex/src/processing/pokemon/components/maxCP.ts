import { Component, IComponent } from '@core/pipeline';
import { ItemTemplate } from '@income';
import { Pokemon } from '@outcome/pokemon';
import { Util } from '@util';
import AppSettings from '@settings/app';

@Component({
  pipeline: 'pokemon'
})
export class MaxCP implements IComponent {
  /**
   * Calculates the maximum CP amount of the given
   * Stamina, Attack and Defense values.
   * Formula source: https://www.reddit.com/r/TheSilphRoad/comments/4t7r4d/exact_pokemon_cp_formula/
   *
   * @param {Number} baseStamina The base stamina of the Pokemon
   * @param {Number} baseAttack The base attack of the Pokemon
   * @param {Number} baseDefense The base defemse of the Pokemon
   *
   * @returns {Number} The maximum CP amount of the given values
   */
  public Calculate(baseStamina: number, baseAttack: number, baseDefense: number): number {
    // Stamina = (BaseStamina + IndividualStamina) * TotalCPMultiplier
    let stamina = (baseStamina + AppSettings.MAX_INDIVIDUAL_STAMINA) * AppSettings.MAX_CP_MULTIPLIER;
    // Attack = (BaseAttack + IndividualAttack) * TotalCpMultiplier
    let attack = (baseAttack + AppSettings.MAX_INDIVIDUAL_ATTACK) * AppSettings.MAX_CP_MULTIPLIER;
    // Defense = (BaseDefense + IndividualDefense) * TotalCpMultiplier
    let defense = (baseDefense + AppSettings.MAX_INDIVIDUAL_DEFENSE) * AppSettings.MAX_CP_MULTIPLIER;

    // CP = MAX(10, FLOOR(Stamina^0.5 * Attack * Def^0.5 / 10))
    return Math.max(10,
      Math.floor(
        Math.pow(stamina, 0.5) * attack * Math.pow(defense, 0.5) / 10
      )
    );
  }

  /**
   * Calculates the max CP of a Pokemon
   */
  Process(pokemon: Pokemon, rawPokemon: ItemTemplate): Pokemon {
    pokemon.maxCP = this.Calculate(rawPokemon.pokemonSettings.stats.baseStamina, rawPokemon.pokemonSettings.stats.baseAttack, rawPokemon.pokemonSettings.stats.baseDefense);
    return pokemon;
  }
}