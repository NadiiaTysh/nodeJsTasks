const net = require('net');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const { flattenObject, validateObject, convert2Csv } = require('../helpers');

const server = net.createServer();
const PORT = 8080;

server.on('connection', (socket) => {
    socket.setEncoding('utf8');

    socket.on('data', (msg) => {
        const filter = JSON.parse(msg);
        const {filter: filterItem, meta} = filter;

        fs.readFile(path.join('../data', 'users.json'), 'utf8', (err, data) => {
            if (err) throw err;
            const content = JSON.parse(data);

            validateObject(filterItem, meta);
            const flattedFilter = flattenObject(filterItem);

            let filteredContent = content.filter((obj) => {
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

            if (meta.format && meta.format === 'csv' && meta.archive && meta.archive === true) {
                const csv = convert2Csv(filteredContent);
                const archCsv = zlib.createGzip(csv);
                filteredContent = archCsv;
            } else if (meta.format && meta.format === 'csv') {
                const csv = convert2Csv(filteredContent);
                filteredContent = csv;
            };
            if (meta.archive && meta.archive === true) {
                const arch = zlib.createGzip(JSON.stringify(filteredContent));
                filteredContent = arch;
            };
            console.log(filteredContent);
            socket.write(JSON.stringify(filteredContent));
        });
    });

    socket.on('end', () => {
        console.log('Client is disconnected');
    });
});

server.listen(PORT);
