const { readFileSync, writeFileSync } = require('fs');

// This is the script that runs after building

const version = require('../package.json').version;
let data = readFileSync('./data/tidy.user.js', 'utf-8');
const rules = require('../data/rules.js');

/**
 * Update userscript version (to make it fetch the new rules)
 */
const bumpUserscript = () => {
    data = data.replace(/\/\/ @version      (.*)/gi, '// @version      ' + version);
    console.log('Bumped userscript version');
    writeFileSync('./data/tidy.user.js', data);
};

/**
 * Generate supported-sites.txt
 * It's messy, but that's fine. It's not important.
 */
const generateSupported = () => {
    try {
        let p = 0;
        let count = 0;
        let body = 'Total unique rules: %RULE_COUNT%\n\n';

        // Sort rules and set padding width
        let lines = rules
            .filter((rule) => rule.name !== 'Global')
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((rule) => {
                if (rule.name.length > p) p = rule.name.length;
                return rule;
            });

        // Create table header
        body += ['| Match'.padEnd(p + 2, ' ') + ' | Rules |', '| :'.padEnd(p + 2, '-') + ' | :---- |'].join('\n') + '\n';

        // Append rules to table
        body += lines
            .map((rule) => {
                const n = rule.rules ? rule.rules.length : 1;
                count += n;
                return `| ${rule.name.padEnd(p, ' ')} | ${`${n}`.padEnd(5, ' ')} |`;
            })
            .join('\n');

        // Update the rule count
        body = body.replace('%RULE_COUNT%', count);

        // Write
        writeFileSync('./data/supported-sites.txt', body);
        console.log('Updated supported-sites.txt');
    } catch (e) {
        console.log(e);
    }
};

bumpUserscript();
generateSupported();
