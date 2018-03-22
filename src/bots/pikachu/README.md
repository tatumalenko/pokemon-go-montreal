# Pikachu Discord Bot
> ***Pikachu** is a Discord bot for the [Pokémon GO Montréal](discord.me/pogomtl) server.*

Pikachu's main purpose is to alert you (via DM - direct message) of a wild spawn happening in the neighbourhood of your choosing - think of it as your own personal *wild spawn gps filter assistant*. From now on, these choices for the alerts you want will be referred to as "wild preferences".

You can specify to Pikachu via simple commands in the **#wants-post** channel your wild preferences for as many **Pokemon** in specific **neighbourhoods** with minimum **IV** and/or **Level** stats as you want.

To get started, you should familiarize yourself with which neighbourhoods represent which region of Montreal. You have two options:
1. Refer to the Google Map and browse visually, click [here](https://drive.google.com/open?id=1HeJJCUg7MdazGHeUU1-e3txsMjXreJdN) to access it. The names of the regions will appear when you click on the region of interest.
2. In the **#wants-post** channel, type the command '`!neighbourhoods`' without the quotes. This will display the list of all neighbourhoods (in alphabetical order) that are available.

Pikachu supports a number of basic commands, each initiated by entered the command symbol `!` just before any command word. 

The two fundamental commands are `!want` and `!unwant`:
- Adding a wild preference is done via the `!want` command,
- Removing a wild preference is done via the `!unwant` command

Pikachu also supports the following commands which will be explained in detail in the [Commands](#commands) section below:
- `!locations`, `!neighbourhoods`, `!translate`, `!spell`

## **Commands**:
What follows are the detailed instruction for each command. 

**IMPORTANT: DO NOT WORRY OR FEEL DAUNTED** if these all seem confusing, you will not break anything if you input something wrong, Pikachu will try and be nice and guide you! Also, don't be afraid to ask for help!

**NOTE**: In the following command-argument formats specified, `<>` represents placeholder name inputs (i.e. replace with actual value that the placeholder represents), whereas `[]` represents optional inputs.
### **`!want`** (or `!veux`)
* **Usage**:
    1) `!want [<pokemon>] [<neighbourhood>] [<level>] [<iv>]`
        * **Description**: Adds wild preference
        * `<pokemon>`: `all` or a Pokemon name (EN or FR) 
            * None specified: `all`
        * `<neighbourhood>`: `everywhere`/`locations`/`location`/neighbourhood name or alias**
            * None specified: `locations` value unless none set, if none set then it uses `everywhere`
            * `locations`: `locations` value at time of this command (`everywhere` if none set)
            * `location`: uses default locations settings dynamically (shows up as `location` but takes on values present inside `Default Locations Défaults: ...` at spawn time)
        * `<level>`: a number `0` to `40` 
            * None specified: `0` (i.e. any level)
        * `<iv>`: a number `0`, or `41` to `100` 
            * None specified: `0` (i.e. any iv)
    2) `!want blacklist <pokemon1[, pokemon2, pokemon3, ...]>`
        * **Description**: Blocks any alerts coming from specified names, useful when having `all` for a preference but wish to ignore common Pokemon
    3) `!want <status>`
        * **Description**: Changes the status of wild spawn alerts user receives
        * `<status>`: either `on` or `off`
    4) `!want`
        * **Description**: Displays the summary of all current wild preferences
* **Examples**:
    * `!want all everywhere 100` -- *Specify `all` for Pokemon and `everywhere` for neighbourhood*
        * Note: `100` used as `IV`, default `0` used as min `Level`
    * `!want blissey chansey snorlax rosemont 80` -- *Specify multiple Pokemon*
        * Note: default `0`  used as `Level`, `80` used as `IV`
    * `!want all rosemont downtown 25 90` -- *Specify multiple neighbourhoods*
        * Note: `25` used as `Level`, `90` used as `IV`
    * `!want` - *Print all current wild preferences*

**An *alias* is a synonym (often a shortcut) way of spelling a word. All the supported aliases for the neighbourhoods are detailed in the [Supported Neighbourhood Aliases](#supported-neighbourhood-aliases) section at the end of this document.

---
### **`!unwant`** (or `!veuxpas`)

* **Usage**:
    1) `!unwant [<pokemon>] [<neighbourhood>] [<level>] [<iv>]`
        * **Description**: Removes wild preference
    2) `!unwant blacklist <pokemon1[, pokemon2, pokemon3, ...]>`
        * **Description**: Remove Pokemon from blacklist
---
### **`!locations`** (or `!location`)

* **Usage**:
    1) `!locations`
        * **Description**: Get current set favorite/default regions
    2) `!locations <neighbourhood1[, neighbourhood2[, ...]]>`
        * **Description**: Set current favorite/default regions to every neighbourhood supplied

* **Examples**:
    * `!locations rosemont downtown` -- Set default locations to Rosemont and Downtown (Centre-Ville)
    * `!locations` -- Displays current default locations set
---
### **`!neighbourhoods`** (or `!map`, `!quartiers, !neighbourhood, !quartier, !districts, !areas, !sectors, !arrondissements`)

* **Usage**:
    1) `!neighbourhoods`
        * **Description**: Prints all avail. neighbourhoods and link to new neighbourhood map
    2) `!neighbourhoods <firstLetter>`
        * **Description**: Displays all avail. neighbourhoods starting in `<firstLetter>`
---
### **`!translate`** (or `!traduit`)

* **Usage**:
    1) `!translate <name>`
        * **Description**: Displays translated Pokemon `<name>`
