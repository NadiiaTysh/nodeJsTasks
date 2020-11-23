const net = require('net');

// const filter = {
//     name: {
//         first: 'John',
//         last: 'd',
//     },
//     phone: '56',
//     address: {
//         zip: '1234',
//         city: 'Kyiv',
//         country: 'ukr',
//         street: 'so',
//     },
//     email: '@gmail.com'
// };

// const filter = {
//     name: {
//         first: 'John',
//     },
//     email: '@gmail.com',
// };

// const filter = {
//     name: {
//         first: 'John',
//     },
//     phone: '56',
//     address: {
//         city: 'Kyiv',
//     },
// };

// const filter = {
//     name: {
//         first: 'ie',
//         last: 'ner',
//     },
//     phone: '26',
//     address: {
//         zip: '5666',
//         city: 'Shannyton',
//         country: 'rrat',
//         street: 'Wuckert',
//     },
//     email: 'earlene38'
// };

const filter = {
    name: {
        first: 'ie',
        last: 'ttl',
    },
    phone: '67',
    address: {
        country: 'Cuba',
        street: '01',
    },
};

// const filter = {
//     name: {
//         first: 'Ali',
//     },
//     email: 'mail.com',
// };

const client = new net.Socket();

client.connect(8080, () => {
    console.log('Connected!');
    client.write(JSON.stringify(filter));
});

client.on('data', data => {
    console.log(JSON.parse(data));
});

client.on('close', () => {
    console.log('Connection closed!');
});