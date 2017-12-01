/*
 * Localization Dictionary
 */

module.exports = {
    dict
};

function dict() {
    return {
        PIKACHU_COMMANDS: () => '**Possible commands:**\n'

            +
            '**`\'!want [...]\'`**... Type `\'!want help\'` for more info.\n'

            +
            '**`\'!unwant [...]\'`**... Type `\'!want help\'` for more info.\n'

            +
            '**`\'!translate <name of Pokemon in English or French>\'`**\n\n'

            +
            '**Commandes dispo:**\n'

            +
            '**`\'!veux [...]\'`**... Tapez `\'!veux aide\'` pour plus d\'info.\n'

            +
            '**`\'!veuxpas [...]\'`**... Tapez `\'!veux aide\'` pour plus d\'info.\n'

            +
            '**`\'!traduit <nom d\'un Pokemon en Anglais ou Francais>\'`**\n',
        WANT_HELP: () => '**Pika-chu**! `The `**`\'!want\'`**` command allows you to subscribe to wild spawn alerts for the Pokemon AND neighbourhoods you select!`\n\n'

            +
            '`This means that you will ONLY receive notifications via DM (direct message) IF you specified AT LEAST ONE neighbourhood. ' +
            'The only exception is`** `Unown`** `, which everyone who subscribes to will receive a DM regardless of location due to its extreme rarity.`\n\n'

            +
            '**`STEP 1`**`: Subscribe to specific Pokemon or condition by typing:`\n\n' +
            '             **`\'!want <name/condition>\'`** \n\n' +
            '**`\'name\'`**`: refers to one specific Pokemon name`\n' +
            '**`\'condition\'`**`: refers to predefined condition check for a Pokemon (options are \'iv90\', \'iv100\', \'cp2500\', \'iv90lv25\', \'iv95lv25\', \'iv90lv30\' see below for more details)`\n\n'

            +
            '**`STEP 2`**`: Subscribe to specific neighbourhood by typing:`\n\n' +
            '             **`\'!want <neighbourhood>\'`** \n\n' +
            '**`\'neighbourhood\'`**`: refers to one specific neighbourhood name (see below for a list of possible valid neighbourhood names)`\n\n'

            +
            '`For example: `\n\n' +
            '             **`\'!want iv90\'`** \n' +
            '             **`\'!want ville-marie\'`** \n\n' +
            '`Typing ^ those above, separately, will send you alerts for any Pokemon with an IV > 90 spawning in Ville-Marie. The command can be ' +
            'repeated any number of times to specify as many Pokemon name(s)/condition(s) and neighbourhood(s) as you desire.`\n\n'

            +
            '`To unsubscribe from a specific Pokemon name/condition or neighbourhood, type:` \n\n' +
            '             **`\'!unwant <name/condition/neighbourhood>\'`** \n\n'

            +
            '`To unsubscribe from ALL Pokemon name/condition filters, type:` \n\n' +
            '             **`\'!unwant all\'`** \n\n'

            +
            '`To subscribe to ALL neighbourhood in one command, type:` \n\n' +
            '             **`\'!want everywhere\'`** \n\n'

            +
            '`To unsubscribe from ALL neighbourhoods in one command, type:` \n\n' +
            '             **`\'!unwant everywhere\'`**\n\n'

            +
            '`To list all Pokemon name(s)/condition(s) and neighbourhood(s) you are currently subsribed to, type:`\n\n' +
            '             **`\'!want\'`**\n\n'

            +
            '`To list all valid neighbourhood names and Pokemon conditional filters, type:`\n\n' +
            '             **`\'!want help more\'`**\n\n',

        WANT_HELP_MORE: () => '`Available Pokemon conditions to use in `**`\'!want <name/condition>\'`**`:`\n\n' +
            '**`\'iv90\'`**`: get alerts for all Pokemon with IV > 90 (keep in mind if you select \'iv90\', by default you also get \'iv100\') `\n' +
            '**`\'iv100\'`**`: get alerts for all Pokemon with IV > 100 `\n' +
            '**`\'cp2500\'`**`: get alerts for all Pokemon with CP > 2500 `\n' +
            '**`\'iv90lv25\'`**`: get alerts for all Pokemon with IV > 90 AND LV = 25 `\n' +
            '**`\'iv95lv25\'`**`: get alerts for all Pokemon with IV > 95 AND LV = 25 `\n' +
            '**`\'iv90lv30\'`**`: get alerts for all Pokemon with IV > 90 AND LV = 30 `\n\n'

            +
            '`Available neighbourhood names to use in `**`\'!want <neighbourhood>\'`**`: `\n\n',

        VEUX_AIDE: () => '**Pika-chu**! `La commande`** `\'!veux\'`** `vous permet de vous abonner aux alertes de spawn sauvage pour les quartiers ET Pokemons que vous sélectionnez!`\n\n'

            +
            '`Cela signifie que vous recevrez UNIQUEMENT des notifications via MD (message direct) SI vous avez spécifié AU MOINS UN quartier. ' +
            'La seule exception est` **`Unown/Zarbi`**`, auquel tous ceux qui s\'abonnent recevront un MD quel que soit leur emplacement en raison de son extrême rareté.`\n\n'

            +
            '**`ÉTAPE 1`**`: Abonnez-vous à un Pokemon spécifique ou condition en tapant:`\n\n' +
            '             **`\'!veux <nom/condition>\'`** \n\n' +
            '**`\'nom\'`**`: fait référence à un nom de Pokémon spécifique`\n' +
            '**`\'condition\'`**`: se réfère à la vérification de condition prédéfinie pour un Pokémon (les options sont \'iv90\', \'iv100\', \'cp2500\', \'iv90lv25\', \'iv95lv25\', \'iv90lv30\' voir ci-dessous pour plus de détails)`\n\n'

            +
            '**`ÉTAPE 2`**`: Abonnez-vous à un quartier spécifique en tapant:`\n\n' +
            '             **`\'!veux <quartier>\'`** \n\n' +
            '**`\'quartier\'`**`: fait référence à un nom de quartier spécifique (voir ci-dessous pour une liste des noms de quartier valides possibles)`\n\n'

            +
            '`Par example: `\n\n' +
            '             **`\'!veux iv90\'`** \n' +
            '             **`\'!veux ville-marie\'`** \n\n' +
            '`Taper ^ ci-dessus, séparément, vous enverra des alertes pour tout Pokémon ayant IV > 90 dans Ville-Marie. La commande peut être ' +
            'répété plusieurs fois.`\n\n'

            +
            '`Pour vous désinscrire d\'un nom ou d\'une condition Pokémon spécifique, tapez:` \n\n' +
            '             **`\'!veuxpas <nom/condition/quartier>\'`** \n\n'

            +
            '`Pour vous désabonner de TOUS les filtres de nom / condition Pokémon, tapez:` \n\n' +
            '             **`\'!veuxpas tous\'`** \n\n'

            +
            '`Pour vous abonner à TOUS les quartiers en une seule commande, tapez:` \n\n' +
            '             **`\'!veux partout\'`** \n\n'

            +
            '`Pour vous désabonner de TOUS les quartiers dans une commande, tapez:` \n\n' +
            '             **`\'!veuxpas partout\'`**\n\n'

            +
            '`Pour lister tous les noms de Pokémon/condition(s) et quartier(s) vous êtes actuellement abonné, tapez:`\n\n' +
            '             **`\'!veux\'`**\n\n'

            +
            '`Pour lister tous les noms de quartiers valides et les filtres conditionnels Pokemon, tapez:`\n\n' +
            '             **`\'!veux aide plus\'`**\n\n',

        VEUX_AIDE_PLUS: () => '`Conditions Pokemon disponibles à utiliser dans `**`\'!veux <nom/condition>\'`**`:`\n\n' +
            '**`\'iv90\'`**`: recevoir des alertes pour tous les Pokémon avec IV> 90 (gardez à l\'esprit si vous sélectionnez \'iv90\', par défaut, vous obtenez également \'iv100\') `\n' +
            '**`\'iv100\'`**`: obtenir des alertes pour tous les Pokémon avec IV > 100 `\n' +
            '**`\'cp2500\'`**`: obtenir des alertes pour tous les Pokémon avec CP > 2500 `\n' +
            '**`\'iv90lv25\'`**`: obtenir des alertes pour tous les Pokémon avec IV > 90 AND LV = 30 `\n' +
            '**`\'iv95lv25\'`**`: obtenir des alertes pour tous les Pokémon avec IV > 95 AND LV = 25 `\n' +
            '**`\'iv90lv30\'`**`: obtenir des alertes pour tous les Pokémon avec IV > 90 AND LV = 30 `\n\n'

            +
            '`Noms de quartier disponibles à utiliser dans `**`\'!veux <quartier>\'`**`: `\n\n',

        WANT_MULTIPLE_COMMAND_ERROR: () => 'Please only send one Pokemon or neighbourhood name per \'!want\' command.',

        VEUX_ERREUR_COMMANDES_MULTIPLES: () => 'SVP, n\'envoyez qu\'un nom de Pokemon ou de quartier pour chaque commande de \'!veux\'.'
    };
}