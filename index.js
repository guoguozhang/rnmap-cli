#!/usr/bin/env node

const child_process = require('child_process');
const source_map = require('source-map');
const fs = require('fs');
const spin = require('io-spin');
const program = require('commander');

const map_name = './tmp/bundle.map';

program
    .option('-c, --cache', 'cache map file')
    .option('-a, --android', 'android platform')
    .parse(process.argv);

const platform = program.android ? 'android' : 'ios';
const spinner = spin('mapping ' + platform + ' source file...');

showCrashInfo();

function showCrashInfo() {
    spinner.start();
    if (fs.existsSync(map_name)) {
        mapSourceFile();
    } else {
        const bundle_command = 'react-native bundle --entry-file index.js  --platform ' + platform + ' --dev false --bundle-output ./tmp/main.jsbundle --assets-dest ./tmp/bundle --sourcemap-output ' + map_name;
        const bundle_process = child_process.exec('mkdir tmp;' + bundle_command, function (err, stdout) {
            if (err) console.log(err);
            bundle_process.kill();
            spinner.update('mapping completed...');
            mapSourceFile();
        });
    }
}

function mapSourceFile() {
    fs.readFile(map_name, 'utf8', function (err, data) {
        const smc = new source_map.SourceMapConsumer(data);
        const mapResult = smc.originalPositionFor({
            line: parseInt(process.argv[2]),
            column: parseInt(process.argv[3]),
        });
        fs.readFile(mapResult.source, 'utf8', function (err, fileData) {
            spinner.stop();
            let info = mapResult.source;
            info += ' at line ' + mapResult.line + ':' + mapResult.column;
            let lines = fileData.toString().split(/[\n\r]/);
            lines = lines.map((item, index) => ({ marked: index + 1 === mapResult.line, text: ((index + 1) + '. ' + item).replace(/ /g, "\u00a0") }));
            lines = lines.slice(mapResult.line - 5, mapResult.line + 5);
            console.log('\x1B[32m%s\x1B[39m ', info);
            console.log('--------------------------------');
            lines.forEach(item => {
                if (item.marked) {
                    console.log('\x1B[45m\x1B[33m%s\x1b[0m\x1B[49m', item.text);
                } else {
                    console.log(item.text);
                }
            });
            console.log('--------------------------------');
        });
    });
    if (!program.cache) {
        const remove_process = child_process.exec('rm -rf ./tmp', function (err, stdout) {
            if (err) console.log(err);
            console.log(stdout);
            remove_process.kill();
        });
    }
}
