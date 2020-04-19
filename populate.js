const {extname} = require('path');
const {promisify} = require('util');
const {takeWhile} = require('lodash');
const chalk = require('chalk');
const ora = require('ora');
const Xray = require('x-ray');
const axios = require('axios').default;
const {bold, cyan, green} = chalk;

const {argv} = require('yargs')
    .default('type', 'NAVADMIN')
    .default('year', '16')
    .array('year');
const {type} = argv;
const {year} = argv;
const opts = argv._;

const NPC_DOMAIN = 'http://www.public.navy.mil';
const YEAR_FORMAT_LENGTH = 2;
const MSG_TYPE_LOOKUP = {
    NAV: 'NAVADMIN',
    ALN: 'ALNAV'
};
const isNotNumber = value => isNaN(Number(value));
const isNumberLike = value => !isNaN(Number(value));
const createMessageId = ({type, year, num}) => `${type}${year}${num}`;
const parseMessageUri = value => {
    const [filename] = value.split('/').reverse();
    const [messageId] = filename.split('.');
    const url = `${NPC_DOMAIN}${value}`;
    const ext = extname(value);
    const code = takeWhile(messageId, isNotNumber).join('');
    const type = MSG_TYPE_LOOKUP[code];
    const year = messageId.substring(code.length, code.length + YEAR_FORMAT_LENGTH);
    const num = messageId.substring(code.length + YEAR_FORMAT_LENGTH);
    const id = createMessageId({type, year, num});
    return {id, type, code, year, num, ext, url};
};
const scrapeItems = async (type, year, domain = NPC_DOMAIN) => {
    const format = year => (String(year).length === 'YYYY'.length) ? Number(year.substr(-1 * YEAR_FORMAT_LENGTH)) : year;
    const url = `${domain}/bupers-npc/reference/messages/${type}S/Pages/${type}20${format(year)}.aspx`;
    return (await promisify((new Xray())(url, 'a', [{href: '@href'}]))(url))
        .map(val => val.href)
        .filter(str => /[.]txt$/.test(str))
        .map(str => str.split('mil')[1])
        .map(parseMessageUri);
};
const getItem = ({code, num, type, year, url}) => {
    const attributes = {code, num, type, url, year};
    const id = createMessageId(attributes);
    return axios.get(url)
        .then(({data: text}) => ({...attributes, id, text}))
        .catch(() => ({...attributes, id}));
};
const getItems = async type => {
    const startMessage = items => {
        const [{type, year}] = items;
        return cyan(`Started fetching 20${bold(year)} ${bold(type)} data (${items.length} items)\n\n`);
    };
    const doneMessage = items => {
        const completed = items.filter(({text}) => typeof text !== 'undefined');
        return `${green('COMPLETE')} ~ ${bold(completed.length)} of ${bold(items.length)} items processed\n\n`;
    };
    const get = data => Promise.all(data.map(getItem));
    const years = [...new Set(year.concat(opts).filter(isNumberLike).map(String))];
    const items = (await Promise.all(years.map(year => scrapeItems(type, year)))).flat(Infinity);
    const spinner = ora(startMessage(items)).start();
    const data = await get(items);
    const retry = async data => {
        const failed = data.filter(({text}) => typeof text === 'undefined');
        spinner.text = cyan(`Trying to fetch data for ${bold(failed.length)} of ${items.length} items`);
        return (failed.length !== 0) ? get(failed) : Promise.resolve([]);
    };
    const secondAttempt = await retry(data);
    const thirdAttempt = await retry(secondAttempt);
    const fourthAttempt = await retry(thirdAttempt);
    const results = [
        ...data,
        ...secondAttempt,
        ...thirdAttempt,
        ...fourthAttempt
    ].filter(({text}) => typeof text !== 'undefined');
    spinner.succeed(doneMessage(results));
    return results;
};
(async () => {
    const items = await getItems(type);
    // console.log(await scrapeItems('NAVADMIN', 20));
    // const uri = '/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2020/NAV20080.txt';
    // console.log(parseMessageUri(uri));
})();