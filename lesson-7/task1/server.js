const net = require('net');
const fs = require('fs');
const path = require('path');

const { flattenObject } = require('../helpers');

const server = net.createServer();
const PORT = 8080;

server.on('connection', (socket) => {
    socket.setEncoding('utf8');

    socket.on('data', (msg) => {
        const filterItem = JSON.parse(msg);

        fs.readFile(path.join('../data', 'users.json'), 'utf8', (err, data) => {
            if (err) throw err;
            const content = JSON.parse(data);

            const flattedFilter = flattenObject(filterItem);

            const filteredContent = content.filter((obj) => {
                const flattedObj = flattenObject(obj);
                let isIncluded;
                for (const filterField in flattedFilter) {
                    isIncluded = flattedObj[filterField].includes(flattedFilter[filterField]);
                };
                
                return isIncluded;
            });
            console.log(filteredContent);
        });
    });

    socket.on('end', () => {
        console.log('Client is disconnected');
    });
});

server.listen(PORT);
