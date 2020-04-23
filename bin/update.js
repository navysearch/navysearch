/* eslint-disable no-console */
require('dotenv').config();
const {difference} = require('ramda');
const chalk = require('chalk');
const {getCurrentYear, parseMessageId} = require('../src/utils/index.js');
const {getItem, getItems, getSavedItems, saveItems} = require('../src/utils/data.js');

const {argv} = require('yargs')
    .default('type', 'NAVADMIN');
const VERBOSE = argv.v;
const {type} = argv;

const {APP_ID, ADMIN_API_KEY} = process.env;
const options = {
    id: APP_ID,
    key: ADMIN_API_KEY,
    name: 'message'
};
(async () => {
    const [scraped, saved] = await Promise.all([
        getItems(type, [getCurrentYear()]),
        getSavedItems(options)
    ]);
    const left = scraped.map(({id}) => id);
    const right = ([...(new Set(saved.map(({id}) => id)))]);
    const updated = difference(left, right).sort().map(parseMessageId);
    const items = await Promise.all(updated.map(getItem));
    console.log(items);
})();
