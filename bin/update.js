/* eslint-disable no-console */
require('dotenv').config();
const {update} = require('../src/utils/data.js');

const {argv} = require('yargs').default('type', 'NAVADMIN');
const {type, v: verbose} = argv;

const {APP_ID: id, ADMIN_API_KEY: key} = process.env;
(async () => {
    await update(type, {id, key, verbose});
})();