---
### **`!spell`** (or `!ecrire, !epeler, !write, !name, !pronounce`)

* **Usage**:
    1) `!spell <word>`
        * **Description**: Displays possibly corrected `<word>`
        * `<word>`: either a Pokemon name (EN or FR) or neighbourhood name or alias


## Supported Neighbourhood Aliases
The aliases that Pikachu recognizes for neighbourhood names are given in the following list below. In each array (the groups enclosed in square brackets `["word1", "word2", etc..]`), the words inside represent synonyms of each other, i.e. any of those words can be used to specify the neighbourhood. 

For example, `["aeroport", "airport", "pet"]`, you can use either `aeroport`, `airport`, or `pet` to describe the airport neighbourhood/region for your wild preference.

```
{
    "neighbourhoodList": [
       ["aeroport", "airport", "pet"],
       ["ahuntsic"],
       ["anjou"],
       ["baie-durfe", "baiedurfe"],
       ["base-militaire", "basemilitaire", "militarybase", "military-base"],
       ["beaconsfield"],
       ["brossard"],
       ["cartierville"],
       ["centre-ville", "centreville", "downtown"],
       ["cite-du-havre", "citeduhavre", "habitat", "habitat67", "habitat-67"],
       ["cn-autoport", "cnautoport", "cn", "railroad", "cn-railroad"],
       ["cote-des-neiges", "cotedesneiges", "cdn", "c-d-n"],
       ["cote-st-luc", "cotestluc", "c-s-l", "csl"],
       ["cote-st-paul","cote-st-paul-ville-emard", "cotestpaul", "c-s-p", "csp", "ville-emard", "villeemard", "cotestpaulvilleemard", "cotestpaul-villeemard"],
       ["dollard-des-ormeaux", "dollardsdesormeaux", "ddo", "d-d-o"],
       ["dorval"],
       ["hochelaga-maisonneuve", "hochelagamaisonneuve", "hochelaga", "hochelag", "homa", "ho-ma"],
       ["ile-bizard", "ilebizard", "ile-biz", "ilebiz"],
       ["ile-des-soeurs", "iledessoeurs", "i-d-s", "ids"],
       ["ile-notre-dame", "ilenotredame"],
       ["ile-ste-helene", "ilestehelene", "la-ronde", "laronde"],
       ["jardin-botanique", "jardinbotanique","jardins-botaniques", "jardinsbotaniques", "botanical-garden", "botanicalgarden", "botanical-gardens",  "botanicalgardens", "jardins", "jardin"],
       ["kirkland"],
       ["lachine"],
       ["la-montagne", "lamontagne", "montagne", "mountain", "themountain", "the-mountain"],
       ["lasalle"],
       ["laval"],
       ["longue-pointe", "longuepointe", "l-p", "lp"],
       ["longueuil"],
       ["mont-royal", "montroyal", "ville-mont-royal", "villemontroyal", "ville-mt-royal", "villemtroyal", "town-mount-royal", "town-mountroyal", "townmountroyal", "tmr", "t-m-r"],
       ["montreal-est", "montrealest", "mtl-est", "mtlest"],
       ["montreal-nord", "montrealnord", "mtl-nord", "mtlnord"],
       ["notre-dame-de-grace", "notredamedegrace", "n-d-g", "ndg"],
       ["outremont"],
       ["pierrefonds"],
       ["plateau", "leplateau", "le-plateau"],
       ["pointe-aux-trembles", "pointeauxtrembles", "p-a-t", "pat", "pointo"],
       ["pointe-claire", "pointeclaire"],
       ["pointe-st-charles", "pointestcharles", "psc", "p-s-c"],
       ["port-de-montreal", "port-mtl", "portmontreal", "port-montreal", "portmtl", "montreal-port", "mtl-port", "montrealport", "mtlport"],
       ["rive-sud", "rivesud", "south-shore", "southshore"],
       ["riviere-des-prairies", "r-d-p", "rivieredesprairies", "rdp"],
       ["rosemont", "rsmt", "rosemontpetitepatrie", "rosemont-petite-patrie", "rosemontlapetitepatrie",  "rosemont-la-petite-patrie", "petitepatrie", "petite-patrie"],
       ["roxboro"],
       ["senneville"],
       ["stade-olympique", "stadeolympique", "stade", "olympicstadium", "olympic-stadium", "stadium"],
       ["ste-anne-de-bellevue", "steannedebellevue", "st-anne", "stanne"],
       ["st-henri-griffintown", "st-henri", "sthenri", "griffintown", "sthenri-griffintown", "sthenrigriffintown", "gtown"],
       ["st-lambert", "stlambert"],
       ["st-laurent", "stlaurent", "vsl", "v-s-l", "ville-st-laurent", "villestlaurent"],
       ["st-leonard", "stleonard", "st-leo", "stleo"],
       ["st-michel", "stmichel", "st-mich", "stmich", "st-mic", "stmic"],
       ["tetreaultville", "tetreault", "tet"],
       ["verdun"],
       ["vieux-montreal", "vieuxmontreal", "vieux-mtl", "vieuxmtl", "old-mtl", "oldmtl", "old-montreal", "oldmontreal", "vieux-port", "vieuxport", "old-port", "oldport"],
       ["village", "quartier-latin", "quartierlatin", "ste-marie", "stemarie"],
       ["villeray", "villeray-parc-extension", "villerayparcex", "villerayparcextension", "villeray-parcex", "villeray-parc-ex", "villeray-parcextension", "parcextension", " parc-ex", "parcex"],
       ["westmount"]
   ]
}
```