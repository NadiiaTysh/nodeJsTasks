const net = require('net');

// const filter = {
//     filter: {
//         name: {
//             first: 'John',
//         },
//         address: {
//             zip: '1234',
//         },
//     },
//     meta: {
//         format: 'csv',
//         archive: true,
//     },
// };

// const filter = {
//     filter: {
//         name: {
//             first: 'ie',
//             last: 'ner',
//         },
//         phone: '26',
//         address: {
//             zip: '5666',
//             city: 'Shannyton',
//             country: 'rrat',
//             street: 'Wuckert',
//         },
//         email: 'earlene38'
//     },
//     meta: {
//         archive: true,
//     },
// };

// const filter = {
//     filter: {
//         name: {
//             first: 'ie',
//             last: 'ttl',
//         },
//         phone: '67',
//         address: {
//             country: 'Cuba',
//             street: '01',
//         },
//     },
//     meta: {
//         format: 'csv',
//     },
// };

const filter = {
    filter: {
        name: {
            first: 'Ali',
        },
        email: 'mail.com',
    },
    meta: {
        format: 'csv',
        // archive: true,
    },
};

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