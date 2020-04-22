const {extname} = require('path');
const {invertObj, takeWhile} = require('ramda');

const NPC_DOMAIN = 'http://www.public.navy.mil';
const MAX_MESSAGE_TEXT_LENGTH = 5000;
const MESSAGE_TYPE_LOOKUP = {NAV: 'NAVADMIN', ALN: 'ALNAV'};
const YEAR_FORMAT_LENGTH = 2;
const createMessageId = ({type, year, num}) => `${type}${year}${num}`;
const createYearsString = years => years
    .sort()
    .slice(0, -1)
    .map(year => `20${year}`)
    .join(', ')
    .concat(`${years.length > 2 ? ',' : ''}${years.length > 1 ? ' and ' : ''}20${years.slice(-1)}`);
const getCurrentYear = () => Number(String((new Date()).getFullYear()).substring(2));
const isNotNumber = value => isNaN(Number(value));
const isNumberLike = value => !isNaN(Number(value));
const parseMessageId = value => {
    const code = takeWhile(isNotNumber, [...value]).join('').toUpperCase();
    const {length} = code;
    const lookup = length === 3 ? MESSAGE_TYPE_LOOKUP : invertObj(MESSAGE_TYPE_LOOKUP);
    const type = lookup[code];
    const year = value.substring(length, length + YEAR_FORMAT_LENGTH);
    const num = value.substring(length + YEAR_FORMAT_LENGTH);
    const id = createMessageId({type, year, num});
    return {code, id, num, type, year};
};
const parseMessageUri = value => {
    const [filename] = value.split('/').reverse();
    const [messageId] = filename.split('.');
    const url = `${NPC_DOMAIN}${value}`;
    const ext = extname(value);
    return {...parseMessageId(messageId), ext, url};
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
    getCurrentYear,
    isNotNumber,
    isNumberLike,
    parseMessageId,
    parseMessageUri,
    partitionByKeyLength
};