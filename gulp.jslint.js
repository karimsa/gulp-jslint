/**
 * gulp.jslint.js
 * Copyright (C) 2014 KarimSa Networks.
 **/

(function () {
    "use strict";

    // load up colorful strings
    require('colors');

    var path = require('path'),
        evtStr = require('event-stream'),
        jslint = require('jslint'),
        JSLINT = null,
        doLint = function (options) {
            return function (src, fn) {
                var retVal, js, error, i,
                    lint = function (err) {
                        var myRet;

                        // prepare for linting exports
                        src.jslint = {};

                        if (err || !JSLINT) {
                            myRet = fn(err || new Error('gulp-jslint: failed to load JSLINT.'));
                        } else {
                            // convert to string
                            js = src.contents.toString('utf8');

                            // lint the file
                            src.jslint.edition = JSLINT.edition;
                            src.jslint.success = JSLINT(js, options);
                            src.jslint.errors = JSLINT.errors;

                            // only support paths to reporter, or
                            // pre-loaded reporters
                            try {
                                if (typeof options.reporter === 'string') {
                                    options.reporter = require(options.reporter);
                                } else if (typeof options.reporter !== 'function') {
                                    options.reporter = 'default';
                                }
                            } catch (err_a) {
                                fn(err_a);
                            }

                            // error handling
                            if (options.reporter === 'default') {
                                if (!src.jslint.success) {
                                    error = '[FAIL] ' + src.path.replace(path.resolve('./') + '/', '');

                                    for (i = 0; i < JSLINT.errors.length; i += 1) {
                                        if (JSLINT.errors[i]) {
                                            error += '\n       line ' + JSLINT.errors[i].line +
                                                ', col ' + JSLINT.errors[i].character +
                                                ': ' + JSLINT.errors[i].reason;
                                        }
                                    }

                                    console.log('%s', error.red);

                                    fn(new Error('gulp-jslint: failed to lint file.'));
                                } else {

                                    if (options.errorsOnly !== true) {
                                        console.log('[%s] %s', 'PASS'.green, src.path.replace(path.resolve('./') + '/', '').cyan);
                                    }

                                    myRet = fn(null, src);
                                }
                            } else {
                                options.reporter({ pass: src.jslint.success, file: src.path });
                            }
                        }

                        return myRet;
                    };

                if (src.isStream()) {
                    retVal = fn(new Error('gulp-jslint: bad file input.'));
                } else {
                    if (!src.isNull()) {
                        if (JSLINT === null) {
                            JSLINT = jslint.load('latest');
                        }

                        retVal = lint(null);
                    }

                    return retVal;
                }
            };
        };



    module.exports = function (options) {
        // fallback to object
        options = options || {};

        // set default reporter
        options.reporter = options.reporter || 'default';

        // force boolean
        options.errorsOnly = options.hasOwnProperty('errorsOnly') && options.errorsOnly === true;

        // begin linting
        return evtStr.map(doLint(options));
    };
}());