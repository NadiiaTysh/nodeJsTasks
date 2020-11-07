const { Readable, Transform, Writable } = require('stream');

class Ui extends Readable {
    constructor(data = [], options = {}) {
        super(options);
        this._data = data;
        this.on('data', (chunk) => {
            chunk.source = this.constructor.name.toLowerCase();
        });
        this._readableState.objectMode = true;
    }

    _read() {
        const data = this._data.shift();

        if (!data) {
            this.push(null);
        } else {
            this.push(data);
        };
    };
};

class Guardian extends Transform {
    constructor(options = {}) {
        super(options);
        this._readableState.objectMode = true;
        this._writableState.objectMode = true;
    }

    encodeHex(arg) {
        let charHex = '';

        for (const index in arg) {
            charHex += arg.charCodeAt(index).toString(16);
        };

        return charHex;
    };

    _transform(chunk, encoding, done) {
        const newChunk = {meta: {}, payload: {}};

        for (const field in chunk) {
            switch (field) {
                case 'source':
                    newChunk.meta[field] = chunk[field];
                    break;
                case 'name':
                    newChunk.payload[field] = chunk[field];
                    break;
                case 'password':
                    newChunk.payload[field] = this.encodeHex(chunk[field]);
                    break;
                case 'email':
                    newChunk.payload[field] = this.encodeHex(chunk[field]);
                    break; 
                default:
                    break;
            };
        };
        this.push(newChunk);
        done();
    };
};

class AccountManager extends Writable {
    constructor(options = {}) {
        super(options);
        this._writableState.objectMode = true;
    };

    _write(chunk, encoding, done) {
        console.log(chunk);
        done();
    };
};

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