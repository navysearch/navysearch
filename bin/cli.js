require('dotenv').config();
const meow = require('meow');
const getStdin = require('get-stdin');
const {getAction, options} = require('../src/utils/cli.js');

const {input, flags, showHelp} = meow(options);
(async () => {
    const stdin = await getStdin();
    const [command] = input;
    const action = getAction(command, flags, showHelp);
    await action(stdin);
})();
