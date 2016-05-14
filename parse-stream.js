// 0. Please use readline (https://nodejs.org/api/readline.html) to deal with per line file reading
// 1. Then use the parse API of csv-parse (http://csv.adaltas.com/parse/ find the Node.js Stream API section)

'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');
const readline = require('readline');

function helloStream() {

    const rl = readline.createInterface({
        input: fs.createReadStream(__dirname + '/sample.csv'),
    });

    rl.on('line', (line) => {

        // Parse each individual line
        parse(line, (err, parsed) => {

            // Parsed data is always in a list
            if (parsed.length === 1) {
                let lineList = parsed[0];

                // Retrieve full name
                let fullName = lineList[0] + ' ' + lineList[1];

                // The usuals
                helper.sendSms(fullName, (err, sendingStatus) => {
                    if (err) {
                        debug(err.message);

                        let lineToLog = {
                            sendingStatus,
                            fullName,
                        };

                        helper.logToS3(lineToLog, (err, loggingStatus) => {
                            if (err) {
                                debug(err.message);
                            }
                        });

                    }
                });
            }
        });
    });
}

helloStream();
