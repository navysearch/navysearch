const {isNumberLike} = require('../src/utils/index.js');
const {getItems} = require('../src/utils/data.js');

const {argv} = require('yargs')
    .default('type', 'NAVADMIN')
    .default('year', '16')
    .array('year');
const {type} = argv;
const {year} = argv;
const opts = argv._;

(async () => {
    const years = [...new Set(year.concat(opts).filter(isNumberLike).map(String))];
    const items = await getItems(type, years);
    // console.log(await scrapeItems('NAVADMIN', 20));
    // const uri = '/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2020/NAV20080.txt';
    // console.log(parseMessageUri(uri));
})();