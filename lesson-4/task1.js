const { Readable, Transform, Writable } = require('stream');

class Ui extends Readable {
    
    static _validate(data) {
        data.forEach(obj => {
            const keys = Object.keys(obj);
            const values = Object.keys(obj);

            const fieldsRequired = [ 'name', 'email', 'password' ];
            const success = keys.every((val) => fieldsRequired.includes(val));
            if (!success) {
                this.emit('error', 'Not all fields are stated');
            } else if (values.forEach(element => typeof element !== 'string')) {
                this.emit('error', 'All fields must be strings');
            } else if (keys.length > 3) {
                this.emit('error', 'Only \'name\', \'email\' and \'password\' allowed');
            };
        });

        return true;
    }

    constructor(data = [], options = {}) {
        super(options);
        this._data = data;
        this._readableState.objectMode = true;
        this.init();
    };
    
    init() {
        this.on('data', (chunk) => {
            chunk.source = this.constructor.name.toLowerCase();
        });
        this.on('error', error => console.log(error.message));
    };

    _read() {
        const data = Ui._validate(this._data) && this._data.shift();

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