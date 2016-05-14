'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');

// 0. Naïve

/*Junhao's comments towards naive() function

The naive method is rather straight forward. My only qualms are:
    1) Unnecessary function names (E.g thenParse, afterSending, afterLogging)
    2) logToS3 can be shifted into the "if" block when there is an error
    3) In line 57, index does not need to be incremented
*/

function naive() {
    fs.readFile(__dirname + '/sample.csv', function thenParse(err, loadedCsv) {

        parse(loadedCsv, function transformEachLine(err, parsed) {

            for (let index in parsed) {
                let line = parsed[index];

                // FIXME: Put your transformation here
                let fullName = line[0] + ' ' + line[1];

                if (index > 0) {
                    debug(`sending data index: ${index - 1}`);
                    helper.sendSms(fullName, function afterSending(err, sendingStatus) {

                        let lineToLog;
                        if (err) {
                            debug(err.message);

                            lineToLog = {
                                sendingStatus,
                                fullName,
                            };
                        }

                        if (lineToLog) {
                            helper.logToS3(lineToLog, function afterLogging(err, loggingStatus) {
                                if (err) {
                                    debug(err.message);
                                }
                            });
                        }
                    });
                }

                index++;
            }
        });
    });
}

naive();

