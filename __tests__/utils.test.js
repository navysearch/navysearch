// import axios from 'axios';
// import moxios from 'moxios';
import {
    createMessageId,
    createMessageUrl,
    createNpcPageUrl,
    createYearsString,
    getCurrentYear,
    isNumberLike,
    parseMessageId,
    parseMessageName,
    parseMessageUri,
    partitionByKeyLength
} from '../src/utils/index.js';

describe('Utilities', () => {
    test('can determine if a value is "number like"', () => {
        const shouldBeTrue = [0, 1, 2, 3, '0', '42', '1', '07'].every(isNumberLike);
        const shouldBeFalse = ['a', 'one', false, true, '0l'].every(val => !isNumberLike(val));
        expect(shouldBeTrue).toBe(true);
        expect(shouldBeFalse).toBe(false);
    });
    test('can create message identifier strings', () => {
        const type = 'FOOBAR';
        const year = 20;
        const num = 42;
        expect(createMessageId({type, year, num})).toMatchSnapshot();
    });
    test('can create NPC page URL', () => {
        const type = 'NAVADMIN';
        const year = 17;
        expect(createNpcPageUrl({type, year})).toMatchSnapshot();
    });
    test('can create message URL', () => {
        expect(createMessageUrl({
            num: '116',
            type: 'NAVADMIN',
            year: '20'
        })).toMatchSnapshot();
        expect(createMessageUrl({
            num: '042',
            type: 'NAVADMIN',
            year: '19'
        })).toMatchSnapshot();
        expect(createMessageUrl({
            num: '042',
            type: 'NAVADMIN',
            year: '18'
        })).toMatchSnapshot();
        expect(createMessageUrl({
            num: '042',
            type: 'NAVADMIN',
            year: '17'
        })).toMatchSnapshot();
        expect(createMessageUrl({
            num: '042',
            type: 'ALNAV',
            year: '18'
        })).toMatchSnapshot();
        expect(createMessageUrl({
            num: '042',
            type: 'ALNAV',
            year: '15'
        })).toMatchSnapshot();
        expect(createMessageUrl({
            num: '042',
            type: 'ALNAV',
            year: '10'
        })).toMatchSnapshot();
    });
    test('can parse message ID', () => {
        const value = 'NAVADMIN19042';
        expect(parseMessageId(value)).toMatchSnapshot();
    });
    test('can parse message name', () => {
        expect(parseMessageName('NAV20111')).toMatchSnapshot();
        expect(parseMessageName('nav20092')).toMatchSnapshot();
        expect(parseMessageName('ALN15777')).toMatchSnapshot();
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
    test('can get current year', () => {
        expect(getCurrentYear()).toEqual(20);
    });
    test('can create human readable strings of year values', () => {
        const years = [13, 14, 10, 12, 11]; // eslint-disable-line no-magic-numbers
        expect(createYearsString(years.slice(-1))).toMatchSnapshot();
        expect(createYearsString(years.slice(0, 2))).toMatchSnapshot();
        expect(createYearsString(years)).toMatchSnapshot();
    });
});