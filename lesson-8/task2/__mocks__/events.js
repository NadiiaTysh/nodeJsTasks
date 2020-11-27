const EventEmitterOriginal = jest.genMockFromModule('events');

class EventEmitter extends EventEmitterOriginal {
    constructor() {
        super();
        this._events = {};
    };
    on(name, listener) {
        if (!this._events[name]) {
            this._events[name] = [];
        };

        this._events[name].push(listener);
    };

    emit(name, data) {
        const fireCallbacks = (callback) => {
            callback(data);
        };

        this._events[name].forEach(fireCallbacks);
    };
};

module.exports = EventEmitter;