const loader = require('speccy/lib/loader');
const isObject = require('./is-object');
const yaml = require('yaml');

function checkDocument(doc) {
    if (!isObject(doc)) {
        throw Error('Invalid YAML syntax!');
    }
}

async function loadFromFile(file) {
    const options = {
        resolve: true,   // Resolve external references
        jsonSchema: true // Treat $ref like JSON Schema and convert to OpenAPI Schema Objects
    };

    const doc = await loader.loadSpec(file, options);

    checkDocument(doc);

    return doc;
}

function loadFromString(string) {
    const doc = yaml.parse(string, {prettyErrors: true});

    checkDocument(doc);

    return doc;
}

module.exports = {
    fromFile: loadFromFile,
    fromString: loadFromString
};
