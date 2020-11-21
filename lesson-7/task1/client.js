const net = require('net');

// const filterItem = {
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

// const filterItem = {
//     name: {
//         first: 'John',
//     },
//     email: '@gmail.com',
// };

// const filterItem = {
//     name: {
//         first: 'John',
//     },
//     phone: '56',
//     address: {
//         city: 'Kyiv',
//     },
// };

const filterItem = {
    name: {
        first: 'ie',
        last: 'ner',
    },
    phone: '26',
    address: {
        zip: '5666',
        city: 'Shannyton',
        country: 'rrat',
        street: 'Wuckert',
    },
    email: 'earlene38'
};

const client = new net.Socket();
client.connect(8080, () => {
    console.log('Connected!');
    client.write(JSON.stringify(filterItem));
});

client.on('data', data => {
    console.log(data);
});

client.on('close', () => {
    console.log('Connection closed!');
});