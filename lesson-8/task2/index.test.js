const { Bank } = require('./');
const bank = new Bank();

jest.mock('events');

const customer = {name: 'John', balance: 0};

describe('test Class Bank', () => {
    test('function register returns id', () => {
        expect(bank.register(customer)).toBeTruthy();
    });
    test('error if add duplicates', () => {
        expect(() => bank._checkForDuplicates(customer)).toThrow();
    });
    test('add amount returns balance', () => {
        const id = bank.customers[0].id;
        const amount = 100;

        expect(bank._enroll(id, amount)).toBe(100);
    });
    test('error if trying to add negative amount', () => {
        const id = bank.customers[0].id;
        const amount = -10;

        expect(() => bank._enroll(id, amount)).toThrow();
    });
    test('error if index not found while adding amount', () => {
        const id = 0;
        const amount = 100;

        expect(() => bank._enroll(id, amount)).toThrow();
    });
});