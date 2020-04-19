import {createMessageId} from '../src/utils.js';

describe('Utilities', () => {
    test('can create message identifier strings', () => {
        const type = 'FOOBAR';
        const year = 20;
        const num = 42;
        expect(createMessageId({type, year, num})).toMatchSnapshot();
    });
});