// please use promise approach to fight the naive one in parse-callback.js

'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');
const async = require('async');

function helloPromise() {
    fs.readFile(__dirname + '/sample.csv', (err, loadedCsv) => {

        parse(loadedCsv, (err, parsed) => {

            for (let index in parsed) {

                let line = parsed[index];

                // FIXME: Put your transformation here
                let fullName = line[0] + ' ' + line[1];

                if (index > 0) {
                    debug(`sending data index: ${index - 1}`);

                    let promise = new Promise((resolve, reject) => {
                        helper.sendSms(fullName, (err, sendingStatus) => {
                            let lineToLog;
                            if (err) {
                                debug(err.message);

                                lineToLog = {
                                    sendingStatus,
                                    fullName,
                                };

                                resolve(lineToLog);
                            } else {
                                reject();
                            }
                        });
                    });

                    promise.then((lineToLog) => {
                        helper.logToS3(lineToLog, (err, loggingStatus) => {
                            if (err) {
                                debug(err.message);
                            }
                        });
                    });
                }
            }
        });
    });
}

helloPromise();

