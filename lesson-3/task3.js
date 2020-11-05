const EventEmitter = require('events');

class Bank extends EventEmitter {
    #accounts;
    
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
        this.#accounts = [];
        this.onError();
        this.onAdd();
        this.onGet();
        this.onWithdraw();
        this.onSend();
        this.onChangeLimit();
    };

    getAccounts() {
        return this.#accounts;
    };

    register(acc) {
        this.on("error", () => console.log('Transaction failed:'));

        this.getAccounts().find((account) => {
            if (account.name === acc.name) {
                this.emit('error', `User ${acc.name} already exists`);
            }
        });

        if (acc.balance <= 0) {
            this.emit(
                'error',
                `User ${acc.name} cannot have balance ${acc.balance}`
            );
        };

        if (Bank._validate(acc.name, acc.balance)) {
            const id = Math.random().toString(36).substr(2, 9);
            acc.id = id;
            this.getAccounts().push(acc);

            return id;
        };
    };

    onError() {
        this.on('error', (error) => console.log(error));
    };

    onAdd() {
        this.on('add', function (id, value) {
            if (value <= 0) {
                this.emit('error', `Cannot add ${value} value`);
            }
    
            const [filtered] = this.getAccounts().filter(account => account.id === id);
            if (!filtered) {
                this.emit('error', `Id ${id} is not valid`);
            };
    
            this.getAccounts().find((account) => {
                if (account.id === id) {
                    account.balance = account.balance + value;
                };
            });
        });
    };

    onGet() {
        this.on('get', function (id, cb) {
            const [filtered] = this.getAccounts().filter(account => account.id === id);
            if (!filtered) {
                this.emit('error', `Id ${id} is not valid`);
            };
    
            this.getAccounts().find((account) => {
                if (account.id === id) {
                    cb(account.balance);
                };
            });
        });
    };

    onWithdraw() {
        this.on('withdraw', function (id, value) {
            if (value < 0) {
                this.emit('error', 'Cannot withdraw negative value');
            };
    
            const [filtered] = this.getAccounts().filter(account => account.id === id);
            if (!filtered) {
                this.emit('error', `Id ${id} is not valid`);
            };
    
            this.getAccounts().find((account) => {
                if (account.id === id) {
                    const available = account.balance - value;
                    if (!account.limit(value, account.balance, available)) {
                        this.emit('error', 'You exceeded your limit');
                    } else if (available < 0) {
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
    };

    onSend() {
        this.on('send', function (idFirst, idSecond, value) {
            if (value <= 0) {
                this.emit(
                    'error',
                    `Only positive value can be sent, you stated ${value}`
                );
            };
            this.getAccounts().find((account) => {
                const [filtered1] = this.getAccounts().filter(
                    (account) => account.id === idFirst
                );
                if (!filtered1) {
                    this.emit('error', `Id ${idFirst} is not valid`);
                } else if (!account.limit(value, account.balance, available)) {
                    this.emit('error', 'You exceeded your limit');
                } else if (account.id === idFirst) {
                    const available = account.balance - value;
                    account.balance = available;
                }
    
                const [filtered2] = this.getAccounts().filter(account => account.id === idSecond);
                if (!filtered2) {
                    this.emit('error', `Id ${idSecond} is not valid`);
                } else if (account.id === idSecond) {
                    const available = account.balance + value;
                    account.balance = available;
                };
            });
        });
    };

    onChangeLimit() {
        this.on('changeLimit', function(id, cb) {
            this.getAccounts().find((account) => {
                if (account.id === id) {
                    account.limit = cb;
                };
            });
        });
    };
};

const bank = new Bank();

const personId = bank.register({
    name: 'Oliver White',
    balance: 700,
    limit: (amount) => amount < 10,
});

// bank.emit("add", personFirstId, 20);
// bank.emit("get", personFirstId, (balance) => {
//     console.log(`I have ${balance}₴`); // I have 120₴
// });
// bank.emit("withdraw", personFirstId, 50);
// bank.emit("get", personFirstId, (balance) => {
//     console.log(`I have ${balance}₴`); // I have 70₴
// });
// bank.emit('send', personFirstId, personSecondId, 50);
// bank.emit('get', personSecondId, (balance) => {
//     console.log(`I have ${balance}₴`); // I have 750₴
// });

bank.emit('withdraw', personId, 5);
bank.emit('get', personId, (amount) => {
    console.log(`I have ${amount}₴`); // I have 695₴
});

// // Вариант 1
bank.emit('changeLimit', personId, (amount, currentBalance, updatedBalance) => {
    return amount < 100 && updatedBalance > 700;
});
bank.emit('withdraw', personId, 5); // Error

// // Вариант 2
bank.emit('changeLimit', personId, (amount, currentBalance, updatedBalance) => {
    return amount < 100 && updatedBalance > 700 && currentBalance > 800;
});

// // Вариант 3
bank.emit('changeLimit', personId, (amount, currentBalance) => {
    return currentBalance > 800;
});

// // Вариант 4
bank.emit('changeLimit', personId, (amount, currentBalance, updatedBalance) => {
    return updatedBalance > 900;
});