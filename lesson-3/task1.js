const EventEmitter = require('events');

class Bank extends EventEmitter {
    #accounts;

    static _validate = (name, balance) => {
        if (!name) {
            this.emit('error', `User name is not stated`);

            return;
        } else if (typeof name !== 'string') {
            this.emit('error', `User name must be a string`);

            return;
        } else if (!balance) {
            this.emit('error', `User balance is not stated`);

            return;
        } else if (typeof balance !== 'number') {
            this.emit('error', `User balance must be a number`);

            return;
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
    };
    
    getAccounts() {
        return this.#accounts;
    };

    register(acc) {
        this.on("error", () => console.log('Transaction failed'));
        
        this.getAccounts().find(account => {
            if (account.name === acc.name) {
                this.emit('error', `User ${acc.name} already exists`);

                return;
            };
        });

        if (acc.balance <= 0) {
            this.emit('error', `User ${acc.name} cannot have balance ${acc.balance}`);

            return;
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
        this.on("add", (id, value) => {
            if (value <= 0) {
                this.emit('error', `Cannot add ${value} value`);

                return;
            } else if (!value) {
                this.emit('error', `Value is not stated`);

                return; 
            };
    
            const found = this.getAccounts().find(account => account.id === id);
            if (!found) {
                this.emit('error', `Id ${id} is not valid`);

                return;
            };
    
            this.getAccounts().find(account => {
                if (account.id === id) {
                    account.balance = account.balance + value;
                };
            });
        });
    };

    onGet() {
        this.on("get", (id, cb) => {
            const found = this.getAccounts().find(account => account.id === id);
            if (!found) {
                this.emit('error', `Id ${id} is not valid`);

                return;
            };
    
            this.getAccounts().find(account => {
                if (account.id === id) {
                    cb(account.balance);
                };
            });
        });
    };

    onWithdraw() {
        this.on("withdraw", (id, value) => {
            if (value < 0) {
                this.emit('error', 'Cannot withdraw negative value');

                return;
            } else if (!value) {
                this.emit('error', `Value is not stated`);

                return; 
            };
    
            const found = this.getAccounts().find(account => account.id === id);
            if (!found) {
                this.emit('error', `Id ${id} is not valid`);

                return;
            };
    
            this.getAccounts().find(account => {
                if (account.id === id) {
                    const available = account.balance - value;
                    if (available < 0) {
                        this.emit('error', `Only ${account.balance} available to withdraw`);

                        return;
                    } else {
                        account.balance = available;
                    };
                };
            });
        });
    };
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
