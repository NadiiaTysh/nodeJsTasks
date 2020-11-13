const { Readable, Transform, Writable } = require('stream');
const crypto = require('crypto');

const algorithm = 'aes192';
const password = '1qaZxsw2@3edcVfr4';
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQC1mL2M1GYT2rUGNNQHVJdF7TyKLYPqgvv9VfOdgPDgm8E8edzJ
kip1ajfymrODg0m7U95sUOw1s1r/WZzLdIPHgDxbLHrDbQEWVgdTM2okje7pPOax
7PguhGHd2y2WEXGBUNXG0jQCyfq83nDl3YwJuPKNpgEPzzxibg8j3suKaQIDAQAB
AoGAA9LniuOeEqT0UuEh5dWeKdbJA4/Zy0Je1ALPUm24pMIi24clYwk046wM6Yrg
ZNCK6OrnMBi0IJ1aOS5F4vLdI3k2tcKmtdHlVHQl3YZZLUBubJF8HPZHyhYlargY
gWYMC8Wi2Z63fllb+A5yVgJZigEowkYzQSg1LS09vkMJL5ECQQDcM3DzC3qvp3AV
6p5uGKFI1nug4Y8XQvQZHRRoZL0UuRnCJZR/4OpI2rjWNXwsYibf7V0PZ3FXPajZ
gkVtnpbLAkEA0x6fxNlOkD6AIgAy4EW26eLRDuh8LSDBG/a2nfdRduMa0PwFglmT
heOmFqD8fJA4bCvhYl/cKCo/cGQmRj2JGwJBAJNmo+8t+fxnWvJw0YjlV+GIIc25
760kln3RJ34SITgkCAgcW+GWT35hW2WY+/xB37/6BldvaUF69vJS7+LHTC0CQCEP
n6d8/E+cagZpD46NfEp+KYzzHVcX1QXjCdANBeXfRLjLbrVt/6ss7jqG9WMwVpWh
/YahSmHD0/FuzYucYVcCQQDOL5EooCObADlMZwW6gkfRUhg8qNpLIKjZqdR2TOef
3MliwMWCHG2zzgsz8h+H/sQ9tWT+RCq8xA0RCJTcc/yk
-----END RSA PRIVATE KEY-----`;
const publicKey = `-----BEGIN CERTIFICATE-----
MIICATCCAWoCCQCuCSyS6Uak9jANBgkqhkiG9w0BAQsFADBFMQswCQYDVQQGEwJB
VTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50ZXJuZXQgV2lkZ2l0
cyBQdHkgTHRkMB4XDTE5MDIwNTA5NDkxOFoXDTE5MDMwNzA5NDkxOFowRTELMAkG
A1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoMGEludGVybmV0
IFdpZGdpdHMgUHR5IEx0ZDCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAtZi9
jNRmE9q1BjTUB1SXRe08ii2D6oL7/VXznYDw4JvBPHncyZIqdWo38pqzg4NJu1Pe
bFDsNbNa/1mcy3SDx4A8Wyx6w20BFlYHUzNqJI3u6Tzmsez4LoRh3dstlhFxgVDV
xtI0Asn6vN5w5d2MCbjyjaYBD888Ym4PI97LimkCAwEAATANBgkqhkiG9w0BAQsF
AAOBgQBoFLPxmm3TL+PBBcXoOGaRbbvGelwXsXgEZCdr+RxMchmbgcKcjc+2+VGa
eiiF3RMGjmz2KtYwg0uv2R331EqBzvmgRnoNH/1tnWmJPylcF2eCzG+NSc4kWNRN
6ZrCfAkaih1l+niEkWeWMTcRns6hTwJ+yrm/ijs0u8nL1XhAkg==
-----END CERTIFICATE-----`;

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

                const newChunk = {meta: {}, payload: {}, iv};
                const {encodedFields, inMeta} = this.options;
                
                for (const field in chunk) {
                    if(field === inMeta) {
                        newChunk.meta[field] = chunk[field];

                    } else if(encodedFields.find(element => element === field)) {

                        const cipher = crypto.createCipheriv(algorithm, key, iv);
        
                        let encrypted = '';
                        cipher.setEncoding('hex');
        
                        cipher.on('data', (piece) => {
                            encrypted += piece;
                            newChunk.payload[field] = encrypted;
                        });
                        cipher.write(chunk[field]);
                        cipher.end();
                    } else {
                        newChunk.payload[field] = chunk[field];
                    };
                    const sign = crypto.createSign('SHA256');
                    sign.write(JSON.stringify(newChunk.payload));
                    sign.end();
                    const signature = sign.sign(privateKey, 'hex');
                    newChunk.meta.signature = signature;
                };
                this.push(newChunk);
                done();
            });
        });
    };
};

class AccountManager extends Writable {
    #dataDb;
    constructor(options = {encodedFields: ['password', 'email']}) {
        super(options);
        this.options = options;
        this.#dataDb = []; 
        this._writableState.objectMode = true;
    };

    getDataDB() {
        return this.#dataDb;
    };

    _write(chunk, encoding, done) {
        const dataDB = {
            meta: chunk.meta,
            payload: chunk.payload,
        };
        this.getDataDB().push(dataDB);
        console.log(this.getDataDB());

        crypto.scrypt(password, 'salt', 24, (err, key) => {
            if (err) throw err;

            const {encodedFields} = this.options;
            const {payload, iv} = chunk;

            for (const field in payload) {
                if(encodedFields.find(element => element === field)) {

                    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
                    let decrypted = '';
                    decipher.on('readable', () => {
                        while (
                            null !== (chunk = decipher.read())
                        ) {
                            decrypted += chunk.toString(
                                'utf8'
                            );
                        }
                    });
                    const encrypted = payload[field];
                    decipher.write(encrypted, 'hex');
                    decipher.end();
                    console.log('decrypted:', decrypted);
                };
            };
            done();
        });

        const verify = crypto.createVerify('SHA256');
        verify.write(JSON.stringify(chunk.payload));
        verify.end();
        console.log('verified signed', verify.verify(publicKey, chunk.meta.signature, 'hex'));
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