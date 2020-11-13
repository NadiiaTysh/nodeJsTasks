const { Readable, Transform, Writable } = require('stream');
const crypto = require('crypto');

const algorithm = 'aes192';
const password = '1qaZxsw2@3edcVfr4';

class Ui extends Readable {  

    static _validate(data) {
        if(data) {
            data.forEach(obj => {
                const keys = Object.keys(obj);
                const values = Object.values(obj);
                const fieldsRequired = [ 'name', 'email', 'password' ];
                const allFields = fieldsRequired.every(val => keys.includes(val));
                const allStrings = values.every(element => {
                    return (typeof element === 'string');
                });
                
                if (!allFields) {
                    this.emit('error', 'Not all fields are stated');

                    return;
                } else if (!allStrings) {
                    this.emit('error', 'All fields must be not empty strings');
                
                    return;
                } else if (keys.length > 3) {
                    this.emit('error', 'Only name, email and password allowed in payload');
                
                    return;
                } else {
    
                    return;
                };
            });
        };
    };

    constructor(data = [], options = {}) {
        super(options);
        Ui._validate(data);
        this._data = data;
        this._readableState.objectMode = true;
        this.init();
    };

    init() {
        this.on('data', (chunk) => {
            chunk.source = this.constructor.name.toLowerCase();
        });
    };

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
    constructor(options = {encodedFields: ['password', 'email'], inMeta: 'source'}) {
        super(options);
        this.options = options;
        this._readableState.objectMode = true;
        this._writableState.objectMode = true;
    };

    _transform(chunk, encoding, done) {
        crypto.scrypt(password, 'salt', 24, (err, key) => {
            if (err) throw err;

            crypto.randomFill(new Uint8Array(16), (err, iv) => {
                if (err) throw err;

                const newChunk = {meta: {}, payload: {}};
                const {encodedFields, inMeta} = this.options;

                for (const field in chunk) {
                    if(field === inMeta) {
                        newChunk.meta[field] = chunk[field];

                    } else if(encodedFields.find(element => element === field)) {

                        const cipher = crypto.createCipheriv(algorithm, key, iv);
        
                        let encrypted = '';
                        cipher.setEncoding('hex');
        
                        cipher.on('data', (piece) => {
                            (encrypted += piece);
                            newChunk.payload[field] = encrypted;
                        });
                        cipher.write(chunk[field]);
                        cipher.end();
                    } else {
                        newChunk.payload[field] = chunk[field];
                    };
                };
                this.push(newChunk);
                done();
            });
        });
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