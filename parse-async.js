// Please use async lib https://github.com/caolan/async
'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');
const async = require('async');

function helloAsync() {
    fs.readFile(__dirname + '/sample.csv', (err, loadedCsv) => {

        parse(loadedCsv, (err, parsed) => {

            for (let index in parsed) {

                let line = parsed[index];

                // FIXME: Put your transformation here
                let fullName = line[0] + ' ' + line[1];

                if (index > 0) {
                    debug(`sending data index: ${index - 1}`);

                    async.waterfall([
                        (callback) => {
                            helper.sendSms(fullName, (err, sendingStatus) => {
                                let lineToLog;
                                if (err) {
                                    debug(err.message);

                                    lineToLog = {
                                        sendingStatus,
                                        fullName,
                                    };
                                    callback(null, lineToLog);
                                }
                            });
                        },

                        (lineToLog, callback) => {
                            helper.logToS3(lineToLog, (err, loggingStatus) => {
                                if (err) {
                                    debug(err.message);
                                } else {
                                    callback(null);
                                }
                            });
                        },
                    ]);
                }
            }
        });
    });
}

helloAsync();

