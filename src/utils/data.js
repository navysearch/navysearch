const {promisify} = require('util');
const log = require('npmlog');
const chalk = require('chalk');
const ora = require('ora');
const Xray = require('x-ray');
const algoliasearch = require('algoliasearch');
const axios = require('axios').default;
const {difference} = require('ramda');
const {
    MAX_MESSAGE_TEXT_LENGTH,
    createMessageId,
    createNpcPageUrl,
    createYearsString,
    getCurrentYear,
    parseMessageId,
    parseMessageUri,
    partitionByKeyLength
} = require('./common.js');
const {bold, cyan, green} = chalk;

/**
 * Scrape message data from  NPC
 * @param {string} type NAVADMIN | ALNAV
 * @param {(string|number)} year Last two digits of year of page to scrape from
 * @returns {object[]}
 */
const scrapeMessageItems = async (type, year) => {
    const x = new Xray();
    const url = createNpcPageUrl({type, year});
    const {data} = await axios.get(url);
    const parsedHtml = await promisify(x(data, 'a', [{href: '@href'}]));
    return parsedHtml
        .map(({href}) => href)
        .filter(str => /[.]txt$/.test(str))
        .map(parseMessageUri)
        .filter(({code, num}) => [code, num].every(({length}) => length > 0));
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
        return `${green('COMPLETE')} ~ ${bold(completed.length)} of ${bold(items.length)} items processed\n`;
    };
    const get = data => Promise.all(data.map(getItem));
    const items = (await Promise.all(years.map(year => scrapeMessageItems(type, year)))).flat(Infinity);
    const continueOperation = async () => {
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
    return items.length > 0 ? continueOperation() : [];
};
const getSavedItems = async ({id, key, name = 'message'}) => {
    const client = algoliasearch(id, key);
    const index = client.initIndex(name);
    await index.setSettings({paginationLimitedTo: 1e9});
    const {hits} = await index.search('', {hitsPerPage: 1e9});
    return hits;
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
        spinner.succeed(`Successfully saved ${items.length} (${itemsToUpload.length} total) items!\n`);
        return results;
    } catch (error) {
        spinner.fail(`Failed to save ${items.length} items`);
        log.error(error);
    }
};
const populate = async (type, years, {id, key, name}) => {
    const items = await getItems(type, years);
    const results = await saveItems(items, {id, key, name});
    return results;
};
const update = async (type, {id, key, name, verbose = true}) => {
    const [scraped, saved] = await Promise.all([
        getItems(type, [getCurrentYear()], {verbose}),
        getSavedItems({id, key, name})
    ]);
    const left = scraped.map(({id}) => id);
    const right = ([...(new Set(saved.map(({id}) => id)))]);
    const updated = difference(left, right).sort().map(parseMessageId);
    const items = await Promise.all(updated.map(getItem));
    const noItems = items.length === 0;
    if (noItems) {
        process.stdout.write(`${bold('No records to update')}\n\n`);
    }
    return noItems ? {objectIDs: []} : await saveItems(items, {id, key, name});
};

module.exports = {
    getItem,
    getItems,
    getSavedItems,
    populate,
    saveItems,
    scrapeMessageItems,
    update
};