const EventEmitter = require('events');

class Bank extends EventEmitter {
    constructor() {
        super();
        this.accounts = [];
    };

    register(acc) {
        const id = Math.random().toString(36).substr(2, 9);
        this.accounts.push(acc);

        return id;
    }
};

const bank = new Bank();

const personId = bank.register({
    name: "Pitter Black",
    balance: 100,
});
bank.emit("add", personId, 20);
bank.emit("get", personId, (balance) => {
    console.log(`I have ${balance}₴`); // I have 120₴
});
bank.emit("withdraw", personId, 50);
bank.emit("get", personId, (balance) => {
    console.log(`I have ${balance}₴`); // I have 70₴
});
