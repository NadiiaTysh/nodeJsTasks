const EventEmitter = jest.genMockFromModule('events');

EventEmitter.on = (eventName, cb) => {
    if (eventName === 'add') {

        return 'success';
    } else if (eventName === 'error') {

        throw new Error();
    };
};

EventEmitter.emit = (eventName) => {
    if (eventName === 'error') {

        throw new Error('error');
    };
};

module.exports = EventEmitter;