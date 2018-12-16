const GoogleSpreadsheet = require('google-spreadsheet');
const fs = require('fs');

class PidgeySpreadsheetRepo {
    constructor() {
        // spreadsheet key is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('1XZKGJuWml_Hob-XggZ1rBFMp80heiwsFL3Ygem3rGlI');

        fs.readFile('pogomontreal-1544923458445-7cdf9d4403e0.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);

            // Authorize a client with credentials, then call the Google Sheets API.
            doc.useServiceAccountAuth(JSON.parse(content), () => {
                doc.getInfo((err1, info) => {
                    if (err1) return console.log('Error loading client secret file:', err1);

                    // Finding the Pidgey sheet!
                    info.worksheets.forEach((worksheets) => {
                        if (worksheets.id === 'of9hv1p') {
                            this.sheet = worksheets;
                        }
                    });

                    this.sheet.getRows({
                        limit: this.sheet.rowCount,
                    }, (err2, rows) => {
                        if (err2) return console.log('Error reading rows:', err2);

                        this.pokedex = [];
                        let lastFamily;
                        let lastIsShiny;
                        // Keep all necessary info in memory, so that we don't read the spreadsheet for every requests.
                        rows.forEach((row) => {
                            if (row.pokémonname) {
                                this.pokedex[row.dex] = {
                                    shiny: row.isshiny,
                                    special: row.special,
                                    eventdate: row.eventdate,
                                };

                                // Only the first row of the family has the family pokedex number.
                                if (row.family === '') {
                                    this.pokedex[row.dex].family = lastFamily;
                                } else {
                                    this.pokedex[row.dex].family = row.family;
                                    lastFamily = row.family;
                                }

                                // Only the first row of the family has the isShiny flag.
                                if (row.family === '') {
                                    this.pokedex[row.dex].shiny = lastIsShiny;
                                } else {
                                    this.pokedex[row.dex].shiny = (row.isshiny === 'Yes');
                                    lastIsShiny = this.pokedex[row.dex].shiny;
                                }
                            }
                        });
                    });

                    console.log(`Loaded doc: ${info.title} by ${info.author.email}`);
                    console.log(`Sheet: ${this.sheet.title}, ${this.sheet.rowCount}`);
                });
            });
        });
    }

    async getPokedexNumber(input) {
        console.log(this.pokedex[input]);

        if (this.pokedex[input]) {
            return this.pokedex[input].family;
        }
        return input;
    }
}

module.exports = PidgeySpreadsheetRepo;
