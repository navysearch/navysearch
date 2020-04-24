/**
 * @jest-environment node
 */
import moxios from 'moxios';
import {NPC_DOMAIN, createNpcPageUrl} from '../src/utils/common.js';
import {getItem, getItems, scrapeMessageItems} from '../src/utils/data.js';

const OK = 200;
const NOT_FOUND = 404;
const URL_REGEX = /http[s]?[:]\/\/www[.]public[.]navy[.]mil\/bupers[-]npc\/reference\/messages.*/;
const TEST_MESSAGE = 'INTENTIONALLY LEFT BLANK FOR TESTING';
const fragment = `${NPC_DOMAIN}/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2020/`;
const NPC_HTML = `
    <!DOCTYPE html>
    <html>
        <body>
            <a href="${fragment}NAV20116.txt"/>
            <a href="/someLocalPath"/>
            <a href="https://civilian.com/some.txt"/>
            <a href="http://${NPC_DOMAIN}/someAbsolutePath"/>
            <a href="${fragment}NAV20117.txt"/>
            <a href="http://${NPC_DOMAIN}/instruction.txt"/>
            <a href="http://${NPC_DOMAIN}/policy.pdf"/>
            <a href="http://${NPC_DOMAIN}/military.txt"/>
            <a href="#"/>
            <a href="miltxt"/>
            <a href="javascript:;"/>
            <a href="${fragment}NAV20118.txt"/>
        </body>
    </html>
`;

describe('Data Utilities', () => {
    beforeEach(() => {
        moxios.install();
    });
    afterEach(() => {
        moxios.uninstall();
    });
    test('can get message item data with getItem', async () => {
        moxios.stubRequest(URL_REGEX, {
            status: OK,
            responseText: TEST_MESSAGE
        });
        const url = `${NPC_DOMAIN}/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2020/NAV20119.txt`;
        const options = {
            url,
            code: 'NAV',
            num: '042',
            type: 'NAVADMIN',
            year: '20'
        };
        expect(await getItem(options)).toMatchSnapshot();
        moxios.stubRequest(URL_REGEX, {
            status: NOT_FOUND,
            responseText: TEST_MESSAGE
        });
    });
    test('can get message data with getItem (failed request)', async () => {
        moxios.stubRequest(URL_REGEX, {
            status: NOT_FOUND
        });
        const url = `${NPC_DOMAIN}/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2020/NAV20119.txt`;
        const options = {
            url,
            code: 'NAV',
            num: '042',
            type: 'NAVADMIN',
            year: '20'
        };
        expect(await getItem(options)).toMatchSnapshot();
    });
    test('can scrape message data from NPC', async () => {
        const type = 'NAVADMIN';
        const year = '20';
        moxios.stubRequest(createNpcPageUrl({type, year}), {
            status: OK,
            responseText: NPC_HTML
        });
        const items = await scrapeMessageItems(type, year);
        expect(items).toMatchSnapshot();
    });
    test('can get data for all messages for a given year on NPC', async () => {
        const type = 'NAVADMIN';
        const year = '20';
        moxios.stubRequest(createNpcPageUrl({type, year}), {
            status: OK,
            responseText: NPC_HTML
        });
        moxios.stubRequest(URL_REGEX, {
            status: OK,
            responseText: TEST_MESSAGE
        });
        const items = await getItems(type, [year]);
        expect(items).toMatchSnapshot();
    });
});