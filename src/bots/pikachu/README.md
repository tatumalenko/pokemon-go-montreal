# Pikachu Bot

## **Events**:
### **Class `guildMemberAdd`**
Adds a new Discord member to the User database when they join the server.

### **Class `guildMemberRemove`**
Removes a Discord member to the User database when they leave the server.

## **Commands**:
### **Class `want`**

* **Aliases**: `['veux']`

* **Usage**:
    * `!want [pokemon] [neighbourhood] [level] [iv]`: Adds wild preference from user database

### **Class `unwant`**

* **Aliases**: `['veuxpas']`

* **Usage**:
    * `!unwant [pokemon] [neighbourhood] [level] [iv]`: Removes wild preference from user database
        * `pokemon`: `all` or a Pokemon name (french or english) (if omitted, uses `all`)
        * `neighbourhood`: `everywhere` or a neighbourhood name or one of its aliases (if omitted, uses user `locations` value unless empty, if so then it uses `everywhere`)
        * `level`: a number `0` to `40` (if omitted, uses `0`, i.e. any level)
        * `iv`: a number `0`, or `41` to `100` (if omitted, uses `0`, i.e. any iv)

### **Class `locations`**

* **Alises**: `['location', 'quartiers', 'quartier']`

* **Usage**:
    * `!locations`: Get user's current set favorites hoods
    * `!locations <neighbourhood[, neighbourhood[, ...]]>`: Set user's current favorites hoods to every neighbourhood supplies

### **Class `neighbourhoods`**

* **Aliases**: `['quartiers', 'neighbourhood', 'quartier', 'districts', 'areas', 'sectors', 'arrondissements']`

* **Usage**:
    * `!neighbourhoods`: Prints all avail. neighbourhoods
    * `!neighbourhoods <firstLetter>`: All avail. neighbourhoods starting in '`firstLetter`'

### **Class `translate`**

* **Aliases**: `['traduit']`

* **Usage**:
    * `!translate <name>`: Prints translates Pokemon `name`

### **Class `spell`**

* **Aliases**: `['ecrire', 'epeler', 'write', 'name', 'pronounce']`

* **Usage**:
    * `!spell <word>`: Prints possible corrected `word`

## **Monitors**:
### **Class `wild-income`**
Relates wild spawn alerts by DM to respective users that match the query matching one of their preferences in the User database.


## Notes:

* **TO-DO**: (`guildMemberAdd.js` & `guildMemberRemove.js`)
    - [ ] Test scenarios!

* **TO-DO**: (`User.js`)
    - [x] Find way to make a validator function for each test in order to output error message for each when they fail

* **TO-DO** (`want.run`)
    - [x] Duplicate db entries
    - [ ] If one entry with same `name`, `iv`, and `level` exists but does not contain one or all of same `neighbourhoods` content, append it to existing `neighbourhoods` array in db
    - [x] Use of `location` or `locations` as neighbourhood sets the query to his current settings (if any)

* **TO-DO**: (`want.parseWildPreferenceQueryFromArgs`)
    - [x] Bad entries (out of range for `iv` and `level`)
    - [x] Bad entries (omitted for `iv` and `level`)

* **TO-DO**: (`unwant.run`)
    - [x] Remove entry with identical object query
    - [ ] If one entry with same `name`, `iv`, and `level` exists but differs in `neighbourhoods` content, overwrite field with the difference between the old and new one to existing `neighbourhoods` array in db
