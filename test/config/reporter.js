const tsNode = require('ts-node');

tsNode.register({
    transpileOnly: true,
    compilerOptions: require('../../tsconfig').compilerOptions,
});

const Reporter = require('./reporter.ts');

module.exports = Reporter;