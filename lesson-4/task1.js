const { Readable, Transform, Writable } = require('stream');
const crypto = require("crypto");

class Ui extends Readable {
    constructor(data = [], options = {encoding: 'utf8'}) {
        super(options);
        this._data = data;
        this.on('data', chunk => {});
    }

    _read() {
        let data = this._data.shift();
        for (const i in data) {
            if (!i) {
                this.push(null);
            } else {
                this.push(data[i]);
            }
        }
    }
}

class Guardian extends Transform {
    constructor(
        options = {
            readableObjectMode: true,
            decodeStrings: false,
        }
    ) {
        super(options);
    }

    _transform(chunk, encoding, done) {
        let charHex = '';
        for(const i in chunk) {
            charHex += (chunk.charCodeAt(i).toString(16));
        };

        this.push(charHex);
        done();
    }
}

class AccountManager extends Writable {
    constructor(options = {objectMode: true}) {
        super(options);
    }
    _write(chunk, encoding, done) {
        console.log(chunk);
        done();
    }
}

const customers = [
    {
        name: 'Pitter Black',
        email: 'pblack@email.com',
        password: 'pblack_123',
    },
    {
        name: 'Oliver White',
        email: 'owhite@email.com',
        password: 'owhite_456',
    },
];

const ui = new Ui(customers);
const guardian = new Guardian();
const manager = new AccountManager();

ui.pipe(guardian).pipe(manager);

// // Было
// {
//     name: 'Pitter Black',
//     email: 'pblack@email.com',
//     password: 'pblack_123'
// }
// // Стало
// {
//     meta: {
//         source: 'ui'
//     },
//     payload: {
//         name: 'Pitter Black',
//         email: '70626c61636b40656d61696c2e636f6d',
//         password: '70626c61636b5f313233'
//     }
// }