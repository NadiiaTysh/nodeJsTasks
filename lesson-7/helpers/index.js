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

exports.flattenObject = flattenObject;