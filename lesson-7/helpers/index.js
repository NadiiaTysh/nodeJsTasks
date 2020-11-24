const flattenObject = (obj) => {
    const flatObject = {};
    for (const field in obj) {

        if (typeof obj[field] !== 'object') {
            flatObject[field] = obj[field];
        } else {
            const res = flattenObject(obj[field]);
            Object.assign(flatObject, res);
        };
    };

    return flatObject;
};

const validateObject = (obj, meta) => {
    const allowedFields = [
        'name',
        'first',
        'last',
        'phone',
        'address',
        'zip',
        'city',
        'country',
        'street',
        'email'
    ];

    const flatObj = flattenObject(obj);
    const keysObj = Object.keys(obj);
    const keysFlatObj = Object.keys(flatObj);
    const allKeys = [...keysObj, ...keysFlatObj];

    const isAllowedKey = allKeys.every(allEl => {
        return allowedFields.some(allowedEl => allowedEl === allEl);
    });

    const isString = keysFlatObj.every(el => typeof flatObj[el] === 'string');

    if (!isAllowedKey) {
        throw new Error('One of filter properties is not allowed');
    };
    if (typeof (obj.name || obj.address) !== 'object') {
        throw new Error('Name and address must be objects');
    };
    if (obj.name && Object.keys(obj.name).length === 0) {
        throw new Error('Name cannot be an empty object');

    } else if (obj.address && Object.keys(obj.address).length === 0) {
        throw new Error('Address cannot be an empty object');
    };
    if (!isString) {
        throw new Error('All fields except name and address must be strings');
    };

    if (meta && meta.format &&
        (typeof meta.format !== 'string' ||
        meta.format !== 'csv')
    ) {
        throw new Error(`${meta.format} must be string 'csv'`);
    };
    if (meta && meta.format && typeof meta.archive !== 'boolean') {
        throw new Error(`Archive type must be 'boolean'`)
    };
};

const replaceData = (data) => {
    const newData = data.map(el => {
        const newEl = {};
        const keys = Object.keys(el);

        keys.forEach(key => {
            const replaced = (typeof el[key] === 'string') ? el[key].replace(/,/g, '!!!!') : el[key];
            newEl[key] = replaced;
        });

        return newEl;
    });

    return newData;
};

const arrayToCsv = (data) => {
    const csv = data.map(row => {
        const values = Object.values(row);

        return values;
    });
    csv.unshift(Object.keys(data[0]));

    return `"${csv.join('"\r\n"').replace(/,/g, '","')}"`;
};

const returnedCsv = (data) => {

    return data.replace('!!!!', ',');
};

const convert2Csv = (array) => {
    const replacedData = replaceData(array);
    const replacedCsv = arrayToCsv(replacedData);
    const csv = returnedCsv(replacedCsv);
    return csv;
};

exports.flattenObject = flattenObject;
exports.validateObject = validateObject;
exports.convert2Csv = convert2Csv;