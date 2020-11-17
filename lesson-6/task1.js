const { readFile, writeFile } = require('fs').promises;
const path = require('path');

const inputFile = path.join(__dirname, '/data/comments.json');
const outputFile = path.join(__dirname, '/data/comments.csv');

class Json2Csv {
    constructor(input, output) {
        this.in = input;
        this.out = output;
        (async () => {
            const data = await this.parseJson(this.in);
            const CSV = this.arrayToCsv(data);
            await this.writeCsv(this.out, CSV);
            console.log(`Successfully converted!`);
        })()
    };

    async parseJson(input) {
        try {
            const content = await readFile(input);
    
            return JSON.parse(content);
        } catch (error) {
            console.log(error);
            process.exit();
        }
    };
    
    arrayToCsv(data) {
        const csv = data.map(row => {
            const values = Object.values(row);
    
            return values;
        });
        csv.unshift(Object.keys(data[0]));

        return `"${csv.join('"\r\n"').replace(/,/g, '","')}"`;
    };
    
    async writeCsv(output, data) {
        try {
            await writeFile(output, data, 'utf8');
        } catch (error) {
            console.log(error);
            process.exit();
        }
    };
};

const json2Csv = new Json2Csv(inputFile, outputFile);
