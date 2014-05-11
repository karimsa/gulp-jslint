/**
 * gulp.jslint.js
 * Copyright (C) 2014 KarimSa Networks.
 **/
/*jslint node:true*/

"use strict";

// load up colorful strings
require('colors');

var util = require('util');

var fs = require('fs'),
    path = require('path'),
    evtStr = require('event-stream'),
    jslint = require('jslint');

function doLint(options) {
    return function (src, fn) {
        var retVal, js, error, i,
            lint = function (err) {
                var myRet;

                // prepare for linting exports
                src.jslint = {};

                if (err || !global.JSLINT) {
                    myRet = fn(err || 'gulp-jslint: failed to load JSLINT.');
                } else {
                    // convert to string
                    js = src.contents.toString('utf8');

                    // lint the file
                    src.jslint.edition = global.JSLINT.edition;
                    src.jslint.success = global.JSLINT(js, options);
                    src.jslint.errors = global.JSLINT.errors;

                    // reporter handling
                    if (!src.jslint.success) {
                        if (options.reporter === 'default') {
                            /*jslint nomen:true*/ // Node.JS's built-in __dirname
                            error = '[FAIL] ' + src.path.replace(path.resolve(__dirname) + '/', '');
                            /*jslint nomen:false*/

                            for (i = 0; i < global.JSLINT.errors.length; i += 1) {
                                if (global.JSLINT.errors[i]) {
                                    error += '\n       line ' + global.JSLINT.errors[i].line + ', col ' + global.JSLINT.errors[i].character + ': ' + global.JSLINT.errors[i].reason;
                                }
                            }

                            console.log('%s', error.red);
                        } else {
                            try {
                                // grab the reporter
                                options.reporter = require(options.reporter);

                                // do the piping
                                evtStr.pipe(options.reporter);
                            } catch (err_a) {
                                console.log(('error: unknown reporter: ' + options.reporter).red);
                            }
                        }

                        process.exit(-1);
                    } else {
                        if (options.reporter === 'default') {
                            if (!options.errorsOnly) {
                                /*jslint nomen:true*/ // Node.JS's built-in __dirname
                                console.log('[%s] %s', 'PASS'.green, src.path.replace(path.resolve(__dirname) + '/', '').cyan);
                                /*jslint nomen:false*/
                            }
                        } else {
                            try {
                                // grab the reporter
                                options.reporter = require(options.reporter);

                                // do the piping
                                evtStr.pipe(options.reporter);
                            } catch (err_b) {
                                console.log(('error: unknown reporter: ' + options.reporter).red);
                            }
                        }

                        myRet = fn(null, src);
                    }
                }

                return myRet;
            };

        if (src.isStream()) {
            retVal = fn(new Error('gulp-jslint: bad file input.'));
        } else {
            if (!src.isNull()) {
                if (!global.JSLINT) {
                    global.JSLINT = jslint.load('latest');
                }
                retVal = lint(null);
            }

            return retVal;
        }
    };
}

module.exports = function (options) {
    // fallback to object
    options = options || {};

    // set default reporter
    options.reporter = options.reporter || 'default';

    // begin linting
    return evtStr.map(doLint(options));
};
