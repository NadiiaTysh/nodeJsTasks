const { Readable, Transform, Writable } = require('stream');

class Ui extends Readable {  
    static _validate(data) {
        if(data) {
            data.forEach(obj => {
                const {meta: {algorithm}} = obj;
                const algorithmsAllowed = [ 'hex', 'base64' ];
                const keys = Object.keys(obj.payload);
                const values = Object.values(obj.payload);
                const fieldsRequired = [ 'name', 'email', 'password' ];
                const allFields = fieldsRequired.every(val => keys.includes(val));
                const allStrings = values.every(element => {
                    return (typeof element === 'string');
                });
                const allLengths = values.every(element => element.length);
                const onlyAllowedAlgorithms = algorithmsAllowed.some(alg => alg === algorithm);

                if (!allFields) {
                    this.emit('error', 'Not all fields are stated');
                } else if (!allStrings || !allLengths) {
                    this.emit('error', 'All fields must be not empty strings');
                } else if (keys.length > 3) {
                    this.emit('error', 'Only name, email and password allowed in payload');
                } else if (!onlyAllowedAlgorithms) {
                    this.emit('error', 'Only hex and base64 algoritms allowed');
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
    constructor(options = {decodedFields: ['password', 'email']}) {
        super(options);
        this.options = options;
        this._readableState.objectMode = true;
        this._writableState.objectMode = true;
    };

    decodeValue(arg, algorithm) {
        if(algorithm === 'hex') {
            let fromCharString = '';

            for (let index = 0; index < arg.length; index += 2) {
                fromCharString += String.fromCharCode(parseInt(arg.substr(index, 2), 16));
            };
    
            return fromCharString;
        } else {
            const fromBtoaString = Buffer.from(arg, 'base64').toString('binary');

            return fromBtoaString;
        };
    };

    _transform(chunk, encoding, done) {
        const newChunk = {};
        const {payload, meta: {algorithm}} = chunk;
        const {decodedFields} = this.options;

        for (const field in payload) {
            if(decodedFields.find(element => element === field)) {
                newChunk[field] = this.decodeValue(payload[field], algorithm);
                
            } else {
                newChunk[field] = payload[field];
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
            algorithm: 'base64',
        },
    },
];

const ui = new Ui(customers);
const decryptor = new Decryptor();
const manager = new AccountManager();

ui.pipe(decryptor).pipe(manager);