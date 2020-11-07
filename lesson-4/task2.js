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
        this.init();
        Ui._validate(data);
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
        console.log(chunk.payload);
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