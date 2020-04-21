// import axios from 'axios';
// import moxios from 'moxios';
import {
    createMessageId,
    parseMessageUri,
    partitionByKeyLength
} from '../src/utils/index.js';

describe('Utilities', () => {
    test('can create message identifier strings', () => {
        const type = 'FOOBAR';
        const year = 20;
        const num = 42;
        expect(createMessageId({type, year, num})).toMatchSnapshot();
    });
    test('can parse full message URI', () => {
        const uri = 'https://www.public.navy.mil/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2020/NAV20111.txt';
        const parsed = parseMessageUri(uri);
        expect(parsed).toMatchSnapshot();
    });
    test('can parse fragment of message URI', () => {
        const uri = '/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2020/NAV20080.txt';
        const parsed = parseMessageUri(uri);
        expect(parsed).toMatchSnapshot();
    });
    test('can parse abnormal message URI', () => {
        const uri = 'https://www.public.navy.mil/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2020/nav20092.txt';
        const parsed = parseMessageUri(uri);
        expect(parsed).toMatchSnapshot();
    });
    test('can split objects into smaller objects based on length of a certain key', () => {
        const MAX_LENGTH = 5;
        const a = {
            name: 'a',
            text: '123456789'
        };
        const b = {
            name: 'b',
            text: '12345'
        };
        const c = {
            name: 'c',
            text: '01234567890123456789'
        };
        const chunk = value => partitionByKeyLength('text', MAX_LENGTH, value);
        expect(chunk(a)).toMatchSnapshot();
        expect(chunk(b)).toMatchSnapshot();
        expect(chunk(c)).toMatchSnapshot();
        expect([a, b, c].flatMap(chunk)).toMatchSnapshot();
    });
});