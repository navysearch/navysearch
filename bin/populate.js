require('dotenv').config();
const {isNumberLike} = require('../src/utils/index.js');
const {populate} = require('../src/utils/data.js');

const {argv} = require('yargs')
    .default('type', 'NAVADMIN')
    .default('year', '16')
    .array('year');
const {type, year} = argv;
const opts = argv._;

const {APP_ID: id, ADMIN_API_KEY: key} = process.env;
(async () => {
    const years = [...new Set(year.concat(opts).filter(isNumberLike).map(String))];
    const results = await populate(type, years, {id, key});
    console.log(results);
})();