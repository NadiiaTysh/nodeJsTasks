const { Readable, Transform, Writable } = require('stream');
const EventEmitter = require('events');

class DB extends EventEmitter {
    #data;
    constructor() {
        super();
        this.#data = [];
    };

    getRecords() {
        return this.#data;
    };
};

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
        const {encodedFields, inMeta} = this.options;

        for (const field in chunk) {
            if(field === inMeta) {
                newChunk.meta[field] = chunk[field];

            } else if(encodedFields.find(element => element === field)) {
                newChunk.payload[field] = this.encodeHex(chunk[field]);
                
            } else {
                newChunk.payload[field] = chunk[field];
            };
        };
        this.push(newChunk);
        done();
    };
};

class Logger extends Transform {
    constructor(options = {}) {
        super(options);
        this._readableState.objectMode = true;
        this._writableState.objectMode = true;
    }

    _transform(chunk, encoding, done) {
        const {meta: {source}} = chunk;
        const log = {
            meta: source,
            payload: chunk.payload,
            created: new Date(),
        };

        db.on('data', () => console.log(db.getRecords()));
        db.emit('data', db.getRecords().push(log));

        this.push(chunk);
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
const logger = new Logger();
const manager = new AccountManager();
const db = new DB();

ui.pipe(guardian).pipe(logger).pipe(manager);