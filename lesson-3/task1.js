const EventEmitter = require('events');

class Bank extends EventEmitter {
    static _validate = (name, balance) => {
        if (!name) {
            this.emit('error', `User name is not stated`);
        } else if (typeof name !== 'string') {
            this.emit('error', `User name must be a string`);
        } else if (!balance) {
            this.emit('error', `User balance is not stated`);
        } else if (typeof balance !== 'number') {
            this.emit('error', `User balance must be a number`);
        } else {

            return true;
        };
    };

    constructor() {
        super();
        this.accounts = [];
    };

    register(acc) {
        this.on("error", (error) => console.log(error));
        
        this.accounts.find(account => {
            if (account.name === acc.name) {
                this.emit('error', `User ${acc.name} already exists`);
            };
        });

        if (acc.balance <= 0) {
            this.emit('error', `User ${acc.name} cannot have balance ${acc.balance}`);
        };

        if (Bank._validate(acc.name, acc.balance)) {
            const id = Math.random().toString(36).substr(2, 9);
            acc.id = id;
            this.accounts.push(acc);

            return id;
        };
    };
};

const bank = new Bank();

const personId = bank.register({
    name: "Pitter Black",
    balance: 100,
});

bank.on('error', (error) => console.log(error));

bank.on("add", function(id, value) {
    if (value <= 0) {
        this.emit('error', `Cannot add ${value} value`);
    };

    const [filtered] = this.accounts.filter(account => account.id === id);
    if (!filtered) {
        this.emit('error', `Id ${id} is not valid`);
    };

    this.accounts.find(account => {
        if (account.id === id) {
            account.balance = account.balance + value;
        };
    });
});

bank.on("get", function(id, cb) {
    const [filtered] = this.accounts.filter(account => account.id === id);
    if (!filtered) {
        this.emit('error', `Id ${id} is not valid`);
    };

    this.accounts.find(account => {
        if (account.id === id) {
            cb(account.balance);
        };
    });
});

bank.on("withdraw", function(id, value) {
    if (value < 0) {
        this.emit('error', 'Cannot withdraw negative value');
    };

    const [filtered] = this.accounts.filter(account => account.id === id);
    if (!filtered) {
        this.emit('error', `Id ${id} is not valid`);
    };

    this.accounts.find(account => {
        if (account.id === id) {
            const available = account.balance - value;
            if (available < 0) {
                this.emit('error', `Only ${account.balance} available to withdraw`);
            } else {
                account.balance = available;
            };
        };
    });
})

bank.emit("add", personId, 20);
bank.emit("get", personId, (balance) => {
    console.log(`I have ${balance}₴`); // I have 120₴
});
bank.emit("withdraw", personId, 50);
bank.emit("get", personId, (balance) => {
    console.log(`I have ${balance}₴`); // I have 70₴
});
