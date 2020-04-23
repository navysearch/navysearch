const {extname} = require('path');
const {invertObj, takeWhile} = require('ramda');

const NPC_DOMAIN = 'http://www.public.navy.mil';
const MAX_MESSAGE_TEXT_LENGTH = 5000;
const MESSAGE_TYPE_LOOKUP = {NAV: 'NAVADMIN', ALN: 'ALNAV'};
const YEAR_FORMAT_LENGTH = 2;
const createMessageId = ({type, year, num}) => `${type}${year}${num}`;
const createNpcPageUrl = ({type, year}) => {
    const format = year => (String(year).length === 'YYYY'.length) ? Number(year.substr(-2)) : year; // eslint-disable-line no-magic-numbers
    return `${NPC_DOMAIN}/bupers-npc/reference/messages/${type}S/Pages/${type}20${format(year)}.aspx`;
};
const createMessageUrl = ({num, type, year}) => {
    const code = invertObj(MESSAGE_TYPE_LOOKUP)[type];
    const fragment = 'bupers-npc/reference/messages/Documents';
    return `${NPC_DOMAIN}/${fragment}/${type}S/${code}20${year}/${code}${year}${num}.txt`;
};
const createYearsString = years => years
    .sort()
    .slice(0, -1)
    .map(year => `20${year}`)
    .join(', ')
    .concat(`${years.length > 2 ? ',' : ''}${years.length > 1 ? ' and ' : ''}20${years.slice(-1)}`);
const getCurrentYear = () => Number(String((new Date()).getFullYear()).substring(2));
const isNotNumber = value => isNaN(Number(value));
const isNumberLike = value => !isNaN(Number(value));
const parseMessageName = value => {
    const code = takeWhile(isNotNumber, [...value]).join('').toUpperCase();
    const type = MESSAGE_TYPE_LOOKUP[code];
    const year = value.substring(code.length, code.length + YEAR_FORMAT_LENGTH);
    const num = value.substring(code.length + YEAR_FORMAT_LENGTH);
    const url = createMessageUrl({num, type, year});
    const id = createMessageId({num, type, year});
    return {code, id, num, type, url, year};
};
const parseMessageId = value => {
    const type = takeWhile(isNotNumber, [...value]).join('').toUpperCase();
    const code = invertObj(MESSAGE_TYPE_LOOKUP)[type];
    const year = value.substring(type.length, type.length + YEAR_FORMAT_LENGTH);
    const num = value.substring(type.length + YEAR_FORMAT_LENGTH);
    const name = `${code}${year}${num}`;
    return parseMessageName(name);
};
const parseMessageUri = value => {
    const [filename] = value.split('/').reverse();
    const [messageId] = filename.split('.');
    const url = `${NPC_DOMAIN}${value}`;
    const ext = extname(value);
    return {...parseMessageName(messageId), ext};
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
    createMessageUrl,
    createNpcPageUrl,
    createYearsString,
    getCurrentYear,
    isNotNumber,
    isNumberLike,
    parseMessageId,
    parseMessageName,
    parseMessageUri,
    partitionByKeyLength
};