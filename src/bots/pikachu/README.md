# Pikachu Bot

## TODO:

- [ ] **Mongoose**:
    - [ ] Find way to make a validator function for each test in order to output error message for each when they fail
- [ ] **Events**:
    - [ ] Create `client.on('guildMemberAdd')` piece
    - [ ] Create `client.on('guildMemberRemove')` piece
- [ ] **Commands**:
    - [ ] Create `want` piece
        - [x] Create query parsing function
            - [ ] Check for:
                - [ ] Bad entries (out of range)
                - [ ] Bad entries (omitted)
        - [ ] Create `run` method:
            - [ ] Check for:
                - [ ] Duplicate db entries
                - [ ] If one entry with same `name`, `iv`, and `level` exists but does not contain one or all of same `neighbourhoods` content, append it to existing `neighbourhoods` array in db
                - [ ] Use of `location` or `locations` as neighbourhood sets the query to his current settings (if any)
    - [ ] Create `unwant` piece
        - [ ] Create `run` method:
            - [ ] Check for:
                - [ ] Remove entry with identical object
                - [ ] If one entry with same `name`, `iv`, and `level` exists but differs in `neighbourhoods` content, overwrite field with the difference between the old and new one to existing `neighbourhoods` array in db
    - [x] Create `location[s]` piece 
        - [x] `!<location|locations>`: Get user's current set favorites hoods
        - [x] `!<location|locations> <neighbourhood[, neighbourhood[, ...]]>`: Set user's current favorites hoods to every neighbourhood supplies
    - [x] Create `neighbourhoods|quartiers` piece (Professor Willow)
        - [x] `!<neighbourhoods|quartiers>`: All avail. neighbourhoods
        - [x] `!<neighbourhoods|quartiers> <firstLetter>`: All avail. neighbourhoods starting in '`firstLetter`'
        - [ ] Create AVA unit tests
    - [x] Create `translate|traduit` piece (Professor Willow)
        - [x] `!<translate|traduit> <word>`: Translated Pokemon name
        - [ ] Create AVA unit tests
    - [ ] Create `spell` piece
- [ ] **Monitors**:
    - [ ] Create `wild-income` piece


