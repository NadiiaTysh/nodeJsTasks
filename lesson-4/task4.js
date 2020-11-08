const { Readable, Transform, Writable } = require('stream');

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
                } else if (!allStrings) {
                    this.emit('error', 'All fields must be strings');
                } else if (keys.length > 3) {
                    this.emit('error', 'Only name, email and password allowed');
                } else {
    
                    return;
                };
            });
        };
    };

    constructor(data = [], options = {}) {
        super(options);
        this._data = data;
        this._readableState.objectMode = true;
        // Ui._validate(data);
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

class Decryptor extends Transform {
    constructor(options = {}) {
        super(options);
        this._readableState.objectMode = true;
        this._writableState.objectMode = true;
    };

    decodeHex(arg) {
        let fromCharString = '';

        for (let index = 0; index < arg.length; index += 2) {
            fromCharString += String.fromCharCode(parseInt(arg.substr(index, 2), 16));
        };

        return fromCharString;
    };

    decodeBtoa(arg) {
        const fromBtoaString = Buffer.from(arg, 'base64').toString('binary');

        return fromBtoaString;
    };

    _transform(chunk, encoding, done) {
        const newChunk = {};
        const {payload, meta: {algorithm}} = chunk;

        for (const field in payload) {
            switch (field) {
                case 'name':
                    newChunk[field] = payload[field];
                    break;
                case 'password':
                case 'email':
                    if (algorithm === 'hex') {
                        newChunk[field] = this.decodeHex(payload[field]);
                    } else {
                        newChunk[field] = this.decodeBtoa(payload[field]);
                    }
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
        payload: {
            name: 'Pitter Black',
            email: '70626c61636b40656d61696c2e636f6d',
            password: '70626c61636b5f313233',
        },
        meta: {
            algorithm: 'hex',
        },
    },
    {
        payload: {
            name: 'Oliver White',
            email: 'b3doaXRlQGVtYWlsLmNvbQ==',
            password: 'b3doaXRlXzQ1Ng==',
        },
        meta: {
            algorithm: 'btoa',
        },
    },
];

const ui = new Ui(customers);
const decryptor = new Decryptor();
const manager = new AccountManager();

ui.pipe(decryptor).pipe(manager);