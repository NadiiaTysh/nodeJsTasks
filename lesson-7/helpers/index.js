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

const validateObject = (obj) => {
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
};

exports.flattenObject = flattenObject;
exports.validateObject = validateObject;