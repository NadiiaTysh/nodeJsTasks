const zlib = require('zlib');

const validation = (options) => {
    const allowedField = 'algorithm';
    const allowedValues = ['gzip', 'deflate'];
    const actualFields = Object.keys(options);
    const isNotOnlyKey = actualFields[0] !== allowedField || actualFields.length !== 1;
    const isNotValidValueType = typeof options[allowedField] !== 'string' ||
        options[allowedField].length === 0;
    const isNotValidValues = !allowedValues.some(el => el === options[allowedField]);

    if (isNotOnlyKey) {
        throw new Error(`Only one field ${allowedField} is allowed`);
    } else if (isNotValidValueType) {
        throw new Error(`Field value "${options[allowedField]}" is not valid`);
    } else if (isNotValidValues) {
        throw new Error(`Only ${allowedValues} values are valid`);
    };
};

const packAlgorithm = ({ algorithm }) => {
    let arch;
    if (algorithm === 'deflate') {
        arch = zlib.createDeflate();
    } else if (algorithm === 'gzip') {
        arch = zlib.createGzip();
    }
    console.log(`Algorithm ${algorithm} utilized`);

    return arch;
};

const unpackAlgorithm = ({ algorithm }) => {
    let unarch;
    if (algorithm === 'deflate') {
        unarch = zlib.createInflate();
    } else if (algorithm === 'gzip') {
        unarch = zlib.createGunzip();
    }

    return unarch;
};

exports.validation = validation;
exports.packAlgorithm = packAlgorithm;
exports.unpackAlgorithm = unpackAlgorithm;
