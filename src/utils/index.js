const {extname} = require('path');
const {takeWhile} = require('lodash');

const NPC_DOMAIN = 'http://www.public.navy.mil';
const MAX_MESSAGE_TEXT_LENGTH = 5000;
const MESSAGE_TYPE_LOOKUP = {NAV: 'NAVADMIN', ALN: 'ALNAV'};
const YEAR_FORMAT_LENGTH = 2;
const isNotNumber = value => isNaN(Number(value));
const isNumberLike = value => !isNaN(Number(value));
const createMessageId = ({type, year, num}) => `${type}${year}${num}`;
const createYearsString = years => years
    .sort()
    .slice(0, -1)
    .map(year => `20${year}`)
    .join(', ')
    .concat(`${years.length > 2 ? ',' : ''}${years.length > 1 ? ' and ' : ''}20${years.slice(-1)}`);
const parseMessageUri = value => {
    const [filename] = value.split('/').reverse();
    const [messageId] = filename.split('.');
    const url = `${NPC_DOMAIN}${value}`;
    const ext = extname(value);
    const code = takeWhile(messageId, isNotNumber).join('').toUpperCase();
    const type = MESSAGE_TYPE_LOOKUP[code];
    const year = messageId.substring(code.length, code.length + YEAR_FORMAT_LENGTH);
    const num = messageId.substring(code.length + YEAR_FORMAT_LENGTH);
    const id = createMessageId({type, year, num});
    return {id, type, code, year, num, ext, url};
};
const partitionByKeyLength = (key, length, value) => {
    const val = String(value[key]);
    const times = Math.ceil(val.length / length);
    return [...'x'.repeat(times)].map((_, index) => {
        const left = index * length;
        const right = left + length;
        return {...value, [key]: val.substring(left, right)};
    });
};

module.exports = {
    MAX_MESSAGE_TEXT_LENGTH,
    NPC_DOMAIN,
    createMessageId,
    createYearsString,
    isNotNumber,
    isNumberLike,
    parseMessageUri,
    partitionByKeyLength
};