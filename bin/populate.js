require('dotenv').config();
const {isNumberLike} = require('../src/utils/index.js');
const {getItems, saveItems} = require('../src/utils/data.js');

const {argv} = require('yargs')
    .default('type', 'NAVADMIN')
    .default('year', '16')
    .array('year');
const {type, year} = argv;
const opts = argv._;

const {APP_ID, ADMIN_API_KEY} = process.env;
const options = {
    id: APP_ID,
    key: ADMIN_API_KEY,
    name: 'message'
};

(async () => {
    const years = [...new Set(year.concat(opts).filter(isNumberLike).map(String))];
    const items = await getItems(type, years);
    const foo = items.filter(({text}) => text.length < 7000);
    const results = await saveItems(foo, options);
})();