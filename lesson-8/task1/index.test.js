const { validate, validateFields } = require('./');

const data = {
    payload: {
        name: 'John',
        email: 'john@johnson.com',
        password: 'ABC'
    },
};

describe('function validate', () => {
    test('validation is successful', () => {
        expect(validate({data})).toBeUndefined();
    });
    test('error invokes if typeof payload is not an object', () => {
        const data = {
            payload: 0,
        };
        expect(() => validate({data})).toThrow();
    });
    test('error invokes if payload does not have a property name', () => {
        const data = {
            payload: {
                email: 'john@johnson.com',
                password: 'ABC'
            },
        };
        expect(() => validate({data})).toThrow();
    });
    test('error invokes if payload.name is empty', () => {
        const data = {
            payload: {
                name: '',
                email: 'john@johnson.com',
                password: 'ABC'
            },
        };
        expect(() => validate({data})).toThrow();
    });
    test('error invokes if payload.name is not a string', () => {
        const data = {
            payload: {
                name: [],
                email: 'john@johnson.com',
                password: 'ABC'
            },
        };
        expect(() => validate({data})).toThrow();
    });
    test('error invokes if payload does not have a property email', () => {
        const data = {
            payload: {
                name: 'John',
                password: 'ABC'
            },
        };
        expect(() => validate({data})).toThrow();
    });
    test('error invokes if payload.email is empty', () => {
        const data = {
            payload: {
                name: 'John',
                email: '',
                password: 'ABC'
            },
        };
        expect(() => validate({data})).toThrow();
    });
    test('error invokes if payload.email is not a string', () => {
        const data = {
            payload: {
                name: 'John',
                email: [],
                password: 'ABC'
            },
        };
        expect(() => validate({data})).toThrow();
    });
    test('error invokes if payload does not have a property password', () => {
        const data = {
            payload: {
                name: 'John',
                email: 'john@johnson.com',
            },
        };
        expect(() => validate({data})).toThrow();
    });
    test('error invokes if payload.password is empty', () => {
        const data = {
            payload: {
                name: 'John',
                email: 'john@johnson.com',
                password: ''
            },
        };
        expect(() => validate({data})).toThrow();
    });
    test('error invokes if payload.password is not a string', () => {
        const data = {
            payload: {
                name: 'John',
                email: 'john@johnson.com',
                password: []
            },
        };
        expect(() => validate({data})).toThrow();
    });
});

describe('function validateFields', () => {
    test('validation is successful', () => {
        expect(validateFields({data})).toBeUndefined();
    });
    test('error invokes if data contains not allowed shallow field', () => {
        const data = {
            payload: {},
            meta1: 'John'
        };
        expect(() => validateFields({data})).toThrow();
    });
    test('error invokes if data contains not allowed deep field', () => {
        const data = {
            payload: {
                name1: 'John',
            },
        };
        expect(() => validateFields({data})).toThrow();
    });
});