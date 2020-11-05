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
    }

    register(acc) {
        this.on("error", () => console.log('Transaction failed:'));

        this.accounts.find((account) => {
            if (account.name === acc.name) {
                this.emit('error', `User ${acc.name} already exists`);
            }
        });

        if (acc.balance <= 0) {
            this.emit(
                'error',
                `User ${acc.name} cannot have balance ${acc.balance}`
            );
        }

        if (Bank._validate(acc.name, acc.balance)) {
            const id = Math.random().toString(36).substr(2, 9);
            acc.id = id;
            this.accounts.push(acc);

            return id;
        };
    };
};

const bank = new Bank();

const personFirstId = bank.register({
    name: 'Pitter Black',
    balance: 100,
});

const personSecondId = bank.register({
    name: 'Oliver White',
    balance: 700,
});

bank.on('error', (error) => console.log(error));

bank.on('add', function (id, value) {
    if (value <= 0) {
        this.emit('error', `Cannot add ${value} value`);
    }

    const [filtered] = this.accounts.filter((account) => account.id === id);
    if (!filtered) {
        this.emit('error', `Id ${id} is not valid`);
    };

    this.accounts.find((account) => {
        if (account.id === id) {
            account.balance = account.balance + value;
        };
    });
});

bank.on('get', function (id, cb) {
    const [filtered] = this.accounts.filter((account) => account.id === id);
    if (!filtered) {
        this.emit('error', `Id ${id} is not valid`);
    };

    this.accounts.find((account) => {
        if (account.id === id) {
            cb(account.balance);
        };
    });
});

bank.on('withdraw', function (id, value) {
    if (value < 0) {
        this.emit('error', 'Cannot withdraw negative value');
    };

    const [filtered] = this.accounts.filter((account) => account.id === id);
    if (!filtered) {
        this.emit('error', `Id ${id} is not valid`);
    };

    this.accounts.find((account) => {
        if (account.id === id) {
            const available = account.balance - value;
            if (available < 0) {
                this.emit(
                    'error',
                    `Only ${account.balance} available to withdraw`
                );
            } else {
                account.balance = available;
            };
        };
    });
});

bank.on('send', function (idFirst, idSecond, value) {
    if (value <= 0) {
        this.emit(
            'error',
            `Only positive value can be sent, you stated ${value}`
        );
    };
    this.accounts.find((account) => {
        const [filtered1] = this.accounts.filter(
            (account) => account.id === idFirst
        );
        if (!filtered1) {
            this.emit('error', `Id ${idFirst} is not valid`);
        } else if (account.id === idFirst) {
            const available = account.balance - value;
            account.balance = available;
        }

        const [filtered2] = this.accounts.filter(
            (account) => account.id === idSecond
        );
        if (!filtered2) {
            this.emit('error', `Id ${idSecond} is not valid`);
        } else if (account.id === idSecond) {
            const available = account.balance + value;
            account.balance = available;
        };
    });
});

// bank.emit("add", personFirstId, 20);
// bank.emit("get", personFirstId, (balance) => {
//     console.log(`I have ${balance}₴`); // I have 120₴
// });
// bank.emit("withdraw", personFirstId, 50);
// bank.emit("get", personFirstId, (balance) => {
//     console.log(`I have ${balance}₴`); // I have 70₴
// });
bank.emit('send', personFirstId, personSecondId, 50);
bank.emit('get', personSecondId, (balance) => {
    console.log(`I have ${balance}₴`); // I have 750₴
});
