const crypto = require('crypto');

const codify = (algorithm, key, iv, chunk, newChunk, field) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = '';
    cipher.setEncoding('hex');

    cipher.on('data', (piece) => {
        encrypted += piece;
        newChunk.payload[field] = encrypted;
    });
    cipher.write(chunk[field]);
    cipher.end();
};

const decodify = (algorithm, key, iv, chunk, payload, field) => {
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

exports.encode = codify;
exports.decode = decodify;