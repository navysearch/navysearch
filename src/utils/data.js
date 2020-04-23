const {promisify} = require('util');
const log = require('npmlog');
const chalk = require('chalk');
const ora = require('ora');
const Xray = require('x-ray');
const algoliasearch = require('algoliasearch');
const axios = require('axios').default;
const {
    MAX_MESSAGE_TEXT_LENGTH,
    createMessageId,
    createNpcPageUrl,
    createYearsString,
    parseMessageUri,
    partitionByKeyLength
} = require('./index.js');
const {bold, cyan, green} = chalk;

const scrapeItems = async (type, year) => {
    const url = createNpcPageUrl({type, year});
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
        .then(({data: text}) => ({...attributes, id, text, objectID: id}))
        .catch(() => ({...attributes, id, objectID: id}));
};
const getItems = async (type, years) => {
    const startMessage = items => {
        const [{type}] = items;
        const yearsString = createYearsString(years);
        const message = `Fetching ${bold(type)} data for ${bold(yearsString)} (${items.length} items)\n\n`;
        return cyan(message);
    };
    const doneMessage = items => {
        const completed = items.filter(({text}) => typeof text !== 'undefined');
        return `${green('COMPLETE')} ~ ${bold(completed.length)} of ${bold(items.length)} items processed\n\n`;
    };
    const get = data => Promise.all(data.map(getItem));
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
/**
 * Save items to Algolia search service
 * @param {object[]} items
 * @param {object} options Configuration options
 * @param {string} options.id Application ID
 * @param {string} options.key Application Admin API key
 * @param {string} [options.name='message'] Index name
 * @returns {object} Results of save operation
 */
const saveItems = async (items, {id, key, name = 'message'}) => {
    const SUFFIX_LENGTH = 5;
    const spinner = ora('Connecting to Algolia').start();
    const client = algoliasearch(id, key);
    const index = client.initIndex(name);
    try {
        spinner.text = `Saving ${items.length} items...`;
        const chunk = value => partitionByKeyLength('text', MAX_MESSAGE_TEXT_LENGTH, value);
        const itemsToUpload = items
            .flatMap(chunk)
            .map((item, index) => ({...item, objectID: `${item.objectID}_${String(index).padStart(SUFFIX_LENGTH, '0')}`}));
        const results = await index.saveObjects(itemsToUpload);
        spinner.succeed(`Successfully saved ${items.length} (${itemsToUpload.length} total) items!`);
        return results;
    } catch (error) {
        spinner.fail(`Failed to save ${items.length} items`);
        log.error(error);
    }
};
const getSavedItems = async ({id, key, name = 'message'}) => {
    const client = algoliasearch(id, key);
    const index = client.initIndex(name);
    await index.setSettings({paginationLimitedTo: 1e9});
    const {hits} = await index.search('', {hitsPerPage: 1e9});
    return hits;
};

module.exports = {
    getItem,
    getItems,
    getSavedItems,
    saveItems,
    scrapeItems
};