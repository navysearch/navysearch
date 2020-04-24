require('dotenv').config();
const meow = require('meow');
const getStdin = require('get-stdin');
const {cross} = require('figures');
const {bold, cyan} = require('chalk');
const {format} = require('tomo-cli');
const {dict, getCurrentYear} = require('./utils/common.js');
const {populate, update} = require('./utils/data.js');

const getAction = (command, flags, defaultAction) => {
    const {id, key, type, verbose, year} = flags;
    const years = [...new Set(year.split(','))].sort();
    const noCommand = stdin => {
        if (typeof command === 'string') {
            const message = `\n${bold.red(cross)} "${command}" is not a known command...Please read the help below.\n`;
            process.stderr.write(message);
            defaultAction();
        } else {
            process.stdout.write(`STDIN: ${stdin}`);
        }
    };
    const lookup = dict({
        populate: async () => {
            await populate(type, years, {id, key});
        },
        update: async () => {
            const results = await update(type, {id, key, verbose});
            results.objectIDs.length > 0 && process.stdout.write(format(results));
        },
        info: async () => {/* eslint-disable no-console */
            console.log(`\n  ${bold('ID')}  = `, id);
            console.log(`  ${bold('Key')} = `, key);
        }/* eslint-enable no-console */
    });
    return lookup.has(command) ? lookup.get(command) : noCommand;
};
const help = `
    ${bold.bgBlue.white(' Navy Search ')}
      
        ${cyan(`"Search for those that ${bold('serve')}"`)}

    ${bold.dim('Usage')}

        ./usn.exe [commands] [options]


    ${bold.dim('Commands')}

        populate, update, version

`;
const options = {
    help,
    flags: {
        help: {
            type: 'boolean',
            default: false,
            alias: 'h'
        },
        version: {
            type: 'boolean',
            default: false,
            alias: 'v'
        },
        verbose: {
            type: 'boolean',
            default: false,
            alias: 'V'
        },
        type: {
            type: 'string',
            default: 'NAVADMIN',
            alias: 't'
        },
        year: {
            type: 'string',
            default: String(getCurrentYear()),
            alias: 'y'
        },
        id: {
            type: 'string',
            default: process.env.ALGOLIA_APP_ID || bold.red('not set')
        },
        key: {
            type: 'string',
            default: process.env.ALGOLIA_ADMIN_API_KEY || bold.red('not set')
        }
    }
};

const {input, flags, showHelp} = meow(options);
(async () => {
    const stdin = await getStdin();
    const [command] = input;
    const action = getAction(command, flags, showHelp);
    await action(stdin);
})();