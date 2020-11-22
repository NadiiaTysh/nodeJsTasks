const fs = require('fs');
const { validation, packAlgorithm, unpackAlgorithm } = require('./helpers');

const options = {
    algorithm: 'deflate',
};

class Archiver {
    constructor(input, output, outputUnpacked, options) {
        this.input = input;
        this.output = output;
        this.outputUnpacked = outputUnpacked;
        this.options = options;
    }

    pack() {
        validation(this.options, this.input);
        const read = fs.createReadStream(this.input);
        const arch = packAlgorithm(this.options);
        const write = fs.createWriteStream(this.output);

        read.pipe(arch).pipe(write);
    }

    unpack() {
        validation(this.options, this.output);
        const read = fs.createReadStream(this.output);
        const unarch = unpackAlgorithm(this.options);
        const write = fs.createWriteStream(this.outputUnpacked);

        read.pipe(unarch).pipe(write);
    }
}

const archiver = new Archiver(
    './data/comments.csv',
    './data/comments.csv.gz',
    './data/comments2.csv',
    options
);
archiver.pack();
setTimeout(() => archiver.unpack(), 1000);
