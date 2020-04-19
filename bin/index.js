/* eslint-disable no-console */
const fs = require('fs');
const {join} = require('path');
const algoliasearch = require('algoliasearch');

const client = algoliasearch('LSEAHC8OFK', 'ce54bccc2dd27f6da47165ed0ffb9b18');
const index = client.initIndex('message');

const objects = [{
    objectID: 1,
    name: 'NAVADMIN10920',
    data: fs.readFileSync(join(__dirname, 'resources', 'nav_109_20'), 'utf8')
}];

index
    .saveObjects(objects)
    .then(({objectIDs}) => console.log(objectIDs))
    .catch(err => console.log(err));