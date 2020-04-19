import axios from 'axios';
import moxios from 'moxios';
import {createMessageId, parseMessageUri} from '../src/utils/index.js';

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
});