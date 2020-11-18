const fs = require('fs');
const zlib = require('zlib');

class Archiver {
    constructor(input, output, outputUnpacked) {
        this.input = input;
        this.output = output;
        this.outputUnpacked = outputUnpacked;
    };

    pack() {
        const read = fs.createReadStream(this.input);
        const arch = zlib.createGzip();
        const write = fs.createWriteStream(this.output);

        read.pipe(arch).pipe(write);
    };

    unpack() {
        const read = fs.createReadStream(this.output);
        const unarch = zlib.createGunzip();
        const write = fs.createWriteStream(this.outputUnpacked);

        read.pipe(unarch).pipe(write);
    }
}

const archiver = new Archiver('./data/comments.csv', './data/comments.csv.gz', './data/comments2.csv');
archiver.pack();
setTimeout(() => archiver.unpack(), 1000);