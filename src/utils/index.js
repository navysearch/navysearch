
const {extname} = require('path');
const {takeWhile} = require('lodash');

const NPC_DOMAIN = 'http://www.public.navy.mil';
const MSG_TYPE_LOOKUP = {NAV: 'NAVADMIN', ALN: 'ALNAV'};
const YEAR_FORMAT_LENGTH = 2;
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

module.exports = {
    NPC_DOMAIN,
    createMessageId,
    isNotNumber,
    isNumberLike,
    parseMessageUri
};