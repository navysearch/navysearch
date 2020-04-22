/* eslint-disable no-console */
process.env.VERSION || require('dotenv').config();

const _              = require('lodash');
const chalk          = require('chalk');
const Bluebird       = require('bluebird');
const mongoose       = require('mongoose');
const Message        = require('../web/data/schema/message');
const msglib         = require('../web/lib/message');
const {hasSameAttr} = require('../web/lib/common');
const scrapeItems    = msglib.scrapeMessageData;
const {attemptRequest} = msglib;

const {argv} = require('yargs')
    .default('type', 'NAVADMIN');
const VERBOSE = argv.v;
const {type} = argv;

mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    const year = getCurrentYear();
    const scrapedItems = scrapeItems(type, year);
    const savedItems = Message.find({type, year}).exec();
    Bluebird.all([scrapedItems, savedItems]) // eslint-disable-line promise/catch-or-return
        .then(data => _.differenceWith(_.head(data), _.last(data), hasSameAttr('id')))
        .tap(printStartMessage)
        .map(attemptRequest)
        .then(items => Message.create(items))
        .then(printDoneMessage)
        .finally(() => db.close());
});

function getCurrentYear() {
    const today = new Date();
    // Return current year in YY format
    return Number(String(today.getFullYear()).substring(2));
}

function printStartMessage(items) {
    const type = _.get(_.head(items), 'type');
    const numberOfItems = items.length;
    if (numberOfItems > 0) {
        const justOne = (numberOfItems === 1);
        console.log(chalk.cyan(`Updating ${chalk.bold(numberOfItems)} ${chalk.bold(type)} message${justOne ? '' : 's'}...\n`));
        VERBOSE && console.log(items);
    } else {
        console.log(chalk.green(`No new messages\n`));
    }
}

function printDoneMessage(items) {
    if (Array.isArray(items)) {
        const justOne = (items.length === 1);
        const updatedItemsNumStr = items.slice(0)
            .map(_.property('num'))
            .sort((a, b) => (Number(a) > Number(b)))
            .join(', ');
        const details = ` ~ ${chalk.bold(items.length)} message${justOne ? '' : 's'} added (${updatedItemsNumStr})`;
        process.stdout.write(`${chalk.green.bold('COMPLETE')}${details}\n\n`);
    }
}
