const net = require('net');
const fs = require('fs');
const path = require('path');

const { flattenObject, validateObject } = require('../helpers');

const server = net.createServer();
const PORT = 8080;

server.on('connection', (socket) => {
    socket.setEncoding('utf8');

    socket.on('data', (msg) => {
        const filterItem = JSON.parse(msg);

        fs.readFile(path.join('../data', 'users.json'), 'utf8', (err, data) => {
            if (err) throw err;
            const content = JSON.parse(data);

            validateObject(filterItem);
            const flattedFilter = flattenObject(filterItem);

            const filteredContent = content.filter((obj) => {
                const flattedObj = flattenObject(obj);
                let includedArray = [];

                for (const filterField in flattedFilter) {
                    const isIncluded = flattedObj[filterField]
                        .toLowerCase()
                        .includes(flattedFilter[filterField].toLowerCase());

                    includedArray.push(isIncluded);
                };
                let isMatch = includedArray.every(el => el === true); 
                
                return isMatch;
            });

            socket.write(JSON.stringify(filteredContent));
        });
    });

    socket.on('end', () => {
        console.log('Client is disconnected');
    });
});

server.listen(PORT);
